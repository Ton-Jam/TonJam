import React from "react";
import "./StackedCardsPreview.css";

const StackedCardsPreview = ({ items, CardComponent }) => {
  return (
    <div className="stacked-preview">
      {items.slice(0, 3).map((item, index) => (
        <div
          key={item.id}
          className={`stacked-card stacked-card-${index}`}
          style={{ zIndex: 3 - index }}
        >
          <CardComponent {...item} />
        </div>
      ))}
    </div>
  );
};

export default StackedCardsPreview;
