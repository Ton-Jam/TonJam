import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TrackCard from '../components/TrackCard';
import UserCard from '../components/UserCard';
import NFTCard from '../components/NFTCard';
import PostCard from '../components/PostCard';
import { MOCK_TRACKS, MOCK_ARTISTS, MOCK_NFTS, MOCK_POSTS, APP_LOGO, TON_LOGO } from '../constants';
import { getAIRecommendations } from '../services/geminiService';
import { Track } from '../types';
import { useAudio } from '../context/AudioContext';

const VIBE_CHIPS = ['Night Drive', 'Cyberpunk', 'Focus', 'Party', 'Chill', 'Lo-Fi', 'Techno', 'Deep House', 'Experimental'];

const HERO_CARDS = [
  {
    tag: "Decentralized Audio",
    title: "REDEFINE BEATS",
    desc: "Own your frequency. 100% royalties on TON.",
    img: "https://picsum.photos/1600/800?random=100",
    cta: "Explore Market"
  },
  {
    tag: "Alpha Drop",
    title: "NEON VOYAGER",
    desc: "Limited 1/1 editions dropping now.",
    img: "https://picsum.photos/1600/800?random=101",
    cta: "Join Drop"
  }
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [recommendedTracks, setRecommendedTracks] = useState<Track[]>([]);
  const [mood, setMood] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const { addNotification } = useAudio();
  
  const heroScrollRef = useRef<HTMLDivElement>(null);
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);

  useEffect(() => {
    setRecommendedTracks(MOCK_TRACKS.slice(0, 4));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHeroIdx((prev) => (prev + 1) % HERO_CARDS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (heroScrollRef.current) {
      heroScrollRef.current.scrollTo({
        left: activeHeroIdx * heroScrollRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  }, [activeHeroIdx]);

  const handleAIDiscover = async (vibe?: string) => {
    const selectedMood = vibe || mood;
    if (!selectedMood.trim()) return;
    setMood(selectedMood);
    setLoadingAI(true);
    try {
      const ids = await getAIRecommendations(selectedMood, MOCK_TRACKS);
      const filtered = MOCK_TRACKS.filter(t => ids.includes(t.id));
      setRecommendedTracks(filtered.length ? filtered : MOCK_TRACKS.slice(0, 4));
      if (filtered.length) addNotification(`Neural Sync complete: ${filtered.length} matches found.`, 'success');
    } catch (e: any) {
      addNotification(e.message || "Neural Sync failed.", "error");
    } finally {
      setLoadingAI(false);
    }
  };

  const SectionHeader = ({ title, subtitle, onAction }: { title: string, subtitle?: string, onAction?: () => void }) => (
    <div className="flex items-center justify-between mb-4 px-4 md:px-12">
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white leading-none">{title}</h2>
        {subtitle && <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.4em] mt-1">{subtitle}</p>}
      </div>
      {onAction && (
        <button onClick={onAction} className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-white transition-all">View All</button>
      )}
    </div>
  );

  const trendingPosts = useMemo(() => {
    return [...MOCK_POSTS].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments)).slice(0, 5);
  }, []);

  return (
    <div className="animate-in fade-in duration-700 w-full bg-black overflow-x-hidden pb-32">
      <section className="mb-10 pt-6">
        <SectionHeader title="Alpha Drops" subtitle="Genesis Collections" onAction={() => navigate('/explore/nfts?title=Alpha%20Drops')} />
        <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 md:px-12 pb-2">
          {MOCK_NFTS.slice(0, 6).map(nft => (
            <div key={nft.id} className="flex-shrink-0 w-44 md:w-56 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <NFTCard nft={nft} />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader title="New Drops" subtitle="Fresh Frequencies" onAction={() => navigate('/explore/tracks?title=New%20Drops')} />
        <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 md:px-12 pb-2">
          {MOCK_TRACKS.slice(0, 6).map(track => (
            <div key={track.id} className="flex-shrink-0 w-44 md:w-56 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <TrackCard track={track} />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12 px-4 md:px-12">
        <div className="bg-[#050505] rounded-xl border border-white/5 relative overflow-hidden p-6 md:p-12">
          <div className="absolute -top-48 -right-48 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="flex flex-col gap-8 relative z-10">
            <div className="w-full">
              <h2 className="text-3xl md:text-6xl font-black tracking-tighter mb-2 uppercase text-white">
                VIBE <span className="text-blue-500">SYNC</span>
              </h2>
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2 -mx-1 px-1">
                {VIBE_CHIPS.map(chip => (
                  <button 
                    key={chip} 
                    onClick={() => handleAIDiscover(chip)}
                    className="flex-shrink-0 px-4 py-2 bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all text-white/50 rounded-lg"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <div className="relative group max-w-2xl">
                <input 
                  type="text" 
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="Describe your current state..." 
                  className="w-full bg-black border border-white/5 py-4 pl-6 pr-16 text-xs md:text-lg outline-none focus:border-blue-500/50 transition-all text-white rounded-xl"
                />
                <button 
                  onClick={() => handleAIDiscover()}
                  disabled={loadingAI}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 flex items-center justify-center transition-all active:scale-95 rounded-lg shadow-xl shadow-blue-600/20"
                >
                  {loadingAI ? <i className="fas fa-circle-notch animate-spin text-white text-xs"></i> : <i className="fas fa-sparkles text-white text-xs"></i>}
                </button>
              </div>
            </div>
            <div className="w-full">
              <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
                {recommendedTracks.map(track => (
                  <div key={track.id} className="flex-shrink-0 w-44 md:w-56 animate-in fade-in duration-700">
                    <TrackCard track={track} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full h-[35vh] md:h-[50vh] mb-12 overflow-hidden bg-black">
        <div ref={heroScrollRef} className="flex h-full w-full overflow-hidden no-scrollbar snap-x snap-mandatory">
          {HERO_CARDS.map((card, i) => (
            <div key={i} className="relative min-w-full h-full snap-start overflow-hidden">
              <img src={card.img} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
              <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-20 w-full">
                <div className="inline-block px-3 py-1 bg-blue-600/20 backdrop-blur-xl text-white text-[8px] font-black uppercase tracking-[0.4em] mb-4 border border-blue-500/30 rounded-full w-fit">
                  {card.tag}
                </div>
                <h1 className="text-3xl md:text-6xl font-black mb-3 tracking-tighter leading-none uppercase text-white">{card.title}</h1>
                <p className="text-white/60 text-[11px] md:text-lg leading-snug mb-8 max-w-lg font-bold uppercase tracking-tighter">{card.desc}</p>
                <button onClick={() => navigate('/marketplace')} className="bg-blue-600 w-fit px-8 py-4 font-black text-[10px] uppercase tracking-[0.2em] transition-all text-white rounded-xl shadow-2xl shadow-blue-500/20 active:scale-95">
                  {card.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader title="JamSpace Live" subtitle="Trending Signals" onAction={() => navigate('/jamspace')} />
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-4 md:px-12">
          {trendingPosts.map(post => (
            <div key={post.id} className="flex-shrink-0 w-72 md:w-96">
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <SectionHeader title="Maestros" subtitle="Sonic Architects" onAction={() => navigate('/explore/artists?title=Maestros')} />
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 px-4 md:px-12">
          {MOCK_ARTISTS.map(artist => (
            <div key={artist.id} className="flex-shrink-0 w-28 md:w-40">
              <UserCard user={artist} variant="portrait" />
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-black border-t border-white/5 py-16 flex flex-col items-center">
        <img src={APP_LOGO} className="w-10 h-10 opacity-20 mb-6" alt="" />
        <p className="text-white/10 text-[9px] font-black uppercase tracking-[0.8em]">TONJAM PROTOCOL V.1.0</p>
      </footer>
    </div>
  );
};

export default Home;