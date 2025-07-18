import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "./HomeScreen.css";

const HomeScreen = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div className="home-screen">
      <div className="home-header">
        <img src="/logo.png" className="logo" alt="TonJam" />
        <h2>TonJam</h2>
        <button className="earn-button" onClick={() => navigate("/tasks")}>
          Earn $TJ
        </button>
        <img
          src={user?.profilePic}
          className="profile-icon"
          alt="profile"
          onClick={() => navigate("/profile")}
        />
      </div>

      <h1>Welcome, {user.name}</h1>
    </div>
  );
};

export default HomeScreen;
