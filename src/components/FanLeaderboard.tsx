import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TopUser {
  uid: string;
  name: string;
  xp: number;
  avatar?: string;
}

export const FanLeaderboard: React.FC = () => {
  const [users, setUsers] = useState<TopUser[]>([]);

  useEffect(() => {
    const fetchTopFans = async () => {
      // NOTE: Querying by xp requires a composite index if not already present.
      // Firebase will suggest the index URL in the console if it fails.
      const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(5));
      const snapshot = await getDocs(q);
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as TopUser)));
    };
    fetchTopFans();
  }, []);

  return (
    <Card className="w-full border border-neutral-300 dark:border-white/10 shadow-sm rounded-3xl p-2 bg-card">
      <CardHeader>
        <CardTitle className="text-sm font-black text-gray-800 uppercase tracking-widest">Global Top Fans</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {users.map((user, index) => (
          <Link key={user.uid} to={`/user/${user.uid}`} className="flex items-center justify-between p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <span className="font-mono text-gray-400 font-bold w-6 text-xs text-center">{index + 1}</span>
              <Avatar className="w-8 h-8 rounded-full border border-neutral-200">
                <AvatarImage src={user.avatar || '/placeholder-avatar.png'} />
                <AvatarFallback>{user.name.slice(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{user.name}</span>
            </div>
            <span className="font-black text-blue-600 text-xs">{user.xp?.toLocaleString() || 0} XP</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};
