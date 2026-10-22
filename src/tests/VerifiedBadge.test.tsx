import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { isArtist, isVerified, type UserDocument } from '@/types/user';

describe('VerifiedBadge & User Type Guards', () => {
  const verifiedArtistUser: UserDocument = {
    uid: 'user-1',
    displayName: 'DJ Test',
    username: 'djtest',
    role: 'artist',
    isVerifiedArtist: true,
    isVerified: true,
    verificationStatus: 'verified',
    tjBalance: 100,
    tjPoints: 50,
    followers: 1000,
    following: 200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const unverifiedCollectorUser: UserDocument = {
    uid: 'user-2',
    displayName: 'Collector Bob',
    username: 'bobby',
    role: 'collector',
    isVerifiedArtist: false,
    isVerified: false,
    verificationStatus: 'unverified',
    tjBalance: 50,
    tjPoints: 10,
    followers: 10,
    following: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('correctly evaluates isArtist and isVerified type guards', () => {
    expect(isArtist(verifiedArtistUser)).toBe(true);
    expect(isArtist(unverifiedCollectorUser)).toBe(false);
    expect(isArtist(null)).toBe(false);

    expect(isVerified(verifiedArtistUser)).toBe(true);
    expect(isVerified(unverifiedCollectorUser)).toBe(false);
    expect(isVerified(null)).toBe(false);
  });

  it('renders VerifiedBadge when user is verified', () => {
    const { container } = render(<VerifiedBadge user={verifiedArtistUser} />);
    const badge = screen.getByLabelText('Verified artist');
    expect(badge).toBeDefined();
    expect(container.querySelector('svg')).toBeDefined();
  });

  it('renders nothing when user is not verified', () => {
    const { container } = render(<VerifiedBadge user={unverifiedCollectorUser} />);
    const badge = screen.queryByLabelText('Verified artist');
    expect(badge).toBeNull();
    expect(container.firstChild).toBeNull();
  });

  it('respects propIsVerified override', () => {
    const { container } = render(<VerifiedBadge user={unverifiedCollectorUser} isVerified={true} />);
    const badge = screen.getByLabelText('Verified artist');
    expect(badge).toBeDefined();
  });
});
