
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Artist } from '../types';
import { useAudio } from '../context/AudioContext';

interface UserCardProps {
  user: Artist;
  variant?: 'compact' | 'portrait' | 'full';
}

const UserCard: React.FC<UserCardProps> = ({ user, variant = 'full' }) => {
  const navigate = useNavigate();
  const { followedUserIds, toggleFollowUser } = useAudio();
  const isFollowing = followedUserIds.includes(user.id);

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFollowUser(user.id);
  };

  const handleNavigate = () => {
    navigate(`/artist/${user.id}`);
  };

  if (variant === 'compact') {
    return (
      <div 
        onClick={handleNavigate}
        className="flex items-center gap-2 p-2 glass rounded-xl hover:bg-white/5 transition-all cursor-pointer group border border-white/5"
      >
        <div className="relative w-8 h-8 flex-shrink-0">
          <img src={user.avatarUrl} className="w-full h-full object-cover rounded-full border border-white/10" alt={user.name} />
          {user.verified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center border border-[#050505]">
              <i className="fas fa-check text-[5px] text-white"></i>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="text-[10px] font-black text-white truncate uppercase tracking-tighter">{user.name}</h4>
            {user.verified && <i className="fas fa-check-circle text-blue-500 text-[8px]"></i>}
          </div>
          <p className="text-[8px] text-white/30 uppercase tracking-widest font-black">{user.followers.toLocaleString()}</p>
        </div>
        <button 
          onClick={handleFollow}
          className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all ${
            isFollowing 
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
              : 'bg-white/5 text-white/40 border border-white/10'
          }`}
        >
          {isFollowing ? 'SYNCED' : 'FOLLOW'}
        </button>
      </div>
    );
  }

  if (variant === 'portrait') {
    return (
      <div 
        onClick={handleNavigate}
        className="flex-shrink-0 flex flex-col items-center group cursor-pointer w-24 md:w-32"
      >
        <div className="relative w-20 h-20 md:w-28 md:h-28 mb-3">
          <img 
            src={user.avatarUrl} 
            className="w-full h-full object-cover rounded-full border border-white/5 group-hover:border-blue-500 transition-all" 
            alt={user.name} 
          />
          {user.verified && (
            <div className="absolute bottom-0.5 right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#050505] z-20">
              <i className="fas fa-check text-[7px] text-white"></i>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 group-hover:text-blue-400 transition-colors">
          <span className="font-black text-[10px] md:text-xs uppercase tracking-tight text-center truncate italic">{user.name}</span>
          {user.verified && <i className="fas fa-check-circle text-blue-500 text-[10px]"></i>}
        </div>
        <span className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-black mt-0.5 mb-3">{user.followers.toLocaleString()} FANS</span>
        <button 
          onClick={handleFollow}
          className={`w-full py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
            isFollowing 
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
              : 'bg-white/5 text-white/20 border border-white/5'
          }`}
        >
          {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
        </button>
      </div>
    );
  }

  return (
    <div 
      onClick={handleNavigate}
      className="glass rounded-2xl p-6 border border-white/5 hover:border-blue-500/20 transition-all group cursor-pointer flex flex-col items-center text-center"
    >
      <div className="relative w-20 h-20 mb-4">
        <img 
          src={user.avatarUrl} 
          className="w-full h-full object-cover rounded-full border-2 border-white/10 group-hover:border-blue-500/40 transition-all" 
          alt={user.name} 
        />
        {user.verified && (
          <div className="absolute bottom-0.5 right-0.5 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-4 border-[#050505] z-20 shadow-xl">
            <i className="fas fa-check text-[8px] text-white"></i>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 mb-0.5">
        <h3 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{user.name}</h3>
        {user.verified && <i className="fas fa-check-circle text-blue-500 text-xs"></i>}
      </div>
      <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black mb-6 italic">{user.followers.toLocaleString()} COLLECTORS</p>
      
      <button 
        onClick={handleFollow}
        className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
          isFollowing 
            ? 'bg-white/5 text-white/30' 
            : 'bg-blue-500 text-white active:scale-95'
        }`}
      >
        {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
      </button>
    </div>
  );
};

export default UserCard;
