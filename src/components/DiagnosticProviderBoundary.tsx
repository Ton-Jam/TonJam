import React, { Component, ReactNode } from 'react';

declare global {
  interface Window {
    __PROVIDER_DIAGNOSTICS__?: Record<string, {
      status: 'INITIALIZING' | 'SUCCESS' | 'FAILED';
      error?: string;
      stack?: string;
      timestamp: string;
    }>;
    getProviderDiagnostics?: () => void;
  }
}

// Initialize diagnostic registry on window
if (typeof window !== 'undefined') {
  window.__PROVIDER_DIAGNOSTICS__ = window.__PROVIDER_DIAGNOSTICS__ || {};
  window.getProviderDiagnostics = () => {
    console.group('%c[TonJam Provider Diagnostics Report]', 'color: #0088cc; font-weight: bold; font-size: 14px;');
    console.table(window.__PROVIDER_DIAGNOSTICS__);
    console.groupEnd();
    return window.__PROVIDER_DIAGNOSTICS__;
  };
}

interface DiagnosticBoundaryProps {
  name: string;
  children: ReactNode;
}

interface DiagnosticBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class DiagnosticProviderBoundary extends Component<DiagnosticBoundaryProps, DiagnosticBoundaryState> {
  constructor(props: DiagnosticBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };

    // Register initialization attempt
    if (typeof window !== 'undefined') {
      window.__PROVIDER_DIAGNOSTICS__ = window.__PROVIDER_DIAGNOSTICS__ || {};
      window.__PROVIDER_DIAGNOSTICS__[this.props.name] = {
        status: 'INITIALIZING',
        timestamp: new Date().toISOString(),
      };
      console.log(`%c[Provider Diagnostic] ⏳ Initializing <${this.props.name}>...`, 'color: #38bdf8;');
    }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(
      `%c[Provider Diagnostic] ❌ FAILED to initialize <${this.props.name}>:`,
      'color: #ef4444; font-weight: bold;',
      error,
      info.componentStack
    );

    if (typeof window !== 'undefined') {
      window.__PROVIDER_DIAGNOSTICS__ = window.__PROVIDER_DIAGNOSTICS__ || {};
      window.__PROVIDER_DIAGNOSTICS__[this.props.name] = {
        status: 'FAILED',
        error: error?.message || String(error),
        stack: error?.stack,
        timestamp: new Date().toISOString(),
      };
    }
  }

  componentDidMount() {
    if (!this.state.hasError) {
      console.log(`%c[Provider Diagnostic] ✅ Initialized <${this.props.name}> successfully`, 'color: #22c55e;');
      if (typeof window !== 'undefined') {
        window.__PROVIDER_DIAGNOSTICS__ = window.__PROVIDER_DIAGNOSTICS__ || {};
        window.__PROVIDER_DIAGNOSTICS__[this.props.name] = {
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
        };
      }
    }
  }

  render() {
    if (this.state.hasError) {
      console.warn(`[Provider Diagnostic] ⚠️ Bypassing failed <${this.props.name}> to preserve application tree.`);
      // Gracefully continue rendering children so the rest of the application remains visible
      return (
        <div data-failed-provider={this.props.name} style={{ display: 'contents' }}>
          {this.props.children}
        </div>
      );
    }

    try {
      return this.props.children;
    } catch (err: any) {
      console.error(`[Provider Diagnostic] ❌ Render error caught in <${this.props.name}>:`, err);
      return (
        <div data-failed-provider={this.props.name} style={{ display: 'contents' }}>
          {this.props.children}
        </div>
      );
    }
  }
}

export default DiagnosticProviderBoundary;
