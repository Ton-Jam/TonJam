import { Button } from "@/components/ui/button"
import { Zap, ArrowRight } from "lucide-react"
import { TJ_COIN_ICON, TON_LOGO } from "@/constants"
import { useTonAddress } from '@tonconnect/ui-react'
import { useAudio } from '@/context/AudioContext'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function CardSmall({ onClick }: { onClick?: () => void }) {
  const userAddress = useTonAddress();
  const { userProfile } = useAudio();

  const isConnected = !!userAddress;

  return (
    <Card size="sm" className="mx-auto w-full max-w-sm bg-blue-950/20 backdrop-blur-md hover:bg-blue-950/30 transition-all border-none relative overflow-hidden flex flex-col justify-between shadow-xl">
      <CardHeader className="pb-1.5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-wider text-white">Buy TJ Coin</CardTitle>
          <div className="p-1 rounded-full bg-blue-500/10 text-blue-400">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
        </div>
        <CardDescription className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
          Decentralized JAM Token Forge
        </CardDescription>
        
        {/* TON Wallet integration block */}
        <div className="mt-2 flex items-center justify-between bg-black/35 px-2.5 py-1.5 rounded-lg border-none">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" : "bg-neutral-500"
            )}></span>
            <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">
              {isConnected ? "TON Connected" : "Local Standby"}
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold text-blue-400">
            {isConnected ? `EQ${userAddress.slice(0, 4)}...${userAddress.slice(-4)}` : "DISCONNECTED"}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 text-left space-y-2">
        {/* Simulated or Linked Wallet Balances */}
        <div className="grid grid-cols-2 gap-2 bg-black/20 p-2.5 rounded-xl border-none">
          <div>
            <span className="text-[7.5px] font-black tracking-wider text-neutral-500 uppercase block">TON Balance</span>
            <span className="text-[11px] font-black text-white">{userProfile.tonBalance?.toFixed(2) || '0.00'} TON</span>
          </div>
          <div>
            <span className="text-[7.5px] font-black tracking-wider text-neutral-500 uppercase block">JAM Balance</span>
            <span className="text-[11px] font-black text-blue-400">{userProfile.jamBalance || '0'} JAM</span>
          </div>
        </div>

        {/* Dynamic rate visualizer */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-blue-500/5 rounded-xl border-none">
          <div className="flex items-center gap-1.5">
            <img src={TON_LOGO} alt="TON" className="w-4 h-4 object-contain" />
            <span className="text-[10px] font-black text-white">1 TON</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-blue-500/40" />
          <div className="flex items-center gap-1.5">
            <img src={TJ_COIN_ICON} alt="JAM" className="w-4 h-4 object-contain" />
            <span className="text-[10px] font-black text-blue-400">100 JAM</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1.5">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClick}
          className="w-full text-[10px] font-black uppercase tracking-widest text-white border-none bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-95 transition-all py-2 rounded-xl shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
        >
          Forge JAM Now
        </Button>
      </CardFooter>
    </Card>
  )
}
