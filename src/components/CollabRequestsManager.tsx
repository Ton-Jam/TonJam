import React, { useState } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { CollabRequest, CollabMessage } from '@/types';
import { Handshake, Zap, MessageSquare, CheckCircle2, XCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export const CollabRequestsManager: React.FC = () => {
  const { userProfile, collabRequests, updateCollabRequest, addCollabMessage } = useAudio();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  if (!userProfile) return null;

  const myRequests = collabRequests.filter(
    req => req.senderId === userProfile.uid || req.receiverId === userProfile.uid
  );

  const pendingRequests = myRequests.filter(req => req.status === 'pending');
  const activeCollabs = myRequests.filter(req => req.status === 'accepted');
  const rejectedRequests = myRequests.filter(req => req.status === 'rejected');

  const handleSendMessage = (requestId: string) => {
    if (!newMessage.trim()) return;

    const message: CollabMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: userProfile.uid,
      senderName: userProfile.name || userProfile.username || 'Unknown',
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    addCollabMessage(requestId, message);
    setNewMessage('');
  };

  const handleAccept = (id: string) => {
    updateCollabRequest(id, { status: 'accepted' });
    toast.success('Collaboration Accepted! Smart contract split template ready.');
  };

  const handleReject = (id: string) => {
    updateCollabRequest(id, { status: 'rejected' });
    toast.success('Collaboration Declined.');
  };

  const renderRequestCard = (req: CollabRequest) => {
    const isSender = req.senderId === userProfile.uid;
    const otherPartyName = isSender ? req.receiverName : req.senderName;
    const mySplit = isSender ? req.proposedSplit : (100 - req.proposedSplit);

    return (
      <div key={req.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">{req.trackTitle}</h3>
            <p className="text-xs text-neutral-400 font-bold tracking-widest uppercase mt-1">
              With {otherPartyName}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
              req.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' :
              req.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              {req.status}
            </span>
          </div>
        </div>

        <p className="text-sm text-neutral-300">{req.description}</p>
        
        <div className="flex items-center gap-2 p-3 bg-neutral-950 rounded-lg border border-neutral-800">
          <Handshake className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-neutral-300">Revenue Split:</span>
          <span className="text-xs font-black text-cyan-400 ml-auto">
            {mySplit}% (You) / {100 - mySplit}% ({otherPartyName})
          </span>
        </div>

        {req.status === 'pending' && !isSender && (
          <div className="flex gap-3 pt-2">
            <Button onClick={() => handleAccept(req.id)} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Accept Proposal
            </Button>
            <Button onClick={() => handleReject(req.id)} variant="outline" className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10">
              <XCircle className="w-4 h-4 mr-2" /> Decline
            </Button>
          </div>
        )}

        {/* Chat Section */}
        <div className="mt-4 pt-4 border-t border-neutral-800">
          <Button 
            variant="ghost" 
            onClick={() => setActiveChat(activeChat === req.id ? null : req.id)}
            className="w-full justify-between hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <span className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
              <MessageSquare className="w-4 h-4" /> Discussion ({req.messages.length})
            </span>
            <span>{activeChat === req.id ? 'Hide' : 'Show'}</span>
          </Button>

          {activeChat === req.id && (
            <div className="mt-4 space-y-4">
              <div className="max-h-[200px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {req.messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.senderId === userProfile.uid ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] font-bold text-neutral-500 mb-1">{msg.senderName}</span>
                    <div className={`px-3 py-2 rounded-xl text-xs max-w-[80%] ${
                      msg.senderId === userProfile.uid ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-neutral-800 text-neutral-200 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-neutral-950 border-neutral-800 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(req.id)}
                />
                <Button onClick={() => handleSendMessage(req.id)} size="icon" className="bg-cyan-500 hover:bg-cyan-400 text-black shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-white">Collaboration Requests</h2>
          <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase mt-1">Manage splits & messages</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Action Required ({pendingRequests.length})
          </h3>
          {pendingRequests.length > 0 ? (
            pendingRequests.map(renderRequestCard)
          ) : (
            <div className="p-8 border border-neutral-800 border-dashed rounded-xl text-center text-neutral-500 text-xs font-bold uppercase tracking-widest">
              No pending requests
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
            <Handshake className="w-4 h-4" /> Active Collabs ({activeCollabs.length})
          </h3>
          {activeCollabs.length > 0 ? (
            activeCollabs.map(renderRequestCard)
          ) : (
            <div className="p-8 border border-neutral-800 border-dashed rounded-xl text-center text-neutral-500 text-xs font-bold uppercase tracking-widest">
              No active collaborations
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
