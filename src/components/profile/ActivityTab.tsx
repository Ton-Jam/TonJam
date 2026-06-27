import React from 'react';
import { UserProfile } from '../../types';

export const ActivityTab: React.FC<{ user: UserProfile }> = ({ user }) => <div className="text-sm p-4">Activity Content</div>;
