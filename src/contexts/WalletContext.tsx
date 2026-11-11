import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useTonAddress, useTonWallet, useTonConnectUI, CHAIN } from '@tonconnect/ui-react';
import { safeLocalStorage } from '@/lib/safeStorage';
import { 
  getTonBalance, 
  getJettonBalance, 
  TON_NETWORK_MODE, 
  TonNetwork,
  TONJAM_COLLECTION_ADDRESS 
} from '@/services/tonService';

export interface WalletContextType {
  address: string;
  wallet: ReturnType<typeof useTonWallet>;
  isConnected: boolean;
  tonConnectUI: ReturnType<typeof useTonConnectUI>[0];
  connectWallet: () => void;
  disconnectWallet: () => Promise<void>;
  evmAddress?: string | null;
  isEvmConnected?: boolean;

  // Real TON Blockchain states
  tonBalance: number;
  jettonBalance: number;
  isLoadingBalance: boolean;
  balanceError: string | null;
  refreshBalance: () => Promise<void>;

  // Network detection & separation
  network: TonNetwork;
  isTestnet: boolean;
  isMainnet: boolean;
  networkMismatch: boolean;
  expectedNetwork: TonNetwork;

  // Transaction lifecycle
  txStatus: 'idle' | 'pending' | 'success' | 'failed' | 'rejected';
  lastTxHash: string | null;
  setTxStatus: (status: 'idle' | 'pending' | 'success' | 'failed' | 'rejected') => void;
  setLastTxHash: (hash: string | null) => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const address = useTonAddress();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  
  const [tonBalance, setTonBalance] = useState<number>(0);
  const [jettonBalance, setJettonBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'failed' | 'rejected'>('idle');
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const [evmAddress, setEvmAddress] = useState<string | null>(() => {
    try {
      return safeLocalStorage.getItem('tonjam_simulated_evm_address');
    } catch {
      return null;
    }
  });

  // Keep evmAddress in sync if updated in another tab or window
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'tonjam_simulated_evm_address') {
        setEvmAddress(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isConnected = !!address || !!wallet || !!evmAddress;

  // Detect active network from wallet connection or fallback to app configured network
  const walletChain = wallet?.account?.chain;
  const isWalletOnTestnet = walletChain === CHAIN.TESTNET || walletChain === '-3';
  const network: TonNetwork = wallet ? (isWalletOnTestnet ? 'testnet' : 'mainnet') : TON_NETWORK_MODE;
  
  const expectedNetwork: TonNetwork = TON_NETWORK_MODE;
  const isTestnet = network === 'testnet';
  const isMainnet = network === 'mainnet';
  const networkMismatch = Boolean(wallet && network !== expectedNetwork);

  // Fetch real on-chain balance whenever address or network changes
  const refreshBalance = useCallback(async () => {
    if (!address) {
      setTonBalance(0);
      setJettonBalance(0);
      setIsLoadingBalance(false);
      setBalanceError(null);
      return;
    }

    setIsLoadingBalance(true);
    setBalanceError(null);

    try {
      const realBalance = await getTonBalance(address);
      setTonBalance(realBalance);

      // Attempt to retrieve Jetton balance if master is set
      try {
        const jBalance = await getJettonBalance(address, TONJAM_COLLECTION_ADDRESS);
        setJettonBalance(jBalance);
      } catch {
        setJettonBalance(0);
      }
    } catch (err: any) {
      console.warn('[WalletContext] Failed to retrieve real TON balance:', err);
      setBalanceError(err?.message || 'Failed to fetch on-chain balance');
      setTonBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [address]);

  useEffect(() => {
    refreshBalance();
    // Poll every 30 seconds while connected
    const interval = setInterval(() => {
      if (address) {
        refreshBalance();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [address, refreshBalance]);

  const connectWallet = () => {
    if (tonConnectUI) {
      try {
        tonConnectUI.openModal();
      } catch (err) {
        console.warn("[WalletContext] Failed to open TonConnect modal:", err);
      }
    }
  };

  const disconnectWallet = async () => {
    if (tonConnectUI && tonConnectUI.connected && (tonConnectUI.wallet || (tonConnectUI as any).connector?.wallet)) {
      try {
        await tonConnectUI.disconnect();
      } catch (err) {
        console.warn("[WalletContext] Error disconnecting TON wallet:", err);
      }
    }
    setTonBalance(0);
    setJettonBalance(0);
    setEvmAddress(null);
    try {
      safeLocalStorage.removeItem('tonjam_simulated_evm_address');
    } catch (err) {
      console.warn("[WalletContext] Failed to remove EVM address from localStorage:", err);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        wallet,
        isConnected,
        tonConnectUI,
        connectWallet,
        disconnectWallet,
        evmAddress,
        isEvmConnected: !!evmAddress,
        tonBalance,
        jettonBalance,
        isLoadingBalance,
        balanceError,
        refreshBalance,
        network,
        isTestnet,
        isMainnet,
        networkMismatch,
        expectedNetwork,
        txStatus,
        lastTxHash,
        setTxStatus,
        setLastTxHash
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
