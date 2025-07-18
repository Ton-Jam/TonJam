// Filename: src/components/ArtistAvatar.tsx
// This is the complete, upgraded version that can display a verified badge.

import React from 'react';
import './ArtistAvatar.css'; // This refers to the CSS file with the badge positioning styles

// The "contract" for our component now includes an optional 'isVerified' property.
// The '?' after isVerified means it's okay if this prop isn't provided.
interface ArtistAvatarProps {
  name: string;
  imageUrl: string;
  isVerified?: boolean;
}

// We destructure 'isVerified' from the props we receive.
const ArtistAvatar: React.FC<ArtistAvatarProps> = ({ name, imageUrl, isVerified }) => {
  return (
    // We wrap everything in a container for better styling control.
    <div className="artist-avatar-container">
      <div className="artist-image-wrapper">
        <img src={imageUrl} alt={name} className="artist-image" />
        
        {/* 
          This is Conditional Rendering in React.
          The 'isVerified && (...)' part means: 
          "IF the 'isVerified' prop is true, THEN (and only then) render the checkmark image."
          If 'isVerified' is false or not provided, this entire block will render nothing.
        */}
        {isVerified && (
          <img 
            src="/icon-verified-check.png" 
            alt="Verified" 
            className="artist-verified-badge" 
          />
        )}
      </div>
      <p className="artist-name">{name}</p>
    </div>
  );
};

export default ArtistAvatar;
