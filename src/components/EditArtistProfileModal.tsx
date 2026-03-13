import React, { useState, useRef } from 'react';
import { UserPen, X, Twitter, Send, Music, Globe, Image as ImageIcon, Upload } from 'lucide-react';
import { Artist } from '@/types';
import { useAudio } from '@/context/AudioContext';

interface EditArtistProfileModalProps {
  artist: Artist;
  onClose: () => void;
}

const EditArtistProfileModal: React.FC<EditArtistProfileModalProps> = ({ artist, onClose }) => {
  const { addNotification, setArtists } = useAudio();
  const [name, setName] = useState(artist.name);
  const [bio, setBio] = useState(artist.bio || '');
  const [bannerUrl, setBannerUrl] = useState(artist.bannerUrl || '');
  const [socials, setSocials] = useState({
    x: artist.socials?.x || '',
    spotify: artist.socials?.spotify || '',
    instagram: artist.socials?.instagram || '',
    website: artist.socials?.website || '',
    telegram: artist.socials?.telegram || ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addNotification("File too large. Max 5MB allowed.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerUrl(reader.result as string);
        addNotification("Banner preview updated.", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    setArtists(prev => prev.map(a => a.id === artist.id ? {
      ...a,
      name,
      bio,
      bannerUrl: bannerUrl || a.bannerUrl,
      socials
    } : a));

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
              <UserPen className="text-foreground h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tighter text-foreground">Edit Neural Profile</h2>
              <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Update your identity on the TON network</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Close Edit Profile Modal">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 no-scrollbar">
          <div className="space-y-6">
            
            {/* Banner Upload Section */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Profile Banner</label>
              <div className="relative w-full h-32 rounded-[10px] overflow-hidden group border border-border bg-muted/50">
                {bannerUrl ? (
                  <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-muted backdrop-blur-md border border-border/80 rounded-[8px] text-[9px] font-bold text-foreground uppercase tracking-widest hover:bg-muted/80 transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Upload className="h-3 w-3" /> Upload New Banner
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleBannerUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <p className="text-[8px] text-foreground/30 ml-1">Recommended size: 1500x500px. Max 5MB.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Artist Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-muted/50 rounded-[10px] py-3 px-5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all text-foreground" aria-label="Artist Name" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Origin Narrative (Bio)</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full bg-muted/50 rounded-[10px] py-3 px-5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all text-foreground resize-none" placeholder="Describe your sonic journey..." aria-label="Origin Narrative (Bio)" />
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em] mb-4">Social Relay Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-1">X (Twitter)</label>
                  <div className="relative">
                    <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-3 w-3" />
                    <input type="text" value={socials.x} onChange={(e) => setSocials({ ...socials, x: e.target.value })} className="w-full bg-muted/50 rounded-[10px] py-3 pl-10 pr-5 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all text-foreground" placeholder="https://x.com/..." aria-label="X (Twitter) Link" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-1">Telegram</label>
                  <div className="relative">
                    <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-3 w-3" />
                    <input type="text" value={socials.telegram} onChange={(e) => setSocials({ ...socials, telegram: e.target.value })} className="w-full bg-muted/50 rounded-[10px] py-3 pl-10 pr-5 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all text-foreground" placeholder="https://t.me/..." aria-label="Telegram Link" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-1">Spotify</label>
                  <div className="relative">
                    <Music className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-3 w-3" />
                    <input type="text" value={socials.spotify} onChange={(e) => setSocials({ ...socials, spotify: e.target.value })} className="w-full bg-muted/50 rounded-[10px] py-3 pl-10 pr-5 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-green-400 transition-all text-foreground" placeholder="https://spotify.com/..." aria-label="Spotify Link" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-1">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-3 w-3" />
                    <input type="text" value={socials.website} onChange={(e) => setSocials({ ...socials, website: e.target.value })} className="w-full bg-muted/50 rounded-[10px] py-3 pl-10 pr-5 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all text-foreground" placeholder="https://..." aria-label="Website Link" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full py-4 bg-purple-600 text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-purple-600/20 hover:bg-purple-500 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500" > SAVE_IDENTITY_CHANGES </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArtistProfileModal;
