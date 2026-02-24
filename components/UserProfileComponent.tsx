import React from 'react';
import { UserProfile, Post } from '../types';
import SocialFeed from './SocialFeed';

interface UserProfileComponentProps {
  user: UserProfile;
  posts: Post[];
  isCurrentUser?: boolean;
  onEditProfile?: () => void;
}

const UserProfileComponent: React.FC<UserProfileComponentProps> = ({ 
  user, 
  posts, 
  isCurrentUser = false,
  onEditProfile
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Banner & Avatar Section */}
      <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-16">
        <img 
          src={user.bannerUrl || 'https://picsum.photos/seed/tonjam-banner/1200/400'} 
          alt={`${user.name} banner`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        {/* Avatar */}
        <div className="absolute -bottom-12 left-8">
          <div className="relative">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#050505] object-cover bg-[#050505]"
            />
            {user.isVerifiedArtist && (
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#050505] shadow-lg">
                <i className="fas fa-check text-[10px] text-white"></i>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-8 mb-12">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              {user.name}
            </h1>
            <p className="text-blue-500 font-black text-sm uppercase tracking-[0.2em] mt-1">
              {user.handle}
            </p>
          </div>
          
          {isCurrentUser && onEditProfile && (
            <button 
              onClick={onEditProfile}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white transition-all"
            >
              Edit Profile
            </button>
          )}
        </div>

        {user.bio && (
          <p className="text-white/60 text-sm leading-relaxed max-w-2xl mb-6">
            {user.bio}
          </p>
        )}

        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xl font-black text-white">{user.followers.toLocaleString()}</span>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Followers</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white">{user.following.toLocaleString()}</span>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Following</span>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="px-8">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.5em] mb-6 flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          Signals
        </h3>
        <SocialFeed posts={posts} emptyMessage={`${user.name} hasn't broadcasted any signals yet.`} />
      </div>
    </div>
  );
};

export default UserProfileComponent;
