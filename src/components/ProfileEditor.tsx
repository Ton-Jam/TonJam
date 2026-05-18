import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { UserProfile } from '@/types';
import { UploadAvatar } from '@/components/UploadAvatar';
import { useUserListener } from '@/hooks/useUserListener';
import { updateUserProfile } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Profile validation schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters').regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  bio: z.string().max(500, 'Bio must be less than 500 characters'),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  bannerUrl: z.string().url('Invalid banner URL').optional().or(z.literal('')),
  twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
  instagram: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditorProps {
  userId: string;
  onSaveComplete?: (profile: UserProfile) => void;
  onError?: (error: string) => void;
  showBanner?: boolean;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  userId,
  onSaveComplete,
  onError,
  showBanner = false,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Listen to real-time profile changes
  useUserListener({
    userId,
    onUpdate: setProfile,
    onError: (error) => {
      console.error('[v0] Profile listener error:', error);
      onError?.(error.message);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      username: '',
      bio: '',
      avatar: '',
      bannerUrl: '',
      twitter: '',
      instagram: '',
      website: '',
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        avatar: profile.avatar || '',
        bannerUrl: profile.bannerUrl || '',
        twitter: profile.twitter || '',
        instagram: profile.instagram || '',
        website: profile.website || '',
      });
    }
  }, [profile, reset]);

  const handleAvatarUpload = (downloadUrl: string) => {
    setValue('avatar', downloadUrl, { shouldDirty: true });
  };

  const handleBannerUpload = (downloadUrl: string) => {
    setValue('bannerUrl', downloadUrl, { shouldDirty: true });
  };

  const onSubmit = async (data: ProfileFormData) => {
    setSaveError(null);
    setSaveSuccess(false);

    try {
      setIsSaving(true);

      const updateData = {
        ...profile,
        ...data,
      };

      await updateUserProfile(userId, updateData);

      setSaveSuccess(true);
      onSaveComplete?.(updateData as UserProfile);

      // Show success for 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save profile';
      setSaveError(errorMessage);
      onError?.(errorMessage);
      console.error('[v0] Profile save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  const avatarPreview = watch('avatar');
  const bannerPreview = watch('bannerUrl');

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Error Alert */}
        {saveError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">Error saving profile</h3>
              <p className="text-sm text-red-800 dark:text-red-300">{saveError}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {saveSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">Profile saved successfully!</p>
          </div>
        )}

        {/* Avatar Upload */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Profile Picture</Label>
          <UploadAvatar
            currentAvatar={avatarPreview || profile.avatar}
            onUploadComplete={handleAvatarUpload}
            onError={setSaveError}
            maxSizeMB={5}
          />
        </div>

        {/* Banner Upload (Optional) */}
        {showBanner && (
          <div className="space-y-4">
            <Label className="text-base font-semibold">Banner Image</Label>
            <div className="relative">
              {bannerPreview || profile.bannerUrl ? (
                <img
                  src={bannerPreview || profile.bannerUrl}
                  alt="Profile banner"
                  className="w-full h-40 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">No banner image</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => document.getElementById('banner-upload')?.click()}
                className="absolute top-2 right-2 px-3 py-1 bg-black/50 text-white rounded text-sm hover:bg-black/70 transition-colors"
              >
                Upload
              </button>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Basic Information</h3>

          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="Your full name"
              {...register('name')}
              className="mt-2"
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="username">Username *</Label>
            <div className="flex items-center mt-2">
              <span className="text-gray-500 dark:text-gray-400 mr-2">@</span>
              <Input
                id="username"
                placeholder="username"
                {...register('username')}
                className="flex-1"
              />
            </div>
            {errors.username && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself... (max 500 characters)"
              rows={4}
              {...register('bio')}
              className="mt-2"
            />
            {errors.bio && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.bio.message}</p>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Social Links</h3>

          <div>
            <Label htmlFor="twitter">Twitter/X</Label>
            <Input
              id="twitter"
              placeholder="https://twitter.com/yourprofile"
              {...register('twitter')}
              className="mt-2"
            />
            {errors.twitter && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.twitter.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              placeholder="https://instagram.com/yourprofile"
              {...register('instagram')}
              className="mt-2"
            />
            {errors.instagram && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.instagram.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              placeholder="https://yourwebsite.com"
              {...register('website')}
              className="mt-2"
            />
            {errors.website && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.website.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={!isDirty || isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditor;
