
import { useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export interface AllFilters {
  page?: number;
  search?: string;
  location?: string;
  sort?: string;
  order?: string;
  rated?: string;
  zodiac?: string;
  tag?: string;
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
      zodiac: searchParams.get('zodiac') || 'all',
      tag: searchParams.get('tag') || 'all',
      scrollPos: searchParams.get('scrollPos') ? parseInt(searchParams.get('scrollPos')!, 10) : 0,
    };
  }, [searchParams]);

  // Set all filters in URL (merges with existing params)
  const setAllFilters = useCallback((filters: AllFilters) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    // Get current values from URL as defaults
    const currentFilters = getAllFilters();
    
    // Merge passed filters with current filters
    const mergedFilters = { ...currentFilters, ...filters };
    
    // Update or remove each filter based on merged values
    if (mergedFilters.page !== undefined) {
      if (mergedFilters.page === 0) {
        newSearchParams.delete('page');
      } else {
        newSearchParams.set('page', mergedFilters.page.toString());
      }
    }
    
    if (mergedFilters.search !== undefined) {
      if (mergedFilters.search === '') {
        newSearchParams.delete('search');
      } else {
        newSearchParams.set('search', mergedFilters.search);
      }
    }
    
    if (mergedFilters.location !== undefined) {
      if (mergedFilters.location === '') {
        newSearchParams.delete('location');
      } else {
        newSearchParams.set('location', mergedFilters.location);
      }
    }
    
    if (mergedFilters.sort !== undefined && mergedFilters.sort !== 'activity') {
      newSearchParams.set('sort', mergedFilters.sort);
    } else if (mergedFilters.sort === 'activity') {
      newSearchParams.delete('sort');
    }
    
    if (mergedFilters.order !== undefined && mergedFilters.order !== 'desc') {
      newSearchParams.set('order', mergedFilters.order);
    } else if (mergedFilters.order === 'desc') {
      newSearchParams.delete('order');
    }
    
    if (mergedFilters.rated !== undefined && mergedFilters.rated !== 'all') {
      newSearchParams.set('rated', mergedFilters.rated);
    } else if (mergedFilters.rated === 'all') {
      newSearchParams.delete('rated');
    }
    
    if (mergedFilters.zodiac !== undefined && mergedFilters.zodiac !== 'all') {
      newSearchParams.set('zodiac', mergedFilters.zodiac);
    } else if (mergedFilters.zodiac === 'all') {
      newSearchParams.delete('zodiac');
    }
    
    if (mergedFilters.tag !== undefined && mergedFilters.tag !== 'all') {
      newSearchParams.set('tag', mergedFilters.tag);
    } else if (mergedFilters.tag === 'all') {
      newSearchParams.delete('tag');
    }
    
    if (mergedFilters.scrollPos !== undefined) {
      if (mergedFilters.scrollPos === 0) {
        newSearchParams.delete('scrollPos');
      } else {
        newSearchParams.set('scrollPos', mergedFilters.scrollPos.toString());
      }
    }
    
    setSearchParams(newSearchParams, { replace: true });
  }, [searchParams, setSearchParams, getAllFilters]);

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
