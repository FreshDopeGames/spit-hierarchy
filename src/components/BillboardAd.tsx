
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
        <span className="text-xs text-gray-500 uppercase tracking-wider">Advertisement</span>
      </div>
      
      <Card 
        className="bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer"
        onClick={handleAdClick}
      >
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Ad Image/Placeholder */}
            <div className="w-full md:w-32 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <ExternalLink className="w-8 h-8 text-white/70" />
              )}
            </div>

            {/* Ad Content */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-gray-300 text-sm mb-3">{description}</p>
              
              <div className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
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
