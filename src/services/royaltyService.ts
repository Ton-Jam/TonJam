import { Track, NFTItem, Transaction, RoyaltySplit, Royalty } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp, increment } from 'firebase/firestore';

/**
 * Royalty Service
 * 
 * This service handles the calculation and distribution of royalties.
 */

export const PLATFORM_FEE_PERCENTAGE = 0.05; // 5% platform fee

export interface DistributionResult {
  platformFee: number;
  artistShare: number;
  collaboratorShares: { address: string; amount: number; label?: string; userId?: string }[];
  totalDistributed: number;
}

/**
 * Calculates royalty distribution for a given transaction amount and royalty splits.
 */
export function calculateRoyaltyDistribution(
  amount: number,
  royaltySplits: RoyaltySplit[] = []
): DistributionResult {
  const platformFee = amount * PLATFORM_FEE_PERCENTAGE;
  const distributableAmount = amount - platformFee;

  // If no splits, artist gets 100% of distributable amount
  if (!royaltySplits || royaltySplits.length === 0) {
    return {
      platformFee,
      artistShare: distributableAmount,
      collaboratorShares: [],
      totalDistributed: amount
    };
  }

  const collaboratorShares = royaltySplits.map(split => ({
    address: split.address,
    amount: distributableAmount * split.percentage,
    label: split.label,
    // In a real app, we'd map address to userId if needed
  }));

  const totalCollaboratorShare = collaboratorShares.reduce((sum, split) => sum + split.amount, 0);
  const artistShare = Math.max(0, distributableAmount - totalCollaboratorShare);

  return {
    platformFee,
    artistShare,
    collaboratorShares,
    totalDistributed: amount
  };
}

/**
 * Updates an artist's royalty balance in Firestore.
 */
async function updateRoyaltyBalance(userId: string, amount: number) {
  const royaltyRef = doc(db, 'royalties', userId);
  const royaltySnap = await getDoc(royaltyRef);

  if (royaltySnap.exists()) {
    await updateDoc(royaltyRef, {
      totalEarned: (parseFloat(royaltySnap.data().totalEarned) + amount).toString(),
      pendingWithdrawal: (parseFloat(royaltySnap.data().pendingWithdrawal) + amount).toString()
    });
  } else {
    await setDoc(royaltyRef, {
      artistId: userId,
      totalEarned: amount.toString(),
      pendingWithdrawal: amount.toString()
    });
  }
}

/**
 * Distributes royalties for a transaction.
 */
export async function distributeRoyalties(
  amount: number,
  artistId: string,
  royaltySplits: RoyaltySplit[],
  type: Transaction['type'],
  metadata: Partial<Transaction> = {}
): Promise<void> {
  const distribution = calculateRoyaltyDistribution(amount, royaltySplits);

  try {
    // 1. Update Artist Balance
    await updateRoyaltyBalance(artistId, distribution.artistShare);

    // 2. Update Collaborator Balances (if we have their userIds)
    // For simplicity, we assume royaltySplits might contain a userId or we'd have a lookup
    // In this demo, we'll just log collaborator distributions
    for (const split of distribution.collaboratorShares) {
      console.log(`Distributing ${split.amount} to ${split.address} (${split.label})`);
      // If split.address was a userId, we'd call updateRoyaltyBalance(split.address, split.amount);
    }

    // 3. Record Transactions
    const txData: Partial<Transaction> = {
      type,
      amount,
      platformFee: distribution.platformFee,
      artistShare: distribution.artistShare,
      timestamp: new Date().toISOString(),
      status: 'completed',
      ...metadata
    };

    await addDoc(collection(db, 'transactions'), txData);

    console.log(`Royalty distribution complete for ${type}. Artist Share: ${distribution.artistShare}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'royalties');
  }
}

/**
 * Process a stream royalty (micro-payment)
 */
export async function processStreamRoyalty(track: Track) {
  const STREAM_PAYMENT = 0.001; // 0.001 TON per stream
  await distributeRoyalties(
    STREAM_PAYMENT,
    track.artistId,
    track.royaltySplits || [],
    'stream',
    { trackId: track.id, trackTitle: track.title }
  );
}

/**
 * Process an NFT sale royalty
 */
export async function processNFTSaleRoyalty(nft: NFTItem, salePrice: number) {
  await distributeRoyalties(
    salePrice,
    nft.artistId || nft.creator,
    nft.royaltySplits || [],
    'nft_sale',
    { nftId: nft.id, trackId: nft.trackId }
  );
}
