import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { SongRequest } from '@/types';
import { TON_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { CheckCircle, XCircle, Play, Send, Loader2 } from 'lucide-react';

interface SongRequestsTabProps {
  artistId: string;
  isOwnProfile: boolean;
}

const SongRequestsTab: React.FC<SongRequestsTabProps> = ({ artistId, isOwnProfile }) => {
  const { addNotification, userProfile } = useAudio();
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRequest, setNewRequest] = useState({ title: '', description: '', tip: '1.0' });

  useEffect(() => {
    if (!artistId) return;
    const q = query(collection(db, 'songRequests'), where('artistId', '==', artistId));
    let isMounted = true;

    // Use setTimeout to avoid strict mode double mount rapid disconnects
    const timer = setTimeout(() => {
      if (!isMounted) return;
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SongRequest));
        // Sort by timestamp if available
        reqs.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        setRequests(reqs);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'songRequests');
        setLoading(false);
      });

      return () => unsubscribe();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [artistId]);

  const handleStatusChange = async (id: string, newStatus: SongRequest['status']) => {
    try {
      await updateDoc(doc(db, 'songRequests', id), { status: newStatus });
      addNotification(`Request marked as ${newStatus}`, 'success');
    } catch (error) {
      console.error("Error updating request status:", error);
      addNotification("Failed to update status", "error");
    }
  };

  const handleTip = async (id: string, amount: string | undefined) => {
    try {
      await updateDoc(doc(db, 'songRequests', id), { hasTipped: true });
      addNotification(`Tipped ${amount || '1.0'} TON to the artist!`, 'success');
    } catch (error) {
      console.error("Error updating tip status:", error);
      addNotification("Failed to send tip", "error");
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.title) {
      addNotification('Please enter a song title', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'songRequests'), {
        artistId,
        requesterId: userProfile.uid,
        requesterName: userProfile.name,
        songTitle: newRequest.title,
        description: newRequest.description,
        status: 'pending',
        tipAmount: newRequest.tip,
        createdAt: new Date().toISOString()
      });
      setNewRequest({ title: '', description: '', tip: '1.0' });
      addNotification('Song request submitted successfully!', 'success');
    } catch (error) {
      console.error("Failed to submit request:", error);
      addNotification("Failed to submit request.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-cyan-500" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {!isOwnProfile && (
        <div className="glass-card p-6 border border-white/5">
          <h3 className="text-lg font-black uppercase tracking-tighter mb-4 text-white">Request a Song</h3>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Song Title</label>
              <input 
                type="text" 
                value={newRequest.title}
                onChange={e => setNewRequest({...newRequest, title: e.target.value})}
                className="w-full glass-input"
                placeholder="e.g. Acoustic version of Neon Nights"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Description (Optional)</label>
              <textarea 
                value={newRequest.description}
                onChange={e => setNewRequest({...newRequest, description: e.target.value})}
                className="w-full glass-input min-h-[80px]"
                placeholder="Any specific details or shoutouts?"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Tip Amount (TON)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img src={TON_LOGO} alt="TON" className="w-4 h-4 opacity-50" />
                </div>
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  value={newRequest.tip}
                  onChange={e => setNewRequest({...newRequest, tip: e.target.value})}
                  className="w-full glass-input pl-10"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full glass-button bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Request
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-black uppercase tracking-tighter mb-4 text-white">
          {isOwnProfile ? 'Manage Song Requests' : 'Recent Requests'}
        </h3>
        
        {requests.length === 0 ? (
          <div className="text-center py-12 glass-card border border-white/5">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">No song requests yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map(request => (
              <div key={request.id} className="glass-card border border-white/5 p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white uppercase tracking-tight text-sm">{request.songTitle}</h4>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${
                      request.status === 'pending' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                      request.status === 'accepted' ? 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/30' :
                      request.status === 'fulfilled' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                      'bg-red-500/20 text-red-500 border border-red-500/30'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Requested by <span className="text-cyan-500">{request.requesterName}</span></p>
                  {request.description && (
                    <p className="text-xs text-white/60 mt-2 bg-white/5 p-2 rounded-md">{request.description}</p>
                  )}
                </div>
                
                <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                  {request.tipAmount && parseFloat(request.tipAmount) > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                      <img src={TON_LOGO} alt="TON" className="w-3 h-3" />
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{request.tipAmount} TON Tip</span>
                    </div>
                  )}
                  
                  {isOwnProfile && request.status === 'pending' && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleStatusChange(request.id, 'accepted')}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-500 hover:bg-cyan-500 hover:text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Accept
                      </button>
                      <button 
                        onClick={() => handleStatusChange(request.id, 'rejected')}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}
                  
                  {isOwnProfile && request.status === 'accepted' && (
                    <button 
                      onClick={() => handleStatusChange(request.id, 'fulfilled')}
                      className="w-full sm:w-auto px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-500 hover:bg-green-500 hover:text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-3 h-3" /> Mark Fulfilled
                    </button>
                  )}

                  {!isOwnProfile && request.status === 'fulfilled' && request.requesterId === userProfile.uid && !request.hasTipped && (
                    <button 
                      onClick={() => handleTip(request.id, request.tipAmount)}
                      className="w-full sm:w-auto px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <img src={TON_LOGO} alt="TON" className="w-3 h-3" /> Send Tip
                    </button>
                  )}
                  
                  {request.hasTipped && (
                    <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-500 px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Tipped</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongRequestsTab;
