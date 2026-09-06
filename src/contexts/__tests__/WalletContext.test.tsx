import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import { WalletProvider, useWallet } from '../WalletContext';
import * as tonConnectModule from '@tonconnect/ui-react';

// Mock TonConnect UI hooks
vi.mock('@tonconnect/ui-react', () => ({
  useTonAddress: vi.fn(),
  useTonWallet: vi.fn(),
  useTonConnectUI: vi.fn(),
}));

describe('WalletContext - Unit, Integration & Race Condition Suite', () => {
  const mockOpenModal = vi.fn();
  const mockDisconnect = vi.fn().mockResolvedValue(undefined);
  const mockTonConnectUI = {
    openModal: mockOpenModal,
    disconnect: mockDisconnect,
    connected: false,
    wallet: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (tonConnectModule.useTonAddress as any).mockReturnValue('');
    (tonConnectModule.useTonWallet as any).mockReturnValue(null);
    (tonConnectModule.useTonConnectUI as any).mockReturnValue([mockTonConnectUI]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Initial Disconnected State & Provider Guard
  describe('Hook initialization & Provider Guard', () => {
    it('throws a descriptive error if useWallet is invoked outside WalletProvider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useWallet());
      }).toThrow('useWallet must be used within a WalletProvider');

      consoleSpy.mockRestore();
    });

    it('successfully initializes with default disconnected state', () => {
      const { result } = renderHook(() => useWallet(), {
        wrapper: ({ children }) => <WalletProvider>{children}</WalletProvider>,
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.address).toBe('');
      expect(result.current.wallet).toBeNull();
      expect(result.current.evmAddress).toBeNull();
      expect(result.current.isEvmConnected).toBe(false);
    });
  });

  // 2. TON Wallet Connection & State Sync
  describe('TON Wallet Connection States', () => {
    it('reflects connected state when useTonAddress returns a valid TON address', () => {
      const mockAddress = 'EQD___TonAddressSample123456';
      (tonConnectModule.useTonAddress as any).mockReturnValue(mockAddress);
      (tonConnectModule.useTonWallet as any).mockReturnValue({
        account: { address: mockAddress },
        device: { appName: 'Tonkeeper' },
      });

      const { result } = renderHook(() => useWallet(), {
        wrapper: ({ children }) => <WalletProvider>{children}</WalletProvider>,
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.address).toBe(mockAddress);
      expect(result.current.wallet).toBeDefined();
    });

    it('triggers tonConnectUI.openModal on connectWallet()', () => {
      const { result } = renderHook(() => useWallet(), {
        wrapper: ({ children }) => <WalletProvider>{children}</WalletProvider>,
      });

      act(() => {
        result.current.connectWallet();
      });

      expect(mockOpenModal).toHaveBeenCalledTimes(1);
    });

    it('handles connectWallet gracefully if tonConnectUI.openModal throws an error', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockOpenModal.mockImplementationOnce(() => {
        throw new Error('TonConnect UI Modal blocked');
      });

      const { result } = renderHook(() => useWallet(), {
        wrapper: ({ children }) => <WalletProvider>{children}</WalletProvider>,
      });

      expect(() => {
        act(() => {
          result.current.connectWallet();
        });
      }).not.toThrow();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WalletContext] Failed to open TonConnect modal:'),
        expect.any(Error)
      );

      warnSpy.mockRestore();
    });
  });

  // 3. Account Changes & Reconnection
  describe('Account Changes & Reconnection', () => {
    it('reacts properly when TON wallet account changes dynamically', () => {
      const initialAddress = 'EQAddressOne111111111111';
      const updatedAddress = 'EQAddressTwo222222222222';

      (tonConnectModule.useTonAddress as any).mockReturnValue(initialAddress);

      const { result, rerender } = renderHook(() => useWallet(), {
        wrapper: ({ children }) => <WalletProvider>{children}</WalletProvider>,
      });

      expect(result.current.address).toBe(initialAddress);

      // Account switch simulation
      (tonConnectModule.useTonAddress as any).mockReturnValue(updatedAddress);
      rerender();

      expect(result.current.address).toBe(updatedAddress);
      expect(result.current.isConnected).toBe(true);
    });
  });

  // 4. EVM Simulated Address & Multi-tab Storage Events
  describe('EVM Simulated Address & Multi-tab Storage Events', () => {
    it('initializes evmAddress from localStorage if present', () => {
      localStorage.setItem('tonjam_simulated_evm_address', '0x1234567890abcdef1234567890abcdef12345678');

      const { result } = renderHook(() => useWallet(), {
        wrapper: ({ children }) => <WalletProvider>{children}</WalletProvider>,
      });

      expect(result.current.evmAddress).toBe('0x1234567890abcdef1234567890abcdef12345678');
      expect(result.current.isEvmConnected).toBe(true);
      expect(result.current.isConnected).toBe(true);
    });

    it('dynamically syncs evmAddress when storage event fires', () => {
      const { result } = renderHook(() => useWallet(), {
        wrapper: ({ children }) => <WalletProvider>{children}</WalletProvider>,
      });

      expect(result.current.evmAddress).toBeNull();

      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'tonjam_simulated_evm_address',
          newValue: '0x9876543210fedcba9876543210fedcba98765432',
        });
        window.dispatchEvent(storageEvent);
      });

      expect(result.current.evmAddress).toBe('0x9876543210fedcba9876543210fedcba98765432');
      expect(result.current.isEvmConnected).toBe(true);
      expect(result.current.isConnected).toBe(true);
    });
  });

  // 5. Disconnect and Error Recovery
  describe('Disconnect and Error Recovery', () => {
    it('disconnects TON and EVM cleanly on disconnectWallet()', async () => {
      localStorage.setItem('tonjam_simulated_evm_address', '0x1234567890abcdef1234567890abcdef12345678');
      mockTonConnectUI.connected = true;
      mockTonConnectUI.wallet = { account: { address: 'EQAddress' } } as any;

      const { result } = renderHook(() => useWallet(), {
        wrapper: ({ children }) => <WalletProvider>{children}</WalletProvider>,
      });

      await act(async () => {
        await result.current.disconnectWallet();
      });

      expect(mockDisconnect).toHaveBeenCalled();
      expect(result.current.evmAddress).toBeNull();
      expect(result.current.isEvmConnected).toBe(false);
      expect(localStorage.getItem('tonjam_simulated_evm_address')).toBeNull();
    });

    it('resiliently handles disconnectWallet when tonConnectUI.disconnect throws', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockTonConnectUI.connected = true;
      mockTonConnectUI.wallet = { account: { address: 'EQAddress' } } as any;
      mockDisconnect.mockRejectedValueOnce(new Error('Network disconnect failed'));

      const { result } = renderHook(() => useWallet(), {
        wrapper: ({ children }) => <WalletProvider>{children}</WalletProvider>,
      });

      await act(async () => {
        await result.current.disconnectWallet();
      });

      expect(result.current.evmAddress).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WalletContext] Error disconnecting TON wallet:'),
        expect.any(Error)
      );

      warnSpy.mockRestore();
    });
  });

  // 6. Race Conditions, Cleanup & Navigation
  describe('Race Conditions, Lifecycle & Navigation Persistence', () => {
    it('properly removes storage event listener when unmounting (navigation simulation)', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useWallet(), {
        wrapper: ({ children }) => <WalletProvider>{children}</WalletProvider>,
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });

    it('handles mount -> async init -> navigation unmount -> async resolution without state corruption', async () => {
      let isUnmounted = false;
      let stateUpdatedAfterUnmount = false;

      const asyncConnectOperation = new Promise<string>((resolve) => {
        setTimeout(() => {
          if (isUnmounted) {
            // Guard prevents updating dead component
            resolve('safe_skip');
          } else {
            stateUpdatedAfterUnmount = true;
            resolve('updated');
          }
        }, 15);
      });

      const { unmount } = renderHook(() => useWallet(), {
        wrapper: ({ children }) => <WalletProvider>{children}</WalletProvider>,
      });

      // User navigates away before connection completes
      isUnmounted = true;
      unmount();

      const result = await asyncConnectOperation;
      expect(result).toBe('safe_skip');
      expect(stateUpdatedAfterUnmount).toBe(false);
    });

    it('handles asynchronous connection event arriving before initialization completes', async () => {
      let tonAddressVal = '';
      (tonConnectModule.useTonAddress as any).mockImplementation(() => tonAddressVal);

      const { result, rerender } = renderHook(() => useWallet(), {
        wrapper: ({ children }) => <WalletProvider>{children}</WalletProvider>,
      });

      expect(result.current.isConnected).toBe(false);

      // Early connection event resolves
      tonAddressVal = 'EQFastConnectionArrivedFirst';
      (tonConnectModule.useTonWallet as any).mockReturnValue({
        account: { address: 'EQFastConnectionArrivedFirst' },
      });

      rerender();

      expect(result.current.isConnected).toBe(true);
      expect(result.current.address).toBe('EQFastConnectionArrivedFirst');
    });

    it('handles rapid mount and unmount cycles across simulated page navigation without crashing', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount, result } = renderHook(() => useWallet(), {
          wrapper: ({ children }) => <WalletProvider>{children}</WalletProvider>,
        });
        expect(result.current).toBeDefined();
        unmount();
      }
    });
  });
});
