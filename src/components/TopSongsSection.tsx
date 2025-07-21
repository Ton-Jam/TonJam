import React from 'react';
import './TopSongsSection.css';

interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  streamCount: number;
}

const topSongs: Song[] = [
  {
    id: '1',
    title: 'Ride or Jam',
    artist: 'Tonick Blaze',
    cover: '/covers/song1.jpg',
    streamCount: 12045,
  },
  {
    id: '2',
    title: 'Moonlight Melody',
    artist: 'Crystal WAV',
    cover: '/covers/song2.jpg',
    streamCount: 10930,
  },
  {
    id: '3',
    title: 'OnChain Anthem',
    artist: 'SmartBeat',
    cover: '/covers/song3.jpg',
    streamCount: 9422,
  },
  // Add more mock data as needed
];

const TopSongsSection: React.FC = () => {
  return (
    <div className="top-songs-section">
      <h2 className="section-title">🔥 Top Trending Songs</h2>
      <div className="top-songs-list">
        {topSongs.map((song) => (
          <div key={song.id} className="top-song-card">
            <img src={song.cover} alt={song.title} className="top-song-cover" />
            <div className="top-song-info">
              <h3>{song.title}</h3>
              <p>{song.artist}</p>
              <span>{song.streamCount.toLocaleString()} streams</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSongsSection;
