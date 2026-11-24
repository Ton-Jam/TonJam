import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { FilterPill } from '@/components/marketplace/FilterPill';
import { HomeGenreFilterBar } from '@/components/home/HomeGenreFilterBar';
import { CategoryFilters } from '@/pages/Marketplace/sections/CategoryFilters';
import { QuickFilters } from '@/components/search/QuickFilters';
import { Card } from '@/components/ui/card';

describe('Global Filter Buttons 2px Silver Border & Card Backdrop Removal', () => {
  it('defines 2px subtle silver border and card backdrop-filter: none rules in src/index.css', () => {
    const cssPath = path.resolve(process.cwd(), 'src/index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    expect(cssContent).toContain('--filter-border: 2px solid rgba(192, 192, 192, 0.22);');
    expect(cssContent).toContain('.border-silver-2');
    expect(cssContent).toContain('border: 2px solid rgba(192, 192, 192, 0.22) !important;');
    expect(cssContent).toContain('backdrop-filter: none !important;');
    expect(cssContent).toContain('-webkit-backdrop-filter: none !important;');
  });

  it('applies 2px subtle silver border classes on FilterPill, HomeGenreFilterBar, CategoryFilters, and QuickFilters', () => {
    const { rerender } = render(
      <FilterPill label="All NFTs" active={false} onClick={vi.fn()} />
    );
    const pill = screen.getByRole('button', { name: 'All NFTs' });
    expect(pill.className).toContain('filter-silver-border');
    expect(pill.className).toContain('border-2');

    rerender(<HomeGenreFilterBar activeCategory="All" onSelectCategory={vi.fn()} />);
    const homeFilter = screen.getByRole('button', { name: 'All' });
    expect(homeFilter.className).toContain('filter-silver-border');
    expect(homeFilter.className).toContain('border-2');

    rerender(
      <CategoryFilters
        categories={['All', 'Electronic']}
        activeCategory="All"
        onSelectCategory={vi.fn()}
      />
    );
    const catFilter = screen.getByRole('button', { name: 'Filter by Electronic' });
    expect(catFilter.className).toContain('filter-silver-border');
    expect(catFilter.className).toContain('border');

    rerender(<QuickFilters activeFilter="all" onFilterChange={vi.fn()} />);
    const quickFilter = screen.getByRole('button', { name: 'Tracks' });
    expect(quickFilter.className).toContain('filter-silver-border');
    expect(quickFilter.className).toContain('border-2');
  });

  it('ensures global Card component explicitly disables backdrop-filter', () => {
    render(<Card data-testid="global-card">Card Content</Card>);
    const card = screen.getByTestId('global-card');
    expect(card.className).toContain('backdrop-blur-none');
    expect(card.style.backdropFilter).toBe('none');
  });

  it('configures edge-to-edge horizontal scrolling on filter pill bars', () => {
    const { container: homeContainer } = render(
      <HomeGenreFilterBar activeCategory="All" onSelectCategory={vi.fn()} />
    );
    const homeScroll = homeContainer.querySelector('.overflow-x-auto');
    expect(homeScroll).not.toBeNull();
    expect(homeScroll!.className).toContain('w-full');
    expect(homeScroll!.className).toContain('px-3');
    expect(homeScroll!.className).toContain('touch-pan-x');

    const { container: quickContainer } = render(
      <QuickFilters activeFilter="all" onFilterChange={vi.fn()} />
    );
    const quickScroll = quickContainer.querySelector('.overflow-x-auto');
    expect(quickScroll).not.toBeNull();
    expect(quickScroll!.className).toContain('w-full');
    expect(quickScroll!.className).toContain('px-3');
    expect(quickScroll!.className).toContain('touch-pan-x');

    const { container: catContainer } = render(
      <CategoryFilters
        categories={['All', 'Electronic']}
        activeCategory="All"
        onSelectCategory={vi.fn()}
      />
    );
    const catScroll = catContainer.querySelector('[aria-label="NFT category filters"]');
    expect(catScroll).not.toBeNull();
    expect(catScroll!.className).toContain('overflow-x-auto');
    expect(catScroll!.className).toContain('px-3');
    expect(catScroll!.className).toContain('touch-pan-x');

    const discoverSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/Discover.tsx'), 'utf-8');
    expect(discoverSrc).toContain('overflow-x-auto no-scrollbar -mx-3 px-3');

    const marketplaceSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/Marketplace/index.tsx'), 'utf-8');
    expect(marketplaceSrc).toContain('overflow-x-auto no-scrollbar scrollbar-none -mx-3 px-3 sm:-mx-4 sm:px-4');

    const settingsSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/Settings.tsx'), 'utf-8');
    expect(settingsSrc).toContain('-mx-3 px-3 sm:-mx-6 sm:px-6 overflow-x-auto');

    const librarySrc = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/Library/index.tsx'), 'utf-8');
    expect(librarySrc).toContain('overflow-x-auto pb-1 scrollbar-none snap-x -mx-2 px-2');
  });
});
