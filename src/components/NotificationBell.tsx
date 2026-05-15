import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotification } from '@/context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative"
      onClick={() => navigate('/notifications')}
      aria-label="Notifications"
    >
      <BellIcon className="h-[30px] w-[30px]" strokeWidth={2.5} />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-background" />
      )}
    </Button>
  );
};
