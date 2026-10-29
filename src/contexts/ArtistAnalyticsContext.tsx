import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Track, NFTItem } from '@/types';

export type TimeRange = '30d' | '90d' | 'all';
export type AnalyticsMetricTab = 'overview' | 'streams' | 'followers' | 'nfts';

export interface StreamMetricPoint {
  date: string;
  streams: number;
  listeners: number;
  completionRate: number;
  hasMilestone?: boolean;
  milestoneLabel?: string;
}

export interface FollowerMetricPoint {
  date: string;
  followers: number;
  netGain: number;
}

export interface NFTSalesMetricPoint {
  date: string;
  volumeTON: number;
  salesCount: number;
  royaltiesTON: number;
  floorPrice: number;
  hasMilestone?: boolean;
  milestoneLabel?: string;
}

export interface TopTrackAnalytics {
  id: string;
  title: string;
  streams: number;
  uniqueListeners: number;
  completionRate: number;
  trend: number;
  coverUrl?: string;
}

export interface AnalyticsSummary {
  totalStreams: number;
  streamGrowthPercent: number;
  totalFollowers: number;
  followerGrowthPercent: number;
  nftVolumeTON: number;
  nftVolumeGrowthPercent: number;
  totalRoyaltiesTON: number;
  royaltiesGrowthPercent: number;
  totalListeners: number;
  listenersGrowthPercent: number;
  topTrackTitle: string;
}

export interface ArtistAnalyticsContextType {
  artistId: string | null;
  artistName: string | null;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  activeTab: AnalyticsMetricTab;
  setActiveTab: (tab: AnalyticsMetricTab) => void;
  streamData: StreamMetricPoint[];
  dailyStreams30d: StreamMetricPoint[];
  dailyStreams90d: StreamMetricPoint[];
  dailyStreamsAll: StreamMetricPoint[];
  nftSalesData: NFTSalesMetricPoint[];
  nftSales30d: NFTSalesMetricPoint[];
  nftSales90d: NFTSalesMetricPoint[];
  nftSalesAll: NFTSalesMetricPoint[];
  followerData: FollowerMetricPoint[];
  topTracks: TopTrackAnalytics[];
  summary: AnalyticsSummary;
  isLoading: boolean;
  setArtistContextData: (data: {
    artistId?: string;
    artistName?: string;
    tracks?: Track[];
    nfts?: NFTItem[];
  }) => void;
  refreshAnalytics: () => void;
}

const defaultSummary: AnalyticsSummary = {
  totalStreams: 148520,
  streamGrowthPercent: 18.4,
  totalFollowers: 12400,
  followerGrowthPercent: 9.2,
  nftVolumeTON: 462.8,
  nftVolumeGrowthPercent: 24.6,
  totalRoyaltiesTON: 46.28,
  royaltiesGrowthPercent: 24.6,
  totalListeners: 28940,
  listenersGrowthPercent: 14.1,
  topTrackTitle: "Midnight Echoes",
};

const ArtistAnalyticsContext = createContext<ArtistAnalyticsContextType | null>(null);

