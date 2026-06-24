import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface QRScannerProps {
  onClose: () => void;
  onScan: (data: string | null) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onClose, onScan }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        setLoading(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        if (active) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setLoading(false);
        } else {
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        if (active) {
          console.error(err);
          setError("Failed to access camera. Please check permissions.");
          setLoading(false);
          toast.error("Could not start camera feed.");
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-sm bg-[#050b1c] rounded-2xl overflow-hidden border border-white/10 p-4">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/60 text-white rounded-full hover:bg-white/20 transition-all border border-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950 border border-white/5 flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-slate-950">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-xs text-slate-400">Initializing Camera...</p>
            </div>
          )}

          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center z-10 bg-slate-950">
              <Camera className="w-10 h-10 text-slate-500 mb-2" />
              <p className="text-xs text-red-400 font-bold">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                    .then(stream => {
                      streamRef.current = stream;
                      if (videoRef.current) videoRef.current.srcObject = stream;
                      setLoading(false);
                    })
                    .catch(() => {
                      setError("Could not re-initialize camera.");
                      setLoading(false);
                    });
                }}
                className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-all text-white"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Scan overlay guide animations */}
              <div className="absolute inset-0 border-2 border-dashed border-blue-500/40 m-12 rounded-lg pointer-events-none">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400"></div>
                <div className="absolute left-0 right-0 h-0.5 bg-blue-500/80 shadow-[0_0_8px_#3b82f6] animate-[bounce_2s_infinite]"></div>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-[10px] text-slate-400/85 py-3 uppercase tracking-[0.2em] font-bold">
          Align QR code within frame
        </p>
      </div>
    </div>
  );
};

export default QRScanner;
