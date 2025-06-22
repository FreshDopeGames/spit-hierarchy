
interface NotificationState {
  levelUpNotifications: Record<string, boolean>;
  achievementNotifications: Record<string, boolean>;
}

const NOTIFICATION_STORAGE_KEY = 'rap_rankings_notifications';

export const getNotificationState = (): NotificationState => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading notification state:', error);
  }
  
  return {
    levelUpNotifications: {},
    achievementNotifications: {}
  };
};

export const setNotificationState = (state: NotificationState): void => {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving notification state:', error);
  }
};

export const markLevelUpNotificationShown = (userId: string, status: string): void => {
  const state = getNotificationState();
  const key = `${userId}-${status}`;
  state.levelUpNotifications[key] = true;
  setNotificationState(state);
};

export const hasLevelUpNotificationBeenShown = (userId: string, status: string): boolean => {
  const state = getNotificationState();
  const key = `${userId}-${status}`;
  return state.levelUpNotifications[key] || false;
};

export const markAchievementNotificationShown = (userId: string, achievementId: string): void => {
  const state = getNotificationState();
  const key = `${userId}-${achievementId}`;
  state.achievementNotifications[key] = true;
  setNotificationState(state);
};

export const hasAchievementNotificationBeenShown = (userId: string, achievementId: string): boolean => {
  const state = getNotificationState();
  const key = `${userId}-${achievementId}`;
  return state.achievementNotifications[key] || false;
};
