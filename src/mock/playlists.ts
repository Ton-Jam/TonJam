import { Playlist } from "../types";

export const mockPlaylists: Playlist[] = [
  {
    id: "pl-curated-1",
    title: "TON Top 50",
    coverUrl: "/src/assets/images/tonjam_cover_waveform_1782827363641.jpg",
    trackCount: 5,
    creator: "TonJam Editorial",
    description: "The most streamed tracks across the TON network. Updated weekly.",
    trackIds: ["tr-1", "tr-2", "tr-4", "tr-3", "tr-5"],
    isPrivate: false,
    isCollaborative: false,
    tags: ["Hot", "Afrobeats", "Top Chart"]
  },
  {
    id: "pl-curated-2",
    title: "Afrobeats Gold",
    coverUrl: "/src/assets/images/tonjam_cover_city_1782827373498.jpg",
    trackCount: 4,
    creator: "Starboy Curators",
    description: "Only the finest and heaviest Afrobeats cuts and dancefloor heaters.",
    trackIds: ["tr-1", "tr-2", "tr-4", "tr-3"],
    isPrivate: false,
    isCollaborative: true,
    tags: ["Afrobeats", "Lagos", "Vibes"]
  },
  {
    id: "pl-user-1",
    title: "Late Night Gaming & Chill",
    coverUrl: "https://image.pollinations.ai/prompt/gaming%20setup%20neon%20lights%20headphones%20cyberpunk?width=400&height=400&nologo=true",
    trackCount: 3,
    creator: "DJ Krupy",
    description: "Personal selection of synthesized energetic rhythms and digital beats for focused gaming.",
    trackIds: ["tr-5", "tr-1", "tr-3"],
    isPrivate: false,
    isCollaborative: false,
    tags: ["Electronic", "Focus", "Chill"]
  }
];

export const mockCuratedPlaylists = mockPlaylists;
