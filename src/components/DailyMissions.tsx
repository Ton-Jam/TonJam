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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Daily Missions</CardTitle>
      </CardHeader>
      <CardContent>
        {missions.map(mission => {
          const completed = progress.find(p => p.missionId === mission.id)?.completed;
          return (
            <div key={mission.id} className="flex items-center justify-between p-4 border rounded-lg mb-2">
              <div>
                <h4 className="font-semibold">{mission.title}</h4>
                <p className="text-sm text-gray-500">{mission.description}</p>
                <div className="relative group">
                  <span className="text-xs font-bold text-blue-600 cursor-help underline decoration-dotted underline-offset-2">+{mission.xpReward} XP</span>
                  <div className="absolute left-0 bottom-full mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Earn {mission.xpReward} XP for this mission!
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={completed}
                onClick={() => handleComplete(mission.id)}
              >
                {completed ? <CheckCircle2 className="text-green-500" /> : <Circle />}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
