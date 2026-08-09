import React, { useState } from "react";
import { 
  X, 
  Heart, 
  Sparkles, 
  Send, 
  Coins, 
  Check, 
  Music, 
  ShieldCheck,
  TrendingUp,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Artist } from "@/types";
import { TON_LOGO, TJ_COIN_ICON } from "@/constants";
import { useAudio } from "@/contexts/AudioContext";
import confetti from "canvas-confetti";
import { toast } from "sonner";

interface ArtistTippingModalProps {
  artist: Artist | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ArtistTippingModal: React.FC<ArtistTippingModalProps> = ({
  artist,
  isOpen,
  onClose,
}) => {
  const { userProfile, setUserProfile, recordTransaction, addNotification } = useAudio();
  
  const [tokenType, setTokenType] = useState<"TON" | "JAM">("TON");
  const [amount, setAmount] = useState<string>("2.5");
  const [message, setMessage] = useState<string>("");
  const [songRequest, setSongRequest] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen || !artist) return null;

  const tonPresets = ["1.0", "2.5", "5.0", "10.0"];
  const jamPresets = ["50", "100", "250", "1000"];
  const activePresets = tokenType === "TON" ? tonPresets : jamPresets;

  const handleSendTip = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid tip amount");
      return;
    }

    // Check balance
    if (tokenType === "TON" && (userProfile.tonBalance || 5.0) < numAmount) {
      toast.error("Insufficient TON balance");
      return;
    }
    if (tokenType === "JAM" && (userProfile.jamBalance || 200) < numAmount) {
      toast.error("Insufficient JAM balance");
      return;
    }

    setIsSubmitting(true);

    // Simulate blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 1400));

    // Deduct balance locally
    setUserProfile((prev) => {
      if (tokenType === "TON") {
        return {
          ...prev,
          tonBalance: Math.max(0, (prev.tonBalance || 5.0) - numAmount),
          fanEngagementScore: (prev.fanEngagementScore || 0) + Math.round(numAmount * 10),
        };
      } else {
        return {
          ...prev,
          jamBalance: Math.max(0, (prev.jamBalance || 200) - numAmount),
          fanEngagementScore: (prev.fanEngagementScore || 0) + Math.round(numAmount / 2),
        };
      }
    });

    // Record transaction
    recordTransaction({
      type: "tip",
      amount: numAmount,
      platformFee: 0,
      artistShare: numAmount,
      recipientAddress: artist.walletAddress || "artist_wallet_ton",
      trackTitle: `Tip to ${artist.name}${songRequest ? ` (Req: ${songRequest})` : ""}`,
    });

    setIsSubmitting(false);
    setIsSuccess(true);

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });

    addNotification(
      `Tipped ${numAmount} ${tokenType} to ${artist.name}!`,
      "success"
    );

    setTimeout(() => {
      setIsSuccess(false);
      setMessage("");
      setSongRequest("");
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        className="w-full max-w-md bg-[#0A113A] rounded-2xl p-6 text-white relative shadow-2xl space-y-5"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9AA0AE] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={artist.avatarUrl}
              alt={artist.name}
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#0098EA]/40"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#0098EA] text-white p-1 rounded-full">
              <Heart className="w-3 h-3 fill-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-black text-white">{artist.name}</h3>
              {artist.verified && (
                <ShieldCheck className="w-4 h-4 text-[#0098EA] fill-[#0098EA]/20" />
              )}
            </div>
            <p className="text-xs text-[#9AA0AE]">Support artist directly on TON</p>
          </div>
        </div>

        {isSuccess ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-8 text-center space-y-3"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-white">Tip Sent Successfully!</h4>
            <p className="text-xs text-[#9AA0AE] max-w-xs mx-auto">
              Your support of <span className="text-white font-bold">{amount} {tokenType}</span> was delivered straight to {artist.name}'s wallet.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Currency Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA0AE] uppercase tracking-wider">
                Select Currency
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTokenType("TON");
                    setAmount("2.5");
                  }}
                  className={`p-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                    tokenType === "TON"
                      ? "bg-[#0098EA] text-white shadow-lg shadow-[#0098EA]/25"
                      : "bg-[#050A24] text-[#9AA0AE] hover:bg-white/5"
                  }`}
                >
                  <img src={TON_LOGO} alt="TON" className="w-4 h-4 object-contain" />
                  TON Coin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTokenType("JAM");
                    setAmount("100");
                  }}
                  className={`p-3 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                    tokenType === "JAM"
                      ? "bg-[#5B6BFF] text-white shadow-lg shadow-[#5B6BFF]/25"
                      : "bg-[#050A24] text-[#9AA0AE] hover:bg-white/5"
                  }`}
                >
                  <img src={TJ_COIN_ICON} alt="JAM" className="w-4 h-4 object-contain" />
                  JAM Token
                </button>
              </div>
            </div>

            {/* Presets & Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA0AE] uppercase tracking-wider">
                Tip Amount ({tokenType})
              </label>
              <div className="grid grid-cols-4 gap-2">
                {activePresets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      amount === val
                        ? "bg-white text-[#0A113A]"
                        : "bg-[#050A24] text-[#9AA0AE] hover:bg-white/5"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Custom amount"
                  className="w-full px-4 py-3 rounded-xl bg-[#050A24] text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#0098EA]"
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-[#9AA0AE]">
                  {tokenType}
                </span>
              </div>
            </div>

            {/* Optional Fan Note */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA0AE] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Fan Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a encouraging note for the artist..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl bg-[#050A24] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0098EA] resize-none"
              />
            </div>

            {/* Optional Song Request */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9AA0AE] uppercase tracking-wider flex items-center gap-1">
                <Music className="w-3.5 h-3.5 text-[#0098EA]" />
                Song Request / Acoustic Cut (Optional)
              </label>
              <input
                type="text"
                value={songRequest}
                onChange={(e) => setSongRequest(e.target.value)}
                placeholder="e.g. Play 'Solar Pulse' live acoustic"
                className="w-full px-3 py-2.5 rounded-xl bg-[#050A24] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#0098EA]"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleSendTip}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[linear-gradient(90deg,#0098EA_0%,#5B6BFF_100%)] text-white font-black text-xs uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#0098EA]/20"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Broadcasting Tip to TON...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send {amount} {tokenType} Tip
                </>
              )}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ArtistTippingModal;
