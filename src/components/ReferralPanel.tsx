import React, { useState } from 'react';
import { Users, Copy, CheckCircle2, Gift, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAudio } from '@/context/AudioContext';

const ReferralPanel: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const { addNotification } = useAudio();
  const referralLink = "https://t.me/tonjam_bot?start=ref_123456";
  const referredCount = 3;
  const totalEarned = 150;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    addNotification("Referral link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join TonJam',
        text: 'Join me on TonJam and earn TJ tokens!',
        url: referralLink,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-2">
      <div className="glass bg-foreground/[0.01] rounded-2xl p-2">
        <div className="flex flex-col items-center justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-2 px-2 py-2 rounded-full bg-muted/50 text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2">
              <Users className="w-3 h-3" />
              <span>Invite & Earn</span>
            </div>
            <h2 className="text-[20px] font-black uppercase tracking-tighter text-foreground">
              Refer Friends, Earn TJ
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              Invite your friends to join TonJam. You'll both receive 50 TJ tokens when they complete their first daily task.
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-background/50 rounded-xl p-2 flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground truncate mr-2">{referralLink}</span>
                <button 
                  onClick={handleCopy}
                  className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button 
                onClick={handleShare}
                className="bg-blue-600 hover:bg-blue-500 text-foreground px-2 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
          
          <div className="w-full flex flex-row gap-2">
            <div className="bg-muted/30 rounded-xl p-2 flex-1 flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Invited</span>
              <span className="text-[20px] font-black text-foreground">{referredCount}</span>
            </div>
            <div className="bg-amber-500/10 rounded-xl p-2 flex-1 flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-widest mb-2">Earned</span>
              <span className="text-[20px] font-black text-amber-500">{totalEarned}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {[
          { step: 1, title: 'Share Link', desc: 'Send your unique referral link to friends' },
          { step: 2, title: 'Friends Join', desc: 'They sign up and connect their wallet' },
          { step: 3, title: 'Earn Rewards', desc: 'You both get 50 TJ when they complete a task' }
        ].map((item) => (
          <div key={item.step} className="glass bg-foreground/[0.01] rounded-xl p-2 relative overflow-hidden group flex items-center gap-2">
            <div className="text-[32px] font-black text-muted/20 group-hover:text-muted/40 transition-colors">
              {item.step}
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferralPanel;
