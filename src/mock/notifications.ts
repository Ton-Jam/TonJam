import { Notification, NotificationPreferences } from "../types";

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: "u1",
    type: "nft_sale",
    title: "NFT Royalty Received!",
    message: "You received 1.8 TON in royalties from the secondary sale of 'Solar Pulse #001'.",
    link: "/profile/earnings",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    metadata: {
      nftId: "n4",
      amountTON: 1.8
    }
  },
  {
    id: "notif-2",
    userId: "u1",
    type: "bid_update",
    title: "New Bid Placed!",
    message: "Sarah Jenkins (@sarahj) placed a bid of 125 TON on 'City Boys: African Giant Genesis #001'.",
    link: "/nft/n1",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(), // 2.5h ago
    metadata: {
      nftId: "n1",
      bidderName: "Sarah Jenkins",
      amountTON: 125
    }
  },
  {
    id: "notif-3",
    userId: "u1",
    type: "track_upload",
    title: "New Release from Wizkid",
    message: "Wizkid (@wizkid) just uploaded a new track 'Ginger (feat. Burna Boy)'. Listen now!",
    link: "/track/tr-2",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    id: "notif-4",
    userId: "u1",
    type: "general",
    title: "Staking Pool Reward Claimed",
    message: "Your pending staking rewards of 45.2 JAM have been successfully claimed.",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
  }
];

export const mockNotificationPreferences: NotificationPreferences = {
  userId: "u1",
  directAlerts: true,
  marketActivity: true,
  dropsAndReleases: true,
  socialSignals: true,
  bidAlerts: true,
  saleEvents: true,
  revenueThreshold: 0.1
};
