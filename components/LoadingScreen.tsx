
import React from 'react';
import { APP_LOGO } from '../constants';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-blue-500/5 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-10 relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>
          <img 
            src={APP_LOGO} 
            alt="TonJam" 
            className="w-32 h-32 md:w-48 md:h-48 object-contain animate-[bounce_3s_infinite_ease-in-out] drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]" 
          />
        </div>
        
        <h2 className="text-4xl font-black italic tracking-tighter mb-4 text-white uppercase flex items-center gap-3">
          TONJAM
        </h2>
        <div className="flex gap-3 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s] shadow-[0_0_10px_#3b82f6]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s] shadow-[0_0_10px_#3b82f6]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce shadow-[0_0_10px_#3b82f6]"></div>
        </div>
        
        <p className="mt-12 text-white/20 text-[10px] font-black uppercase tracking-[0.8em]">Syncing frequencies</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
