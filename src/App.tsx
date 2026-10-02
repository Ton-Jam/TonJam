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
import { TonConnectUIProvider } from '@tonconnect/ui-react';

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

  return (
    <ErrorBoundary>
      <Suspense fallback={<AppLoadingFallback />}>
        <QueryClientProvider client={queryClient}>
          <TonConnectUIProvider manifestUrl={manifestUrl}>
            <Router>
              <ThemeProvider>
                <I18nProvider>
                  <TooltipProvider>
                    <ToastProvider>
                      <AuthProvider>
                        <UserProvider>
                          <WalletProvider>
                            <TonPriceProvider>
                              <GramPriceProvider>
                                <AudioProvider>
                                  <KeyboardShortcutListener />
                                  <LibraryProvider>
                                    <ArtistProvider>
                                      <NFTProvider>
                                        <FeedProvider>
                                          <FollowProvider>
                                            <NotificationProvider>
                                              <TaskProvider>
                                                <TJProvider>
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
                                                </TJProvider>
                                              </TaskProvider>
                                            </NotificationProvider>
                                          </FollowProvider>
                                        </FeedProvider>
                                      </NFTProvider>
                                    </ArtistProvider>
                                  </LibraryProvider>
                                </AudioProvider>
                              </GramPriceProvider>
                            </TonPriceProvider>
                          </WalletProvider>
                        </UserProvider>
                      </AuthProvider>
                    </ToastProvider>
                  </TooltipProvider>
                </I18nProvider>
              </ThemeProvider>
            </Router>
          </TonConnectUIProvider>
        </QueryClientProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
