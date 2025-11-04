import { useEffect, useRef, useState } from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { loadAdSenseScript } from '@/utils/adScriptLoader';

interface AdSenseUnitProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  adStyle?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
  onAdLoad?: (loaded: boolean) => void;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseUnit = ({ 
  adSlot, 
  adFormat = 'auto', 
  adStyle = { display: 'block' },
  className = '',
  responsive = true,
  onAdLoad
}: AdSenseUnitProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);
  const { hasConsent } = useCookieConsent();

  useEffect(() => {
    // Check if user has consented to advertising cookies
    if (!hasConsent('advertising')) {
      console.log('[AdSense] Advertising cookies not consented - not loading ads');
      setAdFailed(true);
      onAdLoad?.(false);
      return;
    }
    let resizeObserver: ResizeObserver;
    let timeoutId: NodeJS.Timeout;

    const checkAdLoad = () => {
      if (!adRef.current) return;

      const adElement = adRef.current.querySelector('.adsbygoogle') as HTMLElement;
      if (!adElement) return;

      // Check if ad has content (height > 0 and not just the default)
      const hasContent = adElement.offsetHeight > 0 && 
                        adElement.getAttribute('data-ad-status') !== 'unfilled';

      if (hasContent && !adLoaded) {
        setAdLoaded(true);
        setAdFailed(false);
        onAdLoad?.(true);
      } else if (!hasContent && !adLoaded) {
        // Set timeout to mark as failed if no content after 3 seconds
        timeoutId = setTimeout(() => {
          if (!adLoaded) {
            setAdFailed(true);
            onAdLoad?.(false);
          }
        }, 3000);
      }
    };

    // Load AdSense script first, then initialize ad
    const initializeAd = async () => {
      try {
        // Ensure AdSense script is loaded
        await loadAdSenseScript();
        
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          
          // Observe size changes to detect when ad loads
          if (adRef.current) {
            resizeObserver = new ResizeObserver(() => {
              checkAdLoad();
            });
            resizeObserver.observe(adRef.current);
          }

          // Initial check after a brief delay
          setTimeout(checkAdLoad, 100);
        }
      } catch (error) {
        console.error('AdSense error:', error);
        setAdFailed(true);
        onAdLoad?.(false);
      }
    };

    initializeAd();

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [adLoaded, onAdLoad]);

  const adStyleWithDefaults = {
    ...adStyle,
    ...(responsive && { width: '100%', height: 'auto' })
  };

  // Hide completely if ad failed to load
  if (adFailed) {
    return null;
  }

  return (
    <div 
      className={`adsense-container transition-opacity duration-300 ${
        adLoaded ? 'opacity-100' : 'opacity-50'
      } ${className}`} 
      ref={adRef}
    >
      <ins
        className="adsbygoogle"
        style={adStyleWithDefaults}
        data-ad-client="ca-pub-2518650700414992"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};

export default AdSenseUnit;