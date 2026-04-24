import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, cleanUpdateData } from '@/lib/firebase';
import { User } from '@/types';

export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return { 
        uid: userDoc.id, 
        username: data.username || '', 
        name: data.name || '', 
        avatar: data.avatar || '',
        verified: data.isVerifiedArtist || false,
        followers: data.followers || 0,
        ...data 
      } as User;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return null;
  }
};

export const createUserProfile = async (user: User): Promise<void> => {
  try {
    const userData = { ...user };
    const cleaned = cleanUpdateData(userData);
    await setDoc(doc(db, 'users', user.uid), {
      ...cleaned,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<User>): Promise<void> => {
  try {
    const cleaned = cleanUpdateData(data);
    await updateDoc(doc(db, 'users', uid), cleaned);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    throw error;
  }
};

export const getArtists = async (): Promise<User[]> => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'artist'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        uid: doc.id, 
        username: data.username || '', 
        name: data.name || '', 
        avatar: data.avatar || '',
        verified: data.isVerifiedArtist || false,
        followers: data.followers || 0,
        ...data 
      } as User;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users (artists)');
    return [];
  }
};
