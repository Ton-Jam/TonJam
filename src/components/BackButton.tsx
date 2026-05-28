import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BackButtonProps {
  className?: string;
  ariaLabel?: string;
  iconClassName?: string;
  children?: React.ReactNode;
}

export const BackButton: React.FC<BackButtonProps> = ({ className, ariaLabel = "Go back", iconClassName = "h-6 w-6 text-foreground", children }) => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(-1)} 
      className={`p-2.5 rounded-full hover:bg-white/10 text-foreground transition-all active:scale-95 flex items-center justify-center ${className}`}
      aria-label={ariaLabel}
    >
      <ArrowLeftIcon className={`${iconClassName}`} strokeWidth={3.5} />
      {children}
    </button>
  );
};
