// Filename: src/components/FilterPills.tsx
import React from 'react';
import './FilterPills.css';

interface FilterPillsProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

const FilterPills: React.FC<FilterPillsProps> = ({ activeFilter, setActiveFilter }) => {
  const filters = ['All', 'Music', 'Podcast'];
  return (
    <div className="filter-pills-container-main">
      {filters.map(filter => (
        <button
          key={filter}
          onClick={() => setActiveFilter(filter)}
          className={`filter-pill-main ${activeFilter === filter ? 'active' : ''}`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};
export default FilterPills;
