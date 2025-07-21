import React from 'react';
import './YourPlaylistsSection.css';

const userPlaylists = [
  {
    id: 1,
    title: 'My TON Vibes',
    image: '/playlist1.png',
  },
  {
    id: 2,
    title: 'Krushy Picks',
    image: '/playlist2.png',
  },
  {
    id: 3,
    title: 'AfroTON Bangers',
    image: '/playlist3.png',
  },
  {
    id: 4,
    title: 'Night Grooves',
    image: '/playlist4.png',
  },
];

const YourPlaylistsSection = () => {
  return (
    <section className="your-playlists-section">
      <h3 className="section-title">🎵 Your Playlists</h3>
      <div className="your-playlists-scroll">
        {userPlaylists.map((playlist) => (
          <div className="playlist-card" key={playlist.id}>
            <img src={playlist.image} alt={playlist.title} className="playlist-image" />
            <div className="playlist-title">{playlist.title}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default YourPlaylistsSection;
