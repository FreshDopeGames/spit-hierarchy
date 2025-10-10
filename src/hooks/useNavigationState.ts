
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

  // Navigate to rapper detail while saving current page
  const navigateToRapper = useCallback((rapperId: string, currentPage: number) => {
    // Save current page for return navigation
    setCurrentPage(currentPage);
    
    // Navigate to rapper detail (ScrollToTop component handles scroll reset)
    navigate(`/rapper/${rapperId}`);
  }, [navigate, setCurrentPage]);

  return {
    getCurrentPage,
    setCurrentPage,
    navigateToRapper
  };
};
