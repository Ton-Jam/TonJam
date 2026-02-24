import React, { useState, useMemo } from 'react';
import { TON_LOGO } from '../constants';
import { useAudio } from '../context/AudioContext';
import { NFTItem } from '../types';

interface SellNFTModalProps {
  nft: NFTItem;
  onClose: () => void;
}

const DURATIONS = [
  { label: '1 Day', value: '1' },
  { label: '3 Days', value: '3' },
  { label: '7 Days', value: '7' },
  { label: '30 Days', value: '30' },
];

const SellNFTModal: React.FC<SellNFTModalProps> = ({ nft, onClose }) => {
  const { addNotification } = useAudio();
  const [listingType, setListingType] = useState<'fixed' | 'auction'>(nft.listingType || 'fixed');
  const [price, setPrice] = useState(nft.price || '1.0');
  const [duration, setDuration] = useState('7');
  
  // Initialize times for detailed auction control
  const initialStart = new Date().toISOString().slice(0, 16);
  const initialEnd = nft.auctionEndTime 
    ? new Date(nft.auctionEndTime).toISOString().slice(0, 16)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [startTime, setStartTime] = useState(initialStart);
  const [endTime, setEndTime] = useState(initialEnd);
  const [isListing, setIsListing] = useState(false);

  const royaltyPercentage = nft.royalty || 5;
  const protocolFeePercentage = 2.5;

  const breakdown = useMemo(() => {
    const p = parseFloat(price) || 0;
    const royaltyAmount = (p * royaltyPercentage) / 100;
    const protocolFee = (p * protocolFeePercentage) / 100;
    const sellerProceeds = p - royaltyAmount - protocolFee;

    return {
      royalty: royaltyAmount.toFixed(2),
      fee: protocolFee.toFixed(2),
      proceeds: sellerProceeds.toFixed(2)
    };
  }, [price, royaltyPercentage]);

  const handleList = () => {
    if (parseFloat(price) <= 0) {
      addNotification("Set a valid price.", "info");
      return;
    }

    if (listingType === 'auction') {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      if (end <= start) {
        addNotification("End time must be after start time.", "error");
        return;
      }
    }

    setIsListing(true);
    addNotification("Broadcasting trade protocols...", "info");
    
    setTimeout(() => {
      setIsListing(false);
      const typeLabel = listingType === 'fixed' ? 'Fixed Price' : 'Auction';
      addNotification(`${typeLabel} configuration active for ${nft.title}.`, "success");
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose}></div>
      <div className="relative glass w-full max-w-sm rounded-2xl border border-blue-500/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6">
          <header className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter text-white">Asset Protocol</h2>
              <p className="text-[7px] font-black text-blue-400 uppercase tracking-[0.4em] mt-1">Manage Listing Parameters</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"><i className="fas fa-times text-xs"></i></button>
          </header>

          <div className="space-y-5">
            {/* Listing Type Toggle */}
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
              <button 
                onClick={() => setListingType('fixed')}
                className={`flex-1 py-2.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${listingType === 'fixed' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
              >
                Fixed Price
              </button>
              <button 
                onClick={() => setListingType('auction')}
                className={`flex-1 py-2.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${listingType === 'auction' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/30 hover:text-white'}`}
              >
                Auction
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
              <img src={nft.imageUrl} className="w-10 h-10 rounded-md object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-black uppercase text-white truncate">{nft.title}</p>
                <p className="text-[6px] font-black text-white/20 uppercase tracking-widest mt-0.5">Status: Ready for broadcast</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">
                {listingType === 'fixed' ? 'LISTING PRICE (TON)' : 'STARTING BID (TON)'}
              </label>
              <div className="relative">
                <img src={TON_LOGO} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" alt="" />
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`w-full bg-black border py-3.5 pl-12 pr-4 rounded-xl text-xl font-black text-white outline-none transition-all ${listingType === 'fixed' ? 'focus:border-blue-500 border-white/10' : 'focus:border-amber-500 border-white/10'}`}
                />
              </div>
            </div>

            {listingType === 'fixed' ? (
              <div className="space-y-2 animate-in fade-in duration-300">
                <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">LISTING DURATION</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value)}
                      className={`py-2 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all border ${
                        duration === d.value 
                          ? 'bg-blue-600 border-blue-400 text-white' 
                          : 'bg-white/5 border-white/5 text-white/30 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">START PROTOCOL</label>
                    <input 
                      type="datetime-local" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-black border border-white/10 p-2.5 rounded-xl text-[9px] font-black text-white outline-none focus:border-amber-500 transition-all uppercase"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">END PROTOCOL</label>
                    <input 
                      type="datetime-local" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-black border border-white/10 p-2.5 rounded-xl text-[9px] font-black text-white outline-none focus:border-amber-500 transition-all uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-black/50 rounded-xl p-4 border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-white/30">
                <span>Creator Royalty ({royaltyPercentage}%)</span>
                <span>-{breakdown.royalty}</span>
              </div>
              <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-white/30">
                <span>Network Protocol (2.5%)</span>
                <span>-{breakdown.fee}</span>
              </div>
              <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                <span className={`text-[8px] font-black uppercase tracking-widest ${listingType === 'fixed' ? 'text-blue-400' : 'text-amber-400'}`}>
                  {listingType === 'fixed' ? 'Estimated Proceeds' : 'Minimum Step'}
                </span>
                <span className="text-base font-black text-white">{breakdown.proceeds} TON</span>
              </div>
            </div>

            <button 
              onClick={handleList}
              disabled={isListing}
              className={`w-full py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${listingType === 'fixed' ? 'electric-blue-bg shadow-blue-500/20' : 'bg-amber-500 text-black shadow-amber-500/20'}`}
            >
              {isListing ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-satellite-dish"></i>}
              {isListing ? 'SYNCING PROTOCOL...' : 'UPDATE BROADCAST'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellNFTModal;