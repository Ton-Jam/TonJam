import type { Timestamp } from 'firebase/firestore';

/**
 * Supported user roles in the TonJam platform.
 */
export type UserRole = "artist" | "collector" | "admin" | "user";

/**
 * Social links supported by user and artist profiles.
 */
export type UserSocialLinks = {
  x?: string;
  twitter?: string;
  spotify?: string;
  instagram?: string;
  soundcloud?: string;
  website?: string;
  telegram?: string;
  youtube?: string;
  tiktok?: string;
};

/**
 * Mutable User Profile Fields (Editable by the user profile owner via Edit Profile)
 */
export interface MutableUserFields {
  displayName: string;
  username: string;
  bio?: string;
  photoURL?: string;
  avatar?: string;
  coverUrl?: string;
  coverPhoto?: string;
  bannerUrl?: string; // Alias or secondary banner
  location?: string;
  website?: string;
  genre?: string;
  favoriteGenres?: string[];
  socialLinks?: UserSocialLinks;
  profileTheme?: 'light' | 'dark' | 'cyberpunk' | 'ocean' | 'neon';
  autoCompound?: boolean;
}

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
export interface UserDocument extends MutableUserFields, ProtectedUserFields {
  uid: string;
  email?: string;
  walletAddress?: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

/**
 * Compatibility alias for FirestoreUserDocument
 */
export type FirestoreUserDocument = UserDocument;

/**
 * Input type for creating or updating user profiles in Firestore
 */
export type UserProfileUpdateInput = Partial<MutableUserFields> & {
  walletAddress?: string;
};

// ----------------------------------------------------------------------
// Reusable User Role and Verification Type Guards
// ----------------------------------------------------------------------

/**
 * Determines whether a user has the artist role.
 * Null-safe. Does not infer role from verification status.
 */
export function isArtist(user: UserDocument | null | undefined): boolean {
  return user?.role === "artist";
}

/**
 * Determines whether a user is verified based on verification flags or status.
 * Null-safe. Inspects isVerified, isVerifiedArtist, verified, and verificationStatus === 'verified'.
 * Does not mark a user verified based solely on role.
 */
export function isVerified(user: UserDocument | null | undefined): boolean {
  if (!user) return false;
  return Boolean(
    user.isVerified ||
    user.isVerifiedArtist ||
    user.verified ||
    user.verificationStatus === 'verified'
  );
}

// Additional null-safe helper aliases for compatibility
export const isArtistUser = isArtist;
export const isVerifiedUser = isVerified;
