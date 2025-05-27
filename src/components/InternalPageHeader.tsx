
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import NavigationSidebar from "./NavigationSidebar";

interface InternalPageHeaderProps {
  title: string;
  subtitle?: string;
  backLink?: string;
  backText?: string;
}

const InternalPageHeader = ({ 
  title, 
  subtitle, 
  backLink = "/", 
  backText = "Back to Home" 
}: InternalPageHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-rap-carbon/95 backdrop-blur-md border-b border-rap-burgundy/50 py-3">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={backLink}>
            <Button variant="outline" className="border-rap-silver/50 text-rap-silver hover:bg-rap-burgundy/20 font-kaushan">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backText}
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/e375529f-0120-4c1e-9985-fb5e4cb79211.png" 
              alt="Spit Hierarchy Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-2xl font-mogra text-rap-silver animate-text-glow">{title}</h1>
              {subtitle && (
                <p className="text-rap-platinum font-kaushan text-sm">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        <NavigationSidebar />
      </div>
    </header>
  );
};

export default InternalPageHeader;
