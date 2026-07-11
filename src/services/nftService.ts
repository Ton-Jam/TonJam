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

/**
 * Fetches floor price history for a given collection address over the last 30 days
 * Simulates data from TON blockchain
 */
export const fetchFloorPriceHistory = async (collectionAddress: string): Promise<{ date: string; price: number }[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // Generate 30 days of mock data
  const data = [];
  const now = new Date();
  
  // Base price for the collection (randomized for realism)
  // Seed based on address string length or content to be deterministic for the session
  const seed = collectionAddress.length * 10;
  let currentPrice = 5 + (seed % 15); 

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    // Random fluctuation (±3-5% daily)
    const daySeed = Math.sin(seed + i) * 10000;
    const fluctuation = (daySeed - Math.floor(daySeed) - 0.48) * 0.08; 
    currentPrice = Math.max(0.1, currentPrice * (1 + fluctuation));
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: parseFloat(currentPrice.toFixed(2))
    });
  }

  return data;
};
