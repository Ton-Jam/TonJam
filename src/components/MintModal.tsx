// src/components/MintModal.tsx
import React from "react";
import "./MintModal.css";

interface MintModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  price?: number;
  image?: string;
}

const MintModal: React.FC<MintModalProps> = ({ visible, onClose, title, price, image }) => {
  if (!visible) return null;

  return (
    <div className="mint-modal-overlay">
      <div className="mint-modal">
        <button className="close-btn" onClick={onClose}>×</button>

        <img src={image} alt="NFT" className="modal-img" />
        <h2>{title}</h2>
        <p className="modal-price">
          <img src="/icon-ton-diamond.png" alt="TON" className="modal-ton-icon" />
          {price} TON
        </p>

        <button className="confirm-btn">Confirm Mint</button>
      </div>
    </div>
  );
};

export default MintModal;
