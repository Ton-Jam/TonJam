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
  WifiOff
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
import { Separator } from '@/components/ui/separator';
import { motion } from 'motion/react';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const { isOffline, toggleOfflineMode } = useAudio();
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
        "flex items-center justify-between py-3 px-1 transition-all duration-200",
        onClick && "cursor-pointer group hover:opacity-70"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/5 flex items-center justify-center text-blue-500/80 group-hover:bg-blue-500/10 transition-colors">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-foreground uppercase tracking-tight">{title}</span>
          <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest leading-none mt-0.5">{description}</span>
        </div>
      </div>
      <div onClick={(e) => onClick && e.stopPropagation()} className="flex items-center">
        {children || <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover:translate-x-0.5 transition-transform" />}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-4 animate-in fade-in duration-700">
      <div className="mb-6 text-center lg:text-left flex items-center justify-between opacity-40">
        <div className="flex items-center gap-2">
           <ShieldCheck className="h-3 w-3 text-blue-500" />
           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Neural Interface Parameters</span>
        </div>
        <span className="text-[8px] font-mono">v2.4.0-STABLE</span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent p-0 mb-8 flex border-none h-auto gap-3">
          <TabsTrigger value="general" className="flex-1 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white border-2 border-blue-500/30 data-[state=active]:border-blue-400/50 data-[state=inactive]:bg-white/5 transition-all">
            Identity
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex-1 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white border-2 border-blue-500/30 data-[state=active]:border-blue-400/50 data-[state=inactive]:bg-white/5 transition-all">
            Verification
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white border-2 border-blue-500/30 data-[state=active]:border-blue-400/50 data-[state=inactive]:bg-white/5 transition-all">
            Signals
          </TabsTrigger>
          <TabsTrigger value="interface" className="flex-1 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white border-2 border-blue-500/30 data-[state=active]:border-blue-400/50 data-[state=inactive]:bg-white/5 transition-all">
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="bg-muted/10 border-white/5 rounded-[32px] overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Identity Core</CardTitle>
              <CardDescription className="text-[9px] font-bold uppercase tracking-widest opacity-40">Manage your network presence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
                <SettingRow 
                    icon={UserCircle} 
                    title="Profile Sync" 
                    description="Edit bio, links and visuals"
                    onClick={() => navigate('/profile-settings')}
                />
                <Separator className="bg-white/5" />
                <SettingRow 
                    icon={Wallet} 
                    title="Vault Bridge" 
                    description={user?.uid ? "TON MAINNET ACTIVE" : "NODE DISCONNECTED"}
                    onClick={() => navigate('/wallet')}
                >
                    <div className={cn(
                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border",
                    user?.uid ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : "bg-red-500/5 text-red-500 border-red-500/20"
                    )}>
                    {user?.uid ? "Online" : "Offline"}
                    </div>
                </SettingRow>
            </CardContent>
          </Card>

          <Card className="bg-muted/10 border-white/5 rounded-[32px] overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Security Matrix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <SettingRow 
                icon={Key} 
                title="Secondary Auth" 
                description="Secure vault verification"
              >
                <Button variant="ghost" size="sm" className="h-7 px-3 rounded-full text-[8px] font-black uppercase tracking-widest bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Setup
                </Button>
              </SettingRow>
              <Separator className="bg-white/5" />
              <SettingRow 
                icon={Eye} 
                title="Ghost Protocol" 
                description="Public node visibility"
              >
                <Switch defaultChecked className="scale-75 data-[state=checked]:bg-blue-600" />
              </SettingRow>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card className="bg-muted/10 border-white/5 rounded-[32px] overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Artist verification</CardTitle>
              <CardDescription className="text-[9px] font-bold uppercase tracking-widest opacity-40">Establish your sonic identity on-chain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-blue-600/5 border border-blue-500/10 rounded-[24px]">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">Become Verified Artist</h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1 opacity-50">Identity protocols and blue badge</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsVerifyModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-[9px] uppercase tracking-widest px-6 h-10 group"
                >
                  <Plus className="w-3 h-3 mr-2 group-hover:rotate-90 transition-transform" />
                  New Request
                </Button>
              </div>

              <VerificationTracker />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-muted/10 border-white/5 rounded-[32px] overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Signal Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <SettingRow 
                icon={Bell} 
                title="Direct Comms" 
                description="Transactional alert relay"
              >
                <Switch checked={preferences.directAlerts} onCheckedChange={(val) => handlePreferenceToggle('directAlerts', val)} className="scale-75 data-[state=checked]:bg-blue-600" />
              </SettingRow>
              <Separator className="bg-white/5" />
              <SettingRow 
                icon={Bell} 
                title="Market Feed" 
                description="Global asset fluctuations"
              >
                <Switch checked={preferences.marketActivity} onCheckedChange={(val) => handlePreferenceToggle('marketActivity', val)} className="scale-75 data-[state=checked]:bg-blue-600" />
              </SettingRow>
              <Separator className="bg-white/5" />
              <SettingRow 
                icon={Bell} 
                title="New Drops" 
                description="Protocol mint notifications"
              >
                <Switch checked={preferences.dropsAndReleases} onCheckedChange={(val) => handlePreferenceToggle('dropsAndReleases', val)} className="scale-75 data-[state=checked]:bg-blue-600" />
              </SettingRow>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between py-3 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/5 flex items-center justify-center text-blue-500/80">
                        <Wallet className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black text-foreground uppercase tracking-tight">Revenue Alert Threshold (TON)</span>
                        <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest leading-none mt-0.5">Alert when monthly revenue exceeds</span>
                    </div>
                </div>
                <input 
                  type="number" 
                  value={preferences.revenueThreshold || 100}
                  onChange={(e) => updatePreferences({...preferences, revenueThreshold: Number(e.target.value)})}
                  className="w-20 bg-background rounded-full border border-border p-2 text-center text-[10px] font-black"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface" className="space-y-6">
          <Card className="bg-muted/10 border-white/5 rounded-[32px] overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Environment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                <SettingRow 
                    icon={theme === 'dark' ? Moon : Sun} 
                    title="Visual Deck" 
                    description="Interface spectral theme"
                >
                    <Select value={theme} onValueChange={(val: any) => setTheme(val)}>
                    <SelectTrigger className="w-[100px] h-7 bg-muted/20 border border-white/5 rounded-full text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-blue-500/50">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-white/5 rounded-2xl shadow-2xl">
                        <SelectItem value="light" className="text-[9px] font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-lg m-1">Light</SelectItem>
                        <SelectItem value="dark" className="text-[9px] font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-lg m-1">Dark</SelectItem>
                        <SelectItem value="system" className="text-[9px] font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-lg m-1">Auto</SelectItem>
                    </SelectContent>
                    </Select>
                </SettingRow>
                <Separator className="bg-white/5" />
                <SettingRow 
                    icon={WifiOff} 
                    title="Offline Listening" 
                    description="Enable local playback"
                >
                  <Switch checked={isOffline} onCheckedChange={toggleOfflineMode} className="scale-75 data-[state=checked]:bg-blue-600" />
                </SettingRow>                
                <Separator className="bg-white/5" />
                <SettingRow 
                    icon={Globe} 
                    title="Relay Region" 
                    description="Optimize data latency"
                >
                    <Select defaultValue="eu-west">
                    <SelectTrigger className="w-[100px] h-7 bg-muted/20 border border-white/5 rounded-full text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-blue-500/50">
                        <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-white/5 rounded-2xl shadow-2xl">
                        <SelectItem value="eu-west" className="text-[9px] font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-lg m-1">EUROPE</SelectItem>
                        <SelectItem value="us-east" className="text-[9px] font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-lg m-1">US-EAST</SelectItem>
                        <SelectItem value="asia" className="text-[9px] font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-lg m-1">ASIA</SelectItem>
                    </SelectContent>
                    </Select>
                </SettingRow>
            </CardContent>
          </Card>
          <Card className="bg-muted/10 border-white/5 rounded-[32px] overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Storage Matrix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <SettingRow 
                icon={Database} 
                title="Cache Volume" 
                description={`${cachedCount} tracks cached`}
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-4">
                  {totalSizeMB} MB
                </div>
              </SettingRow>
              <Separator className="bg-white/5" />
              <div className="p-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsStorageModalOpen(true)}
                  className="w-full h-8 text-[9px] font-black uppercase tracking-widest bg-blue-500/5 text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 rounded-full border border-blue-500/10 mb-2"
                >
                  Manage Individual Tracks
                </Button>
                <Button
                  variant="ghost"
                  onClick={clearAllCache}
                  disabled={isPurging || cachedCount === 0}
                  className="w-full h-8 text-[9px] font-black uppercase tracking-widest bg-red-500/5 text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-full border border-red-500/10"
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
          className="w-full max-w-xs h-12 bg-red-500/5 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-red-500/10 group"
        >
          <LogOut className="h-4 w-4 mr-3 transition-transform group-hover:-translate-x-1" />
          Terminate session
        </Button>
        <p className="mt-6 text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.5em]">System Build v2.4.0-Stable</p>
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
