import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  History, 
  Database, 
  Cpu, 
  User, 
  ArrowRight, 
  Coins, 
  Clock, 
  Sparkles,
  Layers,
  Hash
} from 'lucide-react';
import { NFTItem, NFTHistory } from '@/types';
import { TON_LOGO, MOCK_ARTISTS } from '@/constants';
import { getPlaceholderImage } from '@/lib/utils';

interface NFTBlockchainMetadataProps {
  nft: NFTItem;
  className?: string;
}

export const NFTBlockchainMetadata: React.FC<NFTBlockchainMetadataProps> = ({ nft, className = '' }) => {
  const [activeTab, setActiveTab] = useState<'metadata' | 'provenance'>('metadata');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Derive Contract Address & Token ID
  const contractAddress = useMemo(() => {
    if (nft.contractAddress) return nft.contractAddress;
    // Generate deterministic contract address for mock TON NFT item
    const hash = nft.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `EQD${(hash * 987654321).toString(16).padEnd(36, 'a8f9b2c3d4e5')}`;
  }, [nft.contractAddress, nft.id]);

  const tokenId = useMemo(() => {
    // Generate token ID string
    const num = nft.id.replace(/\D/g, '') || '104';
    return `#${num.padStart(4, '0')}`;
  }, [nft.id]);

  const ipfsCid = useMemo(() => {
    if (nft.cid) return nft.cid;
    if (nft.ipfsUrl) return nft.ipfsUrl.replace('ipfs://', '');
    return `QmX${nft.id.toLowerCase()}9a8b7c6d5e4f3210123456789abcdef0`;
  }, [nft.cid, nft.ipfsUrl, nft.id]);

  // Derived provenance history list
  const ownerHistory = useMemo(() => {
    if (nft.history && nft.history.length > 0) {
      return nft.history;
    }

    // Default rich fallback ownership provenance trail
    const creatorName = nft.creator || 'DarkStar';
    const currentOwner = nft.owner || 'You (Vault)';

    return [
      {
        event: 'Current Owner',
        from: '0:9a8f...3d21',
        to: currentOwner,
        date: '2 hours ago',
        price: nft.price
      },
      {
        event: 'Secondary Sale',
        from: 'EQB3...7e91',
        to: '0:9a8f...3d21',
        date: '3 days ago',
        price: (parseFloat(nft.price) * 0.85).toFixed(1)
      },
      {
        event: 'Primary Transfer',
        from: creatorName,
        to: 'EQB3...7e91',
        date: '12 days ago',
        price: (parseFloat(nft.price) * 0.6).toFixed(1)
      },
      {
        event: 'Minted',
        from: 'Null Address (0x0)',
        to: creatorName,
        date: '1 month ago',
        price: '0.0'
      }
    ];
  }, [nft]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className={`bg-slate-900/60 backdrop-blur-xl rounded-[24px] p-5 space-y-4 shadow-xl ${className}`}>
      {/* Header Tabs - No border lines */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-xl">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-white">
            On-Chain Specification
          </span>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center p-1 bg-white/5 rounded-xl">
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'metadata'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Metadata
          </button>
          <button
            onClick={() => setActiveTab('provenance')}
            className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'provenance'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Owner History
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        {activeTab === 'metadata' ? (
          <motion.div
            key="metadata-tab"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="space-y-2.5"
          >
            {/* Token ID & Standard Row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-3 rounded-2xl space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Hash className="w-3 h-3 text-blue-400" /> Token ID
                </span>
                <p className="text-sm font-black font-mono text-white tracking-wider">
                  {tokenId}
                </p>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3 h-3 text-purple-400" /> Standard
                </span>
                <p className="text-sm font-black text-white tracking-tight">
                  TON NFT (TEP-62)
                </p>
              </div>
            </div>

            {/* Smart Contract Address */}
            <div className="bg-white/5 p-3 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-emerald-400" /> Contract Address
                </span>
                <a
                  href={`https://tonviewer.com/${contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  TON Explorer
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <div className="flex items-center justify-between gap-2 bg-slate-950/60 p-2 rounded-xl">
                <span className="text-xs font-mono text-slate-200 truncate">
                  {contractAddress}
                </span>
                <button
                  onClick={() => handleCopy(contractAddress, 'contract')}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all shrink-0"
                  title="Copy Contract Address"
                >
                  {copiedField === 'contract' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            {/* Decentralized Storage IPFS CID */}
            <div className="bg-white/5 p-3 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Database className="w-3 h-3 text-cyan-400" /> IPFS Content Hash
                </span>
                <a
                  href={`https://ipfs.io/ipfs/${ipfsCid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  Gateway
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <div className="flex items-center justify-between gap-2 bg-slate-950/60 p-2 rounded-xl">
                <span className="text-xs font-mono text-slate-300 truncate">
                  ipfs://{ipfsCid}
                </span>
                <button
                  onClick={() => handleCopy(`ipfs://${ipfsCid}`, 'ipfs')}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all shrink-0"
                  title="Copy IPFS URI"
                >
                  {copiedField === 'ipfs' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            {/* Creator Royalty & Network */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-3 rounded-2xl space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Creator Royalty
                </span>
                <p className="text-xs font-black font-mono text-emerald-400">
                  {nft.royalty ? `${nft.royalty}%` : '5.0% Secondary Fee'}
                </p>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Blockchain Network
                </span>
                <div className="flex items-center gap-1.5 text-xs font-black text-white">
                  <img src={TON_LOGO} alt="TON" className="w-3.5 h-3.5" />
                  TON Mainnet
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="provenance-tab"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Ownership Provenance Trail</span>
              <span className="font-mono text-blue-400">{ownerHistory.length} Events</span>
            </div>

            <div className="space-y-2">
              {ownerHistory.map((item, idx) => {
                const isFirst = idx === 0;
                return (
                  <div
                    key={`${item.event}-${idx}`}
                    className="bg-white/5 hover:bg-white/10 transition-all p-3 rounded-2xl flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isFirst ? 'bg-blue-600/30 text-blue-400' : 'bg-white/10 text-slate-400'
                      }`}>
                        {item.event.includes('Mint') ? (
                          <Sparkles className="w-4 h-4" />
                        ) : item.event.includes('Sale') ? (
                          <Coins className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white uppercase tracking-tight">
                            {item.event}
                          </span>
                          {isFirst && (
                            <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] font-black uppercase rounded-md">
                              Current
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 min-w-0">
                          <span className="truncate max-w-[80px] sm:max-w-[100px]">{item.from}</span>
                          <ArrowRight className="w-2.5 h-2.5 shrink-0 text-slate-500" />
                          <span className="truncate max-w-[80px] sm:max-w-[100px] text-slate-200 font-medium">{item.to}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {item.price && parseFloat(item.price) > 0 ? (
                        <div className="flex items-center justify-end gap-1 font-mono font-black text-xs text-white">
                          <span>{item.price}</span>
                          <span className="text-[9px] text-blue-400">TON</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">--</span>
                      )}
                      <div className="text-[9px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {item.date}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NFTBlockchainMetadata;
