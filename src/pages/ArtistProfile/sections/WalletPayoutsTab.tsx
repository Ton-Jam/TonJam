import * as React from "react";
import { Artist } from "@/types";
import {
  Wallet,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  Disc,
  Zap,
  Sliders,
  QrCode,
} from "lucide-react";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { ArtistWalletQRModal } from "@/components/ArtistWalletQRModal";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";

interface WalletPayoutsTabProps {
  artist: Artist;
}

interface PayoutTransaction {
  id: string;
  txHash?: string;
  type: string;
  title: string;
  amountTON: number;
  amountUSD: number;
  timestamp: string;
  destinationWallet: string;
  status: string;
}

export const WalletPayoutsTab: React.FC<WalletPayoutsTabProps> = ({ artist }) => {
  const { user } = useAuth();
  const [tonConnectUI] = useTonConnectUI();
  const connectedTonAddress = useTonAddress();

  const isOwnProfile = user?.uid === artist.uid;
  const activeWallet = artist.walletAddress || (isOwnProfile ? connectedTonAddress : "") || "";

  const [copied, setCopied] = React.useState(false);
  const [showQRModal, setShowQRModal] = React.useState(false);
  const [autoPayoutEnabled, setAutoPayoutEnabled] = React.useState(true);
  const [streamingEarnings, setStreamingEarnings] = React.useState(artist.earnings?.streaming || 0);
  const [nftEarnings, setNftEarnings] = React.useState(artist.earnings?.nftSales || 0);
  const [pendingBalance, setPendingBalance] = React.useState(0);
  const [payouts, setPayouts] = React.useState<PayoutTransaction[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    const loadRealPayouts = async () => {
      setLoading(true);
      const artistUid = artist.uid;
      try {
        if (artistUid) {
          try {
            const royaltySnap = await getDoc(doc(db, "royalties", artistUid));
            if (active && royaltySnap.exists()) {
              const rData = royaltySnap.data();
              setPendingBalance(Number(rData.unclaimedAmount || 0));
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `royalties/${artistUid}`);
          }
        }

        if (user && (isOwnProfile || activeWallet)) {
          try {
            const txQuery = query(
              collection(db, "transactions"),
              where("participants", "array-contains", artistUid || user.uid),
              orderBy("timestamp", "desc"),
              limit(25)
            );
            const snap = await getDocs(txQuery);
            if (active) {
              const items: PayoutTransaction[] = snap.docs.map((d) => {
                const data = d.data();
                const amountTON = Number(data.artistShare ?? data.amount ?? 0);
                return {
                  id: d.id,
                  txHash: data.txHash,
                  type: data.type || "streaming_royalty",
                  title: data.trackTitle || data.type || "On-Chain Settlement",
                  amountTON,
                  amountUSD: amountTON * 5.0,
                  timestamp: data.timestamp
                    ? new Date(data.timestamp).toLocaleDateString()
                    : "",
                  destinationWallet: data.recipientAddress || activeWallet,
                  status: data.status || "initiated",
                };
              });
              setPayouts(items);
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.LIST, "transactions");
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadRealPayouts();
    return () => {
      active = false;
    };
  }, [artist.uid, activeWallet, isOwnProfile, user]);

  const totalEarningsTON = (streamingEarnings + nftEarnings).toFixed(2);
  const totalEarningsUSD = ((streamingEarnings + nftEarnings) * 5.0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
  });

  const handleCopyWallet = () => {
    if (!activeWallet) return;
    navigator.clipboard.writeText(activeWallet);
    setCopied(true);
    toast.success("Wallet address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in" id="tonjam-wallet-payouts-tab">
      {/* 1. CONNECTED WALLET & AUTO-PAYOUT STATUS HERO */}
      <div className="bg-neutral-900/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Wallet Address & Verification Badges */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2.5 rounded-2xl bg-[#0098EA]/10 text-[#0098EA]">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    TON Payout Protocol
                  </h3>
                  {activeWallet && (
                    <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" />
                      Wallet Linked
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 font-medium">
                  Direct smart contract payout routing for NFT primary drops, secondary resales & streaming pools.
                </p>
              </div>
            </div>

            {/* Wallet Address Chip */}
            {activeWallet ? (
              <div className="flex items-center gap-2 bg-white/[0.03] px-3.5 py-2 rounded-2xl max-w-xl">
                <span className="text-xs font-mono text-neutral-300 truncate">{activeWallet}</span>
                <button
                  onClick={() => setShowQRModal(true)}
                  className="p-1.5 hover:bg-white/[0.08] text-[#0098EA] hover:text-[#38bdf8] rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Generate Wallet Tip QR Code"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCopyWallet}
                  className="p-1.5 hover:bg-white/[0.08] text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Copy Wallet Address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={`https://tonscan.org/address/${activeWallet}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 hover:bg-white/[0.08] text-neutral-400 hover:text-[#0098EA] rounded-lg transition-colors shrink-0"
                  title="View on TONScan Explorer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="text-xs text-neutral-400 bg-white/[0.03] px-3.5 py-2 rounded-2xl max-w-xl">
                No TON payout wallet linked yet.
              </div>
            )}
          </div>

          {/* Auto-Payout Switch & Wallet Connect Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
            <div className="bg-white/[0.03] p-3 rounded-2xl flex items-center justify-between sm:justify-start gap-4">
              <div>
                <span className="text-[11px] font-bold text-neutral-300 block uppercase tracking-wider">
                  Instant Auto-Forward
                </span>
                <span className="text-[10px] text-neutral-500">
                  {autoPayoutEnabled ? "Real-time to wallet" : "Accumulate in pool"}
                </span>
              </div>
              <button
                onClick={() => setAutoPayoutEnabled((prev) => !prev)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer outline-none ${
                  autoPayoutEnabled ? "bg-[#1DB954]" : "bg-neutral-800"
                }`}
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    autoPayoutEnabled ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>

            {isOwnProfile && (
              <button
                onClick={() => tonConnectUI.openModal()}
                className="px-5 py-3 bg-[#0098EA] hover:bg-[#0087d1] text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg hover:scale-105 cursor-pointer"
              >
                {connectedTonAddress ? "Manage TON Wallet" : "Connect TON Wallet"}
              </button>
            )}
          </div>
        </div>

        {/* 2. REVENUE METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="bg-white/[0.02] p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total On-Chain Earnings</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {totalEarningsTON} <span className="text-sm font-sans font-bold text-[#0098EA]">TON</span>
              </div>
              <span className="text-xs text-neutral-400 font-mono">≈ ${totalEarningsUSD} USD</span>
            </div>
          </div>

          <div className="bg-white/[0.02] p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold uppercase tracking-wider">Streaming Royalties</span>
              <Disc className="w-4 h-4 text-[#1DB954]" />
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {streamingEarnings.toFixed(1)} <span className="text-sm font-sans font-bold text-[#1DB954]">TON</span>
              </div>
              <span className="text-xs text-neutral-400">Verified stream settlements</span>
            </div>
          </div>

          <div className="bg-white/[0.02] p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold uppercase tracking-wider">NFT Sales & Cuts</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {nftEarnings.toFixed(1)} <span className="text-sm font-sans font-bold text-purple-400">TON</span>
              </div>
              <span className="text-xs text-neutral-400">Primary & secondary creator royalties</span>
            </div>
          </div>

          <div className="bg-white/[0.02] p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Settlement</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {pendingBalance.toFixed(2)} <span className="text-sm font-sans font-bold text-amber-400">TON</span>
              </div>
              <span className="text-xs text-neutral-500 block">
                {pendingBalance > 0 ? "Available in creator pool" : "No pending settlement"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AUTOMATIC PAYOUT RULES & SPLITS CONFIGURATION */}
      <div className="bg-neutral-900/60 backdrop-blur-md rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Automated Split Configuration
            </h4>
          </div>
          <span className="text-xs text-emerald-400 font-bold">On-Chain Routing</span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Whenever a track is streamed or an NFT is sold, smart contracts route payouts to configured creator addresses.
        </p>

        <div className="bg-white/[0.02] p-3.5 rounded-2xl space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-white">Lead Artist ({artist.name})</span>
            <span className="text-[#1DB954] font-mono font-bold">Primary Beneficiary</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono truncate block">
            {activeWallet || "Wallet not linked"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Executed natively via TON Jetton and NFT smart contract callbacks.</span>
        </div>
      </div>

      {/* 4. REAL-TIME PAYOUT LEDGER */}
      <div className="bg-neutral-900/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Automatic Payout Ledger
            </h4>
            <p className="text-xs text-neutral-400">
              Audit trail of streaming royalties and NFT sales recorded for this artist.
            </p>
          </div>
          <span className="text-xs text-neutral-400 font-mono">{payouts.length} Events</span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-xs text-neutral-400">Loading payout history...</div>
        ) : payouts.length === 0 ? (
          <div className="py-10 text-center text-xs text-neutral-400 bg-white/[0.02] rounded-2xl">
            No payout transactions recorded yet.
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {payouts.map((tx) => {
                const isStream = tx.type.includes("stream");
                const isNFT = tx.type.includes("nft");

                return (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    key={tx.id}
                    className="bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isStream
                            ? "bg-[#1DB954]/10 text-[#1DB954]"
                            : isNFT
                            ? "bg-purple-500/10 text-purple-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {isStream ? (
                          <Disc className="w-4 h-4" />
                        ) : isNFT ? (
                          <Sparkles className="w-4 h-4" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <h5 className="text-xs sm:text-sm font-bold text-white truncate">{tx.title}</h5>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 flex-wrap">
                          {tx.txHash && <span className="font-mono text-neutral-500">TX: {tx.txHash}</span>}
                          {tx.timestamp && <span>{tx.timestamp}</span>}
                          <span className="text-emerald-400 font-semibold flex items-center gap-0.5 capitalize">
                            <CheckCircle2 className="w-2.5 h-2.5" /> {tx.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-sm sm:text-base font-black text-white font-mono flex items-center sm:justify-end gap-1">
                        <span className="text-[#1DB954]">+{tx.amountTON.toFixed(2)}</span>
                        <span className="text-xs font-bold text-neutral-400">TON</span>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-mono block">
                        ≈ ${tx.amountUSD.toFixed(2)} USD
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ArtistWalletQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        artist={artist}
      />
    </div>
  );
};

export default WalletPayoutsTab;
