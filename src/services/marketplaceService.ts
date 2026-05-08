import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { NFTItem, Listing, Transaction } from '../types';
import { listNFTOnMarketplace, buyNFTFromMarketplace, cancelNFTListing } from './tonService';
import { processNFTSaleRoyalty } from './royaltyService';
import { TonConnectUI } from '@tonconnect/ui-react';

/**
 * Lists an NFT for sale in the marketplace
 */
export const listNFT = async (
  tonConnectUI: TonConnectUI,
  nft: NFTItem,
  price: string
): Promise<string> => {
  if (!auth.currentUser) throw new Error("User must be authenticated");
  if (!nft.contractAddress) throw new Error("NFT contract address is missing");

  // 1. Initiate TON blockchain transaction
  await listNFTOnMarketplace(tonConnectUI, nft.contractAddress, price);

  // 2. Create listing record in Firestore
  const listingRef = doc(collection(db, 'listings'));
  const listingId = listingRef.id;

  const listing: any = {
    id: listingId,
    nftId: nft.id,
    nftAddress: nft.contractAddress,
    sellerId: auth.currentUser.uid,
    price: price,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(listingRef, listing);

  // 3. Update NFT status in Firestore
  const nftRef = doc(db, 'nfts', nft.id);
  await updateDoc(nftRef, {
    listingType: 'fixed',
    price: price,
    listingId: listingId,
    updatedAt: new Date().toISOString()
  });

  return listingId;
};

/**
 * Buys an listed NFT
 */
export const buyNFT = async (
  tonConnectUI: TonConnectUI,
  listing: Listing,
  nft: NFTItem
): Promise<boolean> => {
  if (!auth.currentUser) throw new Error("User must be authenticated");
  if (!listing.nftId) throw new Error("NFT ID is missing in listing");

  // 1. Initiate TON blockchain transaction
  await buyNFTFromMarketplace(tonConnectUI, nft.contractAddress!, listing.price);

  // 2. Update listing record in Firestore
  const listingRef = doc(db, 'listings', listing.id);
  await updateDoc(listingRef, {
    status: 'sold',
    buyerId: auth.currentUser.uid,
    updatedAt: new Date().toISOString()
  });

  // 3. Update NFT ownership in Firestore
  const nftRef = doc(db, 'nfts', listing.nftId);
  await updateDoc(nftRef, {
    owner: auth.currentUser.uid,
    ownerId: auth.currentUser.uid,
    listingType: null,
    listingId: null,
    updatedAt: new Date().toISOString()
  });

  // 4. Record transaction and distribute royalties
  await processNFTSaleRoyalty(nft, parseFloat(listing.price));

  return true;
};

/**
 * Cancels an active listing
 */
export const cancelListing = async (
  tonConnectUI: TonConnectUI,
  listing: Listing,
  nft: NFTItem
): Promise<boolean> => {
  if (!auth.currentUser) throw new Error("User must be authenticated");
  if (auth.currentUser.uid !== listing.sellerId) throw new Error("Only the seller can cancel the listing");

  // 1. Initiate TON blockchain transaction
  await cancelNFTListing(tonConnectUI, nft.contractAddress!);

  // 2. Update listing record in Firestore
  const listingRef = doc(db, 'listings', listing.id);
  await updateDoc(listingRef, {
    status: 'cancelled',
    updatedAt: new Date().toISOString()
  });

  // 3. Update NFT status in Firestore
  const nftRef = doc(db, 'nfts', listing.nftId);
  await updateDoc(nftRef, {
    listingType: null,
    listingId: null,
    updatedAt: new Date().toISOString()
  });

  return true;
};

/**
 * Fetches active listings for an NFT
 */
export const getActiveListingForNFT = async (nftId: string): Promise<Listing | null> => {
  const listingsRef = collection(db, 'listings');
  const q = query(
    listingsRef, 
    where("nftId", "==", nftId), 
    where("status", "==", "active")
  );
  
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  
  return querySnapshot.docs[0].data() as Listing;
};

/**
 * Fetches all active listings
 */
export const getAllActiveListings = async (): Promise<Listing[]> => {
  const listingsRef = collection(db, 'listings');
  const q = query(listingsRef, where("status", "==", "active"));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Listing);
};
