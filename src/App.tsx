import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import TaskScreen from "./screens/TaskScreen";
import ProfileScreen from "./screens/ProfileScreen";
import BottomNavBar from "./components/BottomNavBar";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <div className="header-left">
            <img src="/icon-tonjam.png" alt="TonJam" className="app-logo" />
            <span className="app-name">TonJam</span>
          </div>
          <div className="header-right">
            <a href="/tasks" className="earn-tj-button">Earn TJ</a>
            <img src="/icon-user.png" alt="Profile" className="profile-icon" />
          </div>
        </header>

        <main className="home-screen">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/tasks" element={<TaskScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
          </Routes>
        </main>

        <BottomNavBar />
      </div>
    </Router>
  );
};

export default App;
