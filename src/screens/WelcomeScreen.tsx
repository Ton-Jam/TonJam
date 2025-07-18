import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomeScreen.css";

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 3000); // 3-second delay before navigating

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="welcome-screen">
      <div className="center-content">
        <img src="/logo.png" alt="TonJam Logo" className="logo" />
        <div className="title">TonJam</div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
