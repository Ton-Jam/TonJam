import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

/**
 * API Service for calling Firebase Cloud Functions
 * This acts as a bridge between the frontend and backend Firebase operations
 */

interface CallResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Generic function caller with error handling
 */
export const callCloudFunction = async <T = any>(
  functionName: string,
  data: any = {}
): Promise<CallResponse<T>> => {
  try {
    const callable = httpsCallable<any, any>(functions, functionName);
    const result = await callable(data);
    return {
      success: true,
      data: result.data,
    };
  } catch (error: any) {
    console.error(`[v0] Cloud Function ${functionName} error:`, error);
    return {
      success: false,
      error: error.message || 'An error occurred',
    };
  }
};

/**
 * User Management Functions
 */
export const userApi = {
  /**
   * Create or update user profile
   */
  saveUserProfile: async (userId: string, profile: any) => {
    return callCloudFunction('saveUserProfile', { userId, profile });
  },

  /**
   * Add follower relationship
   */
  followUser: async (followerId: string, followeeId: string) => {
    return callCloudFunction('followUser', { followerId, followeeId });
  },

  /**
   * Remove follower relationship
   */
  unfollowUser: async (followerId: string, followeeId: string) => {
    return callCloudFunction('unfollowUser', { followerId, followeeId });
  },

  /**
   * Get user followers count
   */
  getUserFollowers: async (userId: string) => {
    return callCloudFunction('getUserFollowers', { userId });
  },

  /**
   * Update user preferences
   */
  updateUserPreferences: async (userId: string, preferences: any) => {
    return callCloudFunction('updateUserPreferences', { userId, preferences });
  },

  /**
   * Batch update user stats
   */
  updateUserStats: async (userId: string, stats: any) => {
    return callCloudFunction('updateUserStats', { userId, stats });
  },
};

/**
 * File Upload Functions
 */
export const fileApi = {
  /**
   * Get signed URL for file upload
   */
  getUploadUrl: async (
    userId: string,
    fileName: string,
    fileType: string,
    folder: string = 'uploads'
  ) => {
    return callCloudFunction('getUploadUrl', {
      userId,
      fileName,
      fileType,
      folder,
    });
  },

  /**
   * Delete file from storage
   */
  deleteFile: async (userId: string, filePath: string) => {
    return callCloudFunction('deleteFile', { userId, filePath });
  },

  /**
   * Process uploaded file (e.g., create thumbnail)
   */
  processUploadedFile: async (userId: string, filePath: string, fileType: string) => {
    return callCloudFunction('processUploadedFile', {
      userId,
      filePath,
      fileType,
    });
  },
};

/**
 * Notification Functions
 */
export const notificationApi = {
  /**
   * Send notification to user
   */
  sendNotification: async (
    userId: string,
    title: string,
    message: string,
    type: string = 'info'
  ) => {
    return callCloudFunction('sendNotification', {
      userId,
      title,
      message,
      type,
    });
  },

  /**
   * Get user notifications
   */
  getUserNotifications: async (userId: string, limit: number = 20) => {
    return callCloudFunction('getUserNotifications', { userId, limit });
  },

  /**
   * Mark notification as read
   */
  markNotificationAsRead: async (notificationId: string) => {
    return callCloudFunction('markNotificationAsRead', { notificationId });
  },

  /**
   * Clear all notifications
   */
  clearAllNotifications: async (userId: string) => {
    return callCloudFunction('clearAllNotifications', { userId });
  },
};

/**
 * Activity Functions
 */
export const activityApi = {
  /**
   * Log user activity
   */
  logActivity: async (
    userId: string,
    activityType: string,
    data: any = {}
  ) => {
    return callCloudFunction('logActivity', {
      userId,
      activityType,
      data,
    });
  },

  /**
   * Get user activity feed
   */
  getActivityFeed: async (userId: string, limit: number = 20) => {
    return callCloudFunction('getActivityFeed', { userId, limit });
  },

  /**
   * Get activities from followed users
   */
  getFollowingActivityFeed: async (userId: string, limit: number = 20) => {
    return callCloudFunction('getFollowingActivityFeed', { userId, limit });
  },
};

/**
 * Analytics Functions
 */
export const analyticsApi = {
  /**
   * Track event
   */
  trackEvent: async (eventName: string, eventData: any = {}) => {
    return callCloudFunction('trackEvent', { eventName, eventData });
  },

  /**
   * Get user analytics
   */
  getUserAnalytics: async (userId: string, startDate?: string, endDate?: string) => {
    return callCloudFunction('getUserAnalytics', {
      userId,
      startDate,
      endDate,
    });
  },

  /**
   * Get platform analytics (admin only)
   */
  getPlatformAnalytics: async (startDate?: string, endDate?: string) => {
    return callCloudFunction('getPlatformAnalytics', {
      startDate,
      endDate,
    });
  },
};

/**
 * Admin Functions
 */
export const adminApi = {
  /**
   * Update user role (admin only)
   */
  updateUserRole: async (userId: string, role: string) => {
    return callCloudFunction('updateUserRole', { userId, role });
  },

  /**
   * Ban/suspend user (admin only)
   */
  banUser: async (userId: string, reason: string) => {
    return callCloudFunction('banUser', { userId, reason });
  },

  /**
   * Get admin dashboard data (admin only)
   */
  getAdminDashboard: async () => {
    return callCloudFunction('getAdminDashboard', {});
  },

  /**
   * Delete user account (admin only)
   */
  deleteUserAccount: async (userId: string) => {
    return callCloudFunction('deleteUserAccount', { userId });
  },
};
