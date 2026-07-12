import { Track, NFTItem, Transaction, RoyaltySplit, Royalty } from '../types';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp, increment, writeBatch } from 'firebase/firestore';

/**
 * Royalty Service
 * 
 * This service handles the calculation and distribution of royalties.
 */

export const PLATFORM_FEE_PERCENTAGE = 0.10; // 10% platform fee (5% from buyer + 5% from seller equivalent for off-chain calcs)

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
 * Distributes royalties for a transaction using a writeBatch for atomicity.
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
    const batch = writeBatch(db);

    // 1. Update Artist Balance (Using increment for concurrency control)
    const royaltyRef = doc(db, 'royalties', artistId);
    batch.set(royaltyRef, {
      artistId,
      totalEarned: increment(distribution.artistShare),
      pendingWithdrawal: increment(distribution.artistShare),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // 2. Update Collaborator Balances
    distribution.collaboratorShares.forEach(share => {
      // Use wallet address as ID if userId is not available
      const collabId = share.userId || share.address;
      if (collabId && share.amount > 0) {
        const collabRef = doc(db, 'royalties', collabId);
        batch.set(collabRef, {
          artistId: collabId, // Storing address as artistId if it's just an address
          totalEarned: increment(share.amount),
          pendingWithdrawal: increment(share.amount),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    });

    // 3. Record Transaction
    const txRef = doc(collection(db, 'transactions'));
    const participants = [artistId, auth.currentUser?.uid].filter(Boolean) as string[];
    const txData = {
      type,
      amount,
      userId: auth.currentUser?.uid || 'system',
      platformFee: distribution.platformFee,
      artistShare: distribution.artistShare,
      timestamp: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
      status: 'completed',
      participants,
      ...metadata
    };
    batch.set(txRef, txData);

    // 3. Update Treasury Fees
    if (distribution.platformFee > 0) {
      const treasuryRef = doc(db, 'system/treasury');
      batch.set(treasuryRef, {
        balance: increment(distribution.platformFee),
        totalFeesCollected: increment(distribution.platformFee),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    await batch.commit();
    console.log(`Royalty distribution complete for ${type}. Artist Share: ${distribution.artistShare}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'royalties');
  }
}

/**
 * Distributes NFT resale royalties automatically.
 * Platform Fee: 10%
 * Royalty Commission (Original Artist/Collabs): e.g. 10% (from splits, or fallback)
 * Seller (Current Owner) Proceeds: 80% (remaining)
 */
export async function distributeNFTRoyaltiesWithSeller(
  amount: number,
  artistId: string,
  sellerId: string,
  royaltySplits: RoyaltySplit[],
  metadata: Partial<Transaction> = {}
): Promise<void> {
  // 10% platform fee
  const platformFee = amount * PLATFORM_FEE_PERCENTAGE;
  
  // Calculate royalty commission (e.g. 10%)
  const royaltyCommissionPercent = 0.10;
  const totalRoyaltyCommission = amount * royaltyCommissionPercent;

  // Seller gets everything else
  const sellerProceeds = amount - platformFee - totalRoyaltyCommission;

  try {
    const batch = writeBatch(db);

    // 1. Credit the platform treasury
    if (platformFee > 0) {
      const treasuryRef = doc(db, 'system/treasury');
      batch.set(treasuryRef, {
        balance: increment(platformFee),
        totalFeesCollected: increment(platformFee),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 2. Credit the Original Artist (split)
    // If no custom splits, artist gets 100% of the royalty commission
    if (!royaltySplits || royaltySplits.length === 0) {
      const artistRef = doc(db, 'royalties', artistId);
      batch.set(artistRef, {
        artistId,
        totalEarned: increment(totalRoyaltyCommission),
        pendingWithdrawal: increment(totalRoyaltyCommission),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } else {
      // Split the royalty commission among co-creators
      const collaboratorShares = royaltySplits.map(split => ({
        address: split.address,
        amount: totalRoyaltyCommission * split.percentage,
        label: split.label,
      }));

      const totalCollabShare = collaboratorShares.reduce((sum, split) => sum + split.amount, 0);
      const artistShare = Math.max(0, totalRoyaltyCommission - totalCollabShare);

      if (artistShare > 0) {
        const artistRef = doc(db, 'royalties', artistId);
        batch.set(artistRef, {
          artistId,
          totalEarned: increment(artistShare),
          pendingWithdrawal: increment(artistShare),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      collaboratorShares.forEach(share => {
        const collabId = share.address;
        if (collabId && share.amount > 0) {
          const collabRef = doc(db, 'royalties', collabId);
          batch.set(collabRef, {
            artistId: collabId,
            totalEarned: increment(share.amount),
            pendingWithdrawal: increment(share.amount),
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      });
    }

    // 3. Credit the Seller (Current Owner)
    if (sellerId && sellerProceeds > 0) {
      const sellerRef = doc(db, 'royalties', sellerId);
      batch.set(sellerRef, {
        artistId: sellerId,
        totalEarned: increment(sellerProceeds),
        pendingWithdrawal: increment(sellerProceeds),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    // 4. Record Detailed Resale Transaction
    const txRef = doc(collection(db, 'transactions'));
    const participants = [artistId, sellerId, auth.currentUser?.uid].filter(Boolean) as string[];
    const txData = {
      type: 'nft_sale',
      amount,
      userId: auth.currentUser?.uid || 'system',
      platformFee,
      artistShare: totalRoyaltyCommission, // the creator royalty component
      sellerProceeds,
      timestamp: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
      status: 'completed',
      participants,
      ...metadata
    };
    batch.set(txRef, txData);

    await batch.commit();
    console.log(`NFT Royalty & Payout distribution complete. Seller proceeds: ${sellerProceeds}, Creator Royalty: ${totalRoyaltyCommission}`);
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
export async function processNFTSaleRoyalty(nft: NFTItem, salePrice: number, sellerId?: string) {
  const actualSellerId = sellerId || nft.ownerId || nft.owner || nft.creator || 'system_seller';
  await distributeNFTRoyaltiesWithSeller(
    salePrice,
    nft.artistId || nft.creator,
    actualSellerId,
    nft.royaltySplits || [],
    { nftId: nft.id, trackId: nft.trackId }
  );
}
