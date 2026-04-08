import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAudio } from '@/context/AudioContext';
import { SongRequest } from '@/types';
import { Loader2, Check, X, Gift } from 'lucide-react';

interface SongRequestsProps {
  artistId: string;
}

const SongRequests: React.FC<SongRequestsProps> = ({ artistId }) => {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useAudio();

  useEffect(() => {
    const q = query(collection(db, 'songRequests'), where('artistId', '==', artistId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SongRequest));
      setRequests(reqs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching requests:", error);
      addNotification("Failed to fetch song requests.", "error");
      setLoading(false);
    });
    return () => unsubscribe();
  }, [artistId, addNotification]);

  const updateRequestStatus = async (requestId: string, status: 'accepted' | 'fulfilled' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'songRequests', requestId), { status });
      addNotification(`Request ${status}!`, "success");
    } catch (error) {
      console.error("Error updating request:", error);
      addNotification("Failed to update request.", "error");
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Song Requests</h3>
      {requests.length === 0 ? (
        <p className="text-muted-foreground">No requests yet.</p>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white/5 p-4 rounded-lg border border-white/10 flex justify-between items-center">
              <div>
                <p className="font-bold">{req.songTitle}</p>
                <p className="text-sm text-muted-foreground">From: {req.requesterName}</p>
                <p className="text-xs text-blue-400">Status: {req.status}</p>
                {req.tipAmount && <p className="text-xs text-amber-500 flex items-center gap-1"><Gift className="h-3 w-3"/> Tip: {req.tipAmount} TON</p>}
              </div>
              <div className="flex gap-2">
                {req.status === 'pending' && (
                  <>
                    <button onClick={() => updateRequestStatus(req.id, 'accepted')} className="p-2 bg-green-500/20 text-green-500 rounded"><Check className="h-4 w-4"/></button>
                    <button onClick={() => updateRequestStatus(req.id, 'rejected')} className="p-2 bg-red-500/20 text-red-500 rounded"><X className="h-4 w-4"/></button>
                  </>
                )}
                {req.status === 'accepted' && (
                  <button onClick={() => updateRequestStatus(req.id, 'fulfilled')} className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded text-xs">Mark Fulfilled</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SongRequests;
