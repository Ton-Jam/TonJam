import React, { useState } from 'react';
import { Plus, Trash2, User, Wallet, Briefcase, Search, Loader2 } from 'lucide-react';
import { Collaborator } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

interface CollaboratorManagerProps {
  collaborators: Collaborator[];
  onChange: (collaborators: Collaborator[]) => void;
}

export default function CollaboratorManager({ collaborators, onChange }: CollaboratorManagerProps) {
  const [newCollaborator, setNewCollaborator] = useState<Partial<Collaborator>>({
    name: '',
    role: '',
    address: '',
    userId: ''
  });
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAdd = () => {
    if (!newCollaborator.name || !newCollaborator.address || !newCollaborator.role) return;

    const collaborator: Collaborator = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCollaborator.name,
      role: newCollaborator.role,
      address: newCollaborator.address,
      userId: newCollaborator.userId
    };

    onChange([...collaborators, collaborator]);
    setNewCollaborator({ name: '', role: '', address: '', userId: '' });
    setSearchQuery('');
  };

  const handleRemove = (id: string) => {
    onChange(collaborators.filter(c => c.id !== id));
  };

  const searchUser = async () => {
    if (!searchQuery) return;
    setSearching(true);
    try {
      // Search by username or UID
      const usersRef = collection(db, 'users');
      let q = query(usersRef, where('username', '==', searchQuery.replace('@', '')), limit(1));
      let querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Try searching by UID
        q = query(usersRef, where('uid', '==', searchQuery), limit(1));
        querySnapshot = await getDocs(q);
      }

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setNewCollaborator({
          name: userData.name || userData.username,
          address: userData.walletAddress || '',
          userId: userData.uid,
          role: newCollaborator.role
        });
      } else {
        // If not found, just use the search query as name if it looks like a name
        if (!searchQuery.startsWith('0x') && searchQuery.length < 30) {
          setNewCollaborator(prev => ({ ...prev, name: searchQuery }));
        }
      }
    } catch (error) {
      console.error("Error searching user:", error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/10 rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" />
          Manage Collaborators
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Search User (UID or @username)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g. @producer_pro"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/20 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={searchUser}
                disabled={searching || !searchQuery}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Collaborator Name</label>
            <input
              type="text"
              placeholder="Display Name"
              value={newCollaborator.name}
              onChange={(e) => setNewCollaborator({ ...newCollaborator, name: e.target.value })}
              className="w-full bg-muted/20 border border-white/5 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="e.g. Producer, Vocalist"
                value={newCollaborator.role}
                onChange={(e) => setNewCollaborator({ ...newCollaborator, role: e.target.value })}
                className="w-full bg-muted/20 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Wallet Address</label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="TON Wallet Address"
                value={newCollaborator.address}
                onChange={(e) => setNewCollaborator({ ...newCollaborator, address: e.target.value })}
                className="w-full bg-muted/20 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!newCollaborator.name || !newCollaborator.address || !newCollaborator.role}
          className="w-full bg-foreground text-background py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Add Collaborator
        </button>
      </div>

      <div className="space-y-3">
        {collaborators.length === 0 ? (
          <div className="text-center py-8 bg-muted/5 rounded-2xl border border-dashed border-white/10">
            <p className="text-muted-foreground text-sm">No collaborators added yet.</p>
          </div>
        ) : (
          collaborators.map((collaborator) => (
            <div 
              key={collaborator.id}
              className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{collaborator.name}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                      {collaborator.role}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                    {collaborator.address}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => handleRemove(collaborator.id)}
                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
