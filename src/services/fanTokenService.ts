import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { FanTokenBalance, UnlockedExclusiveContent, ArtistPoll, ArtistPollVote } from '@/types';
import { toast } from 'sonner';

/**
 * Retrieves the fan token balance of a user for a specific artist
 */
export const getFanTokenBalance = async (userId: string, artistId: string): Promise<number> => {
  try {
    const docId = `${userId}_${artistId}`;
    const tokenDoc = await getDoc(doc(db, 'fanTokens', docId));
    if (tokenDoc.exists()) {
      return (tokenDoc.data() as FanTokenBalance).balance || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching fan token balance:', error);
    return 0;
  }
};

/**
 * Purchases fan tokens for an artist using user's JAM balance.
 * Exchange rate: 1 JAM = 10 Fan Tokens
 */
export const purchaseFanTokens = async (
  userId: string, 
  artistId: string, 
  artistName: string,
  amountToBuy: number, 
  costInJam: number
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User profile does not exist');
    }
    
    const userData = userDoc.data();
    const currentJam = userData.jamBalance || 0;
    
    if (currentJam < costInJam) {
      throw new Error(`Insufficient JAM balance. You need ${costInJam} JAM but only have ${currentJam.toFixed(2)} JAM.`);
    }
    
    // Deduct JAM balance
    await updateDoc(userRef, {
      jamBalance: currentJam - costInJam
    });
    
    // Update/Create Fan Token balance
    const docId = `${userId}_${artistId}`;
    const tokenRef = doc(db, 'fanTokens', docId);
    const tokenDoc = await getDoc(tokenRef);
    
    let newBalance = amountToBuy;
    if (tokenDoc.exists()) {
      newBalance = (tokenDoc.data().balance || 0) + amountToBuy;
    }
    
    await setDoc(tokenRef, {
      id: docId,
      userId,
      artistId,
      balance: newBalance,
      updatedAt: new Date().toISOString()
    } as FanTokenBalance);
    
    // Record Transaction
    const txId = `tx_${Date.now()}_ft`;
    await setDoc(doc(db, 'transactions', txId), {
      id: txId,
      userId,
      type: 'purchase_fan_tokens',
      amount: costInJam,
      status: 'completed',
      recipientAddress: artistName,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `purchaseFanTokens/${userId}_${artistId}`);
    throw error;
  }
};

/**
 * Awards fan tokens to a user for active engagement (e.g., listening to music)
 */
export const earnFanTokens = async (
  userId: string, 
  artistId: string, 
  amountToEarn: number,
  reason: string
): Promise<void> => {
  try {
    const docId = `${userId}_${artistId}`;
    const tokenRef = doc(db, 'fanTokens', docId);
    const tokenDoc = await getDoc(tokenRef);
    
    let newBalance = amountToEarn;
    if (tokenDoc.exists()) {
      newBalance = (tokenDoc.data().balance || 0) + amountToEarn;
    }
    
    await setDoc(tokenRef, {
      id: docId,
      userId,
      artistId,
      balance: newBalance,
      updatedAt: new Date().toISOString()
    } as FanTokenBalance);

    toast.success(`Earned +${amountToEarn} Fan Tokens for ${reason}!`);
  } catch (error) {
    console.error('Error earning fan tokens:', error);
  }
};

/**
 * Retrieves lists of exclusive content unlocked by the user
 */
export const getUnlockedContentIds = async (userId: string, artistId: string): Promise<string[]> => {
  try {
    const q = query(
      collection(db, 'unlockedContents'), 
      where('userId', '==', userId),
      where('artistId', '==', artistId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => (doc.data() as UnlockedExclusiveContent).contentId);
  } catch (error) {
    console.error('Error fetching unlocked contents:', error);
    return [];
  }
};

/**
 * Unlocks exclusive content by spending fan tokens
 */
export const unlockExclusiveContent = async (
  userId: string, 
  artistId: string, 
  contentId: string, 
  tokenCost: number
): Promise<void> => {
  try {
    const docId = `${userId}_${artistId}`;
    const tokenRef = doc(db, 'fanTokens', docId);
    const tokenDoc = await getDoc(tokenRef);
    
    if (!tokenDoc.exists()) {
      throw new Error('You do not own any fan tokens for this artist');
    }
    
    const currentBalance = tokenDoc.data().balance || 0;
    if (currentBalance < tokenCost) {
      throw new Error(`Insufficient tokens. Unlocking requires ${tokenCost} tokens, but you only have ${currentBalance} tokens.`);
    }
    
    // Deduct tokens
    await updateDoc(tokenRef, {
      balance: currentBalance - tokenCost,
      updatedAt: new Date().toISOString()
    });
    
    // Write Unlocked Content
    const unlockId = `${userId}_${contentId}`;
    await setDoc(doc(db, 'unlockedContents', unlockId), {
      id: unlockId,
      userId,
      artistId,
      contentId,
      unlockedAt: new Date().toISOString()
    } as UnlockedExclusiveContent);

  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `unlockExclusiveContent/${userId}_${contentId}`);
    throw error;
  }
};

/**
 * Creates decentralized governance poll for an artist
 */
export const createArtistPoll = async (
  artistId: string,
  artistName: string,
  question: string,
  options: string[],
  durationDays: number = 7
): Promise<string> => {
  try {
    const pollsRef = collection(db, 'artistPolls');
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + durationDays);
    
    const newPoll: Omit<ArtistPoll, 'id'> = {
      artistId,
      artistName,
      question,
      options,
      status: 'active',
      endTime: endTime.toISOString(),
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(pollsRef, newPoll);
    
    // Save generated id
    await updateDoc(doc(db, 'artistPolls', docRef.id), {
      id: docRef.id
    });
    
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'artistPolls');
    throw error;
  }
};

/**
 * Fetches all polls for an artist
 */
export const getArtistPolls = async (artistId: string): Promise<ArtistPoll[]> => {
  try {
    const q = query(
      collection(db, 'artistPolls'),
      where('artistId', '==', artistId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as ArtistPoll);
  } catch (error) {
    console.error('Error fetching artist polls:', error);
    return [];
  }
};

/**
 * Fetches voting results for a specific poll
 */
export const getPollVotes = async (pollId: string): Promise<ArtistPollVote[]> => {
  try {
    const q = query(collection(db, 'artistPolls', pollId, 'votes'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as ArtistPollVote);
  } catch (error) {
    console.error('Error fetching votes for poll:', pollId, error);
    return [];
  }
};

/**
 * Casts a weighted vote on an artist poll
 */
export const castVoteOnArtistPoll = async (
  pollId: string,
  userId: string,
  choiceIndex: number,
  votingPower: number
): Promise<void> => {
  try {
    const voteRef = doc(db, 'artistPolls', pollId, 'votes', userId);
    await setDoc(voteRef, {
      id: userId,
      pollId,
      userId,
      choiceIndex,
      weight: votingPower,
      votedAt: new Date().toISOString()
    } as ArtistPollVote);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `artistPolls/${pollId}/votes/${userId}`);
    throw error;
  }
};
