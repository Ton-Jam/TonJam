import { db, OperationType, handleFirestoreError } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit } from 'firebase/firestore';
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
 * Creates a new JamSpace in Firestore under 'liveStreams' collection
 */
export const createSpaceInFirestore = async (params: CreateSpaceParams): Promise<{ id: string } | null> => {
  try {
    const cleanName = params.name.trim();
    const spaceData = {
      name: cleanName,
      title: cleanName,
      description: params.description?.trim() || '',
      visibility: params.visibility,
      coverUrl: params.coverUrl || '',
      ownerId: params.ownerId,
      artistId: params.ownerId,
      artistName: params.host.name,
      artistAvatar: params.host.avatar,
      artistHandle: params.host.username,
      status: 'live',
      host: {
        id: params.host.id || params.ownerId,
        name: params.host.name,
        username: params.host.username,
        avatar: params.host.avatar,
        isVerified: params.host.isVerified || false,
        role: params.host.role || 'artist'
      },
      listenerCount: 1,
      viewersCount: 1,
      speakerAvatars: [params.host.avatar],
      speakers: [params.host.name],
      isLive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'liveStreams'), spaceData);
    return { id: docRef.id };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'liveStreams');
    return null;
  }
};

/**
 * Fetches active live spaces/rooms from Firestore 'liveStreams' collection
 */
export const fetchLiveSpacesFromFirestore = async (maxCount = 8): Promise<Space[]> => {
  try {
    const streamsRef = collection(db, 'liveStreams');
    const q = query(streamsRef, orderBy('createdAt', 'desc'), limit(maxCount));
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map((docSnap) => {
        const d = docSnap.data() as any;
        const isLive = d.isLive === true || d.status === 'live';
        return {
          id: docSnap.id,
          title: d.title || d.name || 'Live Audio Space',
          name: d.name || d.title || 'Live Audio Space',
          description: d.description || '',
          ownerId: d.ownerId || d.artistId || '',
          listenerCount: Number(d.listenerCount ?? d.viewersCount ?? d.viewerCount ?? 0),
          speakerAvatars: Array.isArray(d.speakerAvatars) ? d.speakerAvatars : (d.artistAvatar ? [d.artistAvatar] : []),
          speakers: Array.isArray(d.speakers) ? d.speakers : [],
          isLive,
          visibility: d.visibility || 'public',
          coverUrl: d.coverUrl || d.thumbnailUrl || '',
          host: {
            id: d.host?.id || d.ownerId || d.artistId || 'host',
            name: d.host?.name || d.artistName || 'TonJam Host',
            username: d.host?.username || d.artistHandle || '@host',
            avatar: d.host?.avatar || d.artistAvatar || '',
            isVerified: Boolean(d.host?.isVerified ?? d.artistVerified),
            contributionPoints: 0,
            badges: [],
            role: (d.host?.role || 'artist') as User['role']
          }
        } as Space;
      })
      .filter((s) => s.visibility !== 'private' && s.isLive);
  } catch (error) {
    console.warn('[spaceService] Error fetching live spaces:', error);
    return [];
  }
};

