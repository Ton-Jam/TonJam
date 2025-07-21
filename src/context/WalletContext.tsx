// src/context/WalletContext.tsx
import React, { createContext, useContext, useState } from 'react';

const WalletContext = createContext(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  return (
    <WalletContext.Provider value={{ walletAddress, setWalletAddress }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
