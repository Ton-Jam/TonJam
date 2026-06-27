import React from 'react';
import { UserProfile } from '../../types';

export const OverviewTab: React.FC<{ user: UserProfile }> = ({ user }) => (
  <div className="space-y-4">
    <h3 className="font-bold">Recently Played</h3>
    <div className="text-xs text-[var(--text-muted)]">No recent tracks.</div>
  </div>
);
