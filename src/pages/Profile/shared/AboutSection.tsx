import React from 'react';
import { Globe, Calendar, Music, Sparkles, ShieldCheck, Mail, ArrowUpRight } from 'lucide-react';
import { ProfileData } from '@/components/profile/ProfileTypes';

interface AboutSectionProps {
  profile: ProfileData;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
  return (
    <div className="space-y-6 text-white font-sans pb-8">
      {/* Bio Card */}
      <div className="bg-[#101A3B] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          The Sonic Narrative
        </h4>
        <p className="text-sm leading-relaxed text-slate-200">
          {profile.bio || 'No biography has been added to this profile node yet.'}
        </p>

        {/* Location & member specs info */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5 text-xs text-slate-400">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Home Node</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Globe className="w-4 h-4 text-slate-500" />
              <span>{profile.country || 'Global Universe'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Active Since</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Joined {profile.memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Social Nodes Grid */}
      {profile.socials && (
        <div className="bg-[#101A3B] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Social Networks & Ecosystem Links
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {profile.socials.website && (
              <a
                href={profile.socials.website}
                target="_blank"
                rel="noreferrer"
                className="bg-white/5 hover:bg-white/10 p-3.5 rounded-xl border border-white/5 flex items-center justify-between group transition-colors cursor-pointer text-slate-200 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4.5 h-4.5 text-[#0052FF]" />
                  <span className="text-xs font-bold">Personal Website</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </a>
            )}

            {profile.socials.spotify && (
              <a
                href={profile.socials.spotify}
                target="_blank"
                rel="noreferrer"
                className="bg-white/5 hover:bg-white/10 p-3.5 rounded-xl border border-white/5 flex items-center justify-between group transition-colors cursor-pointer text-slate-200 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <Music className="w-4.5 h-4.5 text-emerald-400" />
                  <span className="text-xs font-bold">Spotify Verified</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </a>
            )}

            {profile.socials.x && (
              <a
                href={profile.socials.x}
                target="_blank"
                rel="noreferrer"
                className="bg-white/5 hover:bg-white/10 p-3.5 rounded-xl border border-white/5 flex items-center justify-between group transition-colors cursor-pointer text-slate-200 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black font-mono text-slate-400 w-4.5 text-center">X</span>
                  <span className="text-xs font-bold">X (Twitter)</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </a>
            )}

            {profile.socials.telegram && (
              <a
                href={profile.socials.telegram}
                target="_blank"
                rel="noreferrer"
                className="bg-white/5 hover:bg-white/10 p-3.5 rounded-xl border border-white/5 flex items-center justify-between group transition-colors cursor-pointer text-slate-200 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black font-mono text-blue-400 w-4.5 text-center">TG</span>
                  <span className="text-xs font-bold">Telegram Community</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutSection;
