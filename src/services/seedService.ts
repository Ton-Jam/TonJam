// import { collection, getDocs, addDoc, serverTimestamp, query, limit } from 'firebase/firestore';
// import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { MOCK_TRACKS, MOCK_NFTS, MOCK_POSTS, MOCK_ARTISTS } from '../constants';

export const seedDatabase = async () => {
  console.log('Database seeding skipped (Firebase removed).');
  /*
  try {
    // Check if tracks collection is empty
    const tracksQuery = query(collection(db, 'tracks'), limit(1));
    const tracksSnapshot = await getDocs(tracksQuery);

    if (tracksSnapshot.empty) {
      console.log('Seeding tracks...');
      for (const track of MOCK_TRACKS) {
        await addDoc(collection(db, 'tracks'), {
          ...track,
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
        await addDoc(collection(db, 'nfts'), {
          ...nft,
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
        await addDoc(collection(db, 'posts'), {
          ...post,
          createdAt: serverTimestamp(),
        });
      }
    }

    console.log('Database seeding completed.');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seeding');
  }
  */
};
