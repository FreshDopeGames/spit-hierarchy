
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
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
  backText = "Back Home"
}: InternalPageHeaderProps) => {
  const { theme } = useTheme();

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-black py-2 sm:py-3"
      style={{ borderBottomColor: `${theme.colors.primary}30`, borderBottomWidth: '1px', borderBottomStyle: 'solid' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between h-full">
        <div className="flex items-center">
          <Link to={backLink} onClick={() => window.scrollTo(0, 0)}>
            <Button 
              variant="outline" 
              className="font-mogra shadow-lg text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
              style={{
                borderColor: `${theme.colors.primary}50`,
                color: theme.colors.primary,
                backgroundColor: 'transparent',
                boxShadow: `0 4px 6px ${theme.colors.primary}20`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${theme.colors.primary}20`;
                e.currentTarget.style.color = theme.colors.primaryLight || theme.colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.colors.primary;
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
              src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" 
              alt="Spit Hierarchy Logo" 
              className="h-8 sm:h-12 object-contain" 
            />
          </Link>
        </div>

        <NavigationSidebar />
      </div>
    </header>
  );
};

export default InternalPageHeader;
