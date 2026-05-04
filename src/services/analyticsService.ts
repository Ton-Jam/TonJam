import { db } from "../lib/firebase";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";

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
