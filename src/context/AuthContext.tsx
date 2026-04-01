import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { UserProfile } from '@/types';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ user?: User; error?: any }>;
  signUpWithEmail: (email: string, password: string, metadata?: { username?: string }) => Promise<{ user?: User; error?: any }>;
  sendPasswordReset: (email: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({ error: 'Not implemented' }),
  signUpWithEmail: async () => ({ error: 'Not implemented' }),
  sendPasswordReset: async () => ({ error: 'Not implemented' }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
          id: userId,
          name: auth.currentUser?.displayName || 'New User',
          handle: `user_${userId.substring(0, 5)}`,
          avatar: auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          followers: 0,
          following: 0,
          role: 'collector',
          createdAt: serverTimestamp() as any
        };
        
        await setDoc(docRef, defaultProfile);
        setUserProfile(defaultProfile as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
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
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user };
    } catch (error) {
      console.error('Error signing in with email:', error);
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
      signInWithGoogle, 
      signInWithEmail,
      signUpWithEmail,
      sendPasswordReset,
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
 
