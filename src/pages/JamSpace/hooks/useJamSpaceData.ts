import { useState, useEffect, useMemo } from 'react';
import { Post, Space, Community, Event as JamEvent, JamSpaceNotification, User } from '../types';
import { toast } from 'sonner';
import { saveBookmarkToFirestore, removeBookmarkFromFirestore } from '../../../services/bookmarkService';
import { likePost, unlikePost, repostPost, unrepostPost, createPost } from '../../../services/socialService';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import {
  collection,
  query,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  orderBy,
} from 'firebase/firestore';
import useDebounce from '@/hooks/use-debounce';

export const useJamSpaceData = (currentUser?: { name?: string; email?: string; photoURL?: string; uid?: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [posts, setPosts] = useState<Post[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [events, setEvents] = useState<JamEvent[]>([]);
  const [notifications, setNotifications] = useState<JamSpaceNotification[]>([]);
  const [activeSpace, setActiveSpace] = useState<Space | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const user: User = useMemo(() => {
    const uid = currentUser?.uid || auth.currentUser?.uid || '';
    const displayName = currentUser?.name || auth.currentUser?.displayName || 'Guest';
    return {
      id: uid,
      name: displayName,
      username: uid ? `@${displayName.toLowerCase().replace(/\s+/g, '')}` : '@guest',
      avatar: currentUser?.photoURL || auth.currentUser?.photoURL || '',
      isVerified: false,
      contributionPoints: 0,
      badges: [],
      role: 'fan',
    };
  }, [currentUser]);

  // Subscribe to real Firestore streams
  useEffect(() => {
    const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
    const unsubPosts = onSnapshot(
      postsQuery,
      (snapshot) => {
        const loadedPosts: Post[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const authorName = data.userName || data.authorName || data.user?.name || 'TonJam Member';
          const authorId = data.userId || data.authorId || data.user?.id || '';
          const ts = data.createdAt?.toDate
            ? data.createdAt.toDate().toLocaleDateString()
            : String(data.timestamp || 'Just now');

          return {
            id: docSnap.id,
            user: data.user || {
              id: authorId,
              name: authorName,
              username: data.username || `@${authorName.toLowerCase().replace(/\s+/g, '')}`,
              avatar: data.userAvatar || data.authorPhoto || '',
              isVerified: Boolean(data.isVerified),
              contributionPoints: Number(data.contributionPoints || 0),
              badges: Array.isArray(data.badges) ? data.badges : [],
              role: data.role || 'fan',
            },
            content: data.content || data.text || '',
            attachments: Array.isArray(data.attachments) ? data.attachments : [],
            timestamp: ts,
            likes: Number(data.likes || data.likesCount || 0),
            commentsCount: Number(data.commentsCount || data.comments || 0),
            reposts: Number(data.reposts || data.repostsCount || 0),
            isPinned: Boolean(data.isPinned),
            category: data.category || 'General',
            isLiked: false,
            isReposted: false,
            isBookmarked: false,
            poll: data.poll,
            replies: Array.isArray(data.replies) ? data.replies : undefined,
          };
        });
        setPosts(loadedPosts);
        setIsLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'posts');
        setIsLoading(false);
      }
    );

    const spacesQuery = query(collection(db, 'liveStreams'), limit(25));
    const unsubSpaces = onSnapshot(
      spacesQuery,
      (snapshot) => {
        const loadedSpaces: Space[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || data.name || 'Live Space',
            name: data.name || data.title || 'Live Space',
            host: data.host || {
              id: data.artistId || data.ownerId || '',
              name: data.artistName || 'Host',
              username: '',
              avatar: data.artistAvatar || data.coverUrl || '',
              isVerified: true,
              contributionPoints: 0,
              badges: [],
              role: 'artist',
            },
            ownerId: data.artistId || data.ownerId || '',
            listenerCount: Number(data.viewersCount || data.listenerCount || 0),
            memberCount: Number(data.memberCount || data.viewersCount || 0),
            speakerAvatars: Array.isArray(data.speakerAvatars) ? data.speakerAvatars : [],
            isLive: data.status === 'live' || Boolean(data.isLive),
            scheduledTime: data.scheduledTime,
            description: data.description || '',
            speakers: Array.isArray(data.speakers) ? data.speakers : [],
            visibility: data.visibility || 'public',
            coverUrl: data.coverUrl || '',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          };
        });
        setSpaces(loadedSpaces);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'liveStreams');
      }
    );

    const communitiesQuery = query(collection(db, 'communities'), limit(30));
    const unsubCommunities = onSnapshot(
      communitiesQuery,
      (snapshot) => {
        const loadedCommunities: Community[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || 'Community',
            description: data.description || '',
            category: data.category || 'General',
            memberCount: Number(data.memberCount || 0),
            liveSpacesCount: Number(data.liveSpacesCount || 0),
            imageUrl: data.imageUrl || data.coverUrl || '',
            joined: Boolean(data.joined),
          };
        });
        setCommunities(loadedCommunities);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'communities');
      }
    );

    const eventsQuery = query(collection(db, 'events'), limit(30));
    const unsubEvents = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const loadedEvents: JamEvent[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || 'Event',
            type: data.type || 'space',
            date: data.date || '',
            location: data.location || '',
            imageUrl: data.imageUrl || data.coverUrl || '',
            host: data.host || data.artistName || 'TonJam Creator',
            interestedCount: Number(data.interestedCount || 0),
            interested: Boolean(data.interested),
          };
        });
        setEvents(loadedEvents);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'events');
      }
    );

    return () => {
      unsubPosts();
      unsubSpaces();
      unsubCommunities();
      unsubEvents();
    };
  }, []);

  // Auth-scoped notifications subscription
  useEffect(() => {
    const uid = currentUser?.uid || auth.currentUser?.uid;
    if (!uid) {
      setNotifications([]);
      return;
    }

    const notifQuery = query(collection(db, 'users', uid, 'notifications'), limit(25));
    const unsubNotif = onSnapshot(
      notifQuery,
      (snapshot) => {
        const loaded: JamSpaceNotification[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            type: data.type || 'mention',
            user: data.user || {
              id: data.actorId || '',
              name: data.actorName || 'TonJam',
              username: '',
              avatar: data.actorAvatar || '',
              isVerified: false,
              contributionPoints: 0,
              badges: [],
              role: 'fan',
            },
            content: data.content || data.message || '',
            timestamp: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : (data.timestamp || ''),
            read: Boolean(data.read),
          };
        });
        setNotifications(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${uid}/notifications`);
      }
    );

    return () => unsubNotif();
  }, [currentUser?.uid]);

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (activeCategory !== 'All') {
      if (activeCategory === 'For You') {
        result = result.sort((a, b) => (b.likes * 1.5 + b.reposts * 2) - (a.likes * 1.5 + a.reposts * 2));
      } else if (activeCategory === 'Trending') {
        result = result.sort((a, b) => (b.likes * 2 + b.reposts * 3 + b.commentsCount) - (a.likes * 2 + a.reposts * 3 + a.commentsCount));
      } else if (activeCategory === 'Following') {
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
        const catLower = activeCategory.toLowerCase();
        result = result.filter(p =>
          p.content.toLowerCase().includes(catLower) ||
          p.category.toLowerCase() === catLower
        );
      }
    }

    const safeSearchQuery = typeof debouncedSearchQuery === 'string' ? debouncedSearchQuery : '';
    if (safeSearchQuery.trim() !== '') {
      const q = safeSearchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.content.toLowerCase().includes(q) ||
        p.user.name.toLowerCase().includes(q) ||
        p.user.username.toLowerCase().includes(q)
      );
    }

    return result;
  }, [posts, activeCategory, debouncedSearchQuery]);

  const handleCreatePost = async (content: string, attachments?: Post['attachments'], pollOptions?: string[]) => {
    const uid = currentUser?.uid || auth.currentUser?.uid;
    if (!uid) {
      toast.info('Please sign in to publish a post');
      return;
    }

    try {
      await createPost(uid, user.name, user.avatar || null, content);
      if (attachments || pollOptions) {
        // Store rich payload if needed cleanly via posts
        void attachments;
        void pollOptions;
      }
      toast.success('Post published to JamSpace');
    } catch (err) {
      console.error('[useJamSpaceData] Failed to create post:', err);
      toast.error('Could not publish post');
    }
  };

  const handleLikePost = async (postId: string) => {
    const uid = currentUser?.uid || auth.currentUser?.uid;
    if (!uid) {
      toast.info('Please sign in to like posts');
      return;
    }

    let targetLiked = false;
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          targetLiked = isLiked;
          return {
            ...p,
            isLiked,
            likes: Math.max(0, isLiked ? p.likes + 1 : p.likes - 1),
          };
        }
        return p;
      })
    );

    try {
      if (targetLiked) {
        await likePost(postId, uid);
      } else {
        await unlikePost(postId, uid);
      }
    } catch (err) {
      console.error('[useJamSpaceData] Failed to update like in Firestore:', err);
    }
  };

  const handleRepostPost = async (postId: string) => {
    const uid = currentUser?.uid || auth.currentUser?.uid;
    if (!uid) {
      toast.info('Please sign in to repost');
      return;
    }

    let targetReposted = false;
    let postObj: Post | undefined;

    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === postId) {
          const isReposted = !p.isReposted;
          targetReposted = isReposted;
          postObj = p;
          return {
            ...p,
            isReposted,
            reposts: Math.max(0, isReposted ? p.reposts + 1 : p.reposts - 1),
          };
        }
        return p;
      })
    );

    try {
      if (targetReposted) {
        await repostPost(postId, uid, postObj);
        toast.success('Broadcasted post to your profile feed');
      } else {
        await unrepostPost(postId, uid);
        toast.success('Removed repost from your profile feed');
      }
    } catch (err) {
      console.error('[useJamSpaceData] Failed to update repost in Firestore:', err);
      toast.error('Failed to update repost');
    }
  };

  const handleBookmarkPost = async (postId: string) => {
    const uid = currentUser?.uid || auth.currentUser?.uid;
    if (!uid) {
      toast.info('Please sign in to bookmark posts');
      return;
    }

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

    if (foundPost) {
      if (foundPost.isBookmarked) {
        await saveBookmarkToFirestore(uid, foundPost);
        toast.success('Post bookmarked');
      } else {
        await removeBookmarkFromFirestore(uid, foundPost.id);
        toast.info('Bookmark removed');
      }
    }
  };

  const handleVotePoll = (postId: string, optionIndex: number) => {
    const uid = currentUser?.uid || auth.currentUser?.uid;
    if (!uid) {
      toast.info('Please sign in to vote');
      return;
    }

    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === postId && p.poll && p.poll.votedIndex === undefined) {
          const updatedOptions = [...p.poll.options];
          updatedOptions[optionIndex] = {
            ...updatedOptions[optionIndex],
            votes: updatedOptions[optionIndex].votes + 1,
          };
          return {
            ...p,
            poll: {
              ...p.poll,
              options: updatedOptions,
              totalVotes: p.poll.totalVotes + 1,
              votedIndex: optionIndex,
            },
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
        setActiveSpace(null);
      } else {
        setActiveSpace({
          ...target,
          listenerCount: target.listenerCount + 1,
          speakerAvatars: user.avatar ? [...target.speakerAvatars, user.avatar] : target.speakerAvatars,
        });
      }
    }
  };

  const handleCreateSpace = async (
    title: string,
    description: string,
    visibility: 'public' | 'private' = 'public',
    coverUrl?: string
  ): Promise<Space | null> => {
    const uid = currentUser?.uid || auth.currentUser?.uid;
    if (!uid) {
      toast.info('Please sign in to host a live space');
      return null;
    }

    try {
      const spaceData = {
        artistId: uid,
        artistName: user.name,
        artistAvatar: user.avatar || '',
        title: title.trim(),
        name: title.trim(),
        description: description?.trim() || '',
        visibility,
        coverUrl: coverUrl || '',
        status: 'live',
        isLive: true,
        viewersCount: 1,
        likesCount: 0,
        speakerAvatars: user.avatar ? [user.avatar] : [],
        speakers: [user.name],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'liveStreams'), spaceData);
      const created: Space = {
        id: docRef.id,
        title: spaceData.title,
        name: spaceData.name,
        description: spaceData.description,
        host: user,
        ownerId: uid,
        listenerCount: 1,
        memberCount: 1,
        speakerAvatars: spaceData.speakerAvatars,
        isLive: true,
        speakers: spaceData.speakers,
        visibility,
        coverUrl: spaceData.coverUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setActiveSpace(created);
      return created;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'liveStreams');
      return null;
    }
  };

  const handleToggleCommunity = (communityId: string) => {
    const uid = currentUser?.uid || auth.currentUser?.uid;
    if (!uid) {
      toast.info('Please sign in to join communities');
      return;
    }

    setCommunities(prev =>
      prev.map(c => {
        if (c.id === communityId) {
          const joined = !c.joined;
          return {
            ...c,
            joined,
            memberCount: Math.max(0, joined ? c.memberCount + 1 : c.memberCount - 1),
          };
        }
        return c;
      })
    );
  };

  const handleToggleEvent = (eventId: string) => {
    const uid = currentUser?.uid || auth.currentUser?.uid;
    if (!uid) {
      toast.info('Please sign in to RSVP to events');
      return;
    }

    setEvents(prev =>
      prev.map(e => {
        if (e.id === eventId) {
          const interested = !e.interested;
          return {
            ...e,
            interested,
            interestedCount: Math.max(0, interested ? e.interestedCount + 1 : e.interestedCount - 1),
          };
        }
        return e;
      })
    );
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
    const uid = currentUser?.uid || auth.currentUser?.uid;
    if (uid) {
      try {
        await updateDoc(doc(db, 'users', uid, 'notifications', notificationId), { read: true });
      } catch (err) {
        console.error('[useJamSpaceData] Failed to mark notification read:', err);
      }
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const uid = currentUser?.uid || auth.currentUser?.uid;
    if (uid) {
      await Promise.all(
        unread.map(n =>
          updateDoc(doc(db, 'users', uid, 'notifications', n.id), { read: true }).catch(() => {})
        )
      );
    }
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
    handleMarkAllNotificationsRead,
  };
};
