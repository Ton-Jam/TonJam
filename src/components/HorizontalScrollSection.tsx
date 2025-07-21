import React, { ReactNode } from 'react';
import './HorizontalScrollSection.css';

interface HorizontalScrollSectionProps {
  title?: string;
  children: ReactNode;
}

const HorizontalScrollSection: React.FC<HorizontalScrollSectionProps> = ({ title, children }) => {
  return (
    <div className="horizontal-section">
      {title && <h2 className="horizontal-title">{title}</h2>}
      <div className="horizontal-scroll">{children}</div>
    </div>
  );
};

export default HorizontalScrollSection;
