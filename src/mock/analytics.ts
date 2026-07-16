// Analytical metrics and historical data arrays for charts and stats dashboards

export const mockStreamTrends = [
  { date: "Jul 10", streams: 45000, revenueTON: 22.4 },
  { date: "Jul 11", streams: 51200, revenueTON: 25.6 },
  { date: "Jul 12", streams: 48900, revenueTON: 24.1 },
  { date: "Jul 13", streams: 62000, revenueTON: 31.0 },
  { date: "Jul 14", streams: 75400, revenueTON: 37.7 },
  { date: "Jul 15", streams: 81200, revenueTON: 40.6 },
  { date: "Jul 16", streams: 95000, revenueTON: 47.5 }
];

export const mockGeoDemographics = [
  { country: "Nigeria", percentage: 48, listeners: 45600, color: "#FBBF24" },
  { country: "United Kingdom", percentage: 22, listeners: 20900, color: "#3B82F6" },
  { country: "United States", percentage: 18, listeners: 17100, color: "#10B981" },
  { country: "South Africa", percentage: 8, listeners: 7600, color: "#EC4899" },
  { country: "Others", percentage: 4, listeners: 3800, color: "#6B7280" }
];

export const mockRevenueBreakdown = [
  { source: "Streaming Royalties", amountTON: 154.5, percentage: 15 },
  { source: "Primary NFT Sales", amountTON: 580.0, percentage: 55 },
  { source: "Secondary Royalties", amountTON: 312.4, percentage: 30 }
];

export const mockEngagementMetrics = {
  averageListenTimeMins: 42.5,
  saveRatePercent: 84.2,
  repostRatePercent: 12.5,
  subscriberCount: 2450
};
