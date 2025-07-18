import React from "react";
import "./ProfileScreen.css";
import { useUser } from "../context/UserContext";
import { useFollow } from "../context/FollowContext";

const ProfileScreen: React.FC<{ profileUser: any }> = ({ profileUser }) => {
  const { user } = useUser();
  const { isFollowing, toggleFollow } = useFollow();

  const isOwnProfile = user?.id === profileUser?.id;

  const handleFollowClick = () => {
    if (user && !isOwnProfile) {
      toggleFollow(profileUser.id);
    } else if (!user) {
      alert("Please log in to follow users.");
    }
  };

  return (
    <div className="profile-screen">
      <div className="profile-header">
        <img className="profile-pic" src={profileUser.profilePic || "/default-avatar.png"} alt={profileUser.name} />
        <div className="profile-name">
          {profileUser.name}
          {profileUser.isVerified && (
            <img src="/icon-verified-check.png" alt="Verified" className="verified-icon" />
          )}
        </div>
        <div className="follow-stats">
          <span>{profileUser.followers?.length || 0} Followers</span>
          <span>{profileUser.following?.length || 0} Following</span>
        </div>
        {!isOwnProfile && (
          <button className="follow-btn" onClick={handleFollowClick}>
            {isFollowing(profileUser.id) ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      <div className="profile-content">
        {/* NFT tabs, playlists, uploaded tracks, etc. */}
      </div>
    </div>
  );
};

export default ProfileScreen;
