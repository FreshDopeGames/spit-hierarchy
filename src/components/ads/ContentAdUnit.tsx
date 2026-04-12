import { useState } from 'react';
import AdSenseUnit from './AdSenseUnit';
import AdAnnouncement from './AdAnnouncement';

interface ContentAdUnitProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const ContentAdUnit = ({ className = '', size = 'medium' }: ContentAdUnitProps) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [showAd, setShowAd] = useState(true);

  // Different ad slot IDs for different sizes
  const adSlots = {
    small: '1234567890', // Replace with actual ad slot
    medium: '1234567891', // Replace with actual ad slot  
    large: '1234567892'   // Replace with actual ad slot
  };

  const handleAdLoad = (loaded: boolean) => {
    setAdLoaded(loaded);
    if (!loaded) {
      // Hide the entire container if ad fails to load
      setTimeout(() => setShowAd(false), 100);
    }
  };

  const minHeights = {
    small: '90px',
    medium: '120px',
    large: '250px'
  };

  return (
    <div 
      className={`my-8 flex justify-center transition-all duration-500 ${className}`}
      style={{ 
        contain: 'layout',
        minHeight: showAd ? minHeights[size] : '0px',
        opacity: !showAd ? 0 : adLoaded ? 1 : 0.5,
        overflow: 'hidden',
        maxHeight: !showAd ? '0px' : undefined,
        margin: !showAd ? '0' : undefined,
      }}
    >
      <div className="max-w-full">
        <AdAnnouncement visible={adLoaded} />
        <AdSenseUnit
          adSlot={adSlots[size]}
          adFormat="auto"
          responsive={true}
          className="border border-rap-smoke/20 rounded-lg"
          onAdLoad={handleAdLoad}
        />
      </div>
    </div>
  );
};

export default ContentAdUnit;