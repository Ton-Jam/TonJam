import { collection, query, where, getDocs, doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { NFTItem, NFTOffer, Transaction } from '../types';
import { processNFTSaleRoyalty } from './royaltyService';

export const resolveEndedAuctions = async () => {
  try {
    // If the browser or environment is offline, skip background auction resolution
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) return; // Only signed-in users can execute writes

    let isAdmin = false;
    try {
      const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
      isAdmin = adminDoc.exists();
    } catch (adminErr: any) {
      // If offline or permission denied, fallback to false without crashing
      const msg = adminErr?.message || String(adminErr);
      if (msg.includes('offline') || adminErr?.code === 'unavailable') {
        return;
      }
      isAdmin = false;
    }

    const today = new Date().toISOString();
    // Query for all active auctions
    const nftsRef = collection(db, 'nfts');
    const q = query(
      nftsRef,
      where('listingType', '==', 'auction')
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    let hasChanges = false;

    for (const docSnapshot of snapshot.docs) {
      const nft = { id: docSnapshot.id, ...docSnapshot.data() } as NFTItem;
      
      // Only resolve if current user is admin or original NFT owner/seller
      const isOwner = nft.ownerId === currentUser.uid || nft.owner === currentUser.uid || nft.artistId === currentUser.uid;
      if (!isAdmin && !isOwner) {
        continue;
      }

      // If it's an auction and the end date is in the past
      if (nft.auctionEndTime && new Date(nft.auctionEndTime).getTime() <= new Date().getTime()) {
        const nftRef = doc(db, 'nfts', nft.id);
        hasChanges = true;
        
        let highestBidder: string | undefined;
        let highestBid: number = 0;
        let winningOffer: NFTOffer | undefined;
        
        if (nft.offers && nft.offers.length > 0) {
          // Find the highest offer
          const sortedOffers = [...nft.offers].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          winningOffer = sortedOffers[0];
          highestBid = parseFloat(winningOffer.price);
          highestBidder = winningOffer.offerer;
        }

        if (highestBidder && highestBid > 0) {
          // Complete the auction with a winner
          batch.update(nftRef, {
            listingType: null,
            isAuction: false,
            auctionEndTime: null,
            auctionEndDate: null,
            startingBid: null,
            owner: highestBidder,
            ownerId: highestBidder,
            price: highestBid.toString(),
            updatedAt: serverTimestamp()
          });
          
          // After commit, process royalties/seller payout explicitly
          // We queue this for after the batch commit
          setTimeout(async () => {
            try {
              await processNFTSaleRoyalty(nft, highestBid);
              console.log(`Auction ended for ${nft.id}. Winner: ${highestBidder} with ${highestBid} TON.`);
            } catch (royaltyError) {
              console.error("Failed to process royalty for auction win:", royaltyError);
            }
          }, 0);
        } else {
          // No bids - simply end the auction and return to owner (remove listing)
          batch.update(nftRef, {
            listingType: null,
            isAuction: false,
            auctionEndTime: null,
            auctionEndDate: null,
            startingBid: null,
            offers: [], // Clear any stale bid signals
            updatedAt: serverTimestamp()
          });
          console.log(`Auction ended without bids for ${nft.id}.`);
        }
      }
    }

    if (hasChanges) {
      await batch.commit();
    }
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    const errorCode = error?.code;
    if (
      errorMsg.includes('offline') ||
      errorCode === 'unavailable' ||
      errorMsg.includes('client is offline') ||
      errorMsg.includes('network')
    ) {
      // Gracefully handle offline Firestore state
      console.info("[auctionService] Network offline, skipping auction resolution until reconnected.");
    } else {
      console.warn("[auctionService] Auction resolution check notice:", errorMsg);
    }
  }
};