function seededRandom(seedStr: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function generateSeriesForRange(
  artistId: string,
  rangeKey: TimeRange,
  tracks: Track[],
  nfts: NFTItem[]
) {
  const seed = `${artistId || 'default'}-${rangeKey}`;
  const rng = seededRandom(seed);

  let pointCount = 30;
  if (rangeKey === '90d') pointCount = 12; // 12 weeks
  else if (rangeKey === 'all') pointCount = 12; // 12 months (All-time)

  const realTrackStreamsTotal = tracks.reduce((acc, t) => acc + (t.playCount || 0), 0);
  const baselineStreams = realTrackStreamsTotal > 1000 ? realTrackStreamsTotal : 150000;
  const realNftVolume = nfts.reduce((acc, n) => acc + (parseFloat(n.price || '0') || 0), 0);
  const baselineNftVolume = realNftVolume > 10 ? realNftVolume * 5 : 500;

  const streamData: StreamMetricPoint[] = [];
  const nftSalesData: NFTSalesMetricPoint[] = [];
  const followerData: FollowerMetricPoint[] = [];

  let runningFollowers = 9800;
  let cumulativeStreams = 0;
  let cumulativeNftVolume = 0;

  for (let i = 0; i < pointCount; i++) {
    let label = `Day ${i + 1}`;
    if (rangeKey === '90d') label = `W${i + 1}`;
    else if (rangeKey === 'all') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      label = months[i % months.length];
    }

    const variance = 0.8 + rng() * 0.4 + (i > pointCount * 0.6 ? 0.25 : 0);
    const dayStreams = Math.floor((baselineStreams / pointCount) * variance);
    cumulativeStreams += dayStreams;

    const dayListeners = Math.floor(dayStreams * (0.6 + rng() * 0.15));
    const completionRate = Math.min(96, Math.max(68, Math.floor(78 + (rng() - 0.5) * 12)));

    // Milestone check for streams (e.g., reaching 10k or 50k streams)
    let hasStreamMilestone = false;
    let streamMilestoneLabel = '';
    if (!rangeKey && cumulativeStreams >= 10000 && cumulativeStreams - dayStreams < 10000) {
      hasStreamMilestone = true;
      streamMilestoneLabel = '10k Streams Milestone!';
    } else if (cumulativeStreams >= 50000 && cumulativeStreams - dayStreams < 50000) {
      hasStreamMilestone = true;
      streamMilestoneLabel = '50k Streams Milestone!';
    }

    streamData.push({
      date: label,
      streams: dayStreams,
      listeners: dayListeners,
      completionRate,
      hasMilestone: hasStreamMilestone,
      milestoneLabel: streamMilestoneLabel,
    });

    const baseVol = (baselineNftVolume / pointCount) * (0.7 + rng() * 0.8);
    const vol = parseFloat(baseVol.toFixed(2));
    cumulativeNftVolume += vol;
    const sales = Math.max(1, Math.floor(vol / 15));
    const royalties = parseFloat((vol * 0.08).toFixed(2));
    const floor = parseFloat((9.0 + rng() * 6.0).toFixed(1));

    let hasNftMilestone = false;
    let nftMilestoneLabel = '';
    if (cumulativeNftVolume >= 100 && cumulativeNftVolume - vol < 100) {
      hasNftMilestone = true;
      nftMilestoneLabel = '100 TON NFT Volume Milestone!';
    }

    nftSalesData.push({
      date: label,
      volumeTON: vol,
      salesCount: sales,
      royaltiesTON: royalties,
      floorPrice: floor,
      hasMilestone: hasNftMilestone,
      milestoneLabel: nftMilestoneLabel,
    });

    const netGain = Math.floor(40 + rng() * 80);
    runningFollowers += netGain;
    followerData.push({
      date: label,
      followers: runningFollowers,
      netGain,
    });
  }

  return { streamData, nftSalesData, followerData };
}

export interface ArtistAnalyticsProviderProps {
  children: React.ReactNode;
  initialArtistId?: string;
  initialArtistName?: string;
  initialTracks?: Track[];
  initialNfts?: NFTItem[];
}

