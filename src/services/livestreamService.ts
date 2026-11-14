import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  increment,
  limit
} from 'firebase/firestore';
import { 
  LiveStreamSession, 
  LiveStreamChatMessage, 
  LiveStreamTip, 
  LiveStreamSongRequest, 
  LiveStreamQAQuestion,
  ViewerPrivileges, 
  UserHeldNFT, 
  NFTHolderTier 
} from '@/types/livestream';
import { NFTItem, UserProfile } from '@/types';
import { getPlaceholderImage } from '@/lib/utils';

// Calculate viewer's NFT privileges based on held NFTs
export const calculateViewerPrivileges = (
  user: any,
  userProfile: UserProfile | null,
  userNfts: NFTItem[] = [],
  streamArtistId?: string
): ViewerPrivileges => {
  const heldNFTs: UserHeldNFT[] = userNfts.map(nft => ({
    id: nft.id,
    title: nft.title,
    imageUrl: nft.imageUrl || nft.coverUrl || getPlaceholderImage('nft'),
    rarity: nft.rarity || 'Rare',
    edition: nft.edition || '1/100',
    artistId: nft.artistId,
    isGenesis: nft.title?.toLowerCase().includes('genesis') || nft.rarity?.toLowerCase() === 'legendary'
  }));

  const hasGenesis = heldNFTs.some(n => n.isGenesis);
  const hasArtistNFT = streamArtistId ? heldNFTs.some(n => n.artistId === streamArtistId) : false;
  const hasRareOrDiamond = heldNFTs.some(n => n.rarity?.toLowerCase() === 'epic' || n.rarity?.toLowerCase() === 'rare');
  const isArtistSelf = user?.uid === streamArtistId || userProfile?.role === 'artist';

  let tier: NFTHolderTier = 'Listener';
  let badgeLabel = 'Listener';
  let badgeColor = '#94A3B8';
  let glowEffect = false;

  if (isArtistSelf) {
    tier = 'Artist VIP';
    badgeLabel = 'Host / Artist';
    badgeColor = '#A855F7';
    glowEffect = true;
  } else if (hasGenesis) {
    tier = 'Genesis VIP';
    badgeLabel = '👑 Genesis VIP';
    badgeColor = '#F59E0B';
    glowEffect = true;
  } else if (hasArtistNFT) {
    tier = 'Artist VIP';
    badgeLabel = '⭐ Artist Holder';
    badgeColor = '#EC4899';
    glowEffect = true;
  } else if (hasRareOrDiamond) {
    tier = 'Diamond Holder';
    badgeLabel = '💎 Diamond Holder';
    badgeColor = '#00B4D8';
    glowEffect = true;
  } else if (heldNFTs.length > 0) {
    tier = 'Collector';
    badgeLabel = '🎵 Music Collector';
    badgeColor = '#10B981';
  }

  return {
    tier,
    badgeLabel,
    badgeColor,
    glowEffect,
    canPriorityPinQA: hasGenesis || hasArtistNFT || isArtistSelf,
    canRequestSongs: heldNFTs.length > 0 || isArtistSelf,
    canTriggerVipSoundboard: hasGenesis || isArtistSelf,
    specialEmotesUnlocked: heldNFTs.length > 0 || isArtistSelf,
    superTipMultipliers: hasGenesis,
    heldNFTs
  };
};

/**
 * Fetch all active live streams strictly from Firestore
 */
export const getActiveLiveStreams = async (): Promise<LiveStreamSession[]> => {
  try {
    const q = query(
      collection(db, 'liveStreams'),
      where('status', '==', 'live'),
      orderBy('viewerCount', 'desc'),
      limit(20)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as LiveStreamSession));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'liveStreams');
    return [];
  }
};

/**
 * Fetch a single live stream session by ID strictly from Firestore
 */
export const getLiveStreamById = async (streamId: string): Promise<LiveStreamSession | null> => {
  if (!streamId) return null;
  try {
    const docRef = doc(db, 'liveStreams', streamId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as LiveStreamSession;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `liveStreams/${streamId}`);
    return null;
  }
};

/**
 * Create a new live stream broadcast (Artist Go Live)
 */
