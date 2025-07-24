import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../context/AuthContext';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

const VerifySpotifyScreen: React.FC = () => {
  const { user, spotifyToken } = useAuth();
  const [spotifyArtistId, setSpotifyArtistId] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    const checkVerification = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('artists')
          .select('is_verified')
          .eq('id', user.id)
          .single();
        if (error) console.error('Verification check error:', error);
        else setIsVerified(data?.is_verified || false);
      }
    };
    checkVerification();
  }, [user]);

  const verifyArtist = async () => {
    if (!spotifyToken) {
      setVerifyError('Please connect your Spotify account');
      return;
    }
    spotifyApi.setAccessToken(spotifyToken);
    try {
      const artist = await spotifyApi.getArtist(spotifyArtistId);
      if (artist.id) {
        const { error } = await supabase.from('artists').upsert({
          id: user.id,
          spotify_artist_id: artist.id,
          artist_name: artist.name,
          is_verified: true,
          verification_date: new Date(),
        });
        if (error) throw error;
        setIsVerified(true);
        setVerifyError(null);
      }
    } catch (err: any) {
      setVerifyError(`Invalid Spotify Artist ID or API error: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Spotify Verification</h2>
      {isVerified ? (
        <p>You are a verified artist!</p>
      ) : (
        <>
          <input
            type="text"
            value={spotifyArtistId}
            onChange={(e) => setSpotifyArtistId(e.target.value)}
            placeholder="Enter Spotify Artist ID"
          />
          <button onClick={verifyArtist}>Verify Artist</button>
          {verifyError && <p style={{ color: 'red' }}>{verifyError}</p>}
        </>
      )}
    </div>
  );
};

export default VerifySpotifyScreen;
