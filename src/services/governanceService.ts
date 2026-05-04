import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  increment, 
  arrayUnion, 
  onSnapshot,
  Timestamp,
  serverTimestamp,
  limit,
  getDoc,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Proposal, Vote } from '@/types';

import { treasuryService } from './treasuryService';

class GovernanceService {
  private proposalsCollection = 'proposals';
  private votesCollection = (proposalId: string) => `proposals/${proposalId}/votes`;

  async executeTreasuryProposal(proposalId: string, recipientId: string, recipientName: string, amount: number, category: any): Promise<void> {
    if (!auth.currentUser) throw new Error('Must be logged in');

    try {
      // We perform the treasury allocation FIRST. 
      // If it fails, the proposal status remains 'active/passed' (not executed), 
      // allowing for retries.
      await treasuryService.allocateGrant(proposalId, recipientId, recipientName, amount, category);

      // Only after successful distribution do we mark the proposal as executed
      const proposalRef = doc(db, this.proposalsCollection, proposalId);
      await updateDoc(proposalRef, { 
        status: 'executed',
        executedAt: serverTimestamp(),
        executedBy: auth.currentUser.uid
      });
    } catch (error) {
      console.error("Failed to execute treasury proposal:", error);
      throw error;
    }
  }

  async createProposal(proposalData: Partial<Proposal>): Promise<string> {
    if (!auth.currentUser) throw new Error('Must be logged in');

    const proposal = {
      ...proposalData,
      creatorId: auth.currentUser.uid,
      creatorName: auth.currentUser.displayName || 'Anonymous',
      status: 'active',
      forVotes: 0,
      againstVotes: 0,
      voters: [],
      createdAt: new Date().toISOString(),
      startTime: new Date().toISOString(),
      // Default end time to 7 days from now
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const docRef = await addDoc(collection(db, this.proposalsCollection), proposal);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  }

  async castVote(proposalId: string, choice: 'for' | 'against'): Promise<void> {
    if (!auth.currentUser) throw new Error('Must be logged in');

    const userId = auth.currentUser.uid;
    const voteId = `${proposalId}_${userId}`;
    const voteRef = doc(db, this.proposalsCollection, proposalId, 'votes', userId);

    // Check if already voted
    const voteDoc = await getDoc(voteRef);
    if (voteDoc.exists()) throw new Error('Already voted');

    const batch = writeBatch(db);

    // Create vote document
    const vote: Vote = {
      id: userId,
      proposalId,
      userId,
      choice,
      power: 1, // Future: base on tokens/NFTs
      createdAt: new Date().toISOString()
    };
    batch.set(voteRef, vote);

    // Update proposal counts and voters list
    const proposalRef = doc(db, this.proposalsCollection, proposalId);
    batch.update(proposalRef, {
      [choice === 'for' ? 'forVotes' : 'againstVotes']: increment(1),
      voters: arrayUnion(userId)
    });

    await batch.commit();
  }

  getProposals(callback: (proposals: Proposal[]) => void) {
    const q = query(
      collection(db, this.proposalsCollection),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const proposals = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Proposal));
      callback(proposals);
    });
  }

  async getProposal(id: string): Promise<Proposal | null> {
    const docRef = doc(db, this.proposalsCollection, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Proposal;
    }
    return null;
  }

  getUserVote(proposalId: string, callback: (vote: Vote | null) => void) {
    if (!auth.currentUser) {
      callback(null);
      return () => {};
    }

    const voteRef = doc(db, this.proposalsCollection, proposalId, 'votes', auth.currentUser.uid);
    return onSnapshot(voteRef, (doc) => {
      if (doc.exists()) {
        callback({ ...doc.data(), id: doc.id } as Vote);
      } else {
        callback(null);
      }
    });
  }
}

export const governanceService = new GovernanceService();
