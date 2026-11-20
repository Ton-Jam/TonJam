import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TonJamBackArrow } from '@/components/icons/TonJamBackArrow';

interface BackButtonProps {
  className?: string;
  ariaLabel?: string;
  iconClassName?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const BackButton: React.FC<BackButtonProps> = ({
  className = '',
  ariaLabel = 'Go back',
  iconClassName = 'h-5 w-5 text-[#FFFFFF]',
  onClick,
  children,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`min-w-[44px] min-h-[44px] p-2 rounded-full hover:bg-white/10 text-[#FFFFFF] transition-all active:scale-95 flex items-center justify-center border-none bg-transparent cursor-pointer ${className}`}
      aria-label={ariaLabel}
    >
      <TonJamBackArrow className={iconClassName} />
      {children}
    </button>
  );
};

export default BackButton;
