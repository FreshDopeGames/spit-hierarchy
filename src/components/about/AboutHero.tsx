import React from "react";
const AboutHero = () => {
  return <div className="text-center space-y-4 mb-12">
      <div className="flex flex-col items-center space-y-4 mb-6">
        <img alt="Spit Hierarchy Logo" className="w-16 h-16 object-contain animate-glow-pulse" src="/lovable-uploads/8a42312a-e1dc-4889-ae2a-9eaed3baede1.png" />
        <div>
          <h1 className="font-ceviche text-primary bg-clip-text text-transparent text-7xl">
            ABOUT SPIT HIERARCHY
          </h1>
          <p className="text-rap-smoke font-merienda text-sm">The Culture's Voice</p>
        </div>
      </div>
      
      <p className="text-rap-platinum font-merienda text-lg max-w-2xl mx-auto leading-relaxed">
        Welcome to the ultimate destination for ranking and celebrating hip-hop's greatest lyricists. 
        Where the culture decides who truly deserves to be at the top of the game.
      </p>
    </div>;
};
export default AboutHero;