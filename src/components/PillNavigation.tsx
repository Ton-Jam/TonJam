import React from 'react';
import './PillNavigation.css';

interface PillNavProps {
  pills: { label: string; onClick: () => void }[];
  activeIndex: number;
}

const PillNav: React.FC<PillNavProps> = ({ pills, activeIndex }) => {
  return (
    <div className="pill-nav">
      {pills.map((pill, index) => (
        <button
          key={index}
          className={`pill ${activeIndex === index ? 'active' : ''}`}
          onClick={pill.onClick}
        >
          {pill.label}
        </button>
      ))}
    </div>
  );
};

export default PillNav;
