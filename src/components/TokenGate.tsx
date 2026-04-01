import React from 'react';
import { useTokenGating } from '@/hooks/useTokenGating';
import { TokenGating } from '@/types';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TonConnectButton } from '@tonconnect/ui-react';

interface TokenGateProps {
  gating?: TokenGating;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const TokenGate: React.FC<TokenGateProps> = ({ gating, children, fallback }) => {
  const { hasAccess, isVerifying, walletAddress } = useTokenGating(gating);

  if (!gating || !gating.enabled) {
    return <>{children}</>;
  }

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-muted/30 animate-pulse">
        <ShieldCheck className="w-12 h-12 text-primary mb-4 animate-bounce" />
        <p className="text-sm font-medium">Verifying token ownership...</p>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-muted/30 text-center">
        <Lock className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-bold mb-2">Exclusive Content</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          This content is token-gated. Connect your wallet to verify access.
        </p>
        <TonConnectButton />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-destructive/5 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-bold mb-2 text-destructive">Access Denied</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          You need at least <span className="font-bold text-foreground">{gating.minAmount} {gating.tokenSymbol}</span> to access this content.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            Buy {gating.tokenSymbol}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default TokenGate;
