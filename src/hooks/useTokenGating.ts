import { useState, useEffect } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { getJettonBalance, checkNFTOwnership } from '@/services/tonService';
import { TokenGating } from '@/types';

export const useTokenGating = (gating?: TokenGating) => {
  const [hasAccess, setHasAccess] = useState<boolean>(true);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const walletAddress = useTonAddress();

  useEffect(() => {
    const verifyAccess = async () => {
      if (!gating || !gating.enabled) {
        setHasAccess(true);
        return;
      }

      if (!walletAddress) {
        setHasAccess(false);
        return;
      }

      setIsVerifying(true);
      try {
        if (gating.tokenType === 'jetton' && gating.tokenAddress) {
          const balance = await getJettonBalance(walletAddress, gating.tokenAddress);
          const required = parseFloat(gating.minAmount || '0');
          setHasAccess(balance >= required);
        } else if (gating.tokenType === 'nft' && gating.tokenAddress) {
          const ownsNFT = await checkNFTOwnership(walletAddress, gating.tokenAddress);
          setHasAccess(ownsNFT);
        } else {
          setHasAccess(true);
        }
      } catch (error) {
        console.error("Token gating verification failed:", error);
        setHasAccess(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAccess();
  }, [gating, walletAddress]);

  return { hasAccess, isVerifying, walletAddress };
};
