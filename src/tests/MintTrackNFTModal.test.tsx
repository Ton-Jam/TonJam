import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as storageService from '@/services/storageService';
import * as tonService from '@/services/tonService';
import { Track, NFTItem } from '@/types';

const mockOpenWalletModal = vi.fn();
const mockSetIsMinting = vi.fn();
const mockUpdateMintingStatus = vi.fn();
const mockRemoveMintingStatus = vi.fn();
const mockAddNFT = vi.fn();
const mockGetNFTByTrackId = vi.fn();
const mockAddUserTrack = vi.fn().mockResolvedValue(undefined);
const mockAddUserNFT = vi.fn().mockResolvedValue(undefined);
const mockAddNotification = vi.fn();
const mockCreateActivityPost = vi.fn().mockResolvedValue(undefined);

const sampleTrack: Track = {
  id: 'track-artist-1',
  songId: 'song-artist-1',
  title: 'Solar Echoes',
  artist: 'Nova Pulse',
  artistId: 'artist-uid-1',
  coverUrl: 'https://example.com/solar-cover.jpg',
  audioUrl: 'https://example.com/solar-master.mp3',
  duration: 210,
  genre: 'Synthwave',
  isNFT: false,
  price: '4.5',
  editions: '15',
  createdAt: '2026-01-01T00:00:00.000Z',
};

let mockWalletAddress = 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt';
let mockMintingStatusMap: Record<string, any> = {};

vi.mock('@tonconnect/ui-react', () => ({
  useTonConnectUI: () => [
    {
      connected: Boolean(mockWalletAddress),
      wallet: mockWalletAddress
        ? { account: { address: mockWalletAddress, chain: '-239' } }
        : null,
      openModal: mockOpenWalletModal,
    },
  ],
  useTonAddress: () => mockWalletAddress,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'artist-uid-1' },
    loading: false,
  }),
}));

vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => ({
    allTracks: [sampleTrack],
    userProfile: {
      uid: 'artist-uid-1',
      name: 'Nova Pulse',
      username: 'novapulse',
      avatar: 'https://example.com/avatar.jpg',
      walletAddress: mockWalletAddress,
      isVerifiedArtist: true,
    },
    addUserTrack: mockAddUserTrack,
    addUserNFT: mockAddUserNFT,
    addNotification: mockAddNotification,
  }),
}));

vi.mock('@/contexts/NFTContext', () => ({
  useNFT: () => ({
    nfts: [],
    loading: false,
    isMinting: false,
    setIsMinting: mockSetIsMinting,
    mintingStatus: mockMintingStatusMap,
    updateMintingStatus: mockUpdateMintingStatus,
    removeMintingStatus: mockRemoveMintingStatus,
    addNFT: mockAddNFT,
    getNFTByTrackId: mockGetNFTByTrackId,
  }),
}));

vi.mock('@/services/socialService', () => ({
  createActivityPost: (...args: any[]) => mockCreateActivityPost(...args),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'artist-uid-1' } },
  storage: {},
}));

vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual<any>('@/lib/utils');
  return {
    ...actual,
    compressImageForNFT: vi.fn(async (file: File) => file),
  };
});

import { MintTrackNFTModal } from '@/components/artist/MintTrackNFTModal';
import { MintNFTButton } from '@/pages/Profile/artist/MintNFTButton';

