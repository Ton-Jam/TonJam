import React from 'react';
import { ProfileHeader } from './ProfileHeader';
import { ProfileStats } from './ProfileStats';
import { ProfileActionButton } from './ProfileActionButton';
import { QuickActions } from './QuickActions';
import { ProfileTabs } from './ProfileTabs';
import { UserProfile } from '../../types';

// Mock Data
const mockUser: UserProfile = {
  uid: '123',
  name: 'TonJam Artist',
  username: 'tonjam_artist',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tonjam',
  bannerUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=2000',
  bio: 'Web3 music pioneer and NFT creator. Building the future of sound.',
  followers: 1250,
  following: 340,
  earnings: 500.5,
  isVerifiedArtist: true,
  ownedNftIds: ['1', '2', '3'],
  createdPlaylistIds: ['1', '2'],
  location: 'Amsterdam, NL',
  createdAt: '2023-01-01',
  isVerified: true,
};

export const ProfileScreen = () => {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto space-y-0">
        <ProfileHeader user={mockUser} />
        <ProfileStats user={mockUser} />
        <div className="px-4 pb-4">
            <ProfileActionButton user={mockUser} />
        </div>
        <QuickActions />
        <ProfileTabs user={mockUser} />
        {/* Placeholder for tabs */}
      </div>
    </div>
  );
};
