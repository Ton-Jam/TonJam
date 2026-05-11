import React from 'react';
import { useParams } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import { MOCK_ARTISTS, MOCK_USER } from '@/constants';
import { UserStackedList } from '@/components/UserStackedList';
import { BackButton } from '@/components/BackButton';

const FollowersFollowing: React.FC = () => {
    const { type, userId } = useParams<{ type: 'followers' | 'following', userId: string }>();
    const { followedUserIds } = useUserStore();

    // Mock data for followers/following
    const allUsers = [...MOCK_ARTISTS.map(a => ({
        name: a.name,
        email: a.username || '',
        role: a.genre || 'Artist',
        imageUrl: a.avatarUrl,
        lastSeen: 'Active',
    }))];

    const displayUsers = type === 'following' 
        ? allUsers.slice(0, 3) 
        : allUsers.slice(3, 6);

    return (
        <div className="min-h-screen bg-background p-6">
            <BackButton />
            <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-6">
                {type === 'following' ? 'Following' : 'Followers'}
            </h1>
            <UserStackedList users={displayUsers} />
        </div>
    );
};

export default FollowersFollowing;
