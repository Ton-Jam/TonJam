import React, { useState, useEffect } from "react";
import { APP_LOGO } from "@/constants";

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        /* Simulate variable loading speed */
        const increment = Math.random() * 15;
        return Math.min(prev + increment, 100);
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-12 relative">
          <img
            src={APP_LOGO}
            alt="TonJam"
            className="w-26 h-26 md:w-34 md:h-34 object-contain animate-[spin_8s_linear_infinite]"
          />
        </div>
      </div>

      {/* Progress Bar Container at the bottom */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neutral-800 overflow-hidden">
        <div
          className="h-full bg-neutral-500 transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
