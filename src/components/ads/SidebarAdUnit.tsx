import { useState } from 'react';
import AdSenseUnit from './AdSenseUnit';
import AdAnnouncement from './AdAnnouncement';

interface SidebarAdUnitProps {
  className?: string;
  sticky?: boolean;
}

const SidebarAdUnit = ({ className = '', sticky = false }: SidebarAdUnitProps) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [showAd, setShowAd] = useState(true);

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
    <div className={`${sticky ? 'sticky top-24' : ''} transition-all duration-300 ${
      adLoaded ? 'opacity-100' : 'opacity-50'
    } ${className}`}>
      <div className="bg-rap-carbon/40 border border-rap-smoke/20 rounded-lg p-4">
        <AdAnnouncement visible={adLoaded} />
        <AdSenseUnit
          adSlot="1234567893" // Replace with actual sidebar ad slot
          adFormat="vertical"
          responsive={true}
          className="h-full"
          onAdLoad={handleAdLoad}
        />
      </div>
    </div>
  );
};

export default SidebarAdUnit;