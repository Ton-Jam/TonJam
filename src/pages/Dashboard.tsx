import React from 'react';
import ArtistRevenueDashboard from '@/components/ArtistRevenueDashboard';
import TrendingMusicWidget from '@/components/TrendingMusicWidget';
import RoyaltyStatusCard from '@/components/RoyaltyStatusCard';
import JamTokenPriceTrendsWidget from '@/components/JamTokenPriceTrendsWidget';

const Dashboard: React.FC = () => {
  return (
    <div className="px-2 py-4 w-full max-w-full space-y-8">
      {/* Royalty Status Card */}
      <RoyaltyStatusCard />

      {/* JAM Token Market Price Trends */}
      <JamTokenPriceTrendsWidget />

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
