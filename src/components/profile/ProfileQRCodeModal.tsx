import React, { useState, useRef } from 'react';
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
  MessageCircle, QrCode, Camera, Sparkles, CheckCircle2, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../QRScanner';

export interface ProfileShareData {
  name: string;
  username: string;
  avatar?: string;
  role?: string;
  bio?: string;
  profileUrl?: string;
  isVerified?: boolean;
  uid?: string;
}

interface ProfileQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileShareData;
}

export const ProfileQRCodeModal: React.FC<ProfileQRCodeModalProps> = ({ 
  isOpen, 
  onClose, 
  profile 
}) => {
  const [copied, setCopied] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const qrCardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Construct absolute canonical share URL
  const shareUrl = profile.profileUrl 
    ? profile.profileUrl 
    : profile.uid 
      ? `${window.location.origin}/#/user/${profile.uid}` 
      : `${window.location.origin}/#/profile`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Profile link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} on TonJam`,
          text: `Check out ${profile.name}'s profile on TonJam! 🎵`,
          url: shareUrl
        });
        toast.success("Shared successfully!");
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareTwitter = () => {
    const text = `Connect with ${profile.name} (@${profile.username}) on @TonJam! 🎵💎`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleShareTelegram = () => {
    const text = `Check out ${profile.name} on TonJam!`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = `Check out ${profile.name} on TonJam! ${shareUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('profile-qr-code-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set generous canvas resolution for crisp image output
      canvas.width = 400;
      canvas.height = 480;

      if (ctx) {
        // Background card fill
        ctx.fillStyle = '#090e27';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header text: TonJam Logo
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TONJAM MUSIC NETWORK', canvas.width / 2, 40);

        // Name & Username
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(profile.name, canvas.width / 2, 75);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px sans-serif';
        ctx.fillText(`@${profile.username}`, canvas.width / 2, 98);

        // White container background for QR code
        const qrSize = 240;
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = 125;
        const padding = 16;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(qrX - padding, qrY - padding, qrSize + (padding * 2), qrSize + (padding * 2), 16);
        ctx.fill();

        // Draw the QR Code image
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

        // Footer note
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('SCAN TO CONNECT & DISCOVER', canvas.width / 2, 440);
      }

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `TonJam-QR-${profile.username}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success("QR Code card downloaded!");
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleQRScanResult = (scannedData: string | null) => {
    setShowScanner(false);
    if (!scannedData) return;

    toast.success("QR Code scanned!");
    // Check if URL or route path
    if (scannedData.includes('/#/')) {
      const targetRoute = scannedData.split('/#/')[1];
      if (targetRoute) {
        navigate(`/${targetRoute}`);
        onClose();
      }
    } else if (scannedData.startsWith('http')) {
      window.open(scannedData, '_blank');
    } else {
      toast.info(`Scanned: ${scannedData}`);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-[#070d24] text-white p-0 overflow-hidden rounded-2xl max-h-[96vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <DialogHeader className="p-4 pb-2 sm:p-6 sm:pb-3 text-left bg-[#05091a]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">Profile Identity</span>
              </div>
              <button
                onClick={() => setShowScanner(true)}
                className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Camera className="w-3 h-3" />
                <span>Scan QR</span>
              </button>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mt-1">
              Share Profile
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              Scan or send QR code for instant fan and artist discovery
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 pt-2 sm:p-6 sm:pt-3 space-y-5">
            {/* Profile Card Preview */}
            <div 
              ref={qrCardRef}
              className="flex flex-col items-center text-center p-5 bg-[#090f2b] rounded-2xl relative overflow-hidden"
            >
              <div className="relative mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-slate-900 ring-2 ring-blue-500/30 shadow-md">
                  <img 
                    src={profile.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&h=300&q=80'} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {profile.isVerified && (
                  <div className="absolute -bottom-1 -right-1 p-1 bg-blue-600 text-white rounded-full shadow">
                    <Sparkles className="w-3 h-3" />
                  </div>
                )}
              </div>

              <div className="space-y-0.5 mb-4">
                <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-white flex items-center justify-center gap-1.5">
                  <span>{profile.name}</span>
                  {profile.isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                </h3>
                <p className="text-xs font-mono text-slate-400">@{profile.username}</p>
                {profile.role && (
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-500/10 text-blue-300 rounded-full text-[9.5px] font-bold uppercase tracking-wider">
                    {profile.role}
                  </span>
                )}
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-3.5 rounded-2xl shadow-xl flex flex-col items-center">
                <QRCodeSVG 
                  id="profile-qr-code-svg"
                  value={shareUrl} 
                  size={150}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-3.5 h-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5"
                onClick={downloadQRCode}
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> Save QR Code Image
              </Button>
            </div>

            {/* Sharing Input & Buttons */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  value={shareUrl} 
                  readOnly 
                  className="bg-[#040817] text-[10.5px] font-mono text-slate-300 h-10 rounded-xl"
                />
                <Button 
                  onClick={handleCopyLink}
                  className="bg-blue-600 hover:bg-blue-500 text-white h-10 px-4 rounded-xl shrink-0 font-bold text-xs"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <Button 
                    onClick={handleNativeShare}
                    className="bg-slate-800 hover:bg-slate-700 text-white h-10 px-3 rounded-xl shrink-0"
                    title="Share via App"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button 
                  onClick={handleShareTwitter}
                  variant="outline"
                  className="bg-[#090f2a] hover:bg-[#0f1840] text-white rounded-xl h-10 px-2"
                >
                  <Twitter className="w-3.5 h-3.5 mr-1 text-[#1DA1F2]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Twitter</span>
                </Button>
                <Button 
                  onClick={handleShareTelegram}
                  variant="outline"
                  className="bg-[#090f2a] hover:bg-[#0f1840] text-white rounded-xl h-10 px-2"
                >
                  <Send className="w-3.5 h-3.5 mr-1 text-[#24A1DE]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Telegram</span>
                </Button>
                <Button 
                  onClick={handleShareWhatsApp}
                  variant="outline"
                  className="bg-[#090f2a] hover:bg-[#0f1840] text-white rounded-xl h-10 px-2"
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-1 text-[#25D366]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#030612] text-center">
            <p className="text-[8.5px] font-bold text-slate-500 uppercase tracking-[0.3em]">
              TonJam Identity Mesh Protocol
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera QR Scanner Overlay */}
      {showScanner && (
        <QRScanner 
          onClose={() => setShowScanner(false)} 
          onScan={handleQRScanResult} 
        />
      )}
    </>
  );
};

export default ProfileQRCodeModal;
