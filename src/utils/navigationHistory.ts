// Store navigation history in sessionStorage
const HISTORY_KEY = 'navigation_history';
const MAX_HISTORY = 5;

export interface NavigationEntry {
  path: string;
  scrollPos: number;
  timestamp: number;
}

export const saveNavigationEntry = (path: string, scrollPos: number) => {
  try {
    const history = getNavigationHistory();
    const entry: NavigationEntry = {
      path,
      scrollPos,
      timestamp: Date.now()
    };
    
    // Add new entry and keep only last MAX_HISTORY entries
    history.push(entry);
    const trimmedHistory = history.slice(-MAX_HISTORY);
    
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Failed to save navigation entry:', error);
  }
};

export const getNavigationHistory = (): NavigationEntry[] => {
  try {
    const stored = sessionStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const getLastAllRappersEntry = (): NavigationEntry | null => {
  const history = getNavigationHistory();
  // Find the most recent /all-rappers entry
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].path === '/all-rappers') {
      return history[i];
    }
  }
  return null;
};

export const clearNavigationHistory = () => {
  sessionStorage.removeItem(HISTORY_KEY);
};
