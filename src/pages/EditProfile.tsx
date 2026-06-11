import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Loader2, Link2, Twitter, Instagram, Globe, MessageSquare, ArrowLeft, Check } from 'lucide-react';
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
  const [bannerUrl, setBannerUrl] = useState(userProfile.bannerUrl || '');
  const [socials, setSocials] = useState(userProfile.socials || {});
  
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 480 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false
      });
      setCameraStream(stream);
    } catch (err: any) {
      console.error("Camera access error:", err);
      let message = "Failed to access camera.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = "Camera permission level denied by browser.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = "No video input devices found on this client.";
      }
      setCameraError(message);
      addNotification("Could not access camera.", "error");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
        canvas.width = size;
        canvas.height = size;
        
        const sx = video.videoWidth ? (video.videoWidth - size) / 2 : 0;
        const sy = video.videoHeight ? (video.videoHeight - size) / 2 : 0;
        
        context.drawImage(
          video,
          sx, sy, size, size,
          0, 0, size, size
        );

        canvas.toBlob(async (blob) => {
          if (blob) {
            setIsUploading(true);
            try {
              const storagePath = `users/${userProfile.uid}/avatar.png`;
              const file = new File([blob], "camera_avatar.png", { type: "image/png" });
              const { downloadUrl } = await uploadFile(file, storagePath);
              setAvatarUrl(downloadUrl);
              addNotification("Profile snapshot captured successfully.", "success");
              stopCamera();
            } catch (error: any) {
              addNotification("Failed to save captured photo.", "error");
            } finally {
              setIsUploading(false);
            }
          }
        }, 'image/png');
      }
    }
  };

  const videoRefCallback = (node: HTMLVideoElement | null) => {
    if (node) {
      videoRef.current = node;
      if (cameraStream) {
        node.srcObject = cameraStream;
        node.play().catch(err => console.error("Video play error:", err));
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
      
      setIsUploading(true);
      try {
        const storagePath = `users/${userProfile.uid}/avatar.png`;
        const { downloadUrl } = await uploadFile(file, storagePath);
        setAvatarUrl(downloadUrl);
        addNotification("Profile image updated successfully.", "success");
      } catch (error: any) {
        addNotification("Failed to upload avatar.", "error");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file, 'image', 3);
      if (!validation.isValid) {
        addNotification(validation.error || "Invalid files. Please upload an image under 3MB.", "error");
        e.target.value = '';
        return;
      }
      
      setIsUploadingBanner(true);
      try {
        const storagePath = `users/${userProfile.uid}/banner.png`;
        const { downloadUrl } = await uploadFile(file, storagePath);
        setBannerUrl(downloadUrl);
        addNotification("Profile banner updated successfully.", "success");
      } catch (error: any) {
        addNotification("Failed to upload banner.", "error");
      } finally {
        setIsUploadingBanner(false);
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
        bannerUrl: bannerUrl || userProfile.bannerUrl || '',
        socials
      };

      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === userProfile.uid) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, cleanUpdateData(updatedData));
      }

      addNotification("Profile updated successfully.", "success");
      navigate('/profile');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userProfile.uid}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-4 px-3 sm:py-8 sm:px-6">
      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/profile')}
            className="rounded-full text-white/65 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">Edit Profile</h1>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Customize your digital identification</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-card/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-white/5">
          
          {/* Immersive Banner + Overlapping Avatar Upload Widget */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-muted/20">
            {/* Banner Preview Area */}
            <div className="relative h-28 sm:h-36 w-full overflow-hidden bg-blue-950">
              <img 
                src={bannerUrl || getPlaceholderImage(`banner-${userProfile.uid}`, 1200, 400)} 
                alt="Profile Banner" 
                className="w-full h-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                disabled={isUploadingBanner}
                className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all z-20 cursor-pointer"
                title="Change Banner"
              >
                {isUploadingBanner ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} className="hidden" accept={ALLOWED_IMAGE_TYPES.join(',')} />
            </div>

            {/* Avatar overlapping banner bottom-left */}
            <div className="px-4 pb-4 -mt-10 sm:-mt-12 flex items-end gap-3 sm:gap-4 relative z-30">
              <div className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-[3px] border-card bg-muted shadow-lg">
                <img 
                  src={avatarUrl || getPlaceholderImage(`user-${userProfile.uid}`, 200, 200)} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Camera className="text-white h-4 w-4" />}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept={ALLOWED_IMAGE_TYPES.join(',')} />
              </div>
              
              <div className="mb-1 sm:mb-2 text-left flex flex-col gap-1.5">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-white">Visual Identity</h4>
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="h-6 px-2 text-[8px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white rounded-md flex items-center gap-1 border-none shadow-none"
                  >
                    <Upload className="h-2.5 w-2.5 text-white/70" /> Upload File
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={startCamera}
                    disabled={isUploading}
                    className="h-6 px-2 text-[8px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white rounded-md flex items-center gap-1 border-none shadow-none"
                  >
                    <Camera className="h-2.5 w-2.5 text-white/70" /> Take Photo
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-white/50">Display Name</Label>
              <Input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
                className="bg-black/30 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold focus:border-blue-500/50" 
                placeholder="Your display name"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-white/50">Username</Label>
              <Input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required
                className="bg-black/30 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold focus:border-blue-500/50" 
                placeholder="@username"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-widest text-white/50">Biography</Label>
              <Textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                rows={3} 
                className="bg-black/30 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-medium resize-none focus:border-blue-500/50" 
                placeholder="Tell the community about your frequencies..."
              />
            </div>
            
            {/* Social media connections */}
            <div className="pt-3">
              <Label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2.5">Connection Channels</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-white/30">X</span>
                  <Input 
                    placeholder="X / Twitter Handle" 
                    value={socials.x || ''} 
                    onChange={(e) => setSocials({...socials, x: e.target.value})} 
                    className="bg-black/30 border border-white/5 rounded-xl pl-8 text-xs font-semibold focus:border-blue-500/50" 
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-white/30 font-display">IG</span>
                  <Input 
                    placeholder="Instagram Username" 
                    value={socials.instagram || ''} 
                    onChange={(e) => setSocials({...socials, instagram: e.target.value})} 
                    className="bg-black/30 border border-white/5 rounded-xl pl-10 text-xs font-semibold focus:border-blue-500/50" 
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-white/30">WEB</span>
                  <Input 
                    placeholder="Website address" 
                    value={socials.website || ''} 
                    onChange={(e) => setSocials({...socials, website: e.target.value})} 
                    className="bg-black/30 border border-white/5 rounded-xl pl-12 text-xs font-semibold focus:border-blue-500/50" 
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-white/30">TG</span>
                  <Input 
                    placeholder="Telegram Handle" 
                    value={socials.telegram || ''} 
                    onChange={(e) => setSocials({...socials, telegram: e.target.value})} 
                    className="bg-black/30 border border-white/5 rounded-xl pl-10 text-xs font-semibold focus:border-blue-500/50" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Compact & Mobile-Focused */}
          <div className="flex gap-3 pt-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/profile')} 
              className="flex-1 rounded-xl uppercase tracking-widest font-black text-[10px] h-11 border-white/10 hover:bg-white/5 text-white/70"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white uppercase tracking-widest font-black text-[10px] h-11 shadow-lg shadow-blue-600/20"
            >
              Save Profile
            </Button>
          </div>
        </form>
      </div>

      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-zinc-950 p-6 flex flex-col items-center space-y-4 shadow-2xl">
            <div className="w-full flex justify-between items-center text-left">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Camera Capture</h3>
                <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Capture portrait avatar directly</p>
              </div>
              <Button
                type="button"
                onClick={stopCamera}
                variant="ghost"
                className="text-white/40 hover:text-white text-[8px] uppercase tracking-widest font-black h-7 px-2.5 bg-white/5 hover:bg-white/10 rounded-lg border-none shadow-none"
              >
                Cancel
              </Button>
            </div>

            <div className="relative w-full aspect-square rounded-2xl bg-black overflow-hidden flex items-center justify-center">
              {cameraError ? (
                <div className="text-center p-4 text-[10px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">
                  {cameraError}
                </div>
              ) : (
                <>
                  <video
                    ref={videoRefCallback}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  <div className="absolute inset-4 rounded-full ring-2 ring-white/10 ring-offset-2 ring-offset-black/20 pointer-events-none" />
                </>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {!cameraError && (
              <Button
                type="button"
                onClick={capturePhoto}
                disabled={isUploading}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white uppercase tracking-widest font-black text-[10px] h-11 border-none shadow-lg shadow-blue-600/20"
              >
                {isUploading ? (
                  <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin text-white" /> Saving Portrait...</span>
                ) : (
                  "Capture Snapshot"
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
