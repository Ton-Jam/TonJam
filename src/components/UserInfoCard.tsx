import React from 'react';
import './UserInfoCard.css';

interface UserInfoCardProps {
  username: string;
  handle: string;
  onClick?: () => void;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ username, handle, onClick }) => {
  return (
    <div className="user-info-card" onClick={onClick}>
      <div className="user-icon-container">
        <img src="/icon-user.png" alt="User Icon" className="user-icon" />
        <div className="user-info-text">
          <h2>{username}</h2>
          <p>@{handle}</p>
        </div>
      </div>
      <span className="user-info-arrow">{'>'}</span>
    </div>
  );
};

export default UserInfoCard;
