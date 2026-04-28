import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BackButtonProps {
  className?: string;
  ariaLabel?: string;
  iconClassName?: string;
  children?: React.ReactNode;
}

export const BackButton: React.FC<BackButtonProps> = ({ className, ariaLabel = "Go back", iconClassName = "h-5 w-5", children }) => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(-1)} 
      className={`p-3 rounded-full hover:bg-muted text-zinc-500 dark:text-muted-foreground hover:text-foreground transition-all ${className}`}
      aria-label={ariaLabel}
    >
      <ArrowLeftIcon className={`${iconClassName} text-zinc-700`} />
      {children}
    </button>
  );
};
