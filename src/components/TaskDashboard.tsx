import React, { useEffect, useState } from 'react';
import { getTasks, Task, claimTaskReward } from '@/services/taskService';
import { CheckCircle, Circle, Gift } from 'lucide-react';

const TaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    };
    fetchTasks();
  }, []);

  const handleClaim = async (taskId: string) => {
    await claimTaskReward(taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, claimed: true } : t));
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Tasks & Rewards</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map(task => (
          <div key={task.id} className="p-4 border rounded-lg flex items-center justify-between">
            <div>
              <h3 className="font-bold">{task.title}</h3>
              <p className="text-sm text-muted-foreground">{task.description}</p>
              <p className="text-xs font-bold text-orange-500">{task.points} TJ Coins</p>
            </div>
            {task.claimed ? (
              <CheckCircle className="text-green-500" />
            ) : task.completed ? (
              <button onClick={() => handleClaim(task.id)} className="flex items-center gap-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs">
                <Gift className="w-4 h-4" /> Claim
              </button>
            ) : (
              <Circle className="text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskDashboard;
