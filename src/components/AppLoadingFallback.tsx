import React from 'react';

export const AppLoadingFallback: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060B1E] text-white p-4 select-none">
      <div className="relative flex flex-col items-center space-y-5">
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0088CC] to-[#00B4D8] p-0.5 shadow-[0_0_40px_rgba(0,136,204,0.4)] animate-pulse">
          <div className="w-full h-full bg-[#060B1E] rounded-[14px] flex items-center justify-center">
            <img src="/tonjam-icon.png" alt="TonJam" className="w-10 h-10 object-contain" />
          </div>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-xl font-black tracking-widest uppercase bg-gradient-to-r from-white via-cyan-200 to-[#00B4D8] bg-clip-text text-transparent">
            TonJam
          </h1>
          <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            <div className="w-4 h-4 rounded-full border-2 border-[#0088CC]/30 border-t-[#0088CC] animate-spin" />
            <span>Initializing Application...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLoadingFallback;
