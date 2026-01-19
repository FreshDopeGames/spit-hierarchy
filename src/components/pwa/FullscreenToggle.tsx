import { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';

interface FullscreenToggleProps {
  className?: string;
  showOnlyOnMobile?: boolean;
}

export const FullscreenToggle = ({ className, showOnlyOnMobile = true }: FullscreenToggleProps) => {
  const { enterFullscreen, exitFullscreen, isFullscreen } = usePWA();
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    // Check if mobile or tablet
    const checkDevice = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobileOrTablet(isTouchDevice && isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreenMode(isFullscreen());
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('resize', checkDevice);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  if (showOnlyOnMobile && !isMobileOrTablet) {
    return null;
  }

  const toggleFullscreen = async () => {
    if (isFullscreenMode) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFullscreen}
      className={cn(
        "text-[hsl(var(--theme-text))]/70 hover:text-[hsl(var(--theme-text))] hover:bg-[hsl(var(--theme-primary))]/10",
        className
      )}
      title={isFullscreenMode ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreenMode ? (
        <Minimize className="w-5 h-5" />
      ) : (
        <Maximize className="w-5 h-5" />
      )}
    </Button>
  );
};
