import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PriceAlertModal from '@/components/PriceAlertModal';
import { priceAlertService } from '@/services/priceAlertService';
import { notificationService } from '@/services/notificationService';
import { NFTItem, PriceAlert } from '@/types';

// Polyfill ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver as any;

// Mock dependencies
const mockAddNotification = vi.fn();
const mockAddPriceAlert = vi.fn();
const mockRemovePriceAlert = vi.fn();
const mockSimulatePriceDrop = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'test-user-123', email: 'test@tonjam.com' } }),
}));

vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => ({
    addNotification: mockAddNotification,
    userProfile: { uid: 'test-user-123', walletAddress: 'UQ_TEST_WALLET_123' },
  }),
}));

vi.mock('@/contexts/NotificationContext', () => ({
  useNotification: () => ({
    addPriceAlert: mockAddPriceAlert,
    removePriceAlert: mockRemovePriceAlert,
    simulatePriceDrop: mockSimulatePriceDrop,
    priceAlerts: [],
  }),
}));

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    doc: vi.fn(),
    setDoc: vi.fn().mockResolvedValue(undefined),
    deleteDoc: vi.fn().mockResolvedValue(undefined),
    updateDoc: vi.fn().mockResolvedValue(undefined),
  };
});

describe('PriceAlert Modal & Subscription Architecture', () => {
  const sampleNFT: NFTItem = {
    id: 'nft-vinyl-777',
    trackId: 'track-777',
    title: 'Neon Horizon Single',
    creator: 'DJ Cyberton',
    artist: 'DJ Cyberton',
    owner: 'UQ_OWNER_WALLET',
    price: '20.00 TON',
    imageUrl: 'https://example.com/cover.jpg',
    edition: '1 of 50',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('1. priceAlertService', () => {
    it('saves and retrieves price alerts by user and NFT', async () => {
      const alert: PriceAlert = {
        id: 'alert-1',
        userId: 'test-user-123',
        nftId: 'nft-vinyl-777',
        nftTitle: 'Neon Horizon Single',
        nftImageUrl: 'https://example.com/cover.jpg',
        targetPrice: '15.00',
        condition: 'below',
        status: 'active',
        channels: ['app', 'push'],
        createdAt: new Date().toISOString(),
      };

      await priceAlertService.saveAlert(alert);

      const alerts = priceAlertService.getAlerts('test-user-123');
      expect(alerts.length).toBe(1);
      expect(alerts[0].nftId).toBe('nft-vinyl-777');

      const found = priceAlertService.getAlertForNFT('test-user-123', 'nft-vinyl-777');
      expect(found).toBeDefined();
      expect(found?.targetPrice).toBe('15.00');
    });

    it('triggers notification when NFT price drops to or below target', async () => {
      const addNotifSpy = vi.spyOn(notificationService, 'addNotification');

      const alert: PriceAlert = {
        id: 'alert-trigger-test',
        userId: 'test-user-123',
        nftId: 'nft-vinyl-777',
        nftTitle: 'Neon Horizon Single',
        nftImageUrl: 'https://example.com/cover.jpg',
        targetPrice: '14.00',
        condition: 'below',
        status: 'active',
        channels: ['app', 'push'],
        createdAt: new Date().toISOString(),
      };

      await priceAlertService.saveAlert(alert);

      // Trigger with price dropped to 12 TON (<= 14.00 TON target)
      const triggered = await priceAlertService.checkAndTriggerPriceAlerts(
        'nft-vinyl-777',
        12.00,
        sampleNFT
      );

      expect(triggered.length).toBe(1);
      expect(triggered[0].id).toBe('alert-trigger-test');
      expect(addNotifSpy).toHaveBeenCalled();
      expect(addNotifSpy).toHaveBeenCalledWith(
        'test-user-123',
        expect.objectContaining({
          type: 'price_drop',
          link: '/nft/nft-vinyl-777',
        })
      );
    });

    it('deletes price alert correctly', async () => {
      const alert: PriceAlert = {
        id: 'alert-to-delete',
        userId: 'test-user-123',
        nftId: 'nft-vinyl-777',
        nftTitle: 'Neon Horizon Single',
        nftImageUrl: 'https://example.com/cover.jpg',
        targetPrice: '10.00',
        condition: 'below',
        status: 'active',
        channels: ['app'],
        createdAt: new Date().toISOString(),
      };

      await priceAlertService.saveAlert(alert);
      expect(priceAlertService.getAlerts('test-user-123').length).toBe(1);

      await priceAlertService.deleteAlert('test-user-123', 'alert-to-delete');
      expect(priceAlertService.getAlerts('test-user-123').length).toBe(0);
    });
  });

  describe('2. PriceAlertModal Component', () => {
    it('renders modal with NFT details, current floor price, and discount presets', () => {
      render(
        <PriceAlertModal
          isOpen={true}
          onClose={vi.fn()}
          nft={sampleNFT}
        />
      );

      expect(screen.getByText('Neon Horizon Single')).toBeDefined();
      expect(screen.getByText(/Current Floor: 20 TON/i)).toBeDefined();
      expect(screen.getByText('-10%')).toBeDefined();
      expect(screen.getByText('-20%')).toBeDefined();
      expect(screen.getByText('-50%')).toBeDefined();
    });

    it('applies discount presets when clicked', () => {
      render(
        <PriceAlertModal
          isOpen={true}
          onClose={vi.fn()}
          nft={sampleNFT}
        />
      );

      const minusTwenty = screen.getByText('-20%');
      fireEvent.click(minusTwenty);

      // 20 TON * (1 - 0.20) = 16.00 TON
      const input = screen.getByLabelText(/Target Price/i) as HTMLInputElement;
      expect(input.value).toBe('16.00');
    });

    it('subscribes to price drop alert on submit and triggers notification confirmation', async () => {
      const onClose = vi.fn();
      render(
        <PriceAlertModal
          isOpen={true}
          onClose={onClose}
          nft={sampleNFT}
        />
      );

      const submitBtn = screen.getByRole('button', { name: /Set Price Alert/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockAddPriceAlert).toHaveBeenCalled();
        expect(mockAddNotification).toHaveBeenCalledWith(
          expect.stringContaining('Price alert activated for "Neon Horizon Single"'),
          'success'
        );
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('allows testing simulated price drop', () => {
      const onClose = vi.fn();
      render(
        <PriceAlertModal
          isOpen={true}
          onClose={onClose}
          nft={sampleNFT}
        />
      );

      const testDropBtn = screen.getByRole('button', { name: /Test Price Drop/i });
      fireEvent.click(testDropBtn);

      expect(onClose).toHaveBeenCalled();
    });
  });
});
