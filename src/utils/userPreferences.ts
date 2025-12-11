// User preferences stored in localStorage

// Discography sort order preference
const DISCOGRAPHY_SORT_KEY = 'discography-sort-order';

export type DiscographySortOrder = 'oldest' | 'newest';

export const getDiscographySortOrder = (): DiscographySortOrder => {
  try {
    const stored = localStorage.getItem(DISCOGRAPHY_SORT_KEY);
    if (stored === 'oldest' || stored === 'newest') {
      return stored;
    }
  } catch (error) {
    console.error('Error reading sort preference:', error);
  }
  return 'oldest'; // Default: oldest to newest
};

export const setDiscographySortOrder = (order: DiscographySortOrder): void => {
  try {
    localStorage.setItem(DISCOGRAPHY_SORT_KEY, order);
  } catch (error) {
    console.error('Error saving sort preference:', error);
  }
};
