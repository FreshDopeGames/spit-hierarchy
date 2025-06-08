
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import NavigationSidebar from "./NavigationSidebar";

interface InternalPageHeaderProps {
  title?: string;
  subtitle?: string;
  backLink?: string;
  backText?: string;
  showTitle?: boolean;
}

const InternalPageHeader = ({
  backLink = "/",
  backText = "Return to Dynasty"
}: InternalPageHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-rap-gold/30 py-3">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-full">
        <div className="flex items-center">
          <Link to={backLink} onClick={() => window.scrollTo(0, 0)}>
            <Button variant="outline" className="border-rap-gold/50 text-rap-gold hover:bg-rap-gold/20 hover:text-rap-gold-light font-mogra shadow-lg shadow-rap-gold/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backText}
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center flex-1">
          <Link to="/" className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" 
              alt="Spit Hierarchy Logo" 
              className="h-12 object-contain" 
            />
          </Link>
        </div>

        <NavigationSidebar />
      </div>
    </header>
  );
};

export default InternalPageHeader;
