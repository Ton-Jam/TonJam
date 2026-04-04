import React, { useState } from 'react';
import { SongRequest } from '@/types';
import { MOCK_SONG_REQUESTS, TON_LOGO } from '@/constants';
import { useAudio } from '@/context/AudioContext';
import { CheckCircle, XCircle, Play, Send, Loader2 } from 'lucide-react';

interface SongRequestsTabProps {
  artistId: string;
  isOwnProfile: boolean;
}

const SongRequestsTab: React.FC<SongRequestsTabProps> = ({ artistId, isOwnProfile }) => {
  const { addNotification, userProfile } = useAudio();
  const [requests, setRequests] = useState<SongRequest[]>(
    MOCK_SONG_REQUESTS.filter(r => r.artistId === artistId)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRequest, setNewRequest] = useState({ title: '', description: '', tip: '1.0' });

  const handleStatusChange = (id: string, newStatus: SongRequest['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    addNotification(`Request marked as ${newStatus}`, 'success');
  };

  const handleTip = (id: string, amount: string | undefined) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, hasTipped: true } : r));
    addNotification(`Tipped ${amount || '1.0'} TON to the artist!`, 'success');
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.title) {
      addNotification('Please enter a song title', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const request: SongRequest = {
        id: `req_${Date.now()}`,
        artistId,
        requesterId: userProfile.uid,
        requesterName: userProfile.name,
        songTitle: newRequest.title,
        description: newRequest.description,
        status: 'pending',
        tipAmount: newRequest.tip,
        createdAt: new Date().toISOString()
      };
      
      setRequests([request, ...requests]);
      setNewRequest({ title: '', description: '', tip: '1.0' });
      setIsSubmitting(false);
      addNotification('Song request submitted successfully!', 'success');
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {!isOwnProfile && (
        <div className="bg-card border border-border rounded-[12px] p-6">
          <h3 className="text-lg font-bold uppercase tracking-tighter mb-4">Request a Song</h3>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Song Title</label>
              <input 
                type="text" 
                value={newRequest.title}
                onChange={e => setNewRequest({...newRequest, title: e.target.value})}
                className="w-full bg-background border border-border rounded-[8px] px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g. Acoustic version of Neon Nights"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Description (Optional)</label>
              <textarea 
                value={newRequest.description}
                onChange={e => setNewRequest({...newRequest, description: e.target.value})}
                className="w-full bg-background border border-border rounded-[8px] px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors min-h-[80px]"
                placeholder="Any specific details or shoutouts?"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Tip Amount (TON)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img src={TON_LOGO} alt="TON" className="w-4 h-4" />
                </div>
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  value={newRequest.tip}
                  onChange={e => setNewRequest({...newRequest, tip: e.target.value})}
                  className="w-full bg-background border border-border rounded-[8px] pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary text-primary-foreground font-bold uppercase tracking-widest rounded-[8px] hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Request
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold uppercase tracking-tighter mb-4">
          {isOwnProfile ? 'Your Requests' : 'Recent Requests'}
        </h3>
        
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-[12px]">
            <p className="text-muted-foreground text-sm">No song requests yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map(request => (
              <div key={request.id} className="bg-card border border-border rounded-[12px] p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-foreground">{request.songTitle}</h4>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      request.status === 'accepted' ? 'bg-blue-500/20 text-blue-500' :
                      request.status === 'fulfilled' ? 'bg-green-500/20 text-green-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Requested by <span className="text-foreground">{request.requesterName}</span></p>
                  {request.description && (
                    <p className="text-sm text-muted-foreground mt-2">{request.description}</p>
                  )}
                </div>
                
                <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                  {request.tipAmount && parseFloat(request.tipAmount) > 0 && (
                    <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                      <img src={TON_LOGO} alt="TON" className="w-3 h-3" />
                      <span className="text-xs font-bold">{request.tipAmount} TON Tip</span>
                    </div>
                  )}
                  
                  {isOwnProfile && request.status === 'pending' && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleStatusChange(request.id, 'accepted')}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 rounded-[6px] text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Accept
                      </button>
                      <button 
                        onClick={() => handleStatusChange(request.id, 'rejected')}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-[6px] text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}
                  
                  {isOwnProfile && request.status === 'accepted' && (
                    <button 
                      onClick={() => handleStatusChange(request.id, 'fulfilled')}
                      className="w-full sm:w-auto px-4 py-2 bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-[6px] text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-3 h-3" /> Mark Fulfilled
                    </button>
                  )}

                  {!isOwnProfile && request.status === 'fulfilled' && request.requesterId === userProfile.uid && !request.hasTipped && (
                    <button 
                      onClick={() => handleTip(request.id, request.tipAmount)}
                      className="w-full sm:w-auto px-4 py-2 bg-purple-500/20 text-purple-500 hover:bg-purple-500/30 rounded-[6px] text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      <img src={TON_LOGO} alt="TON" className="w-3 h-3" /> Send Tip
                    </button>
                  )}
                  
                  {request.hasTipped && (
                    <div className="flex items-center gap-1.5 bg-green-500/20 text-green-500 px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-xs font-bold">Tipped</span>
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
