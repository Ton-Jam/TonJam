import { collection, getDocs, addDoc, serverTimestamp, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { MOCK_TRACKS, MOCK_NFTS, MOCK_POSTS, MOCK_ARTISTS } from '../constants';

export const seedDatabase = async () => {
  try {
    // Check if tracks collection is empty
    const tracksQuery = query(collection(db, 'tracks'), limit(1));
    const tracksSnapshot = await getDocs(tracksQuery);

    if (tracksSnapshot.empty) {
      console.log('Seeding tracks...');
      for (const track of MOCK_TRACKS) {
        const { artist, ...rest } = track;
        await addDoc(collection(db, 'tracks'), {
          ...rest,
          artistName: artist,
          createdAt: serverTimestamp(),
        });
      }
    }

    // Check if nfts collection is empty
    const nftsQuery = query(collection(db, 'nfts'), limit(1));
    const nftsSnapshot = await getDocs(nftsQuery);

    if (nftsSnapshot.empty) {
      console.log('Seeding nfts...');
      for (const nft of MOCK_NFTS) {
        const { owner, ...rest } = nft;
        await addDoc(collection(db, 'nfts'), {
          ...rest,
          ownerName: owner,
          ownerId: 'system', // Default owner for seeded NFTs
          isListed: true,
          createdAt: serverTimestamp(),
        });
      }
    }

    // Check if posts collection is empty
    const postsQuery = query(collection(db, 'posts'), limit(1));
    const postsSnapshot = await getDocs(postsQuery);

    if (postsSnapshot.empty) {
      console.log('Seeding posts...');
      for (const post of MOCK_POSTS) {
        const { userId, userName, userAvatar, ...rest } = post;
        await addDoc(collection(db, 'posts'), {
          ...rest,
          authorId: userId,
          authorName: userName,
          authorPhoto: userAvatar,
          createdAt: serverTimestamp(),
        });
      }
    }

    // Check if artists collection is empty
    const artistsQuery = query(collection(db, 'artists'), limit(1));
    const artistsSnapshot = await getDocs(artistsQuery);

    if (artistsSnapshot.empty) {
      console.log('Seeding artists...');
      for (const artist of MOCK_ARTISTS) {
        await addDoc(collection(db, 'artists'), {
          ...artist,
          createdAt: serverTimestamp(),
        });
      }
    }

    console.log('Database seeding completed.');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seeding');
  }
};
