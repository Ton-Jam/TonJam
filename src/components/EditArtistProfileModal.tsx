import React, { useState, useRef } from 'react';
import { UserPen, X, Twitter, Send, Music, Globe, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { Artist } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { uploadToIPFS } from '@/services/pinataService';
import { supabase } from '@/lib/supabase';
import { getPlaceholderImage } from '@/lib/utils';

interface EditArtistProfileModalProps {
  artist: Artist;
  onClose: () => void;
}

const EditArtistProfileModal: React.FC<EditArtistProfileModalProps> = ({ artist, onClose }) => {
  const { addNotification, setArtists } = useAudio();
  const [name, setName] = useState(artist.name);
  const [bio, setBio] = useState(artist.bio || '');
  const [bannerUrl, setBannerUrl] = useState(artist.bannerUrl || '');
  const [avatarUrl, setAvatarUrl] = useState(artist.avatarUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [socials, setSocials] = useState({
    x: artist.socials?.x || '',
    spotify: artist.socials?.spotify || '',
    instagram: artist.socials?.instagram || '',
    website: artist.socials?.website || '',
    telegram: artist.socials?.telegram || ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addNotification("File too large. Max 5MB allowed.", "error");
        return;
      }
      
      setIsUploading(true);
      try {
        addNotification("Uploading banner to IPFS...", "info");
        const { ipfsUrl } = await uploadToIPFS(file);
        setBannerUrl(ipfsUrl);
        addNotification("Banner uploaded to IPFS.", "success");
      } catch (error: any) {
        console.error("Banner upload failed:", error);
        addNotification("Failed to upload banner to IPFS.", "error");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addNotification("Avatar too large. Max 2MB allowed.", "error");
        return;
      }
      
      setIsAvatarUploading(true);
      try {
        addNotification("Uploading avatar to IPFS...", "info");
        const { ipfsUrl } = await uploadToIPFS(file);
        setAvatarUrl(ipfsUrl);
        addNotification("Avatar uploaded to IPFS.", "success");
      } catch (error: any) {
        console.error("Avatar upload failed:", error);
        addNotification("Failed to upload avatar to IPFS.", "error");
      } finally {
        setIsAvatarUploading(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Update local state
      setArtists(prev => prev.map(a => a.id === artist.id ? {
        ...a,
        name,
        bio,
        bannerUrl: bannerUrl || a.bannerUrl,
        avatarUrl: avatarUrl || a.avatarUrl,
        socials
      } : a));

      // Persist to Supabase if it's the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === artist.id) {
        const { error } = await supabase
          .from('users')
          .update({
            name,
            bio,
            bannerUrl: bannerUrl || artist.bannerUrl || '',
            avatar: avatarUrl || artist.avatarUrl || '',
            socials
          })
          .eq('id', user.id);
        
        if (error) throw error;
      }

      addNotification("Neural profile updated successfully.", "success");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      addNotification("Failed to update profile in database.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 animate-in fade-in duration-300">
      <div className="absolute inset-0 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative glass border border-neutral-500/10 w-full max-w-2xl rounded-[10px] p-2 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 blur-3xl rounded-full"></div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
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
        <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
          <div className="space-y-4">
            
            {/* Banner Upload Section - Moved to top and made full-width */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Profile Banner</label>
              <div className="relative w-full h-48 rounded-[10px] overflow-hidden group border border-border bg-muted/50">
                <img src={bannerUrl || getPlaceholderImage(`banner-${artist.id}`, 1500, 500)} alt="Banner Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-blue-600 rounded-full text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-blue-500 transition-all"
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {isUploading ? "Uploading..." : "Change Banner"}
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleBannerUpload} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>
              <p className="text-[8px] text-foreground/30 ml-2">Recommended size: 1500x500px. Max 5MB.</p>
            </div>

            {/* Avatar Upload Section */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Avatar</label>
              <div className="relative w-24 h-24 rounded-full overflow-hidden group border border-border bg-muted/50">
                <img src={avatarUrl || getPlaceholderImage(`artist-${artist.id}`)} alt="Avatar Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    type="button"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => handleAvatarUpload(e as any);
                      input.click();
                    }}
                    className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg hover:bg-blue-500 transition-all"
                    disabled={isAvatarUploading}
                  >
                    {isAvatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Artist Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-muted/50 rounded-[10px] py-2 px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all text-foreground" aria-label="Artist Name" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Origin Narrative (Bio)</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full bg-muted/50 rounded-[10px] py-2 px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all text-foreground resize-none" placeholder="Describe your sonic journey..." aria-label="Origin Narrative (Bio)" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em] mb-2">Social Relay Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-2">X (Twitter)</label>
                  <div className="relative">
                    <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-3 w-3" />
                    <input type="text" value={socials.x} onChange={(e) => setSocials({ ...socials, x: e.target.value })} className="w-full bg-muted/50 rounded-[10px] py-2 pl-2 pr-2 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all text-foreground" placeholder="https://x.com/..." aria-label="X (Twitter) Link" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-2">Telegram</label>
                  <div className="relative">
                    <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-3 w-3" />
                    <input type="text" value={socials.telegram} onChange={(e) => setSocials({ ...socials, telegram: e.target.value })} className="w-full bg-muted/50 rounded-[10px] py-2 pl-2 pr-2 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all text-foreground" placeholder="https://t.me/..." aria-label="Telegram Link" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-2">Spotify</label>
                  <div className="relative">
                    <Music className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-3 w-3" />
                    <input type="text" value={socials.spotify} onChange={(e) => setSocials({ ...socials, spotify: e.target.value })} className="w-full bg-muted/50 rounded-[10px] py-2 pl-2 pr-2 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-green-400 transition-all text-foreground" placeholder="https://spotify.com/..." aria-label="Spotify Link" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest ml-2">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-3 w-3" />
                    <input type="text" value={socials.website} onChange={(e) => setSocials({ ...socials, website: e.target.value })} className="w-full bg-muted/50 rounded-[10px] py-2 pl-2 pr-2 text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all text-foreground" placeholder="https://..." aria-label="Website Link" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full py-2 bg-purple-600 text-foreground rounded-[10px] font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-purple-600/20 hover:bg-purple-500 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500" > SAVE_IDENTITY_CHANGES </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArtistProfileModal;
