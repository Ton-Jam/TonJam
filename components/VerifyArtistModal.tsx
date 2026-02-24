import React, { useState, useRef } from 'react';
import { useAudio } from '../context/AudioContext';

interface VerifyArtistModalProps {
  onClose: () => void;
  artistName: string;
}

const VerifyArtistModal: React.FC<VerifyArtistModalProps> = ({ onClose, artistName }) => {
  const { addNotification } = useAudio();
  const [step, setStep] = useState<'upload' | 'processing' | 'success'>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      addNotification("Please upload verification documents", "error");
      return;
    }
    
    setStep('processing');
    
    // Simulate verification process
    setTimeout(() => {
      setStep('success');
      addNotification("Verification request submitted", "success");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <i className="fas fa-shield-check text-blue-500 text-sm"></i>
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Verify Identity</h3>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">For {artistName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times text-white/40 text-xs"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-xs text-white/60 leading-relaxed">
                  To verify your artist profile on TonJam, please upload proof of identity and ownership of your musical works.
                </p>
                <div className="flex gap-2 justify-center mt-4">
                  <span className="px-2 py-1 bg-white/5 rounded text-[8px] font-black text-white/40 uppercase tracking-widest">ID Card</span>
                  <span className="px-2 py-1 bg-white/5 rounded text-[8px] font-black text-white/40 uppercase tracking-widest">Social Proof</span>
                  <span className="px-2 py-1 bg-white/5 rounded text-[8px] font-black text-white/40 uppercase tracking-widest">Copyright</span>
                </div>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                  <i className="fas fa-cloud-upload-alt text-white/20 group-hover:text-blue-500 transition-colors text-lg"></i>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">Click to Upload Documents</p>
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">JPG, PNG, PDF (Max 10MB)</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  multiple 
                  className="hidden" 
                  accept=".jpg,.jpeg,.png,.pdf"
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-2">Attached Files ({files.length})</p>
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-file text-white/20 text-xs"></i>
                        <span className="text-[10px] text-white/80 truncate max-w-[180px]">{file.name}</span>
                      </div>
                      <button 
                        onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                        className="text-white/20 hover:text-red-500 transition-colors"
                      >
                        <i className="fas fa-times text-[10px]"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={handleSubmit}
                className="w-full py-4 electric-blue-bg text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Submit for Verification <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-fingerprint text-blue-500 text-2xl animate-pulse"></i>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Analyzing Credentials</h4>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Validating against blockchain records...</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <i className="fas fa-check text-3xl text-green-500"></i>
              </div>
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Request Submitted</h4>
                <p className="text-xs text-white/60 max-w-[280px] mx-auto leading-relaxed">
                  Your verification request has been queued. You will receive a notification once the consensus protocol validates your identity.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
              >
                Close Protocol
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyArtistModal;
