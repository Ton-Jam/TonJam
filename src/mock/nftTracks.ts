import { NFTItem } from "../types";

export const mockNFTs: NFTItem[] = [
  {
    id: "n1",
    trackId: "tr-1",
    title: "City Boys: African Giant Genesis #001",
    owner: "UQDa_SarahJ_Collector_x9y1_7384",
    ownerId: "u2",
    creator: "Burna Boy",
    artist: "Burna Boy",
    artistId: "burna-boy",
    price: "125",
    imageUrl: "/src/assets/images/tonjam_cover_abstract_1782827351935.jpg",
    coverUrl: "/src/assets/images/tonjam_cover_abstract_1782827351935.jpg",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3",
    edition: "Unique",
    supply: 1,
    minted: 1,
    isAuction: true,
    listingType: "auction",
    auctionStartTime: new Date().toISOString(),
    auctionEndTime: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(), // 36 hours from now
    startingBid: "50",
    floorPriceChange: 15.2,
    contractAddress: "EQD_CityBoys_Burna_Giant_0000_X",
    royaltySplits: [
      { address: "UQAn_BurnaBoy_AfricanGiant_7777", percentage: 0.08, label: "Creator" },
      { address: "UQAn_Spaspace_Producer_1111", percentage: 0.02, label: "Producer" }
    ],
    stems_available: true,
    artistVerified: true,
    description: "The official Genesis Unique edition of City Boys by Burna Boy. High fidelity stem access and exclusive VIP backstage pass.",
    traits: [
      { trait_type: "Edition", value: "Genesis" },
      { trait_type: "Rarity", value: "Mythic" },
      { trait_type: "BPM", value: 112 },
      { trait_type: "Scale", value: "F# Major" },
      { trait_type: "Stem Access", value: "Unlocked" }
    ],
    attributes: [
      { trait_type: "Edition", value: "Genesis" },
      { trait_type: "Rarity", value: "Mythic" },
      { trait_type: "BPM", value: 112 },
      { trait_type: "Scale", value: "F# Major" },
      { trait_type: "Stem Access", value: "Unlocked" }
    ],
    history: [
      { event: "Minted", from: "0x0000000000000000000000000000000000000000", to: "Burna Boy", date: "2026-07-10T12:00:00Z" },
      { event: "Listed for Auction", from: "Burna Boy", to: "TonJam Marketplace", date: "2026-07-11T14:30:00Z", price: "50" },
      { event: "Bid Placed", from: "UQDa_SarahJ_Collector_x9y1_7384", to: "TonJam Marketplace", date: "2026-07-12T10:15:00Z", price: "125" }
    ],
    offers: [
      { id: "off-n1-1", offerer: "UQDa_SarahJ_Collector_x9y1_7384", price: "125", duration: "2 days", timestamp: "2026-07-12T10:15:00Z" },
      { id: "off-n1-2", offerer: "UQC_Emeka_LagosVibes_9911_v8s2", price: "110", duration: "1 day", timestamp: "2026-07-11T18:00:00Z" }
    ],
    exclusiveContent: [
      { id: "ex-1", title: "City Boys Stems (Bass, Drums, Vocals)", type: "track", url: "https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3", description: "Studio stems for production." },
      { id: "ex-2", title: "VIP Access Ticket", type: "document", url: "https://tonjam.io/vip-burna-001", description: "Virtual show VIP access pass." }
    ]
  },
  {
    id: "n2",
    trackId: "tr-3",
    title: "Free Mind: Rebel Vibes Gold #042",
    owner: "UQDa_SarahJ_Collector_x9y1_7384",
    ownerId: "u2",
    creator: "Tems",
    artist: "Tems",
    artistId: "tems",
    price: "45",
    imageUrl: "/src/assets/images/tonjam_cover_type_1782827384693.jpg",
    coverUrl: "/src/assets/images/tonjam_cover_type_1782827384693.jpg",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3",
    edition: "Limited Gold",
    supply: 100,
    minted: 42,
    isAuction: false,
    listingType: "fixed",
    floorPriceChange: -2.1,
    contractAddress: "EQD_FreeMind_Tems_Gold_0042_Y",
    royaltySplits: [
      { address: "UQA_Tems_Rebel_Vibes_9999", percentage: 0.10, label: "Creator" }
    ],
    stems_available: false,
    artistVerified: true,
    description: "Limited series of Free Mind by Tems. Unlocking exclusive behind the scenes recording videos and acoustic versions.",
    traits: [
      { trait_type: "Edition", value: "Gold Series" },
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "BPM", value: 92 },
      { trait_type: "Scale", value: "C Minor" }
    ],
    attributes: [
      { trait_type: "Edition", value: "Gold Series" },
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "BPM", value: 92 },
      { trait_type: "Scale", value: "C Minor" }
    ],
    history: [
      { event: "Minted", from: "0x0000000000000000000000000000000000000000", to: "Tems", date: "2026-07-01T08:00:00Z" },
      { event: "Purchased", from: "Tems", to: "UQDa_SarahJ_Collector_x9y1_7384", date: "2026-07-02T16:45:00Z", price: "45" }
    ],
    offers: []
  },
  {
    id: "n3",
    trackId: "tr-4",
    title: "Lonely At The Top: Mr. Money VIP #007",
    owner: "UQCc_DJ_Krupy_Vibez_x9y1_8888",
    ownerId: "u1",
    creator: "Asake",
    artist: "Asake",
    artistId: "asake",
    price: "80",
    imageUrl: "/src/assets/images/tonjam_cover_city_1782827373498.jpg",
    coverUrl: "/src/assets/images/tonjam_cover_city_1782827373498.jpg",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3",
    edition: "Rare VIP",
    supply: 10,
    minted: 7,
    isAuction: false,
    listingType: "fixed",
    floorPriceChange: 8.7,
    contractAddress: "EQD_LonelyTop_Asake_VIP_0007_Z",
    royaltySplits: [
      { address: "UQAsake_p3q9_r7t8", percentage: 0.12, label: "Creator" }
    ],
    stems_available: true,
    artistVerified: true,
    description: "Rare collector series of Lonely At The Top. Unlocks a lifetime 15% discount on all Asake physical tours tickets globally.",
    traits: [
      { trait_type: "Edition", value: "VIP Series" },
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "BPM", value: 115 },
      { trait_type: "Scale", value: "G# Minor" }
    ],
    attributes: [
      { trait_type: "Edition", value: "VIP Series" },
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "BPM", value: 115 },
      { trait_type: "Scale", value: "G# Minor" }
    ],
    history: [
      { event: "Minted", from: "0x0000000000000000000000000000000000000000", to: "Asake", date: "2026-07-05T09:00:00Z" },
      { event: "Purchased", from: "Asake", to: "UQCc_DJ_Krupy_Vibez_x9y1_8888", date: "2026-07-06T11:20:00Z", price: "80" }
    ],
    offers: []
  },
  {
    id: "n4",
    trackId: "tr-5",
    title: "Solar Pulse: Genesis Edition #001",
    owner: "UQA_AlexRivera_Prod_m5n6_z2w3",
    ownerId: "u3",
    creator: "DJ Krupy",
    artist: "DJ Krupy",
    artistId: "dj-krupy",
    price: "12",
    imageUrl: "https://image.pollinations.ai/prompt/music%20nft%20Solar%20Pulse%20Genesis%20Mythic%20Rare?width=600&height=600&nologo=true",
    coverUrl: "https://image.pollinations.ai/prompt/music%20nft%20Solar%20Pulse%20Genesis%20Mythic%20Rare?width=600&height=600&nologo=true",
    audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/bgm_gui.mp3",
    edition: "Unique",
    supply: 1,
    minted: 1,
    isAuction: false,
    listingType: "fixed",
    floorPriceChange: 5.4,
    contractAddress: "EQD4FP_S54FpX9y1_X9y1_X9y1_X9y1_X9y1_X9y1_X9y1_P",
    royaltySplits: [{ address: "UQCc_DJ_Krupy_Vibez_x9y1_8888", percentage: 0.15 }],
    stems_available: true,
    artistVerified: true,
    description: "The first ever unique edition of Solar Pulse. Includes high-fidelity stem access and a VIP pass to the upcoming Krupy Vibez virtual concert.",
    traits: [
      { trait_type: "Bitrate", value: "FLAC" },
      { trait_type: "Scale", value: "C# Minor" },
      { trait_type: "Access", value: "VIP Stems" },
      { trait_type: "Rarity", value: "Mythic" }
    ],
    attributes: [
      { trait_type: "Bitrate", value: "FLAC" },
      { trait_type: "Scale", value: "C# Minor" },
      { trait_type: "Access", value: "VIP Stems" },
      { trait_type: "Rarity", value: "Mythic" }
    ],
    history: [
      { event: "Minted", from: "0x000...000", to: "DJ Krupy", date: "2023-10-01" },
      { event: "Sale", from: "DJ Krupy", to: "UQA_AlexRivera_Prod_m5n6_z2w3", date: "2023-10-02", price: "12" }
    ],
    offers: []
  }
];

export const mockNFTTracks = mockNFTs;
