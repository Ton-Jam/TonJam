import React from 'react';
import { UserProfile } from '../../types';

export const PlaylistTab: React.FC<{ user: UserProfile }> = ({ user }) => <div className="text-sm p-4">Playlist Content</div>;
