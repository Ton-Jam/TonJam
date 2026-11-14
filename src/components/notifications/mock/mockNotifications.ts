import { TonJamNotification } from '../types';

export const INITIAL_CURATED_NOTIFICATIONS: Omit<TonJamNotification, 'id' | 'userId'>[] = [];

export const generateMockNotifications = (_userId: string): TonJamNotification[] => [];
