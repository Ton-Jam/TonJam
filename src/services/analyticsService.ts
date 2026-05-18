import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy, Timestamp, addDoc, serverTimestamp } from "firebase/firestore";

export interface MonthlyRevenue {
  month: string;
  streaming: number;
  nft: number;
}

export interface ArtifactPerformance {
  name: string;
  streams: number;
  sales: number;
}

export const getArtistRevenueBreakdown = async (artistId: string): Promise<MonthlyRevenue[]> => {
  try {
    const txSnap = await getDocs(
      query(
        collection(db, "transactions"),
        where("participants", "array-contains", artistId),
        orderBy("timestamp", "desc")
      )
    );

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthlyData: Record<string, MonthlyRevenue> = {};

    txSnap.forEach(doc => {
      const data = doc.data();
      const date = new Date(data.timestamp);
      const monthName = months[date.getMonth()];
      
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = { month: monthName, streaming: 0, nft: 0 };
      }

      if (data.type === 'stream') {
        monthlyData[monthName].streaming += data.artistShare || 0;
      } else if (data.type === 'nft_sale' || data.type === 'jam_purchase') {
        monthlyData[monthName].nft += data.artistShare || 0;
      }
    });

    // Return last 6 months in order
    const currentMonth = new Date().getMonth();
    const result: MonthlyRevenue[] = [];
    for (let i = 5; i >= 0; i--) {
      const mIdx = (currentMonth - i + 12) % 12;
      const mName = months[mIdx];
      result.push(monthlyData[mName] || { month: mName, streaming: 0, nft: 0 });
    }

    return result;
  } catch (error) {
    console.error("Error fetching revenue breakdown:", error);
    return [];
  }
};

export const getArtifactPerformance = async (artistId: string): Promise<ArtifactPerformance[]> => {
  try {
    const tracksSnap = await getDocs(
      query(collection(db, "tracks"), where("artistId", "==", artistId))
    );

    const performance: ArtifactPerformance[] = [];

    for (const trackDoc of tracksSnap.docs) {
      const track = trackDoc.data();
      
      // Get sales count from transactions
      const salesSnap = await getDocs(
        query(
          collection(db, "transactions"),
          where("trackId", "==", trackDoc.id),
          where("type", "in", ["nft_sale", "jam_purchase"])
        )
      );

      performance.push({
        name: track.title,
        streams: track.playCount || 0,
        sales: salesSnap.size
      });
    }

    return performance.sort((a, b) => b.streams - a.streams).slice(0, 5);
  } catch (error) {
    console.error("Error fetching artifact performance:", error);
    return [];
  }
};

// ============================================
// ENHANCED ANALYTICS FUNCTIONS
// ============================================

export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventName: string;
  eventCategory?: string;
  eventValue?: number;
  eventLabel?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  userAgent?: string;
}

/**
 * Track a custom analytics event
 */
export const trackEvent = async (
  userId: string,
  eventName: string,
  eventData?: {
    category?: string;
    value?: number;
    label?: string;
    metadata?: Record<string, any>;
  }
): Promise<string | null> => {
  try {
    const analyticsRef = collection(db, "analytics/events");

    const event: Omit<AnalyticsEvent, 'id'> = {
      userId,
      eventName,
      eventCategory: eventData?.category,
      eventValue: eventData?.value,
      eventLabel: eventData?.label,
      metadata: eventData?.metadata || {},
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };

    const docRef = await addDoc(analyticsRef, {
      ...event,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("[v0] Error tracking event:", error);
    handleFirestoreError(error, OperationType.CREATE, "analytics/events");
    return null;
  }
};

/**
 * Track page view
 */
export const trackPageView = async (userId: string, pageName: string, pageUrl?: string) => {
  return trackEvent(userId, "page_view", {
    category: "engagement",
    label: pageName,
    metadata: { url: pageUrl },
  });
};

/**
 * Track click event
 */
export const trackClick = async (
  userId: string,
  elementName: string,
  elementType?: string
) => {
  return trackEvent(userId, "click", {
    category: "engagement",
    label: elementName,
    metadata: { elementType },
  });
};

/**
 * Track user action (follow, like, comment, etc)
 */
export const trackUserAction = async (
  userId: string,
  actionType: "follow" | "unfollow" | "like" | "unlike" | "comment" | "share",
  targetId?: string,
  targetType?: string
) => {
  return trackEvent(userId, `user_${actionType}`, {
    category: "user_interaction",
    metadata: { targetId, targetType },
  });
};

/**
 * Track purchase event
 */
export const trackPurchase = async (
  userId: string,
  purchaseType: "nft" | "track" | "subscription",
  amount: number,
  currency: string = "USD",
  itemId?: string
) => {
  return trackEvent(userId, "purchase", {
    category: "commerce",
    value: amount,
    label: purchaseType,
    metadata: { currency, itemId, timestamp: new Date().toISOString() },
  });
};

/**
 * Track earnings
 */
export const trackEarnings = async (
  userId: string,
  earningType: "streaming" | "nft_sale" | "purchase" | "tip",
  amount: number,
  currency: string = "USD"
) => {
  return trackEvent(userId, `earnings_${earningType}`, {
    category: "revenue",
    value: amount,
    metadata: { currency, timestamp: new Date().toISOString() },
  });
};

/**
 * Get user analytics for a date range
 */
export const getUserAnalytics = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{ totalEvents: number; totalViews: number; totalClicks: number; totalPurchases: number; totalEarnings: number } | null> => {
  try {
    const analyticsRef = collection(db, "analytics/events");
    let q = query(analyticsRef, where("userId", "==", userId));

    if (startDate && endDate) {
      q = query(
        analyticsRef,
        where("userId", "==", userId),
        where("createdAt", ">=", Timestamp.fromDate(startDate)),
        where("createdAt", "<=", Timestamp.fromDate(endDate))
      );
    }

    const snapshot = await getDocs(q);
    let totalViews = 0;
    let totalClicks = 0;
    let totalPurchases = 0;
    let totalEarnings = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (data.eventName === "page_view") totalViews++;
      if (data.eventName === "click") totalClicks++;
      if (data.eventName === "purchase") {
        totalPurchases++;
        totalEarnings += data.eventValue || 0;
      }
      if (data.eventName.includes("earnings")) {
        totalEarnings += data.eventValue || 0;
      }
    });

    return {
      totalEvents: snapshot.size,
      totalViews,
      totalClicks,
      totalPurchases,
      totalEarnings,
    };
  } catch (error) {
    console.error("[v0] Error getting user analytics:", error);
    handleFirestoreError(error, OperationType.LIST, "analytics/events");
    return null;
  }
};

/**
 * Session tracking utilities
 */
export const sessionUtils = {
  startSession: async (userId: string) => {
    return trackEvent(userId, "session_start", {
      category: "session",
      metadata: {
        sessionStartTime: new Date().toISOString(),
      },
    });
  },

  endSession: async (userId: string, sessionDuration: number) => {
    return trackEvent(userId, "session_end", {
      category: "session",
      value: sessionDuration,
      metadata: {
        sessionEndTime: new Date().toISOString(),
      },
    });
  },

  recordTimeOnPage: async (userId: string, pageName: string, timeSpent: number) => {
    return trackEvent(userId, "time_on_page", {
      category: "engagement",
      value: timeSpent,
      label: pageName,
      metadata: { pageName },
    });
  },
};
