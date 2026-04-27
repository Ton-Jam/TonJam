import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  increment, 
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { TreasuryStats, GrantAllocation, Transaction } from '../types';

class TreasuryService {
  private treasuryDocPath = 'system/treasury';
  private allocationsCollection = 'grantAllocations';

  async getTreasuryStats(): Promise<TreasuryStats | null> {
    try {
      const docRef = doc(db, this.treasuryDocPath);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as TreasuryStats;
      }
      return null;
    } catch (error) {
      console.error('Error fetching treasury stats:', error);
      return null;
    }
  }

  subscribeToStats(callback: (stats: TreasuryStats) => void) {
    const docRef = doc(db, this.treasuryDocPath);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as TreasuryStats);
      }
    });
  }

  async recordInflow(amount: number, source: string, txId?: string) {
    try {
      const treasuryRef = doc(db, this.treasuryDocPath);
      
      // Ensure the document exists
      const docSnap = await getDoc(treasuryRef);
      if (!docSnap.exists()) {
        await setDoc(treasuryRef, {
          balance: amount,
          totalFeesCollected: amount,
          totalGrantsAllocated: 0,
          updatedAt: new Date().toISOString()
        });
      } else {
        await updateDoc(treasuryRef, {
          balance: increment(amount),
          totalFeesCollected: increment(amount),
          updatedAt: new Date().toISOString()
        });
      }

      // Record a special treasury transaction
      await addDoc(collection(db, 'transactions'), {
        type: 'platform_fee',
        amount: amount,
        platformFee: 0, // Fee itself has no fee
        artistShare: 0,
        recipientAddress: 'TreasuryDAO',
        senderAddress: source,
        timestamp: new Date().toISOString(),
        status: 'completed',
        txHash: txId || `fee-${Date.now()}`
      });

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, this.treasuryDocPath);
    }
  }

  async allocateGrant(proposalId: string, recipientId: string, recipientName: string, amount: number, category: GrantAllocation['category']) {
    try {
      const stats = await this.getTreasuryStats();
      if (!stats || stats.balance < amount) {
        throw new Error('Insufficient treasury funds');
      }

      const treasuryRef = doc(db, this.treasuryDocPath);
      
      // Update treasury stats
      await updateDoc(treasuryRef, {
        balance: increment(-amount),
        totalGrantsAllocated: increment(amount),
        updatedAt: new Date().toISOString()
      });

      // Create allocation record
      const allocation: GrantAllocation = {
        id: `grant-${Date.now()}`,
        proposalId,
        recipientId,
        recipientName,
        amount,
        category,
        status: 'distributed',
        timestamp: new Date().toISOString()
      };

      await addDoc(collection(db, this.allocationsCollection), allocation);

      // Record transaction
      await addDoc(collection(db, 'transactions'), {
        type: 'withdrawal', // Treasury withdrawal
        amount: amount,
        platformFee: 0,
        artistShare: amount,
        recipientAddress: recipientId,
        senderAddress: 'TreasuryDAO',
        timestamp: new Date().toISOString(),
        status: 'completed',
        txId: `grant-${proposalId}`
      } as Partial<Transaction>);

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, this.treasuryDocPath);
    }
  }

  getRecentAllocations(callback: (allocations: GrantAllocation[]) => void) {
    const q = query(
      collection(db, this.allocationsCollection),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    return onSnapshot(q, (snapshot) => {
      const allocations = snapshot.docs.map(doc => ({ ...doc.data() } as GrantAllocation));
      callback(allocations);
    });
  }
}

export const treasuryService = new TreasuryService();
