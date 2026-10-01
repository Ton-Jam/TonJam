import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GasFeeEstimator } from '@/components/GasFeeEstimator';
import * as tonGasService from '@/services/tonGasService';

// Polyfill ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver as any;

describe('Real-Time Gas Fee Estimator Component & Service', () => {
  const mockGasData: tonGasService.GasFeeEstimatorData = {
    congestion: {
      level: 'low',
      levelLabel: 'Optimal',
      latencyMs: 95,
      masterchainSeqno: 96094300,
      blockTimeSec: 2.8,
      estimatedTps: 48,
      gasPriceMultiplier: 1.0,
      statusMessage: 'Network traffic is clear. Optimal time for music NFT minting.',
      lastUpdated: new Date('2026-09-30T12:00:00Z'),
      nodeEndpoint: 'Orbs Decentralized RPC',
    },
    tonPriceUSD: 5.20,
    tiers: {
      eco: {
        tier: 'eco',
        tierName: 'Standard',
        tagline: 'Lowest Cost',
        description: 'Standard block execution.',
        estimatedConfirmationSec: 6,
        computeFeeTON: 0.025,
        storageFeeTON: 0.018,
        forwardFeeTON: 0.008,
        bufferFeeTON: 0.012,
        totalAttachedTON: 0.063,
        estimatedRefundTON: 0.018,
        netCostTON: 0.045,
        totalAttachedUSD: 0.328,
        estimatedRefundUSD: 0.094,
        netCostUSD: 0.234,
      },
      fast: {
        tier: 'fast',
        tierName: 'Fast',
        tagline: 'Recommended',
        description: 'Next block inclusion.',
        estimatedConfirmationSec: 3,
        computeFeeTON: 0.0288,
        storageFeeTON: 0.018,
        forwardFeeTON: 0.0092,
        bufferFeeTON: 0.024,
        totalAttachedTON: 0.08,
        estimatedRefundTON: 0.027,
        netCostTON: 0.053,
        totalAttachedUSD: 0.416,
        estimatedRefundUSD: 0.140,
        netCostUSD: 0.276,
      },
      priority: {
        tier: 'priority',
        tierName: 'Priority',
        tagline: 'Instant Inclusion',
        description: 'Maximum buffer for peak traffic.',
        estimatedConfirmationSec: 2,
        computeFeeTON: 0.0363,
        storageFeeTON: 0.018,
        forwardFeeTON: 0.0116,
        bufferFeeTON: 0.045,
        totalAttachedTON: 0.1109,
        estimatedRefundTON: 0.048,
        netCostTON: 0.0629,
        totalAttachedUSD: 0.577,
        estimatedRefundUSD: 0.250,
        netCostUSD: 0.327,
      },
    },
    recommendedTier: 'fast',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(tonGasService, 'getGasFeeEstimatorData').mockResolvedValue(mockGasData);
  });

  it('renders Gas Fee Estimator header and network congestion status', async () => {
    render(<GasFeeEstimator />);

    await waitFor(() => {
      expect(screen.getByText('Gas Fee Estimator')).toBeDefined();
    });

    expect(screen.getByText('Optimal Conditions')).toBeDefined();
    expect(screen.getByText(/Network traffic is clear/i)).toBeDefined();
  });

  it('displays estimated transaction costs for NFT minting with active Fast tier', async () => {
    render(<GasFeeEstimator />);

    await waitFor(() => {
      expect(screen.getAllByText(/0.0800 TON/i).length).toBeGreaterThan(0);
    });

    // Check that net execution cost is displayed
    expect(screen.getByText(/~0.0530 TON/i)).toBeDefined();
  });

  it('allows user to switch speed tiers and updates displayed costs', async () => {
    const onSelectTier = vi.fn();
    render(<GasFeeEstimator onSelectTier={onSelectTier} />);

    await waitFor(() => {
      expect(screen.getByText('Standard')).toBeDefined();
    });

    const ecoButton = screen.getByRole('button', { name: /Standard/i });
    fireEvent.click(ecoButton);

    expect(onSelectTier).toHaveBeenCalledWith('eco', mockGasData.tiers.eco);

    // Verify Standard tier fee is rendered
    expect(screen.getAllByText(/0.0630 TON/i).length).toBeGreaterThan(0);
  });

  it('supports currency toggle between TON and USD', async () => {
    render(<GasFeeEstimator />);

    await waitFor(() => {
      expect(screen.getAllByText(/0.0800 TON/i).length).toBeGreaterThan(0);
    });

    const currencyToggle = screen.getByTitle('Toggle TON / USD display');
    fireEvent.click(currencyToggle);

    // After toggle, values should be formatted in USD
    expect(screen.getAllByText(/\$0\.42/i).length).toBeGreaterThan(0);
  });

  it('expands detailed fee breakdown showing compute, storage, and refund', async () => {
    render(<GasFeeEstimator />);

    await waitFor(() => {
      expect(screen.getByText('NFT Minting Fee Breakdown')).toBeDefined();
    });

    const viewDetailsBtn = screen.getByText('View details');
    fireEvent.click(viewDetailsBtn);

    expect(screen.getByText(/Smart Contract Compute/i)).toBeDefined();
    expect(screen.getByText(/NFT Item Storage Deposit/i)).toBeDefined();
    expect(screen.getByText(/How TON gas refunds work/i)).toBeDefined();
  });

  it('renders minimal variant cleanly for summary sections', async () => {
    render(<GasFeeEstimator variant="minimal" />);

    await waitFor(() => {
      expect(screen.getByText('Mint Gas Fee:')).toBeDefined();
    });

    expect(screen.getByText(/0.0800 TON/i)).toBeDefined();
    expect(screen.getByText('Optimal Conditions')).toBeDefined();
  });

  it('calculates proportional costs for multi-edition batch minting', () => {
    const single = tonGasService.calculateMintEstimates(mockGasData.congestion, 5.0, 1);
    const batchFive = tonGasService.calculateMintEstimates(mockGasData.congestion, 5.0, 5);

    expect(batchFive.fast.totalAttachedTON).toBeGreaterThan(single.fast.totalAttachedTON * 4);
    expect(batchFive.fast.storageFeeTON).toBeCloseTo(single.fast.storageFeeTON * 5, 2);
  });
});
