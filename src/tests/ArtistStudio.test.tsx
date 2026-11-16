import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as tonService from '@/services/tonService';
import {
  TON_MAINNET_CONFIG,
  TON_TESTNET_CONFIG,
  mintTonJamNFT,
} from '@/services/tonService';
import * as storageService from '@/services/storageService';
import { beginCell } from '@ton/ton';

const mockSendTransaction = vi.fn();
const mockOpenModal = vi.fn();
const mockAddUserTrack = vi.fn().mockResolvedValue(undefined);
const mockAddUserNFT = vi.fn().mockResolvedValue(undefined);
const mockSetUserProfile = vi.fn();
const mockRefreshProfile = vi.fn().mockResolvedValue(undefined);
const mockAddNFT = vi.fn();
const mockPlayTrack = vi.fn();

vi.mock('@tonconnect/ui-react', () => ({
  useTonConnectUI: () => [
    {
      connected: true,
      wallet: {
        account: {
          address: 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt',
          chain: '-239',
        },
      },
      sendTransaction: mockSendTransaction,
      openModal: mockOpenModal,
    },
  ],
  useTonAddress: () => 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt',
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'artist-uid-1' },
    loading: false,
    refreshProfile: mockRefreshProfile,
  }),
}));

vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => ({
    userProfile: {
      uid: 'artist-uid-1',
      name: 'Nova Pulse',
      walletAddress: 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt',
      isVerifiedArtist: true,
    },
    setUserProfile: mockSetUserProfile,
    addUserTrack: mockAddUserTrack,
    addUserNFT: mockAddUserNFT,
    playTrack: mockPlayTrack,
  }),
}));

vi.mock('@/contexts/NFTContext', () => ({
  useNFT: () => ({
    addNFT: mockAddNFT,
  }),
}));

vi.mock('@/services/socialService', () => ({
  createActivityPost: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<any>('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn((_db, name) => ({ path: name })),
    query: vi.fn((colRef) => colRef),
    where: vi.fn(),
    doc: vi.fn((_db, col, id) => ({ path: `${col}/${id}` })),
    setDoc: vi.fn().mockResolvedValue(undefined),
    updateDoc: vi.fn().mockResolvedValue(undefined),
    onSnapshot: vi.fn((_q, onNext) => {
      onNext({ docs: [] });
      return vi.fn();
    }),
  };
});

vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: { currentUser: null },
  storage: {},
  OperationType: { LIST: 'list', CREATE: 'create', UPDATE: 'update', WRITE: 'write' },
  handleFirestoreError: vi.fn(),
}));

import { updateDoc, setDoc } from 'firebase/firestore';
import { ArtistStudio } from '@/pages/ArtistStudio';

