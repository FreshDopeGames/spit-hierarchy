
import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsVisible(currentScrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-6 right-20 z-40 bg-rap-gold text-rap-carbon hover:bg-rap-gold/80 rounded-full h-12 w-12 p-0 shadow-lg shadow-rap-gold/30 transition-all duration-300 hover:scale-110"
      aria-label="Back to top"
    >
      <ChevronUp className="w-5 h-5" />
    </Button>
  );
};

export default BackToTopButton;
