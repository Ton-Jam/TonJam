import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, cleanUpdateData } from '@/lib/firebase';

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  followNotifications: boolean;
  likeNotifications: boolean;
  commentNotifications: boolean;
  nftSaleNotifications: boolean;
  promotionalEmails: boolean;
  weeklyDigest: boolean;
  dailySummary: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'friends'; // Who can see your profile
  showFollowers: boolean; // Show who you're following/followers
  allowMessages: boolean; // Allow direct messages
  allowCollaborationRequests: boolean;
  showActivity: boolean; // Show activity in feed
  searchEngineIndexing: boolean; // Allow search engines to index
  showEarnings: boolean; // Show earnings publicly
}

export interface ThemePreferences {
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  compactMode: boolean;
}

export interface UserPreferences {
  userId: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  theme: ThemePreferences;
  language: string;
  timezone: string;
  currency: string;
  updatedAt: string;
}

// Default preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  followNotifications: true,
  likeNotifications: true,
  commentNotifications: true,
  nftSaleNotifications: true,
  promotionalEmails: false,
  weeklyDigest: true,
  dailySummary: false,
};

export const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferences = {
  profileVisibility: 'public',
  showFollowers: true,
  allowMessages: true,
  allowCollaborationRequests: true,
  showActivity: true,
  searchEngineIndexing: true,
  showEarnings: false,
};

export const DEFAULT_THEME_PREFERENCES: ThemePreferences = {
  theme: 'auto',
  accentColor: 'blue',
  compactMode: false,
};

/**
 * Get user preferences from Firestore
 */
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  try {
    const docRef = doc(db, 'users', userId, 'metadata', 'preferences');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        userId,
        notifications: { ...DEFAULT_NOTIFICATION_PREFERENCES, ...data.notifications },
        privacy: { ...DEFAULT_PRIVACY_PREFERENCES, ...data.privacy },
        theme: { ...DEFAULT_THEME_PREFERENCES, ...data.theme },
        language: data.language || 'en',
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        currency: data.currency || 'USD',
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    }

    // Return defaults if no preferences exist
    return {
      userId,
      notifications: DEFAULT_NOTIFICATION_PREFERENCES,
      privacy: DEFAULT_PRIVACY_PREFERENCES,
      theme: DEFAULT_THEME_PREFERENCES,
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: 'USD',
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}/metadata/preferences`);
    return null;
  }
};

/**
 * Update user notification preferences
 */
export const updateNotificationPreferences = async (
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, 'metadata', 'preferences');
    const cleaned = cleanUpdateData(preferences);
    
    await updateDoc(docRef, {
      notifications: cleaned,
      updatedAt: serverTimestamp(),
    } as any);
  } catch (error) {
    // If document doesn't exist, create it
    if ((error as any).code === 'not-found') {
      await setPreferences(userId, {
        notifications: preferences,
      });
    } else {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/metadata/preferences`);
      throw error;
    }
  }
};

/**
 * Update user privacy preferences
 */
export const updatePrivacyPreferences = async (
  userId: string,
  preferences: Partial<PrivacyPreferences>
): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, 'metadata', 'preferences');
    const cleaned = cleanUpdateData(preferences);
    
    await updateDoc(docRef, {
      privacy: cleaned,
      updatedAt: serverTimestamp(),
    } as any);
  } catch (error) {
    if ((error as any).code === 'not-found') {
      await setPreferences(userId, {
        privacy: preferences,
      });
    } else {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/metadata/preferences`);
      throw error;
    }
  }
};

/**
 * Update user theme preferences
 */
export const updateThemePreferences = async (
  userId: string,
  preferences: Partial<ThemePreferences>
): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, 'metadata', 'preferences');
    const cleaned = cleanUpdateData(preferences);
    
    await updateDoc(docRef, {
      theme: cleaned,
      updatedAt: serverTimestamp(),
    } as any);
  } catch (error) {
    if ((error as any).code === 'not-found') {
      await setPreferences(userId, {
        theme: preferences,
      });
    } else {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/metadata/preferences`);
      throw error;
    }
  }
};

/**
 * Update user regional preferences (language, timezone, currency)
 */
export const updateRegionalPreferences = async (
  userId: string,
  preferences: Partial<Pick<UserPreferences, 'language' | 'timezone' | 'currency'>>
): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, 'metadata', 'preferences');
    const cleaned = cleanUpdateData(preferences);
    
    await updateDoc(docRef, {
      ...cleaned,
      updatedAt: serverTimestamp(),
    } as any);
  } catch (error) {
    if ((error as any).code === 'not-found') {
      await setPreferences(userId, preferences);
    } else {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/metadata/preferences`);
      throw error;
    }
  }
};

/**
 * Set all preferences at once (for new users)
 */
export const setPreferences = async (
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, 'metadata', 'preferences');
    const cleaned = cleanUpdateData(preferences);
    
    await setDoc(docRef, {
      ...cleaned,
      updatedAt: serverTimestamp(),
    } as any, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/metadata/preferences`);
    throw error;
  }
};

/**
 * Reset preferences to defaults
 */
export const resetPreferences = async (userId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, 'metadata', 'preferences');
    
    await setDoc(docRef, {
      notifications: DEFAULT_NOTIFICATION_PREFERENCES,
      privacy: DEFAULT_PRIVACY_PREFERENCES,
      theme: DEFAULT_THEME_PREFERENCES,
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: 'USD',
      updatedAt: serverTimestamp(),
    } as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/metadata/preferences`);
    throw error;
  }
};
