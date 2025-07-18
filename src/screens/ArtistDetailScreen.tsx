import React from 'react'; import './ArtistDetailScreen.css'; import ArtistCard from '../components/ArtistCard'; import TrackCard from '../components/TrackCard'; import NFTCard from '../components/NFTCard';

const ArtistDetailScreen = () => { const artist = { id: 1, name: 'Krushy Waves', image: '/Artist9.png', followers: 12800, verified: true, };

const topTracks = [ { id: 1, title: 'Wavy Tonic', artist: 'Krushy Waves', cover: '/Cover1.png', duration: '3:12' }, { id: 2, title: 'Moonlight Riddim', artist: 'Krushy Waves', cover: '/Cover2.png', duration: '2:58' }, ];

const nfts = [ { id: 1, title: 'Minted Tonic', artist: 'Krushy Waves', cover: '/Cover3.png', price: '15 TON' }, { id: 2, title: 'NFT Vibe', artist: 'Krushy Waves', cover: '/Cover4.png', price: '20 TON' }, ];

return ( <div className="artist-detail-screen"> <div className="artist-header"> <img src={artist.image} alt={artist.name} className="artist-avatar" /> <div className="artist-info"> <h2>{artist.name} {artist.verified && <img src="/icon-verified-check.png" alt="Verified" className="verified-icon" />}</h2> <p>{artist.followers.toLocaleString()} Followers</p> <button className="follow-button">Follow</button> </div> </div>

<section className="artist-section">
    <h3>Top Tracks</h3>
    <div className="card-row">
      {topTracks.map(track => <TrackCard key={track.id} {...track} />)}
    </div>
  </section>

  <section className="artist-section">
    <h3>Minted NFTs</h3>
    <div className="card-row">
      {nfts.map(nft => <NFTCard key={nft.id} {...nft} />)}
    </div>
  </section>
</div>

); };

export default ArtistDetailScreen;

