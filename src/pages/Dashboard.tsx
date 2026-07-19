import React from 'react';
import ArtistRevenueDashboard from '@/components/ArtistRevenueDashboard';
import TrendingMusicWidget from '@/components/TrendingMusicWidget';

const Dashboard: React.FC = () => {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ArtistRevenueDashboard />
        </div>
        <div>
          <TrendingMusicWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
