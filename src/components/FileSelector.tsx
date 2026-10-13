import React, { useRef } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { Track } from '@/types';
import { Upload, FolderOpen } from 'lucide-react';

interface FileSelectorProps {
  onFilesSelected?: (files: FileList) => void | Promise<void>;
  onTracksImported?: (tracks: Track[]) => void;
  accept?: string;
  multiple?: boolean;
  isFolder?: boolean;
  className?: string;
  buttonClassName?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const FileSelector: React.FC<FileSelectorProps> = ({
  onFilesSelected,
  onTracksImported,
  accept = 'audio/*',
  multiple = true,
  isFolder = false,
  className = '',
  buttonClassName = '',
  children,
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { importLocalFiles } = useAudio();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      if (onFilesSelected) {
        await onFilesSelected(files);
      } else {
        const imported = await importLocalFiles(files);
        if (onTracksImported && imported.length > 0) {
          onTracksImported(imported);
        }
      }
    } finally {
      e.target.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        {...(isFolder ? { webkitdirectory: '', directory: '' } : {})}
        onChange={handleFileChange}
        className="hidden"
      />
      {children ? (
        <div onClick={handleClick} className="cursor-pointer inline-block">
          {children}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${buttonClassName}`}
        >
          {isFolder ? <FolderOpen className="w-4 h-4 text-emerald-400" /> : <Upload className="w-4 h-4 text-cyan-400" />}
          <span>{isFolder ? 'Select Folder' : 'Select Audio Files'}</span>
        </button>
      )}
    </div>
  );
};
