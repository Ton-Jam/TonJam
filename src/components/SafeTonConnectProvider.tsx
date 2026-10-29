import React, { Component, ReactNode } from 'react';
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
      reason.includes('tonconnect') || 
      reason.includes('TonConnect') || 
      reason.includes('manifest') ||
      reason.includes('bridge.tonapi.io')
    ) {
      console.warn("[SafeTonConnectProvider] Caught TonConnect background rejection:", reason);
      event.preventDefault();
    }
  };

  componentDidMount() {
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
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
          {this.props.children}
        </TonConnectUIProvider>
      </TonConnectErrorBoundary>
    );
  }
}

export default SafeTonConnectProvider;
