import React from 'react';
import { Share, ExternalLink, Trash2, Flag, UserPlus, ChevronRight } from 'lucide-react';
import { Post } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { getPlaceholderImage, shareContent, cn } from '@/lib/utils';
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

interface PostOptionsModalProps {
  post: Post;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const PostOptionsModal: React.FC<PostOptionsModalProps> = ({ post, onClose, onDelete }) => {
  const navigate = useNavigate();
  const { addNotification, userProfile, followedUserIds, toggleFollowUser } = useAudio();

  const isOwnPost = post.userId === userProfile?.uid;
  const isFollowing = followedUserIds.includes(post.userId);

  const handleAction = async (action: string) => {
    switch (action) {
      case 'follow':
        toggleFollowUser(post.userId);
        onClose();
        break;
      case 'view':
        navigate(`/post/${post.id}`);
        onClose();
        break;
      case 'share':
        const result = await shareContent({
          title: `TonJam Post by ${post.userName}`,
          text: post.content,
          url: `${window.location.origin}/#/post/${post.id}`,
        });
        if (result.success && result.method === 'clipboard') {
           addNotification("Link copied to clipboard", "success");
        }
        onClose();
        break;
      case 'report':
        addNotification(`Post reported`, 'success');
        onClose();
        break;
      case 'delete':
        if (onDelete) onDelete(post.id);
        onClose();
        break;
    }
  };

  const options = [];
  
  if (!isOwnPost) {
    options.push({ id: 'follow', icon: UserPlus, label: isFollowing ? 'Unfollow' : 'Follow User', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('follow') });
  }
  
  options.push({ id: 'view', icon: ExternalLink, label: 'View Thread', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('view') });
  options.push({ id: 'share', icon: Share, label: 'Share', color: 'text-foreground', iconColor: 'text-muted-foreground group-hover:text-blue-400', action: () => handleAction('share') });
  
  if (!isOwnPost) {
    options.push({ id: 'report', icon: Flag, label: 'Report', color: 'text-red-500', iconColor: 'text-red-500 group-hover:text-red-400', action: () => handleAction('report') });
  }

  if (isOwnPost && onDelete) {
    options.push({ id: 'delete', icon: Trash2, label: 'Delete Post', color: 'text-red-500', iconColor: 'text-red-500 group-hover:text-red-400', action: () => handleAction('delete') });
  }

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-background border-none shadow-[0_-12px_40px_rgba(0,0,0,0.8)]">
        <div className="mx-auto w-full max-w-md relative z-10 px-4 pb-12">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 rounded-full bg-white/10" />
          </div>

          <DrawerHeader className="pb-6 pt-4 flex flex-row items-center gap-4 text-left">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
              <img 
                src={post.userAvatar || getPlaceholderImage(`user-${post.userId}`)} 
                className="w-full h-full object-cover" 
                alt={post.userName} 
              />
            </div>
            <div className="flex-1 min-w-0">
              <DrawerTitle className="text-xl font-semibold text-foreground truncate">
                {post.userName}
              </DrawerTitle>
              <DrawerDescription className="text-sm font-medium text-muted-foreground mt-1 truncate">
                Post Options
              </DrawerDescription>
            </div>
          </DrawerHeader>
          
          <div className="space-y-1 max-h-[50vh] overflow-y-auto no-scrollbar py-2">
            {options.map((option, index) => (
              <button
                key={option.id}
                onClick={option.action}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors text-left group focus-visible:outline-none"
              >
                <div className="flex items-center gap-3">
                  <option.icon className={cn("h-5 w-5", option.iconColor)} />
                  <span className={cn("text-base font-medium", option.color)}>
                    {option.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <DrawerClose asChild>
              <Button 
                variant="outline"
                className="w-full rounded-full h-12 text-base font-medium"
              >
                Cancel
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PostOptionsModal;
