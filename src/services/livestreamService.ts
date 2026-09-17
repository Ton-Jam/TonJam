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

// Default initial active live streams to ensure the app is immediately alive and populated
export const SEED_LIVESTREAMS: LiveStreamSession[] = [
  {
    id: 'stream_dj_krupy_genesis',
    title: '🎧 DJ Krupy Live: TON Cyberpunk & Future Bass Studio Jam',
    description: 'Exclusive live synth performance, testing unreleased stems from the Genesis Album, and real-time interactive remixing with holders!',
    artistId: 'artist_dj_krupy',
    artistName: 'DJ Krupy',
    artistAvatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400',
    artistHandle: '@djkrupy',
    artistAddress: 'EQBvW8Z5huBkMJYdn3PCDnvdQwg5261DDq',
    artistVerified: true,
    status: 'live',
    category: 'DJ Set',
    tags: ['FutureBass', 'TONGenesis', 'LiveStems', 'ModularSynth'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200',
    videoSourceType: 'stage_visualizer',
    streamVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    viewerCount: 1420,
    peakViewers: 1890,
    totalTipsTon: 142.5,
    totalTipsGram: 8500,
    totalTipsTJ: 34000,
    startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    nftGated: false,
    quality: '1080p60',
    pinnedAnnouncement: {
      text: '💎 Genesis NFT Holders: Type your stem remix requests in chat for instant priority queue!',
      author: 'DJ Krupy (Host)',
      timestamp: '10 mins ago',
      isVip: true
    },
    currentSongPlaying: {
      title: 'Neon Odyssey (VIP Stem Live Mix)',
      artist: 'DJ Krupy',
      coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300',
      genre: 'Future Bass'
    }
  },
  {
    id: 'stream_aara_vocals_live',
    title: '✨ Aara: Acoustic Sunset & Live NFT Mint Reveal',
    description: 'Chill acoustic session featuring live guitar, soulful vocal loops, and exclusive preview of the upcoming "Lumina Horizon" sonic artifact.',
    artistId: 'artist_aara_vocal',
    artistName: 'Aara Nova',
    artistAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    artistHandle: '@aaranova',
    artistAddress: 'EQC7X8z5huBkMJYdn3PCDnvdQwg8891AAp',
    artistVerified: true,
    status: 'live',
    category: 'Acoustic Lounge',
    tags: ['Acoustic', 'VocalLooper', 'NFTReveal', 'Chill'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200',
    videoSourceType: 'stage_visualizer',
    viewerCount: 890,
    peakViewers: 1120,
    totalTipsTon: 98.0,
    totalTipsGram: 4200,
    totalTipsTJ: 18500,
    startedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    nftGated: false,
    quality: '1080p60',
    pinnedAnnouncement: {
      text: '🌸 Dropping 5 free whitelist passes to the top tippers at the end of the set!',
      author: 'Aara Nova',
      timestamp: '5 mins ago',
      isVip: true
    },
    currentSongPlaying: {
      title: 'Solstice Echoes (Live Acoustic)',
      artist: 'Aara Nova',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300',
      genre: 'Acoustic Indie'
    }
  },
  {
    id: 'stream_beatmaster_ton',
    title: '🔥 Phonk & Drift Beats: 1-Hour Speed Production Challenge',
    description: 'Making 3 dark phonk tracks in 60 minutes from fan sound samples sent via live tips. Royalty splits distributed to chat participants!',
    artistId: 'artist_k_drift',
    artistName: 'K-Drift',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    artistHandle: '@kdrift_beats',
    artistAddress: 'EQDf99Z5huBkMJYdn3PCDnvdQwg0011ZKp',
    artistVerified: true,
    status: 'live',
    category: 'Beat Making',
    tags: ['Phonk', 'Ableton', 'SpeedRun', 'RoyaltySplit'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1200',
    videoSourceType: 'stage_visualizer',
    viewerCount: 654,
    peakViewers: 820,
    totalTipsTon: 54.2,
    totalTipsGram: 3100,
    totalTipsTJ: 12000,
    startedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    nftGated: false,
    quality: '720p',
    currentSongPlaying: {
      title: 'Midnight Tokyo 808 Drive',
      artist: 'K-Drift',
      coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=300',
      genre: 'Drift Phonk'
    }
  }
];

export const INITIAL_MOCK_MESSAGES: Record<string, LiveStreamChatMessage[]> = {
  stream_dj_krupy_genesis: [
    {
      id: 'msg_1',
      streamId: 'stream_dj_krupy_genesis',
      userId: 'user_ton_whale',
      userName: 'SatoshiTon',
      userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SatoshiTon',
      userAddress: 'EQB...49a1',
      text: 'Let’s go Krupy!! The drop on that lead synth is unbelievable 🔥⚡',
      timestamp: 'Just now',
      type: 'chat',
      highestTierBadge: 'Genesis VIP',
      userNfts: [
        { id: 'nft_genesis_1', title: 'TonJam Genesis Gold Pass #042', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300', rarity: 'Legendary', isGenesis: true }
      ],
      privileges: {
        glowEffect: true,
        canPriorityPinQA: true,
        canRequestSongs: true,
        badgeLabel: 'Genesis VIP',
        badgeColor: '#F59E0B'
      }
    },
    {
      id: 'msg_2',
      streamId: 'stream_dj_krupy_genesis',
      userId: 'user_tipper_1',
      userName: 'VaporKnight',
      userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=VaporKnight',
      userAddress: 'EQC...88f2',
      text: 'Tipped 10 TON for the incredible set! Drop the heavy bassline next!',
      timestamp: '1m ago',
      type: 'tip',
      tipAmount: 10,
      tipCurrency: 'TON',
      highestTierBadge: 'Diamond Holder',
      userNfts: [
        { id: 'nft_neon_1', title: 'Cyber Dimension NFT', imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=300', rarity: 'Rare' }
      ],
      privileges: {
        glowEffect: true,
        badgeLabel: 'Diamond Holder',
        badgeColor: '#00B4D8'
      }
    },
    {
      id: 'msg_3',
      streamId: 'stream_dj_krupy_genesis',
      userId: 'artist_dj_krupy',
      userName: 'DJ Krupy',
      userAvatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400',
      text: 'Huge thanks to @VaporKnight and all Genesis holders in the chat right now! Loading up the 808 sub bass!',
      timestamp: '1m ago',
      type: 'chat',
      isHost: true,
      isArtist: true,
      highestTierBadge: 'Artist VIP'
    },
    {
      id: 'msg_4',
      streamId: 'stream_dj_krupy_genesis',
      userId: 'user_collector_99',
      userName: 'AuraEcho',
      userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AuraEcho',
      text: 'Can you preview track #4 from the mint catalog? Holding 3 copies of your debut!',
      timestamp: '2m ago',
      type: 'qa',
      highestTierBadge: 'Collector',
      userNfts: [
        { id: 'nft_krupy_single', title: 'Neon Odyssey Single NFT', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300' }
      ]
    }
  ]
};

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
    imageUrl: nft.imageUrl || nft.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300',
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
 * Fetch all active live streams
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
    
    if (!snapshot.empty) {
      const liveList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LiveStreamSession));
      // Merge with seed streams if less than 3 for vibrant showcase
      const existingIds = new Set(liveList.map(s => s.id));
      const combined = [...liveList, ...SEED_LIVESTREAMS.filter(s => !existingIds.has(s.id))];
      return combined;
    }
  } catch (error) {
    console.warn('[LivestreamService] Error loading live streams from firestore, using cached seed:', error);
  }

  // Return seed streams stored in localStorage or default
  const local = localStorage.getItem('tonjam_livestreams');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  return SEED_LIVESTREAMS;
};

/**
 * Fetch a single live stream session by ID
 */
export const getLiveStreamById = async (streamId: string): Promise<LiveStreamSession | null> => {
  try {
    const docRef = doc(db, 'liveStreams', streamId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as LiveStreamSession;
    }
  } catch (error) {
    console.warn('[LivestreamService] Firestore getLiveStreamById fallback:', error);
  }

  // Fallback to seeds or localStorage
  const foundSeed = SEED_LIVESTREAMS.find(s => s.id === streamId);
  if (foundSeed) return foundSeed;

  const local = localStorage.getItem('tonjam_livestreams');
  if (local) {
    try {
      const parsed: LiveStreamSession[] = JSON.parse(local);
      const matched = parsed.find(s => s.id === streamId);
      if (matched) return matched;
    } catch {}
  }

  return null;
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
    console.warn('[LivestreamService] Firestore createLiveStream error, saving locally:', error);
  }

  // Update local storage
  const current = await getActiveLiveStreams();
  const updated = [fullSession, ...current.filter(s => s.id !== newId)];
  localStorage.setItem('tonjam_livestreams', JSON.stringify(updated));

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
    console.warn('[LivestreamService] Firestore updateLiveStreamSession fallback:', error);
  }

  // Update local cache
  const local = localStorage.getItem('tonjam_livestreams');
  if (local) {
    try {
      const list: LiveStreamSession[] = JSON.parse(local);
      const next = list.map(s => s.id === streamId ? { ...s, ...updates } : s);
      localStorage.setItem('tonjam_livestreams', JSON.stringify(next));
    } catch {}
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
  try {
    const q = query(
      collection(db, `liveStreams/${streamId}/messages`),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LiveStreamChatMessage));
        callback(msgs);
      } else {
        // Use initial mock messages if firestore is empty
        const initial = INITIAL_MOCK_MESSAGES[streamId] || [];
        callback(initial);
      }
    }, (err) => {
      console.warn('[LivestreamService] onSnapshot error, using local/mock chat:', err);
      callback(INITIAL_MOCK_MESSAGES[streamId] || []);
    });

    return unsubscribe;
  } catch (error) {
    console.warn('[LivestreamService] Chat listener fallback:', error);
    callback(INITIAL_MOCK_MESSAGES[streamId] || []);
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
    console.warn('[LivestreamService] Error posting chat message to firestore:', error);
  }

  // Update in-memory seed cache for immediate responsive feedback
  if (!INITIAL_MOCK_MESSAGES[streamId]) {
    INITIAL_MOCK_MESSAGES[streamId] = [];
  }
  INITIAL_MOCK_MESSAGES[streamId].push(message);

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
    console.warn('[LivestreamService] Error writing tip to firestore, processed locally:', error);
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
    console.warn('[LivestreamService] Song request firestore write:', error);
  }

  return newRequest;
};
