import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Tag } from 'lucide-react';
import { NFTPreviewData } from './types';

interface NFTNotificationPreviewProps {
  preview: NFTPreviewData;
  onViewNFT?: () => void;
}

export const NFTNotificationPreview: React.FC<NFTNotificationPreviewProps> = ({
  preview,
  onViewNFT,
}) => {
  const navigate = useNavigate();

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewNFT) {
      onViewNFT();
      return;
    }
    if (preview.nftId) {
      navigate(`/nft/${preview.nftId}`);
    } else {
      navigate('/marketplace');
    }
  };

  const getEventBadge = () => {
    switch (preview.event) {
      case 'bid':
        return {
          label: preview.amountTon ? `Top Bid: ${preview.amountTon} TON` : 'New Bid Placed',
          color: 'text-[#9B7CFF] bg-[#9B7CFF]/15 border-[#9B7CFF]/20',
        };
      case 'sale':
        return {
          label: preview.amountTon ? `Sold for ${preview.amountTon} TON` : 'Sale Confirmed',
          color: 'text-[#34D399] bg-[#34D399]/15 border-[#34D399]/20',
        };
      case 'outbid':
        return {
          label: preview.amountTon ? `Outbid: ${preview.amountTon} TON` : 'Outbid Alert',
          color: 'text-[#FFC857] bg-[#FFC857]/15 border-[#FFC857]/20',
        };
      case 'minted':
        return {
          label: preview.amountTon ? `Mint: ${preview.amountTon} TON` : 'New Mint',
          color: 'text-[#229ED9] bg-[#229ED9]/15 border-[#229ED9]/20',
        };
      default:
        return {
          label: preview.amountTon ? `${preview.amountTon} TON` : 'NFT Market Event',
          color: 'text-[#9B7CFF] bg-[#9B7CFF]/15 border-[#9B7CFF]/20',
        };
    }
  };

  const badge = getEventBadge();

  return (
    <div className="mt-2 w-full flex items-center justify-between p-2 rounded-xl bg-[#080D1A]/70 hover:bg-[#080D1A] transition-colors border border-white/[0.04]">
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#16243E] border border-white/[0.04]">
          <img
            src={
              preview.thumbnailUrl ||
              'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&fit=crop&q=80'
            }
            alt={preview.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-[#F5F7FB] truncate leading-tight">
            {preview.title}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${badge.color}`}
            >
              {badge.label}
            </span>
            {preview.txHash && (
              <span className="text-[10px] text-[#94A3B8] font-mono truncate">
                {preview.txHash}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleAction}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-[#F5F7FB] bg-[#9B7CFF]/20 hover:bg-[#9B7CFF]/30 text-[#9B7CFF] hover:text-white transition-all cursor-pointer active:scale-95 shrink-0"
      >
        <span>View</span>
        <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  );
};

export default NFTNotificationPreview;
