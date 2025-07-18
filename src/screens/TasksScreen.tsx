import React, { useState } from "react";
import "./TasksScreen.css";

const initialDailyTasks = [
  { id: 1, title: "Stream 1 Track", reward: 5, completed: true },
  { id: 2, title: "Like 2 Tracks", reward: 4, completed: false },
  { id: 3, title: "Share a Song", reward: 7, completed: false },
];

const socialTasks = [
  { id: 4, title: "Follow @TonJamHQ on X", reward: 5, completed: false },
  { id: 5, title: "Join TonJam Telegram", reward: 5, completed: false },
  { id: 6, title: "Follow @TonPartners", reward: 4, completed: false },
];

const TaskScreen = () => {
  const [dailyTasks, setDailyTasks] = useState(initialDailyTasks);
  const [socials, setSocials] = useState(socialTasks);
  const streakDays = 3; // Dynamic value from backend later
  const streakReward = streakDays >= 3 ? 10 : 0;

  const toggleComplete = (id: number, isSocial = false) => {
    const update = (list: any[]) =>
      list.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );

    isSocial ? setSocials(update(socials)) : setDailyTasks(update(dailyTasks));
  };

  const totalEarned =
    dailyTasks.filter(t => t.completed).reduce((a, b) => a + b.reward, 0) +
    socials.filter(t => t.completed).reduce((a, b) => a + b.reward, 0) +
    streakReward;

  return (
    <div className="task-screen">
      <h2 className="task-title">🔥 Earn $TJ</h2>

      <div className="task-group">
        <h3>🎯 Daily Tasks</h3>
        {dailyTasks.map(task => (
          <div
            key={task.id}
            className={`task-item ${task.completed ? "done" : ""}`}
            onClick={() => toggleComplete(task.id)}
          >
            <input type="checkbox" checked={task.completed} readOnly />
            <span>{task.title}</span>
            <span className="reward">+{task.reward} $TJ</span>
          </div>
        ))}
      </div>

      <div className="task-group">
        <h3>🤝 Social Tasks</h3>
        {socials.map(task => (
          <div
            key={task.id}
            className={`task-item ${task.completed ? "done" : ""}`}
            onClick={() => toggleComplete(task.id, true)}
          >
            <input type="checkbox" checked={task.completed} readOnly />
            <span>{task.title}</span>
            <span className="reward">+{task.reward} $TJ</span>
          </div>
        ))}
      </div>

      <div className="task-group streak">
        <h3>🔥 Streak Bonus</h3>
        <div className="streak-box">
          <span>Logged in {streakDays} day(s) in a row</span>
          <span className="reward">+{streakReward} $TJ</span>
        </div>
      </div>

      <div className="task-footer">
        Total Earned Today: <strong>{totalEarned} $TJ</strong>
      </div>
    </div>
  );
};

export default TasksScreen;
