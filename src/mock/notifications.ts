import { Notification, NotificationPreferences } from "../types";

export const mockNotifications: Notification[] = [];

export const mockNotificationPreferences: NotificationPreferences = {
  userId: "",
  directAlerts: true,
  marketActivity: true,
  dropsAndReleases: true,
  socialSignals: true,
  bidAlerts: true,
  saleEvents: true,
  revenueThreshold: 0.1
};
