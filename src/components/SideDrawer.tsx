import React from "react";
import { useTheme } from "../context/ThemeContext";
import "./SideDrawer.css";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`side-drawer ${isOpen ? "open" : ""}`}>
      <button className="close-button" onClick={onClose}>
        ✕
      </button>
      <h3>Menu</h3>
      <button onClick={toggleTheme}>
        Toggle Theme ({theme === "light" ? "Dark" : "Light"})
      </button>
    </div>
  );
};

export default SideDrawer;
