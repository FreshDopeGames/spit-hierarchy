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

  // Don't render anything if ad failed to load
  if (!showAd) {
    return null;
  }

  return (
    <div className={`my-8 flex justify-center transition-all duration-300 ${
      adLoaded ? 'opacity-100' : 'opacity-50'
    } ${className}`}>
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