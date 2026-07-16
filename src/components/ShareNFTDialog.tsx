import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Copy, Check, Twitter, Send, Share2, Download, 
  Facebook, MessageCircle, Music, Gem 
} from 'lucide-react';
import { toast } from 'sonner';
import { NFTItem } from '@/types';

interface ShareNFTDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nft: NFTItem;
}

const ShareNFTDialog: React.FC<ShareNFTDialogProps> = ({ isOpen, onClose, nft }) => {
  const [copied, setCopied] = useState(false);
  const [shareType, setShareType] = useState<'nft' | 'track'>(nft.trackId ? 'track' : 'nft');

  // Generate deep link based on selection
  const shareUrl = shareType === 'track' && nft.trackId
    ? `${window.location.origin}/#/track/${nft.trackId}`
    : `${window.location.origin}/#/nft/${nft.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Deep link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShareTwitter = () => {
    const text = shareType === 'track'
      ? `Listen to "${nft.title}" by ${nft.artist} on @TonJam! 🎵🔥`
      : `Check out this digital collectible "${nft.title}" by ${nft.artist} on @TonJam! 💎🎵`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleShareTelegram = () => {
    const text = shareType === 'track'
      ? `Listen to "${nft.title}" by ${nft.artist} on TonJam!`
      : `Check out this digital collectible "${nft.title}" by ${nft.artist} on TonJam!`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = shareType === 'track'
      ? `Listen to "${nft.title}" by ${nft.artist} on TonJam! ${shareUrl}`
      : `Check out this digital collectible "${nft.title}" by ${nft.artist} on TonJam! ${shareUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('nft-qr-code');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-${nft.title}-${shareType}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-white/5 text-white p-0 overflow-hidden rounded-2xl max-h-[96vh] overflow-y-auto">
        <DialogHeader className="p-4 pb-2 sm:p-6 sm:pb-3 text-left">
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Signal Broadcast</span>
          </div>
          <DialogTitle className="text-lg sm:text-2xl font-black uppercase tracking-tighter">Share Artifact</DialogTitle>
          <DialogDescription className="text-zinc-500 text-[10px] sm:text-[11px] uppercase tracking-widest font-bold">
            Project your music or collectible across the mesh
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 pt-1 sm:p-6 sm:pt-2 space-y-4 sm:space-y-5">
          {/* Deep Link Target Switcher */}
          {nft.trackId && (
            <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl">
              <button
                onClick={() => setShareType('track')}
                className={`py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  shareType === 'track'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Music className="w-3 h-3" /> Music Track
              </button>
              <button
                onClick={() => setShareType('nft')}
                className={`py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  shareType === 'nft'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Gem className="w-3 h-3" /> Collectible NFT
              </button>
            </div>
          )}

          {/* NFT Preview Mini */}
          <div className="flex items-center gap-3 p-2.5 bg-white/[0.03] rounded-xl border border-white/5">
            <img 
              src={nft.imageUrl} 
              alt={nft.title} 
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover shadow-2xl border border-white/10"
            />
            <div className="min-w-0">
              <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                shareType === 'track' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
              }`}>
                {shareType === 'track' ? 'Deep Link: Track' : 'Deep Link: Collectible'}
              </span>
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight text-white truncate mt-1">{nft.title}</h4>
              <p className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-widest">By {nft.artist}</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-5 bg-white/[0.02] rounded-2xl border border-dashed border-white/10 relative group">
            <div className="bg-white p-2.5 rounded-xl shadow-[0_0_50px_rgba(255,255,255,0.1)]">
              <QRCodeSVG 
                id="nft-qr-code"
                value={shareUrl} 
                size={130}
                level="H"
                includeMargin={false}
              />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2.5 h-8 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white"
              onClick={downloadQRCode}
            >
              <Download className="w-3 h-3 mr-1.5" /> Download QR Code
            </Button>
          </div>

          {/* Sharing Links */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex gap-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="bg-black/40 border-white/10 text-[10px] font-mono text-zinc-400 h-9 sm:h-10 rounded-xl"
              />
              <Button 
                onClick={handleCopyLink}
                className="bg-white text-black hover:bg-zinc-200 h-9 sm:h-10 px-3 sm:px-4 rounded-xl shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button 
                onClick={handleShareTwitter}
                variant="outline"
                className="border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 text-white rounded-xl h-10 sm:h-12"
              >
                <Twitter className="w-3.5 h-3.5 mr-1.5 text-[#1DA1F2]" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Twitter / X</span>
              </Button>
              <Button 
                onClick={handleShareTelegram}
                variant="outline"
                className="border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 text-white rounded-xl h-10 sm:h-12"
              >
                <Send className="w-3.5 h-3.5 mr-1.5 text-[#24A1DE]" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Telegram</span>
              </Button>
              <Button 
                onClick={handleShareWhatsApp}
                variant="outline"
                className="border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 text-white rounded-xl h-10 sm:h-12"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-[#25D366]" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
              </Button>
              <Button 
                onClick={handleShareFacebook}
                variant="outline"
                className="border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 text-white rounded-xl h-10 sm:h-12"
              >
                <Facebook className="w-3.5 h-3.5 mr-1.5 text-[#1877F2]" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Facebook</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="p-3 bg-black/40 text-center">
            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">TonJam Protocol Engine V2.4</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareNFTDialog;
