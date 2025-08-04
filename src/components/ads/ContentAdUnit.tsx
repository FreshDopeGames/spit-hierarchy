import AdSenseUnit from './AdSenseUnit';

interface ContentAdUnitProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const ContentAdUnit = ({ className = '', size = 'medium' }: ContentAdUnitProps) => {
  // Different ad slot IDs for different sizes
  const adSlots = {
    small: '1234567890', // Replace with actual ad slot
    medium: '1234567891', // Replace with actual ad slot  
    large: '1234567892'   // Replace with actual ad slot
  };

  const sizeStyles = {
    small: { minHeight: '250px' },
    medium: { minHeight: '320px' },
    large: { minHeight: '400px' }
  };

  return (
    <div className={`my-8 flex justify-center ${className}`}>
      <div className="max-w-full" style={sizeStyles[size]}>
        <AdSenseUnit 
          adSlot={adSlots[size]}
          adFormat="auto"
          responsive={true}
          className="border border-rap-smoke/20 rounded-lg"
        />
      </div>
    </div>
  );
};

export default ContentAdUnit;