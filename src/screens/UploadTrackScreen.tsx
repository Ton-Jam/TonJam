import React, { useState } from 'react';
import { uploadTrack } from '../utils/uploadTrack';
import './UploadTrackScreen.css';

const UploadTrackScreen = () => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [songFile, setSongFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    if (!title || !artist || !songFile || !coverFile) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await uploadTrack({
        title,
        artist,
        songFile,
        coverFile,
      });
      setSuccess(true);
      setTitle('');
      setArtist('');
      setSongFile(null);
      setCoverFile(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload New Track</h2>

      <input
        type="text"
        placeholder="Track Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="upload-input"
      />

      <input
        type="text"
        placeholder="Artist Name"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        className="upload-input"
      />

      <label className="upload-label">Select Song (MP3)</label>
      <input
        type="file"
        accept="audio/mp3,audio/mpeg"
        onChange={(e) => setSongFile(e.target.files?.[0] || null)}
        className="upload-input"
      />

      <label className="upload-label">Select Cover Image</label>
      <input
        type="file"
        accept="image/png,image/jpeg"
        onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
        className="upload-input"
      />

      <button onClick={handleUpload} disabled={loading} className="upload-button">
        {loading ? 'Uploading...' : 'Upload Track'}
      </button>

      {success && <p className="upload-success">Track uploaded successfully!</p>}
    </div>
  );
};

export default UploadTrackScreen;
