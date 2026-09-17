import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  countdown: number;
  autoRetryActive: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  private timer: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      countdown: 10,
      autoRetryActive: true,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.startAutoRecovery();
  }

  componentDidMount() {
    window.addEventListener('error', this.handleWindowError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.handleWindowError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private isNetworkOrIgnoredError = (err: any): boolean => {
    if (!err) return false;
    const message = err.message || (typeof err === 'string' ? err : '');
    const stack = err.stack || '';
    return (
      message.includes('TON_CONNECT_SDK') ||
      message.includes('tonconnect') ||
      message.toLowerCase().includes('failed to fetch') ||
      message.toLowerCase().includes('network-request-failed') ||
      message.toLowerCase().includes('load failed') ||
      message.toLowerCase().includes('networkerror') ||
      stack.includes('tonconnect')
    );
  };

  private handleWindowError = (event: ErrorEvent) => {
    if (this.isNetworkOrIgnoredError(event.error) || this.isNetworkOrIgnoredError(event.message)) {
      return;
    }
    this.setState({ hasError: true, error: event.error || new Error(event.message) }, () => {
      this.startAutoRecovery();
    });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    if (this.isNetworkOrIgnoredError(reason)) {
      return;
    }
    const err = reason instanceof Error ? reason : new Error(String(reason));
    this.setState({ hasError: true, error: err }, () => {
      this.startAutoRecovery();
    });
  };

  private startAutoRecovery = () => {
    if (!this.state.autoRetryActive) return;
    if (this.timer) clearInterval(this.timer);

    this.setState({ countdown: 10 });
    this.timer = setInterval(() => {
      this.setState((prev): Pick<State, 'countdown' | 'hasError' | 'error'> => {
        if (prev.countdown <= 1) {
          if (this.timer) clearInterval(this.timer);
          window.location.reload();
          return { countdown: 10, hasError: false, error: null };
        }
        return { countdown: prev.countdown - 1, hasError: prev.hasError, error: prev.error };
      });
    }, 1000);
  };

  private handleSoftRecovery = () => {
    if (this.timer) clearInterval(this.timer);
    this.setState({ hasError: false, error: null, countdown: 10 });
  };

  private toggleAutoRetry = () => {
    this.setState((prev) => {
      const next = !prev.autoRetryActive;
      if (!next && this.timer) {
        clearInterval(this.timer);
      }
      return { autoRetryActive: next };
    });
  };

  render() {
    const { hasError, error, autoRetryActive, countdown } = this.state;

    if (hasError) {
      let errorMessage = 'An unexpected error occurred.';
      try {
        const parsedError = JSON.parse(error?.message || '');
        if (parsedError.error) {
          errorMessage = `Firestore Error: ${parsedError.error} during ${parsedError.operationType} on ${parsedError.path}`;
        }
      } catch (e) {
        errorMessage = error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#060B1E] p-4 text-white">
          <div className="glass bg-[#0b132e]/85 backdrop-blur-xl p-8 rounded-[4px] max-w-md w-full text-center space-y-5 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-rose-400 text-2xl">⚠️</span>
            </div>
            <h1 className="text-xl font-black uppercase tracking-widest text-white">Application Interruption</h1>
            <p className="text-xs text-white/70 break-words leading-relaxed">
              {errorMessage}
            </p>

            {autoRetryActive && (
              <div className="bg-[#070c22]/80 p-3 rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Automated Recovery</span>
                <span className="text-[10px] font-bold text-white bg-blue-600/20 px-2.5 py-1 rounded-full animate-pulse">
                  Retrying in {countdown}s
                </span>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={this.handleSoftRecovery}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[4px] font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer text-white"
              >
                Attempt Soft Recovery
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-[4px] font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer text-white/80"
              >
                Force Full Reload
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={this.toggleAutoRetry}
                className="text-[9px] font-black uppercase tracking-wider text-white/40 hover:text-white/60 transition-colors cursor-pointer"
              >
                {autoRetryActive ? "Disable Auto-Recovery" : "Enable Auto-Recovery"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

