import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, Star, Zap } from 'lucide-react';
import { NFTItem } from '@/types';
import { TON_LOGO } from '@/constants';
import { getPlaceholderImage } from '@/lib/utils';

interface NFTAlphaCarouselProps {
  nfts: NFTItem[];
}

const NFTAlphaCarousel: React.FC<NFTAlphaCarouselProps> = ({ nfts }) => {
  const navigate = useNavigate();

  if (!nfts || nfts.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-4">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={24}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        navigation
        pagination={{ clickable: true }}
        className="pb-10"
      >
        {nfts.map((nft, idx) => (
          <SwiperSlide key={`alpha-nft-${nft.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <div 
                onClick={() => navigate(`/nft/${nft.id}`)}
                className="relative aspect-square rounded-[4px] overflow-hidden cursor-pointer bg-neutral-900 border border-white/5 hover:border-blue-500/30 transition-all duration-500 shadow-2xl"
              >
                {/* NFT Image */}
                <img 
                  src={nft.imageUrl || getPlaceholderImage(`nft-alpha-${nft.id}`)} 
                  alt={nft.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  <span className="px-3 py-1 bg-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg flex items-center gap-1.5 translate-y-0 group-hover:-translate-y-1 transition-transform">
                    <Zap className="w-3 h-3 fill-white" /> ALPHA SIGNAL
                  </span>
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-white/80 border border-white/5">
                    #{idx + 1} TRENDING
                  </span>
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{nft.creator}</p>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-blue-400 transition-colors truncate">{nft.title}</h3>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/5">
                      <img src={TON_LOGO} className="w-4 h-4" alt="TON" />
                      <span className="text-sm font-black text-white">{nft.price} <span className="text-[10px] text-white/40 not-italic">TON</span></span>
                    </div>
                    
                    <button className="p-3 bg-blue-600 rounded-xl text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 scale-90 group-hover:scale-100 transition-all">
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default NFTAlphaCarousel;
