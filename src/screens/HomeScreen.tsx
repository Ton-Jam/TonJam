import React from 'react';
import './HomeScreen.css';
import Section from '../components/Section';
import ArtistAvatar from '../components/ArtistAvatar';
import TrackCard from '../components/TrackCard';
import NFTCard from '../components/NFTCard';
// import JamFeedSlider from '../components/JamFeedSlider'; // Temporarily commented out

const HomeScreen: React.FC = () => {
  const trendingArtists = [
    { id: 1, name: 'Sina Vibes', image: '/Artist1.png' },
    { id: 2, name: 'Krisswave', image: '/Artist2.png' },
    { id: 3, name: 'ZazaTon', image: '/Artist3.png' },
  ];

  const newDrops = [
    { id: 1, title: 'Blockchain Party', artist: 'DJ Crypto', image: '/Track1.png' },
    { id: 2, title: 'Meta Nights', artist: 'Lil Ton', image: '/Track2.png' },
  ];

  const trendingNFTs = [
    { id: 1, title: 'TON Banger', price: '25 TON', image: '/NFT1.png' },
    { id: 2, title: 'Chainz Heat', price: '18 TON', image: '/NFT2.png' },
  ];

  return (
    <div className="home-container">
      <header className="home-header">
        <img src="/icon-tonjam.png" alt="TonJam" className="header-icon" />
        <h1>TonJam</h1>
        <div className="header-right">
          <img src="/icon-earn-tj.png" alt="Earn TJ" className="header-icon" />
          <img src="/icon-user.png" alt="User" className="header-user" />
        </div>
      </header>

      <div className="pill-nav">
        <button className="pill-button">Trending NFTs</button>
        <button className="pill-button">Recommended NFTs</button>
      </div>

      <Section title="What’s up! TON Community">
        {/* <JamFeedSlider /> */}
        <p className="coming-soon-text">Sponsored Jam Feed coming soon!</p>
      </Section>

      <Section title="New Drops">
        <div className="card-row">
          {newDrops.map(drop => (
            <TrackCard key={drop.id} {...drop} />
          ))}
        </div>
      </Section>

      <Section title="Top Trending Songs">
        <div className="card-row">
          {newDrops.map(track => (
            <TrackCard key={track.id} {...track} />
          ))}
        </div>
      </Section>

      <Section title="Trending Artists">
        <div className="card-row">
          {trendingArtists.map(artist => (
            <ArtistAvatar key={artist.id} {...artist} />
          ))}
        </div>
      </Section>

      <Section title="Trending NFTs">
        <div className="card-row">
          {trendingNFTs.map(nft => (
            <NFTCard key={nft.id} {...nft} />
          ))}
        </div>
      </Section>
    </div>
  );
};

export default HomeScreen;
