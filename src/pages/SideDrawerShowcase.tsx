import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  ShieldCheck,
  UserCheck,
  UserX,
  Palette,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Bell,
  Eye,
  Layers,
  Smartphone,
  Sliders,
  LogOut,
  ChevronRight,
  FolderTree,
  Radio,
  Compass,
  ShoppingBag,
  Ticket,
  Wallet,
  Coins,
  LayoutDashboard,
  Clock,
  ListMusic,
  Upload,
  Home,
  Check,
} from 'lucide-react';

import {
  SideDrawer,
  DrawerProfileHeader,
  GuestProfileHeader,
  DrawerNavigationItem,
  DrawerSection,
  DrawerNotificationBadge,
  DrawerWalletStatus,
  DrawerFooter,
  SignOutConfirmationDialog,
} from '@/components/drawer';
import { APP_LOGO } from '@/constants';

export const SideDrawerShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'prototype' | 'states' | 'components'>('prototype');

  // Prototype state overrides
  const [previewUserType, setPreviewUserType] = useState<'auth' | 'guest'>('auth');
  const [previewRole, setPreviewRole] = useState<'artist' | 'collector'>('artist');
  const [unreadCount, setUnreadCount] = useState<number>(3);
  const [showSignOutDialog, setShowSignOutDialog] = useState<boolean>(false);
  const [selectedStateView, setSelectedStateView] = useState<string>('open');

  const mockAuthUser = {
    displayName: 'Alex Rivers',
    email: 'alex.rivers@tonjam.io',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  const mockUserProfile = {
    uid: 'user-demo-123',
    name: 'Alex Rivers',
    username: '@alexrivers',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Electronic music producer & Web3 soundscape curator on TON blockchain.',
    followers: 1420,
    following: 388,
    isVerified: true,
    isVerifiedArtist: previewRole === 'artist',
    role: previewRole,
    tjBalance: 2450,
    jamBalance: 2450,
    earnings: 0,
  };

  return (
    <div className="w-full min-h-screen bg-[#080D1A] text-white font-sans pb-32 pt-6 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col gap-6 text-left select-none">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#229ED9] bg-[#229ED9]/15 px-2 py-0.5 rounded-full">
              TonJam Mobile Design System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            TonJam — Side Drawer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Premium, production-ready side navigation drawer inspired by Telegram and Spotify, built natively for TonJam's dark-navy TON Web3 ecosystem.
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/unified-design-system')}
            className="py-3 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer outline-none"
          >
            <Smartphone className="w-4 h-4 text-[#2E8CEB]" />
            <span>Mobile 3-Screen System</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="py-3 px-5 rounded-2xl bg-[#229ED9] hover:bg-[#1f8ec4] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer outline-none"
          >
            <Menu className="w-4 h-4" />
            <span>Launch Live Drawer</span>
          </button>
        </div>
      </div>

      {/* SEGMENTED TAB SELECTOR - NO BORDERS */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('prototype')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer outline-none text-center ${
            activeTab === 'prototype'
              ? 'bg-[#229ED9] text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Interactive Prototype
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('states')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer outline-none text-center ${
            activeTab === 'states'
              ? 'bg-[#229ED9] text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Required States (7)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('components')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer outline-none text-center ${
            activeTab === 'components'
              ? 'bg-[#229ED9] text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Figma Components
        </button>
      </div>

      {/* TAB 1: INTERACTIVE PROTOTYPE */}
      {activeTab === 'prototype' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT: CONTROLS PANEL */}
          <div className="lg:col-span-5 rounded-3xl bg-[#101A2D] p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-white font-extrabold text-sm">
              <Sliders className="w-4 h-4 text-[#229ED9]" />
              <span>Prototype Configurations</span>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Account Session</span>
                <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewUserType('auth')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer outline-none ${
                      previewUserType === 'auth' ? 'bg-[#229ED9] text-white' : 'text-slate-400'
                    }`}
                  >
                    Authenticated
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewUserType('guest')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer outline-none ${
                      previewUserType === 'guest' ? 'bg-[#229ED9] text-white' : 'text-slate-400'
                    }`}
                  >
                    Guest
                  </button>
                </div>
              </div>

              {previewUserType === 'auth' && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Role & Permissions</span>
                  <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPreviewRole('artist')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer outline-none ${
                        previewRole === 'artist' ? 'bg-[#9B7CFF] text-white' : 'text-slate-400'
                      }`}
                    >
                      Artist
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewRole('collector')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer outline-none ${
                        previewRole === 'collector' ? 'bg-[#229ED9] text-white' : 'text-slate-400'
                      }`}
                    >
                      Listener
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Notifications Badge</span>
                <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl">
                  {[0, 1, 4, 12].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setUnreadCount(count)}
                      className={`px-2.5 py-0.5 rounded-lg font-mono font-bold text-[11px] transition-colors cursor-pointer outline-none ${
                        unreadCount === count ? 'bg-[#229ED9] text-white' : 'text-slate-400'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowSignOutDialog(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer outline-none flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Trigger Sign-Out Dialog</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] font-bold text-xs transition-colors cursor-pointer outline-none flex items-center justify-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Full Screen Drawer</span>
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] text-[11px] text-slate-400 leading-relaxed mt-1">
                Tip: On mobile devices, swipe right from the left screen edge (&lt; 32px) anytime to slide open the side navigation drawer natively.
              </div>
            </div>
          </div>

          {/* RIGHT: REALISTIC MOBILE FRAME PREVIEW - NO BORDERS */}
          <div className="lg:col-span-7 rounded-3xl bg-[#080D1A] p-4 flex flex-col gap-3 shadow-2xl items-center justify-center relative overflow-hidden">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between w-full max-w-[340px] px-1">
              <span>Mobile Surface Viewport</span>
              <span className="text-[#34D399] font-mono">340px Max Width</span>
            </div>

            {/* EMBEDDED DRAWER SIMULATION */}
            <div className="w-full max-w-[340px] rounded-3xl bg-[#101A2D] p-4 flex flex-col gap-3 text-left shadow-2xl max-h-[640px] overflow-y-auto">
              {/* TOP BRAND BAR */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <img src={APP_LOGO} alt="TonJam" className="w-7 h-7 object-contain" />
                  <span className="font-black text-sm tracking-tight text-white">TonJam</span>
                  <span className="text-[9px] font-mono font-bold text-[#229ED9] bg-[#229ED9]/15 px-1.5 py-0.2 rounded-md">
                    TON
                  </span>
                </div>
                <div className="text-[10px] font-bold text-slate-500">Preview</div>
              </div>

              {/* PROFILE OR GUEST HEADER */}
              {previewUserType === 'auth' ? (
                <DrawerProfileHeader
                  user={mockAuthUser}
                  userProfile={mockUserProfile}
                  onNavigate={(path) => console.log('Navigate:', path)}
                />
              ) : (
                <GuestProfileHeader onSignIn={() => setPreviewUserType('auth')} />
              )}

              {/* WALLET STATUS */}
              <DrawerWalletStatus
                tonAddress="EQCD39VS5jcptHL8vMjEXrxPUZdOq6ifK8VQMWxOGD89xA"
                tjBalance={2450}
                onNavigate={(path) => console.log('Navigate:', path)}
              />

              {/* PRIMARY DESTINATIONS */}
              <DrawerSection title="Primary Destinations">
                <DrawerNavigationItem icon={Home} label="Home" isActive={true} onClick={() => {}} />
                <DrawerNavigationItem icon={Radio} label="Jam Feeds" isActive={false} onClick={() => {}} />
                <DrawerNavigationItem icon={Compass} label="Search & Discover" isActive={false} onClick={() => {}} />
                <DrawerNavigationItem icon={Bell} label="Notifications" badgeCount={unreadCount} isActive={false} onClick={() => {}} />
              </DrawerSection>

              {/* MARKET & WALLET */}
              <DrawerSection title="Web3 Market" hasDivider>
                <DrawerNavigationItem icon={ShoppingBag} label="NFT Marketplace" isActive={false} onClick={() => {}} />
                <DrawerNavigationItem icon={Ticket} label="My NFTs" isActive={false} onClick={() => {}} />
                <DrawerNavigationItem icon={Wallet} label="TON Wallet" isActive={false} onClick={() => {}} />
                <DrawerNavigationItem icon={Coins} label="Earn TJ" badgeLabel="Rewards" isActive={false} onClick={() => {}} />
              </DrawerSection>

              {/* CREATOR SECTION */}
              <DrawerSection title="Music & Creator" hasDivider>
                <DrawerNavigationItem icon={Clock} label="Recently Played" isActive={false} onClick={() => {}} />
                <DrawerNavigationItem icon={ListMusic} label="Playlists" isActive={false} onClick={() => {}} />
                {previewRole === 'artist' ? (
                  <>
                    <DrawerNavigationItem icon={LayoutDashboard} label="Artist Dashboard" badgeLabel="Studio" isActive={false} onClick={() => {}} />
                    <DrawerNavigationItem icon={Upload} label="Upload Track" isActive={false} onClick={() => {}} />
                  </>
                ) : (
                  <DrawerNavigationItem icon={Sparkles} label="Become a Creator" subtitle="Mint tracks & earn TON" isActive={false} onClick={() => {}} />
                )}
              </DrawerSection>

              {/* FOOTER */}
              <DrawerFooter
                isAuthenticated={previewUserType === 'auth'}
                onNavigate={(path) => console.log('Navigate:', path)}
                onSignOutClick={() => setShowSignOutDialog(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REQUIRED STATES (7) */}
      {activeTab === 'states' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'open', label: '1. Main Open Screen' },
              { id: 'closed', label: '2. Closed State' },
              { id: 'auth', label: '3. Authenticated' },
              { id: 'guest', label: '4. Guest State' },
              { id: 'artist', label: '5. Artist-Enabled' },
              { id: 'scroll', label: '6. Scrollable State' },
              { id: 'signout', label: '7. Sign-Out Dialog' },
            ].map((state) => (
              <button
                key={state.id}
                type="button"
                onClick={() => setSelectedStateView(state.id)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer outline-none ${
                  selectedStateView === state.id
                    ? 'bg-[#229ED9] text-white shadow-sm'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white'
                }`}
              >
                {state.label}
              </button>
            ))}
          </div>

          <div className="rounded-3xl bg-[#101A2D] p-5 flex flex-col gap-4">
            {selectedStateView === 'open' && (
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-white">State 1: Main Open-Drawer Screen</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Smooth 220ms spring slide from left (`x: -100%` to `x: 0`). Dims underlying screen with subtle 70% black backdrop and background blur. Drawer width is capped at 340px, preserving safe areas and layout integrity.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="py-2.5 px-4 rounded-xl bg-[#229ED9] text-white font-bold text-xs cursor-pointer"
                  >
                    Preview Main Open Screen Now
                  </button>
                </div>
              </div>
            )}

            {selectedStateView === 'closed' && (
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-white">State 2: Closed-Drawer State</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Drawer is hidden off-screen (`x: -100%`), freeing viewport completely. Triggered seamlessly by:
                </p>
                <ul className="text-xs text-slate-400 space-y-1 list-disc pl-5">
                  <li>Tapping the mobile menu hamburger button beside the TonJam brand mark in the header.</li>
                  <li>Swiping right from the left screen edge on mobile (&lt; 32px start).</li>
                  <li>Dispatching `openTonJamDrawer` custom window event from any child page.</li>
                </ul>
              </div>
            )}

            {selectedStateView === 'auth' && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-white">State 3: Authenticated-User State</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Displays verified avatar, display name, @handle, verified badge, bio, live follower and following metrics, TON address, and TJ reward balance.
                </p>
                <div className="max-w-sm">
                  <DrawerProfileHeader
                    user={mockAuthUser}
                    userProfile={mockUserProfile}
                    onNavigate={() => {}}
                  />
                </div>
              </div>
            )}

            {selectedStateView === 'guest' && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-white">State 4: Guest / Signed-Out State</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Presents the TonJam logo, welcoming copy, and a direct "Sign In" button. Conceals private shortcuts (My NFTs, Wallet details, following stats) without fabricated data.
                </p>
                <div className="max-w-sm">
                  <GuestProfileHeader onSignIn={() => setIsDrawerOpen(true)} />
                </div>
              </div>
            )}

            {selectedStateView === 'artist' && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-white">State 5: Artist-Enabled Navigation State</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Role-based access check evaluates `isArtist`, `isAdmin`, or `isVerifiedArtist`. When authorized, unlocks Creator Studio shortcuts: Artist Dashboard and Upload Track.
                </p>
                <div className="max-w-sm rounded-2xl bg-white/[0.04] p-3 space-y-1">
                  <DrawerNavigationItem icon={LayoutDashboard} label="Artist Dashboard" badgeLabel="Studio" isActive={true} onClick={() => {}} />
                  <DrawerNavigationItem icon={Upload} label="Upload Track" isActive={false} onClick={() => {}} />
                </div>
              </div>
            )}

            {selectedStateView === 'scroll' && (
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-white">State 6: Scrollable Drawer State</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Maintains usability across smaller screens via independent vertical scrolling (`overflow-y-auto`) while preserving header and footer access.
                </p>
                <div className="p-3 rounded-2xl bg-white/[0.02] text-xs text-slate-400">
                  Touch momentum scrolling enabled with bottom safe-area offset padding (`pb-12`).
                </div>
              </div>
            )}

            {selectedStateView === 'signout' && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-white">State 7: Sign-Out Confirmation Dialog</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Accessible, non-disruptive modal requiring user confirmation before terminating session and clearing cached credentials.
                </p>
                <button
                  type="button"
                  onClick={() => setShowSignOutDialog(true)}
                  className="py-2.5 px-4 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer"
                >
                  Open Sign-Out Dialog Modal
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FIGMA COMPONENT LIBRARY */}
      {activeTab === 'components' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {[
            {
              name: 'SideDrawer',
              role: 'Root Layout Frame',
              desc: 'Slides from left with 220ms spring damping, dimmed backdrop, and keyboard escape trap.',
            },
            {
              name: 'DrawerProfileHeader',
              role: 'User Identity Component',
              desc: 'Circular avatar, @handle, verified badge, bio, and live follower metrics.',
            },
            {
              name: 'GuestProfileHeader',
              role: 'Unauthenticated State',
              desc: 'Clean brand logo, description, and primary Sign In CTA without mock balances.',
            },
            {
              name: 'DrawerNavigationItem',
              role: 'Interactive Nav Item',
              desc: 'Touch target $\\ge 44$px with blue-tinted active state (#229ED9/15) and badge support.',
            },
            {
              name: 'DrawerSection',
              role: 'Category Grouping',
              desc: 'Subtle section kickers with quiet hairline divider spacing.',
            },
            {
              name: 'DrawerNotificationBadge',
              role: 'Indicator Pill',
              desc: 'Dynamic unread count badge; automatically hidden when count is 0.',
            },
            {
              name: 'DrawerWalletStatus',
              role: 'Web3 Wallet Pill',
              desc: 'Displays real TON address, live connection indicator, and TJ reward points.',
            },
            {
              name: 'DrawerFooter',
              role: 'System Controls',
              desc: 'Settings, About/Help, version telemetry (v1.4.2), and sign-out action.',
            },
            {
              name: 'SignOutConfirmationDialog',
              role: 'Exit Modal',
              desc: 'Spring-animated confirmation dialog preventing accidental session loss.',
            },
          ].map((item) => (
            <div key={item.name} className="p-4 rounded-3xl bg-[#101A2D] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#229ED9]">{item.name}</span>
                <Check className="w-3.5 h-3.5 text-[#34D399]" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {item.role}
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* MAIN SIDE DRAWER INSTANCE */}
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* SIGN OUT CONFIRMATION DIALOG */}
      <SignOutConfirmationDialog
        isOpen={showSignOutDialog}
        onConfirm={() => {
          setShowSignOutDialog(false);
          setPreviewUserType('guest');
        }}
        onCancel={() => setShowSignOutDialog(false)}
      />
    </div>
  );
};

export default SideDrawerShowcase;
