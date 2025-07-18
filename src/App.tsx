import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomeScreen from "./screens/WelcomeScreen";
import HomeScreen from "./screens/HomeScreen";
import SearchScreen from "./screens/SearchScreen";
import JamSpaceScreen from "./screens/JamSpaceScreen";
import LibraryScreen from "./screens/LibraryScreen";
import NFTMarketScreen from "./screens/NFTMarketScreen";
import PlaylistScreen from "./screens/PlaylistScreen";
import ArtistScreen from "./screens/ArtistScreen";
import UploadTrackScreen from "./screens/UploadTrackScreen";
import BottomNavBar from "./components/BottomNavBar";
import { AuthProvider } from "./context/AuthContext";
import { FollowProvider } from "./context/FollowContext";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <FollowProvider>
        <div className="app-container">
          <Router>
            <Routes>
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="/home" element={<HomeScreen />} />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/jamspace" element={<JamSpaceScreen />} />
              <Route path="/library" element={<LibraryScreen />} />
              <Route path="/marketplace" element={<NFTMarketScreen />} />
              <Route path="/playlist/:id" element={<PlaylistScreen />} />
              <Route path="/artist/:id" element={<ArtistScreen />} />
              <Route path="/upload" element={<UploadTrackScreen />} />
            </Routes>
            <BottomNavBar />
          </Router>
        </div>
      </FollowProvider>
    </AuthProvider>
  );
}

export default App;
