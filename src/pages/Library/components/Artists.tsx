import React from 'react';
import { Users } from 'lucide-react';
import { LibraryArtist } from '../types';
import ArtistCard from '@/components/ArtistCard';
import { Artist } from '@/types';

interface ArtistsProps {
  artists: LibraryArtist[];
  layout?: 'grid' | 'list';
}

export const Artists: React.FC<ArtistsProps> = ({ artists, layout = 'grid' }) => {
  // Convert LibraryArtist to Artist interface for standard ArtistCard component
  const mappedArtists: Artist[] = React.useMemo(() => {
    return artists.map((a) => ({
      uid: a.id,
      name: a.name,
      avatarUrl: a.avatarUrl,
      followers: a.followersCount,
      verified: a.verified,
      isVerifiedArtist: a.verified,
      genre: a.genres?.[0] || 'Artist',
      monthlyListeners: Math.round(a.followersCount * 2.8)
    }));
  }, [artists]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#0052FF]" />
          <h2 className="section-title">Followed Artists & Creators</h2>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono font-medium">
          {artists.length} creators connected
        </span>
      </div>

      {artists.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          No followed artists yet. Explore and follow creators in the Discovery feed.
        </div>
      ) : layout === 'list' ? (
        <div className="space-y-2.5">
          {mappedArtists.map((artist) => (
            <ArtistCard
              key={artist.uid}
              artist={artist}
              variant="row"
              className="w-full"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mappedArtists.map((artist) => (
            <div key={artist.uid} className="flex justify-center">
              <ArtistCard
                artist={artist}
                variant="default"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Artists;
