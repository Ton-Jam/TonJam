import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GmailCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return <div>Loading...</div>;
};

export default GmailCallback;
