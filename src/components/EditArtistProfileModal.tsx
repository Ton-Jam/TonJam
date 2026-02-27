import React, { useState } from 'react';
import { UserPen, X, Twitter, Send, Music, Globe } from 'lucide-react';
import { Artist } from '@/types';
import { useAudio } from '@/context/AudioContext';

interface EditArtistProfileModalProps {
  artist: Artist;
  onClose: () => void;
}

const EditArtistProfileModal: React.FC<EditArtistProfileModalProps> = ({ artist, onClose }) => {
  const { addNotification } = useAudio();
  const [name, setName] = useState(artist.name);
  const [bio, setBio] = useState(artist.bio || '');
  const [socials, setSocials] = useState({
    x: artist.socials?.x || '',
    spotify: artist.socials?.spotify || '',
    instagram: artist.socials?.instagram || '',
    website: artist.socials?.website || '',
    telegram: artist.socials?.telegram || ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    /* In a real app, this would call an API */
    addNotification("Neural profile updated successfully.", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative glass border border-blue-500/10 w-full max-w-2xl rounded-[10px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 blur-3xl rounded-full"></div>
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-[10px] flex items-center justify-center shadow-lg shadow-purple-600/20">
              <UserPen className="text-white h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tighter text-white">Edit Neural Profile</h2>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Update your identity on the TON network</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 no-scrollbar">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Artist Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 rounded-[10px] py-3 px-5 text-xs outline-none focus:border-purple-500/50 transition-all text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Origin Narrative (Bio)</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full bg-white/5 rounded-[10px] py-3 px-5 text-xs outline-none focus:border-purple-500/50 transition-all text-white resize-none" placeholder="Describe your sonic journey..." />
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-4">Social Relay Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-1">X (Twitter)</label>
                  <div className="relative">
                    <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 h-3 w-3" />
                    <input type="text" value={socials.x} onChange={(e) => setSocials({ ...socials, x: e.target.value })} className="w-full bg-white/5 rounded-[10px] py-3 pl-10 pr-5 text-[10px] outline-none focus:border-blue-400/50 transition-all text-white" placeholder="https://x.com/..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-1">Telegram</label>
                  <div className="relative">
                    <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 h-3 w-3" />
                    <input type="text" value={socials.telegram} onChange={(e) => setSocials({ ...socials, telegram: e.target.value })} className="w-full bg-white/5 rounded-[10px] py-3 pl-10 pr-5 text-[10px] outline-none focus:border-blue-400/50 transition-all text-white" placeholder="https://t.me/..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-1">Spotify</label>
                  <div className="relative">
                    <Music className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 h-3 w-3" />
                    <input type="text" value={socials.spotify} onChange={(e) => setSocials({ ...socials, spotify: e.target.value })} className="w-full bg-white/5 rounded-[10px] py-3 pl-10 pr-5 text-[10px] outline-none focus:border-green-400/50 transition-all text-white" placeholder="https://spotify.com/..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest ml-1">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 h-3 w-3" />
                    <input type="text" value={socials.website} onChange={(e) => setSocials({ ...socials, website: e.target.value })} className="w-full bg-white/5 rounded-[10px] py-3 pl-10 pr-5 text-[10px] outline-none focus:border-blue-400/50 transition-all text-white" placeholder="https://..." />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full py-4 bg-purple-600 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-purple-600/20 hover:bg-purple-500 active:scale-[0.98] transition-all" > SAVE_IDENTITY_CHANGES </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArtistProfileModal;
