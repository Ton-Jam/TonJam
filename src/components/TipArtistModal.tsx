import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Send, Zap, CheckCircle2, Wallet, Music, Sparkles, 
  QrCode, Copy, Check, ArrowUpRight, Download, RefreshCw
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Artist, Track } from "@/types";
import { useAudio } from "@/contexts/AudioContext";
import { distributeRoyalties } from "@/services/royaltyService";
import { createActivityPost } from "@/services/socialService";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { toNano } from "@ton/ton";
import { toast } from "sonner";
import { getPlaceholderImage } from "@/lib/utils";

interface TipArtistModalProps {
  artist?: Artist | { name: string; avatarUrl?: string; walletAddress?: string; uid?: string; location?: string; verified?: boolean };
  track?: Track | null;
  onClose: () => void;
}

export const TipArtistModal: React.FC<TipArtistModalProps> = ({ artist, track, onClose }) => {
  const [currency, setCurrency] = React.useState<"TON" | "GRAM">("TON");
  const [amount, setAmount] = React.useState<string>("1");
  const [mode, setMode] = React.useState<"direct" | "qr">("direct");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const { addNotification, userProfile } = useAudio();
  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();

  const artistName = track?.artist || artist?.name || "Artist";
  const artistUid = track?.artistId || artist?.uid || "artist-1";
  const avatarUrl = track?.artistAvatar || artist?.avatarUrl || getPlaceholderImage("avatar");
  const trackTitle = track?.title;
  const coverUrl = track?.coverUrl;
  const walletAddress = artist?.walletAddress || "UQCc_DJ_Krupy_Vibez_x9y1_8888";

  // Presets based on currency
  const tonPresets = ["0.5", "1", "2.5", "5", "10", "25"];
  const gramPresets = ["50", "100", "250", "500", "1000", "2500"];
  const activePresets = currency === "TON" ? tonPresets : gramPresets;

  // Approximate USD rates for display
  const tonPriceUsd = 5.2;
  const gramPriceUsd = 0.05;
  const numericAmount = parseFloat(amount) || 0;
  const usdValue = (numericAmount * (currency === "TON" ? tonPriceUsd : gramPriceUsd)).toFixed(2);

  // Generate TON transfer deep-link / URI
  const qrTransferUri = React.useMemo(() => {
    if (numericAmount <= 0) return walletAddress;
    const nanoValue = Math.floor(numericAmount * 1e9);
    const comment = encodeURIComponent(`Tip for ${artistName} (${amount} ${currency}) on TonJam`);
    return `ton://transfer/${walletAddress}?amount=${nanoValue}&text=${comment}`;
  }, [walletAddress, numericAmount, amount, currency, artistName]);

  const handleConnectWallet = () => {
    try {
      tonConnectUI.openModal();
    } catch (err) {
      toast.info("Connecting to wallet...");
    }
  };

  const handleCopyWallet = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("Wallet address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy wallet address");
    }
  };

  const handleSendDirectTip = async () => {
    if (numericAmount <= 0) {
      toast.error(`Please enter a valid ${currency} amount`);
      return;
    }

    if (!tonConnectUI.connected) {
      toast.error("Please connect your TON wallet to send instant tips.");
      handleConnectWallet();
      return;
    }

    setIsProcessing(true);
    try {
      let nanoValue: string;
      try {
        nanoValue = toNano(numericAmount.toString()).toString();
      } catch (e) {
        nanoValue = (numericAmount * 1e9).toFixed(0);
      }

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 180,
        messages: [
          {
            address: walletAddress,
            amount: nanoValue,
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);

      if (result) {
        setIsSuccess(true);
        // Distribute royalties record
        try {
          await distributeRoyalties(
            numericAmount,
            artistUid,
            [],
            "tip",
            { trackTitle: trackTitle ? `Tip for "${trackTitle}"` : `Tip for ${artistName}` }
          );
        } catch (e) {
          console.warn("Royalty logging:", e);
        }

        // Create social activity post
        try {
          await createActivityPost(
            userProfile?.uid || "user-1",
            userProfile?.name || "Fan",
            userProfile?.avatar || getPlaceholderImage("avatar"),
            `sent a ${amount} ${currency} direct donation to`,
            "tip",
            {
              targetId: artistUid,
              artistName: artistName,
              trackTitle: trackTitle,
              paymentAmount: amount,
              paymentCurrency: currency === "TON" ? "JAM" : "GRAM"
            }
          );
        } catch (postErr) {
          console.warn("Activity post error:", postErr);
        }

        toast.success(`Sent ${amount} ${currency} to ${artistName}!`);
        setTimeout(() => {
          onClose();
        }, 2200);
      }
    } catch (error: any) {
      console.error("Tip transaction error:", error);
      toast.error("Transaction cancelled or failed. Please check your wallet balance.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadQR = () => {
    const svgElement = document.getElementById("tip-modal-qr-svg");
    if (!svgElement) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      const canvasWidth = 700;
      const canvasHeight = 850;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      img.onload = () => {
        if (!ctx) return;

        // Dark background
        ctx.fillStyle = "#121212";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Header
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`Tip ${artistName}`, canvasWidth / 2, 70);

        ctx.fillStyle = "#0098EA";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(`AMOUNT: ${amount} ${currency}`, canvasWidth / 2, 105);

        // QR Box
        const qrBoxSize = 380;
        const qrX = (canvasWidth - qrBoxSize) / 2;
        const qrY = 140;

        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(qrX, qrY, qrBoxSize, qrBoxSize, 24);
        } else {
          ctx.rect(qrX, qrY, qrBoxSize, qrBoxSize);
        }
        ctx.fill();

        ctx.drawImage(img, qrX + 20, qrY + 20, qrBoxSize - 40, qrBoxSize - 40);

        // Recipient Address
        ctx.fillStyle = "#888888";
        ctx.font = "16px monospace";
        ctx.fillText(walletAddress, canvasWidth / 2, 570);

        // Footer
        ctx.fillStyle = "#666666";
        ctx.font = "15px sans-serif";
        ctx.fillText("TonJam Protocol • Peer-to-Peer Artist Tip", canvasWidth / 2, 750);

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `tip_${artistName.toLowerCase().replace(/\s+/g, "_")}_${amount}_${currency}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success("QR Code downloaded!");
      };

      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      toast.error("Could not download QR code image");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-neutral-900/95 backdrop-blur-2xl rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-white"
      >
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Send Tip to Artist</h3>
                <p className="text-xs text-neutral-400">Direct on-chain peer-to-peer donation</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Artist & Track Preview Banner */}
          <div className="p-3.5 bg-white/[0.04] rounded-2xl flex items-center gap-3.5 shadow-inner">
            {coverUrl ? (
              <img 
                src={coverUrl} 
                className="w-12 h-12 rounded-xl object-cover shadow-md shrink-0" 
                alt={trackTitle || artistName} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getPlaceholderImage("cover");
                }}
              />
            ) : (
              <img 
                src={avatarUrl} 
                className="w-12 h-12 rounded-full object-cover shadow-md shrink-0" 
                alt={artistName} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getPlaceholderImage("avatar");
                }}
              />
            )}
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-white truncate">{artistName}</p>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400 shrink-0" />
              </div>
              {trackTitle ? (
                <p className="text-xs font-medium text-neutral-400 truncate flex items-center gap-1">
                  <Music className="w-3 h-3 text-[#1DB954]" />
                  <span>{trackTitle}</span>
                </p>
              ) : (
                <p className="text-[11px] font-mono text-neutral-400 truncate">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                </p>
              )}
            </div>
          </div>

          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 flex flex-col items-center text-center space-y-3"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-xl animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">Tip Sent Successfully!</h4>
              <p className="text-xs text-neutral-300 max-w-xs">
                Your donation of <span className="text-[#1DB954] font-bold">{amount} {currency}</span> has been transferred directly to {artistName}'s wallet.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              
              {/* Currency Selector (TON vs GRAM) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Select Currency
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.04] rounded-2xl">
                  <button
                    onClick={() => {
                      setCurrency("TON");
                      setAmount("1");
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      currency === "TON"
                        ? "bg-[#0098EA] text-white shadow-md scale-102"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">💎</div>
                    <span>TON</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrency("GRAM");
                      setAmount("100");
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      currency === "GRAM"
                        ? "bg-purple-600 text-white shadow-md scale-102"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">⚡</div>
                    <span>GRAM</span>
                  </button>
                </div>
              </div>

              {/* Amount Input and Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Enter Amount
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    ≈ ${usdValue} USD
                  </span>
                </div>

                <div className="relative">
                  <input 
                    type="number" 
                    step={currency === "TON" ? "0.1" : "1"}
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/[0.04] focus:bg-white/[0.08] rounded-2xl px-4 py-3 text-white font-mono font-bold text-base placeholder:text-neutral-500 focus:outline-none transition-all"
                    placeholder="0.00"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                    <span className="text-xs font-extrabold text-neutral-300 font-mono">{currency}</span>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-6 gap-1.5 pt-1">
                  {activePresets.map((preset) => {
                    const isSelected = amount === preset;
                    return (
                      <button
                        key={preset}
                        onClick={() => setAmount(preset)}
                        className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          isSelected
                            ? currency === "TON" ? "bg-[#0098EA] text-white shadow-sm" : "bg-purple-600 text-white shadow-sm"
                            : "bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]"
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode Toggle: Direct Send vs. QR Code */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setMode("direct")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === "direct"
                      ? "bg-white text-black shadow-md"
                      : "bg-white/[0.04] text-neutral-400 hover:text-white"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Direct Send</span>
                </button>
                <button
                  onClick={() => setMode("qr")}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === "qr"
                      ? "bg-white text-black shadow-md"
                      : "bg-white/[0.04] text-neutral-400 hover:text-white"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan QR Code</span>
                </button>
              </div>

              {/* QR Mode View */}
              {mode === "qr" ? (
                <div className="p-4 bg-white/[0.03] rounded-2xl flex flex-col items-center space-y-3">
                  <div className="p-3 bg-white rounded-2xl shadow-xl">
                    <QRCodeSVG
                      id="tip-modal-qr-svg"
                      value={qrTransferUri}
                      size={160}
                      level="H"
                      className="rounded-lg"
                      imageSettings={{
                        src: avatarUrl || "https://ton.org/download/ton_symbol.png",
                        x: undefined,
                        y: undefined,
                        height: 32,
                        width: 32,
                        excavate: true
                      }}
                    />
                  </div>

                  <div className="w-full text-center space-y-1">
                    <div className="flex items-center justify-center gap-2 text-xs text-neutral-300">
                      <span className="font-mono text-[11px] truncate max-w-[220px]">
                        {walletAddress}
                      </span>
                      <button
                        onClick={handleCopyWallet}
                        className="p-1 hover:bg-white/[0.08] text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Copy Wallet Address"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <p className="text-[10px] text-neutral-400">
                      Scan with Tonkeeper, Telegram Wallet, or any TON wallet app
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 w-full pt-1">
                    <button
                      onClick={handleDownloadQR}
                      className="py-2.5 px-3 bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download QR</span>
                    </button>

                    <a
                      href={qrTransferUri}
                      className="py-2.5 px-3 bg-[#0098EA] hover:bg-[#0087d1] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform hover:scale-102 cursor-pointer shadow-md text-center"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Open Wallet</span>
                    </a>
                  </div>
                </div>
              ) : (
                /* Direct Send Action Button */
                <div>
                  {!userAddress ? (
                    <button
                      onClick={handleConnectWallet}
                      className="w-full py-3.5 bg-white text-black hover:bg-neutral-200 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-102 active:scale-98 cursor-pointer"
                    >
                      <Wallet className="w-4 h-4 text-[#0098EA]" />
                      <span>Connect Wallet to Tip</span>
                    </button>
                  ) : (
                    <button 
                      onClick={handleSendDirectTip}
                      disabled={isProcessing || numericAmount <= 0}
                      className="w-full py-3.5 bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-2xl shadow-xl hover:scale-102 active:scale-98 cursor-pointer"
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>
                        {isProcessing 
                          ? "Broadcasting Transaction..." 
                          : `Donate ${amount || "0"} ${currency} to ${artistName}`
                        }
                      </span>
                    </button>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Footer note */}
          <div className="pt-2 text-center">
            <span className="text-[10px] text-neutral-500 font-medium">
              {userAddress ? `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : "100% of donation goes directly to artist on-chain"}
            </span>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default TipArtistModal;
