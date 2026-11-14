import { Collection, NFTItem } from "@/types";

export interface DetailedCollection extends Collection {
  volume: string;
  floorPrice: string;
  ownersCount: number;
  totalSupply: number;
  creatorName: string;
  verified: boolean;
  contractAddress: string;
  royaltyFee: string;
  bannerUrl: string;
  items: NFTItem[];
}

export const PRIMARY_COLLECTIONS: DetailedCollection[] = [];
