import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Copy, Check, Download, QrCode, Wallet, 
  Sparkles, CheckCircle2, Zap, X, ArrowUpRight, Send
} from "lucide-react";
import { toast } from "sonner";
import { Artist } from "@/types";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { toNano } from "@ton/ton";
import { distributeRoyalties } from "@/services/royaltyService";

interface ArtistWalletQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: Artist;
}

export const ArtistWalletQRModal: React.FC<ArtistWalletQRModalProps> = ({
  isOpen,
  onClose,
  artist
}) => {
  const [copied, setCopied] = React.useState(false);
  const [currency, setCurrency] = React.useState<"TON" | "GRAM">("TON");
  const [tipAmount, setTipAmount] = React.useState<string>("1");
  const [customAmount, setCustomAmount] = React.useState<string>("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [tonConnectUI] = useTonConnectUI();
  const userAddress = useTonAddress();

  const walletAddress = artist.walletAddress || "UQCc_DJ_Krupy_Vibez_x9y1_8888";
  const activeAmount = customAmount || tipAmount;
  const numericAmount = parseFloat(activeAmount) || 0;

  const tonPresets = ["0.5", "1", "2.5", "5", "10", "25"];
  const gramPresets = ["50", "100", "250", "500", "1000", "2500"];
  const activePresets = currency === "TON" ? tonPresets : gramPresets;

  const tonPriceUsd = 5.2;
  const gramPriceUsd = 0.05;
  const usdValue = (numericAmount * (currency === "TON" ? tonPriceUsd : gramPriceUsd)).toFixed(2);

  // Generate TON URI or raw address
  const qrValue = React.useMemo(() => {
    if (numericAmount <= 0) {
      return walletAddress;
    }
    const nanoTons = Math.floor(numericAmount * 1e9);
    const comment = encodeURIComponent(`Tip for ${artist.name} (${activeAmount} ${currency}) on TonJam`);
    return `ton://transfer/${walletAddress}?amount=${nanoTons}&text=${comment}`;
  }, [walletAddress, numericAmount, activeAmount, currency, artist.name]);

  const handleCopyWallet = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("TON wallet address copied to clipboard!");
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
      try {
        tonConnectUI.openModal();
      } catch (e) {
        // ignore
      }
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
        try {
          await distributeRoyalties(
            numericAmount,
            artist.uid,
            [],
            "tip",
            { trackTitle: `Tip for ${artist.name}` }
          );
        } catch (err) {
          console.warn("Royalty log error:", err);
        }

        toast.success(`Successfully sent ${activeAmount} ${currency} to ${artist.name}!`);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2200);
      }
    } catch (error) {
      toast.error("Transaction cancelled or failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadQR = () => {
    const svgElement = document.getElementById("artist-ton-qr-svg");
    if (!svgElement) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      const canvasWidth = 800;
      const canvasHeight = 1000;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      img.onload = () => {
        if (!ctx) return;

        // Dark background
        ctx.fillStyle = "#121212";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Header Gradient Glow
        const gradient = ctx.createLinearGradient(0, 0, canvasWidth, 240);
        gradient.addColorStop(0, currency === "TON" ? "#0098EA" : "#9333ea");
        gradient.addColorStop(1, "#121212");
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(0, 0, canvasWidth, 260);
        ctx.globalAlpha = 1.0;

        // Artist Name & Title
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 38px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(artist.name, canvasWidth / 2, 90);

        ctx.fillStyle = currency === "TON" ? "#0098EA" : "#a855f7";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(`${currency} WALLET TIP & DONATION ADDRESS`, canvasWidth / 2, 130);

        // QR Code Container Background
        const qrBoxSize = 440;
        const qrX = (canvasWidth - qrBoxSize) / 2;
        const qrY = 180;
        
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(qrX, qrY, qrBoxSize, qrBoxSize, 28);
        } else {
          ctx.rect(qrX, qrY, qrBoxSize, qrBoxSize);
        }
        ctx.fill();

        // Draw SVG QR Image
        const qrPadding = 30;
        ctx.drawImage(img, qrX + qrPadding, qrY + qrPadding, qrBoxSize - qrPadding * 2, qrBoxSize - qrPadding * 2);

        // Amount label if selected
        if (numericAmount > 0) {
          ctx.fillStyle = "#1DB954";
          ctx.font = "bold 28px sans-serif";
          ctx.fillText(`Preset Amount: ${activeAmount} ${currency}`, canvasWidth / 2, 680);
        }

        // Wallet Address
        ctx.fillStyle = "#999999";
        ctx.font = "18px monospace";
        ctx.fillText(walletAddress, canvasWidth / 2, 730);

        // Footer Branding
        ctx.fillStyle = "#666666";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText("Scan with Tonkeeper, Telegram Wallet, or any TON App • TonJam Protocol", canvasWidth / 2, 890);

        // Download PNG
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${artist.name.toLowerCase().replace(/\s+/g, "_")}_${currency.toLowerCase()}_tip_qr.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success("Custom QR Code downloaded!");
      };

      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      toast.error("Failed to generate download image");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-neutral-900/95 backdrop-blur-2xl text-white p-6 sm:p-7 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto no-scrollbar">
        
        {/* Hidden Accessibility Title & Description */}
        <DialogTitle className="sr-only">Send Tip & QR Code for {artist.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Send tips or donations in TON or GRAM directly to {artist.name}'s wallet, or scan the custom QR code.
        </DialogDescription>

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                Send Tip to {artist.name}
                {artist.verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />}
              </h3>
              <p className="text-xs text-neutral-400">
                Donate in TON or GRAM directly on-chain
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-xl animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white tracking-tight">Tip Transferred!</h4>
            <p className="text-xs text-neutral-300 max-w-xs">
              Your donation of <span className="text-[#1DB954] font-bold">{activeAmount} {currency}</span> has been sent to {artist.name}.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            
            {/* Currency Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.04] rounded-2xl">
              <button
                onClick={() => {
                  setCurrency("TON");
                  setTipAmount("1");
                  setCustomAmount("");
                }}
                className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  currency === "TON"
                    ? "bg-[#0098EA] text-white shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>💎 TON</span>
              </button>

              <button
                onClick={() => {
                  setCurrency("GRAM");
                  setTipAmount("100");
                  setCustomAmount("");
                }}
                className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  currency === "GRAM"
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>⚡ GRAM</span>
              </button>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white/[0.03] rounded-3xl flex flex-col items-center space-y-3 shadow-inner">
              <div className="relative p-3 bg-white rounded-2xl shadow-xl">
                <QRCodeSVG
                  id="artist-ton-qr-svg"
                  value={qrValue}
                  size={170}
                  level="H"
                  includeMargin={false}
                  className="rounded-lg"
                  imageSettings={{
                    src: artist.avatarUrl || "https://ton.org/download/ton_symbol.png",
                    x: undefined,
                    y: undefined,
                    height: 34,
                    width: 34,
                    excavate: true
                  }}
                />
              </div>

              {/* Recipient Address Details */}
              <div className="w-full text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-300">
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
                
                {numericAmount > 0 ? (
                  <span className="inline-block text-xs font-bold text-[#1DB954] font-mono bg-[#1DB954]/10 px-2.5 py-0.5 rounded-full">
                    Amount: {activeAmount} {currency} (≈ ${usdValue} USD)
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-500 block">
                    Direct on-chain payout to verified artist wallet
                  </span>
                )}
              </div>
            </div>

            {/* Custom Amount Input & Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                  Custom Amount ({currency})
                </span>
                {customAmount && (
                  <button
                    onClick={() => setCustomAmount("")}
                    className="text-[10px] text-neutral-400 hover:text-white cursor-pointer uppercase font-bold"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="relative">
                <input 
                  type="number"
                  step={currency === "TON" ? "0.1" : "1"}
                  min="0.01"
                  value={customAmount || tipAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setTipAmount("");
                  }}
                  className="w-full bg-white/[0.04] focus:bg-white/[0.08] rounded-2xl px-4 py-2.5 text-white font-mono font-bold text-sm placeholder:text-neutral-500 focus:outline-none transition-all"
                  placeholder={`Enter ${currency} amount`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                  <span className="text-xs font-bold text-neutral-300 font-mono">{currency}</span>
                </div>
              </div>

              {/* Preset Chips */}
              <div className="grid grid-cols-6 gap-1">
                {activePresets.map((amt) => {
                  const isSelected = (tipAmount === amt && !customAmount) || customAmount === amt;
                  return (
                    <button
                      key={amt}
                      onClick={() => {
                        setCustomAmount("");
                        setTipAmount(amt);
                      }}
                      className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        isSelected
                          ? currency === "TON" ? "bg-[#0098EA] text-white shadow-md" : "bg-purple-600 text-white shadow-md"
                          : "bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      {amt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons: 1-Click Direct Tip, Download QR, Open TON Wallet */}
            <div className="space-y-2 pt-1">
              {userAddress ? (
                <button
                  onClick={handleSendDirectTip}
                  disabled={isProcessing || numericAmount <= 0}
                  className="w-full py-3.5 bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-2xl transition-all shadow-xl hover:scale-102 active:scale-98 cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isProcessing ? "Processing..." : `Send ${activeAmount || "0"} ${currency} Direct Tip`}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    try {
                      tonConnectUI.openModal();
                    } catch (e) {
                      // ignore
                    }
                  }}
                  className="w-full py-3.5 bg-white text-black hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-2xl transition-all shadow-xl hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-[#0098EA]" />
                  <span>Connect Wallet for 1-Click Tip</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadQR}
                  className="py-2.5 px-3 bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save QR</span>
                </button>

                <a
                  href={qrValue.startsWith("ton://") ? qrValue : `ton://transfer/${walletAddress}`}
                  className="py-2.5 px-3 bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#0098EA]" />
                  <span>Open Wallet</span>
                </a>
              </div>
            </div>

          </div>
        )}

      </DialogContent>
    </Dialog>
  );
};

export default ArtistWalletQRModal;
