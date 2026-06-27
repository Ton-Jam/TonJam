import React from 'react';
import { ArrowLeft, User, Volume2, Shield, Bell, Moon, HelpCircle, LogOut } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { SettingsItem } from './SettingsItem';

export const SettingsScreen = () => {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4 md:p-8">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-[var(--surface)]"><ArrowLeft size={20}/></button>
            <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          <SettingsSection title="Account">
            <SettingsItem icon={User} title="Edit Profile" description="Update your name, bio, and avatar" />
            <SettingsItem icon={Shield} title="Wallet & Security" description="Manage connected wallets and sessions" />
          </SettingsSection>

          <SettingsSection title="Playback & Audio">
            <SettingsItem icon={Volume2} title="Streaming Quality" description="High Fidelity / Lossless" />
            <SettingsItem icon={Volume2} title="Autoplay" type="toggle" value={true} />
          </SettingsSection>

          <SettingsSection title="Preferences">
            <SettingsItem icon={Moon} title="Dark Mode" type="toggle" value={true} />
            <SettingsItem icon={Bell} title="Notifications" />
          </SettingsSection>

          <SettingsSection title="Support">
            <SettingsItem icon={HelpCircle} title="Help Center" />
            <SettingsItem icon={LogOut} title="Log Out" />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
};
