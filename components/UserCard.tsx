
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
        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.05] transition-all cursor-pointer group border border-transparent hover:border-white/5"
      >
        <div className="relative w-10 h-10 flex-shrink-0">
          <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full scale-0 group-hover:scale-110 transition-transform"></div>
          <img src={user.avatarUrl} className="w-full h-full object-cover rounded-full border border-white/10 group-hover:border-blue-500 transition-all relative z-10" alt={user.name} />
          {(user.verified || user.isVerifiedArtist) && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-black z-20">
              <i className="fas fa-check text-[6px] text-white"></i>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-[11px] font-black text-white/80 group-hover:text-white truncate uppercase tracking-tight transition-colors">{user.name}</h4>
          </div>
          <p className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-black">{user.followers.toLocaleString()} FANS</p>
        </div>
        <button 
          onClick={handleFollow}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
            isFollowing 
              ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
              : 'bg-white/5 text-white/20 border border-white/5 hover:text-white hover:bg-white/10'
          }`}
        >
          <i className={`fas ${isFollowing ? 'fa-user-check' : 'fa-user-plus'} text-[10px]`}></i>
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
        <div className="relative w-20 h-20 md:w-28 md:h-28 mb-4">
          <div className="absolute inset-0 bg-blue-600/10 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
          <img 
            src={user.avatarUrl} 
            className="w-full h-full object-cover rounded-full border border-white/5 group-hover:border-blue-500 transition-all relative z-10 grayscale group-hover:grayscale-0" 
            alt={user.name} 
          />
          {(user.verified || user.isVerifiedArtist) && (
            <div className="absolute bottom-0.5 right-1.5 w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center border-2 border-black z-20 shadow-xl">
              <i className="fas fa-check text-[7px] text-white"></i>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 group-hover:text-blue-400 transition-colors">
          <span className="font-black text-[10px] md:text-xs uppercase tracking-tight text-center truncate">{user.name}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 mb-4">
           <div className="w-1 h-1 rounded-full bg-blue-500/40"></div>
           <span className="text-[7px] text-white/20 uppercase tracking-[0.2em] font-black">{user.followers.toLocaleString()} FANS</span>
        </div>
        <button 
          onClick={handleFollow}
          className={`w-full py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
            isFollowing 
              ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
              : 'bg-white/5 text-white/20 border border-white/5 hover:border-white/20'
          }`}
        >
          {isFollowing ? 'SYNCED' : 'FOLLOW'}
        </button>
      </div>
    );
  }

  return (
    <div 
      onClick={handleNavigate}
      className="bg-white/[0.02] rounded-[2rem] p-8 border border-white/5 hover:border-blue-500/20 transition-all group cursor-pointer flex flex-col items-center text-center relative overflow-hidden"
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full pointer-events-none"></div>
      
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-0 group-hover:scale-110 transition-transform"></div>
        <img 
          src={user.avatarUrl} 
          className="w-full h-full object-cover rounded-full border-2 border-white/10 group-hover:border-blue-500 transition-all relative z-10 shadow-2xl" 
          alt={user.name} 
        />
        {(user.verified || user.isVerifiedArtist) && (
          <div className="absolute bottom-1 right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center border-4 border-black z-20 shadow-xl">
            <i className="fas fa-check text-[10px] text-white"></i>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{user.name}</h3>
      </div>
      <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black mb-8">{user.followers.toLocaleString()} COLLECTORS</p>
      
      <button 
        onClick={handleFollow}
        className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
          isFollowing 
            ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
            : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 active:scale-95'
        }`}
      >
        {isFollowing ? 'SYNCED' : 'FOLLOW NODE'}
      </button>
    </div>
  );
};

export default UserCard;
