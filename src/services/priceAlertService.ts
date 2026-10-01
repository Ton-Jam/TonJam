import { PriceAlert, NFTItem } from '@/types';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { notificationService } from './notificationService';

const STORAGE_KEY = 'tonjam_price_alerts';

export const priceAlertService = {
  /**
   * Retrieves all price alerts for a given user from localStorage
   */
  getAlerts: (userId: string): PriceAlert[] => {
    try {
      const userKey = `${STORAGE_KEY}_${userId}`;
      const data = localStorage.getItem(userKey);
      if (data) return JSON.parse(data);

      // Fallback to legacy global key if user-specific key is not populated yet
      const globalData = localStorage.getItem(STORAGE_KEY);
      if (globalData) {
        const parsed: PriceAlert[] = JSON.parse(globalData);
        return parsed.filter(a => !a.userId || a.userId === userId || userId === 'guest_user');
      }
      return [];
    } catch (err) {
      console.warn('[priceAlertService] Error reading alerts from localStorage:', err);
      return [];
    }
  },

  /**
   * Retrieves an existing active alert for a specific NFT
   */
  getAlertForNFT: (userId: string, nftId: string): PriceAlert | undefined => {
    const alerts = priceAlertService.getAlerts(userId);
    return alerts.find(a => a.nftId === nftId && a.status === 'active');
  },

  /**
   * Persists an alert both locally and into Firestore
   */
  saveAlert: async (alert: PriceAlert): Promise<PriceAlert> => {
    const userId = alert.userId || 'guest_user';
    const alerts = priceAlertService.getAlerts(userId);
    const existingIndex = alerts.findIndex(a => a.id === alert.id || (a.nftId === alert.nftId && a.status === 'active'));

    let updatedAlerts: PriceAlert[];
    if (existingIndex >= 0) {
      updatedAlerts = [...alerts];
      updatedAlerts[existingIndex] = { ...updatedAlerts[existingIndex], ...alert };
    } else {
      updatedAlerts = [alert, ...alerts];
    }

    // Update user-scoped and global local caches
    try {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updatedAlerts));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAlerts));
    } catch (e) {
      console.warn('[priceAlertService] Error saving to localStorage:', e);
    }

    // Persist to Firestore if authenticated user
    if (userId && userId !== 'guest' && userId !== 'guest_user') {
      try {
        const alertRef = doc(db, 'users', userId, 'priceAlerts', alert.id);
        await setDoc(alertRef, alert, { merge: true });
      } catch (err) {
        console.warn('[priceAlertService] Firestore write failed:', err);
      }
    }

    return alert;
  },

  /**
   * Deletes a price alert
   */
  deleteAlert: async (userId: string, alertId: string): Promise<void> => {
    const alerts = priceAlertService.getAlerts(userId);
    const filtered = alerts.filter(a => a.id !== alertId);

    try {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(filtered));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('[priceAlertService] Error updating localStorage on delete:', e);
    }

    if (userId && userId !== 'guest' && userId !== 'guest_user') {
      try {
        const alertRef = doc(db, 'users', userId, 'priceAlerts', alertId);
        await deleteDoc(alertRef);
      } catch (err) {
        console.warn('[priceAlertService] Firestore delete failed:', err);
      }
    }
  },

  /**
   * Evaluates price drops for an NFT and triggers notifications for all matching subscriptions
   */
  checkAndTriggerPriceAlerts: async (
    nftId: string, 
    newPrice: number, 
    nftData?: Partial<NFTItem>
  ): Promise<PriceAlert[]> => {
    // Read all known alerts across storage keys
    const allAlerts: PriceAlert[] = [];
    try {
      const globalStr = localStorage.getItem(STORAGE_KEY);
      if (globalStr) {
        allAlerts.push(...JSON.parse(globalStr));
      }
    } catch (e) {}

    const matchingAlerts = allAlerts.filter(a => a.nftId === nftId && a.status === 'active');
    const triggered: PriceAlert[] = [];

    for (const alert of matchingAlerts) {
      const targetNum = parseFloat(alert.targetPrice);
      if (isNaN(targetNum)) continue;

      let isHit = false;
      if (alert.condition === 'below' && newPrice <= targetNum) {
        isHit = true;
      } else if (alert.condition === 'above' && newPrice >= targetNum) {
        isHit = true;
      }

      if (isHit) {
        triggered.push(alert);
        
        // Mark alert triggered in state
        alert.status = 'triggered';
        await priceAlertService.saveAlert(alert);

        // Send update through unified notification architecture
        const nftTitle = nftData?.title || alert.nftTitle || 'Music NFT';
        const coverUrl = nftData?.imageUrl || nftData?.coverUrl || alert.nftImageUrl;

        notificationService.addNotification(alert.userId, {
          userId: alert.userId,
          type: 'price_drop',
          title: `PRICE DROP ALERT: ${nftTitle}`,
          message: `Floor price for "${nftTitle}" dropped to ${newPrice} TON (Your target: ${targetNum} TON). Tap to buy before it sells out!`,
          link: `/nft/${alert.nftId}`,
          metadata: {
            nftId: alert.nftId,
            targetPrice: targetNum,
            price: newPrice,
            thumbnailUrl: coverUrl,
            coverUrl: coverUrl,
            type: 'price_alert_triggered'
          }
        });
      }
    }

    return triggered;
  }
};
