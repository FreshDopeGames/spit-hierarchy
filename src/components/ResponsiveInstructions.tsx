
import React from "react";
import { useEffect, useState } from "react";

interface ResponsiveInstructionsProps {
  className?: string;
}

const ResponsiveInstructions = ({ className = "" }: ResponsiveInstructionsProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const instructions = isMobile 
    ? "Use Enter to start each new bar" 
    : "Use Shift+Enter to start each new bar";

  return (
    <p className={`text-yellow-400/80 text-sm font-merienda mb-2 ${className}`}>
      💡 {instructions}
    </p>
  );
};

export default ResponsiveInstructions;
