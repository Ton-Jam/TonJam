import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Coins, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  X, 
  AlertTriangle, 
  RefreshCw,
  Info,
  Copy,
  Check,
  Users,
  ExternalLink,
  ArrowUpRight,
  Play,
  ShoppingBag,
  Disc,
  ArrowDownUp,
  Wallet as WalletIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAudio } from '@/contexts/AudioContext';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { TON_LOGO, JAM_PRICE_USD, TJ_COIN_ICON } from '@/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { TestnetHubModal } from '@/components/TestnetHubModal';
import { toast } from 'sonner';

const TON_PRICE_USD = 5.30;

const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const { 
    userProfile, 
    purchaseJAM, 
    subscribePremium, 
    transactions, 
    depositTON, 
    withdrawTON,
    recordTransaction,
    userNFTs,
    allTracks,
    playTrack
  } = useAudio();
  
  const safeTransactions = transactions || [];
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClaimingRoyalty, setIsClaimingRoyalty] = useState(false);
  const [copied, setCopied] = useState(false);
  const [unclaimedRoyalty, setUnclaimedRoyalty] = useState(0);
  const [currencyMode, setCurrencyMode] = useState<'CRYPTO' | 'USD'>('CRYPTO');
  const [isTestnetModalOpen, setIsTestnetModalOpen] = useState(false);
  
  // Modal state
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | null>(null);
  const [modalCurrency, setModalCurrency] = useState<'TON' | 'TJ'>('TON');
  const [amount, setAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState(userAddress || '');

  const jamPackages = [
    { id: 'p1', amount: '100', price: '1', label: 'Starter Pack' },
    { id: 'p2', amount: '500', price: '4.5', label: 'Pro Pack', popular: true },
    { id: 'p3', amount: '1200', price: '10', label: 'Elite Pack' },
  ];

  const handleCopyAddress = async (address: string) => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Wallet Address Copied', {
        description: `${address.substring(0, 10)}...${address.substring(address.length - 8)}`
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  // Fetch unclaimed royalties from Firestore
  useEffect(() => {
    const fetchRoyalties = async () => {
      if (auth.currentUser) {
        try {
          const royaltyRef = doc(db, 'royalties', auth.currentUser.uid);
          const snap = await getDoc(royaltyRef);
          if (snap.exists()) {
            setUnclaimedRoyalty(snap.data().unclaimedAmount || 0);
          }
        } catch (error) {
          console.error("Error reading creator royalties:", error);
        }
      }
    };
    fetchRoyalties();
  }, []);

  const handlePurchaseJAM = async (priceTon: string, jamAmount: string) => {
    setIsProcessing(true);
    try {
      await purchaseJAM(priceTon, jamAmount);
      toast.success(`Acquired ${jamAmount} TJ Coins!`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscribePremium = async () => {
    setIsProcessing(true);
    try {
      await subscribePremium("5");
      toast.success("Welcome to TonJam Premium! Lossless audio unlocked.");
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModalSubmit = async () => {
    if (!amount || Number(amount) <= 0) return;
    setIsProcessing(true);
    try {
      if (modalType === 'deposit') {
        if (modalCurrency === 'TON') {
          await depositTON(amount);
        }
      } else if (modalType === 'withdraw') {
        if (modalCurrency === 'TON') {
          if (!withdrawAddress) {
            toast.error("Please enter a withdrawal address");
            setIsProcessing(false);
            return;
          }
          await withdrawTON(amount, withdrawAddress);
        }
      }
      setModalType(null);
      setAmount('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaimRoyalty = async () => {
    if (unclaimedRoyalty <= 0) return;
    if (!userAddress) {
      toast.error("Please connect your TON wallet to claim accumulated royalties.");
      return;
    }

    setIsClaimingRoyalty(true);
    try {
      if (auth.currentUser) {
        const royaltyRef = doc(db, 'royalties', auth.currentUser.uid);
        await updateDoc(royaltyRef, {
          unclaimedAmount: 0,
          totalClaimed: increment(unclaimedRoyalty)
        });

        recordTransaction({
          type: 'nft_sale',
          amount: unclaimedRoyalty,
          platformFee: 0,
          artistShare: unclaimedRoyalty,
          recipientAddress: userAddress,
          senderAddress: "CREATOR_ROYALTY_POOL",
          trackTitle: `Creator Royalty Disbursed to TON Node`,
        });

        toast.success(`Claimed ${unclaimedRoyalty.toFixed(3)} TON into wallet!`);
        setUnclaimedRoyalty(0);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to release royalties. Connection error.");
    } finally {
      setIsClaimingRoyalty(false);
    }
  };

  // Shorten address format: EQ... or UQ...
  const formatShortAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 6)}`;
  };

  const rawTonVal = userProfile.tonBalance || 0;
  const rawTjVal = userProfile.tjBalance ?? userProfile.jamBalance ?? 0;
  const ownedNftsCount = userNFTs?.length || 0;

  return (
    <div className="w-full min-h-screen bg-[#080D1A] text-[#F5F7FB] pb-32 animate-in fade-in duration-500">
      {/* SCREEN HEADER */}
      <div className="sticky top-0 z-30 bg-[#080D1A]/90 backdrop-blur-xl px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-xs font-bold text-[#94A3B8] hover:text-white transition-colors cursor-pointer bg-[#111C30] px-3.5 py-2 rounded-xl"
            >
              Back
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                Wallet
              </h1>
              <p className="text-xs text-[#94A3B8] font-medium">
                Manage your TON, TJ balance, and music assets.
              </p>
            </div>
          </div>

          {/* Currency Toggle */}
          <div className="bg-[#111C30] p-1 rounded-xl flex items-center gap-1 shadow-md shadow-black/20">
            <button
              type="button"
              onClick={() => setCurrencyMode('CRYPTO')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currencyMode === 'CRYPTO'
                  ? 'bg-[#229ED9] text-white shadow-md shadow-[#229ED9]/25'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              TON / TJ
            </button>
            <button
              type="button"
              onClick={() => setCurrencyMode('USD')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currencyMode === 'USD'
                  ? 'bg-[#229ED9] text-white shadow-md shadow-[#229ED9]/25'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        {/* A. WALLET CONNECTION STATUS CARD */}
        <div className="rounded-2xl bg-[#111C30] p-5 sm:p-6 shadow-xl shadow-black/25 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#229ED9]/15 flex items-center justify-center text-[#229ED9] shrink-0">
                <img src={TON_LOGO} alt="TON" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                    TON Blockchain Connection
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    userAddress
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-zinc-700/50 text-zinc-300'
                  }`}>
                    {userAddress ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {userAddress ? 'Active TON Network Wallet' : 'Connect Your TON Wallet'}
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTestnetModalOpen(true)}
                className="px-3 py-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Testnet Faucet</span>
              </button>

              {userAddress ? (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await tonConnectUI.disconnect();
                      toast.info('Wallet disconnected');
                    } catch (e) {
                      console.warn(e);
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all cursor-pointer"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => tonConnectUI.openModal()}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#229ED9] hover:bg-[#168AC4] rounded-xl transition-all shadow-lg shadow-[#229ED9]/25 cursor-pointer flex items-center gap-2"
                >
                  <WalletIcon className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>

          {/* Connected Address Details & Quick Actions */}
          {userAddress ? (
            <div className="rounded-xl bg-[#0B1424] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                  Address:
                </span>
                <span className="font-mono text-xs text-white font-semibold">
                  {formatShortAddress(userAddress)}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyAddress(userAddress)}
                  className="p-1.5 text-[#94A3B8] hover:text-white bg-[#111C30] hover:bg-[#17243A] rounded-lg transition-all cursor-pointer"
                  title="Copy Address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <a
                  href={`https://tonviewer.com/${userAddress}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-1.5 text-[#229ED9] hover:text-[#5bc2ff] font-bold transition-colors cursor-pointer"
                >
                  <span>View on Explorer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-[#0B1424] p-4 text-xs text-[#94A3B8] leading-relaxed">
              Connect your TON wallet (Tonkeeper, MyTonWallet, Telegram Wallet) to hold native TON, purchase music NFTs, stream audio with real-time royalty mints, and collect TJ platform rewards.
            </div>
          )}
        </div>

        {/* B. BALANCES OVERVIEW (3 SEPARATE CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. TON Balance (Native Crypto) */}
          <div className="rounded-2xl bg-[#111C30] p-5 sm:p-6 shadow-xl shadow-black/25 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#229ED9] uppercase tracking-widest flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  <span>TON Native Crypto</span>
                </span>
                <span className="text-[9px] font-bold bg-[#229ED9]/10 text-[#229ED9] px-2 py-0.5 rounded-full">
                  On-Chain
                </span>
              </div>

              <div className="pt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white tracking-tight">
                    {currencyMode === 'USD'
                      ? `$${(rawTonVal * TON_PRICE_USD).toFixed(2)}`
                      : `${rawTonVal.toFixed(2)}`}
                  </span>
                  <span className="text-sm font-bold text-[#94A3B8]">
                    {currencyMode === 'USD' ? 'USD' : 'TON'}
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] font-medium mt-1">
                  {currencyMode === 'USD'
                    ? `≈ ${rawTonVal.toFixed(2)} TON`
                    : `≈ $${(rawTonVal * TON_PRICE_USD).toFixed(2)} USD (@ $${TON_PRICE_USD}/TON)`}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setModalCurrency('TON'); setModalType('deposit'); }}
                className="flex-1 py-2.5 bg-[#229ED9] hover:bg-[#168AC4] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-[#229ED9]/20"
              >
                Deposit
              </button>
              <button
                type="button"
                onClick={() => { setModalCurrency('TON'); setModalType('withdraw'); }}
                className="flex-1 py-2.5 bg-[#17243A] hover:bg-[#1B2C45] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Withdraw
              </button>
              <button
                type="button"
                onClick={() => navigate('/swap')}
                className="px-3 py-2.5 bg-[#17243A] hover:bg-[#1B2C45] text-[#229ED9] rounded-xl transition-all cursor-pointer flex items-center justify-center"
                title="Swap"
              >
                <ArrowDownUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. TJ Points (In-App Platform Balance) */}
          <div className="rounded-2xl bg-[#111C30] p-5 sm:p-6 shadow-xl shadow-black/25 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#9B7CFF] uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>TJ Points (In-App)</span>
                </span>
                <span className="text-[9px] font-bold bg-[#9B7CFF]/10 text-[#9B7CFF] px-2 py-0.5 rounded-full">
                  Platform Rewards
                </span>
              </div>

              <div className="pt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white tracking-tight">
                    {currencyMode === 'USD'
                      ? `$${(rawTjVal * JAM_PRICE_USD).toFixed(2)}`
                      : rawTjVal.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-[#94A3B8]">
                    {currencyMode === 'USD' ? 'USD' : 'TJ'}
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] font-medium mt-1">
                  Earned through listening, quests, and community missions. Not native crypto.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate('/earn-tj')}
                className="flex-1 py-2.5 bg-[#9B7CFF] hover:bg-[#8663F2] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-[#9B7CFF]/20"
              >
                Earn More TJ
              </button>
              <button
                type="button"
                onClick={() => navigate('/staking')}
                className="px-4 py-2.5 bg-[#17243A] hover:bg-[#1B2C45] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Stake
              </button>
            </div>
          </div>

          {/* 3. Total Music NFTs Owned */}
          <div className="rounded-2xl bg-[#111C30] p-5 sm:p-6 shadow-xl shadow-black/25 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-widest flex items-center gap-1.5">
                  <Disc className="w-3.5 h-3.5" />
                  <span>Music NFT Assets</span>
                </span>
                <span className="text-[9px] font-bold bg-[#2DD4BF]/10 text-[#2DD4BF] px-2 py-0.5 rounded-full">
                  Owned Tracks
                </span>
              </div>

              <div className="pt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white tracking-tight">
                    {ownedNftsCount}
                  </span>
                  <span className="text-sm font-bold text-[#94A3B8]">
                    NFT{ownedNftsCount === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] font-medium mt-1">
                  Verifiable music ownership with lossless audio and creator royalty share.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('owned-nfts-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 py-2.5 bg-[#2DD4BF] hover:bg-[#20b8a5] text-black text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-[#2DD4BF]/20"
              >
                View Collection
              </button>
              <button
                type="button"
                onClick={() => navigate('/marketplace')}
                className="px-4 py-2.5 bg-[#17243A] hover:bg-[#1B2C45] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Marketplace
              </button>
            </div>
          </div>
        </div>

        {/* UNCLAIMED CREATOR ROYALTIES BANNER */}
        {unclaimedRoyalty > 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-[#111C30] via-[#14233D] to-[#111C30] p-5 shadow-xl shadow-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Unclaimed Creator Royalties
                </span>
                <h4 className="text-lg font-bold text-white">
                  {unclaimedRoyalty.toFixed(3)} TON available
                </h4>
                <p className="text-[11px] text-[#94A3B8]">
                  Generated from secondary NFT trades and music streams.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isClaimingRoyalty || !userAddress}
              onClick={handleClaimRoyalty}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-emerald-500/20"
            >
              {isClaimingRoyalty ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Claiming...</span>
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  <span>Claim to Wallet</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* D. OWNED MUSIC NFTS SECTION */}
        <div id="owned-nfts-section" className="rounded-2xl bg-[#111C30] p-5 sm:p-6 shadow-xl shadow-black/25 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Disc className="w-5 h-5 text-[#229ED9]" />
              <h2 className="text-base font-bold text-white tracking-tight">
                My Music NFTs ({ownedNftsCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/marketplace')}
              className="text-xs font-bold text-[#229ED9] hover:text-[#5bc2ff] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {ownedNftsCount > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {userNFTs.map((nft) => {
                const track = allTracks.find((t) => t.id === nft.trackId || t.title === nft.title);
                return (
                  <div
                    key={nft.id}
                    className="rounded-xl bg-[#0B1424] p-3 flex items-center gap-3.5 group hover:bg-[#17243A] transition-all cursor-pointer"
                    onClick={() => navigate(`/nft/${nft.id}`)}
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-black/40">
                      <img
                        src={nft.imageUrl || nft.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'}
                        alt={nft.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {track && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playTrack(track);
                          }}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Play Track"
                        >
                          <Play className="w-5 h-5 text-white fill-white" />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-[#229ED9] bg-[#229ED9]/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {nft.edition || 'NFT Single'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate mt-1">
                        {nft.title}
                      </h4>
                      <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                        {nft.artist}
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl bg-[#0B1424] p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#229ED9]/10 text-[#229ED9] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">No Music NFTs Owned Yet</h3>
                <p className="text-xs text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
                  Start collecting digital vinyl and limited release tracks from your favorite Web3 artists to unlock lossless audio streams and royalties.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/marketplace')}
                className="mt-2 px-5 py-2.5 bg-[#229ED9] hover:bg-[#168AC4] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-[#229ED9]/20"
              >
                Browse Music NFT Drops
              </button>
            </div>
          )}
        </div>

        {/* E. TRANSACTION HISTORY */}
        <div className="rounded-2xl bg-[#111C30] p-5 sm:p-6 shadow-xl shadow-black/25 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[#229ED9]" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Transaction History
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#94A3B8]">
              {safeTransactions.length} recorded
            </span>
          </div>

          {safeTransactions.length > 0 ? (
            <div className="space-y-2">
              {safeTransactions.map((tx) => {
                const isPositive = tx.type === 'deposit' || tx.type === 'nft_sale' || tx.type === 'reward';
                return (
                  <div
                    key={tx.id}
                    className="rounded-xl bg-[#0B1424] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#17243A] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[#229ED9]/15 text-[#229ED9]'
                      }`}>
                        {tx.type === 'nft_sale' || tx.type === 'nft_purchase' ? (
                          <Disc className="w-4 h-4" />
                        ) : tx.type === 'jam_purchase' ? (
                          <Sparkles className="w-4 h-4" />
                        ) : isPositive ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            {(tx.type || 'Transaction').replace('_', ' ')}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                            {tx.status || 'Completed'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5">
                          {tx.trackTitle || tx.senderAddress || 'TonJam Protocol'}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                      <span className={`text-xs font-bold font-mono ${
                        isPositive ? 'text-emerald-400' : 'text-white'
                      }`}>
                        {isPositive ? '+' : '-'}{tx.amount} {tx.type === 'jam_purchase' ? 'TJ' : 'TON'}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] mt-0.5">
                        {new Date(tx.timestamp).toLocaleDateString()} • {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl bg-[#0B1424] p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">No Transactions Yet</h3>
                <p className="text-xs text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
                  Your purchase history, streaming payouts, deposits, and TJ rewards will be tracked here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/discover')}
                className="mt-2 px-5 py-2.5 bg-[#229ED9] hover:bg-[#168AC4] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-[#229ED9]/20"
              >
                Discover Music
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DEPOSIT / WITHDRAW MODAL */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#080D1A]/90 backdrop-blur-xl"
            onClick={() => setModalType(null)}
          />
          <div className="relative w-full max-w-md bg-[#111C30] p-6 rounded-2xl shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {modalType === 'deposit' ? 'Deposit' : 'Withdraw'} {modalCurrency}
              </h3>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="w-8 h-8 rounded-full bg-[#0B1424] text-[#94A3B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                  Amount ({modalCurrency})
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#0B1424] text-white text-sm font-semibold px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#229ED9] transition-all"
                />
              </div>

              {modalType === 'withdraw' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    Recipient TON Address
                  </label>
                  <input
                    type="text"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    placeholder="EQ... or UQ..."
                    className="w-full bg-[#0B1424] text-white text-xs font-mono px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#229ED9] transition-all"
                  />
                </div>
              )}

              <button
                type="button"
                disabled={isProcessing || !amount || Number(amount) <= 0}
                onClick={handleModalSubmit}
                className="w-full py-3.5 bg-[#229ED9] hover:bg-[#168AC4] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#229ED9]/25 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Transaction...</span>
                  </>
                ) : (
                  <span>Confirm {modalType === 'deposit' ? 'Deposit' : 'Withdrawal'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testnet Sandbox Hub Modal */}
      <TestnetHubModal isOpen={isTestnetModalOpen} onClose={() => setIsTestnetModalOpen(false)} />
    </div>
  );
};

export default Wallet;
