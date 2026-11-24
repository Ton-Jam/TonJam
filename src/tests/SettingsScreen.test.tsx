import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Settings from '@/pages/Settings';

const mockNavigate = vi.fn();
const mockUpdateDoc = vi.fn().mockResolvedValue(undefined);
const mockConnectWallet = vi.fn();
const mockDisconnectWallet = vi.fn().mockResolvedValue(undefined);
const mockRefreshBalance = vi.fn().mockResolvedValue(undefined);
const mockSignOut = vi.fn();
const mockUpdatePreferences = vi.fn();
const mockRequestPushPermission = vi.fn().mockResolvedValue(true);

let mockWalletState = {
  address: '',
  isConnected: false,
  tonBalance: 0,
  jettonBalance: 0,
  isLoadingBalance: false,
  network: 'mainnet' as const,
  connectWallet: mockConnectWallet,
  disconnectWallet: mockDisconnectWallet,
  refreshBalance: mockRefreshBalance,
};

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockAuthUser = { uid: 'user-1', email: 'artist@tonjam.app' };
const mockAuthProfile = {
  uid: 'user-1',
  name: 'Krupy',
  username: 'krupy',
  bio: 'Electronic producer on TON',
  avatar: 'https://example.com/avatar.jpg',
  coverPhoto: '',
  isVerifiedArtist: true,
  followers: 100,
  following: 12,
  earnings: 50,
  socials: { x: 'https://x.com/krupy', instagram: '' },
  royaltyConfig: { streamingSplits: [], nftSaleSplits: [] },
  collaborators: [],
};
const mockAuthValue = {
  user: mockAuthUser,
  userProfile: mockAuthProfile,
  signOut: mockSignOut,
};

const mockAudioValue = {
  isOffline: false,
  toggleOfflineMode: vi.fn(),
  artworkStyle: 'spotify',
  setArtworkStyle: vi.fn(),
};

const mockNotificationPreferences = {
  userId: 'user-1',
  directAlerts: true,
  marketActivity: true,
  dropsAndReleases: true,
  socialSignals: true,
  bidAlerts: true,
  saleEvents: true,
  revenueThreshold: 100,
};
const mockNotificationValue = {
  preferences: mockNotificationPreferences,
  updatePreferences: mockUpdatePreferences,
  requestPushPermission: mockRequestPushPermission,
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));

vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => mockAudioValue,
}));

vi.mock('@/contexts/NotificationContext', () => ({
  useNotification: () => mockNotificationValue,
}));

vi.mock('@/contexts/WalletContext', () => ({
  useOptionalWallet: () => mockWalletState,
}));

vi.mock('@tonconnect/ui-react', () => ({
  useTonAddress: () => mockWalletState.address,
}));

vi.mock('@/components/theme-provider', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
  }),
}));

vi.mock('@/hooks/useCacheManagement', () => ({
  useCacheManagement: () => ({
    totalSizeMB: '24.5',
    cachedCount: 4,
    clearAllCache: vi.fn().mockResolvedValue(undefined),
    isPurging: false,
  }),
}));

vi.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    t: (key: string) =>
      key === 'settings.display_language'
        ? 'Display Language'
        : key === 'settings.language_desc'
        ? 'Choose your interface language'
        : key,
  }),
}));

vi.mock('@/contexts/GramPriceContext', () => ({
  useGramPrice: () => ({
    localCurrencyEnabled: false,
    setLocalCurrencyEnabled: vi.fn(),
    fiatCurrency: 'USD',
    setFiatCurrency: vi.fn(),
  }),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
  cleanUpdateData: (data: any) => data,
  handleFirestoreError: vi.fn(),
  OperationType: { UPDATE: 'update' },
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({ id: 'user-1' })),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
}));

vi.mock('@/services/storageService', () => ({
  uploadAvatar: vi.fn().mockResolvedValue({ downloadUrl: 'https://example.com/new.jpg' }),
}));

vi.mock('@/components/VerificationTracker', () => ({
  default: () => <div data-testid="verification-tracker" />,
}));

vi.mock('@/components/RoyaltySplitManager', () => ({
  default: () => <div data-testid="royalty-split-manager" />,
}));

vi.mock('@/components/CollaboratorManager', () => ({
  CollaboratorManager: () => <div data-testid="collaborator-manager" />,
}));

vi.mock('@/components/StorageManagementModal', () => ({
  default: () => <div data-testid="storage-modal" />,
}));

vi.mock('@/components/VerifyArtistModal', () => ({
  default: () => <div data-testid="verify-modal" />,
}));

describe('Settings Screen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockWalletState = {
      address: '',
      isConnected: false,
      tonBalance: 0,
      jettonBalance: 0,
      isLoadingBalance: false,
      network: 'mainnet',
      connectWallet: mockConnectWallet,
      disconnectWallet: mockDisconnectWallet,
      refreshBalance: mockRefreshBalance,
    };
  });

  it('renders transparent PageHeader, edge-to-edge account summary without backdrop blur, and 2px silver border tab pills', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/settings']}>
        <Settings />
      </MemoryRouter>
    );

    const header = container.querySelector('header');
    expect(header).toHaveAttribute('data-transparent', 'true');
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();

    const summary = screen.getByLabelText('Account summary');
    expect(summary.className).toContain('backdrop-blur-none');
    expect(summary.className).not.toContain('backdrop-blur-md');

    const accountTab = screen.getByRole('tab', { name: /Account/i });
    expect(accountTab.className).toContain('filter-silver-border');
    expect(accountTab.className).toContain('border-2');
  });

  it('saves updated profile details to Firestore', async () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Settings />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText('Display Name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Krupy Official' } });

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    });
    expect(mockUpdateDoc.mock.calls[0][1]).toMatchObject({
      name: 'Krupy Official',
      username: 'krupy',
    });
  });

  it('shows Connect Wallet when disconnected and wallet balance + Disconnect Wallet when connected', async () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/settings?tab=web3']}>
        <Settings />
      </MemoryRouter>
    );

    const connectButtons = screen.getAllByRole('button', { name: /Connect TON Wallet/i });
    fireEvent.click(connectButtons[0]);
    expect(mockConnectWallet).toHaveBeenCalledTimes(1);

    mockWalletState = {
      ...mockWalletState,
      address: 'EQAbcdef1234567890abcdef1234567890abcdef1234',
      isConnected: true,
      tonBalance: 14.25,
    };

    rerender(
      <MemoryRouter initialEntries={['/settings?tab=web3']}>
        <Settings />
      </MemoryRouter>
    );

    expect(screen.getByText('14.25 TON')).toBeInTheDocument();
    const disconnectButton = screen.getByRole('button', { name: /Disconnect Wallet/i });
    fireEvent.click(disconnectButton);
    await waitFor(() => {
      expect(mockDisconnectWallet).toHaveBeenCalledTimes(1);
    });
  });

  it('persists Private Mode toggle to localStorage and Firestore', async () => {
    render(
      <MemoryRouter initialEntries={['/settings?tab=system']}>
        <Settings />
      </MemoryRouter>
    );

    const privateSwitch = screen.getByRole('switch', { name: /Toggle Private Mode/i });
    fireEvent.click(privateSwitch);

    expect(localStorage.getItem('tonjam_private_mode')).toBe('false');
    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ privateMode: false })
      );
    });
  });
});
