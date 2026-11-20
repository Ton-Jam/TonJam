import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import {
  isTonConnectConnected,
  isWalletAlreadyConnectedError,
  safeOpenTonConnectModal,
  installTonConnectGuards,
} from '@/lib/tonConnectGuard';
import { SafeTonConnectProvider } from '@/components/SafeTonConnectProvider';

vi.mock('@tonconnect/ui-react', () => ({
  TonConnectUIProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TonConnectUIContext: React.createContext(null),
  useTonConnectUI: () => [
    {
      connected: false,
      wallet: null,
      openModal: vi.fn(),
      closeModal: vi.fn(),
      onStatusChange: () => () => {},
      connectionRestored: Promise.resolve(false),
    },
  ],
}));

describe('tonConnectGuard', () => {
  it('detects connected state across tonConnectUI and connector fields', () => {
    expect(isTonConnectConnected(null)).toBe(false);
    expect(isTonConnectConnected({ connected: false, wallet: null })).toBe(false);
    expect(isTonConnectConnected({ connected: true })).toBe(true);
    expect(isTonConnectConnected({ wallet: { account: { address: 'EQ123' } } })).toBe(true);
    expect(isTonConnectConnected({ connector: { connected: true } })).toBe(true);
    expect(isTonConnectConnected({ connector: { wallet: { account: { address: 'EQ123' } } } })).toBe(true);
  });

  it('prevents opening modal and closes lingering modal when already connected', () => {
    const openModal = vi.fn();
    const closeModal = vi.fn();

    const connectedUI = {
      connected: true,
      modalState: { status: 'opened' },
      openModal,
      closeModal,
    };

    expect(safeOpenTonConnectModal(connectedUI)).toBe(false);
    expect(openModal).not.toHaveBeenCalled();
    expect(closeModal).toHaveBeenCalledWith('wallet-selected');

    const disconnectedUI = {
      connected: false,
      wallet: null,
      openModal,
      closeModal,
    };
    expect(safeOpenTonConnectModal(disconnectedUI)).toBe(true);
    expect(openModal).toHaveBeenCalledTimes(1);
  });

  it('guards openModal globally via installTonConnectGuards and auto-closes modal when wallet connects', async () => {
    const rawOpenModal = vi.fn();
    const rawOpenSingle = vi.fn();
    const closeModal = vi.fn();
    let statusCallback: ((wallet: any) => void) | null = null;

    const ui: any = {
      connected: false,
      wallet: null,
      modalState: { status: 'opened' },
      openModal: rawOpenModal,
      openSingleWalletModal: rawOpenSingle,
      closeModal,
      connectionRestored: Promise.resolve(false),
      onStatusChange: (cb: (wallet: any) => void) => {
        statusCallback = cb;
        return vi.fn();
      },
    };

    const cleanup = installTonConnectGuards(ui);

    // Calling while disconnected forwards to original openModal
    ui.openModal();
    expect(rawOpenModal).toHaveBeenCalledTimes(1);

    // Simulate wallet connecting via bridge / restore
    ui.connected = true;
    ui.wallet = { account: { address: 'EQConnected' } };
    statusCallback?.(ui.wallet);
    expect(closeModal).toHaveBeenCalledWith('wallet-selected');

    // Subsequent direct calls to openModal or openSingleWalletModal are blocked
    await ui.openModal();
    await ui.openSingleWalletModal('tonkeeper');
    expect(rawOpenModal).toHaveBeenCalledTimes(1);
    expect(rawOpenSingle).not.toHaveBeenCalled();

    cleanup();
  });

  it('identifies _WalletAlreadyConnectedError errors and SafeTonConnectProvider suppresses uncaught window errors for them', () => {
    const sdkErr = new Error(
      '[TON_CONNECT_SDK_ERROR] _WalletAlreadyConnectedError: Wallet connection called but wallet already connected.'
    );
    expect(isWalletAlreadyConnectedError(sdkErr)).toBe(true);
    expect(isWalletAlreadyConnectedError(new Error('Network timeout'))).toBe(false);

    render(
      <SafeTonConnectProvider manifestUrl="https://example.com/manifest.json">
        <div>Child</div>
      </SafeTonConnectProvider>
    );

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errEvent = new ErrorEvent('error', {
      error: sdkErr,
      message: sdkErr.message,
      cancelable: true,
    });

    window.dispatchEvent(errEvent);
    expect(errEvent.defaultPrevented).toBe(true);
    warnSpy.mockRestore();
  });
});
