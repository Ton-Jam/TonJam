import React from 'react';
import { useAuth } from '../context/AuthContext';

const LoginGmailScreen: React.FC = () => {
  const { initiateGmailAuth } = useAuth();
  return (
    <div>
      <h2>Login with Gmail</h2>
      <button onClick={initiateGmailAuth}>Login with Gmail</button>
    </div>
  );
};

export default LoginGmailScreen;
