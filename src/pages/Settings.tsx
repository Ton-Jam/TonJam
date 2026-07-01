import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Bell, 
  Shield, 
  User, 
  Wallet, 
  Moon, 
  Sun, 
  Globe, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  UserCircle,
  Eye,
  Key,
  ShieldAlert,
  Database,
  Trash2,
  Plus,
  WifiOff,
  Palette
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useAudio } from '@/context/AudioContext';
import { useNotification } from '@/context/NotificationContext';
import { useTheme } from '@/components/theme-provider';
import { useCacheManagement } from '@/hooks/useCacheManagement';
import StorageManagementModal from '@/components/StorageManagementModal';
import { cn } from '@/lib/utils';
import { NotificationPreferences } from '@/types';
import VerificationTracker from '@/components/VerificationTracker';
import VerifyArtistModal from '@/components/VerifyArtistModal';

// shadcn/ui components
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const { isOffline, toggleOfflineMode, artworkStyle, setArtworkStyle } = useAudio();
  const { theme, setTheme } = useTheme();
  const { totalSizeMB, cachedCount, clearAllCache, isPurging } = useCacheManagement();
  
  const { preferences, updatePreferences } = useNotification();
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'general');

  useEffect(() => {
    const tab = searchParams.get('tab');
    const modal = searchParams.get('modal');
    if (tab) {
      setActiveTab(tab);
    }
    if (modal === 'verify') {
      setIsVerifyModalOpen(true);
    }
  }, [searchParams]);

  const handlePreferenceToggle = (key: keyof NotificationPreferences, value: boolean) => {
    updatePreferences({ ...preferences, [key]: value });
  };

  const SettingRow = ({ icon: Icon, title, description, children, onClick }: any) => (
    <div 
      className={cn(
        "flex items-center justify-between py-3.5 px-4 transition-all duration-200 rounded-2xl border-none",
        onClick && "cursor-pointer group hover:bg-white/[0.05]"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500/20 transition-colors shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-black text-foreground uppercase tracking-wider">{title}</span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-0.5">{description}</span>
        </div>
      </div>
      <div onClick={(e) => onClick && e.stopPropagation()} className="flex items-center gap-3 ml-2 shrink-0">
        {children || <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 pt-6 animate-in fade-in duration-700">
      <div className="mb-8 text-center sm:text-left flex items-center justify-between opacity-70">
        <div className="flex items-center gap-2.5">
           <ShieldCheck className="h-4 w-4 text-blue-500" />
           <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">System Parameters</span>
        </div>
        <span className="text-xs font-mono text-muted-foreground font-bold">v2.4.0</span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent p-0 mb-8 flex border-none h-auto gap-2">
          {['general', 'verification', 'notifications', 'interface'].map((tab) => (
            <TabsTrigger 
              key={tab}
              value={tab} 
              className="flex-1 rounded-2xl px-3 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-white/5 transition-all shadow-none border-none"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="bg-white/5 rounded-3xl overflow-hidden shadow-none border-none">
            <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between border-none">
              <CardTitle className="text-xs font-black text-blue-500 uppercase tracking-widest">Identity Core</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2">
                <SettingRow 
                    icon={UserCircle} 
                    title="Profile Sync" 
                    description="Edit bio, links and visuals"
                    onClick={() => navigate('/profile-settings')}
                />
                <SettingRow 
                    icon={Wallet} 
                    title="Vault Bridge" 
                    description={user?.uid ? "TON MAINNET ACTIVE" : "NODE DISCONNECTED"}
                    onClick={() => navigate('/wallet')}
                >
                    <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border-none",
                    user?.uid ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    )}>
                    {user?.uid ? "Online" : "Offline"}
                    </div>
                </SettingRow>
            </CardContent>
          </Card>

          <Card className="bg-white/5 rounded-3xl overflow-hidden shadow-none border-none">
            <CardHeader className="p-6 pb-2 border-none">
              <CardTitle className="text-xs font-black text-blue-500 uppercase tracking-widest">Security Matrix</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2">
              <SettingRow 
                icon={Key} 
                title="Secondary Auth" 
                description="Secure vault verification"
              >
                <Button variant="ghost" size="sm" className="h-8 px-4 rounded-full text-xs font-black uppercase tracking-widest bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-none shadow-none">
                  Setup
                </Button>
              </SettingRow>
              <SettingRow 
                icon={Eye} 
                title="Ghost Protocol" 
                description="Public node visibility"
              >
                <Switch defaultChecked className="data-[state=checked]:bg-blue-600" />
              </SettingRow>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card className="bg-white/5 rounded-3xl overflow-hidden shadow-none border-none">
            <CardHeader className="p-6 pb-4 border-none">
              <CardTitle className="text-xs font-black text-blue-500 uppercase tracking-widest">Artist Verification</CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground mt-1">Establish your sonic identity on-chain</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-blue-600/10 rounded-2xl border-none">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Become Verified Artist</h4>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">Identity protocols and blue badge</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsVerifyModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-xs uppercase tracking-widest px-6 h-11 group shrink-0 border-none shadow-none"
                >
                  <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                  New Request
                </Button>
              </div>

              <VerificationTracker />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-white/5 rounded-3xl overflow-hidden shadow-none border-none">
            <CardHeader className="p-6 pb-2 border-none">
              <CardTitle className="text-xs font-black text-blue-500 uppercase tracking-widest">Signal Filters</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2">
              <SettingRow 
                icon={Bell} 
                title="Direct Comms" 
                description="Transactional alert relay"
              >
                <Switch checked={preferences.directAlerts} onCheckedChange={(val) => handlePreferenceToggle('directAlerts', val)} className="data-[state=checked]:bg-blue-600" />
              </SettingRow>
              <SettingRow 
                icon={Bell} 
                title="Market Feed" 
                description="Global asset fluctuations"
              >
                <Switch checked={preferences.marketActivity} onCheckedChange={(val) => handlePreferenceToggle('marketActivity', val)} className="data-[state=checked]:bg-blue-600" />
              </SettingRow>
              <SettingRow 
                icon={Bell} 
                title="New Drops" 
                description="Protocol mint notifications"
              >
                <Switch checked={preferences.dropsAndReleases} onCheckedChange={(val) => handlePreferenceToggle('dropsAndReleases', val)} className="data-[state=checked]:bg-blue-600" />
              </SettingRow>
              <div className="flex items-center justify-between py-3.5 px-4 rounded-2xl hover:bg-white/[0.05] transition-all border-none">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                        <Wallet className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-black text-foreground uppercase tracking-wider">Revenue Alert Threshold (TON)</span>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-0.5">Alert when monthly revenue exceeds</span>
                    </div>
                </div>
                <input 
                  type="number" 
                  value={preferences.revenueThreshold || 100}
                  onChange={(e) => updatePreferences({...preferences, revenueThreshold: Number(e.target.value)})}
                  className="w-24 bg-black/40 rounded-full border-none p-2.5 text-center text-xs font-black text-white outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface" className="space-y-6">
          <Card className="bg-white/5 rounded-3xl overflow-hidden shadow-none border-none">
            <CardHeader className="p-6 pb-2 border-none">
              <CardTitle className="text-xs font-black text-blue-500 uppercase tracking-widest">Environment Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2">
                <SettingRow 
                    icon={theme === 'dark' ? Moon : Sun} 
                    title="Visual Deck" 
                    description="Interface spectral theme"
                >
                    <Select value={theme} onValueChange={(val: any) => setTheme(val)}>
                    <SelectTrigger className="w-[120px] h-9 bg-black/30 border-none rounded-full text-xs font-black uppercase tracking-widest px-3.5 outline-none focus:ring-1 focus:ring-blue-500 shadow-none">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-none rounded-2xl shadow-2xl">
                        <SelectItem value="light" className="text-xs font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-xl py-2.5 px-3 m-1 border-none">Light</SelectItem>
                        <SelectItem value="dark" className="text-xs font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-xl py-2.5 px-3 m-1 border-none">Dark</SelectItem>
                        <SelectItem value="system" className="text-xs font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-xl py-2.5 px-3 m-1 border-none">Auto</SelectItem>
                    </SelectContent>
                    </Select>
                </SettingRow>
                <SettingRow 
                    icon={Palette} 
                    title="Artwork Style" 
                    description="Spotify, Vinyl, or Visualizer"
                >
                    <Select value={artworkStyle} onValueChange={(val: any) => setArtworkStyle(val)}>
                      <SelectTrigger className="w-[130px] h-9 bg-black/30 border-none rounded-full text-xs font-black uppercase tracking-widest px-3.5 outline-none focus:ring-1 focus:ring-blue-500 shadow-none">
                          <SelectValue placeholder="Style" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-none rounded-2xl shadow-2xl">
                          <SelectItem value="spotify" className="text-xs font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-xl py-2.5 px-3 m-1 border-none">Spotify</SelectItem>
                          <SelectItem value="vinyl" className="text-xs font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-xl py-2.5 px-3 m-1 border-none">Vinyl</SelectItem>
                          <SelectItem value="visualizer" className="text-xs font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-xl py-2.5 px-3 m-1 border-none">Visualizer</SelectItem>
                      </SelectContent>
                    </Select>
                </SettingRow>
                <SettingRow 
                    icon={WifiOff} 
                    title="Offline Listening" 
                    description="Enable local playback"
                >
                  <Switch checked={isOffline} onCheckedChange={toggleOfflineMode} className="data-[state=checked]:bg-blue-600" />
                </SettingRow>                
                <SettingRow 
                    icon={Globe} 
                    title="Relay Region" 
                    description="Optimize data latency"
                >
                    <Select defaultValue="eu-west">
                    <SelectTrigger className="w-[120px] h-9 bg-black/30 border-none rounded-full text-xs font-black uppercase tracking-widest px-3.5 outline-none focus:ring-1 focus:ring-blue-500 shadow-none">
                        <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-none rounded-2xl shadow-2xl">
                        <SelectItem value="eu-west" className="text-xs font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-xl py-2.5 px-3 m-1 border-none">EUROPE</SelectItem>
                        <SelectItem value="us-east" className="text-xs font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-xl py-2.5 px-3 m-1 border-none">US-EAST</SelectItem>
                        <SelectItem value="asia" className="text-xs font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-xl py-2.5 px-3 m-1 border-none">ASIA</SelectItem>
                    </SelectContent>
                    </Select>
                </SettingRow>
            </CardContent>
          </Card>

          <Card className="bg-white/5 rounded-3xl overflow-hidden shadow-none border-none">
            <CardHeader className="p-6 pb-2 border-none">
              <CardTitle className="text-xs font-black text-blue-500 uppercase tracking-widest">Storage Matrix</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2">
              <SettingRow 
                icon={Database} 
                title="Cache Volume" 
                description={`${cachedCount} tracks cached`}
              >
                <div className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground mr-2">
                  {totalSizeMB} MB
                </div>
              </SettingRow>
              <div className="p-2 pt-4 space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsStorageModalOpen(true)}
                  className="w-full h-11 text-xs font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-full border-none shadow-none"
                >
                  Manage Individual Tracks
                </Button>
                <Button
                  variant="ghost"
                  onClick={clearAllCache}
                  disabled={isPurging || cachedCount === 0}
                  className="w-full h-11 text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-full border-none shadow-none disabled:opacity-50"
                >
                  {isPurging ? 'Purging...' : 'Purge All Cache'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isStorageModalOpen && (
        <StorageManagementModal 
            isOpen={isStorageModalOpen} 
            onClose={() => setIsStorageModalOpen(false)} 
        />
      )}

      <div className="pt-12 text-center">
        <Button 
          variant="ghost" 
          onClick={() => signOut()}
          className="w-full max-w-xs h-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-full text-xs font-black uppercase tracking-widest transition-all border-none shadow-none group"
        >
          <LogOut className="h-4 w-4 mr-3 transition-transform group-hover:-translate-x-1" />
          Terminate session
        </Button>
        <p className="mt-6 text-xs font-bold text-muted-foreground/30 uppercase tracking-widest">System Build v2.4.0-Stable</p>
      </div>

      {isVerifyModalOpen && (
        <VerifyArtistModal 
            onClose={() => setIsVerifyModalOpen(false)} 
            artistName={userProfile?.name || 'New Artist'} 
        />
      )}
    </div>
  );
};

export default Settings;
