import { useState, useEffect, useMemo } from 'react';
import { Post, Space, Community, Event as JamEvent, JamSpaceNotification, User, Reply } from '../types';
import { MOCK_POSTS, MOCK_SPACES, MOCK_COMMUNITIES, MOCK_EVENTS, MOCK_NOTIFICATIONS, MOCK_USERS } from '../mock';
import { LibraryTrack, LibraryNFT } from '../../Library/types';
import { MOCK_LIBRARY_TRACKS, MOCK_LIBRARY_NFTS } from '../../Library/mock';
import { toast } from 'sonner';
import { saveBookmarkToFirestore, removeBookmarkFromFirestore } from '../../../services/bookmarkService';

export const useJamSpaceData = (currentUser?: { name?: string; email?: string; photoURL?: string; uid?: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [events, setEvents] = useState<JamEvent[]>([]);
  const [notifications, setNotifications] = useState<JamSpaceNotification[]>([]);
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Active user profile matching either the auth state or a fallback
  const user: User = useMemo(() => {
    return {
      id: 'current-user',
      name: currentUser?.name || 'Amapiano Pioneer',
      username: `@${(currentUser?.name || 'pioneer').toLowerCase().replace(/\s+/g, '')}`,
      avatar: currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      isVerified: true,
      contributionPoints: 1050,
      badges: ['⚡ Jam Champion', '🔊 Audiophile'],
      role: 'artist'
    };
  }, [currentUser]);

  // Premium loading simulation to reveal the skeleton system
  useEffect(() => {
    const timer = setTimeout(() => {
      // Initialize bookmarks from localStorage
      const localTracks = localStorage.getItem('tonjam_library_tracks');
      const localNfts = localStorage.getItem('tonjam_library_nfts');
      let savedTrackIds: string[] = [];
      let savedNftIds: string[] = [];
      let savedTrackTitles: string[] = [];
      let savedNftTitles: string[] = [];

      if (localTracks) {
        try {
          const tracksData: LibraryTrack[] = JSON.parse(localTracks);
          savedTrackIds = tracksData.map(t => t.id);
          savedTrackTitles = tracksData.map(t => t.title.toLowerCase());
        } catch (e) {}
      }
      if (localNfts) {
        try {
          const nftsData: LibraryNFT[] = JSON.parse(localNfts);
          savedNftIds = nftsData.map(n => n.id);
          savedNftTitles = nftsData.map(n => n.title.toLowerCase());
        } catch (e) {}
      }

      const initializedPosts = MOCK_POSTS.map(p => {
        const trackAttachment = p.attachments?.find(a => a.type === 'track');
        const nftAttachment = p.attachments?.find(a => a.type === 'nft');
        let isBookmarked = p.isBookmarked || false;

        if (trackAttachment) {
          const tid = trackAttachment.id || `tr-${p.id}`;
          const titleLower = trackAttachment.title?.toLowerCase() || '';
          if (savedTrackIds.includes(tid) || savedTrackTitles.includes(titleLower)) {
            isBookmarked = true;
          }
        }
        if (nftAttachment) {
          const nid = nftAttachment.id || `nft-${p.id}`;
          const titleLower = nftAttachment.title?.toLowerCase() || '';
          if (savedNftIds.includes(nid) || savedNftTitles.includes(titleLower)) {
            isBookmarked = true;
          }
        }

        return { ...p, isBookmarked };
      });

      setPosts(initializedPosts);
      setSpaces(MOCK_SPACES);
      setCommunities(MOCK_COMMUNITIES);
      setEvents(MOCK_EVENTS);
      setNotifications(MOCK_NOTIFICATIONS);
      setIsLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  // Keep bookmarks on posts in-sync with library changes
  useEffect(() => {
    const handleSync = () => {
      const localTracks = localStorage.getItem('tonjam_library_tracks');
      const localNfts = localStorage.getItem('tonjam_library_nfts');
      let savedTrackIds: string[] = [];
      let savedNftIds: string[] = [];
      let savedTrackTitles: string[] = [];
      let savedNftTitles: string[] = [];

      if (localTracks) {
        try {
          const tracksData: LibraryTrack[] = JSON.parse(localTracks);
          savedTrackIds = tracksData.map(t => t.id);
          savedTrackTitles = tracksData.map(t => t.title.toLowerCase());
        } catch (e) {}
      }
      if (localNfts) {
        try {
          const nftsData: LibraryNFT[] = JSON.parse(localNfts);
          savedNftIds = nftsData.map(n => n.id);
          savedNftTitles = nftsData.map(n => n.title.toLowerCase());
        } catch (e) {}
      }

      setPosts(prevPosts =>
        prevPosts.map(p => {
          const trackAttachment = p.attachments?.find(a => a.type === 'track');
          const nftAttachment = p.attachments?.find(a => a.type === 'nft');
          let isBookmarked = false;

          if (trackAttachment) {
            const tid = trackAttachment.id || `tr-${p.id}`;
            const titleLower = trackAttachment.title?.toLowerCase() || '';
            if (savedTrackIds.includes(tid) || savedTrackTitles.includes(titleLower)) {
              isBookmarked = true;
            }
          }
          if (nftAttachment) {
            const nid = nftAttachment.id || `nft-${p.id}`;
            const titleLower = nftAttachment.title?.toLowerCase() || '';
            if (savedNftIds.includes(nid) || savedNftTitles.includes(titleLower)) {
              isBookmarked = true;
            }
          }

          return { ...p, isBookmarked };
        })
      );
    };

    window.addEventListener('tonjam_library_updated', handleSync);
    return () => {
      window.removeEventListener('tonjam_library_updated', handleSync);
    };
  }, []);

  // Filter and Search logic
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (activeCategory !== 'All') {
      if (activeCategory === 'Following') {
        // Filter by artists/users you are following
        result = result.filter(p => p.user.role === 'artist' || p.user.isVerified);
      } else if (activeCategory === 'Artists') {
        result = result.filter(p => p.user.role === 'artist');
      } else if (activeCategory === 'Fans') {
        result = result.filter(p => p.user.role === 'fan');
      } else if (activeCategory === 'Spaces') {
        result = result.filter(p => p.category === 'Spaces' || p.poll);
      } else if (activeCategory === 'NFTs') {
        result = result.filter(p => p.category === 'NFTs' || p.attachments?.some(a => a.type === 'nft'));
      } else {
        // Genre matching (e.g. Amapiano, Afrobeats, Electronic)
        const catLower = activeCategory.toLowerCase();
        result = result.filter(p => 
          p.content.toLowerCase().includes(catLower) || 
          p.category.toLowerCase() === catLower
        );
      }
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.content.toLowerCase().includes(q) || 
        p.user.name.toLowerCase().includes(q) || 
        p.user.username.toLowerCase().includes(q)
      );
    }

    return result;
  }, [posts, activeCategory, searchQuery]);

  // Actions
  const handleCreatePost = (content: string, attachments?: Post['attachments'], pollOptions?: string[]) => {
    let poll = undefined;
    if (pollOptions && pollOptions.length > 0) {
      poll = {
        question: content.endsWith('?') ? content : 'Cast your vote:',
        options: pollOptions.map(text => ({ text, votes: 0 })),
        totalVotes: 0
      };
    }

    const newPost: Post = {
      id: `p-${Date.now()}`,
      user,
      content,
      attachments,
      timestamp: 'Just now',
      likes: 0,
      commentsCount: 0,
      reposts: 0,
      category: activeCategory === 'All' ? 'General' : activeCategory,
      isLiked: false,
      isReposted: false,
      isBookmarked: false,
      poll
    };

    setPosts([newPost, ...posts]);
  };

  const handleLikePost = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : p.likes - 1
          };
        }
        return p;
      })
    );
  };

  const handleRepostPost = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === postId) {
          const isReposted = !p.isReposted;
          return {
            ...p,
            isReposted,
            reposts: isReposted ? p.reposts + 1 : p.reposts - 1
          };
        }
        return p;
      })
    );
  };

  const handleBookmarkPost = (postId: string) => {
    let foundPost: Post | undefined;
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === postId) {
          const nextBookmarkState = !p.isBookmarked;
          foundPost = { ...p, isBookmarked: nextBookmarkState };
          return foundPost;
        }
        return p;
      })
    );

    // We do a brief timeout to let the state update complete and check attachments
    setTimeout(() => {
      if (!foundPost) return;

      const trackAttachment = foundPost.attachments?.find(a => a.type === 'track');
      const nftAttachment = foundPost.attachments?.find(a => a.type === 'nft');

      if (foundPost.isBookmarked) {
        let added = false;
        
        if (trackAttachment) {
          const localTracks = localStorage.getItem('tonjam_library_tracks');
          let currentTracks: LibraryTrack[] = [];
          if (localTracks) {
            try { currentTracks = JSON.parse(localTracks); } catch (e) {}
          } else {
            currentTracks = [...MOCK_LIBRARY_TRACKS];
          }

          const tid = trackAttachment.id || `tr-${postId}`;
          const exists = currentTracks.some(t => t.id === tid || t.title.toLowerCase() === trackAttachment.title?.toLowerCase());
          if (!exists) {
            const newTrack: LibraryTrack = {
              id: tid,
              title: trackAttachment.title || 'Attached Track',
              artist: trackAttachment.artist || foundPost.user.name,
              artistId: `art-${foundPost.user.id}`,
              album: 'Saved from JamSpace',
              coverUrl: foundPost.user.avatar || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&h=300&q=80',
              duration: 180,
              plays: 1,
              isLiked: true,
              isDownloaded: false,
              isOfflineAvailable: false,
              releaseDate: new Date().toISOString().split('T')[0]
            };
            currentTracks = [newTrack, ...currentTracks];
            localStorage.setItem('tonjam_library_tracks', JSON.stringify(currentTracks));
            added = true;
          }
        }

        if (nftAttachment) {
          const localNfts = localStorage.getItem('tonjam_library_nfts');
          let currentNfts: LibraryNFT[] = [];
          if (localNfts) {
            try { currentNfts = JSON.parse(localNfts); } catch (e) {}
          } else {
            currentNfts = [...MOCK_LIBRARY_NFTS];
          }

          const nid = nftAttachment.id || `nft-${postId}`;
          const exists = currentNfts.some(n => n.id === nid || n.title.toLowerCase() === nftAttachment.title?.toLowerCase());
          if (!exists) {
            const floorPrice = parseFloat(nftAttachment.price?.replace(/[^0-9.]/g, '') || '10');
            const newNft: LibraryNFT = {
              id: nid,
              tokenId: `#${Math.floor(Math.random() * 9000 + 1000)}`,
              title: nftAttachment.title || 'Saved NFT',
              artist: nftAttachment.artist || foundPost.user.name,
              coverUrl: nftAttachment.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&h=300&q=80',
              collectionName: 'Saved JamSpace Drops',
              floorPriceTon: floorPrice,
              royaltyPercent: 10,
              rarity: 'Rare',
              ownerAddress: 'UQAs9vW_3k7_pP3...',
              musicFileUrl: nftAttachment.url || 'https://tonjam.io/nft.mp3'
            };
            currentNfts = [newNft, ...currentNfts];
            localStorage.setItem('tonjam_library_nfts', JSON.stringify(currentNfts));
            added = true;
          }
        }

        if (added) {
          toast.success('Saved to Library', {
            description: 'This post\'s track/NFT has been added to your Decentralized Library.'
          });
          window.dispatchEvent(new Event('tonjam_library_updated'));
        } else {
          toast.info('Post Bookmarked', {
            description: 'The post reference has been saved.'
          });
        }
      } else {
        // Unbookmark
        let removed = false;

        if (trackAttachment) {
          const localTracks = localStorage.getItem('tonjam_library_tracks');
          if (localTracks) {
            try {
              const currentTracks: LibraryTrack[] = JSON.parse(localTracks);
              const tid = trackAttachment.id || `tr-${postId}`;
              const filtered = currentTracks.filter(t => t.id !== tid && t.title.toLowerCase() !== trackAttachment.title?.toLowerCase());
              if (filtered.length !== currentTracks.length) {
                localStorage.setItem('tonjam_library_tracks', JSON.stringify(filtered));
                removed = true;
              }
            } catch (e) {}
          }
        }

        if (nftAttachment) {
          const localNfts = localStorage.getItem('tonjam_library_nfts');
          if (localNfts) {
            try {
              const currentNfts: LibraryNFT[] = JSON.parse(localNfts);
              const nid = nftAttachment.id || `nft-${postId}`;
              const filtered = currentNfts.filter(n => n.id !== nid && n.title.toLowerCase() !== nftAttachment.title?.toLowerCase());
              if (filtered.length !== currentNfts.length) {
                localStorage.setItem('tonjam_library_nfts', JSON.stringify(filtered));
                removed = true;
              }
            } catch (e) {}
          }
        }

        if (removed) {
          toast.success('Removed from Library', {
            description: 'The track/NFT has been removed from your library.'
          });
          window.dispatchEvent(new Event('tonjam_library_updated'));
        } else {
          toast.info('Bookmark Removed');
        }
      }

      if (currentUser?.uid) {
        if (foundPost.isBookmarked) {
          saveBookmarkToFirestore(currentUser.uid, foundPost);
        } else {
          removeBookmarkFromFirestore(currentUser.uid, foundPost.id);
        }
      }
    }, 50);
  };

  const handleVotePoll = (postId: string, optionIndex: number) => {
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === postId && p.poll && p.poll.votedIndex === undefined) {
          const updatedOptions = [...p.poll.options];
          updatedOptions[optionIndex] = {
            ...updatedOptions[optionIndex],
            votes: updatedOptions[optionIndex].votes + 1
          };
          return {
            ...p,
            poll: {
              ...p.poll,
              options: updatedOptions,
              totalVotes: p.poll.totalVotes + 1,
              votedIndex: optionIndex
            }
          };
        }
        return p;
      })
    );
  };

  const handleJoinSpace = (spaceId: string) => {
    const target = spaces.find(s => s.id === spaceId);
    if (target) {
      if (activeSpace?.id === spaceId) {
        // Toggle off
        setActiveSpace(null);
      } else {
        // Join space
        setActiveSpace({
          ...target,
          listenerCount: target.listenerCount + 1,
          speakerAvatars: [...target.speakerAvatars, user.avatar]
        });
      }
    }
  };

  const handleCreateSpace = (title: string, description: string) => {
    const newSpace: Space = {
      id: `s-${Date.now()}`,
      title,
      description,
      host: user,
      listenerCount: 1,
      speakerAvatars: [user.avatar],
      isLive: true,
      speakers: [user.name]
    };

    setSpaces([newSpace, ...spaces]);
    setActiveSpace(newSpace);
  };

  const handleToggleCommunity = (communityId: string) => {
    setCommunities(prev =>
      prev.map(c => {
        if (c.id === communityId) {
          const joined = !c.joined;
          return {
            ...c,
            joined,
            memberCount: joined ? c.memberCount + 1 : c.memberCount - 1
          };
        }
        return c;
      })
    );
  };

  const handleToggleEvent = (eventId: string) => {
    setEvents(prev =>
      prev.map(e => {
        if (e.id === eventId) {
          const interested = !e.interested;
          return {
            ...e,
            interested,
            interestedCount: interested ? e.interestedCount + 1 : e.interestedCount - 1
          };
        }
        return e;
      })
    );
  };

  const handleMarkNotificationRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return {
    isLoading,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    posts: filteredPosts,
    rawPosts: posts,
    spaces,
    communities,
    events,
    notifications,
    activeSpace,
    setActiveSpace,
    showNotifications,
    setShowNotifications,
    isDarkMode,
    setIsDarkMode,
    user,
    handleCreatePost,
    handleLikePost,
    handleRepostPost,
    handleBookmarkPost,
    handleVotePoll,
    handleJoinSpace,
    handleCreateSpace,
    handleToggleCommunity,
    handleToggleEvent,
    handleMarkNotificationRead,
    handleMarkAllNotificationsRead
  };
};
