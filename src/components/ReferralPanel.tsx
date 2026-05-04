import React, { useState } from 'react';
import { Users, Copy, CheckCircle2, Gift, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAudio } from '@/context/AudioContext';
import { shareContent } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ReferralPanel: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [showInvitedModal, setShowInvitedModal] = useState(false);
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

  const handleShare = async () => {
    const result = await shareContent({
      title: 'Join TonJam',
      text: 'Join me on TonJam and earn TJ tokens!',
      url: referralLink,
    });

    if (result.success) {
      if (result.method === 'clipboard') {
        addNotification("Referral link copied to clipboard!", "success");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <div className="space-y-1">
      <div className="glass bg-foreground/[0.01] rounded-xl p-2">
        <div className="flex flex-col gap-1">
          <div className="flex-1 space-y-1">
            <div className="inline-flex items-center gap-1 px-1.5 py-1 rounded-full bg-muted/50 text-muted-foreground text-[8px] font-bold uppercase tracking-widest mb-1">
              <Users className="w-2.5 h-2.5" />
              <span>Invite & Earn</span>
            </div>
            <h2 className="text-[16px] font-black uppercase tracking-tighter text-foreground">
              Refer Friends, Earn TJ
            </h2>
            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-md">
              Invite friends. Both get 50 TJ when they complete a daily task.
            </p>
            
            <div className="flex items-center gap-1 mt-1">
              <div className="flex-1 bg-background/50 rounded-lg p-1.5 flex items-center justify-between">
                <span className="text-[9px] font-mono text-muted-foreground truncate mr-1">{referralLink}</span>
                <button 
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-muted rounded-md transition-colors text-foreground"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button 
                onClick={handleShare}
                className="bg-blue-600 hover:bg-blue-500 text-foreground p-2 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all flex items-center justify-center"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="w-full flex flex-row gap-1 mt-1">
            <button 
              onClick={() => setShowInvitedModal(true)}
              className="bg-muted/30 rounded-lg p-1.5 flex-1 flex flex-col items-center justify-center hover:bg-muted/50 transition-colors"
            >
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Invited</span>
              <span className="text-[16px] font-black text-foreground">{referredCount}</span>
            </button>
            <div className="bg-amber-500/10 rounded-lg p-1.5 flex-1 flex flex-col items-center justify-center">
              <span className="text-[8px] font-bold text-amber-500/80 uppercase tracking-widest mb-0.5">Earned</span>
              <span className="text-[16px] font-black text-amber-500">{totalEarned}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1">
        {[
          { step: 1, title: 'Share Link', desc: 'Send your unique link' },
          { step: 2, title: 'Friends Join', desc: 'They sign up & connect wallet' },
          { step: 3, title: 'Earn Rewards', desc: 'Both get 50 TJ' }
        ].map((item) => (
          <div key={item.step} className="glass bg-foreground/[0.01] rounded-lg p-1.5 group flex items-center gap-2">
            <div className="text-[24px] font-black text-muted/20 group-hover:text-muted/40 transition-colors">
              {item.step}
            </div>
            <div>
              <h3 className="text-[12px] font-bold text-foreground">{item.title}</h3>
              <p className="text-[9px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showInvitedModal} onOpenChange={setShowInvitedModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Referred Users</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">No referred users found.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReferralPanel;
