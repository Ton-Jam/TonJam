import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { DownloadCloud, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`flex items-center gap-2 rounded-xl bg-[#0088CC] hover:bg-[#0077b3] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm cursor-pointer transition-all active:scale-95 ${className}`}
        title="Install TonJam as native Progressive Web App"
      >
        <DownloadCloud className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white cursor-pointer transition-all active:scale-95 ${className}`}
          title="Install TonJam on iOS"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#0F1D32] p-6 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Install TonJam on iPhone / iPad</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                1. Tap the <strong className="text-white">Share</strong> icon in your Safari bottom toolbar.<br />
                2. Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.<br />
                3. Open TonJam from your home screen for full offline music playback!
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-[#0088CC] hover:bg-[#0077b3] py-2.5 text-xs font-bold uppercase tracking-wider text-white cursor-pointer transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
