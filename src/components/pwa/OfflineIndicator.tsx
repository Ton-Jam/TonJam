import React from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-20 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500/90 text-white px-3.5 py-2 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — Playing downloaded & device songs.</span>
      <Link 
        to="/library/downloads"
        className="ml-1 underline font-bold hover:text-amber-100 transition-colors"
      >
        View
      </Link>
    </div>
  );
};
