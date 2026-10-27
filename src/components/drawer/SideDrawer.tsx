import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  Radio,
  Send,
  Bell,
  Library,
  ShoppingBag,
  Ticket,
  Wallet,
  Coins,
  LayoutDashboard,
  Settings,
  Clock,
  ListMusic,
  Upload,
  Sparkles,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { APP_LOGO } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/contexts/AudioContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useTonAddress } from '@tonconnect/ui-react';

import DrawerProfileHeader from './DrawerProfileHeader';
import GuestProfileHeader from './GuestProfileHeader';
import DrawerNavigationItem from './DrawerNavigationItem';
import DrawerSection from './DrawerSection';
import DrawerWalletStatus from './DrawerWalletStatus';
import DrawerFooter from './DrawerFooter';
import SignOutConfirmationDialog from './SignOutConfirmationDialog';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const { isArtist, isAdmin } = useUserRole();
  const { unreadCount } = useNotification();
  const tonAddress = useTonAddress();

  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const canAccessCreatorFeatures = Boolean(
    isArtist || isAdmin || userProfile?.isVerifiedArtist || userProfile?.role === 'artist'
  );

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleConfirmSignOut = async () => {
    try {
      setIsSignOutModalOpen(false);
      onClose();
      await signOut();
      toast.success('Signed out successfully');
    } catch (err) {
      console.error('Sign out error:', err);
      toast.error('Failed to sign out');
    }
  };

  const isCurrent = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[80] select-none">
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* SIDE DRAWER CONTAINER - NO BORDER LINES */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 left-0 bottom-0 w-[84vw] max-w-[340px] bg-[#080D1A] z-10 flex flex-col shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Side Navigation Drawer"
            >
              {/* DRAWER TOP BAR: BRAND LOGO + CLOSE BUTTON */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleNavigate('/')}
                  className="flex items-center gap-2.5 cursor-pointer outline-none group"
                >
                  <img
                    src={APP_LOGO}
                    alt="TonJam"
                    className="w-8 h-8 object-contain drop-shadow-[0_2px_8px_rgba(34,158,217,0.35)]"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-base tracking-tight text-white group-hover:text-[#229ED9] transition-colors">
                      TonJam
                    </span>
                    <span className="text-[9px] font-mono font-bold text-[#229ED9] bg-[#229ED9]/15 px-1.5 py-0.5 rounded-md">
                      TON
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer outline-none"
                  aria-label="Close navigation drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* DRAWER SCROLLABLE CONTENT */}
              <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-4 text-left">
                {/* PROFILE HEADER / GUEST STATE */}
                {user ? (
                  <DrawerProfileHeader
                    user={user}
                    userProfile={userProfile}
                    onNavigate={handleNavigate}
                  />
                ) : (
                  <GuestProfileHeader onSignIn={() => handleNavigate('/login')} />
                )}

                {/* WALLET & TJ POINTS STATUS */}
                <DrawerWalletStatus
                  tonAddress={tonAddress}
                  tjBalance={userProfile?.tjBalance ?? userProfile?.jamBalance}
                  onNavigate={handleNavigate}
                />

                {/* PRIMARY NAVIGATION DESTINATIONS */}
                <DrawerSection title="Explore & Connect">
                  <DrawerNavigationItem
                    icon={Home}
                    label="Home"
                    isActive={isCurrent('/')}
                    onClick={() => handleNavigate('/')}
                  />
                  <DrawerNavigationItem
                    icon={Radio}
                    label="Jam Feeds"
                    isActive={isCurrent('/home') || isCurrent('/social')}
                    onClick={() => handleNavigate('/home')}
                  />
                  <DrawerNavigationItem
                    icon={Send}
                    label="JamSpace"
                    isActive={isCurrent('/jamspace')}
                    onClick={() => handleNavigate('/jamspace')}
                  />
                  <DrawerNavigationItem
                    icon={Bell}
                    label="Notifications"
                    isActive={isCurrent('/notifications')}
                    badgeCount={unreadCount}
                    onClick={() => handleNavigate('/notifications')}
                  />
                  <DrawerNavigationItem
                    icon={Library}
                    label="Library"
                    isActive={isCurrent('/library')}
                    onClick={() => handleNavigate('/library')}
                  />
                  <DrawerNavigationItem
                    icon={Compass}
                    label="Search & Discover"
                    isActive={isCurrent('/discover')}
                    onClick={() => handleNavigate('/discover')}
                  />
                </DrawerSection>

                {/* WEB3 MUSIC & REWARDS DESTINATIONS */}
                <DrawerSection title="Web3 Music & Market" hasDivider>
                  <DrawerNavigationItem
                    icon={ShoppingBag}
                    label="NFT Marketplace"
                    isActive={isCurrent('/marketplace')}
                    onClick={() => handleNavigate('/marketplace')}
                  />
                  <DrawerNavigationItem
                    icon={Ticket}
                    label="My NFTs"
                    isActive={isCurrent('/my-nfts')}
                    onClick={() => handleNavigate('/my-nfts')}
                  />
                  <DrawerNavigationItem
                    icon={Wallet}
                    label="TON Wallet"
                    isActive={isCurrent('/wallet')}
                    onClick={() => handleNavigate('/wallet')}
                  />
                  <DrawerNavigationItem
                    icon={Coins}
                    label="Earn TJ"
                    badgeLabel="Rewards"
                    isActive={isCurrent('/tasks')}
                    onClick={() => handleNavigate('/tasks')}
                  />
                </DrawerSection>

                {/* MUSIC & CREATOR SHORTCUTS */}
                <DrawerSection title="Music & Creator" hasDivider>
                  <DrawerNavigationItem
                    icon={Clock}
                    label="Recently Played"
                    isActive={isCurrent('/library/recently-played')}
                    onClick={() => handleNavigate('/library/recently-played')}
                  />
                  <DrawerNavigationItem
                    icon={ListMusic}
                    label="Playlists"
                    isActive={isCurrent('/library')}
                    onClick={() => handleNavigate('/library')}
                  />

                  {canAccessCreatorFeatures ? (
                    <>
                      <DrawerNavigationItem
                        icon={LayoutDashboard}
                        label="Artist Dashboard"
                        badgeLabel="Studio"
                        isActive={isCurrent('/artist-dashboard')}
                        onClick={() => handleNavigate('/artist-dashboard')}
                      />
                      <DrawerNavigationItem
                        icon={Upload}
                        label="Upload Track"
                        isActive={isCurrent('/upload')}
                        onClick={() => handleNavigate('/upload')}
                      />
                    </>
                  ) : (
                    <DrawerNavigationItem
                      icon={Sparkles}
                      label="Become a Creator"
                      subtitle="Mint tracks & earn TON"
                      isActive={isCurrent('/artist-onboarding')}
                      onClick={() => handleNavigate('/artist-onboarding')}
                    />
                  )}
                </DrawerSection>

                {/* DRAWER FOOTER */}
                <DrawerFooter
                  isAuthenticated={Boolean(user)}
                  onNavigate={handleNavigate}
                  onSignOutClick={() => setIsSignOutModalOpen(true)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIGN OUT CONFIRMATION MODAL */}
      <SignOutConfirmationDialog
        isOpen={isSignOutModalOpen}
        onConfirm={handleConfirmSignOut}
        onCancel={() => setIsSignOutModalOpen(false)}
      />
    </>
  );
};

export default SideDrawer;
