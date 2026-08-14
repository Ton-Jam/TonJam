export interface MockTrack {
  id: string;
  title: string;
  artist: string;
  coverArtUrl: string; // explicitly requested field
  coverUrl: string;    // backward compatibility for components expecting coverUrl
  audioUrl: string;
  duration: number;    // in seconds
  album?: string;
  genre?: string;
}

export const MOCK_TESTING_TRACKS: MockTrack[] = [
  {
    id: "mock-track-1",
    title: "Neon Horizon",
    artist: "Alex Synth",
    coverArtUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&h=300&q=80",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&h=300&q=80",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3",
    duration: 184,
    album: "Synthwave Dreams",
    genre: "Synthwave"
  },
  {
    id: "mock-track-2",
    title: "Digital Rain",
    artist: "Cyber Ambient",
    coverArtUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&h=300&q=80",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&h=300&q=80",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.mp3",
    duration: 132,
    album: "Matrix Reflections",
    genre: "Ambient"
  },
  {
    id: "mock-track-3",
    title: "Vapor Echoes",
    artist: "VaporWave Ltd.",
    coverArtUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&h=300&q=80",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&h=300&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 372,
    album: "Vapor Nostalgia",
    genre: "Vaporwave"
  },
  {
    id: "mock-track-4",
    title: "Cyberpunk Alley",
    artist: "Glitch Master",
    coverArtUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=300&q=80",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=300&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 425,
    album: "Neon City",
    genre: "Industrial Glitch"
  },
  {
    id: "mock-track-5",
    title: "Solitude in Space",
    artist: "Astro Beats",
    coverArtUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&h=300&q=80",
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&h=300&q=80",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: 302,
    album: "Cosmic Odyssey",
    genre: "Lo-Fi Sci-Fi"
  }
];
