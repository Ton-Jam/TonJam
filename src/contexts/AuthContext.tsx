import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithCredential,
  GoogleAuthProvider,
  TwitterAuthProvider,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signInAnonymously,
  linkWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { auth, db, googleProvider, twitterProvider, handleFirestoreError, OperationType } from '@/lib/firebase';
import { UserProfile } from '@/types';
import { clearDriveToken } from '@/services/googleDriveService';
import { syncBookmarksFromFirestore } from '@/services/bookmarkService';
import { 
  verifyUserProfileIntegrity, 
  logProfileIntegrityReport, 
  ProfileIntegrityReport 
} from '@/lib/profileIntegrityDiagnostics';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isArtist: boolean;
  isCollector: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ user?: User; error?: any }>;
  signUpWithEmail: (email: string, password: string, metadata?: { username?: string }) => Promise<{ user?: User; error?: any }>;
  sendPasswordReset: (email: string) => Promise<{ error?: any }>;
  signInWithWallet: (walletAddress: string, walletType: string) => Promise<{ user?: User; error?: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkProfileIntegrity: (logToConsole?: boolean) => Promise<ProfileIntegrityReport>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  isArtist: false,
  isCollector: true,
  signInWithGoogle: async () => {},
  signInWithTwitter: async () => {},
  signInWithEmail: async () => ({ error: 'Not implemented' }),
  signUpWithEmail: async () => ({ error: 'Not implemented' }),
  sendPasswordReset: async () => ({ error: 'Not implemented' }),
  signInWithWallet: async () => ({ error: 'Not implemented' }),
  signOut: async () => {},
  refreshProfile: async () => {},
  checkProfileIntegrity: async () => ({} as ProfileIntegrityReport),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = userProfile?.role === 'admin';
  const isArtist = userProfile?.role === 'artist';
  const isCollector = userProfile?.role === 'collector' || !userProfile?.role;

  const setDocWithRetry = async (docRef: any, data: any, options?: any, maxRetries = 3, delayMs = 1000) => {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        if (options) {
          await setDoc(docRef, data, options);
        } else {
          await setDoc(docRef, data);
        }
        return;
      } catch (err) {
        attempt++;
        console.warn(`[AuthContext] Firestore setDoc attempt ${attempt} failed for path:`, err);
        if (attempt >= maxRetries) {
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
      }
    }
  };

  const fetchProfile = async (userId: string) => {
    const cachedKey = `tonjam_user_profile_${userId}`;
    let existingCached: UserProfile | null = null;
    try {
      const cachedStr = localStorage.getItem(cachedKey);
      if (cachedStr) {
        existingCached = JSON.parse(cachedStr);
        if (existingCached) {
          setUserProfile(existingCached);
        }
      }
    } catch {
      // Ignore cache parse errors
    }

    try {
      console.log(`[AuthContext] Fetching user profile for UID: ${userId}`);
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        if (data.createdAt && typeof data.createdAt !== 'string') {
          data.createdAt = (data.createdAt as any).toDate().toISOString();
        }
        
        // Ensure krusherkrupy@gmail.com is admin
        if (auth.currentUser?.email === 'krusherkrupy@gmail.com' && data.role !== 'admin') {
          try {
            await setDocWithRetry(docRef, { role: 'admin' }, { merge: true });
            data.role = 'admin';
            console.log(`[AuthContext] Granted admin role to krusherkrupy@gmail.com`);
          } catch (writeErr) {
            console.warn("[AuthContext] Failed to update admin role in Firestore:", writeErr);
          }
        }
        
        // Ensure currently logged in user has a short artist bio if missing
        if (!data.bio || data.bio.trim() === '') {
          const shortBio = "Creating the future of sound. Electronic producer and synth enthusiast.";
          try {
            await setDocWithRetry(docRef, { bio: shortBio }, { merge: true });
            data.bio = shortBio;
          } catch (writeErr) {
            console.warn("[AuthContext] Failed to update user profile bio in Firestore:", writeErr);
          }
        }
        
        setUserProfile(data);
        try {
          localStorage.setItem(cachedKey, JSON.stringify(data));
        } catch {}
        console.log(`[AuthContext] Successfully loaded user profile for UID: ${userId}`);
      } else {
        // Create a default profile if it doesn't exist
        const defaultProfile: Partial<UserProfile> = {
          uid: userId,
          name: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'New User',
          username: `user_${userId.substring(0, 5)}`,
          avatar: auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          followers: 0,
          following: 0,
          earnings: 0,
          role: auth.currentUser?.email === 'krusherkrupy@gmail.com' ? 'admin' : 'collector',
          bio: "Creating the future of sound. Electronic producer and synth enthusiast.",
          createdAt: new Date().toISOString()
        };
        
        try {
          await setDocWithRetry(docRef, defaultProfile);
        } catch (err) {
          console.warn(`[AuthContext] Set default profile offline fallback for UID ${userId}`);
        }
        setUserProfile(defaultProfile as UserProfile);
        try {
          localStorage.setItem(cachedKey, JSON.stringify(defaultProfile));
        } catch {}
        console.log(`[AuthContext] Initialized user profile for UID: ${userId}`);
      }
    } catch (error: any) {
      console.warn(`[AuthContext] Operating in offline/cached profile mode for UID ${userId}:`, error?.message || error);
      
      // If no profile was set yet from cache, provide an active fallback profile so the session is never blocked
      if (!existingCached) {
        const fallbackProfile: UserProfile = {
          uid: userId,
          name: auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'User',
          username: `user_${userId.substring(0, 5)}`,
          avatar: auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          followers: 0,
          following: 0,
          earnings: 0,
          role: auth.currentUser?.email === 'krusherkrupy@gmail.com' ? 'admin' : 'collector',
          bio: "Creating the future of sound. Electronic producer and synth enthusiast.",
          createdAt: new Date().toISOString()
        } as UserProfile;

        setUserProfile(fallbackProfile);
        try {
          localStorage.setItem(cachedKey, JSON.stringify(fallbackProfile));
        } catch {}
      }

      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  const checkProfileIntegrity = async (logToConsole = true): Promise<ProfileIntegrityReport> => {
    const report = await verifyUserProfileIntegrity({
      userId: user?.uid,
      currentProfile: userProfile,
      preferServer: true
    });

    if (logToConsole) {
      logProfileIntegrityReport(report);
    }

    return report;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync user's bookmarked posts from Firestore to My Library and JamSpace view in real-time
  useEffect(() => {
    if (user?.uid) {
      console.log(`[AuthContext] Initiating background bookmarks sync for user: ${user.uid}`);
      const unsubscribeSync = syncBookmarksFromFirestore(user.uid);
      return () => unsubscribeSync();
    }
  }, [user?.uid]);

  const signInWithGoogle = async () => {
    try {
      // 1. Get the auth URL from our backend
      let url = '';
      try {
        const response = await fetch('/api/auth/google/url');
        if (response.ok) {
          const data = await response.json();
          url = data.url;
        } else {
          console.warn('Backend proxy google login URL fetch returned status: ', response.status);
        }
      } catch (err) {
        console.warn('Backend proxy google login URL fetch failed, will try direct Firebase Login:', err);
      }

      // If we got a valid proxy URL, use the pop-up proxy flow (designed for bypass)
      if (url) {
        // 2. Open popup
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(url, 'google-auth', `width=${width},height=${height},left=${left},top=${top}`);
        
        if (!popup) {
          throw new Error('Popup blocked. Please allow popups for this site.');
        }

        // 3. Listen for message from callback
        await new Promise<void>((resolve, reject) => {
          let checkClosed: any = null;
          const handleMessage = async (event: MessageEvent) => {
            if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
              if (checkClosed) clearInterval(checkClosed);
              window.removeEventListener('message', handleMessage);
              try {
                const { idToken } = event.data;
                const credential = GoogleAuthProvider.credential(idToken);
                await signInWithCredential(auth, credential);
                resolve();
              } catch (err) {
                reject(err);
              }
            }
          };
          window.addEventListener('message', handleMessage);

          // Cleanup if popup is closed manually
          checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              window.removeEventListener('message', handleMessage);
              resolve(); // Don't reject, just resolve so caller knows popup closed
            }
          }, 1000);
        });
        return;
      }

      // 4. Try standard Firebase Identity Provider sign in with popup
      try {
        await signInWithPopup(auth, googleProvider);
        return;
      } catch (popupError: any) {
        console.warn('Direct Firebase Google Auth failed, trying sandbox fallback:', popupError);
        
        // 5. Ultimate elegant fallback for development/sandbox: Anonymous environment session login
        // This ensures the application built can still be explored seamlessly!
        const result = await signInAnonymously(auth);
        
        // Let user have a friendly generic nickname or display profile 
        if (result.user) {
          await updateProfile(result.user, {
            displayName: "TONJam Explorer",
            photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=explorer"
          });
          // Also initialize their profile
          await fetchProfile(result.user.uid);
        }
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithTwitter = async () => {
    try {
      if (user) {
        await linkWithPopup(auth.currentUser!, twitterProvider);
      } else {
        await signInWithPopup(auth, twitterProvider);
      }
    } catch (error: any) {
      console.error('Error signing in/linking with Twitter:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user };
    } catch (error) {
      // Suppress noisy console error for invalid credentials as it's handled by the UI
      if (!(error as any).code?.includes('auth/invalid-credential')) {
        console.error('Error signing in with email:', error);
      }
      return { error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, metadata?: { username?: string }) => {
    try {
      console.log(`[AuthContext] Starting email sign up for: ${email}`);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = result.user;

      const displayName = metadata?.username || email.split('@')[0];
      if (metadata?.username) {
        await updateProfile(newUser, { displayName: metadata.username });
      }

      // Explicitly create user profile in Firestore
      const docRef = doc(db, 'users', newUser.uid);
      const defaultProfile: Partial<UserProfile> = {
        uid: newUser.uid,
        name: displayName,
        username: metadata?.username || `user_${newUser.uid.substring(0, 5)}`,
        avatar: newUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.uid}`,
        followers: 0,
        following: 0,
        earnings: 0,
        role: email === 'krusherkrupy@gmail.com' ? 'admin' : 'collector',
        bio: "Creating the future of sound. Electronic producer and synth enthusiast.",
        createdAt: new Date().toISOString()
      };

      try {
        await setDocWithRetry(docRef, defaultProfile, { merge: true });
        console.log(`[AuthContext] Successfully persisted profile in Firestore for new user: ${newUser.uid}`);
        setUserProfile(defaultProfile as UserProfile);
      } catch (firestoreErr) {
        console.error(`[AuthContext] CRITICAL: Failed to write user profile to Firestore during sign-up for ${newUser.uid} after retries:`, firestoreErr);
        handleFirestoreError(firestoreErr, OperationType.WRITE, `users/${newUser.uid}`);
        return { user: newUser, error: firestoreErr };
      }

      return { user: newUser };
    } catch (error: any) {
      console.error('[AuthContext] Error signing up with email:', error?.code, error?.message, error);
      return { error };
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return {};
    } catch (error) {
      console.error('Error sending password reset:', error);
      return { error };
    }
  };

  const signInWithWallet = async (walletAddress: string, walletType: string) => {
    try {
      const result = await signInAnonymously(auth);
      
      const docRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const defaultProfile: Partial<UserProfile> = {
          uid: result.user.uid,
          name: `Wallet User`,
          username: `user_${result.user.uid.substring(0, 5)}`,
          walletAddress,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.uid}`,
          followers: 0,
          following: 0,
          earnings: 0,
          role: 'collector',
          createdAt: new Date().toISOString()
        };
        await setDocWithRetry(docRef, defaultProfile);
      } else {
        await setDocWithRetry(docRef, { walletAddress }, { merge: true });
      }
      
      await fetchProfile(result.user.uid);
      return { user: result.user };
    } catch (error) {
      console.error('Error signing in with wallet:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      clearDriveToken();
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      isAdmin,
      isArtist,
      isCollector,
      signInWithGoogle, 
      signInWithTwitter,
      signInWithEmail,
      signUpWithEmail,
      sendPasswordReset,
      signInWithWallet,
      signOut,
      refreshProfile,
      checkProfileIntegrity
    }}>
      {children}
    </AuthContext.Provider>
  );
};
 
