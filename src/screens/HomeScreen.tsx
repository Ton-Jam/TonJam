import React, { useState } from 'react'; import './HomeScreen.css'; import TrackCard from '../components/TrackCard'; import NFTCard from '../components/NFTCard'; import JamFeedCard from '../components/JamFeedCard'; import ArtistCard from '../components/ArtistCard'; import AIPLCard from '../components/AIPLCard'; import PlaylistCard from '../components/PlaylistCard';

const HomeScreen = () => { const [filter, setFilter] = useState('all');

const trendingSongs = [...Array(4).keys()].map(i => ({ id: i, title: Song ${i + 1} })); const trendingNFTs = [...Array(3).keys()].map(i => ({ id: i, title: NFT ${i + 1} })); const trendingAlbums = [...Array(2).keys()].map(i => ({ id: i, title: Album ${i + 1} })); const jamFeeds = [...Array(3).keys()].map(i => ({ id: i, type: i % 2 === 0 ? 'track' : 'nft', title: Feed ${i + 1} })); const trendingArtists = [...Array(4).keys()].map(i => ({ id: i, name: Artist ${i + 1} })); const aiPlaylists = [...Array(2).keys()].map(i => ({ id: i, title: AI Playlist ${i + 1} })); const recommendedPlaylists = [...Array(3).keys()].map(i => ({ id: i, title: Recommended ${i + 1} }));

return ( <div className="home-screen"> <div className="filter-bar"> <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button> <button onClick={() => setFilter('songs')} className={filter === 'songs' ? 'active' : ''}>Songs</button> <button onClick={() => setFilter('nfts')} className={filter === 'nfts' ? 'active' : ''}>NFTs</button> </div>

{(filter === 'all' || filter === 'songs') && (
    <section className="section">
      <h2>Trending Songs</h2>
      <div className="horizontal-scroll">
        {trendingSongs.map(song => <TrackCard key={song.id} {...song} />)}
      </div>
    </section>
  )}

  {(filter === 'all' || filter === 'nfts') && (
    <section className="section">
      <h2>Trending NFTs</h2>
      <div className="horizontal-scroll">
        {trendingNFTs.map(nft => <NFTCard key={nft.id} {...nft} />)}
      </div>
    </section>
  )}

  <section className="section">
    <h2>Trending Albums</h2>
    <div className="horizontal-scroll">
      {trendingAlbums.map(album => <TrackCard key={album.id} {...album} />)}
    </div>
  </section>

  <section className="section">
    <h2>Jam Feeds</h2>
    <div className="vertical-scroll">
      {jamFeeds.map(feed => <JamFeedCard key={feed.id} {...feed} />)}
    </div>
  </section>

  <section className="section">
    <h2>Trending Artists</h2>
    <div className="horizontal-scroll">
      {trendingArtists.map(artist => <ArtistCard key={artist.id} {...artist} />)}
    </div>
  </section>

  <section className="section">
    <h2>Featured AI Playlists</h2>
    <div className="horizontal-scroll">
      {aiPlaylists.map(p => <AIPLCard key={p.id} {...p} />)}
    </div>
  </section>

  <section className="section">
    <h2>Recommended Playlists</h2>
    <div className="horizontal-scroll">
      {recommendedPlaylists.map(p => <PlaylistCard key={p.id} {...p} />)}
    </div>
  </section>
</div>

); };

export default HomeScreen;

