import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Bell, Wallet, Search, ArrowLeft, MoreHorizontal, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APP_LOGO } from '@/constants';
import { NotificationBell } from '@/components/NotificationBell';
import { useAudio } from '@/contexts/AudioContext';

interface GlobalHeaderProps {
  title?: string;
  onBack?: () => void;
  showSearch?: boolean;
  onSearchClick?: () => void;
  showWallet?: boolean;
  onWalletClick?: () => void;
  showNotifications?: boolean;
  onNotificationsClick?: () => void;
  avatarUrl?: string;
  onAvatarClick?: () => void;
  rightActionSlot?: React.ReactNode;
  isSticky?: boolean;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  title,
  onBack,
  showSearch = true,
  onSearchClick,
  showWallet = true,
  onWalletClick,
  showNotifications = true,
  onNotificationsClick,
  avatarUrl,
  onAvatarClick,
  rightActionSlot,
  isSticky = true,
}) => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { userProfile } = useAudio();
  const isArtistVerified = userProfile?.isVerifiedArtist || userProfile?.role === 'artist';

  // Background opacity transitions seamlessly on scroll
  const bgOpacity = useTransform(scrollY, [0, 50], [0, 0.85]);
  const blurValue = useTransform(scrollY, [0, 50], [0, 16]);

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsScrolled(latest > 20);
    });
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <motion.header
      className={`
        w-full h-16 px-4 flex items-center justify-between z-40
        ${isSticky ? 'sticky top-0' : 'relative'}
      `}
      style={{
        backgroundColor: `rgba(0, 0, 0, ${isScrolled ? 0.75 : 0})`,
        backdropFilter: isScrolled ? 'blur(16px)' : 'blur(0px)',
        WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'blur(0px)',
      }}
    >
      {/* Left section: Back button or Logo + Title */}
      <div className="flex items-center gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-white/5 active:scale-95 transition-all text-white"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <img
              src={APP_LOGO}
              alt="TonJam Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
        )}

        {title && (
          <span className="font-black text-sm uppercase tracking-widest text-white truncate max-w-[150px] sm:max-w-[200px]">
            {title}
          </span>
        )}
      </div>

      {/* Right Actions Slot & Interactive Buttons */}
      <div className="flex items-center gap-1">
        {showSearch && (
          <button
            onClick={onSearchClick}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 active:scale-95 transition-all"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        {showWallet && (
          <button
            onClick={onWalletClick}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 active:scale-95 transition-all"
            aria-label="Wallet"
          >
            <Wallet className="w-5 h-5" />
          </button>
        )}

        {showNotifications && (
          <NotificationBell onClick={onNotificationsClick} />
        )}

        {isArtistVerified && (
          <button
            onClick={() => navigate('/artist-dashboard')}
            className="px-2.5 py-1.5 bg-[#0052FF] hover:bg-[#1a66ff] active:scale-95 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer ml-1"
            title="Artist Dashboard"
            aria-label="Artist Dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        )}

        {rightActionSlot}

        {avatarUrl && (
          <button
            onClick={onAvatarClick}
            className="ml-1 active:scale-95 transition-transform"
            aria-label="Profile"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1E2230]">
              <img
                src={avatarUrl}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </button>
        )}
      </div>
    </motion.header>
  );
};
export default GlobalHeader;
