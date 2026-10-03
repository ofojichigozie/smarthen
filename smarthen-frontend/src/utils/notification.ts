import { toast } from 'sonner';

type AlertLevel = 'warning' | 'critical';

export const requestNotificationPermission = async (): Promise<void> => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
  warning: (message: string) => toast.warning(message),

  alert: (message: string, level: AlertLevel = 'warning') => {
    const isCritical = level === 'critical';
    const title = isCritical ? '🚨 Poultry Farm Alert' : '⚠️ Poultry Farm Warning';

    const description = isCritical
      ? 'Immediate action required.'
      : 'Please check the environmental conditions.';

    if (isCritical) {
      toast.error(message, { description });
    } else {
      toast.warning(message, { description });
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        tag: `poultry-alert-${level}`,
      });
    }
  },
};
