import React from "react";
import "./TaskScreen.css";

const TaskScreen = () => {
  const tasks = [
    { id: 1, title: "Follow an Artist", reward: "5 TJ" },
    { id: 2, title: "Stream a Song NFT", reward: "10 TJ" },
    { id: 3, title: "Invite a Friend", reward: "15 TJ" },
  ];

  return (
    <div className="task-screen">
      <h2>Earn TJ Points</h2>
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id}>
            <span>{task.title}</span>
            <button>{task.reward}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskScreen;
