import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getFeaturedCollections } from '@/services/collectionService';
import { followCollection } from '@/services/socialService';
import { Collection } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from '@/components/ui/carousel';
import { Plus, Check, Info } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { CollectionDetailModal } from '@/components/CollectionDetailModal';

const CollectionSpotlight: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [followedCollections, setFollowedCollections] = useState<Record<string, boolean>>({});
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getFeaturedCollections().then(setCollections);
  }, []);

  const openDetails = (collection: Collection) => {
    setSelectedCollection(collection);
    setIsModalOpen(true);
  };

  const handleFollow = async (collectionId: string) => {
    if (auth.currentUser) {
      await followCollection(auth.currentUser.uid, collectionId);
      setFollowedCollections(prev => ({ ...prev, [collectionId]: true }));
    } else {
      alert("Please login to follow collections.");
    }
  };

  if (collections.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black tracking-tight text-white">
        Collection Spotlight
      </h2>
      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent>
          {collections.map((collection) => (
            <CarouselItem key={collection.id} className="md:basis-1/3 lg:basis-1/4">
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="bg-[#0A113A]/50 border-none rounded-2xl overflow-hidden cursor-pointer hover:bg-[#1A215A]/50 transition-colors relative">
                  <img src={collection.coverUrl} alt={collection.name} className="w-full h-40 object-cover" onClick={() => openDetails(collection)} />
                  <button 
                    className="absolute top-2 left-2 rounded-full bg-black/50 text-white hover:bg-black/80 w-10 h-10 flex items-center justify-center transition-colors"
                    onClick={() => openDetails(collection)}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    animate={followedCollections[collection.id] ? { scale: [1, 1.2, 1], backgroundColor: "#22c55e" } : {}}
                    className={`absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/80 w-10 h-10 flex items-center justify-center transition-colors ${followedCollections[collection.id] ? 'bg-green-500' : ''}`}
                    onClick={() => handleFollow(collection.id)}
                  >
                    {followedCollections[collection.id] ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </motion.button>
                  <CardContent className="p-4" onClick={() => openDetails(collection)}>
                    <h3 className="font-bold text-white truncate">{collection.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{collection.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-black/50 text-white border-none" />
        <CarouselNext className="right-2 bg-black/50 text-white border-none" />
      </Carousel>
      <CollectionDetailModal 
        collection={selectedCollection} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default CollectionSpotlight;
