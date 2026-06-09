import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, doc, updateDoc, getDocs, getDoc } from 'firebase/firestore';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: any;
  read: boolean;
}

export interface Community {
  id: string;
  artistId: string;
  title: string;
  description: string;
  accessType: 'nft' | 'subscription';
  nftId?: string;
  subscriptionPrice?: number;
  members: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  artistId: string;
  status: 'active' | 'cancelled';
  startDate: any;
  endDate?: any;
}

export const sendMessage = async (senderId: string, receiverId: string, content: string) => {
  return await addDoc(collection(db, 'messages'), {
    senderId,
    receiverId,
    content,
    timestamp: serverTimestamp(),
    read: false
  });
};

export const getMessages = (userId: string, otherUserId: string, callback: (messages: Message[]) => void) => {
  const q = query(
    collection(db, 'messages'),
    where('senderId', 'in', [userId, otherUserId]),
    where('receiverId', 'in', [userId, otherUserId]),
    orderBy('timestamp', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    callback(messages);
  });
};

export const createCommunity = async (community: Omit<Community, 'id'>) => {
  return await addDoc(collection(db, 'communities'), community);
};

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  date: string;
}

export interface UserMissionProgress {
  userId: string;
  missionId: string;
  completed: boolean;
  completedAt?: any;
}

export const getDailyMissions = async (date: string) => {
  const q = query(collection(db, 'dailyMissions'), where('date', '==', date));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyMission));
};

export const getUserMissionProgress = async (userId: string) => {
  const q = query(collection(db, 'userMissionProgress'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserMissionProgress));
};

export const completeMission = async (userId: string, missionId: string) => {
  const trackingId = `${userId}_${missionId}`;
  return await updateDoc(doc(db, 'userMissionProgress', trackingId), {
    completed: true,
    completedAt: serverTimestamp()
  });
};

export const subscribeToCommunity = async (userId: string, artistId: string) => {
  return await addDoc(collection(db, 'subscriptions'), {
    userId,
    artistId,
    status: 'active',
    startDate: serverTimestamp()
  });
};

export const checkCommunityAccess = async (userId: string, communityId: string) => {
  const communityDoc = await getDoc(doc(db, 'communities', communityId));
  if (!communityDoc.exists()) return false;
  const community = communityDoc.data() as Community;
  
  if (community.accessType === 'subscription') {
    const subQuery = query(collection(db, 'subscriptions'), where('userId', '==', userId), where('artistId', '==', community.artistId), where('status', '==', 'active'));
    const subSnapshot = await getDocs(subQuery);
    return !subSnapshot.empty;
  } else if (community.accessType === 'nft') {
    // Check if user owns the required NFT
    const nftQuery = query(collection(db, 'nfts'), where('id', '==', community.nftId), where('owner', '==', userId));
    const nftSnapshot = await getDocs(nftQuery);
    return !nftSnapshot.empty;
  }
  return false;
};
