import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MintNFTModal } from '@/components/MintNFTModal';
import { Track } from '@/types';

export const MintNFT: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const track = location.state?.track as Track | undefined;

  return (
    <MintNFTModal 
      isOpen={true} 
      onClose={() => navigate(-1)} 
      preselectedTrack={track} 
    />
  );
};

export default MintNFT;
