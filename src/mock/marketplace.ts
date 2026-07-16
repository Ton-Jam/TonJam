import { Listing, NFTItem } from "../types";
import { mockNFTs } from "./nftTracks";

export const mockListings: Listing[] = [
  {
    id: "lst-1",
    nftId: "n1",
    nftAddress: "EQD_CityBoys_Burna_Giant_0000_X",
    sellerId: "burna-boy",
    price: "125",
    status: "active",
    createdAt: "2026-07-11T14:30:00Z",
    updatedAt: "2026-07-11T14:30:00Z"
  },
  {
    id: "lst-2",
    nftId: "n2",
    nftAddress: "EQD_FreeMind_Tems_Gold_0042_Y",
    sellerId: "tems",
    price: "45",
    status: "sold",
    buyerId: "u2",
    createdAt: "2026-07-02T08:00:00Z",
    updatedAt: "2026-07-02T16:45:00Z"
  },
  {
    id: "lst-3",
    nftId: "n3",
    nftAddress: "EQD_LonelyTop_Asake_VIP_0007_Z",
    sellerId: "asake",
    price: "80",
    status: "active",
    createdAt: "2026-07-06T11:20:00Z",
    updatedAt: "2026-07-06T11:20:00Z"
  }
];

export const mockMarketplaceNFTs: NFTItem[] = mockNFTs;

export const mockStats = {
  totalVolumeTON: 84500,
  floorPriceTON: 3.2,
  listedCount: 142,
  volumeChange24h: 12.4
};
