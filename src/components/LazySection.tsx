import { useEffect, useRef, useState, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  minHeight?: string;
}

/**
 * LazySection - Defers rendering of children until they're near the viewport
 * Uses Intersection Observer for efficient scroll-based lazy loading
 */
const LazySection = ({ 
  children, 
  fallback = null,
  rootMargin = '200px',
  threshold = 0.01,
  minHeight
}: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If IntersectionObserver isn't supported, render immediately
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      setHasBeenVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasBeenVisible(true);
          // Once visible, no need to observe anymore
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref} style={minHeight && !hasBeenVisible ? { minHeight } : undefined}>
      {hasBeenVisible ? children : fallback}
    </div>
  );
};

export default LazySection;
