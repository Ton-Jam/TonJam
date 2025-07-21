import React from 'react';
import './HeaderSection.css';
import { useNavigate } from 'react-router-dom';

const HeaderSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="header-glass">
      <div className="header-left">
        <img src="/logo.png" alt="TonJam Logo" className="logo-icon" />
        <h2 className="app-name">TonJam</h2>
      </div>
      <div className="header-right">
        <button className="earn-button" onClick={() => navigate('/tasks')}>
          Earn TJ
        </button>
        <img src="/icon-user.png" alt="Profile" className="profile-icon" />
      </div>
    </div>
  );
};

export default HeaderSection;
