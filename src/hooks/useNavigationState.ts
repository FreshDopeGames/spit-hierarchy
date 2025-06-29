
import { useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const useNavigationState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get current page from URL params
  const getCurrentPage = useCallback(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 0;
  }, [searchParams]);

  // Set page in URL
  const setCurrentPage = useCallback((page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (page === 0) {
      newSearchParams.delete('page');
    } else {
      newSearchParams.set('page', page.toString());
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Save scroll position to session storage
  const saveScrollPosition = useCallback(() => {
    const scrollY = window.scrollY;
    sessionStorage.setItem('allRappersScrollPosition', scrollY.toString());
  }, []);

  // Restore scroll position from session storage
  const restoreScrollPosition = useCallback(() => {
    const savedPosition = sessionStorage.getItem('allRappersScrollPosition');
    if (savedPosition) {
      const scrollY = parseInt(savedPosition, 10);
      // Use setTimeout to ensure the page is fully rendered before scrolling
      setTimeout(() => {
        window.scrollTo(0, scrollY);
        // Clear the saved position after restoring
        sessionStorage.removeItem('allRappersScrollPosition');
      }, 100);
    }
  }, []);

  // Navigate to rapper detail while saving current state
  const navigateToRapper = useCallback((rapperId: string, currentPage: number) => {
    // Save current page and scroll position
    setCurrentPage(currentPage);
    saveScrollPosition();
    
    // Navigate to rapper detail
    navigate(`/rapper/${rapperId}`);
  }, [navigate, setCurrentPage, saveScrollPosition]);

  return {
    getCurrentPage,
    setCurrentPage,
    saveScrollPosition,
    restoreScrollPosition,
    navigateToRapper
  };
};
