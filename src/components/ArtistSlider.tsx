import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { motion } from 'motion/react';
import { User, Artist } from '@/types';
import ArtistCard from './ArtistCard';

interface ArtistSliderProps {
  artists: (User | Artist)[];
}

const ArtistSlider: React.FC<ArtistSliderProps> = ({ artists }) => {
  if (!artists || artists.length === 0) return null;

  return (
    <div className="relative w-full py-4">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
        }}
        navigation
        pagination={{ clickable: true }}
        className="pb-10"
      >
        {artists.map((artist, idx) => {
          // Map User or Artist to the data needed by ArtistCard
          // Use type guards or property checks to handle both types
          const artistCardData: Artist = {
            uid: artist.uid,
            name: artist.name,
            username: artist.username,
            avatarUrl: 'avatarUrl' in artist ? artist.avatarUrl : (artist.avatar || ''),
            followers: artist.followers,
            verified: artist.verified || false,
            walletAddress: artist.walletAddress
          } as Artist;
          
          return (
            <SwiperSlide key={`artist-slider-${artist.uid}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ArtistCard artist={artistCardData} />
              </motion.div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default ArtistSlider;
