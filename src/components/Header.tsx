import React from "react";
import { useNavigate } from "react-router-dom";
import Equalizer from "./Equalizer";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="header">
      <div className="left" onClick={() => navigate("/")}>
        <img src="/logo.png" alt="TonJam" className="logo" />
        <h1 className="title">TonJam</h1>
        <Equalizer />
      </div>
      <img
        src="/icon-user.png"
        alt="Profile"
        className="profile-icon"
        onClick={() => navigate("/profile")}
      />
    </div>
  );
};

export default Header;
