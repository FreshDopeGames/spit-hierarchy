
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
            <Button variant="outline" className="border-rap-silver/50 text-rap-silver hover:bg-rap-burgundy/20 font-street">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backText}
            </Button>
          </Link>
          
          <div>
            <h1 className="text-2xl font-graffiti text-rap-silver animate-text-glow">{title}</h1>
            {subtitle && (
              <p className="text-rap-platinum font-street text-sm">{subtitle}</p>
            )}
          </div>
        </div>

        <NavigationSidebar />
      </div>
    </header>
  );
};

export default InternalPageHeader;
