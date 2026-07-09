import React from 'react';
import { motion } from 'motion/react';
import { 
  BellRing, 
  Flame, 
  Heart, 
  Gavel, 
  Gift, 
  Cpu, 
  ShieldCheck, 
  Trash2, 
  RotateCcw,
  Sparkles,
  Clock
} from 'lucide-react';
import { useTonJamNotifications } from './NotificationContext';
import { NotificationPreferences } from './types';

interface NotificationSettingsProps {
  onClose?: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const { 
    preferences, 
    updatePreferences, 
    requestPushPermission, 
    simulateNotification 
  } = useTonJamNotifications();

  const handleToggle = (key: keyof NotificationPreferences) => {
    updatePreferences({ [key]: !preferences[key] });
  };

  const handleRequestPush = async () => {
    const success = await requestPushPermission();
    if (success) {
      alert('Node Alert Sync Aligned! Native browser notifications authorized.');
    } else {
      alert('Alert synchronization denied or blocked by platform rules.');
    }
  };

  const settingsItems = [
    {
      key: 'directAlerts' as const,
      title: 'Direct Alerts',
      desc: 'Get instantly pinged about direct mentions, messages, and priority interactions.',
      icon: BellRing,
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      key: 'dropsAndReleases' as const,
      title: 'Drops & Releases',
      desc: 'Receive telemetry updates whenever artists you track release new frequencies.',
      icon: Flame,
      color: 'text-amber-400 bg-amber-500/10',
    },
    {
      key: 'socialSignals' as const,
      title: 'Social Resonance',
      desc: 'Notifications for signal likes, comments, retweets, and telemetry follows.',
      icon: Heart,
      color: 'text-rose-400 bg-rose-500/10',
    },
    {
      key: 'bidAlerts' as const,
      title: 'Auction & Bid Warnings',
      desc: 'Crucial outbid alerts and finishing timers for auctions you participate in.',
      icon: Gavel,
      color: 'text-orange-400 bg-orange-500/10',
    },
    {
      key: 'rewardsAndMissions' as const,
      title: 'Rewards & Daily Missions',
      desc: 'Stay informed about continuous claims, TJ rewards, and mission completions.',
      icon: Gift,
      color: 'text-red-400 bg-red-500/10',
    },
    {
      key: 'systemUpdates' as const,
      title: 'System Node Relay',
      desc: 'Important tech updates, relay node statuses, and smart contract upgrades.',
      icon: Cpu,
      color: 'text-slate-400 bg-slate-500/10',
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 p-1 text-left select-none">
      {/* PUSH TELEMETRY CONTROLS */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/10 shrink-0 text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Browser Push Telemetry</h3>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              Synchronize direct outbid and drop notifications straight to your desktop layout.
            </p>
          </div>
        </div>
        <button
          onClick={handleRequestPush}
          className="
            w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white 
            text-[10px] font-black uppercase tracking-widest cursor-pointer 
            transition-colors shadow-lg shadow-blue-500/10 border-none outline-none active:scale-[0.98]
          "
        >
          Enable System Telemetry
        </button>
      </div>

      {/* DETAILED CATEGORY TOGGLES */}
      <div className="flex flex-col gap-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
          Preferences Registry
        </h4>

        <div className="flex flex-col gap-2.5">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const isEnabled = preferences[item.key];

            return (
              <div 
                key={item.key}
                className="p-3.5 rounded-2xl bg-white/[0.02] flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black uppercase text-slate-200 tracking-wide">{item.title}</h5>
                    <p className="text-[10px] font-semibold text-slate-400 leading-snug mt-1 max-w-[220px]">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* SLIDER TOGGLE SWITCH */}
                <button
                  onClick={() => handleToggle(item.key)}
                  className={`
                    relative w-11 h-6 rounded-full transition-colors duration-300
                    cursor-pointer shrink-0 border-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                    ${isEnabled ? 'bg-blue-500' : 'bg-slate-800'}
                  `}
                >
                  <motion.div
                    animate={{ x: isEnabled ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 rounded-full bg-white shadow-md absolute left-0 top-0.5"
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* NOTIFICATION DIGEST SETTINGS */}
      <div className="p-4 rounded-2xl bg-white/[0.02] flex flex-col gap-3 text-left">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Low-Priority Digest</h3>
            <p className="text-[10px] font-semibold text-slate-400 mt-1 leading-normal">
              Instead of instant real-time alerts, compile low-priority signals (Likes, Comments, System Updates) into a single periodic telemetry summary.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-1">
          {(['none', 'daily', 'weekly'] as const).map((freq) => {
            const isActive = (preferences.digestFrequency || 'none') === freq;
            const labels = {
              none: 'Real-time',
              daily: 'Daily Pack',
              weekly: 'Weekly Pack',
            };
            const descs = {
              none: 'Immediate',
              daily: 'Every 24h',
              weekly: 'Weekly',
            };

            return (
              <button
                key={freq}
                onClick={() => updatePreferences({ digestFrequency: freq })}
                className={`
                  flex flex-col items-center justify-center py-2 px-1 rounded-xl
                  cursor-pointer transition-all duration-300 border-none outline-none
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-md ring-1 ring-blue-500/30' 
                    : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }
                `}
              >
                <span className="text-[10px] font-black uppercase tracking-wide">
                  {labels[freq]}
                </span>
                <span className="text-[8px] font-semibold text-slate-500 mt-0.5">
                  {descs[freq]}
                </span>
              </button>
            );
          })}
        </div>

        {preferences.digestFrequency !== 'none' && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[9px] font-black text-amber-400/90 mt-1 px-1 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span>Telemetry buffered. Next summary pack compiling in 14 hours.</span>
          </motion.div>
        )}
      </div>

      {/* DEV TOOLS SIMULATOR SECTION */}
      <div className="p-4 rounded-2xl bg-white/[0.02] flex flex-col gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Developer Simulator</span>
          </h3>
          <p className="text-[10px] font-semibold text-slate-400 mt-1">
            Simulate incoming platform signals to test the performance, badging, and sorting logic of your notification suite.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => simulateNotification('auction')}
            className="
              py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400
              text-[8px] font-black uppercase tracking-widest cursor-pointer border-none outline-none transition-colors
            "
          >
            Outbid Signal
          </button>
          <button
            onClick={() => simulateNotification('artist_release')}
            className="
              py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400
              text-[8px] font-black uppercase tracking-widest cursor-pointer border-none outline-none transition-colors
            "
          >
            Artist Drop
          </button>
          <button
            onClick={() => simulateNotification('tj_reward')}
            className="
              py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400
              text-[8px] font-black uppercase tracking-widest cursor-pointer border-none outline-none transition-colors
            "
          >
            Claimable Reward
          </button>
          <button
            onClick={() => simulateNotification()}
            className="
              py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400
              text-[8px] font-black uppercase tracking-widest cursor-pointer border-none outline-none transition-colors
            "
          >
            Random Telemetry
          </button>
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="
            w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300
            text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors border-none outline-none
          "
        >
          Close Settings
        </button>
      )}
    </div>
  );
};

export default NotificationSettings;
