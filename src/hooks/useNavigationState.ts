
import { useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export interface AllFilters {
  page?: number;
  search?: string;
  location?: string;
  sort?: string;
  order?: string;
  rated?: string;
  scrollPos?: number;
}

export const useNavigationState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get all filters from URL params
  const getAllFilters = useCallback((): AllFilters => {
    return {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 0,
      search: searchParams.get('search') || '',
      location: searchParams.get('location') || '',
      sort: searchParams.get('sort') || 'activity',
      order: searchParams.get('order') || 'desc',
      rated: searchParams.get('rated') || 'all',
      scrollPos: searchParams.get('scrollPos') ? parseInt(searchParams.get('scrollPos')!, 10) : 0,
    };
  }, [searchParams]);

  // Set all filters in URL
  const setAllFilters = useCallback((filters: AllFilters) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    // Update or remove each filter
    if (filters.page !== undefined) {
      if (filters.page === 0) {
        newSearchParams.delete('page');
      } else {
        newSearchParams.set('page', filters.page.toString());
      }
    }
    
    if (filters.search !== undefined) {
      if (filters.search === '') {
        newSearchParams.delete('search');
      } else {
        newSearchParams.set('search', filters.search);
      }
    }
    
    if (filters.location !== undefined) {
      if (filters.location === '') {
        newSearchParams.delete('location');
      } else {
        newSearchParams.set('location', filters.location);
      }
    }
    
    if (filters.sort !== undefined && filters.sort !== 'activity') {
      newSearchParams.set('sort', filters.sort);
    } else if (filters.sort === 'activity') {
      newSearchParams.delete('sort');
    }
    
    if (filters.order !== undefined && filters.order !== 'desc') {
      newSearchParams.set('order', filters.order);
    } else if (filters.order === 'desc') {
      newSearchParams.delete('order');
    }
    
    if (filters.rated !== undefined && filters.rated !== 'all') {
      newSearchParams.set('rated', filters.rated);
    } else if (filters.rated === 'all') {
      newSearchParams.delete('rated');
    }
    
    if (filters.scrollPos !== undefined) {
      if (filters.scrollPos === 0) {
        newSearchParams.delete('scrollPos');
      } else {
        newSearchParams.set('scrollPos', filters.scrollPos.toString());
      }
    }
    
    setSearchParams(newSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Get scroll position from URL
  const getScrollPosition = useCallback(() => {
    const scrollPosParam = searchParams.get('scrollPos');
    return scrollPosParam ? parseInt(scrollPosParam, 10) : 0;
  }, [searchParams]);

  // Set scroll position in URL
  const setScrollPosition = useCallback((pos: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (pos === 0) {
      newSearchParams.delete('scrollPos');
    } else {
      newSearchParams.set('scrollPos', pos.toString());
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Navigate to rapper detail (scroll position already in URL)
  const navigateToRapper = useCallback((rapperId: string) => {
    // Navigation happens - current URL state is preserved in browser history
    navigate(`/rapper/${rapperId}`);
  }, [navigate]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const scrollPos = getScrollPosition();
      if (scrollPos > 0) {
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPos);
        });
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getScrollPosition]);

  return {
    getAllFilters,
    setAllFilters,
    getScrollPosition,
    setScrollPosition,
    navigateToRapper,
  };
};
