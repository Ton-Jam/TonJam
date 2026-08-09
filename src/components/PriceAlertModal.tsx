import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Coins, TrendingDown, Mail, Smartphone, Globe, Zap, Percent } from "lucide-react";
import { NFTItem, PriceAlert } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useAudio } from "@/contexts/AudioContext";
import { useNotification } from "@/contexts/NotificationContext";
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
  const { addPriceAlert, simulatePriceDrop } = useNotification();
  
  const currentPriceNum = parseFloat(nft.price || "0") || 10;
  const [targetPrice, setTargetPrice] = useState((currentPriceNum * 0.9).toFixed(2));
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

  const applyDiscountPreset = (percent: number) => {
    const discounted = currentPriceNum * (1 - percent / 100);
    setTargetPrice(discounted.toFixed(2));
  };

  const handleSaveAlert = async () => {
    setIsSubmitting(true);
    const alertId = `alert_${Date.now()}`;
    const alertData: PriceAlert = {
      id: alertId,
      userId: user?.uid || 'guest_user',
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
      if (addPriceAlert) {
        await addPriceAlert(alertData);
      }

      if (user?.uid) {
        try {
          const alertRef = doc(db, 'users', user.uid, 'priceAlerts', alertId);
          await setDoc(alertRef, alertData);
        } catch (dbErr) {
          console.warn("Firestore sync fallback for price alert:", dbErr);
        }
      }

      addNotification(`Price alert active for "${nft.title}" at ${targetPrice} TON`, "success");
      onClose();
    } catch (err) {
      console.error("Failed to set alert:", err);
      addNotification("Price alert set locally.", "success");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestSimulation = () => {
    const testDroppedPrice = (parseFloat(targetPrice) * 0.95).toFixed(2);
    const alertData: PriceAlert = {
      id: `test_alert_${Date.now()}`,
      userId: user?.uid || 'guest_user',
      nftId: nft.id,
      nftTitle: nft.title,
      nftImageUrl: nft.imageUrl,
      targetPrice: targetPrice,
      condition: 'below',
      status: 'active',
      channels: channels,
      createdAt: new Date().toISOString()
    };

    if (addPriceAlert) {
      addPriceAlert(alertData);
    }
    
    onClose();
    
    setTimeout(() => {
      if (simulatePriceDrop) {
        simulatePriceDrop(nft.id, testDroppedPrice);
      }
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#0A113A] border-white/10 text-white max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Signal Monitoring</span>
          </div>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Set Price Alert</DialogTitle>
          <DialogDescription className="text-zinc-400 text-[11px] uppercase tracking-widest font-bold">
            Get notified instantly when floor price drops below target
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 sm:py-4 space-y-4 sm:space-y-5">
          {/* NFT Preview */}
          <div className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-2xl border border-white/10">
            <img 
              src={nft.imageUrl} 
              alt={nft.title} 
              className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-black uppercase tracking-tight truncate">{nft.title}</h4>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold mt-1">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                Current Floor: {nft.price} TON
              </div>
            </div>
          </div>

          {/* Condition Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="space-y-0.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Alert Trigger</Label>
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-tight">
                  {condition === 'below' ? 'Price drops below threshold' : 'Price rises above threshold'}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCondition(prev => prev === 'below' ? 'above' : 'below')}
                className="h-8 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest"
              >
                <TrendingDown className={cn("w-3.5 h-3.5 mr-1.5 text-cyan-400", condition === 'above' && "rotate-180")} />
                Switch
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="targetPrice" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Target Threshold Price (TON)</Label>
                <span className="text-[10px] font-mono text-zinc-500">Current: {currentPriceNum} TON</span>
              </div>
              <div className="relative">
                <Input
                  id="targetPrice"
                  type="number"
                  step="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="bg-black/50 border-white/10 text-cyan-300 font-mono text-base font-bold h-12 rounded-2xl pl-10 focus:border-cyan-500"
                />
                <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              </div>

              {/* Discount Presets */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Presets:</span>
                {[10, 20, 30, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyDiscountPreset(pct)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-[10px] font-mono font-bold text-zinc-400 border border-white/5 transition-all"
                  >
                    -{pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notification Channels */}
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Alert Channels</Label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'app', label: 'App Popup Modal', icon: Globe, desc: 'Instant modal popup on price drop' },
                { id: 'push', label: 'Push Notification', icon: Smartphone, desc: 'Direct broadcast to device' },
                { id: 'email', label: 'Email Alert', icon: Mail, desc: 'Send to registered email node' },
              ].map((channel) => (
                <div 
                  key={channel.id}
                  onClick={() => toggleChannel(channel.id as any)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                    channels.includes(channel.id as any) 
                      ? "bg-cyan-500/10 border-cyan-500/30" 
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      channels.includes(channel.id as any) ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-zinc-500"
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

        <DialogFooter className="pt-2 flex-col sm:flex-col gap-2">
          <Button 
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black uppercase tracking-widest h-12 rounded-2xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            onClick={handleSaveAlert}
            disabled={isSubmitting || !targetPrice || parseFloat(targetPrice) <= 0}
          >
            {isSubmitting ? "Setting Price Alert..." : "Set Price Alert"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleTestSimulation}
            className="w-full bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 font-black uppercase text-[10px] tracking-widest h-10 rounded-xl flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulate Price Drop & Test Modal</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PriceAlertModal;

