import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

vi.mock('@/contexts/AudioContext', () => ({
  useAudio: () => ({
    isFullPlayerOpen: false,
    setFullPlayerOpen: vi.fn(),
  }),
}));

describe('BottomNavigation icon stroke width', () => {
  it('renders +1px bolder icon strokeWidth for active (2.75) and inactive (2.25) tabs', () => {
    render(<BottomNavigation activeTab="home" />);

    const homeButton = screen.getByRole('button', { name: 'Home' });
    const searchButton = screen.getByRole('button', { name: 'Search' });
    const marketplaceButton = screen.getByRole('button', { name: 'Marketplace' });

    const homeSvg = homeButton.querySelector('svg');
    const searchSvg = searchButton.querySelector('svg');
    const marketplaceSvg = marketplaceButton.querySelector('svg');

    expect(homeSvg?.getAttribute('stroke-width')).toBe('2.75');
    expect(searchSvg?.getAttribute('stroke-width')).toBe('2.25');
    expect(marketplaceSvg?.getAttribute('stroke-width')).toBe('2.25');
  });
});
