import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Coins, TrendingDown, Mail, Smartphone, Globe } from "lucide-react";
import { NFTItem, PriceAlert } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useAudio } from "@/contexts/AudioContext";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: NFTItem;
}

const PriceAlertModal: React.FC<PriceAlertModalProps> = ({ isOpen, onClose, nft }) => {
  const { user } = useAuth();
  const { addNotification } = useAudio();
  const [targetPrice, setTargetPrice] = useState(nft.price || "0");
  const [condition, setCondition] = useState<'below' | 'above'>('below');
  const [channels, setChannels] = useState<('app' | 'push' | 'email')[]>(['app']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleChannel = (channel: 'app' | 'push' | 'email') => {
    setChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel) 
        : [...prev, channel]
    );
  };

  const handleSaveAlert = async () => {
    if (!user) {
      addNotification("Connect wallet to set alerts.", "warning");
      return;
    }

    setIsSubmitting(true);
    const alertId = `alert_${Date.now()}`;
    const alertData: PriceAlert = {
      id: alertId,
      userId: user.uid,
      nftId: nft.id,
      nftTitle: nft.title,
      nftImageUrl: nft.imageUrl,
      targetPrice: targetPrice,
      condition: condition,
      status: 'active',
      channels: channels,
      createdAt: new Date().toISOString()
    };

    try {
      const alertRef = doc(db, 'users', user.uid, 'priceAlerts', alertId);
      await setDoc(alertRef, alertData);
      addNotification(`Price alert set for ${nft.title} at ${targetPrice} TON`, "success");
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/priceAlerts/${alertId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#0A113A] border-white/5 text-white max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Signal Monitoring</span>
          </div>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Price Alert</DialogTitle>
          <DialogDescription className="text-zinc-400 text-[11px] uppercase tracking-widest font-bold">
            Monitor floor price shifts for this artifact
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* NFT Preview */}
          <div className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-xl border border-white/5">
            <img 
              src={nft.imageUrl} 
              alt={nft.title} 
              className="w-12 h-12 rounded-lg object-cover border border-white/10"
            />
            <div>
              <h4 className="text-sm font-black uppercase tracking-tight">{nft.title}</h4>
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                <Coins className="w-3 h-3" />
                Current: {nft.price} TON
              </div>
            </div>
          </div>

          {/* Condition Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="space-y-0.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Alert Condition</Label>
                <div className="text-xs font-bold text-white uppercase tracking-tight">
                  {condition === 'below' ? 'Price drops below' : 'Price hits value'}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCondition(prev => prev === 'below' ? 'above' : 'below')}
                className="h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest"
              >
                <TrendingDown className={cn("w-3 h-3 mr-2", condition === 'above' && "rotate-180")} />
                Switch
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetPrice" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Target Price (TON)</Label>
              <div className="relative">
                <Input
                  id="targetPrice"
                  type="number"
                  step="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="bg-black/40 border-white/10 text-white font-mono h-12 rounded-xl pl-10"
                />
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              </div>
            </div>
          </div>

          {/* Notification Channels */}
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Relay Channels</Label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'app', label: 'App Notification', icon: Globe, desc: 'Receive alert in your TonJam feed' },
                { id: 'email', label: 'Email Alert', icon: Mail, desc: 'Send to registered communications node' },
                { id: 'push', label: 'Push Notification', icon: Smartphone, desc: 'Direct broadcast to mobile devices' },
              ].map((channel) => (
                <div 
                  key={channel.id}
                  onClick={() => toggleChannel(channel.id as any)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                    channels.includes(channel.id as any) 
                      ? "bg-blue-500/10 border-blue-500/30" 
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      channels.includes(channel.id as any) ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-zinc-500"
                    )}>
                      <channel.icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 text-left">
                      <div className="text-[10px] font-black uppercase tracking-tight">{channel.label}</div>
                      <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{channel.desc}</div>
                    </div>
                  </div>
                  <Switch 
                    checked={channels.includes(channel.id as any)}
                    onCheckedChange={() => toggleChannel(channel.id as any)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest h-12 rounded-xl"
            onClick={handleSaveAlert}
            disabled={isSubmitting || !targetPrice || parseFloat(targetPrice) <= 0}
          >
            {isSubmitting ? "Broadcasting Alert..." : "Establish Signal Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PriceAlertModal;
