import React, { useState, useRef } from 'react';
import { UserPen, X, Twitter, Send, Music, Globe, Instagram, Image as ImageIcon, Upload, Loader2, Calendar, MapPin, Ticket, Clock, PlusCircle, Trash2 } from 'lucide-react';
import { Artist, ArtistEvent } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { uploadFile } from '@/services/storageService';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getPlaceholderImage, validateFile, ALLOWED_IMAGE_TYPES } from '@/lib/utils';
import { cleanUpdateData } from '@/lib/firebase';

interface EditArtistProfileModalProps {
  artist: Artist;
  onClose: () => void;
}

const EditArtistProfileModal: React.FC<EditArtistProfileModalProps> = ({ artist, onClose }) => {
  const { addNotification, setArtists } = useAudio();
  const [name, setName] = useState(artist.name);
  const [username, setUsername] = useState(artist.username || '');
  const [bio, setBio] = useState(artist.bio || '');
  const [bannerUrl, setBannerUrl] = useState(artist.bannerUrl || '');
  const [bannerImageUrl, setBannerImageUrl] = useState(artist.bannerImageUrl || '');
  const [avatarUrl, setAvatarUrl] = useState(artist.avatarUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [events, setEvents] = useState<ArtistEvent[]>(artist.events || []);
  const [socials, setSocials] = useState({
    x: artist.socials?.x || '',
    spotify: artist.socials?.spotify || '',
    instagram: artist.socials?.instagram || '',
    website: artist.socials?.website || '',
    telegram: artist.socials?.telegram || ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddEvent = () => {
    setEvents([...events, {
      id: Math.random().toString(36).substr(2, 9),
      artistId: artist.uid,
      title: '',
      date: '',
      time: '',
      venue: '',
      location: '',
      ticketUrl: '',
      bannerImageUrl: ''
    }]);
  };

  const handleUpdateEvent = (id: string, field: keyof ArtistEvent, value: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleRemoveEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file, 'image', 5);
      if (!validation.isValid) {
        addNotification(validation.error || "Invalid file", "error");
        e.target.value = '';
        return;
      }
      
      setIsUploading(true);
      try {
        addNotification("Adding banner image...", "info");
        const storagePath = `profiles/${artist.uid}/banner.png`;
        const { downloadUrl } = await uploadFile(file, storagePath);
        setBannerImageUrl(downloadUrl);
        addNotification("Banner image added successfully", "success");
      } catch (error: any) {
        console.error("Banner upload failed:", error);
        addNotification("Failed to upload banner to storage.", "error");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file, 'image', 2);
      if (!validation.isValid) {
        addNotification(validation.error || "Invalid file", "error");
        e.target.value = '';
        return;
      }
      
      setIsAvatarUploading(true);
      try {
        addNotification("Adding profile image...", "info");
        const storagePath = `profiles/${artist.uid}/avatar.png`;
        const { downloadUrl } = await uploadFile(file, storagePath);
        setAvatarUrl(downloadUrl);
        addNotification("Profile image added successfully", "success");
      } catch (error: any) {
        console.error("Avatar upload failed:", error);
        addNotification("Failed to upload avatar to storage.", "error");
      } finally {
        setIsAvatarUploading(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Update local state
      setArtists(prev => prev.map(a => a.uid === artist.uid ? {
        ...a,
        name,
        username,
        bio,
        bannerUrl: bannerUrl || a.bannerUrl,
        bannerImageUrl: bannerImageUrl || a.bannerImageUrl,
        avatarUrl: avatarUrl || a.avatarUrl,
        socials,
        events
      } : a));

      // Persist to Firebase if it's the current user
      const user = auth.currentUser;
      if (user && user.uid === artist.uid) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, cleanUpdateData({
          name,
          username,
          bio,
          bannerUrl: bannerUrl || artist.bannerUrl || '',
          bannerImageUrl: bannerImageUrl || artist.bannerImageUrl || '',
          avatar: avatarUrl || artist.avatarUrl || '',
          socials,
          events
        }));
      }

      addNotification("Profile updated successfully.", "success");
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${artist.uid}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 animate-in fade-in duration-300">
      <div className="absolute inset-0 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative glass w-full max-w-2xl rounded-[4px] p-2 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tighter text-foreground">Edit Profile</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Close Edit Profile Modal">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
          <div className="space-y-4">
            
            {/* Banner Upload Section */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Profile Banner</label>
              <div className="relative w-full h-32 rounded-[4px] overflow-hidden group bg-muted/50">
                <img src={bannerImageUrl || bannerUrl || getPlaceholderImage(`banner-${artist.uid}`, 1500, 500)} alt="Banner Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 rounded-full text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-blue-500 transition-all"
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
                  accept={ALLOWED_IMAGE_TYPES.join(',')} 
                />
              </div>
            </div>

            {/* Avatar Upload Section */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Avatar</label>
              <div className="relative w-20 h-20 rounded-full overflow-hidden group bg-muted/50">
                <img src={avatarUrl || getPlaceholderImage(`artist-${artist.uid}`)} alt="Avatar Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    type="button"
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = ALLOWED_IMAGE_TYPES.join(',');
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Artist Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-muted/50 rounded-[4px] py-2 px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all text-foreground" aria-label="Artist Name" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Neural Handle</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-xs">@</span>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} className="w-full bg-muted/50 rounded-[4px] py-2 pl-6 pr-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all text-foreground" placeholder="handle" aria-label="Neural Handle" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Origin Narrative (Bio)</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full bg-muted/50 rounded-[4px] py-2 px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-all text-foreground resize-none" placeholder="Describe your sonic journey..." aria-label="Origin Narrative (Bio)" />
            </div>
            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em]">Social Neural Links</h3>
              </div>
              <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest ml-2 mb-4">Connect your external identities to your artist profile</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
                {/* Twitter / X */}
                <div className="group relative bg-muted/20 hover:bg-muted/30 border border-white/5 rounded-2xl p-4 transition-all hover:border-blue-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center text-[#1DA1F2]">
                      <Twitter className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-foreground">Twitter / X</h4>
                      <p className="text-[8px] text-muted-foreground uppercase tracking-tighter">@username</p>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={socials.x} 
                    onChange={(e) => setSocials({ ...socials, x: e.target.value })} 
                    className="w-full bg-background/50 rounded-xl py-2 px-3 text-[10px] outline-none focus:ring-1 focus:ring-blue-500 transition-all text-foreground" 
                    placeholder="https://x.com/yourname" 
                  />
                </div>

                {/* Instagram */}
                <div className="group relative bg-muted/20 hover:bg-muted/30 border border-white/5 rounded-2xl p-4 transition-all hover:border-pink-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                      <Instagram className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-foreground">Instagram</h4>
                      <p className="text-[8px] text-muted-foreground uppercase tracking-tighter">@handle</p>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={socials.instagram} 
                    onChange={(e) => setSocials({ ...socials, instagram: e.target.value })} 
                    className="w-full bg-background/50 rounded-xl py-2 px-3 text-[10px] outline-none focus:ring-1 focus:ring-pink-500 transition-all text-foreground" 
                    placeholder="https://instagram.com/..." 
                  />
                </div>

                {/* Website */}
                <div className="group relative bg-muted/20 hover:bg-muted/30 border border-white/5 rounded-2xl p-4 transition-all hover:border-blue-400/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-foreground">Official Website</h4>
                      <p className="text-[8px] text-muted-foreground uppercase tracking-tighter">https://yourdomain.com</p>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={socials.website} 
                    onChange={(e) => setSocials({ ...socials, website: e.target.value })} 
                    className="w-full bg-background/50 rounded-xl py-2 px-3 text-[10px] outline-none focus:ring-1 focus:ring-blue-400 transition-all text-foreground" 
                    placeholder="https://..." 
                  />
                </div>

                {/* Telegram */}
                <div className="group relative bg-muted/20 hover:bg-muted/30 border border-white/5 rounded-2xl p-4 transition-all hover:border-sky-400/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-sky-400/10 flex items-center justify-center text-sky-400">
                      <Send className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-foreground">Telegram Channel</h4>
                      <p className="text-[8px] text-muted-foreground uppercase tracking-tighter">t.me/channel</p>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={socials.telegram} 
                    onChange={(e) => setSocials({ ...socials, telegram: e.target.value })} 
                    className="w-full bg-background/50 rounded-xl py-2 px-3 text-[10px] outline-none focus:ring-1 focus:ring-sky-400 transition-all text-foreground" 
                    placeholder="https://t.me/..." 
                  />
                </div>
              </div>
            </div>

            {/* Events Management Section */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.4em]">Upcoming Events</h3>
                <button
                  type="button"
                  onClick={handleAddEvent}
                  className="flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-full"
                >
                  <PlusCircle className="h-3 w-3" /> Add Event
                </button>
              </div>

              {events.length === 0 ? (
                <p className="text-[11px] text-muted-foreground ml-2">No events scheduled. Plan your next gig!</p>
              ) : (
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={event.id} className="p-4 bg-muted/30 rounded-[4px] border border-border/50 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveEvent(event.id)}
                        className="absolute right-3 top-3 text-muted-foreground/50 hover:text-red-500 transition-colors"
                        title="Remove Event"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      
                      <div className="space-y-3">
                        <div className="pr-8">
                          <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1 block">Title</label>
                          <input type="text" value={event.title} onChange={(e) => handleUpdateEvent(event.id, 'title', e.target.value)} className="w-full bg-background/50 rounded-[4px] py-1.5 px-3 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all text-foreground" placeholder="e.g. Neon Nights Residency" required />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar className="h-2 w-2"/> Date</label>
                            <input type="date" value={event.date} onChange={(e) => handleUpdateEvent(event.id, 'date', e.target.value)} className="w-full bg-background/50 rounded-[4px] py-1.5 px-3 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all text-foreground" required />
                          </div>
                          <div>
                            <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock className="h-2 w-2"/> Time</label>
                            <input type="time" value={event.time} onChange={(e) => handleUpdateEvent(event.id, 'time', e.target.value)} className="w-full bg-background/50 rounded-[4px] py-1.5 px-3 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all text-foreground" required />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin className="h-2 w-2"/> Venue</label>
                            <input type="text" value={event.venue} onChange={(e) => handleUpdateEvent(event.id, 'venue', e.target.value)} className="w-full bg-background/50 rounded-[4px] py-1.5 px-3 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all text-foreground" placeholder="e.g. The Matrix Club" required />
                          </div>
                          <div>
                            <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1">City/Location</label>
                            <input type="text" value={event.location} onChange={(e) => handleUpdateEvent(event.id, 'location', e.target.value)} className="w-full bg-background/50 rounded-[4px] py-1.5 px-3 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all text-foreground" placeholder="e.g. Neo-Tokyo" required />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1 flex items-center gap-1"><Ticket className="h-2 w-2"/> Ticket URL (Optional)</label>
                            <input type="url" value={event.ticketUrl} onChange={(e) => handleUpdateEvent(event.id, 'ticketUrl', e.target.value)} className="w-full bg-background/50 rounded-[4px] py-1.5 px-3 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all text-foreground" placeholder="https://..." />
                          </div>
                          <div>
                            <label className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1 flex items-center gap-1"><ImageIcon className="h-2 w-2"/> Banner Image URL</label>
                            <input type="url" value={event.bannerImageUrl} onChange={(e) => handleUpdateEvent(event.id, 'bannerImageUrl', e.target.value)} className="w-full bg-background/50 rounded-[4px] py-1.5 px-3 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-all text-foreground" placeholder="https://..." />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full py-2 bg-purple-600 text-foreground rounded-[4px] font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-purple-600/20 hover:bg-purple-500 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500" > SAVE_IDENTITY_CHANGES </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArtistProfileModal;
