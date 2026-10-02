import React from 'react';
import { NFTItem } from '@/types';
import { FloorPriceChart } from '@/components/FloorPriceChart';

interface ArtistNFTVolumeFloorChartProps {
  nfts: NFTItem[];
  artistId?: string;
  artistName?: string;
}

export const ArtistNFTVolumeFloorChart: React.FC<ArtistNFTVolumeFloorChartProps> = ({ nfts, artistName }) => {
  const chartData = React.useMemo(() => {
    if (!nfts || nfts.length === 0) {
      return [
        { date: 'Mon', price: 10 },
        { date: 'Tue', price: 12 },
        { date: 'Wed', price: 11 },
        { date: 'Thu', price: 15 },
        { date: 'Fri', price: 14 },
        { date: 'Sat', price: 18 },
        { date: 'Sun', price: 20 },
      ];
    }
    return nfts.slice(0, 7).map((nft, idx) => ({
      date: `NFT #${idx + 1}`,
      price: parseFloat(nft.price || '10'),
    }));
  }, [nfts]);

  return (
    <FloorPriceChart
      data={chartData}
      title="NFT Market Floor & Volume"
      collectionName="Artist Collection Analytics"
    />
  );
};

export default ArtistNFTVolumeFloorChart;
