import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { uploadFile } from '@/services/storageService';
import { validateFile } from '@/lib/utils';

interface UploadAvatarProps {
  currentAvatar?: string;
  onUploadComplete: (downloadUrl: string) => void;
  onError?: (error: string) => void;
  maxSizeMB?: number;
  className?: string;
}

export const UploadAvatar: React.FC<UploadAvatarProps> = ({
  currentAvatar,
  onUploadComplete,
  onError,
  maxSizeMB = 5,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleValidationError = (error: string) => {
    onError?.(error);
  };

  const processFile = async (file: File) => {
    const validation = validateFile(file, 'image', maxSizeMB);
    if (!validation.isValid) {
      handleValidationError(validation.error || 'Invalid file');
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      handleValidationError('You must be logged in to upload an avatar');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setIsUploading(true);
      const storagePath = `users/${userId}/avatar/${Date.now()}-${file.name}`;

      const { downloadUrl } = await uploadFile(file, storagePath, (progress) => {
        setProgress(progress);
      });

      onUploadComplete(downloadUrl);
      setIsUploading(false);
      setProgress(0);
    } catch (error: any) {
      console.error('[v0] Avatar upload failed:', error);
      handleValidationError(error.message || 'Failed to upload avatar');
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative w-32 h-32 mx-auto mb-4 rounded-full border-2 border-dashed cursor-pointer transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 hover:border-gray-400'
        } ${isUploading ? 'opacity-75' : ''}`}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Avatar preview"
              className="w-full h-full rounded-full object-cover"
            />
            {!isUploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearPreview();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            {isUploading ? (
              <div className="text-center">
                <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">{Math.round(progress)}%</span>
              </div>
            ) : (
              <>
                <Upload size={24} className="text-gray-400 mb-1" />
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                  Drag & drop or click
                </span>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
          aria-label="Upload avatar"
        />
      </div>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <p>JPG, PNG, GIF up to {maxSizeMB}MB</p>
        {preview && isUploading && (
          <p className="text-blue-500 font-medium">Uploading...</p>
        )}
      </div>
    </div>
  );
};

export default UploadAvatar;
