import AdSenseUnit from './AdSenseUnit';

interface SidebarAdUnitProps {
  className?: string;
  sticky?: boolean;
}

const SidebarAdUnit = ({ className = '', sticky = false }: SidebarAdUnitProps) => {
  return (
    <div className={`${sticky ? 'sticky top-24' : ''} ${className}`}>
      <div className="bg-rap-carbon/40 border border-rap-smoke/20 rounded-lg p-4 min-h-[600px]">
        <p className="text-rap-smoke text-sm mb-4 font-kaushan text-center">Advertisement</p>
        <AdSenseUnit 
          adSlot="1234567893" // Replace with actual sidebar ad slot
          adFormat="vertical"
          responsive={true}
          className="h-full"
        />
      </div>
    </div>
  );
};

export default SidebarAdUnit;