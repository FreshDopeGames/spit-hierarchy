
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { clearNavigationHistory } from "@/utils/navigationHistory";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Clear navigation history when navigating away from rapper-related pages
    if (!pathname.startsWith('/all-rappers') && !pathname.startsWith('/rapper')) {
      clearNavigationHistory();
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
