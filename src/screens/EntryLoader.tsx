import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EntryLoader.css';

const EntryLoader: React.FC = () => {
  const { login, loginAsGuest } = useAuth() || {};
  const navigate = useNavigate();

  useEffect(() => {
    const loadSession = async () => {
      try {
        console.log('Starting session load...');
        const storedUser = localStorage.getItem('tonjam_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          console.log('User found:', user);
          if (login && !user.isGuest) {
            console.log('Attempting login...');
            await login(user);
            console.log('Login successful');
          }
        } else {
          console.log('No user found, attempting guest login...');
          if (loginAsGuest) {
            console.log('Attempting guest login...');
            await loginAsGuest();
            console.log('Guest login successful');
          }
        }
        console.log('Navigating to /home...');
        navigate('/home');
      } catch (error) {
        console.error('Error in EntryLoader:', error);
        console.log('Falling back to guest and navigating...');
        if (loginAsGuest) await loginAsGuest();
        navigate('/home');
      }
    };

    loadSession();
  }, [login, loginAsGuest, navigate]);

  return (
    <div className="entry-loader">
      <img src="/background.png" alt="Background" className="loader-background" />
      <div className="loader-content">
        <img src="/logo.png" alt="TonJam Logo" className="loader-logo" />
        <p className="loader-text">Loading TonJam...</p>
      </div>
    </div>
  );
};

export default EntryLoader;
