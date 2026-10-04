import React, { Component, ReactNode, useState, useEffect } from 'react';
import { TonConnectUIProvider, TonConnectUIContext } from '@tonconnect/ui-react';

// Complete mock instance matching TonConnectUI interface to guarantee hooks never crash if SDK fails
const fallbackTonConnectUI: any = {
  wallet: null,
  connected: false,
  account: null,
  modal: {
    state: null,
    open: () => {},
    close: () => {},
  },
  onStatusChange: () => () => {},
  onModalStateChange: () => () => {},
  openModal: () => {},
  closeModal: () => {},
  openSingleWalletModal: () => {},
  closeSingleWalletModal: () => {},
  connectWallet: () => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  sendTransaction: () => Promise.reject(new Error('TON Wallet disconnected')),
  connectionRestored: Promise.resolve(true),
  setConnectRequestParameters: () => {},
  uiOptions: {},
};

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class TonConnectErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("[SafeTonConnectProvider] TonConnectUIProvider initialization notice, falling back safely:", error);
  }

  render() {
    // If TonConnect fails to initialize, provide fallback context so useTonConnectUI / useTonAddress never throw
    if (this.state.hasError) {
      return (
        <TonConnectUIContext.Provider value={fallbackTonConnectUI}>
          {this.props.children}
        </TonConnectUIContext.Provider>
      );
    }
    return this.props.children;
  }
}

interface SafeTonConnectProviderProps {
  children: ReactNode;
  manifestUrl: string;
}

export const SafeTonConnectProvider: React.FC<SafeTonConnectProviderProps> = ({ children, manifestUrl }) => {
  const [hasProviderError, setHasProviderError] = useState(false);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason?.message || event.reason || '');
      if (
        reason.includes('tonconnect') || 
        reason.includes('TonConnect') || 
        reason.includes('manifest') ||
        reason.includes('bridge.tonapi.io')
      ) {
        console.warn("[SafeTonConnectProvider] Caught TonConnect background rejection:", reason);
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  if (hasProviderError) {
    return (
      <TonConnectUIContext.Provider value={fallbackTonConnectUI}>
        {children}
      </TonConnectUIContext.Provider>
    );
  }

  return (
    <TonConnectErrorBoundary>
      <TonConnectUIProvider
        manifestUrl={manifestUrl}
        actionsConfiguration={{
          twaReturnUrl: typeof window !== 'undefined' ? (window.location.href as any) : undefined,
          returnStrategy: 'back',
        }}
      >
        {children}
      </TonConnectUIProvider>
    </TonConnectErrorBoundary>
  );
};

export default SafeTonConnectProvider;
