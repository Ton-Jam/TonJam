import React from 'react';
import { useModal } from '@/components/layout/ModalProvider';
import { MintNFTModal as MintNFTModalFull } from '@/components/MintNFTModal';

export const MintNFTModal: React.FC = () => {
  const { closeModal } = useModal();

  return (
    <MintNFTModalFull
      isOpen={true}
      onClose={closeModal}
      onSuccess={() => {
        setTimeout(() => {
          closeModal();
        }, 1500);
      }}
    />
  );
};


