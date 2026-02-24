
import React, { useState, useEffect } from 'react';
import { APP_LOGO } from '../constants';

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Simulate variable loading speed
        const increment = Math.random() * 15;
        return Math.min(prev + increment, 100);
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-blue-500/5 blur-[120px] pointer-events-none animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-xs px-8">
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>
          <img 
            src={APP_LOGO} 
            alt="TonJam" 
            className="w-24 h-24 md:w-32 md:h-32 object-contain animate-[spin_8s_linear_infinite] drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]" 
          />
        </div>
        
        {/* Progress Bar Container */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
