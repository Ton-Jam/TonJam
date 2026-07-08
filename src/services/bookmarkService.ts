import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { LibraryTrack, LibraryNFT } from '@/pages/Library/types';
import { MOCK_LIBRARY_TRACKS, MOCK_LIBRARY_NFTS } from '@/pages/Library/mock';

export interface FirestoreBookmark {
  id: string; // matches postId
  userId: string;
  postId: string;
  content: string;
  postData: any;
  createdAt: any;
}

/**
 * Saves a bookmarked post reference to the user's subcollection in Firestore.
 */
export const saveBookmarkToFirestore = async (userId: string, post: any) => {
  if (!userId) return;
  try {
    const bookmarkRef = doc(db, 'users', userId, 'bookmarks', post.id);
    const cleanedPost = { ...post };
    // Remove replies or complex fields if present to avoid bulky storage, but preserve core data
    delete cleanedPost.replies;
    
    const bookmarkData: FirestoreBookmark = {
      id: post.id,
      userId,
      postId: post.id,
      content: post.content || '',
      postData: cleanedPost,
      createdAt: serverTimestamp()
    };
    
    await setDoc(bookmarkRef, bookmarkData);
    console.log(`[BookmarkService] Saved bookmark for post ${post.id} to Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/bookmarks/${post.id}`);
  }
};

/**
 * Removes a bookmarked post reference from the user's subcollection in Firestore.
 */
export const removeBookmarkFromFirestore = async (userId: string, postId: string) => {
  if (!userId) return;
  try {
    const bookmarkRef = doc(db, 'users', userId, 'bookmarks', postId);
    await deleteDoc(bookmarkRef);
    console.log(`[BookmarkService] Removed bookmark for post ${postId} from Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/bookmarks/${postId}`);
  }
};

/**
 * Syncs bookmarked items from Firestore to local storage and alerts components in real-time.
 * Returns unsubscribe function.
 */
export const syncBookmarksFromFirestore = (userId: string, callback?: (bookmarks: FirestoreBookmark[]) => void) => {
  if (!userId) {
    return () => {};
  }

  const bookmarksCollectionRef = collection(db, 'users', userId, 'bookmarks');
  
  console.log(`[BookmarkService] Starting real-time sync for user bookmarks: ${userId}`);

  return onSnapshot(bookmarksCollectionRef, (snapshot) => {
    const bookmarks: FirestoreBookmark[] = [];
    snapshot.forEach((doc) => {
      bookmarks.push(doc.data() as FirestoreBookmark);
    });

    console.log(`[BookmarkService] Synced ${bookmarks.length} bookmarks from Firestore.`);

    // 1. Extract tracks and NFTs from Firestore bookmarks
    const syncedTracks: LibraryTrack[] = [];
    const syncedNfts: LibraryNFT[] = [];

    bookmarks.forEach(bm => {
      const p = bm.postData;
      if (!p) return;

      const trackAttachment = p.attachments?.find((a: any) => a.type === 'track');
      const nftAttachment = p.attachments?.find((a: any) => a.type === 'nft');

      if (trackAttachment) {
        const tid = trackAttachment.id || `tr-${p.id}`;
        syncedTracks.push({
          id: tid,
          title: trackAttachment.title || 'Attached Track',
          artist: trackAttachment.artist || p.user?.name || 'Unknown Artist',
          artistId: p.user?.id ? `art-${p.user.id}` : 'art-unknown',
          album: 'Saved from JamSpace',
          coverUrl: p.user?.avatar || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&h=300&q=80',
          duration: 180,
          plays: 1,
          isLiked: true,
          isDownloaded: false,
          isOfflineAvailable: false,
          releaseDate: new Date().toISOString().split('T')[0]
        });
      }

      if (nftAttachment) {
        const nid = nftAttachment.id || `nft-${p.id}`;
        const floorPrice = parseFloat(nftAttachment.price?.replace(/[^0-9.]/g, '') || '10');
        syncedNfts.push({
          id: nid,
          tokenId: `#${Math.floor(Math.random() * 9000 + 1000)}`,
          title: nftAttachment.title || 'Saved NFT',
          artist: nftAttachment.artist || p.user?.name || 'Unknown Artist',
          coverUrl: nftAttachment.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&h=300&q=80',
          collectionName: 'Saved JamSpace Drops',
          floorPriceTon: floorPrice,
          royaltyPercent: 10,
          rarity: 'Rare',
          ownerAddress: 'UQAs9vW_3k7_pP3...',
          musicFileUrl: nftAttachment.url || 'https://tonjam.io/nft.mp3'
        });
      }
    });

    // 2. Load existing tracks & nfts from local storage to merge them
    let currentTracks: LibraryTrack[] = [];
    const localTracks = localStorage.getItem('tonjam_library_tracks');
    if (localTracks) {
      try { currentTracks = JSON.parse(localTracks); } catch (e) {}
    } else {
      currentTracks = [...MOCK_LIBRARY_TRACKS];
    }

    let currentNfts: LibraryNFT[] = [];
    const localNfts = localStorage.getItem('tonjam_library_nfts');
    if (localNfts) {
      try { currentNfts = JSON.parse(localNfts); } catch (e) {}
    } else {
      currentNfts = [...MOCK_LIBRARY_NFTS];
    }

    // 3. Remove existing "Saved from JamSpace" tracks/NFTs that are NOT in the synced list
    // This allows un-bookmarking on one device to sync and remove it from another!
    const syncedTrackIds = syncedTracks.map(t => t.id);
    const nonJamSpaceTracks = currentTracks.filter(t => t.album !== 'Saved from JamSpace');
    // Re-construct the list of tracks
    let updatedTracks = [...nonJamSpaceTracks];
    syncedTracks.forEach(st => {
      // Avoid duplicate titles or ids
      if (!updatedTracks.some(t => t.id === st.id || t.title.toLowerCase() === st.title.toLowerCase())) {
        updatedTracks.push(st);
      }
    });

    const syncedNftIds = syncedNfts.map(n => n.id);
    const nonJamSpaceNfts = currentNfts.filter(n => n.collectionName !== 'Saved JamSpace Drops');
    let updatedNfts = [...nonJamSpaceNfts];
    syncedNfts.forEach(sn => {
      if (!updatedNfts.some(n => n.id === sn.id || n.title.toLowerCase() === sn.title.toLowerCase())) {
        updatedNfts.push(sn);
      }
    });

    // 4. Save back to localStorage and trigger event to notify active pages/hooks
    localStorage.setItem('tonjam_library_tracks', JSON.stringify(updatedTracks));
    localStorage.setItem('tonjam_library_nfts', JSON.stringify(updatedNfts));
    
    console.log(`[BookmarkService] Local library synchronized. Tracks: ${updatedTracks.length}, NFTs: ${updatedNfts.length}`);
    window.dispatchEvent(new Event('tonjam_library_updated'));

    if (callback) {
      callback(bookmarks);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${userId}/bookmarks`);
  });
};
