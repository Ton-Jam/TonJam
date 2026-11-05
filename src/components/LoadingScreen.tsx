import React from "react";
import { APP_LOGO } from "@/constants";

const LoadingScreen: React.FC = () => {
  return (
    <div className="protected-route-loading-overlay">
      <div className="loader-container">
        <img
          src={APP_LOGO || "https://i.postimg.cc/63GsZHzq/TonJam-icon.png"}
          alt="TonJam"
          className="spinning-logo"
          onError={(e) => {
            e.currentTarget.src = "https://i.postimg.cc/63GsZHzq/TonJam-icon.png";
          }}
        />
        <h1 className="pulsing-title">
          TonJam
        </h1>
      </div>
    </div>
  );
};

export default LoadingScreen;
