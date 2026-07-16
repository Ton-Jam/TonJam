import { Artist } from "../types";

export const mockArtists: Artist[] = [
  {
    uid: "burna-boy",
    name: "Burna Boy",
    username: "@burnaboy",
    walletAddress: "UQAn_BurnaBoy_AfricanGiant_7777",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
    followers: 1250000,
    verified: true,
    isVerifiedArtist: true,
    genre: "Afrobeats",
    monthlyListeners: 18500000,
    bio: "The African Giant. Blending Afrobeats, dancehall, reggae, and hip-hop into a unique sound of global revolution.",
    bannerUrl: "/src/assets/images/tonjam_cover_abstract_1782827351935.jpg",
    bannerImageUrl: "/src/assets/images/tonjam_cover_abstract_1782827351935.jpg",
    socials: {
      x: "https://x.com/burnaboy",
      spotify: "https://open.spotify.com/artist/3tVQ6SRCcqqH46S0g6730i",
      instagram: "https://instagram.com/burnaboygram",
      telegram: "https://t.me/burnaboy_official"
    },
    royaltyConfig: {
      streamingSplits: [
        { address: "UQAn_BurnaBoy_AfricanGiant_7777", percentage: 0.70, label: "Main Artist" },
        { address: "UQAn_Spaspace_Producer_1111", percentage: 0.20, label: "Producer" },
        { address: "UQAn_Spaceship_Records_9999", percentage: 0.10, label: "Record Label" }
      ],
      nftSaleSplits: [
        { address: "UQAn_BurnaBoy_AfricanGiant_7777", percentage: 0.80, label: "Main Artist" },
        { address: "UQAn_Spaspace_Producer_1111", percentage: 0.20, label: "Producer" }
      ]
    },
    earnings: {
      streaming: 84520.4,
      nftSales: 312500.0,
      total: 397020.4
    },
    events: [
      {
        id: "evt-burna-1",
        artistId: "burna-boy",
        title: "I Told Them Tour - Live in Lagos",
        date: "2026-12-20",
        time: "20:00",
        venue: "Eko Energy City",
        location: "Lagos, Nigeria",
        ticketUrl: "https://tonjam.io/tickets/burnaboy-lagos",
        imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=600&h=400",
        bannerImageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200&h=300",
        status: "upcoming"
      }
    ],
    collaborations: [
      { id: "col-1", artistName: "Wizkid", trackTitle: "Ginger", coverUrl: "/src/assets/images/tonjam_cover_abstract_1782827351935.jpg" }
    ],
    location: "Lagos, Nigeria",
    isLive: false,
    verificationStatus: "verified"
  },
  {
    uid: "wizkid",
    name: "Wizkid",
    username: "@wizkid",
    walletAddress: "UQualWizkid_n7m2_k9p4",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
    followers: 1100000,
    verified: true,
    isVerifiedArtist: true,
    genre: "Afrobeats",
    monthlyListeners: 15400000,
    bio: "Starboy. Bringing the rich culture of Afrobeats and Lagos vibes to the decentralized future.",
    bannerUrl: "/src/assets/images/tonjam_cover_waveform_1782827363641.jpg",
    bannerImageUrl: "/src/assets/images/tonjam_cover_waveform_1782827363641.jpg",
    socials: {
      x: "https://x.com/wizkidayo",
      spotify: "https://open.spotify.com/artist/3tVQ6SRCcqqH46S0g6730i",
      instagram: "https://instagram.com/wizkidayo"
    },
    royaltyConfig: {
      streamingSplits: [
        { address: "UQualWizkid_n7m2_k9p4", percentage: 0.75, label: "Main Artist" },
        { address: "UQAn_Starboy_Producer_2222", percentage: 0.25, label: "Producer" }
      ],
      nftSaleSplits: [
        { address: "UQualWizkid_n7m2_k9p4", percentage: 0.85, label: "Main Artist" },
        { address: "UQAn_Starboy_Producer_2222", percentage: 0.15, label: "Producer" }
      ]
    },
    earnings: {
      streaming: 72400.1,
      nftSales: 289100.5,
      total: 361500.6
    },
    events: [
      {
        id: "evt-wiz-1",
        artistId: "wizkid",
        title: "More Love, Less Ego - Global Stream",
        date: "2026-11-05",
        time: "19:30",
        venue: "TON Virtual Garden",
        location: "Metaverse",
        ticketUrl: "https://tonjam.io/tickets/wizkid-meta",
        imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600&h=400",
        status: "upcoming"
      }
    ],
    location: "London, UK",
    isLive: true,
    verificationStatus: "verified"
  },
  {
    uid: "tems",
    name: "Tems",
    username: "@tems",
    walletAddress: "UQA_Tems_Rebel_Vibes_9999",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
    followers: 850000,
    verified: true,
    isVerifiedArtist: true,
    genre: "R&B / Soul",
    monthlyListeners: 12100000,
    bio: "Leading Vibe. Multi-platinum songwriter, producer, and singer crafting the next chapter of soul and Afrobeats.",
    bannerUrl: "/src/assets/images/tonjam_cover_type_1782827384693.jpg",
    bannerImageUrl: "/src/assets/images/tonjam_cover_type_1782827384693.jpg",
    socials: {
      x: "https://x.com/temsbaby",
      instagram: "https://instagram.com/temsbaby"
    },
    royaltyConfig: {
      streamingSplits: [
        { address: "UQA_Tems_Rebel_Vibes_9999", percentage: 0.90, label: "Main Artist & Producer" },
        { address: "UQAn_Tems_Manager_1234", percentage: 0.10, label: "Management" }
      ],
      nftSaleSplits: [
        { address: "UQA_Tems_Rebel_Vibes_9999", percentage: 0.95, label: "Main Artist" },
        { address: "UQAn_Tems_Manager_1234", percentage: 0.05, label: "Management" }
      ]
    },
    earnings: {
      streaming: 51200.3,
      nftSales: 184500.0,
      total: 235700.3
    },
    events: [],
    location: "Lagos, Nigeria",
    isLive: false,
    verificationStatus: "verified"
  },
  {
    uid: "asake",
    name: "Asake",
    username: "@asake",
    walletAddress: "UQAsake_p3q9_r7t8",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
    followers: 670000,
    verified: true,
    isVerifiedArtist: true,
    genre: "Afrobeats",
    monthlyListeners: 9500000,
    bio: "Mr. Money. Pioneering the high-energy fusion of Amapiano, fuji, and afropop on TON.",
    bannerUrl: "/src/assets/images/tonjam_cover_city_1782827373498.jpg",
    bannerImageUrl: "/src/assets/images/tonjam_cover_city_1782827373498.jpg",
    socials: {
      x: "https://x.com/asakemusik",
      instagram: "https://instagram.com/asakemusic"
    },
    royaltyConfig: {
      streamingSplits: [
        { address: "UQAsake_p3q9_r7t8", percentage: 0.65, label: "Main Artist" },
        { address: "UQAn_YBNL_Records_8888", percentage: 0.35, label: "Record Label & Prod" }
      ],
      nftSaleSplits: [
        { address: "UQAsake_p3q9_r7t8", percentage: 0.80, label: "Main Artist" },
        { address: "UQAn_YBNL_Records_8888", percentage: 0.20, label: "Record Label" }
      ]
    },
    earnings: {
      streaming: 34100.8,
      nftSales: 122000.4,
      total: 156101.2
    },
    events: [],
    location: "Lagos, Nigeria",
    isLive: false,
    verificationStatus: "verified"
  },
  {
    uid: "dj-krupy",
    name: "DJ Krupy",
    username: "@dj_krupy",
    walletAddress: "UQCc_DJ_Krupy_Vibez_x9y1_8888",
    avatarUrl: "https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png",
    followers: 85400,
    verified: true,
    isVerifiedArtist: true,
    genre: "Electronic",
    monthlyListeners: 120000,
    bio: "The legend of the Krupy Vibez. Delivering high-energy underground electronic beats and exclusive digital artifacts.",
    bannerUrl: "/default_tonjam_banner.jpg",
    bannerImageUrl: "/default_tonjam_banner.jpg",
    socials: {
      x: "https://x.com/dj_krupy",
      instagram: "https://instagram.com/dj_krupy",
      telegram: "https://t.me/dj_krupy"
    },
    royaltyConfig: {
      streamingSplits: [
        { address: "UQCc_DJ_Krupy_Vibez_x9y1_8888", percentage: 0.80, label: "Main Artist" },
        { address: "UQCc_Community_Pool_0000", percentage: 0.20, label: "DAO Staking Pool" }
      ],
      nftSaleSplits: [
        { address: "UQCc_DJ_Krupy_Vibez_x9y1_8888", percentage: 0.85, label: "Main Artist" },
        { address: "UQCc_Community_Pool_0000", percentage: 0.15, label: "DAO Treasury" }
      ]
    },
    earnings: {
      streaming: 154.5,
      nftSales: 892.4,
      total: 1046.9
    },
    events: [
      {
        id: "e-krupy-1",
        artistId: "dj-krupy",
        title: "Solar Pulse Genesis Tour",
        date: "2026-12-25",
        time: "22:00",
        venue: "TON Digital Arena",
        location: "Metaverse",
        ticketUrl: "https://tonjam.io/tickets/krupy",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600&h=400",
        status: "upcoming"
      }
    ],
    location: "Lekki, Nigeria",
    isLive: false,
    verificationStatus: "verified"
  },
  {
    uid: "drake",
    name: "Drake",
    username: "@drake",
    walletAddress: "UQDrake_x9y1_8888",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200",
    followers: 5500000,
    verified: true,
    isVerifiedArtist: true,
    genre: "Hip Hop",
    monthlyListeners: 68000000,
    bio: "October's Very Own. Global icon bringing the best of hip hop and certified lover boy tracks to the TON network.",
    bannerUrl: "/src/assets/images/tonjam_cover_abstract_1782827351935.jpg",
    bannerImageUrl: "/src/assets/images/tonjam_cover_abstract_1782827351935.jpg",
    socials: {
      x: "https://x.com/drake",
      instagram: "https://instagram.com/champagnepapi"
    },
    royaltyConfig: {
      streamingSplits: [{ address: "UQDrake_x9y1_8888", percentage: 0.90, label: "OVO Sound" }],
      nftSaleSplits: [{ address: "UQDrake_x9y1_8888", percentage: 0.90, label: "OVO Sound" }]
    },
    earnings: {
      streaming: 520000.0,
      nftSales: 1540000.0,
      total: 2060000.0
    },
    events: [],
    location: "Toronto, Canada",
    isLive: false,
    verificationStatus: "verified"
  }
];
