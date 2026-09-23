import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DailyMissions } from '@/components/DailyMissions';
import { DailyMission } from '@/types';

describe('DailyMissions Component', () => {
  const mockMissions: DailyMission[] = [
    {
      id: 'm1',
      title: 'Listen to 3 new tracks',
      description: 'Stream fresh music today',
      reward: 10,
      type: 'listen_new_track',
      target: 3,
      progress: 2,
      completed: false,
      expiresAt: Date.now() + 3600000,
    },
    {
      id: 'm2',
      title: 'Follow 2 artists',
      description: 'Connect with creators',
      reward: 8,
      type: 'follow_artist',
      target: 2,
      progress: 1,
      completed: false,
      expiresAt: Date.now() + 3600000,
    },
    {
      id: 'm3',
      title: 'Explore 3 NFTs',
      description: 'Browse marketplace items',
      reward: 5,
      type: 'explore_nft',
      target: 3,
      progress: 3,
      completed: true,
      expiresAt: Date.now() + 3600000,
    },
  ];

  it('renders daily missions title and list items correctly', () => {
    render(<DailyMissions missions={mockMissions} />);
    
    expect(screen.getByText('Daily Missions')).toBeDefined();
    expect(screen.getByText('Listen to 3 new tracks')).toBeDefined();
    expect(screen.getByText('Follow 2 artists')).toBeDefined();
    expect(screen.getByText('Explore 3 NFTs')).toBeDefined();
    
    // Check rewards
    expect(screen.getByText('+10 TJ')).toBeDefined();
    expect(screen.getByText('+8 TJ')).toBeDefined();
    expect(screen.getByText('+5 TJ')).toBeDefined();

    // Check progress
    expect(screen.getByText('2 / 3')).toBeDefined();
    expect(screen.getByText('1 / 2')).toBeDefined();
    expect(screen.getByText('3 / 3')).toBeDefined();

    // Check completed indicator
    expect(screen.getByText('Completed')).toBeDefined();
  });

  it('handles empty missions gracefully', () => {
    render(<DailyMissions missions={[]} />);
    expect(screen.getByText('No daily missions available')).toBeDefined();
    expect(screen.getByText('Check back later.')).toBeDefined();
  });

  it('renders loading skeletons when isLoading is true', () => {
    const { container } = render(<DailyMissions isLoading={true} />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('safely clamps progress values preventing NaN or negative numbers', () => {
    const edgeCaseMissions: DailyMission[] = [
      {
        id: 'm-edge-1',
        title: 'Safe Edge Mission',
        description: 'Test invalid numbers',
        reward: 15,
        type: 'custom',
        target: 0,
        progress: -5,
        completed: false,
        expiresAt: 0,
      },
    ];

    render(<DailyMissions missions={edgeCaseMissions} />);
    expect(screen.getByText('0 / 1')).toBeDefined();
    expect(screen.getByText('0%')).toBeDefined();
    expect(screen.getByText('+15 TJ')).toBeDefined();
  });
});
