import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, signOut, initiateGmailAuth } = useAuth();

  const toggleDrawer = () => {
    setDrawerOpen((prev) => {
      console.log('Toggling drawer:', !prev);
      return !prev;
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setDrawerOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleGmailLogin = () => {
    initiateGmailAuth();
    setDrawerOpen(false);
  };

  return (
    <>
      <div className="header">
        <div className="left">
          <img
            src="/icon-tonjam.png"
            alt="TonJam Logo"
            className="logo"
            onError={(e) => {
              console.error('Failed to load logo:', e);
              e.currentTarget.src = '/fallback-logo.png';
            }}
          />
          <h1 className="title">TonJam</h1>
        </div>
        <div className="right">
          <button className="earn-pill">💰 Earn TJ</button>
          <img
            src="/icon-user.png"
            alt="Profile and navigation menu"
            className="user-icon"
            onClick={toggleDrawer}
            onKeyDown={(e) => e.key === 'Enter' && toggleDrawer()}
            role="button"
            tabIndex={0}
            aria-expanded={drawerOpen}
            style={{ cursor: 'pointer' }}
            onError={(e) => {
              console.error('Failed to load user icon:', e);
              e.currentTarget.src = '/fallback-user.png';
            }}
          />
        </div>
      </div>

      <div className={`drawer ${drawerOpen ? 'open' : ''}`}>
        <button
          className="close-btn"
          onClick={toggleDrawer}
          aria-label="Close navigation drawer"
        >
          ×
        </button>
        <div className="drawer-content">
          <ul>
            <li>
              <Link to="/profile" onClick={() => setDrawerOpen(false)}>
                Profile
              </Link>
            </li>
            <li>
              {user ? (
                <Link to="/link-gmail" onClick={handleGmailLogin}>
                  Link Gmail Account
                </Link>
              ) : (
                <Link to="/login-gmail" onClick={handleGmailLogin}>
                  Login with Gmail
                </Link>
              )}
            </li>
            <li>
              <Link to="/trending" onClick={() => setDrawerOpen(false)}>
                What's Trending
              </Link>
            </li>
            <li>
              <Link to="/settings" onClick={() => setDrawerOpen(false)}>
                Settings
              </Link>
            </li>
            <li>
              <Link to="/verify-spotify" onClick={() => setDrawerOpen(false)}>
                Spotify Verification
              </Link>
            </li>
            <li>
              <Link to="/theme-settings" onClick={() => setDrawerOpen(false)}>
                Theme Settings
              </Link>
            </li>
            {user && (
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Header;
