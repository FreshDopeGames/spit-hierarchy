
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface BillboardAdProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  clickUrl?: string;
  className?: string;
}

const BillboardAd = ({ 
  title = "Advertise Here", 
  description = "Reach hip-hop fans and music enthusiasts", 
  imageUrl, 
  ctaText = "Learn More", 
  clickUrl = "#",
  className = ""
}: BillboardAdProps) => {
  const handleAdClick = () => {
    if (clickUrl && clickUrl !== "#") {
      window.open(clickUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`w-full my-8 ${className}`}>
      <div className="text-center mb-2">
        <span className="text-xs text-rap-smoke uppercase tracking-wider font-street">Advertisement</span>
      </div>
      
      <Card 
        className="bg-carbon-fiber border-rap-burgundy/40 hover:border-rap-burgundy/70 transition-all duration-300 cursor-pointer relative overflow-hidden group"
        onClick={handleAdClick}
      >
        {/* Rap culture accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rap-burgundy via-rap-forest to-rap-silver"></div>
        
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Ad Image/Placeholder */}
            <div className="w-full md:w-32 h-24 bg-gradient-to-br from-rap-burgundy to-rap-forest rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-rap-burgundy-light group-hover:to-rap-forest-light transition-all duration-300">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <ExternalLink className="w-8 h-8 text-rap-platinum/70" />
              )}
            </div>

            {/* Ad Content */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-rap-platinum font-graffiti font-bold text-lg mb-2 group-hover:text-rap-silver transition-colors">{title}</h3>
              <p className="text-rap-smoke text-sm mb-3 font-street">{description}</p>
              
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rap-burgundy to-rap-forest hover:from-rap-burgundy-light hover:to-rap-forest-light text-rap-platinum px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 font-street border border-rap-silver/20 shadow-lg shadow-rap-burgundy/30">
                {ctaText}
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillboardAd;
