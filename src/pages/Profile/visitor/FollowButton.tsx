import React, { useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '@/components/layout/ToastProvider';

interface FollowButtonProps {
  initialIsFollowing?: boolean;
  artistName: string;
  onToggleFollow?: (isFollowing: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  initialIsFollowing = false,
  artistName,
  onToggleFollow
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const toast = useToast();

  const handleToggle = () => {
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    if (onToggleFollow) {
      onToggleFollow(nextState);
    }
    
    if (nextState) {
      toast.success(
        'Followed Artist',
        `You are now following ${artistName} and will receive community updates.`
      );
    } else {
      toast.info(
        'Unfollowed Artist',
        `You unfollowed ${artistName}.`
      );
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 ${
        isFollowing
          ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
          : 'bg-[#0052FF] text-white hover:bg-[#0040D9]'
      }`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-4 h-4" />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>Follow</span>
        </>
      )}
    </motion.button>
  );
};

export default FollowButton;
