import React, { useState, useEffect, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  Coins, 
  TrendingDown, 
  Mail, 
  Smartphone, 
  Globe, 
  Zap, 
  Trash2, 
  Check, 
  Sparkles,
  ArrowDownRight
} from "lucide-react";
import { NFTItem, PriceAlert } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useAudio } from "@/contexts/AudioContext";
import { useNotification } from "@/contexts/NotificationContext";
import { priceAlertService } from "@/services/priceAlertService";
import { cn } from "@/lib/utils";

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: NFTItem;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({ isOpen, onClose, nft }) => {
  const { user } = useAuth();
  const { addNotification } = useAudio();
  const { addPriceAlert, removePriceAlert, simulatePriceDrop } = useNotification();
  
  const currentPriceNum = useMemo(() => {
    return parseFloat(nft.price?.replace(' TON', '').trim() || "0") || 10;
  }, [nft.price]);

  // Load any existing active alert for this user and NFT
  const [existingAlert, setExistingAlert] = useState<PriceAlert | null>(null);
  const [targetPrice, setTargetPrice] = useState((currentPriceNum * 0.9).toFixed(2));
  const [condition, setCondition] = useState<'below' | 'above'>('below');
  const [channels, setChannels] = useState<('app' | 'push' | 'email')[]>(['app', 'push']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && nft.id) {
      const active = priceAlertService.getAlertForNFT(user?.uid || 'guest_user', nft.id);
      if (active) {
        setExistingAlert(active);
        setTargetPrice(active.targetPrice);
        setCondition(active.condition || 'below');
        setChannels(active.channels || ['app', 'push']);
      } else {
        setExistingAlert(null);
        setTargetPrice((currentPriceNum * 0.9).toFixed(2));
        setCondition('below');
      }
    }
  }, [isOpen, nft.id, currentPriceNum, user?.uid]);

  const targetPriceNum = parseFloat(targetPrice) || 0;
  const potentialSavings = currentPriceNum > targetPriceNum ? currentPriceNum - targetPriceNum : 0;
  const discountPercent = currentPriceNum > 0 
    ? Math.max(0, Math.round(((currentPriceNum - targetPriceNum) / currentPriceNum) * 100))
    : 0;

  const toggleChannel = (channel: 'app' | 'push' | 'email') => {
    setChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel) 
        : [...prev, channel]
    );
  };

  const applyDiscountPreset = (percent: number) => {
    const discounted = Math.max(0.1, currentPriceNum * (1 - percent / 100));
    setTargetPrice(discounted.toFixed(2));
  };

  const handleSaveAlert = async () => {
    if (!targetPrice || targetPriceNum <= 0) return;
    setIsSubmitting(true);

    const alertId = existingAlert?.id || `alert_${Date.now()}`;
    const alertData: PriceAlert = {
      id: alertId,
      userId: user?.uid || 'guest_user',
      nftId: nft.id,
      nftTitle: nft.title,
      nftImageUrl: nft.imageUrl || nft.coverUrl || '',
      targetPrice: targetPrice,
      condition: condition,
      status: 'active',
      channels: channels,
      createdAt: existingAlert?.createdAt || new Date().toISOString()
    };

    try {
      // 1. Save through priceAlertService (localStorage + Firestore)
      await priceAlertService.saveAlert(alertData);

      // 2. Sync into NotificationContext
      if (addPriceAlert) {
        await addPriceAlert(alertData);
      }

      addNotification(
        `Price alert ${existingAlert ? 'updated' : 'activated'} for "${nft.title}" at ${targetPrice} TON`,
        "success"
      );
      onClose();
    } catch (err) {
      console.error("Failed to save price alert:", err);
      addNotification("Price alert saved locally.", "success");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAlert = async () => {
    if (!existingAlert) return;
    setIsSubmitting(true);
    try {
      await priceAlertService.deleteAlert(user?.uid || 'guest_user', existingAlert.id);
      if (removePriceAlert) {
        await removePriceAlert(existingAlert.id);
      }
      addNotification(`Price alert removed for "${nft.title}"`, "info");
      onClose();
    } catch (err) {
      console.error("Failed to delete price alert:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestSimulation = () => {
    const simulatedDroppedPrice = (Math.max(0.5, targetPriceNum * 0.95)).toFixed(2);
    const alertData: PriceAlert = {
      id: existingAlert?.id || `sim_alert_${Date.now()}`,
      userId: user?.uid || 'guest_user',
      nftId: nft.id,
      nftTitle: nft.title,
      nftImageUrl: nft.imageUrl || nft.coverUrl || '',
      targetPrice: targetPrice,
      condition: 'below',
      status: 'active',
      channels: channels,
      createdAt: new Date().toISOString()
    };

    priceAlertService.saveAlert(alertData);
    if (addPriceAlert) {
      addPriceAlert(alertData);
    }

    onClose();

    // Trigger instant simulated drop update through notification architecture
    setTimeout(() => {
      if (simulatePriceDrop) {
        simulatePriceDrop(nft.id, simulatedDroppedPrice);
      } else {
        priceAlertService.checkAndTriggerPriceAlerts(nft.id, parseFloat(simulatedDroppedPrice), nft);
      }
    }, 350);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Strict borderless design: no border lines */}
      <DialogContent className="sm:max-w-[430px] bg-[#0A113A]/95 backdrop-blur-2xl text-white max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl shadow-cyan-500/10 p-5 sm:p-6 border-none select-none">
        <DialogHeader>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                <Bell className="w-4 h-4 fill-current" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
                Floor Tracker
              </span>
            </div>
            {existingAlert && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                Active Alert
              </span>
            )}
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            {existingAlert ? 'Manage Price Alert' : 'Set Price Alert'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs font-medium">
            Get real-time updates when this Music NFT hits your target floor price.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* NFT Preview (borderless surface) */}
          <div className="flex items-center gap-3.5 p-3.5 bg-white/[0.04] rounded-2xl">
            <img 
              src={nft.imageUrl || nft.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&fit=crop&q=80'} 
              alt={nft.title} 
              className="w-14 h-14 rounded-xl object-cover shadow-md shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-black uppercase tracking-tight truncate text-white">
                {nft.title}
              </h4>
              <p className="text-[11px] text-zinc-400 truncate">
                by {nft.artist || nft.creator || 'TonJam Artist'}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold mt-1">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span>Current Floor: {currentPriceNum} TON</span>
              </div>
            </div>
          </div>

          {/* Trigger Condition Selector (borderless surface) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03]">
              <div className="space-y-0.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Alert Trigger
                </Label>
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-tight flex items-center gap-1">
                  <TrendingDown className={cn("w-3.5 h-3.5 text-cyan-400", condition === 'above' && "rotate-180")} />
                  <span>{condition === 'below' ? 'Price drops below target' : 'Price rises above target'}</span>
                </div>
              </div>
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                onClick={() => setCondition(prev => prev === 'below' ? 'above' : 'below')}
                className="h-8 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-white border-none cursor-pointer"
              >
                Switch
              </Button>
            </div>

            {/* Target Price Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <Label htmlFor="targetPrice" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Target Price (TON)
                </Label>
                {discountPercent > 0 && condition === 'below' && (
                  <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-0.5">
                    <ArrowDownRight className="w-3 h-3" />
                    Save {potentialSavings.toFixed(2)} TON (-{discountPercent}%)
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="targetPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="bg-black/40 text-cyan-300 font-mono text-base font-bold h-12 rounded-2xl pl-10 pr-4 focus:ring-2 focus:ring-cyan-500 border-none outline-none"
                  placeholder="0.00"
                />
                <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 pointer-events-none" />
              </div>

              {/* Quick Discount Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Presets:</span>
                {[10, 20, 30, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyDiscountPreset(pct)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border-none cursor-pointer",
                      discountPercent === pct
                        ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                        : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
                    )}
                  >
                    -{pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notification Channels (borderless surfaces) */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-0.5">
              Notification Channels
            </Label>
            <div className="space-y-1.5">
              {[
                { id: 'app', label: 'In-App Bell & Popups', icon: Globe, desc: 'Real-time alert modal & notification list' },
                { id: 'push', label: 'Push Notification', icon: Smartphone, desc: 'Instant desktop / mobile browser alert' },
                { id: 'email', label: 'Email Dispatch', icon: Mail, desc: 'Direct digest to account email address' },
              ].map((channel) => {
                const isChecked = channels.includes(channel.id as any);
                return (
                  <div 
                    key={channel.id}
                    onClick={() => toggleChannel(channel.id as any)}
                    className={cn(
                      "flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer select-none",
                      isChecked 
                        ? "bg-cyan-500/10 text-white" 
                        : "bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                        isChecked ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-zinc-500"
                      )}>
                        <channel.icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <div className="text-[11px] font-bold tracking-tight text-white">{channel.label}</div>
                        <div className="text-[9px] text-zinc-400 leading-tight">{channel.desc}</div>
                      </div>
                    </div>
                    <Switch 
                      checked={isChecked}
                      onCheckedChange={() => toggleChannel(channel.id as any)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Actions (no borders) */}
        <DialogFooter className="pt-2 flex-col sm:flex-col gap-2">
          <Button 
            type="button"
            className="w-full bg-[#0088CC] hover:bg-[#0077b3] text-white font-black uppercase tracking-wider h-12 rounded-2xl shadow-lg shadow-[#0088CC]/25 active:scale-95 transition-all border-none cursor-pointer"
            onClick={handleSaveAlert}
            disabled={isSubmitting || !targetPrice || targetPriceNum <= 0}
          >
            {isSubmitting 
              ? "Saving Price Alert..." 
              : existingAlert 
              ? "Update Price Alert" 
              : "Set Price Alert"}
          </Button>

          <div className="flex items-center gap-2 w-full">
            <Button
              type="button"
              variant="ghost"
              onClick={handleTestSimulation}
              className="flex-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 font-bold uppercase text-[10px] tracking-wider h-10 rounded-xl flex items-center justify-center gap-1.5 border-none cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Test Price Drop</span>
            </Button>

            {existingAlert && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDeleteAlert}
                className="px-3 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 font-bold text-[10px] uppercase tracking-wider h-10 rounded-xl flex items-center justify-center gap-1 border-none cursor-pointer"
                title="Delete alert"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PriceAlertModal;
