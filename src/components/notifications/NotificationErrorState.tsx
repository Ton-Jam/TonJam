import React from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';

interface NotificationErrorStateProps {
  errorMessage?: string;
  onRetry: () => void;
}

export const NotificationErrorState: React.FC<NotificationErrorStateProps> = ({
  errorMessage,
  onRetry,
}) => {
  return (
    <div className="py-20 px-6 flex flex-col items-center justify-center text-center select-none animate-in fade-in duration-200">
      <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-400 border border-rose-500/20">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h2 className="text-sm font-bold text-[#F5F7FB]">
        We couldn't load your notifications.
      </h2>

      <p className="text-xs text-[#94A3B8] font-normal max-w-xs mt-1.5 leading-relaxed">
        {errorMessage || 'A network error occurred while connecting to the notification stream.'}
      </p>

      <button
        onClick={onRetry}
        className="mt-5 px-5 py-2.5 rounded-full bg-[#229ED9] hover:bg-[#1e8bc2] text-white text-xs font-bold transition-all shadow-md shadow-[#229ED9]/20 active:scale-95 cursor-pointer flex items-center gap-2"
      >
        <RotateCw className="w-3.5 h-3.5" />
        <span>Retry</span>
      </button>
    </div>
  );
};

export default NotificationErrorState;
