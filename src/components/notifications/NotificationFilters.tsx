import React from 'react';
import NotificationFilterPills from './NotificationFilterPills';
import { NotificationFilter } from './types';

interface NotificationFiltersProps {
  activeFilter: NotificationFilter;
  onChangeFilter: (filter: NotificationFilter) => void;
  className?: string;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = (props) => {
  return <NotificationFilterPills {...props} />;
};

export default NotificationFilters;
