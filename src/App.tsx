import { useEffect, Suspense } from "react";
import { HashRouter as Router } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppLoadingFallback from "@/components/AppLoadingFallback";
import { KeyboardShortcutListener } from "@/components/layout/KeyboardShortcutListener";
import { ToastProvider } from "@/components/layout/ToastProvider";
import { ModalProvider } from "@/components/layout/ModalProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import { AudioProvider } from "@/contexts/AudioContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { LibraryProvider } from "@/contexts/LibraryContext";
import { FeedProvider } from "@/contexts/FeedContext";
import { FollowProvider } from "@/contexts/FollowContext";
import { NFTProvider } from "@/contexts/NFTContext";
import { TJProvider } from "@/contexts/TJContext";
import { ArtistProvider } from "@/contexts/ArtistContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { TonPriceProvider } from "@/contexts/TonPriceContext";
import { GramPriceProvider } from "@/contexts/GramPriceContext";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

import AppRouter from "@/router/AppRouter";

import { I18nProvider } from "@/contexts/I18nContext";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeTonConnectProvider } from '@/components/SafeTonConnectProvider';
import { DiagnosticProviderBoundary } from '@/components/DiagnosticProviderBoundary';

const queryClient = new QueryClient();

const manifestUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/tonconnect-manifest.json`
  : 'https://ton-jam.vercel.app/tonconnect-manifest.json';

export default function App() {
  useEffect(() => {
    const applyFontSize = () => {
      try {
        const stored = localStorage.getItem('tonjam_font_size') || 'standard';
        const sizes: Record<string, string> = {
          compact: '15px',
          standard: '16px',
          large: '17px',
          accessible: '19px',
        };
        const sizePx = sizes[stored] || '16px';
        document.documentElement.style.fontSize = sizePx;
      } catch (err) {
        console.warn("[App] Font size storage read error:", err);
      }
    };
    applyFontSize();
    window.addEventListener('tonjam_font_size_changed', applyFontSize);
    return () => window.removeEventListener('tonjam_font_size_changed', applyFontSize);
  }, []);

  // Post-mount provider startup diagnostics report
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.getProviderDiagnostics) {
        window.getProviderDiagnostics();
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={<AppLoadingFallback />}>
        <DiagnosticProviderBoundary name="QueryClientProvider">
          <QueryClientProvider client={queryClient}>
            <DiagnosticProviderBoundary name="SafeTonConnectProvider">
              <SafeTonConnectProvider manifestUrl={manifestUrl}>
                <DiagnosticProviderBoundary name="Router">
                  <Router>
                    <DiagnosticProviderBoundary name="ThemeProvider">
                      <ThemeProvider>
                        <DiagnosticProviderBoundary name="I18nProvider">
                          <I18nProvider>
                            <DiagnosticProviderBoundary name="TooltipProvider">
                              <TooltipProvider>
                                <DiagnosticProviderBoundary name="ToastProvider">
                                  <ToastProvider>
                                    <DiagnosticProviderBoundary name="AuthProvider">
                                      <AuthProvider>
                                        <DiagnosticProviderBoundary name="UserProvider">
                                          <UserProvider>
                                            <DiagnosticProviderBoundary name="WalletProvider">
                                              <WalletProvider>
                                                <DiagnosticProviderBoundary name="TonPriceProvider">
                                                  <TonPriceProvider>
                                                    <DiagnosticProviderBoundary name="GramPriceProvider">
                                                      <GramPriceProvider>
                                                        <DiagnosticProviderBoundary name="AudioProvider">
                                                          <AudioProvider>
                                                            <KeyboardShortcutListener />
                                                            <DiagnosticProviderBoundary name="LibraryProvider">
                                                              <LibraryProvider>
                                                                <DiagnosticProviderBoundary name="ArtistProvider">
                                                                  <ArtistProvider>
                                                                    <DiagnosticProviderBoundary name="NFTProvider">
                                                                      <NFTProvider>
                                                                        <DiagnosticProviderBoundary name="FeedProvider">
                                                                          <FeedProvider>
                                                                            <DiagnosticProviderBoundary name="FollowProvider">
                                                                              <FollowProvider>
                                                                                <DiagnosticProviderBoundary name="NotificationProvider">
                                                                                  <NotificationProvider>
                                                                                    <DiagnosticProviderBoundary name="TaskProvider">
                                                                                      <TaskProvider>
                                                                                        <DiagnosticProviderBoundary name="TJProvider">
                                                                                          <TJProvider>
                                                                                            <DiagnosticProviderBoundary name="ModalProvider">
                                                                                              <ModalProvider>
                                                                                                <ErrorBoundary>
                                                                                                  <AppRouter />
                                                                                                </ErrorBoundary>

                                                                                                <Toaster
                                                                                                  richColors
                                                                                                  position="top-center"
                                                                                                  closeButton
                                                                                                />
                                                                                              </ModalProvider>
                                                                                            </DiagnosticProviderBoundary>
                                                                                          </TJProvider>
                                                                                        </DiagnosticProviderBoundary>
                                                                                      </TaskProvider>
                                                                                    </DiagnosticProviderBoundary>
                                                                                  </NotificationProvider>
                                                                                </DiagnosticProviderBoundary>
                                                                              </FollowProvider>
                                                                            </DiagnosticProviderBoundary>
                                                                          </FeedProvider>
                                                                        </DiagnosticProviderBoundary>
                                                                      </NFTProvider>
                                                                    </DiagnosticProviderBoundary>
                                                                  </ArtistProvider>
                                                                </DiagnosticProviderBoundary>
                                                              </LibraryProvider>
                                                            </DiagnosticProviderBoundary>
                                                          </AudioProvider>
                                                        </DiagnosticProviderBoundary>
                                                      </GramPriceProvider>
                                                    </DiagnosticProviderBoundary>
                                                  </TonPriceProvider>
                                                </DiagnosticProviderBoundary>
                                              </WalletProvider>
                                            </DiagnosticProviderBoundary>
                                          </UserProvider>
                                        </DiagnosticProviderBoundary>
                                      </AuthProvider>
                                    </DiagnosticProviderBoundary>
                                  </ToastProvider>
                                </DiagnosticProviderBoundary>
                              </TooltipProvider>
                            </DiagnosticProviderBoundary>
                          </I18nProvider>
                        </DiagnosticProviderBoundary>
                      </ThemeProvider>
                    </DiagnosticProviderBoundary>
                  </Router>
                </DiagnosticProviderBoundary>
              </SafeTonConnectProvider>
            </DiagnosticProviderBoundary>
          </QueryClientProvider>
        </DiagnosticProviderBoundary>
      </Suspense>
    </ErrorBoundary>
  );
}