export const createLiveStreamSession = async (
  sessionData: Omit<LiveStreamSession, 'id' | 'startedAt' | 'viewerCount' | 'peakViewers' | 'totalTipsTon' | 'totalTipsGram' | 'totalTipsTJ'>
): Promise<LiveStreamSession> => {
  const newId = `stream_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullSession: LiveStreamSession = {
    ...sessionData,
    id: newId,
    status: 'live',
    viewerCount: 1,
    peakViewers: 1,
    totalTipsTon: 0,
    totalTipsGram: 0,
    totalTipsTJ: 0,
    startedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, 'liveStreams', newId);
    await setDoc(docRef, fullSession);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `liveStreams/${newId}`);
  }

  return fullSession;
};

/**
 * Update an existing live stream session (e.g. current song, viewer count, status)
 */
export const updateLiveStreamSession = async (
  streamId: string,
  updates: Partial<LiveStreamSession>
): Promise<void> => {
  try {
    const docRef = doc(db, 'liveStreams', streamId);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `liveStreams/${streamId}`);
  }
};

/**
 * End a live stream session
 */
export const endLiveStreamSession = async (streamId: string): Promise<void> => {
  await updateLiveStreamSession(streamId, {
    status: 'ended',
    endedAt: new Date().toISOString()
  });
};

/**
 * Real-time subscription to stream chat messages
 */
export const subscribeToStreamChat = (
  streamId: string,
  callback: (messages: LiveStreamChatMessage[]) => void
) => {
  if (!streamId) {
    callback([]);
    return () => {};
  }
  try {
    const q = query(
      collection(db, `liveStreams/${streamId}/messages`),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as LiveStreamChatMessage));
        callback(msgs);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, `liveStreams/${streamId}/messages`);
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `liveStreams/${streamId}/messages`);
    callback([]);
    return () => {};
  }
};

/**
 * Send a chat message with NFT badges & privileges attached
 */
export const sendStreamChatMessage = async (
  streamId: string,
  messageData: Omit<LiveStreamChatMessage, 'id' | 'timestamp'>
): Promise<LiveStreamChatMessage> => {
  const newMsgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const message: LiveStreamChatMessage = {
    ...messageData,
    id: newMsgId,
    timestamp: new Date().toISOString()
  };

  try {
    const docRef = doc(db, `liveStreams/${streamId}/messages`, newMsgId);
    await setDoc(docRef, message);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `liveStreams/${streamId}/messages/${newMsgId}`);
  }

  return message;
};

/**
 * Send a Cryptocurrency Tip (TON, GRAM, JAM) to the streaming Artist
 */
export const sendCryptoTipToStreamer = async (
  streamId: string,
  tipData: {
    senderId: string;
    senderName: string;
    senderAvatar: string;
    senderAddress: string;
    amount: number;
    currency: 'TON' | 'GRAM' | 'JAM';
    message?: string;
    senderNfts?: UserHeldNFT[];
    senderTier?: NFTHolderTier;
  }
): Promise<LiveStreamTip> => {
  const tipId = `tip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const tipRecord: LiveStreamTip = {
    ...tipData,
    id: tipId,
    streamId,
    timestamp: new Date().toISOString()
  };

  try {
    // 1. Add tip record in subcollection
    const tipRef = doc(db, `liveStreams/${streamId}/tips`, tipId);
    await setDoc(tipRef, tipRecord);

    // 2. Increment stream totals
    const streamRef = doc(db, 'liveStreams', streamId);
    const incrementField = 
      tipData.currency === 'TON' ? 'totalTipsTon' : 
      tipData.currency === 'GRAM' ? 'totalTipsGram' : 'totalTipsTJ';
    
    await updateDoc(streamRef, {
      [incrementField]: increment(tipData.amount)
    });

    // 3. Post a high-visibility tip event in the stream chat
    await sendStreamChatMessage(streamId, {
      streamId,
      userId: tipData.senderId,
      userName: tipData.senderName,
      userAvatar: tipData.senderAvatar,
      userAddress: tipData.senderAddress,
      text: tipData.message || `Tipped ${tipData.amount} ${tipData.currency}! 🚀🔥`,
      type: 'tip',
      tipAmount: tipData.amount,
      tipCurrency: tipData.currency,
      userNfts: tipData.senderNfts,
      highestTierBadge: tipData.senderTier || 'Top Tipper',
      privileges: {
        glowEffect: true,
        badgeLabel: `💎 ${tipData.amount} ${tipData.currency} Tipper`,
        badgeColor: '#F59E0B'
      }
    });

    // 4. Record transaction in global transactions collection
    const txRef = collection(db, 'transactions');
    await addDoc(txRef, {
      userId: tipData.senderId,
      userName: tipData.senderName,
      type: 'livestream_tip',
      amount: tipData.amount,
      currency: tipData.currency,
      streamId,
      timestamp: serverTimestamp()
    });

  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `liveStreams/${streamId}/tips`);
  }

  return tipRecord;
};

/**
 * Submit a VIP / Viewer Song Request
 */
export const submitStreamSongRequest = async (
  streamId: string,
  requestData: Omit<LiveStreamSongRequest, 'id' | 'status' | 'createdAt'>
): Promise<LiveStreamSongRequest> => {
  const reqId = `sreq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newRequest: LiveStreamSongRequest = {
    ...requestData,
    id: reqId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, `liveStreams/${streamId}/songRequests`, reqId);
    await setDoc(docRef, newRequest);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `liveStreams/${streamId}/songRequests/${reqId}`);
  }

  return newRequest;
};
