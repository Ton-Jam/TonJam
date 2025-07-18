// src/components/SlideMenu.tsx
import React from "react";
import "./SlideMenu.css";

export default function SlideMenu({ isOpen, onClose }) {
  return (
    <div className={`slide-menu ${isOpen ? "open" : ""}`}>
      <div className="slide-header">
        <h3>Menu</h3>
        <button onClick={onClose}>✕</button>
      </div>
      <ul className="slide-options">
        <li><button>🔑 Login</button></li>
        <li><button>👤 Profile</button></li>
        <li><button>🔗 Connect Wallet</button></li>
        <li><button>🎧 Spotify Verification</button></li>
        <li><button>⚙️ Settings</button></li>
        <li><button>🌓 Theme Switch</button></li>
      </ul>
    </div>
  );
}
