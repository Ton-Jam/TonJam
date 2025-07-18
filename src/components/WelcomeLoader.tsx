import React from 'react';
import './WelcomeLoader.css';

const WelcomeLoader: React.FC = () => {
  return (
    <div className="welcome-loader">
      <img src="/logo.png" alt="TonJam Logo" className="logo" />
      <h1 className="welcome-text">Welcome to TonJam</h1>
    </div>
  );
};

export default WelcomeLoader;
