import React from 'react';
import './FavoriteArtistsSection.css';

const favoriteArtists = [
  {
    id: 1,
    name: 'KrushBeat',
    avatar: '/Artist4.png',
    verified: true,
  },
  {
    id: 2,
    name: 'NovaTune',
    avatar: '/Artist5.png',
    verified: false,
  },
  {
    id: 3,
    name: 'VibeLord',
    avatar: '/Artist6.png',
    verified: true,
  },
  {
    id: 4,
    name: 'HarmonyX',
    avatar: '/Artist7.png',
    verified: false,
  },
];

const FavoriteArtistsSection = () => {
  return (
    <section className="favorite-artists-section">
      <h3 className="section-title">❤️ Favorite Artists</h3>
      <div className="favorite-artist-scroll">
        {favoriteArtists.map((artist) => (
          <div className="favorite-artist-card" key={artist.id}>
            <img src={artist.avatar} alt={artist.name} className="favorite-artist-avatar" />
            <div className="favorite-artist-name">
              {artist.name}
              {artist.verified && (
                <img
                  src="/icon-verified-check.png"
                  alt="Verified"
                  className="verified-icon"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FavoriteArtistsSection;
