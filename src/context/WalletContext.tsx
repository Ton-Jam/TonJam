import React, { createContext, useContext, ReactNode } from 'react';
import { http, createConfig, WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';

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

interface WalletContextType {
  // We can expose wagmi-specific hooks directly in components,
  // but this context allows us to add custom logic.
}

const WalletContext = createContext<WalletContextType>({});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletContext.Provider value={{}}>
            {children}
        </WalletContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