describe('MintTrackNFTModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWalletAddress = 'EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt';
    mockMintingStatusMap = {};
    mockGetNFTByTrackId.mockReturnValue(undefined);

    if (!URL.createObjectURL) {
      URL.createObjectURL = vi.fn(() => 'blob:mock-preview');
    } else {
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-preview');
    }

    vi.spyOn(storageService, 'getPinataStatus').mockResolvedValue({
      configured: true,
      authMode: 'jwt',
      hasJwt: true,
      hasApiKeyPair: false,
      authenticated: true,
      maxFileSizeBytes: 50 * 1024 * 1024,
      gatewayBaseUrl: 'https://gateway.pinata.cloud/ipfs',
    });

    vi.spyOn(storageService, 'uploadToPinata').mockImplementation(async (file, onProgress) => {
      onProgress?.(100);
      if (file.type.startsWith('audio/')) {
        return 'https://gateway.pinata.cloud/ipfs/QmAudioMasterCID123456789';
      }
      return 'https://gateway.pinata.cloud/ipfs/QmCoverArtCID987654321';
    });

    vi.spyOn(storageService, 'uploadJSONToPinata').mockImplementation(async (_json, onProgress) => {
      onProgress?.(100);
      return 'https://gateway.pinata.cloud/ipfs/QmMetadataJsonCID555666';
    });

    vi.spyOn(tonService, 'getEstimatedGasFee').mockResolvedValue(0.085);
    vi.spyOn(tonService, 'mintTonJamNFT').mockResolvedValue('ton-tx-hash-abcdef123456');
  });

  it('checks Pinata IPFS configuration on open, pre-fills catalog track, and renders without border lines', async () => {
    render(
      <MemoryRouter>
        <MintTrackNFTModal
          isOpen={true}
          onClose={vi.fn()}
          preselectedTrack={sampleTrack}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(storageService.getPinataStatus).toHaveBeenCalledWith(true);
    });

    expect(await screen.findByText('Pinata IPFS Ready')).toBeTruthy();
    expect(screen.getByText('JWT Auth')).toBeTruthy();

    const titleInput = screen.getByLabelText('NFT Title') as HTMLInputElement;
    expect(titleInput.value).toBe('Solar Echoes');

    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('border-0');
    expect(dialog.className).toContain('ring-0');
    // Ensure no border-* utility classes exist inside the modal content
    const borderedEls = Array.from(dialog.querySelectorAll('*')).filter((el) =>
      /\bborder(-[a-z0-9/[\]-]+)?\b/.test(el.className || '') && !/\bborder-0\b/.test(el.className || '')
    );
    expect(borderedEls.length).toBe(0);
  });

  it('uploads audio/cover to Pinata, pins TEP-64 metadata JSON, mints on TON, and registers via NFTProvider', async () => {
    const onSuccess = vi.fn();

    render(
      <MemoryRouter>
        <MintTrackNFTModal isOpen={true} onClose={vi.fn()} onSuccess={onSuccess} />
      </MemoryRouter>
    );

    await screen.findByText('Pinata IPFS Ready');

    // Switch to Upload New Track mode to verify full Pinata file upload + JSON metadata flow
    fireEvent.click(screen.getByRole('button', { name: /Upload New Track/i }));

    const audioFile = new File(['audio-bytes'], 'deep-orbit.mp3', { type: 'audio/mpeg' });
    const coverFile = new File(['cover-bytes'], 'deep-orbit.png', { type: 'image/png' });

    fireEvent.change(screen.getByLabelText('Upload audio master'), {
      target: { files: [audioFile] },
    });
    fireEvent.change(screen.getByLabelText('Upload cover artwork'), {
      target: { files: [coverFile] },
    });

    fireEvent.change(screen.getByLabelText('NFT Title'), {
      target: { value: 'Deep Orbit' },
    });
    fireEvent.change(screen.getByLabelText('Price (TON)'), {
      target: { value: '6.5' },
    });
    fireEvent.change(screen.getByLabelText('Editions'), {
      target: { value: '40' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Pin & Mint NFT/i }));

    await waitFor(() => {
      expect(mockAddNFT).toHaveBeenCalledTimes(1);
    });

    expect(storageService.uploadToPinata).toHaveBeenCalledTimes(2);
    expect(storageService.uploadJSONToPinata).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Deep Orbit',
        image: 'https://gateway.pinata.cloud/ipfs/QmCoverArtCID987654321',
        animation_url: 'https://gateway.pinata.cloud/ipfs/QmAudioMasterCID123456789',
      }),
      expect.any(Function)
    );

    expect(tonService.mintTonJamNFT).toHaveBeenCalledWith(
      expect.anything(),
      mockWalletAddress,
      'https://gateway.pinata.cloud/ipfs/QmMetadataJsonCID555666'
    );

    expect(mockSetIsMinting).toHaveBeenCalledWith(true);
    expect(mockSetIsMinting).toHaveBeenLastCalledWith(false);
    expect(mockUpdateMintingStatus).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ step: 'completed', progress: 100 })
    );

    const registeredNFT: NFTItem = mockAddNFT.mock.calls[0][0];
    expect(registeredNFT.title).toBe('Deep Orbit');
    expect(registeredNFT.ipfsUrl).toBe('https://gateway.pinata.cloud/ipfs/QmMetadataJsonCID555666');
    expect(registeredNFT.audioIpfsUrl).toBe('https://gateway.pinata.cloud/ipfs/QmAudioMasterCID123456789');
    expect(registeredNFT.creatorId).toBe('artist-uid-1');

    expect(mockAddUserTrack).toHaveBeenCalled();
    expect(mockAddUserNFT).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(registeredNFT);
    expect(await screen.findByText('Minted on TON & Pinned to IPFS')).toBeTruthy();
  });

  it('prevents duplicate minting when selected track already has an NFT in NFTProvider', async () => {
    mockGetNFTByTrackId.mockReturnValue({
      id: 'nft-existing-1',
      trackId: sampleTrack.id,
      title: 'Solar Echoes Genesis',
      owner: mockWalletAddress,
      creator: 'Nova Pulse',
      price: '4.5',
      imageUrl: sampleTrack.coverUrl,
      edition: '1 of 15',
    });

    render(
      <MemoryRouter>
        <MintTrackNFTModal
          isOpen={true}
          onClose={vi.fn()}
          preselectedTrack={sampleTrack}
        />
      </MemoryRouter>
    );

    expect(await screen.findByText(/already minted as NFT/i)).toBeTruthy();
    const mintBtn = screen.getByRole('button', { name: /Pin & Mint NFT/i }) as HTMLButtonElement;
    expect(mintBtn.disabled).toBe(true);
  });

  it('validates royalty splits sum to 100% and handles Pinata failures cleanly', async () => {
    vi.spyOn(storageService, 'uploadJSONToPinata').mockRejectedValueOnce(
      new Error('Pinata gateway timeout')
    );

    render(
      <MemoryRouter>
        <MintTrackNFTModal
          isOpen={true}
          onClose={vi.fn()}
          preselectedTrack={sampleTrack}
        />
      </MemoryRouter>
    );

    await screen.findByText('Pinata IPFS Ready');

    // Change royalty split to 70% so validation rejects
    fireEvent.change(screen.getByLabelText('Royalty percentage 1'), {
      target: { value: '70' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Pin & Mint NFT/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/must total 100%/i);
    expect(tonService.mintTonJamNFT).not.toHaveBeenCalled();

    // Restore 100% and trigger Pinata JSON error
    fireEvent.change(screen.getByLabelText('Royalty percentage 1'), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Pin & Mint NFT/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Pinata gateway timeout/i);
    });
    expect(mockSetIsMinting).toHaveBeenLastCalledWith(false);
  });

  it('opens MintTrackNFTModal when clicking MintNFTButton on artist profile', async () => {
    render(
      <MemoryRouter>
        <MintNFTButton />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Mint Music NFT/i }));

    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(await screen.findByText('Mint Track as NFT')).toBeTruthy();
  });
});
