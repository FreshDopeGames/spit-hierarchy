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
  backText = "Return to Dynasty"
}: InternalPageHeaderProps) => {
  return <header className="fixed top-0 left-0 right-0 z-50 bg-rap-carbon/95 backdrop-blur-md border-b border-rap-gold/50 py-3">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={backLink}>
            <Button variant="outline" className="border-rap-gold/50 text-rap-gold hover:bg-rap-gold/20 hover:text-rap-gold-light font-mogra shadow-lg shadow-rap-gold/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backText}
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3">
            <img src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" alt="Spit Hierarchy Logo" className="w-10 h-8 object-contain animate-glow-pulse" />
            <div>
              <h1 className="font-ceviche text-rap-gold text-3xl">{title}</h1>
              {subtitle}
            </div>
          </div>
        </div>

        <NavigationSidebar />
      </div>
    </header>;
};
export default InternalPageHeader;