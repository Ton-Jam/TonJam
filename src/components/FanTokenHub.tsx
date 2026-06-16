import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, Zap, Lock, Unlock, Play, Volume2, 
  Tv, Tag, Check, HelpCircle, Loader2, Plus, AlertCircle, Copy, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useAudio } from '@/context/AudioContext';
import { Artist, Track, FanTokenBalance, ArtistPoll, ArtistPollVote } from '@/types';
import { 
  getFanTokenBalance, 
  purchaseFanTokens, 
  earnFanTokens, 
  getUnlockedContentIds, 
  unlockExclusiveContent,
  createArtistPoll,
  getArtistPolls,
  getPollVotes,
  castVoteOnArtistPoll
} from '@/services/fanTokenService';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { toast } from 'sonner';

interface FanTokenHubProps {
  artist: Artist;
}

const TRIVIA_QUESTIONS = [
  {
    id: 'q1',
    question: "Which milestone did this creator reach with their electronic single last month?",
    options: [
      "Over 1M streams globally",
      "Featured on Ne-Tokyo's official blog",
      "Decentralized Chart No. 1 ranking",
      "All of the above"
    ],
    correctIdx: 3,
    reward: 20
  },
  {
    id: 'q2',
    question: "What synthesizers are known to be the signature backdrop of this artist's live setups?",
    options: [
      "Roland Juno-106 & Eurorack Modular",
      "Digital Software Samplers only",
      "Acoustic Grand Piano presets",
      "Chiptune Gameboy channels"
    ],
    correctIdx: 0,
    reward: 20
  },
  {
    id: 'q3',
    question: "Where is this artist's upcoming visual listening concert taking place?",
    options: [
      "Metropol Cyber Dome",
      "The Echo Chamber at Neo-Tokyo",
      "Virtual Sandbox Lounge",
      "London Underground Tube"
    ],
    correctIdx: 1,
    reward: 20
  }
];

