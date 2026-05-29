import React, { useState, useEffect, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const ErrorBoundary: React.FC<Props> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
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

      const isIgnoredError = reason && (
        (typeof reason === 'string' && (reason.includes('TON_CONNECT_SDK') || reason.includes('tonconnect'))) ||
        (reason.message && (reason.message.includes('TON_CONNECT_SDK') || reason.message.includes('tonconnect') || reason.message.includes('Failed to fetch'))) ||
        (reason.stack && reason.stack.includes('tonconnect'))
      );

      if (!isIgnoredError) {
        setHasError(true);
        setError(event.reason);
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
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass border border-destructive/50 p-8 rounded-[20px] max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-destructive text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground break-words">
            {errorMessage}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-primary text-primary-foreground rounded-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ErrorBoundary;
