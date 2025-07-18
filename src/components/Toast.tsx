// components/Toast.tsx
import React from "react";
import "./Toast.css";

const Toast = ({ message }: { message: string }) => {
  return (
    <div className="toast-popup">
      <span className="toast-icon">✅</span>
      <span>{message}</span>
    </div>
  );
};

export default Toast;
