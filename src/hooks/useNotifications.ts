import { useCallback } from 'react';

export const useNotifications = () => {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    
    // If already denied, don't ask again
    if (Notification.permission === 'denied') return false;
    if (Notification.permission === 'granted') return true;
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.warn('System: Notification request failed', error);
      return false;
    }
  }, []);

  const sendNotification = useCallback((title: string, body: string, icon = '/pwa-192x192.png') => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon });
      } catch (e) {
        console.warn('System: Failed to send browser notification', e);
      }
    }
    // Fallback: App-specific notification logic could go here if needed
  }, []);

  const triggerHaptic = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  return { requestPermission, sendNotification, triggerHaptic };
};
