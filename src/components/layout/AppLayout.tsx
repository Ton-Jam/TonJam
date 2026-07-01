import React, { useState } from 'react';
import { ToastProvider } from './ToastProvider';
import { ModalProvider } from './ModalProvider';
import { GlobalHeader } from './GlobalHeader';
import { BottomNavigation, TabId } from './BottomNavigation';
import { MiniPlayer } from './MiniPlayer';
import { FloatingActions } from './FloatingActions';
import { BottomSheet } from './BottomSheet';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
  headerTitle?: string;
  onBackClick?: () => void;
  currentTrack?: {
    id: string;
    title: string;
    artist: string;
    coverUrl?: string;
  };
  isPlaying?: boolean;
  onPlayPause?: () => void;
  progress?: number;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeTab = 'discover',
  onTabChange = () => {},
  headerTitle = 'TonJam',
  onBackClick,
  currentTrack,
  isPlaying = false,
  onPlayPause = () => {},
  progress = 0.45,
}) => {
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  return (
    <ToastProvider>
      <ModalProvider>
        <div className="min-h-screen w-full bg-[#050608] text-slate-100 flex flex-col relative overflow-hidden font-sans">
          {/* Ambient Background Glow Particles */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-blue-900/15 rounded-full blur-[140px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/15 rounded-full blur-[140px]" />
          </div>

          {/* Sticky Unified Global Header */}
          <div className="z-40 relative">
            <GlobalHeader
              title={headerTitle}
              onBack={onBackClick}
              showSearch={true}
              onSearchClick={() => alert('Search Triggered')}
              showWallet={true}
              onWalletClick={() => alert('Wallet Connection modal active')}
              showNotifications={true}
              onNotificationsClick={() => alert('Notifications Hub active')}
            />
          </div>

          {/* Scrollable Content Viewport Area */}
          <main className="flex-1 w-full relative z-10">
            {children}
          </main>

          {/* Dynamic Interactive Mini Player */}
          {currentTrack && (
            <MiniPlayer
              track={currentTrack}
              isPlaying={isPlaying}
              onPlayPause={onPlayPause}
              onQueueClick={() => setIsQueueOpen(true)}
              onExpand={() => alert('Expanded player requested')}
              progress={progress}
            />
          )}

          {/* Floating Actions System */}
          <FloatingActions
            onUploadClick={() => alert('Quick upload action activated')}
            onMintClick={() => alert('NFT Mint Launchpad activated')}
            onStakingClick={() => alert('Staking Hub active')}
          />

          {/* Unified Draggable Bottom Sheet for Audio Queue */}
          <BottomSheet
            isOpen={isQueueOpen}
            onClose={() => setIsQueueOpen(false)}
            title="Next in Queue"
          >
            <div className="space-y-3 py-2 select-none">
              <p className="text-[10px] font-bold text-[#9AA0AE] uppercase tracking-widest">Currently Playing</p>
              {currentTrack && (
                <div className="flex items-center gap-3 p-2 bg-blue-500/10 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-[#1E2230] overflow-hidden flex-shrink-0">
                    <img src={currentTrack.coverUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white uppercase tracking-wider">{currentTrack.title}</h5>
                    <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">{currentTrack.artist}</p>
                  </div>
                </div>
              )}

              <p className="text-[10px] font-bold text-[#9AA0AE] uppercase tracking-widest mt-4">Up Next</p>
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-[#1E2230] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-black text-white uppercase tracking-wider truncate">Next Track {idx + 1}</h5>
                    <p className="text-[9px] font-bold text-[#9AA0AE] uppercase tracking-widest truncate">Meta Artist {idx + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </BottomSheet>

          {/* Bottom Navigation System */}
          <BottomNavigation
            activeTab={activeTab}
            onTabChange={onTabChange}
          />
        </div>
      </ModalProvider>
    </ToastProvider>
  );
};
export default AppLayout;
