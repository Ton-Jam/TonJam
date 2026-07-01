import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HorizontalSection } from '@/components/layout/HorizontalSection';
import { MusicCard } from '@/components/cards/MusicCard';
import { ArtistCard } from '@/components/cards/ArtistCard';
import { NFTCard } from '@/components/cards/NFTCard';
import { CollectionCard } from '@/components/cards/CollectionCard';
import { Hero } from '@/components/ui/typography/Typography';
import AutoCarousel from '@/components/AutoCarousel';

// --- Premium Mock Data Providers ---

const SPONSORED_ITEMS = [
  {
    id: 's1',
    title: 'Cyber Pulse Live',
    subtitle: 'Stream the ultimate neon synth-pop performance by DarkStar',
    imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=1200&h=450',
    link: '#/jamspace',
    cta: 'Tune In Now'
  },
  {
    id: 's2',
    title: 'Neon Dreams Album',
    subtitle: 'The brand new soundscape by SynthWave is out now',
    imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1200&h=450',
    link: '#/marketplace',
    cta: 'Collect Album'
  },
  {
    id: 's3',
    title: 'Genesis Mint #04',
    subtitle: 'Exclusive limited edition audio collectible is now open',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200&h=450',
    link: '#/genesis-forge',
    cta: 'Mint Genesis'
  }
];

const MOCK_SPACES = [
  {
    id: 'sp1',
    title: 'Cyber Lounge Room',
    host: 'DJ Krupy',
    listeners: '1.4K',
    nowPlaying: 'Future Funk (Vibe Mix)',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600&h=400',
    status: 'Live'
  },
  {
    id: 'sp2',
    title: 'Synth Arena Club',
    host: 'SynthWave',
    listeners: '940',
    nowPlaying: 'Retro Horizon (Extended)',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600&h=400',
    status: 'Live'
  },
  {
    id: 'sp3',
    title: 'Chill Hop Oasis',
    host: 'Lofi Beats',
    listeners: '2.1K',
    nowPlaying: 'Sunset Breeze (Smooth)',
    imageUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=600&h=400',
    status: 'Live'
  }
];

