import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  FileCode,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Plus,
  RotateCcw,
  X,
  Play,
  Copy,
  Check,
  Sparkles,
  Clock,
  ShieldCheck,
  Disc,
  Info,
  Sliders,
  Layers
} from 'lucide-react';
import { useNFT, MintingStatus as MintingStatusType } from '@/contexts/NFTContext';
import { useAudio } from '@/contexts/AudioContext';
import { useNavigate } from 'react-router-dom';

interface MintingStatusProps {
  className?: string;
  showTitle?: boolean;
  compact?: boolean;
}

export const MintingStatus: React.FC<MintingStatusProps> = ({
  className = '',
  showTitle = true,
  compact = false
}) => {
  const navigate = useNavigate();
  const {
    mintingStatus,
    updateMintingStatus,
    removeMintingStatus,
    clearCompletedMints
  } = useNFT();
  const { addNotification, userProfile } = useAudio();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'failed'>('all');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Default sample pending mint if none exists in state so artist always sees a rich status UI
  useEffect(() => {
    const keys = Object.keys(mintingStatus);
    if (keys.length === 0) {
      // Seed a sample active mint request
      const sampleId = 'sample-mint-01';
      updateMintingStatus(sampleId, {
        trackId: sampleId,
        step: 'blockchain',
        progress: 72,
        message: 'Broadcasting Jetton mint transaction to TON Mainnet Ledger...',
        title: 'Cosmic Frequencies #01',
        artist: userProfile?.name || 'Verified Creator',
        coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
        txHash: 'EQD928f09238f4a18b76c5221e892c90a1f284e31100aa81',
        ipfsHash: 'ipfs://QmXp9z8Q7kY3vM2N1L5a9C4R8T1u6W3E2V5b7A1b8C9d',
        timestamp: Date.now() - 32000,
        price: '15.0 TON',
        editions: '1 of 1',
        royaltySplits: [
          { address: 'EQA...3821', percentage: 90 },
          { address: 'EQB...9910', percentage: 10 }
        ]
      });
    }
  }, []);

  const itemsList = Object.values(mintingStatus);

  const filteredItems = itemsList.filter((item) => {
    if (activeTab === 'active') {
      return item.step !== 'completed' && item.step !== 'error' && item.step !== 'idle';
    }
    if (activeTab === 'completed') {
      return item.step === 'completed';
    }
    if (activeTab === 'failed') {
      return item.step === 'error';
    }
    return true;
  });

  const activeCount = itemsList.filter(
    (i) => i.step !== 'completed' && i.step !== 'error' && i.step !== 'idle'
  ).length;
  const completedCount = itemsList.filter((i) => i.step === 'completed').length;
  const failedCount = itemsList.filter((i) => i.step === 'error').length;

  // Handler to copy hashes
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addNotification('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handler to trigger simulated mint
  const handleSimulateMint = () => {
    const newId = `mint-sim-${Date.now()}`;
    const titles = [
      'Neon Sunset Serenade',
      'Quantum Rhythm Vol. II',
      'Aether Waves - Genesis',
      'Hyperdrive Echoes'
    ];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    updateMintingStatus(newId, {
      trackId: newId,
      step: 'uploading',
      progress: 15,
      message: 'Uploading 24-bit audio stems & hi-res artwork to IPFS Gateway...',
      title: randomTitle,
      artist: userProfile?.name || 'Verified Artist',
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
      timestamp: Date.now(),
      price: `${(Math.random() * 20 + 5).toFixed(1)} TON`,
      editions: '1 of 10'
    });

    addNotification(`Started live mint simulation for "${randomTitle}"`, 'info');

    // Simulate Step 1 -> Step 2
    setTimeout(() => {
      updateMintingStatus(newId, {
        step: 'metadata',
        progress: 45,
        message: 'Formatting TEP-64 JSON metadata & configuring royalty contract...',
        ipfsHash: `ipfs://Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 10)}`
      });
    }, 3500);

    // Simulate Step 2 -> Step 3
    setTimeout(() => {
      updateMintingStatus(newId, {
        step: 'blockchain',
        progress: 75,
        message: 'Broadcasting smart contract transaction to TON Mainnet...',
        txHash: `EQ${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      });
    }, 7000);

    // Simulate Step 3 -> Step 4 / Complete
    setTimeout(() => {
      updateMintingStatus(newId, {
        step: 'completed',
        progress: 100,
        message: 'NFT successfully minted & indexed on TonJam marketplace!'
      });
      addNotification(`Minting completed for "${randomTitle}"! 💎`, 'success');
    }, 11000);
  };

  const toggleExpand = (trackId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [trackId]: !prev[trackId]
    }));
  };

  const getStepStatus = (
    currentStep: MintingStatusType['step'],
    targetStep: 'uploading' | 'metadata' | 'blockchain' | 'registering'
  ) => {
    const order = ['idle', 'uploading', 'metadata', 'blockchain', 'registering', 'completed'];
    const currentIndex = order.indexOf(currentStep);
    const targetIndex = order.indexOf(targetStep);

    if (currentStep === 'error') {
      return 'error';
    }
    if (currentIndex > targetIndex || currentStep === 'completed') {
      return 'completed';
    }
    if (currentIndex === targetIndex) {
      return 'in_progress';
    }
    return 'pending';
  };

  const STEPS_CONFIG = [
    {
      id: 'uploading' as const,
      label: 'IPFS Upload',
      description: 'Audio stem & artwork pinned to IPFS gateway',
      icon: UploadCloud
    },
    {
      id: 'metadata' as const,
      label: 'Metadata Creation',
      description: 'TEP-64 JSON schema & royalty splits formatted',
      icon: FileCode
    },
    {
      id: 'blockchain' as const,
      label: 'Blockchain Transaction',
      description: 'TON Jetton contract call broadcast to ledger',
      icon: Zap
    },
    {
      id: 'registering' as const,
      label: 'Collection Indexing',
      description: 'Verified & listed on TonJam marketplace',
      icon: CheckCircle2
    }
  ];

  return (
    <div className={`p-5 rounded-2xl bg-[#0A113A]/90 backdrop-blur-xl shadow-2xl relative overflow-hidden ${className}`}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                Minting Status
                {activeCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold animate-pulse">
                    {activeCount} Active
                  </span>
                )}
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Real-time tracking for pending NFT minting requests across decentralized storage & TON ledger.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSimulateMint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Simulate Test Mint
            </button>
            <button
              onClick={() => navigate('/upload-track')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Mint NFT
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 relative z-10">
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All ({itemsList.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            In Progress ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setActiveTab('failed')}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'failed'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Failed ({failedCount})
          </button>
        </div>

        {completedCount > 0 && (
          <button
            onClick={clearCompletedMints}
            className="text-[10px] text-zinc-400 hover:text-white font-bold uppercase tracking-wider flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-3 h-3" /> Clear Finished
          </button>
        )}
      </div>

      {/* Mint Requests List */}
      <div className="space-y-4 relative z-10">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] text-zinc-400">
            <Disc className="w-8 h-8 text-zinc-600 mx-auto mb-2 animate-spin-slow" />
            <p className="text-xs font-black uppercase tracking-wider text-zinc-300">
              No minting requests in this filter
            </p>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
              Start a new mint from the Creator Dashboard or run a test simulation to see live real-time pipeline steps.
            </p>
            <button
              onClick={handleSimulateMint}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider rounded-xl inline-flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" /> Start Test Mint
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = !!expandedItems[item.trackId];
            const isCompleted = item.step === 'completed';
            const isError = item.step === 'error';
            const isProcessing = !isCompleted && !isError;

            // Estimate seconds elapsed
            const elapsedSec = item.timestamp
              ? Math.floor((Date.now() - item.timestamp) / 1000)
              : 12;

            return (
              <motion.div
                key={item.trackId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] transition-all shadow-md group relative overflow-hidden"
              >
                {/* Top Item Summary Bar */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={
                          item.coverUrl ||
                          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80'
                        }
                        alt={item.title || 'NFT'}
                        className="w-12 h-12 rounded-xl object-cover shadow-lg"
                      />
                      {isProcessing && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full animate-ping" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-black uppercase tracking-wide text-white truncate">
                          {item.title || `Track #${item.trackId}`}
                        </h3>
                        {item.price && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-mono font-bold">
                            {item.price}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 font-medium truncate mt-0.5">
                        {item.artist || 'Creator'} • {item.editions || '1 Edition'}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge & Toggle Details */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isCompleted && (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Minted
                      </span>
                    )}
                    {isError && (
                      <span className="px-2.5 py-1 rounded-xl bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Failed
                      </span>
                    )}
                    {isProcessing && (
                      <span className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> In Progress ({item.progress}%)
                      </span>
                    )}

                    <button
                      onClick={() => toggleExpand(item.trackId)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all active:scale-95"
                      title="Toggle Detailed Pipeline Steps"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Main Progress Bar */}
                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 mb-1">
                    <span className="truncate pr-2 text-zinc-300">{item.message}</span>
                    <span className="shrink-0 font-mono text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" /> {elapsedSec}s
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isError
                          ? 'bg-red-500'
                          : isCompleted
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                {/* Steps Visual Tracker Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  {STEPS_CONFIG.map((step) => {
                    const status = getStepStatus(item.step, step.id);
                    const StepIcon = step.icon;

                    let bgClass = 'bg-white/[0.02] text-zinc-500';
                    let iconColor = 'text-zinc-600';
                    let statusLabel = 'Pending';

                    if (status === 'completed') {
                      bgClass = 'bg-emerald-500/10 text-emerald-300';
                      iconColor = 'text-emerald-400';
                      statusLabel = 'Done';
                    } else if (status === 'in_progress') {
                      bgClass = 'bg-blue-600/20 text-blue-300 animate-pulse';
                      iconColor = 'text-cyan-400';
                      statusLabel = 'Active';
                    } else if (status === 'error') {
                      bgClass = 'bg-red-500/10 text-red-400';
                      iconColor = 'text-red-400';
                      statusLabel = 'Error';
                    }

                    return (
                      <div
                        key={step.id}
                        className={`p-2.5 rounded-xl transition-all flex flex-col justify-between ${bgClass}`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <StepIcon className={`w-4 h-4 ${iconColor}`} />
                          <span className="text-[9px] font-black uppercase tracking-wider">
                            {statusLabel}
                          </span>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-tight truncate text-white">
                            {step.label}
                          </div>
                          {!compact && (
                            <div className="text-[8px] text-zinc-400 truncate mt-0.5">
                              {step.description}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expandable Technical Details & Hashes */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-3 space-y-3"
                    >
                      {/* Hashes & CIDs */}
                      <div className="p-3 rounded-xl bg-black/40 space-y-2 text-[10px] font-mono">
                        {item.ipfsHash && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-zinc-400 uppercase font-bold shrink-0">
                              IPFS CID:
                            </span>
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="text-cyan-300 truncate">{item.ipfsHash}</span>
                              <button
                                onClick={() => handleCopy(item.ipfsHash!, `ipfs-${item.trackId}`)}
                                className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
                              >
                                {copiedKey === `ipfs-${item.trackId}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {item.txHash && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-zinc-400 uppercase font-bold shrink-0">
                              TON TX Hash:
                            </span>
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="text-blue-300 truncate">{item.txHash}</span>
                              <button
                                onClick={() => handleCopy(item.txHash!, `tx-${item.trackId}`)}
                                className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
                              >
                                {copiedKey === `tx-${item.trackId}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 text-zinc-400">
                          <span>Network Fee (Estimated):</span>
                          <span className="text-white font-bold">~0.05 TON ($0.28 USD)</span>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center justify-end gap-2">
                        {isError && (
                          <button
                            onClick={() => {
                              updateMintingStatus(item.trackId, {
                                step: 'uploading',
                                progress: 10,
                                message: 'Restarting minting pipeline...'
                              });
                              addNotification('Restarted minting request', 'info');
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95"
                          >
                            <RotateCcw className="w-3 h-3" /> Retry Mint
                          </button>
                        )}

                        {isProcessing && (
                          <button
                            onClick={() => {
                              updateMintingStatus(item.trackId, {
                                step: 'error',
                                message: 'Minting request paused by user.'
                              });
                              addNotification('Paused minting request', 'warning');
                            }}
                            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95"
                          >
                            Pause Request
                          </button>
                        )}

                        {item.txHash && (
                          <a
                            href={`https://tonviewer.com/transaction/${item.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95"
                          >
                            <ExternalLink className="w-3 h-3" /> TON Explorer
                          </a>
                        )}

                        <button
                          onClick={() => removeMintingStatus(item.trackId)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95"
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MintingStatus;
