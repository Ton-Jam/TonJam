import React, { useState } from 'react';
import './ShowMoreToggle.css';

interface ShowMoreToggleProps<T> {
  items: T[];
  visibleCount?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

function ShowMoreToggle<T>({
  items,
  visibleCount = 3,
  renderItem,
}: ShowMoreToggleProps<T>) {
  const [expanded, setExpanded] = useState(false);

  const visibleItems = expanded ? items : items.slice(0, visibleCount);

  return (
    <div className="show-more-toggle">
      {visibleItems.map((item, index) => renderItem(item, index))}

      {items.length > visibleCount && (
        <div className="show-more-wrap">
          <button className="show-more-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Show Less ▲' : 'Show More ▼'}
          </button>
        </div>
      )}
    </div>
  );
}

export default ShowMoreToggle;
