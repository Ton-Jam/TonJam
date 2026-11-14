import React, { useState, useEffect } from 'react';
import { X, History, ArrowRightLeft, Wand2, Handshake, ExternalLink, Copy, Check, Clock, Wallet, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NFTItem, NFTHistory } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';
import { TON_LOGO } from '@/constants';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

interface NFTTransactionHistoryModalProps {
  nft: NFTItem;
  isOpen: boolean;
  onClose: () => void;
}

export const NFTTransactionHistoryModal: React.FC<NFTTransactionHistoryModalProps> = ({ nft, isOpen, onClose }) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<NFTHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const loadHistory = async () => {
      if (nft.history && nft.history.length > 0) {
        if (isMounted) setHistoryItems(nft.history);
        return;
      }

      setLoading(true);
      try {
        const salesQuery = query(collection(db, 'nftSales'), where('nftId', '==', nft.id));
        const snap = await getDocs(salesQuery);
        if (!isMounted) return;

        const mapped: NFTHistory[] = snap.docs
          .map((d) => {
            const data = d.data() as Record<string, any>;
            const ts = data.timestamp || data.createdAt || Date.now();
            return {
              event: data.type || 'Sold',
              from: data.seller || data.from || 'Creator',
              to: data.buyer || data.to || nft.owner || 'Collector',
              date: new Date(typeof ts === 'number' ? ts : Date.now()).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }),
              price: data.price ? String(data.price) : undefined,
              _ts: typeof ts === 'number' ? ts : 0
            };
          })
          .sort((a, b) => b._ts - a._ts)
          .map(({ _ts, ...rest }) => rest);

        setHistoryItems(mapped);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'nftSales');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [isOpen, nft]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-3">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal body container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-zinc-950/95 text-white rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col scrollbar-none"
        >
          {/* Top Header Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                <History className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-100">Ledger History</h2>
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">TON Blockchain Ledger</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* NFT Header details card */}
          <div className="bg-white/[0.02] p-4 rounded-2xl flex items-center gap-4 mb-6">
            <img
              src={nft.imageUrl || nft.coverUrl || getPlaceholderImage(`nft-${nft.id}`)}
              alt={nft.title}
              className="w-16 h-16 object-cover rounded-xl bg-zinc-900"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-100 truncate">{nft.title}</h3>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Edition {nft.edition}</p>
              
              <div className="flex items-center gap-1.5 mt-2">
                <img src={TON_LOGO} className="w-3 h-3" alt="TON" />
                <span className="text-xs font-black text-blue-400">{nft.price || '0'} TON</span>
              </div>
            </div>
          </div>

          {/* Ledger History List Section */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[40vh] no-scrollbar">
            {loading ? (
              <div className="py-10 text-center text-xs text-zinc-400">
                Loading on-chain ledger history...
              </div>
            ) : historyItems.length === 0 ? (
              <div className="py-10 text-center space-y-1">
                <p className="text-xs font-bold text-zinc-300">No recorded ledger events yet</p>
                <p className="text-[11px] text-zinc-500">Sales and transfers for this NFT will appear here once recorded.</p>
              </div>
            ) : (
              historyItems.map((item, index) => {
                const eventId = `event-${index}`;
                const isMint = item.event.toLowerCase() === 'minted';
                const isTransfer = item.event.toLowerCase() === 'transfer';
                const isSold = item.event.toLowerCase() === 'sold';

                return (
                  <div key={index} className="bg-white/[0.015] p-4 rounded-2xl flex items-start gap-4 transition-all hover:bg-white/[0.03]">
                    {/* Event Indicator Icon */}
                    <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                      isMint ? 'bg-blue-500/10 text-blue-400' :
                      isTransfer ? 'bg-purple-500/10 text-purple-400' :
                      isSold ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {isMint ? <Wand2 className="h-4.5 w-4.5" /> :
                       isTransfer ? <ArrowRightLeft className="h-4.5 w-4.5" /> :
                       isSold ? <Handshake className="h-4.5 w-4.5" /> :
                       <Wallet className="h-4.5 w-4.5" />}
                    </div>

                    {/* Transaction info block */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-200">{item.event}</span>
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{item.date}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-zinc-500">
                        <span>From:</span>
                        <button 
                          onClick={() => handleCopy(item.from, `${eventId}-from`)}
                          className="text-zinc-400 hover:text-blue-400 font-medium cursor-pointer flex items-center gap-1"
                        >
                          {item.from === 'Vault' ? 'GENESIS' : (item.from.length > 15 ? `${item.from.slice(0, 6)}...${item.from.slice(-4)}` : item.from)}
                          {copiedAddress === `${eventId}-from` ? <Check className="h-2 w-2 text-emerald-400" /> : <Copy className="h-2 w-2 opacity-50" />}
                        </button>
                        <span className="opacity-50">→</span>
                        <span>To:</span>
                        <button 
                          onClick={() => handleCopy(item.to, `${eventId}-to`)}
                          className="text-zinc-400 hover:text-blue-400 font-medium cursor-pointer flex items-center gap-1"
                        >
                          {item.to.length > 15 ? `${item.to.slice(0, 6)}...${item.to.slice(-4)}` : item.to}
                          {copiedAddress === `${eventId}-to` ? <Check className="h-2 w-2 text-emerald-400" /> : <Copy className="h-2 w-2 opacity-50" />}
                        </button>
                      </div>

                      {item.price && (
                        <div className="flex items-center gap-1">
                          <img src={TON_LOGO} className="w-2.5 h-2.5" alt="TON" />
                          <span className="text-[10px] font-black text-zinc-300">{item.price} TON</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Dynamic Blockchain explorer reference link */}
          {nft.contractAddress && (
            <div className="mt-6 pt-4 text-center">
              <a
                href={`https://tonviewer.com/${nft.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-all cursor-pointer"
              >
                Verify Ledger on TON Viewer <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
