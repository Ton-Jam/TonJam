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
  Clock,
  Sparkles,
  Check
} from 'lucide-react';
import { useTonJamNotifications } from './NotificationContext';
import { NotificationPreferences } from './types';
import { toast } from 'sonner';

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
      toast.success('Push Notifications Enabled', {
        description: 'Browser notifications authorized for TonJam alerts.',
      });
    } else {
      toast.info('Push Notifications', {
        description: 'Notifications not enabled or blocked by platform permissions.',
      });
    }
  };

  const settingsItems = [
    {
      key: 'directAlerts' as const,
      title: 'Direct Alerts',
      desc: 'Get instantly notified about direct mentions, replies, and priority interactions.',
      icon: BellRing,
      color: 'text-[#229ED9] bg-[#229ED9]/15',
    },
    {
      key: 'dropsAndReleases' as const,
      title: 'Drops & Releases',
      desc: 'Receive updates whenever artists you follow release new music or albums.',
      icon: Flame,
      color: 'text-[#9B7CFF] bg-[#9B7CFF]/15',
    },
    {
      key: 'socialSignals' as const,
      title: 'Social Activity',
      desc: 'Notifications for likes, comments, reposts, and new followers.',
      icon: Heart,
      color: 'text-[#F472B6] bg-[#F472B6]/15',
    },
    {
      key: 'bidAlerts' as const,
      title: 'Auction & Bid Warnings',
      desc: 'Crucial outbid alerts and finishing timers for auctions you participate in.',
      icon: Gavel,
      color: 'text-[#FFC857] bg-[#FFC857]/15',
    },
    {
      key: 'rewardsAndMissions' as const,
      title: 'Rewards & Royalties',
      desc: 'Stay informed about secondary market royalties, TJ rewards, and claims.',
      icon: Gift,
      color: 'text-[#34D399] bg-[#34D399]/15',
    },
    {
      key: 'systemUpdates' as const,
      title: 'System & Security',
      desc: 'Verification updates, TON smart contract security, and network notices.',
      icon: Cpu,
      color: 'text-[#2DD4BF] bg-[#2DD4BF]/15',
    },
  ];

  return (
    <div className="w-full flex flex-col gap-5 p-1 text-left select-none animate-in fade-in duration-200">
      {/* PUSH NOTIFICATIONS BANNER */}
      <div className="p-4 rounded-2xl bg-[#111C30] border border-white/[0.04] flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#229ED9]/15 shrink-0 text-[#229ED9]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#F5F7FB]">Browser Push Notifications</h3>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              Receive live outbid alerts and music drops even when the app is in the background.
            </p>
          </div>
        </div>
        <button
          onClick={handleRequestPush}
          className="w-full py-2.5 rounded-full bg-[#229ED9] hover:bg-[#1e8bc2] text-white text-xs font-bold transition-all shadow-md shadow-[#229ED9]/20 cursor-pointer active:scale-95"
        >
          Enable Browser Push
        </button>
      </div>

      {/* DETAILED CATEGORY TOGGLES */}
      <div className="flex flex-col gap-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] px-1">
          Notification Preferences
        </h4>

        <div className="flex flex-col gap-2">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const isEnabled = preferences[item.key];

            return (
              <div 
                key={item.key}
                className="p-3 rounded-2xl bg-[#111C30] border border-white/[0.04] flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-[#F5F7FB]">{item.title}</h5>
                    <p className="text-[11px] text-[#94A3B8] leading-snug mt-0.5 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* SLIDER TOGGLE SWITCH */}
                <button
                  onClick={() => handleToggle(item.key)}
                  className={`
                    relative w-11 h-6 rounded-full transition-colors duration-200
                    cursor-pointer shrink-0 outline-none
                    ${isEnabled ? 'bg-[#229ED9]' : 'bg-[#080D1A] border border-white/[0.08]'}
                  `}
                  aria-checked={isEnabled}
                  role="switch"
                >
                  <motion.div
                    animate={{ x: isEnabled ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 rounded-full bg-white shadow-md absolute left-0 top-0.5 flex items-center justify-center"
                  >
                    {isEnabled && <Check className="w-3 h-3 text-[#229ED9]" />}
                  </motion.div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* DEV TOOLS SIMULATOR SECTION */}
      <div className="p-4 rounded-2xl bg-[#111C30] border border-white/[0.04] flex flex-col gap-3">
        <div>
          <h3 className="text-xs font-bold text-[#F5F7FB] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#9B7CFF]" />
            <span>Activity Simulation</span>
          </h3>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Simulate incoming platform signals to test notification cards and real-time alerts.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              simulateNotification('auction');
              toast.info('Simulated Outbid Alert');
            }}
            className="py-2 px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#FFC857] text-[11px] font-semibold cursor-pointer border border-white/[0.04] transition-colors"
          >
            Outbid Alert
          </button>
          <button
            onClick={() => {
              simulateNotification('artist_release');
              toast.success('Simulated Track Drop');
            }}
            className="py-2 px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#9B7CFF] text-[11px] font-semibold cursor-pointer border border-white/[0.04] transition-colors"
          >
            New Track Drop
          </button>
          <button
            onClick={() => {
              simulateNotification('tj_reward');
              toast.success('Simulated Reward');
            }}
            className="py-2 px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#34D399] text-[11px] font-semibold cursor-pointer border border-white/[0.04] transition-colors"
          >
            Royalty Deposit
          </button>
          <button
            onClick={() => {
              simulateNotification();
              toast.info('Simulated Signal');
            }}
            className="py-2 px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#229ED9] text-[11px] font-semibold cursor-pointer border border-white/[0.04] transition-colors"
          >
            Random Alert
          </button>
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-full bg-[#111C30] hover:bg-[#16243E] text-[#F5F7FB] text-xs font-semibold cursor-pointer transition-colors border border-white/[0.06]"
        >
          Back to Notifications
        </button>
      )}
    </div>
  );
};

export default NotificationSettings;