export const ArtistAnalyticsProvider: React.FC<ArtistAnalyticsProviderProps> = ({
  children,
  initialArtistId,
  initialArtistName,
  initialTracks,
  initialNfts,
}) => {
  const [artistId, setArtistId] = useState<string | null>(initialArtistId || 'dj-krupy');
  const [artistName, setArtistName] = useState<string | null>(initialArtistName || 'DJ Krupy');
  const [tracks, setTracks] = useState<Track[]>(initialTracks || []);
  const [nfts, setNfts] = useState<NFTItem[]>(initialNfts || []);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [activeTab, setActiveTab] = useState<AnalyticsMetricTab>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [version, setVersion] = useState<number>(0);

  const setArtistContextData = useCallback((data: {
    artistId?: string;
    artistName?: string;
    tracks?: Track[];
    nfts?: NFTItem[];
  }) => {
    if (data.artistId) setArtistId(data.artistId);
    if (data.artistName) setArtistName(data.artistName);
    if (data.tracks) setTracks(data.tracks);
    if (data.nfts) setNfts(data.nfts);
  }, []);

  const refreshAnalytics = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setVersion((v) => v + 1);
      setIsLoading(false);
    }, 250);
  }, []);

  // Generate all time range series
  const series30d = useMemo(() => generateSeriesForRange(artistId || 'dj-krupy', '30d', tracks, nfts), [artistId, tracks, nfts, version]);
  const series90d = useMemo(() => generateSeriesForRange(artistId || 'dj-krupy', '90d', tracks, nfts), [artistId, tracks, nfts, version]);
  const seriesAll = useMemo(() => generateSeriesForRange(artistId || 'dj-krupy', 'all', tracks, nfts), [artistId, tracks, nfts, version]);

  const activeStreamData = useMemo(() => {
    if (timeRange === '90d') return series90d.streamData;
    if (timeRange === 'all') return seriesAll.streamData;
    return series30d.streamData;
  }, [timeRange, series30d, series90d, seriesAll]);

  const activeNftData = useMemo(() => {
    if (timeRange === '90d') return series90d.nftSalesData;
    if (timeRange === 'all') return seriesAll.nftSalesData;
    return series30d.nftSalesData;
  }, [timeRange, series30d, series90d, seriesAll]);

  const topTracks = useMemo(() => {
    if (tracks.length > 0) {
      return tracks.slice(0, 5).map((t, i) => ({
        id: t.id,
        title: t.title,
        streams: t.playCount || 12000 - i * 1500,
        uniqueListeners: Math.floor((t.playCount || 12000) * 0.65),
        completionRate: 82 - i * 3,
        trend: parseFloat((14.2 - i * 2.1).toFixed(1)),
        coverUrl: t.coverUrl,
      }));
    }
    return [
      { id: '1', title: 'Midnight In TON', streams: 48500, uniqueListeners: 31000, completionRate: 88, trend: 15.4 },
      { id: '2', title: 'Symphony of Blocks', streams: 36200, uniqueListeners: 23500, completionRate: 82, trend: 12.1 },
      { id: '3', title: 'Telegram Wave', streams: 29400, uniqueListeners: 19000, completionRate: 79, trend: 9.8 },
      { id: '4', title: 'Decentralized Soul', streams: 18200, uniqueListeners: 11800, completionRate: 75, trend: 8.4 },
    ];
  }, [tracks]);

  const summary = useMemo(() => {
    const totalStreams = activeStreamData.reduce((acc, curr) => acc + curr.streams, 0);
    const nftVolumeTON = parseFloat(activeNftData.reduce((acc, curr) => acc + curr.volumeTON, 0).toFixed(2));
    return {
      totalStreams,
      streamGrowthPercent: 18.4,
      totalFollowers: 12400,
      followerGrowthPercent: 9.2,
      nftVolumeTON,
      nftVolumeGrowthPercent: 24.6,
      totalRoyaltiesTON: parseFloat((nftVolumeTON * 0.08).toFixed(2)),
      royaltiesGrowthPercent: 24.6,
      totalListeners: Math.floor(totalStreams * 0.65),
      listenersGrowthPercent: 14.1,
      topTrackTitle: topTracks[0]?.title || "Midnight In TON",
    };
  }, [activeStreamData, activeNftData, topTracks]);

  const value: ArtistAnalyticsContextType = {
    artistId,
    artistName,
    timeRange,
    setTimeRange,
    activeTab,
    setActiveTab,
    streamData: activeStreamData,
    dailyStreams30d: series30d.streamData,
    dailyStreams90d: series90d.streamData,
    dailyStreamsAll: seriesAll.streamData,
    nftSalesData: activeNftData,
    nftSales30d: series30d.nftSalesData,
    nftSales90d: series90d.nftSalesData,
    nftSalesAll: seriesAll.nftSalesData,
    followerData: series30d.followerData,
    topTracks,
    summary,
    isLoading,
    setArtistContextData,
    refreshAnalytics,
  };

  return (
    <ArtistAnalyticsContext.Provider value={value}>
      {children}
    </ArtistAnalyticsContext.Provider>
  );
};

export const useArtistAnalytics = (): ArtistAnalyticsContextType => {
  const context = useContext(ArtistAnalyticsContext);
  if (!context) {
    const fallbackSeries = Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      streams: Math.floor(1200 + Math.sin(i * 0.5) * 400 + (i * 25)),
      listeners: Math.floor(750 + Math.sin(i * 0.5) * 200),
      completionRate: 78,
      hasMilestone: i === 15,
      milestoneLabel: i === 15 ? '10k Streams Milestone!' : undefined,
    }));
    const fallbackNft = Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      volumeTON: parseFloat((15 + Math.sin(i * 0.4) * 8).toFixed(2)),
      salesCount: Math.floor(2 + Math.random() * 4),
      royaltiesTON: 1.5,
      floorPrice: 12.0,
      hasMilestone: i === 20,
      milestoneLabel: i === 20 ? '50 TON Volume Milestone!' : undefined,
    }));
    return {
      artistId: 'dj-krupy',
      artistName: 'DJ Krupy',
      timeRange: '30d',
      setTimeRange: () => {},
      activeTab: 'overview',
      setActiveTab: () => {},
      streamData: fallbackSeries,
      dailyStreams30d: fallbackSeries,
      dailyStreams90d: fallbackSeries,
      dailyStreamsAll: fallbackSeries,
      nftSalesData: fallbackNft,
      nftSales30d: fallbackNft,
      nftSales90d: fallbackNft,
      nftSalesAll: fallbackNft,
      followerData: [],
      topTracks: [],
      summary: defaultSummary,
      isLoading: false,
      setArtistContextData: () => {},
      refreshAnalytics: () => {},
    };
  }
  return context;
};
