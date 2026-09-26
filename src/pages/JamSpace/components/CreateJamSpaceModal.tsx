import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Radio, 
  Globe, 
  Lock, 
  Image as ImageIcon, 
  Upload, 
  Sparkles, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { uploadFile } from '@/services/storageService';
import { toast } from 'sonner';

interface CreateJamSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    visibility: 'public' | 'private';
    coverUrl?: string;
  }) => Promise<void> | void;
}

export const CreateJamSpaceModal: React.FC<CreateJamSpaceModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { user, userProfile } = useAuth();
  const { addNotification } = useAudio();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [coverUrl, setCoverUrl] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus on mount and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingCover(true);
    try {
      const uploadResult = await uploadFile(file, `jamspaces/covers/${Date.now()}_${file.name}`);
      setCoverUrl(uploadResult.downloadUrl);
      toast.success('Cover image added');
    } catch (err) {
      console.error('Failed to upload cover:', err);
      toast.error('Failed to process cover image');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('JamSpace name is required');
      toast.error('Please enter a name for your JamSpace');
      nameInputRef.current?.focus();
      return;
    }

    if (trimmedName.length < 3) {
      setValidationError('JamSpace name must be at least 3 characters');
      toast.error('JamSpace name is too short');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: trimmedName,
        description: description.trim(),
        visibility,
        coverUrl: coverUrl || undefined
      });

      // Reset state
      setName('');
      setDescription('');
      setVisibility('public');
      setCoverUrl('');
      onClose();
    } catch (err: any) {
      console.error('Error creating JamSpace:', err);
      toast.error(err?.message || 'Failed to create JamSpace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-jamspace-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-lg bg-[#0d0d10] border border-[#c0c0c0]/20 rounded-2xl shadow-2xl overflow-hidden text-text-primary flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#c0c0c0]/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 id="create-jamspace-title" className="text-base font-bold text-white tracking-tight">
                Create JamSpace
              </h2>
              <p className="text-xs text-zinc-400">
                Host a live interactive audio room for the community
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c0c0c0]/50 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body & Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          {/* JamSpace Name */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="jamspace-name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              JamSpace Name <span className="text-red-400">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="jamspace-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              maxLength={80}
              placeholder="e.g. Afrobeats Stems & Live Jam Session"
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border text-sm text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 transition-colors ${
                validationError 
                  ? 'border-red-500/80 focus-visible:ring-red-500' 
                  : 'border-[#c0c0c0]/20 focus-visible:ring-[#00B4D8] focus-visible:border-[#00B4D8]'
              }`}
            />
            {validationError ? (
              <p className="text-xs text-red-400 font-medium">{validationError}</p>
            ) : (
              <p className="text-[11px] text-zinc-500 text-right">{name.length}/80</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="jamspace-description" className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Description <span className="text-zinc-500 lowercase font-normal">(optional)</span>
            </label>
            <textarea
              id="jamspace-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={240}
              placeholder="What will you be discussing, spinning, or performing?"
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-[#c0c0c0]/20 text-sm text-white placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00B4D8] focus-visible:border-[#00B4D8] transition-colors resize-none"
            />
            <p className="text-[11px] text-zinc-500 text-right">{description.length}/240</p>
          </div>

          {/* Visibility Selection */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Room Visibility
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  visibility === 'public'
                    ? 'bg-blue-950/40 border-[#00B4D8] ring-1 ring-[#00B4D8]/50'
                    : 'bg-zinc-900/40 border-[#c0c0c0]/15 hover:bg-zinc-900/80'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${visibility === 'public' ? 'bg-[#00B4D8]/20 text-[#00B4D8]' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">Public</span>
                  <span className="text-[11px] text-zinc-400 block leading-tight mt-0.5">
                    Open to all listeners and community members
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  visibility === 'private'
                    ? 'bg-blue-950/40 border-[#00B4D8] ring-1 ring-[#00B4D8]/50'
                    : 'bg-zinc-900/40 border-[#c0c0c0]/15 hover:bg-zinc-900/80'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${visibility === 'private' ? 'bg-[#00B4D8]/20 text-[#00B4D8]' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">Private</span>
                  <span className="text-[11px] text-zinc-400 block leading-tight mt-0.5">
                    Invited listeners and direct link only
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Cover Image Upload (Optional) */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Cover Image <span className="text-zinc-500 lowercase font-normal">(optional)</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploadingCover || isSubmitting}
            />

            {coverUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-[#c0c0c0]/20 h-28 bg-zinc-900 group">
                <img src={coverUrl} alt="JamSpace Cover Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/20 text-white hover:bg-white/30 backdrop-blur-xs"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverUrl('')}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-500/40 text-red-200 hover:bg-red-500/60 backdrop-blur-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingCover || isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 px-3 rounded-xl border border-dashed border-[#c0c0c0]/25 hover:border-[#00B4D8]/60 bg-zinc-900/40 hover:bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                {isUploadingCover ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#00B4D8]" />
                    <span className="text-xs font-medium">Uploading cover...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-medium">Upload custom artwork (PNG, JPG)</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Host Info Box */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-[#c0c0c0]/10 text-left">
            <img
              src={userProfile?.avatar || user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={userProfile?.name || user?.displayName || 'Host'}
              className="w-9 h-9 rounded-full object-cover border border-white/10"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">
                  {userProfile?.name || user?.displayName || userProfile?.username || 'You'}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  Host
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                Space will launch live immediately upon creation
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border border-[#c0c0c0]/20 bg-zinc-900/60 hover:bg-zinc-800 text-xs sm:text-sm font-semibold text-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c0c0c0]/50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00B4D8] hover:bg-[#00B4D8]/90 active:scale-98 text-xs sm:text-sm font-bold text-black transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B4D8] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Launching Space...</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4" />
                  <span>Go Live Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateJamSpaceModal;
