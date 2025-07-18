// src/screens/EditProfileScreen.tsx
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "./EditProfileScreen.css";

const EditProfileScreen = () => {
  const { user, updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profilePic, setProfilePic] = useState(user?.profilePic || "/icon-user.png");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePic(imageUrl);
    }
  };

  const handleSave = () => {
    updateUser({ ...user, username, bio, profilePic });
    navigate("/profile");
  };

  return (
    <div className="edit-profile-screen">
      <div className="edit-profile-header">
        <button className="back-button" onClick={() => navigate("/profile")}>
          ←
        </button>
        <h2>Edit Profile</h2>
      </div>

      <div className="edit-profile-form glassy">
        <div className="image-upload">
          <img src={profilePic} alt="Profile" className="preview-image" />
          <label htmlFor="profile-pic" className="upload-btn">Choose File</label>
          <input id="profile-pic" type="file" accept="image/*" onChange={handleImageChange} hidden />
        </div>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about you..."
          rows={4}
        />

        <button className="save-btn" onClick={handleSave}>
          Save Changes
        </button>

        <button className="verify-btn" onClick={() => navigate("/spotify-login")}>
          <img src="/spotify-icon.png" alt="Spotify" className="spotify-icon" />
          Verify with Spotify
        </button>
      </div>
    </div>
  );
};

export default EditProfileScreen;
