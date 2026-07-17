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

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { TonConnectUIProvider } from '@tonconnect/ui-react';

import AppRouter from "@/router/AppRouter";

import { I18nProvider } from "@/contexts/I18nContext";

export default function App() {
  return (
    <TonConnectUIProvider manifestUrl={typeof window !== 'undefined' ? `${window.location.origin}/tonconnect-manifest.json` : 'https://tonjam.app/tonconnect-manifest.json'}>
      <ToastProvider>
        <ModalProvider>
          <ThemeProvider>
            <I18nProvider>
              <TooltipProvider>
                <AuthProvider>
                  <UserProvider>
                    <WalletProvider>
                      <TonPriceProvider>
                        <AudioProvider>
                          <LibraryProvider>
                            <ArtistProvider>
                              <NFTProvider>
                                <FeedProvider>
                                  <FollowProvider>
                                    <NotificationProvider>
                                      <TaskProvider>
                                        <TJProvider>
                                          <AppRouter />

                                          <Toaster
                                            richColors
                                            position="top-center"
                                            closeButton
                                          />
                                        </TJProvider>
                                      </TaskProvider>
                                    </NotificationProvider>
                                  </FollowProvider>
                                </FeedProvider>
                              </NFTProvider>
                            </ArtistProvider>
                          </LibraryProvider>
                        </AudioProvider>
                      </TonPriceProvider>
                    </WalletProvider>
                  </UserProvider>
                </AuthProvider>
              </TooltipProvider>
            </I18nProvider>
          </ThemeProvider>
        </ModalProvider>
      </ToastProvider>
    </TonConnectUIProvider>
  );
}

