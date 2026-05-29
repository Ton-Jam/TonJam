import React, { useState, useRef } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { UserProfile as UserProfileType } from '@/types';
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

interface EditUserProfileModalProps {
  user: UserProfileType;
  onClose: () => void;
  onUpdate: (updatedUser: UserProfileType) => void;
}

const AVATAR_OPTIONS = [
  'https://i.postimg.cc/K8QgMBjt/grok-image-1777930555512-2.png',
  'https://image.pollinations.ai/prompt/young%20woman%20avatar%20with%20cool%20glasses%20and%20headphones?width=400&height=400&nologo=true',
  'https://image.pollinations.ai/prompt/young%20man%20avatar%20with%20streetwear%20and%20cap?width=400&height=400&nologo=true',
  'https://image.pollinations.ai/prompt/digital%20humanoid%20avatar%20glitch%20art?width=400&height=400&nologo=true',
];

const EditUserProfileModal: React.FC<EditUserProfileModalProps> = ({ user, onClose, onUpdate }) => {
  const { addNotification } = useAudio();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  const [socials, setSocials] = useState(user.socials || {});
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
        addNotification("Adding profile image...", "info");
        const storagePath = `users/${user.uid}/avatar.png`;
        const { downloadUrl } = await uploadFile(file, storagePath);
        setAvatarUrl(downloadUrl);
        addNotification("Profile image updated successfully", "success");
      } catch (error: any) {
        console.error("Avatar upload failed:", error);
        addNotification("Failed to upload avatar to storage.", "error");
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
        avatar: avatarUrl || user.avatar || '',
        socials
      };

      // Persist to Firebase
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === user.uid) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, cleanUpdateData(updatedData));
      }

      onUpdate({ ...user, ...updatedData });
      addNotification("Profile updated successfully.", "success");
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg rounded-[4px] p-6 shadow-2xl animate-in zoom-in-95 duration-300 bg-background border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black uppercase tracking-tighter">Edit Profile</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden group bg-muted">
              <img src={avatarUrl || getPlaceholderImage(`user-${user.uid}`, 200, 200)} alt="Avatar Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full text-white hover:text-white"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept={ALLOWED_IMAGE_TYPES.join(',')} />
            </div>
            
            <div className="flex gap-2">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${avatarUrl === avatar ? 'border-blue-500' : 'border-transparent'}`}
                  onClick={() => setAvatarUrl(avatar)}
                >
                  <img src={avatar} alt="Avatar Option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Display Name</Label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Username</Label>
              <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Social Media</Label>
              <Input type="text" placeholder="X (Twitter) URL" value={socials.x || ''} onChange={(e) => setSocials({...socials, x: e.target.value})} />
              <Input type="text" placeholder="Instagram URL" value={socials.instagram || ''} onChange={(e) => setSocials({...socials, instagram: e.target.value})} />
              <Input type="text" placeholder="Website URL" value={socials.website || ''} onChange={(e) => setSocials({...socials, website: e.target.value})} />
              <Input type="text" placeholder="Telegram URL" value={socials.telegram || ''} onChange={(e) => setSocials({...socials, telegram: e.target.value})} />
              <Input type="text" placeholder="Spotify URL" value={socials.spotify || ''} onChange={(e) => setSocials({...socials, spotify: e.target.value})} />
            </div>
          </div>

          <Button type="submit" className="w-full uppercase tracking-widest font-bold">
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditUserProfileModal;
