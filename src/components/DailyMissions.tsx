import React, { useState, useEffect } from 'react';
import { DailyMission, UserMissionProgress, getDailyMissions, getUserMissionProgress, completeMission } from '@/services/fanEngagementService';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';

export const DailyMissions = () => {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [progress, setProgress] = useState<UserMissionProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      const today = new Date().toISOString().split('T')[0];
      const fetchedMissions = await getDailyMissions(today);
      setMissions(fetchedMissions);
      if (auth.currentUser) {
        const fetchedProgress = await getUserMissionProgress(auth.currentUser.uid);
        setProgress(fetchedProgress);
      }
      setLoading(false);
    };
    fetchMissions();
  }, []);

  const handleComplete = async (missionId: string) => {
    if (!auth.currentUser) return;
    await completeMission(auth.currentUser.uid, missionId);
    setProgress(prev => prev.map(p => p.missionId === missionId ? { ...p, completed: true } : p));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="w-full">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">Daily Missions</h3>
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {missions.map(mission => {
          const completed = progress.find(p => p.missionId === mission.id)?.completed;
          return (
            <div key={mission.id} className="min-w-[240px] p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200 leading-tight mb-1">{mission.title}</h4>
                <p className="text-[10px] text-slate-500 leading-tight mb-3">{mission.description}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-blue-400">+{mission.xpReward} XP</span>
                <Button 
                  size="sm"
                  variant={completed ? "secondary" : "default"}
                  className="h-7 text-[9px] font-bold uppercase px-3"
                  disabled={completed}
                  onClick={() => handleComplete(mission.id)}
                >
                  {completed ? 'Done' : 'Claim'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
