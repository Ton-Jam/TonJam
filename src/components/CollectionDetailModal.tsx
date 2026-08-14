import React, { useEffect, useState } from 'react';
import { Collection, NFTItem } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { fetchNFTMetadata } from '@/services/nftService';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollectionDetailModalProps {
  collection: Collection | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CollectionDetailModal: React.FC<CollectionDetailModalProps> = ({ 
  collection, 
  isOpen, 
  onClose 
}) => {
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [audio] = useState(new Audio());
  const audioContext = React.useRef<AudioContext | null>(null);

  useEffect(() => {
    // Setup Web Audio API disabled to prevent CORS-related muting issues of external audio assets
    /*
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContext.current = ctx;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, ctx.currentTime);
    compressor.knee.setValueAtTime(40, ctx.currentTime);
    compressor.ratio.setValueAtTime(12, ctx.currentTime);
    compressor.attack.setValueAtTime(0, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);
    compressor.connect(ctx.destination);

    const source = ctx.createMediaElementSource(audio);
    source.connect(compressor);

    return () => {
      ctx.close();
    };
    */
  }, [audio]);

  useEffect(() => {
    if (collection && collection.nftIds) {
      const fetchTracks = async () => {
        const fetchedNfts = await Promise.all(
          collection.nftIds.map(id => fetchNFTMetadata(id))
        );
        setNfts(fetchedNfts.filter((n): n is NFTItem => n !== null));
      };
      fetchTracks();
    }
  }, [collection]);

  const togglePlay = (nft: NFTItem) => {
    if (playingTrackId === nft.id) {
      audio.pause();
      setPlayingTrackId(null);
    } else {
      if (nft.audioUrl) {
        audio.src = nft.audioUrl;
        audio.play();
        setPlayingTrackId(nft.id);
        setTimeout(() => {
          audio.pause();
          setPlayingTrackId(null);
        }, 30000); // 30 seconds
      }
    }
  };

  if (!collection) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0A113A] border border-white/10 text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">{collection.name}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {collection.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <img src={collection.coverUrl} alt={collection.name} className="w-full h-60 object-cover rounded-xl" />
          
          <div className="flex gap-8 py-4 border-y border-white/10">
            <div>
              <div className="text-zinc-400 text-xs uppercase tracking-wider">Tracks</div>
              <div className="font-bold text-lg">{nfts.length}</div>
            </div>
            <div>
              <div className="text-zinc-400 text-xs uppercase tracking-wider">Floor Price</div>
              <div className="font-bold text-lg">0.5 TON</div>
            </div>
            <div>
              <div className="text-zinc-400 text-xs uppercase tracking-wider">Followers</div>
              <div className="font-bold text-lg">1.2K</div>
            </div>
          </div>

          <h4 className="font-bold text-lg">Tracks</h4>
          <div className="space-y-2">
            {nfts.map(nft => (
              <div key={nft.id} className="flex items-center justify-between p-2 rounded bg-white/5">
                <div className="flex items-center gap-3">
                  <img src={nft.imageUrl} alt={nft.title} className="w-10 h-10 rounded object-cover" />
                  <span className="text-sm">{nft.title}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => togglePlay(nft)}
                >
                  {playingTrackId === nft.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
