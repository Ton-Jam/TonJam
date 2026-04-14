import React, { useEffect, useState } from 'react';
import { getTasks, Task, claimTaskReward } from '@/services/taskService';
import TaskCard from './TaskCard';
import TaskDetailModal from './TaskDetailModal';

const TaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  const handleToggle = (taskId: string, progress: number) => {
    // Implement toggle logic if needed, for now just update state
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress, completed: progress >= t.total } : t));
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Tasks & Rewards</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onClaim={handleClaim} 
            onToggle={handleToggle} 
            onClick={setSelectedTask}
          />
        ))}
      </div>
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
};

export default TaskDashboard;
