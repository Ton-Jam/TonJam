import React, { useState } from 'react';
import { 
  Globe, 
  Twitter, 
  Instagram, 
  MessageCircle, 
  Calendar, 
  Languages, 
  FileText, 
  Wallet, 
  Check, 
  Copy 
} from 'lucide-react';
import { ProfileData } from './ProfileTypes';

interface AboutTabProps {
  profile: ProfileData;
}

export const AboutTab: React.FC<AboutTabProps> = ({ profile }) => {
  const [copied, setCopied] = useState(false);

  const copyWalletAddress = () => {
    if (profile.walletAddress) {
      navigator.clipboard.writeText(profile.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 text-white font-sans pb-8">
      
      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Biography & Metadata Table */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-[#101A3B] border border-white/5 rounded-[12px] p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#0052FF]" />
                <span>Biography</span>
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                {profile.bio || "No biography provided."}
              </p>
            </div>

            <div className="h-px bg-white/5" />

            {/* Quick Metadata fields */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Primary Genre
                </h4>
                <p className="text-sm font-semibold text-slate-200">
                  {profile.genre || 'Unspecified'}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Languages Spoken
                </h4>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {profile.languages?.map((lang) => (
                    <span key={lang} className="text-xs font-semibold text-slate-200 bg-white/5 px-2 py-0.5 rounded-md">
                      {lang}
                    </span>
                  )) || <span className="text-sm font-semibold text-slate-200">English</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Wallet and Verification block */}
          <div className="bg-[#101A3B] border border-white/5 rounded-[12px] p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-[#0052FF]" />
              <span>Identity Verification</span>
            </h3>

            <div className="space-y-3">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  TON Wallet Address
                </h4>
                {profile.walletAddress ? (
                  <div className="flex items-center justify-between bg-black/40 p-3 rounded-[8px] border border-white/5">
                    <span className="text-xs font-mono text-[#0052FF] truncate mr-2">
                      {profile.walletAddress}
                    </span>
                    <button
                      onClick={copyWalletAddress}
                      className="p-1.5 hover:bg-white/5 active:scale-95 rounded-md transition-all cursor-pointer shrink-0 text-slate-400 hover:text-white"
                      title="Copy Address"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No wallet connected.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Membership Status
                  </h4>
                  <p className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                    Premium Member
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Joined Platform
                  </h4>
                  <p className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{profile.memberSince}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Platforms Links */}
        <div className="md:col-span-4">
          <div className="bg-[#101A3B] border border-white/5 rounded-[12px] p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Social Links
            </h3>

            <div className="space-y-2.5">
              {profile.socials?.website && (
                <a
                  href={profile.socials.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-[8px] bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-[#0052FF]" />
                    <span>Website</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 shrink-0 truncate max-w-[120px]">
                    {profile.socials.website.replace(/^https?:\/\//, '')}
                  </span>
                </a>
              )}

              {profile.socials?.x && (
                <a
                  href={profile.socials.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-[8px] bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <Twitter className="w-4 h-4 text-slate-300 fill-current" />
                    <span>Twitter / X</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 shrink-0">
                    @krupy_beats
                  </span>
                </a>
              )}

              {profile.socials?.instagram && (
                <a
                  href={profile.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-[8px] bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <Instagram className="w-4 h-4 text-pink-400" />
                    <span>Instagram</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 shrink-0">
                    @krupy_beats
                  </span>
                </a>
              )}

              {profile.socials?.discord && (
                <a
                  href={profile.socials.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-[8px] bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-indigo-400 fill-current" />
                    <span>Discord</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 shrink-0">
                    Join Server
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
