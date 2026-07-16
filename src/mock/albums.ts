import { Album } from "../types";

export const mockAlbums: Album[] = [
  {
    id: "alb-burna-1",
    title: "I Told Them...",
    artist: "Burna Boy",
    artistId: "burna-boy",
    coverUrl: "/src/assets/images/tonjam_cover_abstract_1782827351935.jpg",
    releaseYear: 2023,
    trackIds: ["tr-1"],
    genre: "Afrobeats",
    description: "The seventh studio album by the African Giant, expressing his victory lap and international dominance."
  },
  {
    id: "alb-wiz-1",
    title: "Made In Lagos",
    artist: "Wizkid",
    artistId: "wizkid",
    coverUrl: "/src/assets/images/tonjam_cover_waveform_1782827363641.jpg",
    releaseYear: 2020,
    trackIds: ["tr-2"],
    genre: "Afrobeats",
    description: "A cultural masterclass. Wizkid's fourth studio album merging Lagos culture with worldwide grooves."
  },
  {
    id: "alb-krupy-1",
    title: "Solar Pulse LP",
    artist: "DJ Krupy",
    artistId: "dj-krupy",
    coverUrl: "https://image.pollinations.ai/prompt/cyberpunk%20electronic%20music%20album%20cover%20solar%20pulse%20neon%20orange?width=600&height=600&nologo=true",
    releaseYear: 2023,
    trackIds: ["tr-5"],
    genre: "Electronic",
    description: "The official debut digital full-length release by DJ Krupy defining decentralized synthesized electronic soundscapes."
  }
];
