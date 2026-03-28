import React, { useState } from 'react';
import { ListMusic, Plus, Coins, Share2, Trash2, Heart, Info, Minus } from 'lucide-react';
import { Track } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { getPlaceholderImage } from '@/lib/utils';
import AddToPlaylistModal from './AddToPlaylistModal';
import { Bar, BarChart, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

const data = [
  {
    goal: 400,
  },
  {
    goal: 300,
  },
  {
    goal: 200,
  },
  {
    goal: 300,
  },
  {
    goal: 200,
  },
  {
    goal: 278,
  },
  {
    goal: 189,
  },
  {
    goal: 239,
  },
  {
    goal: 300,
  },
  {
    goal: 200,
  },
  {
    goal: 278,
  },
  {
    goal: 189,
  },
  {
    goal: 349,
  },
]

interface TrackOptionsModalProps {
  track: Track;
  onClose: () => void;
  onRemove?: () => void;
}

const TrackOptionsModal: React.FC<TrackOptionsModalProps> = ({ track, onClose, onRemove }) => {
  const navigate = useNavigate();
  const { addNotification, addToQueue, likedTrackIds, toggleLikeTrack } = useAudio();
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [goal, setGoal] = React.useState(350)

  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)))
  }

  const isLiked = likedTrackIds.includes(track.id);

  const handleAction = async (action: string) => {
    switch (action) {
      case 'queue':
        addToQueue(track);
        onClose();
        break;
      case 'playlist':
        setShowAddToPlaylistModal(true);
        break;
      case 'like':
        toggleLikeTrack(track.id);
        onClose();
        break;
      case 'details':
        navigate(`/track/${track.id}`);
        onClose();
        break;
      case 'tip':
        addNotification(`Tip protocol initiated for ${track.artist}`, 'success');
        onClose();
        break;
      case 'share':
        const shareUrl = `${window.location.origin}/#/track/${track.id}`;
        const shareData = {
          title: track.title,
          text: `Check out ${track.title} by ${track.artist} on TonJam!`,
          url: shareUrl
        };

        if (navigator.share) {
          navigator.share(shareData).catch((err) => {
            if (err.name !== 'AbortError') {
              console.error('Error sharing:', err);
            }
          });
        } else {
          navigator.clipboard.writeText(shareUrl);
          addNotification('Track link copied to neural buffer', 'success');
        }
        onClose();
        break;
    }
  };

  if (showAddToPlaylistModal) {
    return <AddToPlaylistModal track={track} onClose={() => { setShowAddToPlaylistModal(false); onClose(); }} />;
  }

  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <div className="flex items-center gap-4 mb-4">
              <img src={track.coverUrl || getPlaceholderImage(`track-${track.id}`)} className="w-16 h-16 rounded-md object-cover shadow-lg" alt="" />
              <div className="text-left">
                <DrawerTitle>{track.title}</DrawerTitle>
                <DrawerDescription>{track.artist}</DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          
          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => onClick(-10)}
                disabled={goal <= 200}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Decrease</span>
              </Button>
              <div className="flex-1 text-center">
                <div className="text-7xl font-bold tracking-tighter">
                  {goal}
                </div>
                <div className="text-[0.70rem] uppercase text-muted-foreground">
                  Plays/day Goal
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => onClick(10)}
                disabled={goal >= 400}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Increase</span>
              </Button>
            </div>
            <div className="mt-3 h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <Bar
                    dataKey="goal"
                    style={
                      {
                        fill: "var(--foreground)",
                        opacity: 0.9,
                      } as React.CSSProperties
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 space-y-1">
            <button onClick={() => handleAction('like')} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-all text-left group">
              <div className="flex items-center gap-2">
                <Heart className={`h-5 w-5 ${isLiked ? "text-red-500 fill-current" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span className={`text-sm font-medium ${isLiked ? "text-red-500" : "text-foreground"}`}>{isLiked ? 'Liked' : 'Like Track'}</span>
              </div>
            </button>
            <button onClick={() => handleAction('details')} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-all text-left group">
              <Info className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
              <span className="text-sm font-medium text-foreground">View Details</span>
            </button>
            <button onClick={() => handleAction('queue')} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-all text-left group">
              <ListMusic className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
              <span className="text-sm font-medium text-foreground">Add to Queue</span>
            </button>
            <button onClick={() => handleAction('playlist')} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-all text-left group">
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
              <span className="text-sm font-medium text-foreground">Add to Playlist</span>
            </button>
            <button onClick={() => handleAction('tip')} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-all text-left group">
              <Coins className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
              <span className="text-sm font-medium text-foreground">Tip Producer</span>
            </button>
            <button onClick={() => handleAction('share')} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-all text-left group">
              <Share2 className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
              <span className="text-sm font-medium text-foreground">Share Track</span>
            </button>
            {onRemove && (
              <button onClick={() => { onRemove(); onClose(); }} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-all text-left group">
                <Trash2 className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-red-500">Remove from Playlist</span>
              </button>
            )}
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TrackOptionsModal;

