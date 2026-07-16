import { Collection } from "../types";

export const mockCollections: Collection[] = [
  {
    id: "col-1",
    artistId: "burna-boy",
    name: "African Giant Series",
    description: "The primary high-fidelity on-chain collectibles line for Burna Boy's chart topping anthems.",
    coverUrl: "/src/assets/images/tonjam_cover_abstract_1782827351935.jpg",
    nftIds: ["n1"],
    createdAt: "2026-07-10T12:00:00Z"
  },
  {
    id: "col-2",
    artistId: "tems",
    name: "Rebel Soul Editions",
    description: "Exclusive vocal and lyric NFT cuts highlighting Tems' incredible soul and afrobeats performance catalog.",
    coverUrl: "/src/assets/images/tonjam_cover_type_1782827384693.jpg",
    nftIds: ["n2"],
    createdAt: "2026-07-01T08:00:00Z"
  },
  {
    id: "col-3",
    artistId: "dj-krupy",
    name: "Solar Pulse LP Series",
    description: "The official cyber-visual digital music asset releases by independent legend DJ Krupy on TON.",
    coverUrl: "https://image.pollinations.ai/prompt/music%20nft%20Solar%20Pulse%20Genesis%20Mythic%20Rare?width=600&height=600&nologo=true",
    nftIds: ["n4"],
    createdAt: "2023-10-01T00:00:00Z"
  }
];
