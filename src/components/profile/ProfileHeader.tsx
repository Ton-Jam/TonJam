import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, CheckCircle2, Star } from 'lucide-react';
import { UserProfile } from '../../types';

interface ProfileHeaderProps {
  user: UserProfile;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-48 w-full bg-[#1e2029] overflow-hidden">
        {user.bannerUrl ? (
          <img src={user.bannerUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-900" />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4">
        <div className="relative -mt-16 mb-4 flex items-end justify-between">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-32 h-32 rounded-full border-4 border-[var(--background)] overflow-hidden bg-zinc-800"
          >
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </motion.div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            {user.isVerified && <CheckCircle2 className="text-[var(--primary)] w-5 h-5" />}
          </div>
          <p className="text-[var(--text-muted)] font-mono">@{user.username}</p>
          <p className="text-sm pt-2">{user.bio}</p>
          
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-[var(--text-muted)]">
            {user.location && <div className="flex items-center gap-1"><MapPin size={14}/> {user.location}</div>}
            <div className="flex items-center gap-1"><Calendar size={14}/> Joined {user.createdAt || '2024'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
