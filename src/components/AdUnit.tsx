
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

interface AdUnitProps {
  placement: string;
  pageRoute?: string; // Optional override for dynamic routes
  className?: string;
}

interface AdPlacement {
  id: string;
  page_name: string;
  page_route: string;
  placement_name: string;
  ad_unit_id: string;
  ad_format: string;
  is_active: boolean;
}

const AdUnit = ({ placement, pageRoute, className = "" }: AdUnitProps) => {
  const location = useLocation();
  const currentRoute = pageRoute || location.pathname;

  const { data: adPlacement, isLoading } = useQuery({
    queryKey: ['ad-placement', currentRoute, placement],
    queryFn: async () => {
      // First try exact route match
      let { data, error } = await supabase
        .from('ad_placements')
        .select('*')
        .eq('page_route', currentRoute)
        .eq('placement_name', placement)
        .eq('is_active', true)
        .single();

      // If no exact match, try template pattern matching for dynamic routes
      if (error && currentRoute.includes('/')) {
        const pathSegments = currentRoute.split('/');
        
        // Check for dynamic route patterns
        const patterns = [
          `/rapper/:id`, // For /rapper/123
          `/blog/:id`,   // For /blog/123
          `/rankings/official/:slug` // For /rankings/official/something
        ];

        for (const pattern of patterns) {
          const { data: templateData, error: templateError } = await supabase
            .from('ad_placements')
            .select('*')
            .eq('page_route', pattern)
            .eq('placement_name', placement)
            .eq('is_active', true)
            .single();

          if (templateData && !templateError) {
            data = templateData;
            error = null;
            break;
          }
        }
      }

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      
      return data as AdPlacement | null;
    }
  });

  // Don't render anything if loading or no ad placement found
  if (isLoading || !adPlacement) {
    return null;
  }

  // Render the third-party ad code based on the ad unit ID
  const renderAdCode = () => {
    const { ad_unit_id, ad_format } = adPlacement;
    
    // Handle different ad formats and providers
    if (ad_unit_id.startsWith('ca-pub-')) {
      // Google AdSense
      return (
        <div className="ad-container" data-ad-format={ad_format}>
          <ins 
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={ad_unit_id.split('/')[0]}
            data-ad-slot={ad_unit_id.split('/')[1]}
            data-ad-format={ad_format === 'banner' ? 'auto' : ad_format}
          />
        </div>
      );
    } else if (ad_unit_id.includes('admob')) {
      // Google AdMob (for mobile web)
      return (
        <div className="admob-container" data-ad-unit-id={ad_unit_id}>
          {/* AdMob integration would go here */}
          <div className="bg-carbon-fiber border border-rap-gold/30 p-4 text-center">
            <span className="text-xs text-rap-smoke uppercase tracking-wider">Advertisement</span>
            <div className="text-rap-platinum text-sm mt-2">AdMob Unit: {ad_unit_id}</div>
          </div>
        </div>
      );
    } else {
      // Generic third-party ad placeholder
      return (
        <div className="generic-ad-container" data-ad-unit-id={ad_unit_id}>
          <div className="bg-carbon-fiber border border-rap-gold/30 p-4 text-center">
            <span className="text-xs text-rap-smoke uppercase tracking-wider">Advertisement</span>
            <div className="text-rap-platinum text-sm mt-2">Ad Unit: {ad_unit_id}</div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`w-full my-6 ${className}`}>
      <div className="text-center mb-2">
        <span className="text-xs text-rap-smoke uppercase tracking-wider font-street">Advertisement</span>
      </div>
      {renderAdCode()}
    </div>
  );
};

export default AdUnit;
