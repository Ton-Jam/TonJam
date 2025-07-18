import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./BottomNavBar.css";

const BottomNavBar = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      label: "Jam up!",
      icon: "/jamup-icon.png", // single logo for TonJam
    },
    {
      path: "/search",
      label: "Search",
      icon: "/search-icon.png",
    },
    {
      path: "/space",
      label: "Space",
      icon: "/space-icon.png",
    },
    {
      path: "/library",
      label: "Library",
      icon: "/library-icon.png",
    },
    {
      path: "/nfts",
      label: "NFTs",
      icon: "/nft-icon.png",
    },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive ? "active" : ""}`}
          >
            <img src={item.icon} alt={item.label} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavBar;
