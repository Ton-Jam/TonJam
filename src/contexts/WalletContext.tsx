import React, { createContext, useContext, ReactNode } from 'react';
import { http, createConfig, WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import { useTonAddress, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';

// Configure Wagmi
const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export interface WalletContextType {
  address: string;
  wallet: ReturnType<typeof useTonWallet>;
  isConnected: boolean;
  tonConnectUI: ReturnType<typeof useTonConnectUI>[0];
  connectWallet: () => void;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

const WalletInnerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const address = useTonAddress();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const isConnected = !!address || !!wallet;

  const connectWallet = () => {
    if (tonConnectUI) {
      tonConnectUI.openModal();
    }
  };

  const disconnectWallet = async () => {
    if (tonConnectUI) {
      await tonConnectUI.disconnect();
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
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletInnerProvider>
          {children}
        </WalletInnerProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