export const FanTokenHub: React.FC<FanTokenHubProps> = ({ artist }) => {
  const { userProfile, refreshProfile } = useAuth();
  const { playTrack, addNotification } = useAudio();
  
  // Wallet States
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [unlockedContentIds, setUnlockedContentIds] = useState<string[]>([]);
  const [purchaseAmount, setPurchaseAmount] = useState<number>(100);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  // Polls/Governance States
  const [polls, setPolls] = useState<ArtistPoll[]>([]);
  const [pollVotesMap, setPollVotesMap] = useState<Record<string, ArtistPollVote[]>>({});
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [isPublishingPoll, setIsPublishingPoll] = useState(false);
  const [votedPollIds, setVotedPollIds] = useState<string[]>([]);
  
  // Trivia Game States
  const [hasCompletedTrivia, setHasCompletedTrivia] = useState(false);
  const [selectedTriviaOption, setSelectedTriviaOption] = useState<number | null>(null);
  const [triviaSubmitted, setTriviaSubmitted] = useState(false);
  const [currentTriviaIdx, setCurrentTriviaIdx] = useState(0);

  const selectedTrivia = useMemo(() => {
    // Deterministic trivia selection per artist, or standard rotation
    const charCodeSum = artist.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = charCodeSum % TRIVIA_QUESTIONS.length;
    return TRIVIA_QUESTIONS[index];
  }, [artist]);

  const tokenTicker = useMemo(() => {
    const cleanName = artist.name.replace(/[^a-zA-Z]/g, '').toUpperCase();
    return cleanName.substring(0, 4) + 'T';
  }, [artist]);

  const isOwnProfile = userProfile?.uid === artist.uid;

  // Real-time tracking of token updates and unlocked content
  useEffect(() => {
    if (!userProfile?.uid) {
      setIsLoadingBalance(false);
      return;
    }

    setIsLoadingBalance(true);
    // Real-time listener for fan token balance
    const balanceDocId = `${userProfile.uid}_${artist.uid}`;
    const tokenRef = doc(db, 'fanTokens', balanceDocId);
    
    const unsubBalance = onSnapshot(tokenRef, (docSnap) => {
      if (docSnap.exists()) {
        setTokenBalance((docSnap.data() as FanTokenBalance).balance || 0);
      } else {
        setTokenBalance(0);
      }
      setIsLoadingBalance(false);
    }, (error) => {
      console.warn("Error hearing balance update:", error);
      setIsLoadingBalance(false);
    });

    // Fetch unlocked content items
    const fetchUnlocked = async () => {
      const ids = await getUnlockedContentIds(userProfile.uid, artist.uid);
      setUnlockedContentIds(ids);
    };
    fetchUnlocked();

    return () => {
      unsubBalance();
    };
  }, [userProfile?.uid, artist.uid]);

  // Real-time listener for artist decision polls
  useEffect(() => {
    const pollsQuery = query(
      collection(db, 'artistPolls'),
      where('artistId', '==', artist.uid)
    );

    const unsubPolls = onSnapshot(pollsQuery, async (snapshot) => {
      const pollsList = snapshot.docs.map(docSnap => docSnap.data() as ArtistPoll);
      // Sort polls by createdAt desc
      pollsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPolls(pollsList);

      // Fetch votes for each active poll
      pollsList.forEach((poll) => {
        const votesRef = collection(db, 'artistPolls', poll.id, 'votes');
        onSnapshot(votesRef, (voteSnapshot) => {
          const votesList = voteSnapshot.docs.map(vDoc => vDoc.data() as ArtistPollVote);
          setPollVotesMap(prev => ({
            ...prev,
            [poll.id]: votesList
          }));

          // Track if user has voted on this poll
          if (userProfile?.uid) {
            const hasVoted = votesList.some(v => v.userId === userProfile.uid);
            if (hasVoted) {
              setVotedPollIds(prev => prev.includes(poll.id) ? prev : [...prev, poll.id]);
            }
          }
        });
      });
    }, (error) => {
      console.error('Error fetching polls in listener:', error);
    });

    return () => {
      unsubPolls();
    };
  }, [artist.uid, userProfile?.uid]);

  // Handle Token Purchase Swap
  const handlePurchase = async () => {
    if (!userProfile?.uid) {
      toast.error('Please sign in to buy fan tokens');
      return;
    }

    const costInJam = purchaseAmount / 10;
    if ((userProfile.jamBalance || 0) < costInJam) {
      toast.error(`You need ${costInJam} JAM to buy ${purchaseAmount} tokens, but you only have ${(userProfile.jamBalance || 0).toFixed(2)} JAM.`);
      return;
    }

    try {
      setIsSwapping(true);
      await purchaseFanTokens(
        userProfile.uid,
        artist.uid,
        artist.name,
        purchaseAmount,
        costInJam
      );
      toast.success(`Successfully obtained ${purchaseAmount} ${tokenTicker}!`);
      if (refreshProfile) await refreshProfile();
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete swap');
    } finally {
      setIsSwapping(false);
    }
  };

  // Handle Trivia Submission
  const handleTriviaSubmit = async () => {
    if (!userProfile?.uid) {
      toast.error('Please sign in to complete daily challenges');
      return;
    }
    if (selectedTriviaOption === null) return;

    setTriviaSubmitted(true);
    if (selectedTriviaOption === selectedTrivia.correctIdx) {
      try {
        await earnFanTokens(userProfile.uid, artist.uid, selectedTrivia.reward, 'completing daily trivia');
        setHasCompletedTrivia(true);
      } catch (err) {
        console.error('Failed to reward tokens:', err);
      }
    } else {
      toast.error('Incorrect! Try reviewing the bio and try again tomorrow.');
    }
  };

  // Reset Trivia Game for demo purposes
  const resetTrivia = () => {
    setSelectedTriviaOption(null);
    setTriviaSubmitted(false);
    setHasCompletedTrivia(false);
  };

  // Unlock exclusive premium artifacts
  const handleUnlockContent = async (contentId: string, tokenCost: number) => {
    if (!userProfile?.uid) {
      toast.error('Please sign in to unlock exclusive content');
      return;
    }

    if (tokenBalance < tokenCost) {
      toast.error(`Insufficient ${tokenTicker} tokens! You need ${tokenCost} but only have ${tokenBalance}.`);
      return;
    }

    try {
      toast.loading(`Unlocking content...`);
      await unlockExclusiveContent(userProfile.uid, artist.uid, contentId, tokenCost);
      setUnlockedContentIds(prev => [...prev, contentId]);
      toast.dismiss();
      toast.success('Decentralized content vault unlocked successfully!');
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Error unlocking content');
    }
  };

  // Create standard DAO Poll for artist profile owner
  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnProfile || !artist.uid) return;

    const filteredOptions = pollOptions.filter(opt => opt.trim() !== '');
    if (!pollQuestion.trim() || filteredOptions.length < 2) {
      toast.error('Please specify a question and at least 2 voting choices.');
      return;
    }

    try {
      setIsPublishingPoll(true);
      await createArtistPoll(
        artist.uid,
        artist.name,
        pollQuestion,
        filteredOptions,
        7 // 7 days duration
      );
      toast.success('Proposal posted securely to the Artist DAO Board!');
      setPollQuestion('');
      setPollOptions(['', '']);
      setIsCreatingPoll(false);
    } catch (err) {
      toast.error('Failed to draft decision poll');
    } finally {
      setIsPublishingPoll(false);
    }
  };

  // Vote on active Artist decision
  const handleVote = async (pollId: string, choiceIdx: number) => {
    if (!userProfile?.uid) {
      toast.error('Please sign in to interact with governance');
      return;
    }

    if (tokenBalance <= 0) {
      toast.error(`You need at least 1 ${tokenTicker} token to participate in artist governance decision!`);
      return;
    }

    try {
      // Cast the vote with current user tokenBalance as power weight
      await castVoteOnArtistPoll(pollId, userProfile.uid, choiceIdx, tokenBalance);
      setVotedPollIds(prev => [...prev, pollId]);
      
      await earnFanTokens(userProfile.uid, artist.uid, 10, 'voting on artist decision');
      toast.success(`Vote cast securely! Your ${tokenBalance} ${tokenTicker} voting power applied, and earned +10 tokens!`);
    } catch (err: any) {
      toast.error('Friction on decentralized ledger. Try voting again.');
    }
  };

  // Static exclusive content specifications
  const EXCLUSIVE_ITEMS = [
    {
      id: `exclusive_bts_${artist.uid}`,
      title: "Behind-the-Scenes: Live Rehearsal VLOG",
      type: "video" as const,
      cost: 50,
      description: "Direct rehearsal studio walkthrough. Hear vocal warm-ups and instrument soundchecks before the final tour.",
      snippet: "https://www.w3schools.com/html/mov_bbb.mp4"
    },
    {
      id: `exclusive_track_${artist.uid}`,
      title: "Unreleased Master: Synth Retrospective (Demo)",
      type: "audio" as const,
      cost: 100,
      description: "Exclusive pre-release demo recording of our pending single, available exclusively to top tier token supporters.",
      trackObj: {
        id: `unreleased_demo_${artist.uid}`,
        title: "Synth Retrospective (Exclusive Demo)",
        artist: artist.name,
        artistId: artist.uid,
        coverUrl: artist.avatarUrl,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        duration: 215,
        isNFT: false,
        genre: artist.genre || "Electronic",
        isExclusive: true
      } as Track
    },
    {
      id: `exclusive_discount_${artist.uid}`,
      title: "Exclusive Merch Voucher: 20% Vinyl Cut",
      type: "code" as const,
      cost: 150,
      description: "A secure redeemable voucher to claim 20% off physical album pressings, shirts, and custom stickers.",
      codeValue: `TONJAM_VINYL_20_${tokenTicker}_${artist.uid.substring(0, 4).toUpperCase()}`
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in pb-16">
      
      {/* SECTION 1: Token Engine Wallet & Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Token Balance and Convert module */}
        <div className="lg:col-span-7 bg-[#1c1c1e]/30 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1.5Packed">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-500">Artist Fan Token Wallet</span>
              </div>
              <h3 className="text-3xl font-black text-white flex items-baseline gap-2">
                {isLoadingBalance ? (
                  <span className="text-muted-foreground text-xl animate-pulse">Checking Ledger...</span>
                ) : (
                  <>
                    <span>{tokenBalance.toLocaleString()}</span>
                    <span className="text-sm font-semibold text-muted-foreground uppercase">{tokenTicker}</span>
                  </>
                )}
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Unlock early releases, merchandise gifts, and cast voting power on {artist.name}'s key choices.
              </p>
            </div>
            
            <div className="bg-black/30 p-4 rounded-xl flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Your JAM Balance</span>
              <span className="text-sm font-mono text-emerald-400 font-extrabold flex items-center gap-1.5 mt-1">
                <Zap className="w-4 h-4 fill-current text-emerald-400" />
                {(userProfile?.jamBalance || 0).toFixed(2)} JAM
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Acquire {tokenTicker} Tokens</h4>
            <div className="grid grid-cols-3 gap-3">
              {[100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setPurchaseAmount(amt)}
                  className={`py-2 px-3 rounded-xl font-mono text-center text-xs transition-all relative cursor-pointer font-bold ${
                    purchaseAmount === amt 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white'
                  }`}
                >
                  {amt} <span className="text-[9px] block text-white/50">{amt / 10} JAM</span>
                </button>
              ))}
            </div>

            <button
              onClick={handlePurchase}
              disabled={isSwapping || isLoadingBalance}
              className="w-full py-3 bg-gradient-to-r from-blue-700 to-blue-500 hover:opacity-95 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSwapping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Swap in progress...
                </>
              ) : (
                <>
                  Swap {purchaseAmount / 10} JAM for {purchaseAmount} {tokenTicker}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Gamified Earn Section (Trivia Quest & Action rewards) */}
        <div className="lg:col-span-5 bg-[#1c1c1e]/30 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-orange-400 animate-pulse" /> Earn Tokens
            </h4>
            <div className="text-xs text-muted-foreground">
              Complete simple community missions or dynamic trivia to earn {tokenTicker} tokens without spending asset balances.
            </div>
          </div>

          {/* Dynamic 1-Question Quiz Frame */}
          <div className="bg-black/25 p-4 rounded-xl space-y-4">
            <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest">
              <span className="font-bold flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5 text-blue-400" /> Daily Artist Quiz</span>
              <span className="font-semibold text-emerald-400">+{selectedTrivia.reward} {tokenTicker}</span>
            </div>

            {!triviaSubmitted ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-white/90 leading-normal">
                  {selectedTrivia.question}
                </p>
                <div className="space-y-2">
                  {selectedTrivia.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => setSelectedTriviaOption(oIdx)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-all cursor-pointer relative ${
                        selectedTriviaOption === oIdx 
                          ? 'bg-blue-500/15 text-blue-400 font-semibold' 
                          : 'bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleTriviaSubmit}
                  disabled={selectedTriviaOption === null}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg cursor-pointer transition-all disabled:opacity-50"
                >
                  Verify Answer
                </button>
              </div>
            ) : (
              <div className="py-4 text-center space-y-4">
                {hasCompletedTrivia ? (
                  <>
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-white">Daily artist quest successfully solved!</p>
                    <p className="text-[10px] text-muted-foreground">+{selectedTrivia.reward} {tokenTicker} tokens issued directly to your ledger.</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold text-red-400">That was incorrect.</p>
                    <p className="text-[10px] text-muted-foreground">Study the artist's bio carefully and try again to crack the puzzle.</p>
                    <button
                      onClick={resetTrivia}
                      className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold uppercase"
                    >
                      Try Again
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* SECTION 2: Exclusive vaults (Lockable/Unlockable Media Showcase) */}
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <Unlock className="w-5 h-5 text-blue-400" /> Exclusive Media Vault
          </h3>
          <p className="text-muted-foreground text-xs leading-relaxed max-w-xl">
            Redeem artist-specific tokens below to break cryptography blocks on early tracks, merch drops, or virtual soundchecks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EXCLUSIVE_ITEMS.map((item, idx) => {
            const isUnlocked = unlockedContentIds.includes(item.id);
            const [localCodeCopied, setLocalCodeCopied] = useState(false);

            const handleCopyToClipboard = (code: string) => {
              navigator.clipboard.writeText(code);
              setLocalCodeCopied(true);
              toast.success('Discout voucher copied successfully!');
              setTimeout(() => setLocalCodeCopied(false), 2000);
            };

            return (
              <div 
                key={item.id}
                className="bg-[#1c1c1e]/20 rounded-2xl p-5 flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Header detail */}
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-black/45 rounded-xl text-blue-400">
                    {item.type === 'video' ? <Tv className="w-5 h-5" /> : item.type === 'audio' ? <Volume2 className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                  </div>
                  {!isUnlocked ? (
                    <span className="flex items-center gap-1.5 py-1 px-2.5 bg-yellow-500/10 text-yellow-500 text-[9px] font-black uppercase tracking-widest rounded-full">
                      <Lock className="w-3 h-3" /> {item.cost} {tokenTicker}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 py-1 px-2.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-full">
                      <Unlock className="w-3 h-3" /> Unlocked
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-normal line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Unlock / Play button logic */}
                <div className="pt-2">
                  {!isUnlocked ? (
                    <button
                      onClick={() => handleUnlockContent(item.id, item.cost)}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg cursor-pointer transition-all"
                    >
                      Unlock for {item.cost} {tokenTicker}
                    </button>
                  ) : (
                    <div className="bg-black/35 rounded-xl p-3">
                      {item.type === 'video' && item.snippet && (
                        <div className="space-y-2">
                          <video src={item.snippet} className="w-full rounded-lg aspect-video object-cover" controls playsInline />
                          <span className="text-[9px] font-mono font-medium text-muted-foreground uppercase text-center block">Playing Live Vault Video</span>
                        </div>
                      )}
                      
                      {item.type === 'audio' && item.trackObj && (
                        <button
                          onClick={() => playTrack(item.trackObj as Track)}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Stream Pre-Release Track
                        </button>
                      )}

                      {item.type === 'code' && item.codeValue && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-400 select-all truncate">
                            {item.codeValue}
                          </span>
                          <button
                            onClick={() => handleCopyToClipboard(item.codeValue as string)}
                            className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg cursor-pointer transition-all"
                            title="Copy discount code"
                          >
                            {localCodeCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Decentralized Governance & Decision voting */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Voting Board (Active Polls) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-1.5">
            <h3 className="text-2xl font-black text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-purple-400" /> Decentralized Governance
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-prose">
              Cast your vote on artist-related choices using your {tokenTicker} token quantity as a direct cryptographic voting weight proxy.
            </p>
          </div>

          <div className="space-y-6">
            {polls.length > 0 ? (
              polls.map((poll) => {
                const votes = pollVotesMap[poll.id] || [];
                const totalPower = votes.reduce((sum, v) => sum + v.weight, 0);
                const hasVoted = votedPollIds.includes(poll.id);

                // Compute tallies per option index
                const optionVotes = poll.options.map((_, oIdx) => {
                  const matchingVotes = votes.filter(v => v.choiceIndex === oIdx);
                  const powerTally = matchingVotes.reduce((sum, v) => sum + v.weight, 0);
                  const percentage = totalPower > 0 ? (powerTally / totalPower) * 100 : 0;
                  return {
                    powerTally,
                    percentage
                  };
                });

                const isClosed = new Date() > new Date(poll.endTime);

                return (
                  <div key={poll.id} className="bg-[#1c1c1e]/15 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                      <span className="text-blue-400">Proposal Reference #{poll.id.substring(0, 5).toUpperCase()}</span>
                      {isClosed ? (
                        <span className="py-1 px-2.5 bg-red-500/10 text-red-400 rounded-full">Rejected / Closed</span>
                      ) : (
                        <span className="py-1 px-2.5 bg-emerald-500/10 text-emerald-400 rounded-full">Active Voting...</span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-base font-bold text-white line-clamp-2 leading-relaxed">{poll.question}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        {isClosed ? 'Ended' : 'Ends'} on {new Date(poll.endTime).toLocaleDateString()} &middot; {votes.length} votes total &middot; {totalPower.toLocaleString()} {tokenTicker} casted
                      </p>
                    </div>

                    <div className="space-y-3">
                      {poll.options.map((opt, oIdx) => {
                        const tally = optionVotes[oIdx];
                        
                        return (
                          <div key={oIdx} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-white/90 font-medium">{opt}</span>
                              <span className="text-muted-foreground font-mono">
                                {tally.percentage.toFixed(0)}% <span className="text-[10px]">({tally.powerTally.toLocaleString()} {tokenTicker})</span>
                              </span>
                            </div>
                            
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${tally.percentage}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>

                            {/* Show Voting action if active, not voted, has balance */}
                            {!isClosed && !hasVoted && tokenBalance > 0 && !isOwnProfile && (
                              <button
                                onClick={() => handleVote(poll.id, oIdx)}
                                className="text-[9px] font-bold text-blue-400 hover:text-white uppercase tracking-widest flex items-center gap-1.5 mt-1 cursor-pointer transition-all hover:translate-x-1"
                              >
                                <Plus className="w-3 h-3" /> Apply {tokenBalance} {tokenTicker} Power
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!isClosed && !hasVoted && tokenBalance <= 0 && !isOwnProfile && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-500/5 text-yellow-500 rounded-xl text-[10px]">
                        <AlertCircle className="w-4 h-4" />
                        <span>Swap or earn {tokenTicker} Fan Tokens to unlock voting power on active DAO decisions list.</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-white/[0.01] rounded-2xl">
                <p className="text-muted-foreground text-sm">No active voting proposals or community choices listed yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Poll form (Visible only to the artist profile owner) */}
        <div className="lg:col-span-4">
          {isOwnProfile ? (
            <div className="bg-[#1c1c1e]/30 rounded-2xl p-6 space-y-6">
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">DAO Creator Studio</h4>
                <p className="text-[10px] text-muted-foreground">Draft and broadcast real decision proposals to your ledger supporters list.</p>
              </div>

              {!isCreatingPoll ? (
                <button
                  onClick={() => setIsCreatingPoll(true)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer transition-all"
                >
                  Create New Proposal
                </button>
              ) : (
                <form onSubmit={handleCreatePoll} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Decision Question</label>
                    <input
                      type="text"
                      required
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      placeholder="e.g. Which city should I add to Virtual Tour?"
                      className="w-full p-2.5 bg-black/45 border-none select-none rounded-xl text-xs text-white focus:ring-1 focus:ring-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Options (Min 2)</label>
                    {pollOptions.map((opt, oIdx) => (
                      <input
                        key={oIdx}
                        type="text"
                        required={oIdx < 2}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...pollOptions];
                          updated[oIdx] = e.target.value;
                          setPollOptions(updated);
                        }}
                        placeholder={`Option ${oIdx + 1}`}
                        className="w-full p-2.5 bg-black/45 border-none select-none rounded-xl text-xs text-white focus:ring-1 focus:ring-blue-600 outline-none"
                      />
                    ))}

                    {pollOptions.length < 4 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions([...pollOptions, ''])}
                        className="text-[10px] font-bold text-blue-400 hover:text-white uppercase flex items-center gap-1.5 cursor-pointer mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add optional choice
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingPoll(false);
                        setPollQuestion('');
                        setPollOptions(['', '']);
                      }}
                      className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPublishingPoll}
                      className="flex-1 py-2 bg-gradient-to-r from-blue-700 to-blue-500 hover:opacity-95 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg cursor-pointer"
                    >
                      {isPublishingPoll ? 'Publishing...' : 'Broadcast'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-[#1c1c1e]/15 rounded-2xl p-5 space-y-4">
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Community Governance Info</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Decisions on this dashboard are completely artist-driven. Buy or earn {tokenTicker} tokens to participate as soon as {artist.name} opens new proposals on the board.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
