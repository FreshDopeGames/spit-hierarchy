
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEnhancedTheme } from "@/hooks/useEnhancedTheme";
import NavigationSidebar from "./NavigationSidebar";
import ReadingProgressBar from "./blog/ReadingProgressBar";

interface InternalPageHeaderProps {
  title?: string;
  subtitle?: string;
  backLink?: string;
  backText?: string;
  showTitle?: boolean;
  showReadingProgress?: boolean;
}

const InternalPageHeader = ({
  backLink = "/",
  backText = "Back Home",
  showReadingProgress = false
}: InternalPageHeaderProps) => {
  const { theme } = useEnhancedTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black py-2 sm:py-3 border-b border-[hsl(var(--theme-primary))]/30 overflow-visible">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between h-full">
        <div className="flex items-center">
          <Link to={backLink} onClick={() => window.scrollTo(0, 0)}>
            <Button 
              variant="outline" 
              className="font-[var(--theme-font-heading)] shadow-lg text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 border-[hsl(var(--theme-primary))]/50 text-[hsl(var(--theme-primary))] bg-transparent hover:bg-[hsl(var(--theme-primary))]/20 hover:text-[hsl(var(--theme-primaryLight))] transition-all duration-200"
              style={{
                boxShadow: '0 4px 6px hsl(var(--theme-primary) / 0.2)'
              }}
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{backText}</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center flex-1">
          <Link to="/" className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/logo-header.png" 
              alt="Spit Hierarchy Logo" 
              className="h-8 sm:h-12 object-contain" 
            />
          </Link>
        </div>

        <NavigationSidebar />
      </div>
      
      {showReadingProgress && <ReadingProgressBar />}
    </header>
  );
};

export default InternalPageHeader;
