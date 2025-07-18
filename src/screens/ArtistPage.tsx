import React from "react"; import "./ArtistPage.css";

const artistData = { name: "Krushman", image: "/Artist9.png", followers: "12.5K", bio: "Afrobeats producer & singer. Telling African stories through sound.", tracks: [ { id: 1, title: "Neon Lagos", image: "/song1.jpg", minted: true }, { id: 2, title: "Tribe Vibes", image: "/song2.jpg", minted: false }, { id: 3, title: "Island Fever", image: "/song3.jpg", minted: true }, ] };

const ArtistPage = () => { return ( <div className="artist-page"> <div className="artist-header"> <img src={artistData.image} alt={artistData.name} className="artist-avatar" /> <div className="artist-details"> <h1 className="artist-name"> {artistData.name} <img src="/icon-verified-check.png" alt="Verified" className="verified-badge" /> </h1> <p className="artist-followers">{artistData.followers} followers</p> <p className="artist-bio">{artistData.bio}</p> <button className="follow-btn">Follow</button> </div> </div>

<h2 className="section-title">Top Tracks</h2>
  <div className="track-list">
    {artistData.tracks.map(track => (
      <div className="track-card" key={track.id}>
        <img src={track.image} alt={track.title} className="track-image" />
        <div className="track-info">
          <h3>{track.title}</h3>
          <div className="track-actions">
            <button className="play-btn">
              <img src="/play-icon.png" alt="Play" />
            </button>
            {track.minted && <button className="mint-btn">Mint</button>}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

); };

export default ArtistPage;

