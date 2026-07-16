import { PostComment } from "../types";

export const mockTrackComments: Record<string, PostComment[]> = {
  "tr-1": [
    {
      id: "cmt-1-1",
      userId: "u2",
      userName: "Sarah Jenkins",
      username: "@sarahj",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
      content: "This track has been on repeat since morning! Burna boy never misses! Lagos giant for a reason 👑👑🔥",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
      likes: 42,
      reactions: { "🔥": 12, "❤️": 5 },
      userReactions: ["🔥"]
    },
    {
      id: "cmt-1-2",
      userId: "u3",
      userName: "Alex Rivera",
      username: "@arivera",
      userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
      content: "The low end on this mix is incredibly clean. Shoutout to the mixing engineer!",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2h ago
      likes: 18,
      reactions: { "🙌": 3 }
    }
  ],
  "tr-5": [
    {
      id: "cmt-5-1",
      userId: "u2",
      userName: "Sarah Jenkins",
      username: "@sarahj",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
      content: "Solar Pulse is the synthwave track I didn't know I needed. Outstanding!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      likes: 8
    }
  ]
};

export const mockPostComments: PostComment[] = [
  {
    id: "pc-1",
    userId: "u2",
    userName: "Sarah Jenkins",
    username: "@sarahj",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
    content: "Absolute fire compilation! Love the decentralized focus.",
    timestamp: new Date().toISOString(),
    likes: 4,
    reactions: { "🔥": 1 }
  }
];