describe('Artist Studio & Pinata + TON Collection Minting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const dummyCell = beginCell().storeUint(0x11223344, 32).endCell();
    mockSendTransaction.mockResolvedValue({
      boc: dummyCell.toBoc().toString('base64'),
    });

    vi.spyOn(storageService, 'getPinataStatus').mockResolvedValue({
      configured: true,
      authMode: 'jwt',
      hasJwt: true,
      hasApiKeyPair: false,
      authenticated: true,
      maxFileSizeBytes: 50 * 1024 * 1024,
      gatewayBaseUrl: 'https://gateway.pinata.cloud/ipfs',
    });

    vi.spyOn(tonService, 'confirmTonTransaction').mockImplementation(
      async (_targetAddr, txHash, _network, options) => {
        options?.onUpdate?.({
          phase: 'polling',
          attempt: 1,
          maxAttempts: 6,
          elapsedMs: 120,
        });
        const confirmedUpdate: tonService.TonTxConfirmationUpdate = {
          phase: 'confirmed',
          attempt: 2,
          maxAttempts: 6,
          elapsedMs: 1400,
          confirmedTxHash: txHash,
          blockTime: Math.floor(Date.now() / 1000),
        };
        options?.onUpdate?.(confirmedUpdate);
        return confirmedUpdate;
      }
    );
  });

  it('mints to a caller-specified TON collection contract address and network', async () => {
    const dummyCell = beginCell().storeUint(0xabcdef01, 32).endCell();
    const tonConnectMock: any = {
      connected: true,
      wallet: {
        account: {
          address: 'kQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4Tp6n',
          chain: '-3',
        },
      },
      sendTransaction: vi.fn().mockResolvedValue({
        boc: dummyCell.toBoc().toString('base64'),
      }),
      openModal: vi.fn(),
    };

    const customCollection = TON_TESTNET_CONFIG.collectionAddress;
    const txHash = await mintTonJamNFT(
      tonConnectMock,
      'kQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4Tp6n',
      'https://gateway.pinata.cloud/ipfs/QmTestAudioMetadata123',
      {
        collectionAddress: customCollection,
        network: 'testnet',
      }
    );

    expect(txHash).toBe(dummyCell.hash().toString('hex'));
    expect(tonConnectMock.sendTransaction).toHaveBeenCalledTimes(1);
    const sentTx = tonConnectMock.sendTransaction.mock.calls[0][0];
    expect(sentTx.messages[0].address).toBe(customCollection);
  });

  it('renders Artist Studio with Pinata status, TON collection contract, real-time 3-pillar tracker, and zero border lines', async () => {
    const { container } = render(
      <MemoryRouter>
        <ArtistStudio />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Pinata Ready \(JWT\)/i)).toBeDefined();
    });

    expect(screen.getByText('Artist Studio')).toBeDefined();
    expect(screen.getByText('Target TON Collection Contract')).toBeDefined();
    expect(screen.getByText(TON_MAINNET_CONFIG.collectionAddress)).toBeDefined();

    // Verify 3-pillar real-time progress tracker headings
    const tracker = screen.getByTestId('mint-progress-tracker');
    expect(tracker).toBeDefined();
    expect(screen.getByTestId('pillar-ipfs').textContent).toContain('IPFS Uploading');
    expect(screen.getByTestId('pillar-metadata').textContent).toContain('Metadata Pinning');
    expect(screen.getByTestId('pillar-ton').textContent).toContain('TON Confirmation');

    // Verify no visible border-line utility classes are applied
    const html = container.innerHTML;
    expect(html).not.toMatch(/\bborder-(white|slate|zinc|blue|emerald|rose|amber|gray|neutral|black)\b/);
    expect(html).not.toMatch(/\bdivide-[xy]\b/);
  });

  it('switches default protocol collection contract when toggling Mainnet to Testnet', async () => {
    render(
      <MemoryRouter>
        <ArtistStudio />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(TON_MAINNET_CONFIG.collectionAddress)).toBeDefined();
    });

    const testnetBtn = screen.getByRole('button', { name: 'Testnet' });
    fireEvent.click(testnetBtn);

    expect(screen.getByText(TON_TESTNET_CONFIG.collectionAddress)).toBeDefined();
    expect(screen.getByText(/TonJam Protocol Collection \(Testnet\)/i)).toBeDefined();
  });

  it('executes full Pinata IPFS pinning and TON collection mint pipeline with real-time progress telemetry', async () => {
    const uploadFileSpy = vi
      .spyOn(storageService, 'uploadToPinata')
      .mockImplementationOnce(async (_file, onProgress) => {
        onProgress?.(45);
        onProgress?.(100);
        return 'https://gateway.pinata.cloud/ipfs/QmAudioHash1234567890123456789012345678901234';
      })
      .mockImplementationOnce(async (_file, onProgress) => {
        onProgress?.(60);
        onProgress?.(100);
        return 'https://gateway.pinata.cloud/ipfs/QmCoverHash1234567890123456789012345678901234';
      });

    const uploadJsonSpy = vi
      .spyOn(storageService, 'uploadJSONToPinata')
      .mockResolvedValueOnce(
        'https://gateway.pinata.cloud/ipfs/QmMetaHash12345678901234567890123456789012345'
      );

    const { container } = render(
      <MemoryRouter>
        <ArtistStudio />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Pinata Ready/i)).toBeDefined();
    });

    // Supply audio file via hidden input
    const audioInput = document.querySelector('input[type="file"][accept*="audio"]') as HTMLInputElement;
    const mockAudio = new File(['audio-bytes'], 'deep-horizon.mp3', { type: 'audio/mpeg' });
    fireEvent.change(audioInput, { target: { files: [mockAudio] } });

    // Supply cover file via hidden input
    const imageInput = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement;
    const mockCover = new File(['image-bytes'], 'horizon-cover.png', { type: 'image/png' });
    fireEvent.change(imageInput, { target: { files: [mockCover] } });

    const mintButton = await screen.findByRole('button', {
      name: /Pin to Pinata & Mint NFT on TON/i,
    });
    expect((mintButton as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(mintButton);

    await waitFor(() => {
      expect(uploadJsonSpy).toHaveBeenCalledTimes(1);
    });

    expect(uploadFileSpy).toHaveBeenCalledTimes(2);
    expect(mockSendTransaction).toHaveBeenCalledTimes(1);
    const txPayload = mockSendTransaction.mock.calls[0][0];
    expect(txPayload.messages[0].address).toBe(TON_MAINNET_CONFIG.collectionAddress);

    await waitFor(() => {
      expect(mockAddUserTrack).toHaveBeenCalledTimes(1);
      expect(mockAddUserNFT).toHaveBeenCalledTimes(1);
      expect(mockAddNFT).toHaveBeenCalledTimes(1);
    });

    // Verify real-time telemetry reached 100% and TON block confirmation poll completed
    const receipt = await screen.findByTestId('mint-success-receipt');
    expect(receipt.textContent).toContain('Verified (Poll #2)');
    expect(screen.getByTestId('overall-progress-pct').textContent).toBe('100%');
    expect(screen.getByTestId('pillar-ipfs').textContent).toContain('100%');
    expect(screen.getByTestId('pillar-metadata').textContent).toContain('100%');
    expect(screen.getByTestId('pillar-ton').textContent).toContain('100%');

    // Ensure zero border-line classes exist in completed state either
    const html = container.innerHTML;
    expect(html).not.toMatch(/\bborder-(white|slate|zinc|blue|emerald|rose|amber|gray|neutral|black)\b/);
    expect(html).not.toMatch(/\bdivide-[xy]\b/);
  });

  it('uploads, crops, pins artist profile banner to Pinata, and updates Firestore artist profile', async () => {
    const pinnedBannerUrl =
      'https://gateway.pinata.cloud/ipfs/QmBannerHash9876543210987654321098765432109876';

    const uploadBannerSpy = vi
      .spyOn(storageService, 'uploadToPinata')
      .mockImplementationOnce(async (_file, onProgress) => {
        onProgress?.(55);
        onProgress?.(100);
        return pinnedBannerUrl;
      });

    const { container } = render(
      <MemoryRouter>
        <ArtistStudio />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Pinata Ready/i)).toBeDefined();
    });

    // Open Profile Banner Cropper studio panel
    const openBtn = screen.getByTestId('open-banner-cropper-btn');
    fireEvent.click(openBtn);

    const cropperPanel = await screen.findByTestId('banner-cropper-panel');
    expect(cropperPanel).toBeDefined();

    // Switch aspect preset & select a wide banner image
    fireEvent.click(screen.getByRole('button', { name: /16:5 Ultra-Wide/i }));
    const bannerInput = screen.getByTestId('banner-file-input') as HTMLInputElement;
    const mockBannerFile = new File(['banner-pixels'], 'studio-stage.png', {
      type: 'image/png',
    });
    fireEvent.change(bannerInput, { target: { files: [mockBannerFile] } });

    // Adjust zoom & rotation controls before saving
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    fireEvent.click(screen.getByRole('button', { name: '+90°' }));

    const saveBannerBtn = screen.getByTestId('save-cropped-banner-btn');
    expect((saveBannerBtn as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(saveBannerBtn);

    await waitFor(() => {
      expect(uploadBannerSpy).toHaveBeenCalledTimes(1);
    });

    const receipt = await screen.findByTestId('banner-save-receipt');
    expect(receipt.textContent).toContain('Banner pinned');

    // Verify Firestore user & artist profile document updates
    expect(updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'users/artist-uid-1' }),
      expect.objectContaining({
        bannerUrl: pinnedBannerUrl,
        bannerImageUrl: pinnedBannerUrl,
        coverPhoto: pinnedBannerUrl,
        bannerIpfsCid: 'QmBannerHash9876543210987654321098765432109876',
      })
    );

    expect(setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'artists/artist-uid-1' }),
      expect.objectContaining({
        uid: 'artist-uid-1',
        bannerUrl: pinnedBannerUrl,
        bannerImageUrl: pinnedBannerUrl,
      }),
      { merge: true }
    );

    expect(mockSetUserProfile).toHaveBeenCalled();
    expect(mockRefreshProfile).toHaveBeenCalledTimes(1);

    // Zero border lines in banner cropper UI
    const html = container.innerHTML;
    expect(html).not.toMatch(/\bborder-(white|slate|zinc|blue|emerald|rose|amber|gray|neutral|black)\b/);
    expect(html).not.toMatch(/\bdivide-[xy]\b/);
  });
});


