import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAudio } from '@/context/AudioContext';
import { XCircle } from 'lucide-react';

interface RequestSongModalProps {
  artistId: string;
  artistName: string;
  onClose: () => void;
}

const RequestSongModal: React.FC<RequestSongModalProps> = ({ artistId, artistName, onClose }) => {
  const [songTitle, setSongTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const { addNotification } = useAudio();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'songRequests'), {
        artistId,
        requesterId: auth.currentUser.uid,
        requesterName: auth.currentUser.displayName || 'Anonymous',
        songTitle,
        description,
        status: 'pending',
        tipAmount: tipAmount ? parseFloat(tipAmount) : 0,
        hasTipped: !!tipAmount,
        createdAt: new Date().toISOString()
      });
      addNotification("Song request submitted!", "success");
      onClose();
    } catch (error) {
      console.error("Error submitting request:", error);
      addNotification("Failed to submit request.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="glass border border-border w-full max-w-md rounded-[20px] p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Request a Song from {artistName}</h2>
          <button onClick={onClose}><XCircle className="h-6 w-6 text-muted-foreground"/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Song Title" value={songTitle} onChange={e => setSongTitle(e.target.value)} className="w-full bg-muted/50 p-3 rounded" required />
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-muted/50 p-3 rounded" />
          <input type="number" placeholder="Tip Amount (TON)" value={tipAmount} onChange={e => setTipAmount(e.target.value)} className="w-full bg-muted/50 p-3 rounded" />
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded font-bold">Submit Request</button>
        </form>
      </div>
    </div>
  );
};

export default RequestSongModal;
