import React, { useState } from 'react';
import { User, Globe, Link, X, Check, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/components/layout/ToastProvider';
import { ProfileData } from '@/components/profile/ProfileTypes';

interface ManageProfileProps {
  profile: ProfileData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: Partial<ProfileData>) => void;
}

export const ManageProfile: React.FC<ManageProfileProps> = ({
  profile,
  isOpen,
  onClose,
  onSave
}) => {
  const toast = useToast();
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio || '');
  const [genre, setGenre] = useState(profile.genre || '');
  const [country, setCountry] = useState(profile.country || '');
  const [website, setWebsite] = useState(profile.socials?.website || '');
  const [xSocial, setXSocial] = useState(profile.socials?.x || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      onSave({
        name,
        bio,
        genre,
        country,
        socials: {
          ...profile.socials,
          website,
          x: xSocial
        }
      });
      toast.success('Profile Updated', 'Your ecosystem profile was synchronized with the database node.');
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#050A24] border border-white/5 rounded-[24px] max-w-md w-full text-white relative flex flex-col max-h-[90vh] shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Manage Profile
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 no-scrollbar">
              {/* Display Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#101A3B] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-[#0052FF] transition-all"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Biography</span>
                  <span className="text-slate-500 font-mono">{bio.length}/160</span>
                </div>
                <textarea
                  maxLength={160}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Pioneering soundscapes on TON..."
                  className="w-full bg-[#101A3B] border border-white/5 rounded-xl p-3 text-xs font-semibold outline-none focus:border-[#0052FF] transition-all resize-none"
                />
              </div>

              {/* Genre / Country Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Primary Genre
                  </label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Synthwave / Ambient"
                    className="w-full bg-[#101A3B] border border-white/5 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#0052FF] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Location / Country
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="United Kingdom"
                      className="w-full bg-[#101A3B] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-[#0052FF] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Social URLs */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                  Ecosystem Social Nodes
                </span>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Website URL
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="w-full bg-[#101A3B] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-[#0052FF] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    X Profile (Twitter)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-slate-500">@</span>
                    <input
                      type="text"
                      value={xSocial.replace('https://x.com/', '')}
                      onChange={(e) => setXSocial(`https://x.com/${e.target.value}`)}
                      placeholder="username"
                      className="w-full bg-[#101A3B] border border-white/5 rounded-xl pl-8 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-[#0052FF] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={onClose}
                  className="py-3 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-bold uppercase tracking-widest rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-3 bg-[#0052FF] hover:bg-[#0040D9] active:scale-95 transition-all text-xs font-bold uppercase tracking-widest rounded-xl text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ManageProfile;
