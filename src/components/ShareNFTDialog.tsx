import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { NFTItem } from '@/types';
import { 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Send,
  Twitter,
  Image,
  Layers,
  Heart,
  QrCode,
  Music,
  Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import { TON_LOGO } from '@/constants';
import { cn } from '@/lib/utils';

interface ShareNFTDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nft: NFTItem;
}

type PreviewTheme = 'glass-synth' | 'cyberpunk-orange' | 'midnight-mono' | 'golden-aura';

export const ShareNFTDialog: React.FC<ShareNFTDialogProps> = ({
  isOpen,
  onClose,
  nft
}) => {
  const [activeTheme, setActiveTheme] = useState<PreviewTheme>('glass-synth');
  const [showPrice, setShowPrice] = useState(true);
  const [showAudioWaves, setShowAudioWaves] = useState(true);
  const [customCaption, setCustomCaption] = useState('Sonic Masterpiece');
  const [isCopied, setIsCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const getShareUrl = () => {
    return `${window.location.origin}/nft/${nft.id}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setIsCopied(true);
      toast.success("Link copied to clipboard!", {
        description: "Your network nodes are synced."
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShareTwitter = () => {
    const text = `Just discovered "${nft.title}" by ${nft.creator} on TonJam! 🎧 Live on TON Blockchain.\n\nCheck out the exclusive digital collectible here:\n`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareTelegram = () => {
    const text = `Check out "${nft.title}" by ${nft.creator} on TonJam! 💎`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  };

  const formatPrice = (pStr: string) => {
    const numeric = parseFloat(pStr);
    if (isNaN(numeric)) return pStr;
    return numeric.toFixed(2);
  };

  // Preset stylings for card previews (without solid outer border lines for clean, border-free design)
  const themeStyles: Record<PreviewTheme, {
    bg: string;
    text: string;
    accent: string;
    glow: string;
    overlay: string;
    badge: string;
    badgeText: string;
  }> = {
    'glass-synth': {
      bg: 'bg-gradient-to-br from-[#0c0f1d] via-[#101428] to-[#0a0d18]',
      text: 'text-white',
      accent: 'text-blue-400',
      glow: 'shadow-[0_0_50px_-12px_rgba(59,130,246,0.35)]',
      overlay: 'bg-gradient-to-t from-blue-500/10 to-transparent',
      badge: 'bg-blue-600/10 text-blue-400',
      badgeText: 'text-blue-400',
    },
    'cyberpunk-orange': {
      bg: 'bg-gradient-to-br from-[#120c08] via-[#1a110a] to-[#0d0805]',
      text: 'text-amber-50',
      accent: 'text-amber-400',
      glow: 'shadow-[0_0_50px_-12px_rgba(245,158,11,0.3)]',
      overlay: 'bg-gradient-to-t from-amber-500/10 to-transparent',
      badge: 'bg-amber-600/15 text-amber-400',
      badgeText: 'text-amber-400',
    },
    'midnight-mono': {
      bg: 'bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#070707]',
      text: 'text-zinc-100',
      accent: 'text-zinc-400',
      glow: 'shadow-[0_0_40px_-15px_rgba(255,255,255,0.15)]',
      overlay: 'bg-gradient-to-t from-zinc-500/5 to-transparent',
      badge: 'bg-zinc-800 text-zinc-300',
      badgeText: 'text-zinc-300',
    },
    'golden-aura': {
      bg: 'bg-gradient-to-br from-[#12100e] via-[#1e1711] to-[#0f0c08]',
      text: 'text-white',
      accent: 'text-[#e5c158]',
      glow: 'shadow-[0_0_50px_-12px_rgba(229,193,88,0.25)]',
      overlay: 'bg-gradient-to-t from-[#e5c158]/5 to-transparent',
      badge: 'bg-[#e5c158]/10 text-[#e5c158]',
      badgeText: 'text-[#e5c158]',
    }
  };

  const style = themeStyles[activeTheme];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-[#0a0d14]/98 md:max-w-xl rounded-2xl p-6 ring-1 ring-white/10 outline-none text-white my-auto overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-blue-500" />
            <DialogTitle className="text-sm font-black uppercase tracking-[0.25em]">
              Share On-Chain Collectible
            </DialogTitle>
          </div>
          <DialogDescription className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            Broadcast this signal through custom stylized preview relays
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          {/* Main Social Preview Card Render (9/12 cols spacing to give substantial space) */}
          <div className="md:col-span-7 flex flex-col items-center justify-center">
            {/* The actual preview block */}
            <div 
              ref={cardRef}
              className={cn(
                "relative w-full max-w-[280px] p-5 rounded-2xl transition-all duration-500 flex flex-col justify-between aspect-[3/4] overflow-hidden select-none",
                style.bg,
                style.glow
              )}
            >
              {/* Radial background decoration */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.02),transparent)] pointer-events-none" />
              <div className={cn("absolute inset-x-0 bottom-0 h-40 pointer-events-none z-0", style.overlay)} />

              {/* Card Header (Branding & Type) */}
              <div className="flex items-center justify-between z-10">
                <span className="text-[7.5px] font-black tracking-[0.3em] text-white/50 uppercase">
                  TONJAM SIGNAL
                </span>
                <span className={cn("px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider", style.badge)}>
                  {(nft as any).type || 'track'}
                </span>
              </div>

              {/* Center Artwork Placement */}
              <div className="relative aspect-square w-full my-4 rounded-xl overflow-hidden shadow-2xl z-10">
                <img 
                  src={nft.imageUrl || nft.coverUrl} 
                  alt={nft.title} 
                  className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
                
                {/* Decorative watermark / Overlay custom label */}
                {customCaption && (
                  <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs py-1 px-2 rounded-[4px] text-center">
                    <p className="text-[7px] font-mono font-black text-white/90 uppercase tracking-widest truncate">
                      {customCaption}
                    </p>
                  </div>
                )}
              </div>

              {/* Meta & Metadata details */}
              <div className="space-y-3 z-10">
                <div className="min-w-0">
                  <h3 className="text-xs font-black tracking-tight uppercase truncate font-display">
                    {nft.title}
                  </h3>
                  <p className="text-[8px] font-extrabold text-zinc-400 truncate uppercase mt-0.5">
                    by {nft.creator || nft.artist || 'Architect'}
                  </p>
                </div>

                {/* Extra dynamic visualization (simulating sound waves / TON status blocks) */}
                <div className="flex items-end justify-between gap-4 h-6">
                  {showAudioWaves ? (
                    <div className="flex items-end gap-0.5 h-full pb-1">
                      {[30, 75, 45, 90, 60, 80, 40, 70, 50, 85].map((h, i) => (
                        <div 
                          key={i} 
                          className="w-0.5 rounded-full bg-current opacity-70"
                          style={{ 
                            height: `${h}%`,
                            color: activeTheme === 'glass-synth' ? '#60a5fa' : activeTheme === 'cyberpunk-orange' ? '#fbbf24' : activeTheme === 'golden-aura' ? '#e5c158' : '#a1a1aa'
                          }} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Music className="h-3 w-3 opacity-40 text-zinc-400" />
                      <span className="text-[7.5px] font-mono text-zinc-500 uppercase">SIGNAL SYNCED</span>
                    </div>
                  )}

                  {/* QR code block placeholder */}
                  <div className="bg-white p-0.5 rounded-sm flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity">
                    <QrCode className="h-5 w-5 text-zinc-950" />
                  </div>
                </div>

                {/* Bottom Stats details Block */}
                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                  <div className="flex flex-col">
                    <span className="text-[6.5px] font-black text-zinc-500 uppercase tracking-widest">
                      EDITION
                    </span>
                    <span className="text-[8.5px] font-mono font-black mt-0.5">
                      {nft.edition || '1 of 1'}
                    </span>
                  </div>

                  {showPrice && (
                    <div className="flex flex-col items-end">
                      <span className="text-[6.5px] font-black text-zinc-500 uppercase tracking-widest">
                        VALUE
                      </span>
                      <span className={cn("text-[9px] font-mono font-black mt-0.5 flex items-center gap-0.5", style.badgeText)}>
                        <img src={TON_LOGO} alt="TON" className="h-2.5 w-2.5 saturate-100" />
                        {formatPrice(nft.price)} TON
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Configuration controls panel (5/12 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Preset selection buttons */}
              <div className="space-y-2">
                <label className="text-[8.5px] font-black text-zinc-400 uppercase tracking-[0.25em] flex items-center gap-1">
                  <Layers className="h-3 w-3 text-blue-500" /> Visual Dimension
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['glass-synth', 'cyberpunk-orange', 'midnight-mono', 'golden-aura'] as PreviewTheme[]).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setActiveTheme(theme)}
                      className={cn(
                        "py-2 px-3 text-[8.5px] font-black uppercase tracking-wider rounded-[4px] cursor-pointer transition-all",
                        activeTheme === theme
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                          : "bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-white"
                      )}
                    >
                      {theme.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Switches */}
              <div className="space-y-2 pt-2">
                <label className="text-[8.5px] font-black text-zinc-400 uppercase tracking-[0.25em]">
                  Card Diagnostics
                </label>
                <div className="space-y-2 bg-white/[0.015] p-3 rounded-[6px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
                      Display Valuation
                    </span>
                    <button
                      onClick={() => setShowPrice(!showPrice)}
                      className={cn(
                        "w-7 h-4 rounded-full p-0.5 transition-all outline-none duration-300",
                        showPrice ? "bg-blue-600 flex justify-end" : "bg-zinc-800 flex justify-start"
                      )}
                    >
                      <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
                      Waveform Visuals
                    </span>
                    <button
                      onClick={() => setShowAudioWaves(!showAudioWaves)}
                      className={cn(
                        "w-7 h-4 rounded-full p-0.5 transition-all outline-none duration-300",
                        showAudioWaves ? "bg-blue-600 flex justify-end" : "bg-zinc-800 flex justify-start"
                      )}
                    >
                      <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Watermark/Caption Text Input */}
              <div className="space-y-1.5">
                <label className="text-[8.5px] font-black text-zinc-400 uppercase tracking-[0.25em]">
                  Watermark Text
                </label>
                <input
                  type="text"
                  maxLength={25}
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.08] text-[10px] font-bold text-white px-3 py-2 rounded-[4px] border border-white/5 focus:border-blue-500/30 outline-none transition-all uppercase tracking-wider"
                  placeholder="E.G., COLLECTOR SPECIAL"
                />
              </div>
            </div>

            {/* Simulated actions list */}
            <div className="pt-4 space-y-2">
              <Button
                variant="default"
                onClick={() => {
                  toast.success("Card Artifact Generated Successfully", {
                    description: "High-fidelity rendering downloaded to native device nodes."
                  });
                }}
                className="w-full bg-white hover:bg-zinc-100 text-zinc-950 text-[9px] font-black uppercase tracking-widest py-2 rounded-lg cursor-pointer flex items-center justify-center gap-2 h-9"
              >
                <Download className="h-3.5 w-3.5 text-zinc-900" /> Export Graphic
              </Button>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={handleCopyLink}
                  className="py-1.5 px-2 bg-white/[0.02] hover:bg-white/[0.06] text-white hover:text-blue-400 rounded-[4px] transition-all cursor-pointer flex items-center justify-center gap-1"
                  title="Copy Link Address"
                >
                  {isCopied ? (
                    <Check className="h-3.5 w-3.5 text-green-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span className="text-[8px] font-extrabold uppercase tracking-wider">Copy</span>
                </button>

                <button
                  onClick={handleShareTwitter}
                  className="py-1.5 px-2 bg-white/[0.02] hover:bg-white/[0.06] text-white hover:text-blue-400 rounded-[4px] transition-all cursor-pointer flex items-center justify-center gap-1"
                  title="Share in Twitter Feed"
                >
                  <Twitter className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-[8px] font-extrabold uppercase tracking-wider">X.com</span>
                </button>

                <button
                  onClick={handleShareTelegram}
                  className="py-1.5 px-2 bg-white/[0.02] hover:bg-white/[0.06] text-white hover:text-blue-400 rounded-[4px] transition-all cursor-pointer flex items-center justify-center gap-1"
                  title="Forward to Telegram Channels"
                >
                  <Send className="h-3.5 w-3.5 text-sky-300" />
                  <span className="text-[8px] font-extrabold uppercase tracking-wider">Tg</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareNFTDialog;
