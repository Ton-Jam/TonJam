import React, { useMemo } from 'react';
import { X, CheckCircle2, UserPlus, UserCheck, Music, Disc, ExternalLink, Play, Pause, TrendingUp, Zap } from 'lucide-react';
import { Artist, Track } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useNavigate } from 'react-router-dom';
import { MOCK_TRACKS } from '@/constants';

interface ArtistDetailModalProps {
  artist: Artist;
  onClose: () => void;
}

const ArtistDetailModal: React.FC<ArtistDetailModalProps> = ({ artist, onClose }) => {
  const navigate = useNavigate();
  const { followedUserIds, toggleFollowUser, playTrack, currentTrack, isPlaying, togglePlay } = useAudio();
  const isFollowing = followedUserIds.includes(artist.id);

  const artistTracks = useMemo(() => {
    return MOCK_TRACKS
      .filter(t => t.artistId === artist.id || t.artist === artist.name)
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
  }, [artist]);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFollowUser(artist.id);
  };

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleViewFullProfile = () => {
    onClose();
    navigate(`/artist/${artist.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-neutral-900 border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Banner */}
        <div className="relative h-48 sm:h-64">
          <div className="absolute inset-0">
            <img 
              src={artist.bannerUrl || artist.avatarUrl} 
              alt={artist.name} 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/40 hover:bg-background/60 text-foreground/70 hover:text-foreground transition-colors backdrop-blur-md z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-6">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-neutral-900 shadow-xl overflow-hidden shrink-0">
              <img 
                src={artist.avatarUrl} 
                alt={artist.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mb-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground truncate">{artist.name}</h2>
                {artist.verified && <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-500/20" />}
              </div>
              <p className="text-sm text-muted-foreground/80 font-medium mb-3">
                {artist.followers.toLocaleString()} Followers
              </p>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleFollowClick}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all
                    ${isFollowing 
                      ? 'bg-muted text-foreground hover:bg-muted/80' 
                      : 'bg-blue-600 text-foreground hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                    }
                  `}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Follow
                    </>
                  )}
                </button>
                <button 
                  onClick={handleViewFullProfile}
                  className="px-4 py-2 rounded-full bg-muted/50 hover:bg-muted text-foreground/70 hover:text-foreground text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all border border-border"
                >
                  <ExternalLink className="w-4 h-4" /> View Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Bio */}
          {artist.bio && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">About</h3>
              <p className="text-sm text-muted-foreground/90 leading-relaxed max-w-prose">
                {artist.bio}
              </p>
            </div>
          )}

          {/* Discography / Top Tracks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Music className="w-4 h-4" /> Popular Tracks
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{artistTracks.length} Tracks</span>
            </div>

            {artistTracks.length > 0 ? (
              <div className="space-y-2">
                {artistTracks.slice(0, 5).map((track, index) => {
                  const isTrackActive = currentTrack?.id === track.id;
                  const isTrackPlaying = isTrackActive && isPlaying;
                  const isTrending = (track.playCount || 0) > 5000;
                  const jamEarnings = ((track.playCount || 0) * 0.001).toFixed(2);
                  
                  return (
                    <div 
                      key={track.id}
                      className={`group flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer relative ${
                        isTrackActive 
                          ? 'bg-blue-500/10 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                          : 'hover:bg-muted/50 border border-transparent'
                      }`}
                      onClick={() => handlePlayTrack(track)}
                    >
                      <span className="w-4 text-center text-xs font-bold text-muted-foreground/50 group-hover:text-muted-foreground/80">
                        {isTrackPlaying ? (
                          <div className="flex items-end justify-center gap-0.5 h-3">
                            <div className="w-0.5 bg-blue-500 animate-[bounce_1s_infinite_0ms] h-full"></div>
                            <div className="w-0.5 bg-blue-500 animate-[bounce_1s_infinite_200ms] h-2/3"></div>
                            <div className="w-0.5 bg-blue-500 animate-[bounce_1s_infinite_400ms] h-full"></div>
                          </div>
                        ) : (
                          index + 1
                        )}
                      </span>
                      
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-lg">
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                        <div className={`absolute inset-0 bg-background/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isTrackActive ? 'opacity-100' : ''}`}>
                          {isTrackPlaying ? <Pause className="w-5 h-5 text-foreground" /> : <Play className="w-5 h-5 text-foreground fill-white" />}
                        </div>
                      </div>
 
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className={`text-sm font-bold truncate ${isTrackActive ? 'text-blue-400' : 'text-foreground'}`}>
                            {track.title}
                          </h4>
                          {isTrending && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[8px] font-black uppercase tracking-tighter">
                              <TrendingUp className="w-2 h-2" /> Hot
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Music className="w-2.5 h-2.5" /> {track.genre}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5 text-blue-400" /> {jamEarnings} JAM
                          </span>
                          <span className="hidden sm:inline">{(track.playCount || 0).toLocaleString()} plays</span>
                        </div>
                      </div>
 
                      <div className="text-xs font-mono text-muted-foreground flex flex-col items-end gap-1">
                        <span>{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
                        <span className="sm:hidden text-[9px] font-bold">{(track.playCount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-lg">
                <Disc className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">No tracks available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistDetailModal;
