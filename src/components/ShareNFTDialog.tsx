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
import { Copy, Check, Twitter, Send, Share2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { NFTItem } from '@/types';

interface ShareNFTDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nft: NFTItem;
}

const ShareNFTDialog: React.FC<ShareNFTDialogProps> = ({ isOpen, onClose, nft }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleShareTwitter = () => {
    const text = `Check out this digital artifact "${nft.title}" by ${nft.artist} on @TonJam! 🎵💎`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleShareTelegram = () => {
    const text = `Check out this digital artifact "${nft.title}" by ${nft.artist} on TonJam!`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
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
      downloadLink.download = `QR-${nft.title}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-white/5 text-white p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Signal Broadcast</span>
          </div>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Share Artifact</DialogTitle>
          <DialogDescription className="text-zinc-500 text-[11px] uppercase tracking-widest font-bold">
            Project your collection across the digital mesh
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-6">
          {/* NFT Preview Mini */}
          <div className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-xl border border-white/5">
            <img 
              src={nft.imageUrl} 
              alt={nft.title} 
              className="w-16 h-16 rounded-lg object-cover shadow-2xl border border-white/10"
            />
            <div className="min-w-0">
              <h4 className="font-black uppercase tracking-tight text-white truncate">{nft.title}</h4>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">By {nft.artist}</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center p-6 bg-white/[0.02] rounded-2xl border border-dashed border-white/10 relative group">
            <div className="bg-white p-3 rounded-xl shadow-[0_0_50px_rgba(255,255,255,0.1)]">
              <QRCodeSVG 
                id="nft-qr-code"
                value={shareUrl} 
                size={160}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/logo.png", // Assuming logo exists
                  x: undefined,
                  y: undefined,
                  height: 30,
                  width: 30,
                  excavate: true,
                }}
              />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-4 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white"
              onClick={downloadQRCode}
            >
              <Download className="w-3 h-3 mr-2" /> Download QR Code
            </Button>
          </div>

          {/* Sharing Links */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={shareUrl} 
                readOnly 
                className="bg-black/40 border-white/10 text-[10px] font-mono text-zinc-400 h-10 rounded-xl"
              />
              <Button 
                onClick={handleCopyLink}
                className="bg-white text-black hover:bg-zinc-200 h-10 px-4 rounded-xl shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleShareTwitter}
                variant="outline"
                className="border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 text-white rounded-xl h-12"
              >
                <Twitter className="w-4 h-4 mr-2 text-[#1DA1F2]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Twitter / X</span>
              </Button>
              <Button 
                onClick={handleShareTelegram}
                variant="outline"
                className="border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 text-white rounded-xl h-12"
              >
                <Send className="w-4 h-4 mr-2 text-[#24A1DE]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Telegram</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-black/40 text-center">
            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">TonJam Protocol Engine V2.4</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareNFTDialog;
