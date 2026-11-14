import React, { useState, useEffect } from 'react';
import { Zap, Tag, Coins, Award, ArrowUpRight, ShieldCheck, Play, Pause, Send, Check, Loader2, History, ArrowRight, ExternalLink, Calendar, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, LayoutGroup } from 'motion/react';
import { LibraryNFT } from '../types';
import { useAudio } from '@/contexts/AudioContext';
import { useToast } from '@/components/layout/ToastProvider';
import { useNFT } from '@/contexts/NFTContext';
import { db, OperationType, handleFirestoreError } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getPlaceholderImage } from '@/lib/utils';

interface NFTCollectionProps {
  nfts: LibraryNFT[];
  totalFloorValue: number;
  layout?: 'grid' | 'list';
}

export const NFTCollection: React.FC<NFTCollectionProps> = ({ nfts, totalFloorValue, layout = 'list' }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentTrack, isPlaying, playTrack, togglePlay, userProfile } = useAudio();
  const { nfts: providerNfts } = useNFT();

  // Map provider NFTs into LibraryNFT format
  const mappedProviderNfts: LibraryNFT[] = providerNfts.map(item => ({
    id: item.id,
    tokenId: item.edition || '#001',
    title: item.title,
    artist: item.artist || item.creator || 'Unknown Artist',
    coverUrl: item.coverUrl || item.imageUrl || getPlaceholderImage(`nft-${item.id}`),
    collectionName: (item as any).collectionName || 'TON Music NFT',
    floorPriceTon: parseFloat(String(item.price || '0')) || 0,
    royaltyPercent: item.royaltySplits?.[0]?.percentage || 0,
    rarity: (item.rarity as any) || 'Common',
    ownerAddress: item.owner || userProfile?.walletAddress || '',
    musicFileUrl: item.audioUrl || ''
  }));

  // Combine prop nfts and provider nfts uniquely by id
  const displayNfts = Array.from(
    new Map([...nfts, ...mappedProviderNfts].map(item => [item.id, item])).values()
  );

  const displayTotalFloorValue = displayNfts.reduce((acc, nft) => acc + nft.floorPriceTon, 0);

  // State for NFT transfer
  const [transferringNft, setTransferringNft] = useState<LibraryNFT | null>(null);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [transferStep, setTransferStep] = useState<'idle' | 'preparing' | 'signing' | 'broadcasting' | 'confirming' | 'success'>('idle');

  // State for Transaction History Modal
  const [historyNft, setHistoryNft] = useState<LibraryNFT | null>(null);
  const [historyTxs, setHistoryTxs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const CURRENT_USER_WALLET = userProfile?.walletAddress || '';

  useEffect(() => {
    if (!historyNft) {
      setHistoryTxs([]);
      return;
    }
    let cancelled = false;
    setLoadingHistory(true);
    const loadHistory = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'transactions'), where('nftId', '==', historyNft.id)));
        if (!cancelled) {
          const rows = snap.docs.map((d) => {
            const data = d.data();
            const created = data.createdAt?.toDate ? data.createdAt.toDate() : null;
            return {
              id: d.id,
              type: data.type || 'transfer',
              from: data.fromAddress || data.sellerAddress || data.userId || '',
              to: data.toAddress || data.buyerAddress || '',
              price: data.amount ? String(data.amount) : null,
              date: created ? created.toLocaleDateString() : '',
              time: created ? created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              hash: data.txHash || data.hash || d.id,
            };
          });
          setHistoryTxs(rows);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'transactions');
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    };
    loadHistory();
    return () => { cancelled = true; };
  }, [historyNft]);

  const getRarityColor = (rarity: LibraryNFT['rarity']) => {
    switch (rarity) {
      case 'Legendary': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Epic': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Rare': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const handlePlayNFT = (nft: LibraryNFT, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nft.musicFileUrl) {
      toast.error('Audio Unavailable', 'This NFT does not have a playable audio stream attached.');
      return;
    }

    const contextTrack = {
      id: nft.id,
      title: nft.title,
      artist: nft.artist,
      coverUrl: nft.coverUrl || getPlaceholderImage(`nft-${nft.id}`),
      audioUrl: nft.musicFileUrl,
      duration: 0,
      streams: 0,
      playCount: 0,
      album: nft.collectionName
    };

    if (currentTrack?.id === nft.id) {
      togglePlay();
    } else {
      playTrack(contextTrack as any);
    }
  };

  const handleTransferConfirm = () => {
    if (!transferringNft || !destinationAddress.trim()) return;
    toast.error(
      'On-Chain Transfer Required',
      'Direct NFT transfers must be signed through a deployed NFT item contract on the NFT detail page.'
    );
  };

  return (
    <div className="space-y-4">
      {/* Mini NFT collection stats header */}
      <div className="bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-purple-500/10 rounded-[10px] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-purple-500 animate-pulse" />
            <h2 className="section-title">Music NFT Vault</h2>
          </div>
          <p className="text-[10px] text-muted-foreground max-w-sm">
            Decentralized audio artifacts secured on The Open Network (TON). Earn active royalty rewards.
          </p>
        </div>

        {/* Stats box */}
        <div className="flex items-center gap-6">
          <div className="space-y-0.5">
            <span className="text-[9px] text-muted-foreground uppercase font-mono font-bold tracking-wider">Owned NFTs</span>
            <p className="text-base font-black text-purple-400 font-mono leading-none">{displayNfts.length} Items</p>
          </div>
          <div className="h-8 w-[1px] bg-purple-500/10" />
          <div className="space-y-0.5">
            <span className="text-[9px] text-muted-foreground uppercase font-mono font-bold tracking-wider">Est. Vault Value</span>
            <p className="text-base font-black text-amber-400 font-mono leading-none flex items-center gap-1">
              <Coins className="w-4 h-4 shrink-0" />
              <span>{displayTotalFloorValue} TON</span>
            </p>
          </div>
        </div>
      </div>

      {/* Collectibles list or grid */}
      <LayoutGroup id="nfts-layout-group">
        <motion.div
          layout
          transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          className={layout === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}
        >
          {displayNfts.map((nft) => {
            const isCurrentPlaying = currentTrack?.id === nft.id && isPlaying;
            const isOwner = Boolean(CURRENT_USER_WALLET && nft.ownerAddress === CURRENT_USER_WALLET);

            return (
              <motion.div
                layout
                key={nft.id}
                transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                whileHover={layout === 'grid' ? { y: -4 } : { x: 4 }}
                className={
                  layout === 'grid'
                    ? "bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/5 dark:border-white/5 p-3 rounded-[10px] flex flex-col justify-between group relative transition-all duration-300 ease-out"
                    : "bg-white/[0.02] dark:bg-white/[0.02] bg-black/[0.02] border border-black/5 dark:border-white/5 p-3 rounded-[10px] flex flex-col md:flex-row md:items-center justify-between gap-4 group relative text-left transition-all duration-300 ease-out"
                }
              >
                {layout === 'grid' ? (
                  <>
                    {/* Cover art image */}
                    <motion.div 
                      layoutId={`nft-cover-${nft.id}`}
                      className="relative aspect-video w-full rounded-[10px] overflow-hidden mb-3.5 bg-slate-800"
                    >
                      <img src={nft.coverUrl} alt={nft.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      
                      {/* Floating play button on hover */}
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <button
                          onClick={(e) => handlePlayNFT(nft, e)}
                          className="p-3 bg-[#0052FF] hover:bg-[#0040D9] text-white rounded-full transition-transform transform scale-90 hover:scale-100 flex items-center justify-center cursor-pointer shadow-lg"
                        >
                          {isCurrentPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>
                      </div>

                      {/* Floating rarity & contract checks */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getRarityColor(nft.rarity)}`}>
                          {nft.rarity}
                        </span>
                        <span className="bg-black/60 text-emerald-400 p-1 rounded-full border border-emerald-500/10">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      {/* Floating History / Activity button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHistoryNft(nft);
                        }}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-purple-400 hover:text-purple-300 p-1.5 rounded-full cursor-pointer transition-colors z-10"
                        title="View Transaction History"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>

                      {/* Token ID */}
                      <span className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 text-[9px] font-mono font-bold rounded-md text-slate-300">
                        {nft.tokenId}
                      </span>
                    </motion.div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] text-purple-400 uppercase font-bold tracking-wider">{nft.collectionName}</span>
                          <span className="text-[8px] text-slate-400 font-mono">
                            {isOwner ? 'Owned' : `${nft.ownerAddress.substring(0, 6)}...`}
                          </span>
                        </div>
                        <motion.h4 
                          layoutId={`nft-title-${nft.id}`}
                          className="text-xs font-black text-foreground truncate"
                        >
                          {nft.title}
                        </motion.h4>
                        <p className="text-[10px] text-muted-foreground font-semibold">Artist: {nft.artist}</p>
                      </div>

                      {/* Price & Royalties specs */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/5 dark:border-white/5 text-[10px] font-mono">
                        <div className="space-y-0.5">
                          <span className="text-muted-foreground text-[8px] uppercase tracking-wider font-bold">Floor Price</span>
                          <p className="font-bold text-amber-400 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{nft.floorPriceTon} TON</span>
                          </p>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <span className="text-muted-foreground text-[8px] uppercase tracking-wider font-bold">Your Royalty</span>
                          <p className="font-bold text-indigo-400 flex items-center justify-end gap-1">
                            <Award className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span>{nft.royaltyPercent}% splits</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Direct action buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/nft/${nft.id}`)}
                        className="py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-[9px] font-bold uppercase tracking-widest rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Explore</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>

                      {isOwner ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTransferringNft(nft);
                            setDestinationAddress('');
                            setTransferStep('idle');
                          }}
                          className="py-2 bg-[#0052FF]/10 hover:bg-[#0052FF]/20 text-[#0052FF] text-[9px] font-bold uppercase tracking-widest rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="py-2 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-widest rounded-md flex items-center justify-center gap-1 opacity-75"
                        >
                          <Check className="w-3 h-3" />
                          <span>Sent</span>
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <motion.div 
                        layoutId={`nft-cover-${nft.id}`}
                        className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0 group/cover"
                      >
                        <img src={nft.coverUrl} alt={nft.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        
                        {/* Hover play button overlay for rows */}
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <button
                            onClick={(e) => handlePlayNFT(nft, e)}
                            className="p-1.5 bg-[#0052FF] text-white rounded-full flex items-center justify-center cursor-pointer"
                          >
                            {isCurrentPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                          </button>
                        </div>

                        <div className="absolute top-1 left-1">
                          <span className={`text-[6px] font-extrabold px-1 py-0.5 rounded-full uppercase tracking-wider border ${getRarityColor(nft.rarity)}`}>
                            {nft.rarity}
                          </span>
                        </div>
                      </motion.div>
                      <div className="min-w-0 text-left">
                        <span className="text-[8px] text-purple-400 uppercase font-bold tracking-wider block leading-none mb-0.5">{nft.collectionName}</span>
                        <motion.h4 
                          layoutId={`nft-title-${nft.id}`}
                          className="text-xs font-black text-foreground truncate leading-snug"
                        >
                          {nft.title}
                        </motion.h4>
                        <p className="text-[10px] text-muted-foreground font-semibold leading-none mt-1">
                          {nft.artist} • <span className="font-mono text-[9px]">{nft.tokenId}</span>
                        </p>
                        <p className="text-[8px] text-slate-400 font-mono mt-1">
                          {isOwner ? 'Status: Owned by You' : `Status: Sent to ${nft.ownerAddress.substring(0, 8)}...`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8 justify-between md:justify-end shrink-0">
                      <div className="hidden lg:grid grid-cols-2 gap-4 text-left font-mono mr-2">
                        <div className="space-y-0.5">
                          <span className="text-muted-foreground text-[8px] uppercase tracking-wider font-bold block leading-none">Floor Price</span>
                          <p className="font-bold text-amber-400 text-xs flex items-center gap-1 leading-none">
                            <Tag className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{nft.floorPriceTon} TON</span>
                          </p>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <span className="text-muted-foreground text-[8px] uppercase tracking-wider font-bold block leading-none">Your Royalty</span>
                          <p className="font-bold text-indigo-400 text-xs flex items-center justify-end gap-1 leading-none">
                            <Award className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span>{nft.royaltyPercent}%</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setHistoryNft(nft);
                          }}
                          className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 rounded-md transition-colors cursor-pointer"
                          title="View Transaction History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => navigate(`/nft/${nft.id}`)}
                          className="py-1.5 px-3 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Explore</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>

                        {isOwner ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTransferringNft(nft);
                              setDestinationAddress('');
                              setTransferStep('idle');
                            }}
                            className="py-1.5 px-3 bg-[#0052FF]/10 hover:bg-[#0052FF]/20 text-[#0052FF] text-[10px] font-bold uppercase tracking-widest rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="py-1.5 px-3 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-md flex items-center gap-1 opacity-75"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Transferred</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </LayoutGroup>

      {/* Transfer Modal Overlay */}
      {transferringNft && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-4 h-4 text-purple-400" />
                  <span>Transfer NFT Track</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold leading-tight">
                  Transferring track: <span className="text-purple-400">{transferringNft.title}</span> ({transferringNft.tokenId})
                </p>
              </div>
              
              <button 
                onClick={() => setTransferringNft(null)}
                className="text-slate-400 hover:text-white p-1 text-xs font-mono font-bold cursor-pointer"
                disabled={transferStep !== 'idle' && transferStep !== 'success'}
              >
                CLOSE
              </button>
            </div>

            {/* Steps progression */}
            {transferStep !== 'idle' ? (
              <div className="bg-slate-950 rounded-xl p-4 space-y-4 flex flex-col items-center justify-center text-center py-8">
                {transferStep === 'success' ? (
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl font-bold animate-bounce mb-2">
                    <Check className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center mb-2">
                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">
                    {transferStep === 'preparing' && 'Preparing Message Payload...'}
                    {transferStep === 'signing' && 'Awaiting Wallet Approval...'}
                    {transferStep === 'broadcasting' && 'Broadcasting to TON Blockchain...'}
                    {transferStep === 'confirming' && 'Waiting for Consensus Blocks...'}
                    {transferStep === 'success' && 'Transfer Confirmed!'}
                  </p>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                    {transferStep === 'preparing' && 'Connecting to local TON wallet provider and preparing contract call.'}
                    {transferStep === 'signing' && 'Please approve the transaction payload signature inside Tonkeeper.'}
                    {transferStep === 'broadcasting' && 'Broadcasting payload signature to TON testnet / mainnet nodes.'}
                    {transferStep === 'confirming' && 'Waiting for TON miners and validators to process the block.'}
                    {transferStep === 'success' && `NFT track was successfully sent. Recipient owns it now.`}
                  </p>
                </div>

                {transferStep === 'success' && (
                  <button
                    onClick={() => setTransferringNft(null)}
                    className="mt-4 px-6 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                )}
              </div>
            ) : (
              // Active form
              <div className="space-y-4">
                <div className="bg-slate-950 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <img src={transferringNft.coverUrl} className="w-12 h-12 rounded-md object-cover" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{transferringNft.title}</p>
                      <p className="text-[9px] text-purple-400 uppercase font-mono font-bold tracking-wider leading-none mt-1">{transferringNft.collectionName}</p>
                      <p className="text-[9px] text-slate-500 leading-none mt-1">Artist: {transferringNft.artist}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Sender Wallet Address</label>
                  <input
                    type="text"
                    readOnly
                    value={CURRENT_USER_WALLET}
                    className="w-full bg-slate-950 text-slate-500 text-xs px-3 py-2.5 rounded-lg select-all font-mono outline-none"
                  />
                  <span className="text-[8px] text-amber-500/70 font-semibold block leading-none">Your verified TON active wallet.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-300 uppercase font-bold tracking-wider block">Recipient TON Wallet Address</label>
                  <input
                    type="text"
                    required
                    placeholder="EQ... or UQ..."
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    className="w-full bg-slate-950 text-white text-xs px-3 py-2.5 rounded-lg font-mono outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <span className="text-[8px] text-slate-400 font-semibold block leading-none">Enter the recipient's target TON wallet address to initiate ownership split.</span>
                </div>

                {/* Estimate box */}
                <div className="bg-slate-950 rounded-xl p-3 flex justify-between items-center text-[10px] font-mono">
                  <div className="space-y-0.5">
                    <span className="text-slate-500 text-[8px] uppercase tracking-wider block font-bold">Estimated Network Fee</span>
                    <span className="text-amber-400 font-bold">0.05 TON</span>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <span className="text-slate-500 text-[8px] uppercase tracking-wider block font-bold">TON Blockchain</span>
                    <span className="text-slate-300">TON Jetton Standard</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!destinationAddress.trim()}
                  onClick={handleTransferConfirm}
                  className="w-full py-3 bg-[#0052FF] hover:bg-[#0040D9] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Transfer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction History Modal Overlay */}
      {historyNft && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-400" />
                  <span>On-Chain Transaction History</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold leading-tight">
                  TON ledger record for: <span className="text-purple-400">{historyNft.title}</span> ({historyNft.tokenId})
                </p>
              </div>
              
              <button 
                onClick={() => setHistoryNft(null)}
                className="text-slate-400 hover:text-white p-1 text-xs font-mono font-bold cursor-pointer"
              >
                CLOSE
              </button>
            </div>

            {/* NFT Small Detail Block */}
            <div className="bg-slate-950 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <img src={historyNft.coverUrl} className="w-12 h-12 rounded-md object-cover" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{historyNft.title}</p>
                  <p className="text-[9px] text-purple-400 uppercase font-mono font-bold tracking-wider leading-none mt-1">{historyNft.collectionName}</p>
                  <p className="text-[9px] text-slate-400 leading-none mt-1">Artist: {historyNft.artist}</p>
                </div>
              </div>
            </div>

            {/* List of Transactions */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {loadingHistory ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading transaction history...</div>
              ) : historyTxs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">No on-chain transactions recorded for this NFT yet.</div>
              ) : (
                historyTxs.map((tx) => (
                <div key={tx.id} className="bg-slate-950/40 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      tx.type === 'mint' ? 'bg-amber-500/10 text-amber-400' :
                      tx.type === 'sale' || tx.type === 'purchase' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {tx.type === 'mint' && <Coins className="w-4 h-4" />}
                      {(tx.type === 'sale' || tx.type === 'purchase') && <Tag className="w-4 h-4" />}
                      {tx.type !== 'mint' && tx.type !== 'sale' && tx.type !== 'purchase' && <Send className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-black text-white uppercase tracking-wider">
                        {tx.type === 'mint' ? 'On-Chain Mint' : tx.type === 'sale' || tx.type === 'purchase' ? 'Marketplace Sale' : 'Ownership Transfer'}
                      </p>
                      
                      <p className="text-[9px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                        <span className="text-slate-500">From:</span>
                        <span className="text-slate-300 font-semibold">{tx.from ? `${tx.from.substring(0, 8)}...` : '—'}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                        <span className="text-slate-500">To:</span>
                        <span className="text-slate-300 font-semibold">{tx.to ? `${tx.to.substring(0, 8)}...` : '—'}</span>
                      </p>

                      <p className="text-[8px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                        <span>Hash: {tx.hash.substring(0, 16)}...</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(tx.hash);
                            toast.success('Tx Hash Copied', 'Transaction ID saved to clipboard.');
                          }}
                          className="hover:text-slate-300 cursor-pointer p-0.5"
                        >
                          <Copy className="w-2.5 h-2.5" />
                        </button>
                      </p>
                    </div>
                  </div>

                  <div className="text-right self-end sm:self-center">
                    {tx.price && (
                      <p className="text-xs font-black text-amber-400 font-mono">
                        {tx.price} TON
                      </p>
                    )}
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{tx.date}</p>
                    <p className="text-[8px] text-slate-500 font-mono">{tx.time}</p>
                  </div>
                </div>
                ))
              )}
            </div>

            {/* Footer blockchain verification */}
            <div className="bg-slate-950 rounded-xl p-3 flex justify-between items-center text-[10px] font-mono">
              <div className="space-y-0.5">
                <span className="text-slate-500 text-[8px] uppercase tracking-wider block font-bold">Consensus Verified</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>On-Chain Status: Verified</span>
                </span>
              </div>
              <a 
                href="https://tonscan.org" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#0052FF] hover:underline flex items-center gap-1 text-[9px] uppercase font-bold"
              >
                <span>tonscan.org</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Primary marketplace CTA button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => navigate('/marketplace')}
          className="px-6 py-2.5 bg-[#0052FF] hover:bg-[#0040D9] text-white text-xs font-bold uppercase tracking-widest rounded-[10px] transition-all cursor-pointer flex items-center gap-2 shadow-lg"
        >
          <span>Open NFT Marketplace</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
