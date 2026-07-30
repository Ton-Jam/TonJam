import React from 'react';
import { useModal } from '@/components/layout/ModalProvider';
import { ListNFTForm } from '@/components/ListNFTForm';

export const MintNFTModal: React.FC = () => {
  const { closeModal } = useModal();

  return (
    <div className="py-2">
      <ListNFTForm
        onCancel={closeModal}
        onSuccess={() => {
          setTimeout(() => {
            closeModal();
          }, 2000);
        }}
      />
    </div>
  );
};

