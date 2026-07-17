import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  UserGroupIcon, 
  DocumentDuplicateIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { toast } from 'sonner';

export default function Referrals() {
  const { userProfile } = useAuth();
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  // Generate a mock referral link based on user ID or handle
  const referralCode = userProfile?.uid?.slice(0, 8) || 'TONJAM2026';
  const referralLink = `https://tonjam.app/join?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 pt-6 px-4 sm:px-6">
      
      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-full mb-2">
          <UserGroupIcon className="w-12 h-12 text-amber-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
          {t('refer.title')}
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto font-medium">
          {t('refer.desc')}
        </p>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card/50 backdrop-blur-md border border-border/50 rounded-3xl p-6 sm:p-10 relative overflow-hidden"
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">How it works</h2>
              <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                <li className="flex items-start gap-3">
                  <div className="bg-amber-500/20 text-amber-500 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <span>Share your unique referral link with friends, fans, and fellow artists.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-amber-500/20 text-amber-500 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <span>They sign up and connect their TON wallet to TonJam.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-amber-500/20 text-amber-500 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <span>You both receive <strong>50 JAM Coins</strong> and a 5% discount on marketplace fees for your next transaction!</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-background/80 border border-border/50 p-6 rounded-2xl space-y-4 text-center shadow-xl shadow-black/20">
            <h3 className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Your Referral Link</h3>
            
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
              <span className="font-mono text-sm break-all text-amber-400 select-all">
                {referralLink}
              </span>
              
              <button
                onClick={handleCopy}
                className="w-full bg-foreground text-background py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <DocumentDuplicateIcon className="w-5 h-5" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
            
            <p className="text-[10px] text-muted-foreground mt-4">
              Share this link directly or on your social media profiles.
            </p>
          </div>

        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="bg-card/50 border border-border/50 p-6 rounded-2xl text-center space-y-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Total Referrals</span>
          <p className="text-3xl font-black text-foreground">0</p>
        </div>
        <div className="bg-card/50 border border-border/50 p-6 rounded-2xl text-center space-y-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">JAM Earned</span>
          <p className="text-3xl font-black text-amber-500">0</p>
        </div>
        <div className="bg-card/50 border border-border/50 p-6 rounded-2xl text-center space-y-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Fee Discounts</span>
          <p className="text-3xl font-black text-emerald-400">0%</p>
        </div>
      </motion.div>

    </div>
  );
}
