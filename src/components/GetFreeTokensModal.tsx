import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Wallet, UserCircle, Users, Trophy, X, ArrowRight, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GetFreeTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TokenStep = ({ icon: Icon, title, description, index }: { icon: any, title: string, description: string, index: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 + 0.2 }}
    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
  >
    <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
      <Icon className="w-3.5 h-3.5 text-blue-400" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-[10px] font-black uppercase tracking-tight text-white">{title}</h4>
      <p className="text-[9px] text-white/50 leading-tight mt-0.5">{description}</p>
    </div>
  </motion.div>
);

const GetFreeTokensModal: React.FC<GetFreeTokensModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleStartNow = () => {
    onClose();
    navigate('/tasks');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-[380px] p-0 overflow-hidden bg-[#0a0a0a] shadow-2xl shadow-blue-500/10 rounded-[28px] border-none">
        <div className="relative">
          {/* Header Background Decoration */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-blue-600/20 to-transparent" />
          
          <div className="relative p-5 space-y-5">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-[9px] font-black uppercase tracking-widest text-blue-400">
                  <Sparkles className="w-2.5 h-2.5" /> Protocol Reward
                </div>
                <DialogTitle className="text-xl font-black uppercase tracking-tighter text-white">
                  Get Free <span className="text-blue-500">TJ Tokens</span>
                </DialogTitle>
                <DialogDescription className="text-[10px] text-white/40 font-medium">
                  Complete these steps to fuel your TonJam journey.
                </DialogDescription>
              </div>
            </div>

            <div className="grid gap-1.5">
              <TokenStep 
                index={0}
                icon={Wallet} 
                title="Connect Wallet" 
                description="Link your TON wallet to verify identity."
              />
              <TokenStep 
                index={1}
                icon={UserCircle} 
                title="Profile Sync" 
                description="Complete your artist or collector setup."
              />
              <TokenStep 
                index={2}
                icon={Trophy} 
                title="Daily Quests" 
                description="Participate in challenges and earn rewards."
              />
              <TokenStep 
                index={3}
                icon={Users} 
                title="Referral Link" 
                description="Invite friends and earn a percentage."
              />
            </div>

            <div 
              onClick={handleStartNow}
              className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white relative overflow-hidden group cursor-pointer"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-80">Current Bonus</p>
                  <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                    <Coins className="w-4 h-4" /> 100 TJ Welcome
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              {/* Decorative Glow */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 blur-2xl rounded-full" />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={onClose} 
                className="flex-1 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[9px] transition-all"
              >
                Maybe Later
              </Button>
              <Button 
                onClick={handleStartNow} 
                className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-blue-600/20 transition-all"
              >
                Start Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GetFreeTokensModal;
