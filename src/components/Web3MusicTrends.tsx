import React from 'react';
import { Web3MusicNews } from './home/Web3MusicNews';

interface Web3MusicTrendsProps {
  className?: string;
}

export const Web3MusicTrends: React.FC<Web3MusicTrendsProps> = ({ className = '' }) => {
  return <Web3MusicNews className={className} />;
};

export default Web3MusicTrends;
