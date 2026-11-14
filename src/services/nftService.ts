import { NFTItem } from '@/types';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';

/**
 * Fetches NFT metadata from Firestore by ID or contract address
 */
export const fetchNFTMetadata = async (nftIdOrAddress: string): Promise<NFTItem | null> => {
  if (!nftIdOrAddress) return null;
  try {
    const directRef = doc(db, 'nfts', nftIdOrAddress);
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) {
      return { id: directSnap.id, ...directSnap.data() } as NFTItem;
    }

    const byContract = query(
      collection(db, 'nfts'),
      where('contractAddress', '==', nftIdOrAddress),
      limit(1)
    );
    const contractSnap = await getDocs(byContract);
    if (!contractSnap.empty) {
      const d = contractSnap.docs[0];
      return { id: d.id, ...d.data() } as NFTItem;
    }

    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `nfts/${nftIdOrAddress}`);
    return null;
  }
};

/**
 * Fetches recorded NFT sale price points from Firestore `nftSales` collection.
 */
export const fetchFloorPriceHistory = async (
  collectionAddress: string
): Promise<{ date: string; price: number }[]> => {
  if (!collectionAddress) return [];
  try {
    const salesQuery = query(
      collection(db, 'nftSales'),
      orderBy('timestamp', 'asc'),
      limit(60)
    );
    const snap = await getDocs(salesQuery);
    if (snap.empty) return [];

    const points: { date: string; price: number }[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as any;
      if (
        !data.collectionAddress ||
        data.collectionAddress === collectionAddress ||
        data.nftId === collectionAddress
      ) {
        const priceNum = parseFloat(String(data.price || data.amount || 0));
        if (!isNaN(priceNum) && priceNum > 0) {
          const ts = data.timestamp?.toDate
            ? data.timestamp.toDate()
            : new Date(data.timestamp || Date.now());
          points.push({
            date: ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price: parseFloat(priceNum.toFixed(2)),
          });
        }
      }
    });
    return points;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'nftSales');
    return [];
  }
};
