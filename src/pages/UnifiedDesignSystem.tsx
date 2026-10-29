import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Smartphone,
  Sliders,
  Settings,
  Bell,
  Coins,
  Palette,
  Play,
  Pause,
  Compass,
  Music,
  ShoppingBag,
  User,
  Radio,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Eye,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import {
  MobileSettingsScreen,
  MobileNotificationsScreen,
  MobileEarnTJScreen,
} from '../components/unified/screens';
import {
  TonJamHeader,
  ProfileSummaryCard,
  SectionHeading,
  SettingsRow,
  SettingsToggleRow,
  SettingsSelectionRow,
  NotificationFilterPills,
  NotificationItem,
  TaskCategoryPill,
  TJRewardsCard,
  FeaturedTaskCard,
  TaskCard,
  TaskRewardBadge,
  TaskProgressBar,
  TaskStatusBadge,
  EmptyState,
  ErrorState,
  SkeletonRow,
} from '../components/unified';
import { TJ_COIN_ICON } from '@/constants';
import { toast } from 'sonner';

export const UnifiedDesignSystem: React.FC = () => {
  const navigate = useNavigate();

  // Navigation tabs in Figma-style file organization
  const [activeView, setActiveView] = useState<
    'canvas' | 'settings' | 'notifications' | 'earn' | 'components'
  >('canvas');

  // Mini-player simulation state
  const [showMiniPlayer, setShowMiniPlayer] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Canvas zoom state
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Bottom Nav items
  const navTabs = [
    { id: 'home', label: 'Home', icon: Compass, path: '/' },
    { id: 'discover', label: 'Discover', icon: Radio, path: '/discover' },
    { id: 'marketplace', label: 'NFTs', icon: ShoppingBag, path: '/marketplace' },
    { id: 'earn', label: 'Earn TJ', icon: Coins, path: '/tasks' },
    { id: 'profile', label: 'Library', icon: Music, path: '/library' },
  ];

  const [activeNavTab, setActiveNavTab] = useState('home');

  // Wrapper for 390x960 Mobile Device Frame
  const MobileDeviceFrame: React.FC<{
    screenName: string;
    screenBadge: string;
    children: React.ReactNode;
  }> = ({ screenName, screenBadge, children }) => (
    <div className="flex flex-col items-center gap-3">
      {/* Figma Frame Header Meta */}
      <div className="flex items-center justify-between w-[390px] px-2 text-xs font-mono select-none">
        <span className="font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2E8CEB]" />
          {screenName}
        </span>
        <span className="text-slate-400 text-[11px] bg-white/[0.04] px-2 py-0.5 rounded-md">
          {screenBadge} · 390 × 960 px
        </span>
      </div>

      {/* Device Viewport Canvas */}
      <div className="relative w-[390px] h-[960px] bg-[#091326] rounded-[44px] shadow-2xl flex flex-col overflow-hidden select-none">
        {/* Dynamic Island / Mobile Notch Area */}
        <div className="sticky top-0 z-30 w-full h-8 bg-[#091326] flex items-center justify-between px-7 shrink-0 text-white text-[11px] font-semibold">
          <span>9:41</span>
          <div className="w-24 h-4 bg-black rounded-full" />
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>5G</span>
            <div className="w-4 h-2 rounded-sm bg-white" />
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          {children}
        </div>

        {/* Interactive Mini Player (Positioned directly above bottom nav) */}
        {showMiniPlayer && (
          <div className="relative z-20 px-3 pb-1">
            <div className="w-full h-14 rounded-2xl bg-[#111C30]/95 backdrop-blur-md px-3.5 flex items-center justify-between gap-3 shadow-lg select-none">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop&q=80"
                  alt="Now Playing"
                  className="w-9 h-9 rounded-xl object-cover shrink-0"
                />
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-xs font-bold text-white truncate">
                    Sonic Horizons VIP
                  </span>
                  <span className="text-[10px] text-[#91A8C5] truncate">
                    Alex Rivers · Lossless FLAC
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-[#2E8CEB] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-white" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shared Bottom Navigation */}
        <div className="relative z-20 w-full h-16 bg-[#0B1626]/95 backdrop-blur-md px-4 flex items-center justify-around select-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeNavTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveNavTab(tab.id);
                  if (tab.id === 'earn') setActiveView('earn');
                  if (tab.id === 'home') navigate('/');
                }}
                className={`flex flex-col items-center justify-center py-1 gap-1 transition-colors ${
                  isActive ? 'text-[#2E8CEB]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold tracking-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Home Indicator Bar */}
        <div className="w-full h-4 bg-[#0B1626] flex items-center justify-center shrink-0">
          <div className="w-32 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#080D1A] text-white font-sans pb-32 text-left select-none">
      {/* MASTER TOP CONTROL BAR */}
      <div className="sticky top-0 z-40 w-full bg-[#091326]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#2E8CEB] flex items-center justify-center font-black text-white text-sm shadow-md">
            TJ
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              TonJam — Unified Mobile Design System
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2E8CEB] bg-[#2E8CEB]/15 px-2 py-0.5 rounded-full">
                Production-Ready
              </span>
            </h1>
            <p className="text-xs text-[#91A8C5] hidden sm:block">
              Figma 390×960 Mobile Canvas · Settings · Notifications · Earn TJ · Shared Components
            </p>
          </div>
        </div>

        {/* VIEW SELECTOR TABS */}
        <div className="flex items-center gap-1 bg-[#111C30] p-1 rounded-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'canvas', label: 'All 3 Screens', icon: Smartphone },
            { id: 'settings', label: '1. Settings', icon: Settings },
            { id: 'notifications', label: '2. Notifications', icon: Bell },
            { id: 'earn', label: '3. Earn TJ', icon: Coins },
            { id: 'components', label: 'Shared Library', icon: Layers },
          ].map((v) => {
            const Icon = v.icon;
            const isActive = activeView === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveView(v.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2E8CEB] text-white shadow-sm'
                    : 'text-[#91A8C5] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>

        {/* CANVAS CONTROLS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMiniPlayer(!showMiniPlayer)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showMiniPlayer
                ? 'bg-[#9B7CFF]/15 text-[#9B7CFF]'
                : 'bg-white/[0.05] text-slate-400'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mini Player</span>
          </button>

          {activeView === 'canvas' && (
            <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl text-xs font-mono">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[11px] text-slate-300">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(100, z + 25))}
                className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center text-slate-300"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEWPORT BODY */}
      <div className="px-4 sm:px-8 pt-8">
        {/* VIEW 1: FIGMA CANVAS (SIDE-BY-SIDE 3 SCREENS) */}
        {activeView === 'canvas' && (
          <div className="w-full flex flex-col items-center gap-6 overflow-x-auto pb-12">
            <div className="w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Unified Mobile Experience Canvas
                </h2>
                <p className="text-xs text-[#91A8C5]">
                  Three production-ready mobile screens rendered in 390 × 960 px standard iOS/Android viewport geometry.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#91A8C5] bg-[#111C30] px-4 py-2 rounded-2xl">
                <span>Zero Border Lines</span>
                <span>·</span>
                <span>Inter Typography</span>
                <span>·</span>
                <span>Auto-Layout Ready</span>
              </div>
            </div>

            {/* Scale Container */}
            <div
              className="flex items-start justify-center gap-8 min-w-max transition-transform origin-top"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              {/* Screen 1: Settings */}
              <MobileDeviceFrame
                screenName="TonJam — Settings"
                screenBadge="Screen 01"
              >
                <MobileSettingsScreen onNavigate={(p) => toast.info(`Navigate to: ${p}`)} />
              </MobileDeviceFrame>

              {/* Screen 2: Notifications */}
              <MobileDeviceFrame
                screenName="TonJam — Notifications"
                screenBadge="Screen 02"
              >
                <MobileNotificationsScreen onNavigate={(p) => toast.info(`Navigate to: ${p}`)} />
              </MobileDeviceFrame>

              {/* Screen 3: Earn TJ */}
              <MobileDeviceFrame
                screenName="TonJam — Earn TJ"
                screenBadge="Screen 03"
              >
                <MobileEarnTJScreen onNavigate={(p) => toast.info(`Navigate to: ${p}`)} />
              </MobileDeviceFrame>
            </div>
          </div>
        )}

        {/* VIEW 2: FOCUSED SETTINGS */}
        {activeView === 'settings' && (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full max-w-md flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">TonJam — Settings Screen</h2>
                <p className="text-xs text-[#91A8C5]">All 7 settings sections A through G with real prototype controls</p>
              </div>
            </div>

            <MobileDeviceFrame
              screenName="TonJam — Settings"
              screenBadge="Focused Screen"
            >
              <MobileSettingsScreen onNavigate={(p) => toast.info(`Navigate to: ${p}`)} />
            </MobileDeviceFrame>
          </div>
        )}

        {/* VIEW 3: FOCUSED NOTIFICATIONS */}
        {activeView === 'notifications' && (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full max-w-md flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">TonJam — Notifications Screen</h2>
                <p className="text-xs text-[#91A8C5]">Filtered notification feeds, previews, quick actions & empty states</p>
              </div>
            </div>

            <MobileDeviceFrame
              screenName="TonJam — Notifications"
              screenBadge="Focused Screen"
            >
              <MobileNotificationsScreen onNavigate={(p) => toast.info(`Navigate to: ${p}`)} />
            </MobileDeviceFrame>
          </div>
        )}

        {/* VIEW 4: FOCUSED EARN TJ */}
        {activeView === 'earn' && (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full max-w-md flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">TonJam — Earn TJ Screen</h2>
                <p className="text-xs text-[#91A8C5]">Gamified rewards, progress tracking, task sheets & confetti claim flow</p>
              </div>
            </div>

            <MobileDeviceFrame
              screenName="TonJam — Earn TJ"
              screenBadge="Focused Screen"
            >
              <MobileEarnTJScreen onNavigate={(p) => toast.info(`Navigate to: ${p}`)} />
            </MobileDeviceFrame>
          </div>
        )}

        {/* VIEW 5: SHARED COMPONENT LIBRARY & DESIGN VARIABLES */}
        {activeView === 'components' && (
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Design System Overview */}
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Shared TonJam Component Library & Variables
              </h2>
              <p className="text-sm text-[#91A8C5] leading-relaxed max-w-3xl">
                Modular, reusable components built strictly following TonJam's dark-mode design system: deep navy backgrounds (#091326), elevated cards (#111C30), TON blue (#2E8CEB), Inter typography, and zero border lines.
              </p>
            </div>

            {/* Design Variables Palette */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#91A8C5]">
                Color System & Design Tokens
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  { name: 'Canvas Base', hex: '#091326', label: 'Primary BG' },
                  { name: 'Elevated Surface', hex: '#0B1626', label: 'Section BG' },
                  { name: 'Card Surface', hex: '#111C30', label: 'Component BG' },
                  { name: 'TON Blue Accent', hex: '#2E8CEB', label: 'Primary CTA' },
                  { name: 'Purple Accent', hex: '#9B7CFF', label: 'Music & Bids' },
                  { name: 'Teal Accent', hex: '#2DD4BF', label: 'Community' },
                  { name: 'Gold Accent', hex: '#FFC857', label: 'TJ Points' },
                  { name: 'Success Green', hex: '#34D399', label: 'Sales & Verified' },
                  { name: 'Pink Accent', hex: '#F472B6', label: 'Likes & Featured' },
                  { name: 'Primary Text', hex: '#F5F7FB', label: 'High Contrast' },
                  { name: 'Secondary Text', hex: '#91A8C5', label: 'Muted Blue-Gray' },
                  { name: 'Destructive Red', hex: '#F43F5E', label: 'Careful Actions' },
                ].map((c) => (
                  <div key={c.name} className="p-3.5 rounded-2xl bg-[#111C30] flex flex-col gap-2">
                    <div
                      className="w-full h-12 rounded-xl shadow-inner"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white truncate">{c.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{c.hex}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Component Showcase 1: Headers & Profile Cards */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#91A8C5]">
                1. Headers & Profile Components
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-3xl bg-[#0B1626] space-y-3">
                  <span className="text-xs font-bold text-[#91A8C5]">ProfileSummaryCard (Verified Artist)</span>
                  <ProfileSummaryCard
                    profile={{
                      name: 'Alex Rivers',
                      username: 'alexrivers',
                      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                      isVerified: true,
                      role: 'Artist',
                    }}
                    onEditProfile={() => toast.info('Edit profile clicked')}
                  />
                </div>

                <div className="p-4 rounded-3xl bg-[#0B1626] space-y-3">
                  <span className="text-xs font-bold text-[#91A8C5]">ProfileSummaryCard (Guest State)</span>
                  <ProfileSummaryCard
                    isGuest={true}
                    onSignIn={() => toast.info('Sign in clicked')}
                  />
                </div>
              </div>
            </div>

            {/* Component Showcase 2: Settings Rows */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#91A8C5]">
                2. Settings Row Variants
              </h3>
              <div className="rounded-3xl bg-[#0B1626] p-3 space-y-1 max-w-xl">
                <SettingsRow
                  icon={Settings}
                  title="Standard SettingsRow"
                  description="Opens details screen with right chevron"
                  onClick={() => toast.info('Clicked')}
                />
                <SettingsToggleRow
                  icon={Bell}
                  title="SettingsToggleRow (Active)"
                  description="Compact switch with TON blue active state"
                  checked={true}
                  onChange={(c) => toast.info(`Toggle: ${c}`)}
                />
                <SettingsSelectionRow
                  icon={Palette}
                  title="SettingsSelectionRow"
                  description="Displays current value badge"
                  currentValue="Lossless (FLAC)"
                  onClick={() => toast.info('Open selection')}
                />
              </div>
            </div>

            {/* Component Showcase 3: Notification Items */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#91A8C5]">
                3. Notification Item Variants
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <NotificationItem
                  notification={{
                    id: 'sample-1',
                    category: 'music',
                    subType: 'new_track',
                    title: 'New Track Drop',
                    description: 'released "TON Odyssey (VIP Club Mix)"',
                    senderName: 'CYBERPUNK TON',
                    senderHandle: 'cyberpunkton',
                    senderAvatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
                    isVerified: true,
                    timestamp: '5m ago',
                    read: false,
                    previewImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
                    previewTitle: 'TON Odyssey (VIP Club Mix)',
                    previewSubtitle: 'Single · Lossless Master Stems',
                    actionLabel: 'Listen Now',
                  }}
                  onItemClick={() => toast.info('Clicked')}
                />

                <NotificationItem
                  notification={{
                    id: 'sample-2',
                    category: 'nft',
                    subType: 'sale',
                    title: 'Music NFT Sold',
                    description: 'Sold for 42.0 TON ($231 USD)',
                    senderName: 'TonJam Marketplace',
                    senderHandle: 'tonjam_market',
                    senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
                    isVerified: true,
                    timestamp: '5h ago',
                    read: true,
                    previewImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
                    previewTitle: 'Midnight Waves #01 (1/1 Master)',
                    previewSubtitle: 'Royalties credited to wallet',
                  }}
                  onItemClick={() => toast.info('Clicked')}
                />
              </div>
            </div>

            {/* Component Showcase 4: Earn TJ Rewards & Tasks */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#91A8C5]">
                4. Earn TJ Rewards & Task Cards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TJRewardsCard
                  balance={2450}
                  completedTasksCount={3}
                  totalTasksCount={5}
                  dailyPointsEarned={150}
                />

                <FeaturedTaskCard
                  task={{
                    id: 'feat-sample',
                    title: 'Stream 3 Genesis Music NFTs',
                    description: 'Listen to 3 verified master edition tracks in the Genesis collection.',
                    category: 'Music',
                    reward: 250,
                    status: 'in_progress',
                    progress: { current: 2, total: 3 },
                    iconType: 'music',
                  }}
                  onTaskClick={() => toast.info('Featured task')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <TaskCard
                  task={{
                    id: 't-1',
                    title: 'Daily Check-In',
                    description: 'Connect to maintain your streak.',
                    category: 'Daily',
                    reward: 50,
                    status: 'claimable',
                    iconType: 'daily',
                  }}
                  onTaskClick={() => toast.info('Claimable')}
                />
                <TaskCard
                  task={{
                    id: 't-2',
                    title: 'Music Discovery',
                    description: 'Stream 5 indie tracks.',
                    category: 'Music',
                    reward: 120,
                    status: 'in_progress',
                    progress: { current: 3, total: 5 },
                    iconType: 'music',
                  }}
                  onTaskClick={() => toast.info('In progress')}
                />
                <TaskCard
                  task={{
                    id: 't-3',
                    title: 'Complete Profile',
                    description: 'Upload your avatar and bio.',
                    category: 'Profile',
                    reward: 100,
                    status: 'completed',
                    iconType: 'profile',
                  }}
                  onTaskClick={() => toast.info('Completed')}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedDesignSystem;
