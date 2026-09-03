import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useTonAddress, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';

export interface WalletContextType {
  address: string;
  wallet: ReturnType<typeof useTonWallet>;
  isConnected: boolean;
  tonConnectUI: ReturnType<typeof useTonConnectUI>[0];
  connectWallet: () => void;
  disconnectWallet: () => Promise<void>;
  evmAddress?: string | null;
  isEvmConnected?: boolean;
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
  const [evmAddress, setEvmAddress] = useState<string | null>(() => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('tonjam_simulated_evm_address') : null;
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
    setEvmAddress(null);
    try {
      localStorage.removeItem('tonjam_simulated_evm_address');
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
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};


