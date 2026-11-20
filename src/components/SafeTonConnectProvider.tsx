import React, { Component, ReactNode, useEffect } from 'react';
import { TonConnectUIProvider, TonConnectUIContext, useTonConnectUI } from '@tonconnect/ui-react';
import { installTonConnectGuards, isWalletAlreadyConnectedError } from '@/lib/tonConnectGuard';

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

const TonConnectConnectionGuard: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    return installTonConnectGuards(tonConnectUI);
  }, [tonConnectUI]);

  return null;
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

interface SafeTonConnectProviderState {
  hasError: boolean;
}

export class SafeTonConnectProvider extends Component<SafeTonConnectProviderProps, SafeTonConnectProviderState> {
  constructor(props: SafeTonConnectProviderProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("[SafeTonConnectProvider] Caught TonConnect tree error, falling back safely:", error);
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = String(event.reason?.message || event.reason || '');
    if (
      isWalletAlreadyConnectedError(event.reason) ||
      reason.includes('tonconnect') || 
      reason.includes('TonConnect') || 
      reason.includes('manifest') ||
      reason.includes('bridge.tonapi.io')
    ) {
      console.warn("[SafeTonConnectProvider] Caught TonConnect background rejection:", reason);
      event.preventDefault();
    }
  };

  private handleWindowError = (event: ErrorEvent) => {
    if (isWalletAlreadyConnectedError(event.error || event.message)) {
      console.warn("[SafeTonConnectProvider] Wallet already connected; suppressed duplicate TonConnect connection error.");
      event.preventDefault();
    }
  };

  componentDidMount() {
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
      window.addEventListener('error', this.handleWindowError);
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
      window.removeEventListener('error', this.handleWindowError);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <TonConnectUIContext.Provider value={fallbackTonConnectUI}>
          {this.props.children}
        </TonConnectUIContext.Provider>
      );
    }

    return (
      <TonConnectErrorBoundary>
        <TonConnectUIProvider
          manifestUrl={this.props.manifestUrl}
          actionsConfiguration={{
            twaReturnUrl: typeof window !== 'undefined' ? (window.location.href as any) : undefined,
            returnStrategy: 'back',
          }}
        >
          <TonConnectConnectionGuard />
          {this.props.children}
        </TonConnectUIProvider>
      </TonConnectErrorBoundary>
    );
  }
}

export default SafeTonConnectProvider;
