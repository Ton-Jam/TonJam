import React from 'react';
import { UserProfile } from '../../types';

export const AboutTab: React.FC<{ user: UserProfile }> = ({ user }) => <div className="text-sm p-4">About Content</div>;
