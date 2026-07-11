import React from 'react';
import { UploadTrackButton } from './UploadTrackButton';
import { MintNFTButton } from './MintNFTButton';
import { EarningsCard } from './EarningsCard';
import { AnalyticsCard } from './AnalyticsCard';
import { ProfileData } from '@/components/profile/ProfileTypes';
import ArtistRevenueDashboard from '@/components/ArtistRevenueDashboard';

interface CreatorToolsProps {
  profile: ProfileData;
}

export const CreatorTools: React.FC<CreatorToolsProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight text-white uppercase font-sans">
          Creator Control Hub
        </h3>
        <p className="text-xs text-slate-400">
          Supervise digital asset performance, royalty nodes, and publish new tracks.
        </p>
      </div>

      {/* Grid of upload & mint shortcuts */}
      <div className="grid grid-cols-2 gap-3">
        <UploadTrackButton />
        <MintNFTButton />
      </div>

      {/* Financials and Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EarningsCard />
        <AnalyticsCard artistName={profile.name} />
      </div>

      <div className="pt-4 border-t border-white/5">
        <ArtistRevenueDashboard />
      </div>
    </div>
  );
};

export default CreatorTools;
