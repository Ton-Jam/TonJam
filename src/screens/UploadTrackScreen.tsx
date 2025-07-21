// src/screens/UploadTrackScreen.tsx
import React, { useState } from 'react';
import './UploadTrackScreen.css';

const UploadTrackScreen: React.FC = () => {
  const [trackTitle, setTrackTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');

  const handleUpload = () => {
    if (!trackTitle || !file) {
      alert("Please provide a track title and audio file.");
      return;
    }
    // Simulate upload logic
    console.log("Uploading:", trackTitle, file, description);
    alert("Track uploaded and ready to mint!");
  };

  return (
    <div className="upload-track-container">
      <h2>Upload Your Track</h2>
      <input
        type="text"
        placeholder="Track Title"
        value={trackTitle}
        onChange={(e) => setTrackTitle(e.target.value)}
      />
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <textarea
        placeholder="Track Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={handleUpload}>Upload & Mint</button>
    </div>
  );
};

export default UploadTrackScreen;
