// src/components/Section.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Section.css";

const Section = ({ title, data, CardComponent, route }: {
  title: string;
  data: any[];
  CardComponent: React.ComponentType<any>;
  route?: string;
}) => {
  const navigate = useNavigate();

  return (
    <div className="section">
      <div className="section-header">
        <h3>{title}</h3>
        {route && (
          <span className="view-more" onClick={() => navigate(route)}>
            View More
          </span>
        )}
      </div>
      <div className="scroll-row">
        {data.map((item, index) => (
          <CardComponent key={item.id || index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Section;
