import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Disc, Layers, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NFTItem } from '@/types';
import { MOCK_ARTISTS, MOCK_USER } from '@/constants';

interface NFTQuickViewModalProps {
  nft: NFTItem;
  isOpen: boolean;
  onClose: () => void;
}

const NFTQuickViewModal: React.FC<NFTQuickViewModalProps> = ({ nft, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate data fetching delay
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen, nft.id]);

  if (!isOpen) return null;

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/nft/${nft.id}`);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl glass border border-white/10 bg-[#0a0a0a] rounded-[10px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[80vh] md:max-h-[600px] min-h-[400px]">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center absolute inset-0 z-10 bg-[#0a0a0a]">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest animate-pulse">Fetching Asset Data...</p>
          </div>
        ) : (
          <>
            {/* Left: Image */}
            <div className="w-full md:w-1/2 bg-neutral-900 relative">
              <img 
                src={nft.imageUrl || nft.coverUrl} 
                alt={nft.title} 
                className="w-full h-full object-cover animate-in fade-in duration-500"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                 <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-500 rounded-[4px] text-[8px] font-bold uppercase tracking-widest border border-amber-500/20">
                      {nft.edition}
                    </span>
                    {nft.isAuction && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-[4px] text-[8px] font-bold uppercase tracking-widest border border-purple-500/20">
                        Auction
                      </span>
                    )}
                 </div>
              </div>
            </div>

            {/* Right: Details */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white uppercase tracking-tighter leading-none mb-2">{nft.title}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                    Created by <span 
                      className="text-white hover:text-blue-400 hover:underline cursor-pointer inline-block"
                      onClick={(e) => {
                        e.stopPropagation();
                        const artist = MOCK_ARTISTS.find(a => a.name === nft.creator);
                        if (artist) {
                          navigate(`/artist/${artist.id}`);
                          onClose();
                        } else if (nft.creator === MOCK_USER.name) {
                          navigate('/profile');
                          onClose();
                        }
                      }}
                    >{nft.creator}</span>
                  </span>
                </div>
                
                <p className="text-xs text-white/60 leading-relaxed">
                  {nft.description || "No description provided for this asset."}
                </p>
              </div>

              {/* Traits Grid */}
              {nft.traits && nft.traits.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Layers className="h-3 w-3" /> Traits
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {nft.traits.slice(0, 4).map((trait, idx) => (
                      <div key={idx} className="bg-white/5 rounded-[5px] p-2 border border-white/5">
                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mb-0.5">{trait.trait_type}</p>
                        <p className="text-[10px] font-bold text-white uppercase truncate">{trait.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Current Price</p>
                    <p className="text-xl font-bold text-white tracking-tighter">{nft.price} TON</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Royalty</p>
                    <p className="text-sm font-bold text-white tracking-tighter">{nft.royalty}%</p>
                  </div>
                </div>

                <button 
                  onClick={handleViewFullDetails}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-[5px] font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  View Full Details <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NFTQuickViewModal;
