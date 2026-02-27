import React, { useState } from 'react';
import { CloudUpload, X, Music, Image, Loader2, Radio } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

interface TrackUploadModalProps {
  onClose: () => void;
}

const TrackUploadModal: React.FC<TrackUploadModalProps> = ({ onClose }) => {
  const { addNotification } = useAudio();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [bpm, setBpm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !genre) {
      addNotification('Please fill in all required fields.', 'warning');
      return;
    }
    setIsUploading(true);
    /* Simulate upload process */
    setTimeout(() => {
      setIsUploading(false);
      addNotification('Track broadcasted successfully to the neural network.', 'success');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0  backdrop-blur-md" onClick={onClose}></div>
      <div className="relative glass border border-blue-500/10 w-full max-w-xl rounded-[10px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full"></div>
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-[10px] flex items-center justify-center shadow-lg shadow-blue-600/20">
              <CloudUpload className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tighter text-white">Broadcast Frequency</h2>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Upload your sonic signature to TonJam</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleUpload} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Track Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter track name..."
                  className="w-full bg-white/5 rounded-[10px] py-3 px-5 text-xs outline-none focus:-blue-500/50 transition-all text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Genre *</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-white/5 rounded-[10px] py-3 px-5 text-xs outline-none focus:-blue-500/50 transition-all text-white/60 appearance-none"
                  required
                >
                  <option value="" disabled>Select Genre</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Synthwave">Synthwave</option>
                  <option value="Techno">Techno</option>
                  <option value="Ambient">Ambient</option>
                  <option value="Pop">Pop</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">BPM (Optional)</label>
                <input
                  type="number"
                  value={bpm}
                  onChange={(e) => setBpm(e.target.value)}
                  placeholder="e.g. 128"
                  className="w-full bg-white/5 rounded-[10px] py-3 px-5 text-xs outline-none focus:-blue-500/50 transition-all text-white"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Audio File (MP3/WAV/FLAC)</label>
                <div className="relative group cursor-pointer h-32 -dashed rounded-[10px] flex flex-col items-center justify-center transition-all bg-white/[0.02]">
                  <Music className="h-8 w-8 text-white/20 mb-2 group-hover:text-blue-500 transition-colors" />
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white/40 transition-colors">Drop sonic file here</p>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="audio/*" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Cover Art (1:1 Ratio)</label>
                <div className="relative group cursor-pointer h-32 -dashed rounded-[10px] flex flex-col items-center justify-center transition-all bg-white/[0.02]">
                  <Image className="h-8 w-8 text-white/20 mb-2 group-hover:text-blue-500 transition-colors" />
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white/40 transition-colors">Drop visual asset here</p>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-4 bg-blue-600 text-white rounded-[10px] font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-500 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> SYNCHRONIZING_DATA...
                </>
              ) : (
                <>
                  <Radio className="h-4 w-4" /> INITIATE_BROADCAST
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrackUploadModal;
 