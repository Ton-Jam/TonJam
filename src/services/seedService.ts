import { collection, getDocs, setDoc, doc, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { MOCK_TRACKS, MOCK_NFTS, MOCK_POSTS, MOCK_ARTISTS, MOCK_EVENTS } from '../constants';

export const seedDatabase = async (force = false) => {
  try {
    // Check if events collection is empty
    const eventsQuery = query(collection(db, 'events'), limit(1));
    const eventsSnapshot = await getDocs(eventsQuery);

    if (eventsSnapshot.empty || force) {
      console.log('Seeding events...');
      for (const event of MOCK_EVENTS) {
        try {
          console.log(`- Seeding event: ${event.id} (${event.title})`);
          await setDoc(doc(db, 'events', event.id), {
            ...event,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error(`Failed to seed event ${event.id}:`, err);
          throw err;
        }
      }
    }

    // Check if tracks collection is empty
    const tracksQuery = query(collection(db, 'tracks'), limit(1));
    const tracksSnapshot = await getDocs(tracksQuery);

    if (tracksSnapshot.empty || force) {
      console.log('Seeding tracks...');
      for (const track of MOCK_TRACKS) {
        try {
          console.log(`- Seeding track: ${track.id} (${track.title})`);
          await setDoc(doc(db, 'tracks', track.id), {
            ...track,
            artistName: track.artist,
            createdAt: force ? track.createdAt || new Date().toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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

    if (nftsSnapshot.empty || force) {
      console.log('Seeding nfts...');
      for (const nft of MOCK_NFTS) {
        try {
          console.log(`- Seeding nft: ${nft.id}`);
          await setDoc(doc(db, 'nfts', nft.id), {
            ...nft,
            ownerName: nft.owner,
            ownerId: 'system', // Default owner for seeded NFTs
            isListed: true,
            createdAt: force ? nft.createdAt || new Date().toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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

    if (postsSnapshot.empty || force) {
      console.log('Seeding posts...');
      for (const post of MOCK_POSTS) {
        try {
          console.log(`- Seeding post: ${post.id}`);
          await setDoc(doc(db, 'posts', post.id), {
            ...post,
            authorId: post.userId,
            authorName: post.userName,
            authorAvatar: post.userAvatar,
            timestamp: post.timestamp || new Date().toISOString(), // Always use a valid ISO string for seeding
            createdAt: force ? post.createdAt || new Date().toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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

    if (usersSnapshot.empty || force) {
      console.log('Seeding artists into users collection...');
      for (const artist of MOCK_ARTISTS) {
        try {
          console.log(`- Seeding artist user: ${artist.uid}`);
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
            earnings: artist.earnings?.total || 0,
            streamingEarnings: artist.earnings?.streaming || 0,
            nftEarnings: artist.earnings?.nftSales || 0,
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

    // Check if proposals collection is empty
    const proposalsQuery = query(collection(db, 'proposals'), limit(1));
    const proposalsSnapshot = await getDocs(proposalsQuery);

    if (proposalsSnapshot.empty || force) {
      console.log('Seeding proposals...');
      const MOCK_PROPOSALS = [
        {
          id: 'prop-1',
          creatorId: 'admin',
          creatorName: 'TonJam Foundation',
          title: 'Direct-to-Artist Royalty Increase',
          description: 'Proposed increase of on-chain streaming royalties from 90% to 95% for independent artists using the protocol.',
          status: 'active',
          category: 'Platform Change',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          forVotes: 1250,
          againstVotes: 120,
          voters: [],
          createdAt: new Date().toISOString()
        },
        {
          id: 'prop-2',
          creatorId: 'admin',
          creatorName: 'TonJam Foundation',
          title: 'DAO Treasury Allocation for Artist Grants',
          description: 'Allocate 50,000 JAM from the community treasury to fund 10 emerging experimental electronic artists.',
          status: 'active',
          category: 'Treasury',
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          forVotes: 890,
          againstVotes: 45,
          voters: [],
          createdAt: new Date().toISOString()
        },
        {
          id: 'prop-3',
          creatorId: 'admin',
          creatorName: 'TonJam Foundation',
          title: 'Implement Dark Mode as Default',
          description: 'Based on community feedback, we propose making the high-contrast Dark Mode the default configuration for all new users.',
          status: 'passed',
          category: 'Feature',
          startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          forVotes: 4500,
          againstVotes: 230,
          voters: [],
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      for (const proposal of MOCK_PROPOSALS) {
        try {
          console.log(`- Seeding proposal: ${proposal.id} (${proposal.title})`);
          await setDoc(doc(db, 'proposals', proposal.id), proposal);
        } catch (err) {
          console.error(`Failed to seed proposal ${proposal.id}:`, err);
          throw err;
        }
      }
    }

    // Check if validators collection is empty
    const validatorsQuery = query(collection(db, 'validators'), limit(1));
    const validatorsSnapshot = await getDocs(validatorsQuery);

    if (validatorsSnapshot.empty || force) {
      console.log('Seeding validators...');
      const MOCK_VALIDATORS = [
        { 
          id: 'validator-a',
          name: 'TonJam Node A', 
          apr: 15,
          uptime: 99.92,
          blocksValidated: '1,424,192',
          currentCommission: '5%',
          commissionHistory: [
            { date: 'Jan 26', fee: '8%' },
            { date: 'Mar 26', fee: '6%' },
            { date: 'May 26', fee: '5%' }
          ],
          selfStake: '250,000 TON',
          status: 'Active'
        },
        { 
          id: 'validator-b',
          name: 'TonJam Node B', 
          apr: 14,
          uptime: 99.45,
          blocksValidated: '984,204',
          currentCommission: '6%',
          commissionHistory: [
            { date: 'Jan 26', fee: '8%' },
            { date: 'Feb 26', fee: '7%' },
            { date: 'Apr 26', fee: '6%' }
          ],
          selfStake: '180,000 TON',
          status: 'Active'
        },
        { 
          id: 'validator-c',
          name: 'TonJam Node C', 
          apr: 13,
          uptime: 98.78,
          blocksValidated: '542,110',
          currentCommission: '8%',
          commissionHistory: [
            { date: 'Jan 26', fee: '9%' },
            { date: 'Mar 26', fee: '8.5%' },
            { date: 'May 26', fee: '8%' }
          ],
          selfStake: '120,000 TON',
          status: 'Active'
        }
      ];

      for (const validator of MOCK_VALIDATORS) {
        try {
          console.log(`- Seeding validator: ${validator.id} (${validator.name})`);
          await setDoc(doc(db, 'validators', validator.id), validator);
        } catch (err) {
          console.error(`Failed to seed validator ${validator.id}:`, err);
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
