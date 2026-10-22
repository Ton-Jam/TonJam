import type { Timestamp } from 'firebase/firestore';

/**
 * Firestore 'users' Collection Schema
 * 
 * This schema defines the structure of documents in the 'users' collection in Firestore.
 * It strictly separates user-editable mutable fields from admin/system-controlled protected fields.
 */

/**
 * Social links supported by user and artist profiles.
 */
export interface UserSocialLinks {
  x?: string;
  twitter?: string;
  spotify?: string;
  instagram?: string;
  website?: string;
  telegram?: string;
  soundcloud?: string;
  youtube?: string;
  tiktok?: string;
}

/**
 * Mutable User Profile Fields (Editable by the user profile owner via Edit Profile)
 */
export interface MutableUserFields {
  displayName: string;
  username: string;
  bio?: string;
  photoURL?: string;
  coverUrl?: string;
  bannerUrl?: string; // Alias or secondary banner
  location?: string;
  website?: string;
  genre?: string;
  favoriteGenres?: string[];
  socialLinks?: UserSocialLinks;
  profileTheme?: 'light' | 'dark' | 'cyberpunk' | 'ocean' | 'neon';
  autoCompound?: boolean;
}

export type UserRole = 'artist' | 'collector' | 'admin' | 'user';

/**
 * Protected/System User Fields (Managed by server logic, Firebase Auth, or Admin - NOT directly editable by users)
 */
export interface ProtectedUserFields {
  role: UserRole;
  isVerifiedArtist: boolean;
  isVerified?: boolean;
  verified?: boolean;
  verificationStatus: 'unverified' | 'pending' | 'needs_revision' | 'verified' | 'rejected';
  isAdmin?: boolean;
  tjBalance: number;
  tjPoints: number;
  jamBalance?: number;
  tonBalance?: number;
  followers: number;
  following: number;
  collectorTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Legend' | 'None';
}

/**
 * Complete Firestore User Document Interface
 */
export interface FirestoreUserDocument extends MutableUserFields, ProtectedUserFields {
  uid: string;
  email?: string;
  walletAddress?: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

export type UserDocument = FirestoreUserDocument;

/**
 * Input type for creating or updating user profiles in Firestore
 */
export type UserProfileUpdateInput = Partial<MutableUserFields> & {
  walletAddress?: string;
};

/**
 * Reusable type guards for UserDocument / users
 */
export function isArtist(user: Partial<UserDocument> | null | undefined): boolean {
  return user?.role === 'artist';
}

export function isVerified(user: Partial<UserDocument> | null | undefined): boolean {
  if (!user) return false;
  return Boolean(
    user.isVerified ||
    user.isVerifiedArtist ||
    user.verified ||
    user.verificationStatus === 'verified'
  );
}

export function isArtistUser(user: Partial<UserDocument> | null | undefined): boolean {
  return isArtist(user);
}

export function isVerifiedUser(user: Partial<UserDocument> | null | undefined): boolean {
  return isVerified(user);
}


