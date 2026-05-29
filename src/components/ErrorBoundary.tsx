import React, { useState, useEffect, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const ErrorBoundary: React.FC<Props> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [autoRetryActive, setAutoRetryActive] = useState(true);

  // Automatic recovery effect
  useEffect(() => {
    if (!hasError || !autoRetryActive) return;

    setCountdown(10);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Perform automatic recovery: reset state first, then reload to be safe
          setHasError(false);
          setError(null);
          window.location.reload();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasError, autoRetryActive]);

  const handleSoftRecovery = () => {
    setHasError(false);
    setError(null);
    setCountdown(10);
  };

  useEffect(() => {
    const isNetworkOrIgnoredError = (err: any): boolean => {
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

    const errorHandler = (event: ErrorEvent) => {
      if (isNetworkOrIgnoredError(event.error) || isNetworkOrIgnoredError(event.message)) {
        console.warn('[Telemetry] Non-fatal network/ignored error ignored by bounds:', {
          message: event.message,
          error: event.error?.message
        });
        return;
      }
      setHasError(true);
      setError(event.error);
    };

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      
      // Telemetry: Log Firebase connectivity errors
      const errorMessage = reason?.message || (typeof reason === 'string' ? reason : '');
      if (errorMessage && (errorMessage.includes('unavailable') || errorMessage.includes('network-request-failed') || errorMessage.includes('failed to fetch'))) {
        console.warn('[Telemetry] Firebase connectivity error detected:', {
          timestamp: new Date().toISOString(),
          message: errorMessage,
          type: 'FIREBASE_CONNECTION_FALLBACK'
        });
      }

      if (!isNetworkOrIgnoredError(reason)) {
        setHasError(true);
        setError(event.reason);
      } else {
        console.warn('[Telemetry] Unhandled promise rejection ignored by bounds:', errorMessage);
      }
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  if (hasError) {
    let errorMessage = 'An unexpected error occurred.';
    try {
      // Check if error message is our custom Firestore JSON error
      const parsedError = JSON.parse(error?.message || '');
      if (parsedError.error) {
        errorMessage = `Firestore Error: ${parsedError.error} during ${parsedError.operationType} on ${parsedError.path}`;
      }
    } catch (e) {
      // Not a JSON error, use original message if available
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
              onClick={handleSoftRecovery}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[4px] font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer text-white"
            >
              Attempt Soft Recovery
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-[4px] font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer text-white/80"
            >
              Force Full Reload
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setAutoRetryActive(prev => !prev);
                if (!autoRetryActive) {
                  setCountdown(10);
                }
              }}
              className="text-[9px] font-black uppercase tracking-wider text-white/40 hover:text-white/60 transition-colors cursor-pointer"
            >
              {autoRetryActive ? "Disable Auto-Recovery" : "Enable Auto-Recovery"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ErrorBoundary;
