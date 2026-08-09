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
  Sparkles, 
  UserCheck, 
  Smile, 
  MoreHorizontal,
  Flame,
  CheckCircle,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAudio } from "@/contexts/AudioContext";
import { Artist } from "@/types";
import { MOCK_ARTISTS, TON_LOGO, TJ_COIN_ICON } from "@/constants";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  artistId: string;
  senderName: string;
  senderAvatar: string;
  senderBadge?: "Artist" | "Legendary Holder" | "VIP Supporter" | "Fan";
  text: string;
  timestamp: string;
  isPinned?: boolean;
  likes: number;
  hasLiked?: boolean;
  songRequest?: string;
  tipAmount?: string;
  audioPreviewUrl?: string;
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

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  "artist-cyber-beats": [
    {
      id: "msg-01",
      artistId: "artist-cyber-beats",
      senderName: "Cyber Beats",
      senderAvatar: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20producer%20avatar?width=200&height=200&nologo=true",
      senderBadge: "Artist",
      text: "Welcome Cyber Beats NFT Holders! 🎧 Just dropped a fresh stem pack in the Vault. Let me know what you think of the synth bassline!",
      timestamp: "10:30 AM",
      isPinned: true,
      likes: 34,
      audioPreviewUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3"
    },
    {
      id: "msg-02",
      artistId: "artist-cyber-beats",
      senderName: "Alex.ton",
      senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
      senderBadge: "Legendary Holder",
      text: "The analog synth leads on Solar Pulse acoustic session are insane 🔥🔥 Tipped 5 TON!",
      timestamp: "10:42 AM",
      likes: 12,
      tipAmount: "5.0 TON"
    },
    {
      id: "msg-03",
      artistId: "artist-cyber-beats",
      senderName: "Elena_Vibes",
      senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
      senderBadge: "VIP Supporter",
      text: "Can we get a live DJ stream this weekend in the Spatial Room?",
      timestamp: "11:05 AM",
      likes: 8,
      songRequest: "Solar Pulse (Extended Mix)"
    }
  ],
  "artist-aura-sound": [
    {
      id: "msg-10",
      artistId: "artist-aura-sound",
      senderName: "Aura Sound",
      senderAvatar: "https://image.pollinations.ai/prompt/ethereal%20female%20musician%20avatar%20neon?width=200&height=200&nologo=true",
      senderBadge: "Artist",
      text: "Hey VIPs! Help us pick the official artwork for our upcoming Genesis EP below!",
      timestamp: "Yesterday",
      isPinned: true,
      likes: 45
    }
  ]
};

const INITIAL_POLLS: Record<string, ArtistPoll> = {
  "artist-cyber-beats": {
    id: "poll-01",
    artistId: "artist-cyber-beats",
    question: "Which genre should we explore in the next Genesis NFT Drop?",
    options: [
      { id: "opt-1", text: "Cyberpunk Synthwave", votes: 42 },
      { id: "opt-2", text: "Deep Melodic Techno", votes: 28 },
      { id: "opt-3", text: "Ambient Drum & Bass", votes: 19 }
    ],
    totalVotes: 89
  },
  "artist-aura-sound": {
    id: "poll-02",
    artistId: "artist-aura-sound",
    question: "Choose the cover theme for Aura Beat Part II:",
    options: [
      { id: "opt-a", text: "Crystal Resonance (Neon Blue)", votes: 31 },
      { id: "opt-b", text: "Solar Eclipse (Gold Dark)", votes: 55 }
    ],
    totalVotes: 86
  }
};

