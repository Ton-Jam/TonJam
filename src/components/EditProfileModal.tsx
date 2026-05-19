import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, Link2, Twitter, Instagram, Globe, MessageSquare } from 'lucide-react';
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

interface EditProfileModalProps {
  user: UserProfileType;
  onClose: () => void;
  onUpdate: (updatedUser: UserProfileType) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onUpdate }) => {
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
        const storagePath = `users/${user.uid}/avatar.png`;
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
        avatar: avatarUrl || user.avatar || '',
        socials
      };

      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === user.uid) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, cleanUpdateData(updatedData));
      }

      onUpdate({ ...user, ...updatedData });
      addNotification("Profile saved.", "success");
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg rounded-[32px] p-8 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300 bg-background">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-sm font-black uppercase tracking-[0.2em]">Edit Profile</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden group bg-muted border-4 border-background shadow-lg">
              <img src={avatarUrl || getPlaceholderImage(`user-${user.uid}`, 200, 200)} alt="Avatar" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full text-white hover:bg-white/20"
                >
                  {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                </Button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept={ALLOWED_IMAGE_TYPES.join(',')} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Display Name</Label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-background border border-border rounded-xl focus:border-primary transition-colors" />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Username</Label>
              <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-background border border-border rounded-xl focus:border-primary transition-colors" />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="bg-background border border-border rounded-xl resize-none focus:border-primary transition-colors" />
            </div>
            
            <div className="space-y-4 pt-4 border-t border-border">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Links</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Twitter URL" value={socials.x || ''} onChange={(e) => setSocials({...socials, x: e.target.value})} className="bg-background border border-border rounded-xl" />
                <Input placeholder="Instagram" value={socials.instagram || ''} onChange={(e) => setSocials({...socials, instagram: e.target.value})} className="bg-background border border-border rounded-xl" />
                <Input placeholder="Website" value={socials.website || ''} onChange={(e) => setSocials({...socials, website: e.target.value})} className="bg-background border border-border rounded-xl" />
                <Input placeholder="Telegram" value={socials.telegram || ''} onChange={(e) => setSocials({...socials, telegram: e.target.value})} className="bg-background border border-border rounded-xl" />
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full rounded-2xl uppercase tracking-widest font-black text-sm shadow-xl hover:shadow-2xl transition-all">
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
