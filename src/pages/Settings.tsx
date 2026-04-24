import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  UserCircle
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

// shadcn/ui components
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  // Notification states
  const [notifications, setNotifications] = useState(true);
  const [marketNotifications, setMarketNotifications] = useState(true);
  const [newReleases, setNewReleases] = useState(true);
  const [socialSignals, setSocialSignals] = useState(true);
  const [bidNotifications, setBidNotifications] = useState(true);
  const [saleNotifications, setSaleNotifications] = useState(true);

  const SettingRow = ({ icon: Icon, title, description, children, onClick }: any) => (
    <div 
      className={cn(
        "flex items-center justify-between p-4 bg-muted/30 rounded-2xl transition-all duration-200",
        onClick && "cursor-pointer hover:bg-muted/50 active:scale-[0.98]"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-foreground uppercase tracking-tight">{title}</h4>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none">{description}</p>
        </div>
      </div>
      <div onClick={(e) => onClick && e.stopPropagation()} className="flex items-center">
        {children || <ChevronRight className="h-4 w-4 text-muted-foreground/30" />}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-4 space-y-8">
      {/* Header section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">Settings</h1>
        <p className="text-[11px] font-bold text-blue-500 uppercase tracking-[0.4em]">Configuration Protocol 8.2</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-muted/30 p-1 rounded-2xl mb-6 flex overflow-x-auto no-scrollbar border-none h-auto">
          <TabsTrigger value="general" className="flex-1 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all border-none">
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all border-none">
            Signals
          </TabsTrigger>
          <TabsTrigger value="interface" className="flex-1 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all border-none">
            Interface
          </TabsTrigger>
        </TabsList>

        {/* --- General Tab --- */}
        <TabsContent value="general" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] px-1">Identity Protocols</h3>
            
            {/* Prominent Edit Profile Button */}
            <div className="px-1 pb-2">
              <Button 
                onClick={() => navigate('/profile-settings')}
                className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-none shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500"
              >
                <UserCircle className="h-5 w-5" />
                Edit Profile Identity
              </Button>
            </div>

            <div className="space-y-3">
              <SettingRow 
                icon={UserCircle} 
                title="Profile Details" 
                description="Update bio, links and avatar"
                onClick={() => navigate('/profile-settings')}
              />
              <SettingRow 
                icon={Wallet} 
                title="Wallet Bridge" 
                description={user?.uid ? "ACTIVE: TON MAINNET" : "INACTIVE: LINK REQUIRED"}
                onClick={() => navigate('/wallet')}
              >
                <div className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                  user?.uid ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                )}>
                  {user?.uid ? "Connected" : "Disconnected"}
                </div>
              </SettingRow>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] px-1">Security Grid</h3>
            <div className="space-y-3">
              <SettingRow 
                icon={ShieldCheck} 
                title="Two-Factor Auth" 
                description="Secure your vault access"
              >
                <Button variant="ghost" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 hover:text-blue-600 border-none">
                  Enable
                </Button>
              </SettingRow>
              <SettingRow 
                icon={Shield} 
                title="Privacy Mode" 
                description="Toggle public visibility"
              >
                <Switch defaultChecked />
              </SettingRow>
            </div>
          </div>
        </TabsContent>

        {/* --- Notifications Tab --- */}
        <TabsContent value="notifications" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] px-1">Signal Filters</h3>
            <div className="space-y-3">
              <SettingRow 
                icon={Bell} 
                title="Direct Alerts" 
                description="All transactional signal activity"
              >
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </SettingRow>
              <SettingRow 
                icon={Bell} 
                title="Market Activity" 
                description="Global market volume & trends"
              >
                <Switch checked={marketNotifications} onCheckedChange={setMarketNotifications} />
              </SettingRow>
              <SettingRow 
                icon={Bell} 
                title="Drops & Releases" 
                description="New artistic uploads & auctions"
              >
                <Switch checked={newReleases} onCheckedChange={setNewReleases} />
              </SettingRow>
              <SettingRow 
                icon={Bell} 
                title="Social Node" 
                description="Follows, likes and mentions"
              >
                <Switch checked={socialSignals} onCheckedChange={setSocialSignals} />
              </SettingRow>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] px-1">Auction Signals</h3>
            <div className="space-y-3">
              <SettingRow 
                icon={Bell} 
                title="Bid Alerts" 
                description="When you have been outbid"
              >
                <Switch checked={bidNotifications} onCheckedChange={setBidNotifications} />
              </SettingRow>
              <SettingRow 
                icon={Bell} 
                title="Sale Events" 
                description="Successful asset transfers"
              >
                <Switch checked={saleNotifications} onCheckedChange={setSaleNotifications} />
              </SettingRow>
            </div>
          </div>
        </TabsContent>

        {/* --- Interface Tab --- */}
        <TabsContent value="interface" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] px-1">Environment</h3>
            <div className="space-y-3">
              <SettingRow 
                icon={theme === 'dark' ? Moon : Sun} 
                title="Visual Interface" 
                description="Select theme calibration"
              >
                <Select value={theme} onValueChange={(val: any) => setTheme(val)}>
                  <SelectTrigger className="w-[120px] h-9 bg-muted/50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-0">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-none rounded-2xl shadow-2xl">
                    <SelectItem value="light" className="text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-xl m-1">Light</SelectItem>
                    <SelectItem value="dark" className="text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-xl m-1">Dark</SelectItem>
                    <SelectItem value="system" className="text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-xl m-1">System</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow 
                icon={Globe} 
                title="Regional Node" 
                description="Optimize latency per area"
              >
                <Select defaultValue="eu-west">
                  <SelectTrigger className="w-[120px] h-9 bg-muted/50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-0 text-left">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-none rounded-2xl shadow-2xl">
                    <SelectItem value="eu-west" className="text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-xl m-1">Europe-West</SelectItem>
                    <SelectItem value="us-east" className="text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-xl m-1">US-East</SelectItem>
                    <SelectItem value="asia" className="text-[10px] font-black uppercase tracking-widest cursor-pointer focus:bg-blue-600 focus:text-white rounded-xl m-1">Asia-Pacific</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Logout section */}
      <div className="pt-8 w-full">
        <Button 
          variant="destructive" 
          onClick={() => signOut()}
          className="w-full h-14 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-none shadow-none group"
        >
          <LogOut className="h-4 w-4 mr-3 transition-transform group-hover:-translate-x-1" />
          Terminate Session
        </Button>
      </div>
    </div>
  );
};

export default Settings;
