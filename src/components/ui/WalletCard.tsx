import * as React from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck } from "lucide-react";
import { colors } from "@/design";
import { Button } from "./button";

interface WalletCardProps {
  balance?: string;
  address?: string;
  onSend?: () => void;
  onReceive?: () => void;
  isLoading?: boolean;
}

export function WalletCard({
  balance = "2,450.00 TJ",
  address = "EQD...x7u9",
  onSend,
  onReceive,
  isLoading = false,
}: WalletCardProps) {
  return (
    <div 
      className="p-5 rounded-card bg-surface border border-border-subtle flex flex-col justify-between"
      style={{ backgroundColor: colors.dark.surface, borderColor: colors.dark.border }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-white/5">
            <Wallet className="size-4 text-primary" style={{ color: colors.dark.primary }} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
            TonJam Vault
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 text-[9px] font-black tracking-wider text-success uppercase">
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
          Secured
        </div>
      </div>

      <div className="mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-0.5">
          Available Balance
        </span>
        <h2 className="text-2xl font-black text-text-primary tracking-tight">
          {isLoading ? "Fetching balance..." : balance}
        </h2>
        <p className="text-[10px] font-mono text-text-muted tracking-wider truncate mt-1">
          {address}
        </p>
      </div>

      <div className="flex items-center gap-3 mt-1">
        <Button
          variant="primary"
          size="sm"
          onClick={onSend}
          className="flex-1 gap-1.5 font-black uppercase tracking-widest text-[9px]"
        >
          <ArrowUpRight className="size-3" />
          Send
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onReceive}
          className="flex-1 gap-1.5 font-black uppercase tracking-widest text-[9px]"
        >
          <ArrowDownLeft className="size-3" />
          Receive
        </Button>
      </div>
    </div>
  );
}
