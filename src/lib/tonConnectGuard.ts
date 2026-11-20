/**
 * Guards TonConnect UI modal and connection calls against `_WalletAlreadyConnectedError`
 * when a wallet session is already connected or restored.
 */

const guardedInstances = new WeakSet<object>();

export function isTonConnectConnected(tonConnectUI: any): boolean {
  if (!tonConnectUI) return false;
  return Boolean(
    tonConnectUI.connected ||
      tonConnectUI.wallet ||
      tonConnectUI.account?.address ||
      tonConnectUI.connector?.connected ||
      tonConnectUI.connector?.wallet
  );
}

export function isWalletAlreadyConnectedError(error: unknown): boolean {
  if (!error) return false;
  const errObj = error as { name?: string; message?: string };
  const text = `${errObj?.name || ''} ${errObj?.message || ''} ${String(error)}`.toLowerCase();
  return (
    text.includes('walletalreadyconnectederror') ||
    text.includes('_walletalreadyconnectederror') ||
    text.includes('wallet connection called but wallet already connected')
  );
}

export function closeTonConnectModals(tonConnectUI: any): void {
  if (!tonConnectUI) return;
  try {
    if (tonConnectUI.modalState?.status === 'opened' || tonConnectUI.modal?.state?.status === 'opened') {
      tonConnectUI.closeModal?.('wallet-selected');
    }
  } catch {
    // Ignore close errors if modal is already closed
  }
  try {
    if (tonConnectUI.singleWalletModalState?.status === 'opened') {
      tonConnectUI.closeSingleWalletModal?.('wallet-selected');
    }
  } catch {
    // Ignore close errors if single-wallet modal is already closed
  }
}

export function safeOpenTonConnectModal(tonConnectUI: any, options?: any): boolean {
  if (!tonConnectUI) return false;
  if (isTonConnectConnected(tonConnectUI)) {
    closeTonConnectModals(tonConnectUI);
    return false;
  }
  if (typeof tonConnectUI.openModal === 'function') {
    tonConnectUI.openModal(options);
    return true;
  }
  return false;
}

export function installTonConnectGuards(tonConnectUI: any): () => void {
  if (!tonConnectUI || typeof tonConnectUI !== 'object') {
    return () => {};
  }

  if (!guardedInstances.has(tonConnectUI)) {
    guardedInstances.add(tonConnectUI);

    if (typeof tonConnectUI.openModal === 'function') {
      const originalOpenModal = tonConnectUI.openModal.bind(tonConnectUI);
      tonConnectUI.openModal = (options?: any) => {
        if (isTonConnectConnected(tonConnectUI)) {
          closeTonConnectModals(tonConnectUI);
          return Promise.resolve();
        }
        return originalOpenModal(options);
      };
    }

    if (typeof tonConnectUI.openSingleWalletModal === 'function') {
      const originalOpenSingleWalletModal = tonConnectUI.openSingleWalletModal.bind(tonConnectUI);
      tonConnectUI.openSingleWalletModal = (wallet: string) => {
        if (isTonConnectConnected(tonConnectUI)) {
          closeTonConnectModals(tonConnectUI);
          return Promise.resolve();
        }
        return originalOpenSingleWalletModal(wallet);
      };
    }

    if (tonConnectUI.connectionRestored && typeof tonConnectUI.connectionRestored.then === 'function') {
      tonConnectUI.connectionRestored
        .then((restored: boolean) => {
          if (restored || isTonConnectConnected(tonConnectUI)) {
            closeTonConnectModals(tonConnectUI);
          }
        })
        .catch(() => {});
    }
  }

  let unsubscribe: (() => void) | undefined;
  if (typeof tonConnectUI.onStatusChange === 'function') {
    unsubscribe = tonConnectUI.onStatusChange((wallet: any) => {
      if (wallet) {
        closeTonConnectModals(tonConnectUI);
      }
    });
  }

  return () => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  };
}
