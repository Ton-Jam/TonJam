import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, AlertOctagon, Wallet, ListPlus, Flame, Gift } from 'lucide-react';

export type ModalType = 'share' | 'report' | 'playlist' | 'wallet' | 'artistAction' | 'nftAction';

interface ModalConfig {
  type: ModalType;
  title: string;
  props?: any;
}

interface ModalContextType {
  openModal: (type: ModalType, title: string, props?: any) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<ModalConfig | null>(null);

  const openModal = useCallback((type: ModalType, title: string, props?: any) => {
    setActiveModal({ type, title, props });
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Shared inner modal renderer
  const renderModalContent = () => {
    if (!activeModal) return null;

    const { type, props } = activeModal;

    switch (type) {
      case 'share':
        return (
          <div className="space-y-4">
            <div className="flex justify-center py-2">
              <Share2 className="w-12 h-12 text-blue-400" />
            </div>
            <p className="text-xs text-center text-slate-400 leading-relaxed">
              Share this asset across Web3 social networks and get referral bonuses.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => { alert('Link Copied!'); closeModal(); }}
                className="py-2.5 px-4 bg-blue-500 hover:bg-blue-600 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
              >
                Copy Web3 Link
              </button>
              <button 
                onClick={closeModal}
                className="py-2.5 px-4 bg-[#1E2230] hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all active:scale-95"
              >
                Telegram Share
              </button>
            </div>
          </div>
        );

      case 'report':
        return (
          <div className="space-y-4">
            <div className="flex justify-center py-2">
              <AlertOctagon className="w-12 h-12 text-red-400" />
            </div>
            <p className="text-xs text-center text-slate-400 leading-relaxed">
              Report this content for copyright, explicit themes, or malicious metadata.
            </p>
            <textarea
              placeholder="Provide reason for this report..."
              className="w-full h-20 bg-[#1E2230] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={closeModal}
                className="py-2 px-4 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={() => { alert('Report Submitted'); closeModal(); }}
                className="py-2 px-4 bg-red-500 hover:bg-red-600 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
              >
                Submit Report
              </button>
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="space-y-4">
            <div className="flex justify-center py-2">
              <Wallet className="w-12 h-12 text-amber-400" />
            </div>
            <p className="text-xs text-center text-slate-400 leading-relaxed">
              Choose your Web3 gateway to connect to TonJam smart contracts.
            </p>
            <div className="space-y-2 pt-1">
              <button 
                onClick={() => { alert('Connected via TON Connect'); closeModal(); }}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>TON Connect UI</span>
              </button>
              <button 
                onClick={() => { alert('Connected via EVM Wallet'); closeModal(); }}
                className="w-full py-3 px-4 bg-[#1E2230] hover:bg-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-300 transition-all flex items-center justify-center gap-2"
              >
                <span>MetaMask / Injected EVM</span>
              </button>
            </div>
          </div>
        );

      case 'playlist':
        return (
          <div className="space-y-4">
            <div className="flex justify-center py-2">
              <ListPlus className="w-12 h-12 text-purple-400" />
            </div>
            <p className="text-xs text-center text-slate-400">
              Select or create a Playlist node to sync this frequency.
            </p>
            <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {['Sonic Waves', 'Cyberpunk Beats', 'DeFi Chill Lounge'].map((pl, idx) => (
                <button
                  key={idx}
                  onClick={() => { alert(`Added to ${pl}`); closeModal(); }}
                  className="w-full p-2.5 bg-[#1E2230] hover:bg-purple-950/40 hover:text-purple-300 rounded-xl text-left text-xs font-bold text-slate-200 transition-all"
                >
                  {pl}
                </button>
              ))}
            </div>
          </div>
        );

      case 'artistAction':
        return (
          <div className="space-y-4">
            <div className="flex justify-center py-2">
              <Gift className="w-12 h-12 text-emerald-400" />
            </div>
            <p className="text-xs text-center text-slate-400">
              Support this artist directly with TON tipping or verify their credentials.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => { alert('Tipped 1 TON!'); closeModal(); }}
                className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
              >
                Tip 1 TON
              </button>
              <button 
                onClick={() => { alert('Tipped 5 TON!'); closeModal(); }}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
              >
                Tip 5 TON
              </button>
            </div>
          </div>
        );

      case 'nftAction':
        return (
          <div className="space-y-4">
            <div className="flex justify-center py-2">
              <Flame className="w-12 h-12 text-rose-400 animate-pulse" />
            </div>
            <p className="text-xs text-center text-slate-400">
              Execute Web3 marketplace smart contract protocols.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => { alert('Bid Placed'); closeModal(); }}
                className="py-2.5 px-4 bg-rose-500 hover:bg-rose-600 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
              >
                Place Bid
              </button>
              <button 
                onClick={() => { alert('Mint Sequence Initiated'); closeModal(); }}
                className="py-2.5 px-4 bg-[#1E2230] hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all active:scale-95"
              >
                Mint NFT Edition
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      <AnimatePresence>
        {activeModal && (
          <>
            {/* Backdrop Blur Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 cursor-pointer"
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-full max-w-sm bg-[#0C0D14]/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl pointer-events-auto flex flex-col select-none"
              >
                {/* Header title */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#9AA0AE]">
                    {activeModal.title}
                  </h4>
                  <button
                    onClick={closeModal}
                    className="p-1 rounded-full bg-white/5 text-slate-400 hover:text-white transition-all active:scale-90"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar">
                  {renderModalContent()}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
export default ModalProvider;
