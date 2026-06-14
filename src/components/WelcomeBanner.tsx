import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Sparkles, X } from 'lucide-react';

interface WelcomeBannerProps {
  onDismiss: () => void;
  onGetTokens: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onDismiss, onGetTokens }) => {
  return (
    <motion.div 
      className="section-container"
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
    >
      <Card className="relative overflow-hidden border-none bg-transparent dark:bg-black text-foreground rounded-2xl">
        <button 
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors z-20 text-muted-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            
            <div className="space-y-3 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Welcome to TonJam</h2>
                <Badge variant="outline" className="w-fit mx-auto md:mx-0 bg-secondary border-border text-foreground uppercase text-[8px] tracking-[0.2em]">v2.1_CORE</Badge>
              </div>
              <p className="text-muted-foreground font-medium max-w-xl text-sm leading-relaxed">
                You've just entered the future of music. Discover decentralized sounds, collect rare NFTs, and connect with your favorite artists on the TON blockchain.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                <button 
                  onClick={onDismiss}
                  className="px-6 py-2 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-full text-[10px] hover:bg-primary/90 transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  Start Exploring
                </button>
                <button 
                  onClick={onGetTokens}
                  className="px-6 py-2 bg-secondary text-foreground font-black uppercase tracking-widest rounded-full text-[10px] hover:bg-secondary/80 transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  Get Free Tokens
                </button>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 blur-3xl rounded-full"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/5 blur-3xl rounded-full"></div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WelcomeBanner;
