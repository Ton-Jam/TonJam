import { NFTItem } from '@/types';
import { MOCK_NFTS } from '@/constants';

/**
 * Simulates fetching NFT metadata from the blockchain or an API
 */
export const fetchNFTMetadata = async (nftIdOrAddress: string): Promise<NFTItem | null> => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find the NFT in our mock data
    const nft = MOCK_NFTS.find(n => n.id === nftIdOrAddress || n.contractAddress === nftIdOrAddress);
    
    if (!nft) {
      console.warn(`NFT with ID or Address ${nftIdOrAddress} not found`);
      return null;
    }
    
    return nft;
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    return null;
  }
};
