import React from 'react';
import './ProfileScreen.css';

const ProfileScreen: React.FC = () => {
  return (
    <div className="profile-screen">
      <h2>Profile</h2>
      <p>This is your profile page. Add user details, followed artists, and settings here.</p>
      <div className="profile-content">
        {/* Example content */}
        {Array(10).fill(0).map((_, i) => (
          <div key={i} className="profile-card">
            Profile Item {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileScreen;
