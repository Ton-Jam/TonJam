import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Pin, 
  Crown, 
  ShieldCheck, 
  Heart, 
  Music, 
  Vote, 
  Flame
} from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { Artist } from "@/types";
import { toast } from "sonner";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "@/lib/firebase";

interface ChatMessage {
  id: string;
  artistId: string;
  senderId?: string;
  senderName: string;
  senderAvatar?: string;
  senderBadge?: "Artist" | "Legendary Holder" | "VIP Supporter" | "Fan";
  text: string;
  timestamp: string;
  isPinned?: boolean;
  likes: number;
  hasLiked?: boolean;
  songRequest?: string;
  tipAmount?: string;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface ArtistPoll {
  id: string;
  artistId: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedId?: string;
}

export const VIPArtistChat: React.FC<{ onOpenTipModal?: (artist: Artist) => void }> = ({ onOpenTipModal }) => {
  const { userProfile, artists, userNFTs } = useAudio();

  const [selectedArtistId, setSelectedArtistId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"chat" | "polls">("chat");

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [polls, setPolls] = useState<ArtistPoll[]>([]);
  const [voteCountsByOption, setVoteCountsByOption] = useState<Record<string, number>>({});
  const [userVotedOptionId, setUserVotedOptionId] = useState<string | undefined>(undefined);

  const [inputText, setInputText] = useState<string>("");
  const [songRequestInput, setSongRequestInput] = useState<string>("");

  useEffect(() => {
    if (!selectedArtistId && artists.length > 0) {
      setSelectedArtistId(artists[0].uid);
    }
  }, [artists, selectedArtistId]);

  const currentArtist = artists.find(a => a.uid === selectedArtistId) || artists[0];

  // Subscribe to real Firestore VIP chat room messages for the selected artist
  useEffect(() => {
    if (!selectedArtistId) {
      setChatMessages([]);
      return;
    }

    const q = query(
      collection(db, "jamRooms", selectedArtistId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const loaded: ChatMessage[] = snap.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt?.toDate ? data.createdAt.toDate() : null;
          return {
            id: d.id,
            artistId: data.artistId || selectedArtistId,
            senderId: data.senderId,
            senderName: data.senderName || "Member",
            senderAvatar: data.senderAvatar || "",
            senderBadge: data.senderBadge,
            text: data.text || "",
            timestamp: ts ? ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : (data.timestamp || "Recently"),
            isPinned: !!data.isPinned,
            likes: Number(data.likes || 0),
            songRequest: data.songRequest,
            tipAmount: data.tipAmount,
          };
        });
        setChatMessages(loaded);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, `jamRooms/${selectedArtistId}/messages`);
      }
    );

    return () => unsub();
  }, [selectedArtistId]);

  // Subscribe to real Firestore artistPolls for selected artist
  useEffect(() => {
    if (!selectedArtistId) {
      setPolls([]);
      return;
    }

    const q = query(
      collection(db, "artistPolls"),
      where("artistId", "==", selectedArtistId)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const loaded: ArtistPoll[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            artistId: data.artistId || selectedArtistId,
            question: data.question || "",
            options: Array.isArray(data.options) ? data.options : [],
            totalVotes: Number(data.totalVotes || 0),
          };
        });
        setPolls(loaded);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "artistPolls");
      }
    );

    return () => unsub();
  }, [selectedArtistId]);

  const currentPoll = polls[0];

  // Subscribe to votes subcollection for active poll
  useEffect(() => {
    if (!currentPoll?.id) {
      setVoteCountsByOption({});
      setUserVotedOptionId(undefined);
      return;
    }

    const uid = auth.currentUser?.uid;
    const unsub = onSnapshot(
      collection(db, "artistPolls", currentPoll.id, "votes"),
      (snap) => {
        const counts: Record<string, number> = {};
        let myVote: string | undefined;
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.optionId) {
            counts[data.optionId] = (counts[data.optionId] || 0) + 1;
          }
          if (uid && (d.id === uid || data.userId === uid)) {
            myVote = data.optionId;
          }
        });
        setVoteCountsByOption(counts);
        setUserVotedOptionId(myVote);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, `artistPolls/${currentPoll.id}/votes`);
      }
    );

    return () => unsub();
  }, [currentPoll?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedArtistId) return;

    const uid = auth.currentUser?.uid;
    if (!uid) {
      toast.error("Please sign in to post in the VIP lounge");
      return;
    }

    try {
      const ownsArtistNft = userNFTs.some((n) => n.creatorId === selectedArtistId);
      const badge: ChatMessage["senderBadge"] =
        uid === selectedArtistId ? "Artist" : ownsArtistNft ? "Legendary Holder" : "Fan";

      await addDoc(collection(db, "jamRooms", selectedArtistId, "messages"), {
        artistId: selectedArtistId,
        senderId: uid,
        senderName: userProfile.name || "Collector",
        senderAvatar: userProfile.avatar || "",
        senderBadge: badge,
        text: inputText.trim(),
        songRequest: songRequestInput.trim() || null,
        likes: 0,
        isPinned: false,
        createdAt: serverTimestamp(),
      });

      setInputText("");
      setSongRequestInput("");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `jamRooms/${selectedArtistId}/messages`);
      toast.error("Failed to send message");
    }
  };

  const handleVotePoll = async (optionId: string) => {
    if (!currentPoll) return;
    if (userVotedOptionId) {
      toast.info("You have already voted in this poll");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      await setDoc(doc(db, "artistPolls", currentPoll.id, "votes", uid), {
        optionId,
        userId: uid,
        votedAt: serverTimestamp(),
      });
      toast.success("Vote recorded");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `artistPolls/${currentPoll.id}/votes/${uid}`);
      toast.error("Failed to submit vote");
    }
  };

  if (!currentArtist) {
    return (
      <div className="p-10 rounded-2xl bg-[#0A113A] text-center space-y-2">
        <MessageSquare className="w-8 h-8 mx-auto text-[#9AA0AE] opacity-50" />
        <p className="text-sm font-bold text-white">No artist VIP lounges available yet</p>
        <p className="text-xs text-[#9AA0AE]">Verified artist lounges will appear here once creators join TonJam.</p>
      </div>
    );
  }

  const totalLiveVotes = Object.values(voteCountsByOption).reduce((acc, v) => acc + v, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Sidebar: Artist VIP Lounges */}
      <div className="lg:col-span-1 space-y-3">
        <div className="p-3.5 rounded-2xl bg-[#0A113A] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-[#9AA0AE] tracking-wider">
              VIP Lounges
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#0098EA]/20 text-[#0098EA] text-[10px] font-extrabold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          </div>

          <div className="space-y-1.5">
            {artists.slice(0, 8).map((artist) => {
              const isSelected = selectedArtistId === artist.uid;
              return (
                <button
                  key={artist.uid}
                  onClick={() => setSelectedArtistId(artist.uid)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all relative ${
                    isSelected
                      ? "bg-[#0098EA] text-white shadow-lg shadow-[#0098EA]/20"
                      : "bg-[#050A24] text-[#9AA0AE] hover:bg-white/5"
                  }`}
                >
                  {artist.avatarUrl ? (
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {(artist.name || 'A')[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate text-white">{artist.name}</h4>
                    <p className="text-[10px] opacity-80 truncate">
                      {artist.genre || "Artist"} Lounge
                    </p>
                  </div>

                  <Crown className={`w-4 h-4 shrink-0 ${isSelected ? "text-amber-300 fill-amber-300" : "text-[#9AA0AE]"}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Chat & Forum Area */}
      <div className="lg:col-span-3 space-y-4">
        {/* Header Bar */}
        <div className="p-4 rounded-2xl bg-[#0A113A] flex items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            {currentArtist.avatarUrl ? (
              <img
                src={currentArtist.avatarUrl}
                alt={currentArtist.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#0098EA]/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                {(currentArtist.name || 'A')[0]}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-white">{currentArtist.name} Lounge</h2>
                <ShieldCheck className="w-4 h-4 text-[#0098EA]" />
              </div>
              <p className="text-[10px] text-[#9AA0AE]">
                Exclusive channel for NFT & Token holders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#050A24] p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("chat")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === "chat"
                    ? "bg-[#0098EA] text-white"
                    : "text-[#9AA0AE] hover:text-white"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Live Chat
              </button>
              <button
                onClick={() => setActiveTab("polls")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === "polls"
                    ? "bg-[#0098EA] text-white"
                    : "text-[#9AA0AE] hover:text-white"
                }`}
              >
                <Vote className="w-3.5 h-3.5" />
                Polls
              </button>
            </div>

            {onOpenTipModal && (
              <button
                onClick={() => onOpenTipModal(currentArtist)}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-black text-xs flex items-center gap-1.5 shadow-md"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                Tip Artist
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Live Chat */}
        {activeTab === "chat" && (
          <div className="p-4 rounded-2xl bg-[#0A113A] space-y-4 flex flex-col h-[520px]">
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 scrollbar-thin">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#9AA0AE] space-y-2">
                  <MessageSquare className="w-8 h-8 opacity-40" />
                  <p className="text-xs font-bold text-white">No messages in {currentArtist.name}&apos;s lounge yet</p>
                  <p className="text-[11px]">Be the first to start a conversation with holders.</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl transition-all ${
                      msg.isPinned ? "bg-[#0F1D5E]" : "bg-[#050A24]"
                    }`}
                  >
                    {msg.isPinned && (
                      <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-black uppercase mb-2">
                        <Pin className="w-3 h-3 fill-amber-400" />
                        Pinned Announcement
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {msg.senderAvatar ? (
                          <img
                            src={msg.senderAvatar}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                            {(msg.senderName || "M")[0]}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{msg.senderName}</span>
                            {msg.senderBadge === "Artist" && (
                              <span className="px-2 py-0.2 rounded-md bg-[#0098EA] text-white text-[9px] font-black uppercase">
                                Artist
                              </span>
                            )}
                            {msg.senderBadge === "Legendary Holder" && (
                              <span className="px-2 py-0.2 rounded-md bg-amber-500/20 text-amber-400 text-[9px] font-bold">
                                Legendary
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#9AA0AE]">{msg.timestamp}</span>
                        </div>
                      </div>

                      {msg.tipAmount && (
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Tipped {msg.tipAmount}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-slate-200 leading-relaxed font-medium">
                      {msg.text}
                    </p>

                    {msg.songRequest && (
                      <div className="mt-2.5 p-2 rounded-lg bg-white/5 flex items-center gap-2 text-xs text-[#0098EA]">
                        <Music className="w-3.5 h-3.5" />
                        <span>Requested Track: <strong>{msg.songRequest}</strong></span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${currentArtist.name} VIP Lounge...`}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#050A24] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0098EA]"
                />
                <button
                  type="submit"
                  className="px-4 py-3 rounded-xl bg-[#0098EA] text-white hover:bg-[#0098EA]/90 font-bold text-xs flex items-center gap-1.5 shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </div>

              <input
                type="text"
                value={songRequestInput}
                onChange={(e) => setSongRequestInput(e.target.value)}
                placeholder="Attach song request (optional)..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#050A24]/60 text-white text-[11px] focus:outline-none focus:ring-1 focus:ring-[#0098EA]"
              />
            </form>
          </div>
        )}

        {/* Tab 2: Polls & Voting */}
        {activeTab === "polls" && (
          <div className="p-5 rounded-2xl bg-[#0A113A] space-y-5 min-h-[400px]">
            {currentPoll ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#050A24] space-y-2">
                  <span className="px-2.5 py-1 rounded-md bg-[#0098EA]/20 text-[#0098EA] text-[10px] font-black uppercase tracking-wider">
                    Artist Poll
                  </span>
                  <h3 className="text-base font-bold text-white">{currentPoll.question}</h3>
                  <p className="text-xs text-[#9AA0AE]">
                    Total Votes Cast: <span className="text-white font-bold">{totalLiveVotes}</span>
                  </p>
                </div>

                <div className="space-y-3">
                  {currentPoll.options.map((opt) => {
                    const optionVotes = voteCountsByOption[opt.id] || 0;
                    const percent = totalLiveVotes > 0 
                      ? Math.round((optionVotes / totalLiveVotes) * 100) 
                      : 0;
                    const isUserChoice = userVotedOptionId === opt.id;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleVotePoll(opt.id)}
                        className={`w-full p-4 rounded-xl text-left relative overflow-hidden transition-all ${
                          isUserChoice 
                            ? "bg-[#0F1D5E] ring-2 ring-[#0098EA]" 
                            : "bg-[#050A24] hover:bg-white/5"
                        }`}
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-[#0098EA]/20 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />

                        <div className="relative z-10 flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-white">{opt.text}</span>
                          <span className="text-xs font-black text-[#0098EA]">{percent}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-[#9AA0AE] space-y-2">
                <Vote className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-xs font-bold">No active polls for {currentArtist.name} right now.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VIPArtistChat;
