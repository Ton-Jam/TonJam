import React, { createContext, useContext, ReactNode, useState } from 'react';
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
    return localStorage.getItem('tonjam_simulated_evm_address');
  });

  const isConnected = !!address || !!wallet || !!evmAddress;

  const connectWallet = () => {
    if (tonConnectUI) {
      tonConnectUI.openModal();
    }
  };

  const disconnectWallet = async () => {
    if (tonConnectUI) {
      await tonConnectUI.disconnect();
    }
    setEvmAddress(null);
    localStorage.removeItem('tonjam_simulated_evm_address');
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