const MOCK_NEW_DROPS = [
  { id: 'nd1', title: 'Solar Flare', artist: 'Hyperion', coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'nd2', title: 'Cosmic Drift', artist: 'Nebula', coverUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'nd3', title: 'Acid Rain', artist: 'Tokyo Drift', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'nd4', title: 'Velocity', artist: 'Turbo Charge', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'nd5', title: 'Ethereal Echo', artist: 'Luna Key', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300&h=300' }
];

const MOCK_TRENDING_SONGS = [
  { id: 'ts1', title: 'Future Funk', artist: 'Cybernetic', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'ts2', title: 'Neon Nights', artist: 'SynthWave', coverUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'ts3', title: 'Void Walker', artist: 'DarkStar', coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'ts4', title: 'Binary Star', artist: 'Cybernetic', coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'ts5', title: 'Gravity Well', artist: 'Astro Beats', coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=300&h=300' }
];

const MOCK_TRENDING_ARTISTS = [
  { id: 'ta1', name: 'Cybernetic', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200', followers: '1.2M' },
  { id: 'ta2', name: 'SynthWave', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200', followers: '850K' },
  { id: 'ta3', name: 'DarkStar', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200&h=200', followers: '620K' },
  { id: 'ta4', name: 'Nebula', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200', followers: '450K' }
];

const MOCK_FAVORITE_ARTISTS = [
  { id: 'fa1', name: 'Hyperion', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200', followers: '310K' },
  { id: 'fa2', name: 'Luna Key', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200', followers: '180K' },
  { id: 'fa3', name: 'Turbo Charge', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200', followers: '95K' }
];

const MOCK_TRENDING_COLLECTIONS = [
  { id: 'tc1', name: 'Cyber Vibes', itemCount: '50', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'tc2', name: 'Synth Dreams', itemCount: '32', coverUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'tc3', name: 'Quantum Beats', itemCount: '18', coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'tc4', name: 'Retro Sunset', itemCount: '24', coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=300&h=300' }
];

const MOCK_TRENDING_NFTS = [
  { id: 'tn1', title: 'Cyber Orb', creator: 'DarkStar', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300&h=300', price: '12' },
  { id: 'tn2', title: 'Neon Pulse', creator: 'SynthWave', imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=300&h=300', price: '8' },
  { id: 'tn3', title: 'Vortex Eye', creator: 'Cybernetic', imageUrl: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&q=80&w=300&h=300', price: '15' }
];

const MOCK_RECENTLY_MINTED = [
  { id: 'rm1', title: 'Digital Relic', creator: 'Astro Beats', imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=300&h=300', price: '4.5' },
  { id: 'rm2', title: 'Pixel Wave', creator: 'Luna Key', imageUrl: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&q=80&w=300&h=300', price: '6.2' },
  { id: 'rm3', title: 'Audio Prism', creator: 'Hyperion', imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=300&h=300', price: '9.0' }
];

const MOCK_RECOMMENDED = [
  { id: 'rec1', title: 'Starlight', artist: 'Nebula', coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'rec2', title: 'Horizon', artist: 'Lofi Beats', coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'rec3', title: 'Subzero', artist: 'Turbo Charge', coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'rec4', title: 'Nebula Wave', artist: 'Astro Beats', coverUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=300&h=300' }
];

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music' },
  { id: 'nfts', label: 'NFTs' },
  { id: 'spaces', label: 'Spaces' }
] as const;

// --- Sub-components for customized UI items ---

const FeedCard = ({ space }: { space: typeof MOCK_SPACES[0] }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="relative w-[calc(100vw-32px)] sm:w-[380px] aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 snap-start bg-slate-900 shadow-xl"
    >
      <img src={space.imageUrl} alt={space.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-between p-4" />
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          {space.status}
        </span>
        <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          {space.listeners} listening
        </span>
      </div>
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none mb-1">{space.host}</p>
        <h4 className="text-base font-black text-white leading-tight uppercase tracking-tight">{space.title}</h4>
        <p className="text-[11px] text-white/70 truncate mt-1">Spinning: {space.nowPlaying}</p>
      </div>
    </motion.div>
  );
};

// --- Viewport Entrance Motion Wrapper ---

const SectionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export default function JamUp() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'music' | 'nfts' | 'spaces'>('all');

  const showSponsored = activeFilter === 'all';
  const showSpaces = activeFilter === 'all' || activeFilter === 'spaces';
  const showMusic = activeFilter === 'all' || activeFilter === 'music';
  const showNFTs = activeFilter === 'all' || activeFilter === 'nfts';

  return (
    <div className="pb-[160px] pt-4 bg-background text-foreground min-h-screen">
      
      {/* Premium Header */}
      <div className="px-4 mb-3">
        <Hero>Jam Up</Hero>
      </div>

      {/* Filter Chips - Spaced perfectly (Header -> Filters: 12px) */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`relative px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors ${
                  isActive ? 'text-white' : 'text-[#9AA0AE] hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilterBg"
                    className="absolute inset-0 bg-blue-600 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container - Filters -> Content: 24px */}
      <div className="space-y-[24px]">

        {/* 1. Sponsored Feed (Carousel) */}
        {showSponsored && (
          <SectionWrapper>
            <div className="px-4">
              <AutoCarousel items={SPONSORED_ITEMS} interval={5500} />
            </div>
          </SectionWrapper>
        )}

        {/* 2. Trending in Space */}
        {showSpaces && (
          <SectionWrapper>
            <HorizontalSection title="Trending in Space">
              {MOCK_SPACES.map((space) => (
                <FeedCard key={space.id} space={space} />
              ))}
            </HorizontalSection>
          </SectionWrapper>
        )}

        {/* 3. New Drops */}
        {showMusic && (
          <SectionWrapper>
            <HorizontalSection title="New Drops">
              {MOCK_NEW_DROPS.map((track) => (
                <MusicCard key={track.id} {...track} />
              ))}
            </HorizontalSection>
          </SectionWrapper>
        )}

        {/* 4. Trending Songs */}
        {showMusic && (
          <SectionWrapper>
            <HorizontalSection title="Trending Songs">
              {MOCK_TRENDING_SONGS.map((track) => (
                <MusicCard key={track.id} {...track} />
              ))}
            </HorizontalSection>
          </SectionWrapper>
        )}

        {/* 5. Trending Artists */}
        {showMusic && (
          <SectionWrapper>
            <HorizontalSection title="Trending Artists">
              {MOCK_TRENDING_ARTISTS.map((artist) => (
                <ArtistCard key={artist.id} {...artist} />
              ))}
            </HorizontalSection>
          </SectionWrapper>
        )}

        {/* 6. Favorite Artists */}
        {showMusic && (
          <SectionWrapper>
            <HorizontalSection title="Favorite Artists">
              {MOCK_FAVORITE_ARTISTS.map((artist) => (
                <ArtistCard key={artist.id} {...artist} />
              ))}
            </HorizontalSection>
          </SectionWrapper>
        )}

        {/* 7. Trending Collections */}
        {showNFTs && (
          <SectionWrapper>
            <HorizontalSection title="Trending Collections">
              {MOCK_TRENDING_COLLECTIONS.map((collection) => (
                <CollectionCard key={collection.id} {...collection} />
              ))}
            </HorizontalSection>
          </SectionWrapper>
        )}

        {/* 8. Trending NFTs */}
        {showNFTs && (
          <SectionWrapper>
            <HorizontalSection title="Trending NFTs">
              {MOCK_TRENDING_NFTS.map((nft) => (
                <NFTCard key={nft.id} {...nft} />
              ))}
            </HorizontalSection>
          </SectionWrapper>
        )}

        {/* 9. Recently Minted */}
        {showNFTs && (
          <SectionWrapper>
            <HorizontalSection title="Recently Minted">
              {MOCK_RECENTLY_MINTED.map((nft) => (
                <NFTCard key={nft.id} {...nft} />
              ))}
            </HorizontalSection>
          </SectionWrapper>
        )}

        {/* 10. Recommended For You */}
        {showMusic && (
          <SectionWrapper>
            <HorizontalSection title="Recommended For You">
              {MOCK_RECOMMENDED.map((track) => (
                <MusicCard key={track.id} {...track} />
              ))}
            </HorizontalSection>
          </SectionWrapper>
        )}

      </div>
    </div>
  );
}
