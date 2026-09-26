import { db, OperationType, handleFirestoreError } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Space, User } from '@/pages/JamSpace/types';

export interface CreateSpaceParams {
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  coverUrl?: string;
  ownerId: string;
  host: User;
}

/**
 * Creates a new JamSpace in Firestore under 'spaces' collection
 */
export const createSpaceInFirestore = async (params: CreateSpaceParams): Promise<{ id: string } | null> => {
  try {
    const spaceData = {
      name: params.name.trim(),
      title: params.name.trim(),
      description: params.description?.trim() || '',
      visibility: params.visibility,
      coverUrl: params.coverUrl || '',
      ownerId: params.ownerId,
      host: {
        id: params.host.id || params.ownerId,
        name: params.host.name,
        username: params.host.username,
        avatar: params.host.avatar,
        isVerified: params.host.isVerified || false,
        role: params.host.role || 'artist'
      },
      listenerCount: 1,
      speakerAvatars: [params.host.avatar],
      speakers: [params.host.name],
      isLive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'spaces'), spaceData);
    return { id: docRef.id };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'spaces');
    return null;
  }
};
