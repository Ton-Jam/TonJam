import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signInAnonymously
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '@/lib/firebase';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isArtist: boolean;
  isCollector: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ user?: User; error?: any }>;
  signUpWithEmail: (email: string, password: string, metadata?: { username?: string }) => Promise<{ user?: User; error?: any }>;
  sendPasswordReset: (email: string) => Promise<{ error?: any }>;
  signInWithWallet: (walletAddress: string, walletType: string) => Promise<{ user?: User; error?: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  isArtist: false,
  isCollector: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({ error: 'Not implemented' }),
  signUpWithEmail: async () => ({ error: 'Not implemented' }),
  sendPasswordReset: async () => ({ error: 'Not implemented' }),
  signInWithWallet: async () => ({ error: 'Not implemented' }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = userProfile?.role === 'admin';
  const isArtist = userProfile?.role === 'artist';
  const isCollector = userProfile?.role === 'collector' || !userProfile?.role;

  const fetchProfile = async (userId: string) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        if (data.createdAt && typeof data.createdAt !== 'string') {
          data.createdAt = (data.createdAt as any).toDate().toISOString();
        }
        setUserProfile(data);
      } else {
        // Create a default profile if it doesn't exist
        const defaultProfile: Partial<UserProfile> = {
          uid: userId,
          name: auth.currentUser?.displayName || 'New User',
          username: `user_${userId.substring(0, 5)}`,
          avatar: auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          followers: 0,
          following: 0,
          earnings: 0,
          role: 'collector',
          createdAt: new Date().toISOString()
        };
        
        try {
          await setDoc(docRef, defaultProfile);
          setUserProfile(defaultProfile as UserProfile);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
          throw error;
        }
      }
    } catch (error) {
      if (!(error as any).message?.includes('Firestore Error')) {
        handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
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

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Error signing in with Google:', error);
      }
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
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (metadata?.username) {
        await updateProfile(result.user, { displayName: metadata.username });
      }
      return { user: result.user };
    } catch (error) {
      console.error('Error signing up with email:', error);
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
        await setDoc(docRef, defaultProfile);
      } else {
        await setDoc(docRef, { walletAddress }, { merge: true });
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
      signInWithEmail,
      signUpWithEmail,
      sendPasswordReset,
      signInWithWallet,
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
 
