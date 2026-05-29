import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Disc as Discord, Github, Mail, Globe, MessageSquare, Instagram } from 'lucide-react';
import { TON_LOGO } from '@/constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/60 backdrop-blur-3xl border-t border-white/5 pt-16 pb-8 px-6 mt-20 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="w-full px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all">
                <img src={TON_LOGO} alt="TonJam" className="w-6 h-6" />
              </div>
              <span className="text-xl font-black uppercase tracking-tighter">TonJam</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The premier decentralized music protocol and NFT marketplace built on the TON blockchain. Empowering artists and collectors in the next sonic evolution.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:-translate-y-1">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:-translate-y-1">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:-translate-y-1">
                <Discord className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:-translate-y-1">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Marketplace Column */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Marketplace</h4>
            <ul className="space-y-3">
              <li><Link to="/marketplace" className="text-sm text-muted-foreground hover:text-white transition-colors">All NFTs</Link></li>
              <li><Link to="/marketplace?filter=trending" className="text-sm text-muted-foreground hover:text-white transition-colors">Trending</Link></li>
              <li><Link to="/marketplace?filter=auctions" className="text-sm text-muted-foreground hover:text-white transition-colors">Live Auctions</Link></li>
              <li><Link to="/marketplace?filter=genesis" className="text-sm text-muted-foreground hover:text-white transition-colors">Genesis Drops</Link></li>
            </ul>
          </div>

          {/* Artist Column */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">For Artists</h4>
            <ul className="space-y-3">
              <li><Link to="/artist-dashboard" className="text-sm text-muted-foreground hover:text-white transition-colors">Artist Portal</Link></li>
              <li><Link to="/mint" className="text-sm text-muted-foreground hover:text-white transition-colors">Mint Protocols</Link></li>
              <li><Link to="/analytics" className="text-sm text-muted-foreground hover:text-white transition-colors">Performance</Link></li>
              <li><Link to="/tasks" className="text-sm text-muted-foreground hover:text-white transition-colors">Earn Tokens</Link></li>
            </ul>
          </div>

          {/* Platform Column */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Resource</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-white transition-colors">Whitepaper</Link></li>
              <li><Link to="/help" className="text-sm text-muted-foreground hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-white transition-colors">Privacy Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            © 2026 TONJAM PROTOCOL. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">TON Mainnet Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
