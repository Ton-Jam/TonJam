import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Loader2, Link2, Twitter, Instagram, Globe, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAudio } from '@/context/AudioContext';
import { uploadFile } from '@/services/storageService';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getPlaceholderImage, validateFile, ALLOWED_IMAGE_TYPES } from '@/lib/utils';
import { cleanUpdateData } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const EditProfile: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useAudio();
  
  if (!userProfile) return null;

  const [name, setName] = useState(userProfile.name || '');
  const [username, setUsername] = useState(userProfile.username || '');
  const [bio, setBio] = useState(userProfile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatar || '');
  const [socials, setSocials] = useState(userProfile.socials || {});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file, 'image', 2);
      if (!validation.isValid) {
        addNotification(validation.error || "Invalid file", "error");
        e.target.value = '';
        return;
      }
      
      setIsUploading(true);
      try {
        const storagePath = `users/${userProfile.uid}/avatar.png`;
        const { downloadUrl } = await uploadFile(file, storagePath);
        setAvatarUrl(downloadUrl);
        addNotification("Profile image updated.", "success");
      } catch (error: any) {
        addNotification("Failed to upload avatar.", "error");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedData = {
        name,
        username,
        bio,
        avatar: avatarUrl || userProfile.avatar || '',
        socials
      };

      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === userProfile.uid) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, cleanUpdateData(updatedData));
      }

      addNotification("Profile saved.", "success");
      navigate('/profile');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userProfile.uid}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <form onSubmit={handleSave} className="space-y-8 bg-card p-6 rounded-3xl border border-border">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden group bg-muted border-4 border-background shadow-lg">
              <img src={avatarUrl || getPlaceholderImage(`user-${userProfile.uid}`, 200, 200)} alt="Avatar" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full text-white hover:bg-white/20"
                >
                  {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                </Button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept={ALLOWED_IMAGE_TYPES.join(',')} />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Change Profile Picture</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Display Name</Label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-background border border-border rounded-xl focus:border-primary transition-colors" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Username</Label>
              <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-background border border-border rounded-xl focus:border-primary transition-colors" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="bg-background border border-border rounded-xl resize-none focus:border-primary transition-colors" />
            </div>
            
            <div className="space-y-4 pt-4 border-t border-border">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Links</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Twitter URL" value={socials.x || ''} onChange={(e) => setSocials({...socials, x: e.target.value})} className="bg-background border border-border rounded-xl" />
                <Input placeholder="Instagram" value={socials.instagram || ''} onChange={(e) => setSocials({...socials, instagram: e.target.value})} className="bg-background border border-border rounded-xl" />
                <Input placeholder="Website" value={socials.website || ''} onChange={(e) => setSocials({...socials, website: e.target.value})} className="bg-background border border-border rounded-xl" />
                <Input placeholder="Telegram" value={socials.telegram || ''} onChange={(e) => setSocials({...socials, telegram: e.target.value})} className="bg-background border border-border rounded-xl" />
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full rounded-2xl uppercase tracking-widest font-black text-sm shadow-xl hover:shadow-2xl transition-all">
            Save Profile
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
