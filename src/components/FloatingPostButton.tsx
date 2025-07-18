// FloatingPostButton.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import "./FloatingPostButton.css";

const FloatingPostButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to JamSpace post creation screen or trigger modal
    navigate("create=1");
  };

  return (
    <button className="floating-post-button" onClick={handleClick}>
      <Plus size={24} />
    </button>
  );
};

export default FloatingPostButton;