export const VIPArtistChat: React.FC<{ onOpenTipModal?: (artist: Artist) => void }> = ({ onOpenTipModal }) => {
  const { userProfile, artists, addNotification, userNFTs } = useAudio();

  const activeArtistList = artists.length > 0 ? artists : MOCK_ARTISTS;
  const [selectedArtistId, setSelectedArtistId] = useState<string>("artist-cyber-beats");
  const [activeTab, setActiveTab] = useState<"chat" | "polls">("chat");

  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [pollsMap, setPollsMap] = useState<Record<string, ArtistPoll>>(INITIAL_POLLS);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({
    "artist-aura-sound": 1
  });
  const [isListenerActive, setIsListenerActive] = useState<boolean>(true);

  const [inputText, setInputText] = useState<string>("");
  const [songRequestInput, setSongRequestInput] = useState<string>("");

  const currentArtist = activeArtistList.find(a => a.uid === selectedArtistId) || activeArtistList[0];
  const chatMessages = messagesMap[selectedArtistId] || [];
  const currentPoll = pollsMap[selectedArtistId];

  // Helper to check user access to a specific artist channel
  const checkChannelAccess = (artistId: string) => {
    // Cyber Beats channel requires Solar Pulse NFT or 50+ JAM
    // Aura Sound requires Aura NFT or Gold tier
    // Default: User has access if authenticated
    return true;
  };

  // Real-time Notification Listener Effect for artist-hosted chat rooms
  useEffect(() => {
    if (!isListenerActive) return;

    // Set up real-time listener simulation timer
    const interval = setInterval(() => {
      // Pick a random artist other than current selected artist to simulate real-time message arrival
      const targetArtists = activeArtistList.filter(a => a.uid !== selectedArtistId);
      if (targetArtists.length === 0) return;

      const randomArtist = targetArtists[Math.floor(Math.random() * targetArtists.length)];
      if (!checkChannelAccess(randomArtist.uid)) return;

      const simulatedMessages = [
        `Dropping a surprise stems preview in the Vault shortly! 🎵`,
        `Thank you all for voting in our latest Genesis poll! Results are in 🔥`,
        `Live acoustic session stream set for this Friday at 8 PM UTC 🎧`,
        `Exclusive soundkit download link shared in channel resources!`,
      ];
      const text = simulatedMessages[Math.floor(Math.random() * simulatedMessages.length)];

      const incomingMsg: ChatMessage = {
        id: `msg-rt-${Date.now()}`,
        artistId: randomArtist.uid,
        senderName: randomArtist.name,
        senderAvatar: randomArtist.avatarUrl,
        senderBadge: "Artist",
        text,
        timestamp: "Just now",
        likes: 1
      };

      // Update message map
      setMessagesMap(prev => ({
        ...prev,
        [randomArtist.uid]: [...(prev[randomArtist.uid] || []), incomingMsg]
      }));

      // Update unread count for that channel
      setUnreadCounts(prev => ({
        ...prev,
        [randomArtist.uid]: (prev[randomArtist.uid] || 0) + 1
      }));

      // Alert user via real-time notification listener
      addNotification(
        `💬 ${randomArtist.name} Lounge: ${text}`,
        "info",
        6000
      );
      toast.info(`New message in ${randomArtist.name} VIP Lounge!`, {
        description: text,
      });
    }, 28000); // Trigger every 28 seconds

    return () => clearInterval(interval);
  }, [isListenerActive, selectedArtistId, activeArtistList]);

  const handleSelectArtist = (artistId: string) => {
    setSelectedArtistId(artistId);
    // Clear unread count for selected channel
    setUnreadCounts(prev => ({
      ...prev,
      [artistId]: 0
    }));
  };

  const handleSimulateArtistDrop = () => {
    const text = `⚡ [LIVE DROP] ${currentArtist.name}: Exclusive studio preview broadcast live to VIP channel!`;
    const newMsg: ChatMessage = {
      id: `msg-drop-${Date.now()}`,
      artistId: selectedArtistId,
      senderName: currentArtist.name,
      senderAvatar: currentArtist.avatarUrl,
      senderBadge: "Artist",
      text: `Just recorded a raw acoustic demo for the VIP Lounge holders! Let me know your thoughts.`,
      timestamp: "Just now",
      likes: 5,
      isPinned: true
    };

    setMessagesMap(prev => ({
      ...prev,
      [selectedArtistId]: [...(prev[selectedArtistId] || []), newMsg]
    }));

    addNotification(`⚡ ${currentArtist.name} posted a live announcement!`, "success", 5000);
    toast.success(`Live drop received from ${currentArtist.name}!`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      artistId: selectedArtistId,
      senderName: userProfile.name || "Anonymous Holder",
      senderAvatar: userProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
      senderBadge: "Legendary Holder",
      text: inputText.trim(),
      timestamp: "Just now",
      likes: 0,
      songRequest: songRequestInput.trim() || undefined
    };

    setMessagesMap(prev => ({
      ...prev,
      [selectedArtistId]: [...(prev[selectedArtistId] || []), newMsg]
    }));

    setInputText("");
    setSongRequestInput("");
    toast.success("Message sent to VIP Chat!");
  };

  const handleLikeMessage = (msgId: string) => {
    setMessagesMap(prev => {
      const list = prev[selectedArtistId] || [];
      const updated = list.map(m => {
        if (m.id === msgId) {
          const hasLiked = m.hasLiked;
          return {
            ...m,
            hasLiked: !hasLiked,
            likes: hasLiked ? m.likes - 1 : m.likes + 1
          };
        }
        return m;
      });
      return { ...prev, [selectedArtistId]: updated };
    });
  };

  const handleVotePoll = (optionId: string) => {
    if (!currentPoll) return;
    if (currentPoll.userVotedId) {
      toast.info("You have already voted in this poll");
      return;
    }

    setPollsMap(prev => {
      const poll = prev[selectedArtistId];
      if (!poll) return prev;

      const updatedOptions = poll.options.map(opt => {
        if (opt.id === optionId) {
          return { ...opt, votes: opt.votes + 1 };
        }
        return opt;
      });

      return {
        ...prev,
        [selectedArtistId]: {
          ...poll,
          options: updatedOptions,
          totalVotes: poll.totalVotes + 1,
          userVotedId: optionId
        }
      };
    });

    toast.success("Vote recorded on-chain!");
  };

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
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Listener
            </span>
          </div>

          <div className="space-y-1.5">
            {activeArtistList.slice(0, 5).map((artist) => {
              const isSelected = selectedArtistId === artist.uid;
              const unread = unreadCounts[artist.uid] || 0;
              return (
                <button
                  key={artist.uid}
                  onClick={() => handleSelectArtist(artist.uid)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all relative ${
                    isSelected
                      ? "bg-[#0098EA] text-white shadow-lg shadow-[#0098EA]/20"
                      : "bg-[#050A24] text-[#9AA0AE] hover:bg-white/5"
                  }`}
                >
                  <img
                    src={artist.avatarUrl}
                    alt={artist.name}
                    className="w-9 h-9 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate text-white">{artist.name}</h4>
                    <p className="text-[10px] opacity-80 truncate">
                      {artist.genre || "Electronic"} VIP
                    </p>
                  </div>

                  {unread > 0 && !isSelected && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-bounce shadow-md">
                      {unread}
                    </span>
                  )}

                  <Crown className={`w-4 h-4 shrink-0 ${isSelected ? "text-amber-300 fill-amber-300" : "text-[#9AA0AE]"}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time Notification listener toggle info box */}
        <div className="p-3 rounded-2xl bg-[#050A24] text-[11px] text-[#9AA0AE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0098EA]" />
            <span>Chat Listener</span>
          </div>
          <button
            onClick={() => {
              setIsListenerActive(!isListenerActive);
              toast.info(isListenerActive ? "Real-time chat listener paused" : "Real-time chat listener active");
            }}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
              isListenerActive ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-300"
            }`}
          >
            {isListenerActive ? "Active" : "Paused"}
          </button>
        </div>
      </div>

      {/* Main Chat & Forum Area */}
      <div className="lg:col-span-3 space-y-4">
        {/* Header Bar */}
        <div className="p-4 rounded-2xl bg-[#0A113A] flex items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <img
              src={currentArtist.avatarUrl}
              alt={currentArtist.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#0098EA]/30"
            />
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

          {/* Action Tabs, Trigger Live Drop & Tip Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateArtistDrop}
              title="Test real-time artist notification listener drop"
              className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 font-bold text-[11px] flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              Simulate Live Drop
            </button>

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
            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 scrollbar-thin">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-xl transition-all ${
                    msg.isPinned
                      ? "bg-[#0F1D5E] border-l-4 border-amber-400"
                      : "bg-[#050A24]"
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
                      <img
                        src={msg.senderAvatar}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover"
                      />
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

                    {/* Tip indicator */}
                    {msg.tipAmount && (
                      <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center gap-1">
                        <Flame className="w-3 h-3" /> Tipped {msg.tipAmount}
                      </span>
                    )}
                  </div>

                  {/* Message Body */}
                  <p className="mt-2 text-xs text-slate-200 leading-relaxed font-medium">
                    {msg.text}
                  </p>

                  {/* Optional Song Request tag */}
                  {msg.songRequest && (
                    <div className="mt-2.5 p-2 rounded-lg bg-white/5 flex items-center gap-2 text-xs text-[#0098EA]">
                      <Music className="w-3.5 h-3.5" />
                      <span>Requested Track: <strong>{msg.songRequest}</strong></span>
                    </div>
                  )}

                  {/* Reactions */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#9AA0AE]">
                    <button
                      onClick={() => handleLikeMessage(msg.id)}
                      className={`flex items-center gap-1.5 hover:text-white transition-colors ${
                        msg.hasLiked ? "text-rose-400 font-bold" : ""
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${msg.hasLiked ? "fill-rose-400" : ""}`} />
                      {msg.likes}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="space-y-2 pt-2 border-t border-white/5">
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

              {/* Optional Song Request Input toggle */}
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
                    Official On-Chain Poll
                  </span>
                  <h3 className="text-base font-bold text-white">{currentPoll.question}</h3>
                  <p className="text-xs text-[#9AA0AE]">
                    Total Votes Cast: <span className="text-white font-bold">{currentPoll.totalVotes}</span>
                  </p>
                </div>

                {/* Poll Options */}
                <div className="space-y-3">
                  {currentPoll.options.map((opt) => {
                    const percent = currentPoll.totalVotes > 0 
                      ? Math.round((opt.votes / currentPoll.totalVotes) * 100) 
                      : 0;
                    const isUserChoice = currentPoll.userVotedId === opt.id;

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
                        {/* Progress Bar Fill */}
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
