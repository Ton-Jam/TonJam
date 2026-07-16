import { Post } from "../types";

export const mockPosts: Post[] = [
  {
    id: "p-1",
    userId: "burna-boy",
    userName: "Burna Boy",
    username: "@burnaboy",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
    isVerified: true,
    content: "Just launched my official 'City Boys: African Giant Genesis #001' unique NFT auction here on TonJam! Floor price is set to 50 TON. Unlocks studio stems and lifetime concert passes. 🔥🇳🇬🚀 Let's go!",
    nftId: "n1",
    likes: 24500,
    isLiked: false,
    reposts: 5820,
    isReposted: false,
    comments: 420,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    commentList: [
      {
        id: "c-1-1",
        userId: "u2",
        userName: "Sarah Jenkins",
        username: "@sarahj",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
        content: "OMG! I just placed my bid! 125 TON. This is going straight to my collectors ledger. Pure gold! 💎💎💎",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
        likes: 184,
        reactions: { "🔥": 45, "💎": 23 },
        userReactions: ["🔥"]
      },
      {
        id: "c-1-2",
        userId: "u4",
        userName: "Emeka Obi",
        username: "@emeka_ton",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
        content: "The giant has landed in Web3. Huge moment for Afrobeats and the TON ecosystem!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        likes: 412,
        reactions: { "🚀": 98, "🙌": 12 }
      }
    ]
  },
  {
    id: "p-2",
    userId: "u1",
    userName: "DJ Krupy",
    username: "@dj_krupy",
    userAvatar: "https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png",
    isVerified: true,
    content: "My new track 'Solar Pulse' is climbing the TON Top 50 chart! Big up to everyone streaming and staking JAM to support independent creators. We are building the future of music streaming. 🎧💿📡",
    trackId: "tr-5",
    likes: 840,
    isLiked: true,
    reposts: 124,
    isReposted: false,
    comments: 18,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    commentList: [
      {
        id: "c-2-1",
        userId: "u3",
        userName: "Alex Rivera",
        username: "@arivera",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
        content: "The synth transitions are extremely smooth. Well deserved chart spot, bro!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        likes: 12
      }
    ]
  },
  {
    id: "p-3",
    userId: "tems",
    userName: "Tems",
    username: "@tems",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
    isVerified: true,
    content: "Had a great time recording 'Free Mind'. This song is a reminder to find your peace in the middle of all the noise. Love to my Rebel Gang. ❤️✨ Check out my limited Gold Series NFT to unlock behind-the-scenes recording footage.",
    trackId: "tr-3",
    likes: 19800,
    isLiked: false,
    reposts: 3120,
    isReposted: false,
    comments: 310,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  }
];
