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
      // Logic for real TON addresses in the prototype
      if (nftIdOrAddress && (nftIdOrAddress.startsWith('EQ') || nftIdOrAddress.startsWith('UQ'))) {
        return {
          ...MOCK_NFTS[0],
          id: `onchain-${nftIdOrAddress}`,
          contractAddress: nftIdOrAddress,
          title: `On-Chain Audio Asset ${nftIdOrAddress.slice(0, 4)}...${nftIdOrAddress.slice(-4)}`,
          owner: 'TON Blockchain',
          price: '0.0',
          history: [
            { event: 'Minted', from: 'System', to: 'Vault', date: '2026-05-16' }
          ]
        };
      }
      console.warn(`NFT with ID or Address ${nftIdOrAddress} not found`);
      return null;
    }
    
    return nft;
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    return null;
  }
};
