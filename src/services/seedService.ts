import { collection, getDocs, setDoc, doc, query, limit } from 'firebase/firestore';
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
        try {
          await setDoc(doc(db, 'tracks', track.id), {
            ...track,
            artistName: track.artist,
            createdAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error(`Failed to seed track ${track.id}:`, err);
          throw err;
        }
      }
    }

    // Check if nfts collection is empty
    const nftsQuery = query(collection(db, 'nfts'), limit(1));
    const nftsSnapshot = await getDocs(nftsQuery);

    if (nftsSnapshot.empty) {
      console.log('Seeding nfts...');
      for (const nft of MOCK_NFTS) {
        try {
          await setDoc(doc(db, 'nfts', nft.id), {
            ...nft,
            ownerName: nft.owner,
            ownerId: 'system', // Default owner for seeded NFTs
            isListed: true,
            createdAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error(`Failed to seed nft ${nft.id}:`, err);
          throw err;
        }
      }
    }

    // Check if posts collection is empty
    const postsQuery = query(collection(db, 'posts'), limit(1));
    const postsSnapshot = await getDocs(postsQuery);

    if (postsSnapshot.empty) {
      console.log('Seeding posts...');
      for (const post of MOCK_POSTS) {
        try {
          await setDoc(doc(db, 'posts', post.id), {
            ...post,
            authorId: post.userId,
            authorName: post.userName,
            authorAvatar: post.userAvatar,
            timestamp: new Date().toISOString(), // Always use a valid ISO string for seeding
            createdAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error(`Failed to seed post ${post.id}:`, err);
          throw err;
        }
      }
    }

    // Check if users collection is empty (seeds for artists)
    const usersQuery = query(collection(db, 'users'), limit(1));
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
      console.log('Seeding artists into users collection...');
      for (const artist of MOCK_ARTISTS) {
        try {
          await setDoc(doc(db, 'users', artist.uid), {
            uid: artist.uid,
            name: artist.name,
            username: artist.name.toLowerCase().replace(/\s+/g, '_'),
            email: `${artist.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            avatar: artist.avatarUrl,
            bannerUrl: artist.bannerUrl,
            bio: artist.bio,
            isVerifiedArtist: true,
            role: 'artist',
            walletAddress: artist.walletAddress || '',
            followers: artist.followers || 0,
            following: 0,
            earnings: 0,
            streamingEarnings: 0,
            nftEarnings: 0,
            jamBalance: 500,
            stakedJam: 0,
            pendingJamRewards: 0,
            likedTrackIds: [],
            followedUserIds: [],
            createdAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error(`Failed to seed artist user ${artist.uid}:`, err);
          throw err;
        }
      }
    }

    console.log('Database seeding completed.');
  } catch (error) {
    // Determine which collection failed based on the error or context
    // Since we are in a loop, we can't easily know which one failed without more complex logic
    // but we can at least log the error more clearly
    console.error('Seeding error:', error);
    handleFirestoreError(error, OperationType.WRITE, 'seeding');
  }
};
