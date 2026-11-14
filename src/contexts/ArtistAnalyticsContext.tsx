import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Track, NFTItem, Transaction } from '@/types';
import { useAudio } from '@/contexts/AudioContext';

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

const ZERO_SUMMARY: AnalyticsSummary = {
  totalStreams: 0,
  streamGrowthPercent: 0,
  totalFollowers: 0,
  followerGrowthPercent: 0,
  nftVolumeTON: 0,
  nftVolumeGrowthPercent: 0,
  totalRoyaltiesTON: 0,
  royaltiesGrowthPercent: 0,
  totalListeners: 0,
  listenersGrowthPercent: 0,
  topTrackTitle: 'No tracks yet',
};

const ArtistAnalyticsContext = createContext<ArtistAnalyticsContextType | null>(null);

function buildRealSeriesForRange(
  rangeKey: TimeRange,
  tracks: Track[],
  nfts: NFTItem[],
  transactions: Transaction[],
  artistFollowers: number
) {
  const now = new Date();
  let bucketCount = 30;
  let bucketMs = 24 * 60 * 60 * 1000;
  if (rangeKey === '90d') {
    bucketCount = 12;
    bucketMs = 7 * 24 * 60 * 60 * 1000;
  } else if (rangeKey === 'all') {
    bucketCount = 12;
    bucketMs = 30 * 24 * 60 * 60 * 1000;
  }

  const streamData: StreamMetricPoint[] = [];
  const nftSalesData: NFTSalesMetricPoint[] = [];
  const followerData: FollowerMetricPoint[] = [];

  const trackIds = new Set(tracks.map((t) => t.id));
  const nftIds = new Set(nfts.map((n) => n.id));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const totalPlayCount = tracks.reduce((acc, t) => acc + Number(t.playCount || t.streams || 0), 0);
  const floorPrices = nfts
    .map((n) => parseFloat(String(n.price || '0')) || 0)
    .filter((p) => p > 0);
  const minFloor = floorPrices.length > 0 ? Math.min(...floorPrices) : 0;

  for (let i = 0; i < bucketCount; i++) {
    const bucketEnd = now.getTime() - (bucketCount - 1 - i) * bucketMs;
    const bucketStart = bucketEnd - bucketMs;

    let label = `Day ${i + 1}`;
    if (rangeKey === '90d') label = `W${i + 1}`;
    else if (rangeKey === 'all') {
      const d = new Date(bucketEnd);
      label = months[d.getMonth()];
    }

    const bucketTxs = transactions.filter((tx) => {
      const ts = tx.timestamp ? new Date(tx.timestamp).getTime() : 0;
      return ts >= bucketStart && ts <= bucketEnd;
    });

    const streamTxs = bucketTxs.filter(
      (tx) => tx.type === 'stream' && (!tx.trackId || trackIds.has(tx.trackId))
    );
    const nftTxs = bucketTxs.filter(
      (tx) =>
        (tx.type === 'nft_sale' || tx.type === 'nft_purchase') &&
        (!tx.nftId || nftIds.has(tx.nftId))
    );

    const bucketStreams =
      streamTxs.length > 0
        ? streamTxs.length
        : i === bucketCount - 1 && totalPlayCount > 0 && transactions.length === 0
          ? totalPlayCount
          : 0;

    const vol = parseFloat(
      nftTxs.reduce((acc, tx) => acc + Number(tx.amount || 0), 0).toFixed(2)
    );
    const royalties = parseFloat(
      nftTxs.reduce((acc, tx) => acc + Number(tx.artistShare || 0), 0).toFixed(2)
    );

    streamData.push({
      date: label,
      streams: bucketStreams,
      listeners: bucketStreams,
      completionRate: bucketStreams > 0 ? 100 : 0,
    });

    nftSalesData.push({
      date: label,
      volumeTON: vol,
      salesCount: nftTxs.length,
      royaltiesTON: royalties,
      floorPrice: minFloor,
    });

    followerData.push({
      date: label,
      followers: artistFollowers,
      netGain: 0,
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
  const { allTracks, allNFTs, transactions, artists, userProfile } = useAudio();
  const [artistId, setArtistId] = useState<string | null>(initialArtistId || null);
  const [artistName, setArtistName] = useState<string | null>(initialArtistName || null);
  const [explicitTracks, setExplicitTracks] = useState<Track[] | null>(initialTracks || null);
  const [explicitNfts, setExplicitNfts] = useState<NFTItem[] | null>(initialNfts || null);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [activeTab, setActiveTab] = useState<AnalyticsMetricTab>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const effectiveArtistId = artistId || userProfile?.uid || null;
  const effectiveArtistName = artistName || userProfile?.name || null;

  const tracks = useMemo(() => {
    if (explicitTracks) return explicitTracks;
    if (!effectiveArtistId) return [];
    return allTracks.filter(
      (t) =>
        t.artistId === effectiveArtistId ||
        (effectiveArtistName && t.artist?.toLowerCase() === effectiveArtistName.toLowerCase())
    );
  }, [explicitTracks, allTracks, effectiveArtistId, effectiveArtistName]);

  const nfts = useMemo(() => {
    if (explicitNfts) return explicitNfts;
    if (!effectiveArtistId) return [];
    return allNFTs.filter(
      (n) =>
        n.artistId === effectiveArtistId ||
        (effectiveArtistName &&
          (n.artist?.toLowerCase() === effectiveArtistName.toLowerCase() ||
            n.creator?.toLowerCase() === effectiveArtistName.toLowerCase()))
    );
  }, [explicitNfts, allNFTs, effectiveArtistId, effectiveArtistName]);

  const artistFollowers = useMemo(() => {
    const matched = artists.find((a) => a.uid === effectiveArtistId);
    return Number(matched?.followers ?? userProfile?.followers ?? 0);
  }, [artists, effectiveArtistId, userProfile?.followers]);

  const setArtistContextData = useCallback(
    (data: {
      artistId?: string;
      artistName?: string;
      tracks?: Track[];
      nfts?: NFTItem[];
    }) => {
      if (data.artistId !== undefined) setArtistId(data.artistId);
      if (data.artistName !== undefined) setArtistName(data.artistName);
      if (data.tracks !== undefined) setExplicitTracks(data.tracks);
      if (data.nfts !== undefined) setExplicitNfts(data.nfts);
    },
    []
  );

  const refreshAnalytics = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 150);
  }, []);

  const series30d = useMemo(
    () => buildRealSeriesForRange('30d', tracks, nfts, transactions, artistFollowers),
    [tracks, nfts, transactions, artistFollowers]
  );
  const series90d = useMemo(
    () => buildRealSeriesForRange('90d', tracks, nfts, transactions, artistFollowers),
    [tracks, nfts, transactions, artistFollowers]
  );
  const seriesAll = useMemo(
    () => buildRealSeriesForRange('all', tracks, nfts, transactions, artistFollowers),
    [tracks, nfts, transactions, artistFollowers]
  );

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

  const topTracks = useMemo<TopTrackAnalytics[]>(() => {
    return [...tracks]
      .sort((a, b) => Number(b.playCount || b.streams || 0) - Number(a.playCount || a.streams || 0))
      .slice(0, 5)
      .map((t) => {
        const plays = Number(t.playCount || t.streams || 0);
        return {
          id: t.id,
          title: t.title,
          streams: plays,
          uniqueListeners: plays,
          completionRate: plays > 0 ? 100 : 0,
          trend: 0,
          coverUrl: t.coverUrl,
        };
      });
  }, [tracks]);

  const summary = useMemo<AnalyticsSummary>(() => {
    const trackStreams = tracks.reduce((acc, t) => acc + Number(t.playCount || t.streams || 0), 0);
    const nftSalesTxs = transactions.filter(
      (tx) => tx.type === 'nft_sale' || tx.type === 'nft_purchase'
    );
    const nftVolumeTON = parseFloat(
      nftSalesTxs.reduce((acc, tx) => acc + Number(tx.amount || 0), 0).toFixed(2)
    );
    const totalRoyaltiesTON = parseFloat(
      nftSalesTxs.reduce((acc, tx) => acc + Number(tx.artistShare || 0), 0).toFixed(2)
    );

    return {
      totalStreams: trackStreams,
      streamGrowthPercent: 0,
      totalFollowers: artistFollowers,
      followerGrowthPercent: 0,
      nftVolumeTON,
      nftVolumeGrowthPercent: 0,
      totalRoyaltiesTON,
      royaltiesGrowthPercent: 0,
      totalListeners: trackStreams,
      listenersGrowthPercent: 0,
      topTrackTitle: topTracks[0]?.title || 'No tracks yet',
    };
  }, [tracks, transactions, artistFollowers, topTracks]);

  const value: ArtistAnalyticsContextType = {
    artistId: effectiveArtistId,
    artistName: effectiveArtistName,
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
    return {
      artistId: null,
      artistName: null,
      timeRange: '30d',
      setTimeRange: () => {},
      activeTab: 'overview',
      setActiveTab: () => {},
      streamData: [],
      dailyStreams30d: [],
      dailyStreams90d: [],
      dailyStreamsAll: [],
      nftSalesData: [],
      nftSales30d: [],
      nftSales90d: [],
      nftSalesAll: [],
      followerData: [],
      topTracks: [],
      summary: ZERO_SUMMARY,
      isLoading: false,
      setArtistContextData: () => {},
      refreshAnalytics: () => {},
    };
  }
  return context;
};
