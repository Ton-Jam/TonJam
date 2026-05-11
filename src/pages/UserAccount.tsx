import React from 'react';
import ProfileSettings from './ProfileSettings';

export default function UserAccount() {
  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground mb-6">User Account</h1>
      <ProfileSettings />
    </div>
  );
}
