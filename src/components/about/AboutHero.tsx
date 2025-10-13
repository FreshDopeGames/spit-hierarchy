
import React from "react";

const AboutHero = () => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl sm:text-6xl font-ceviche text-[hsl(var(--theme-primary))] mb-4">
        About Spit Hierarchy
      </h1>
      <p className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-sm mb-6">
        The Culture's Voice
      </p>
      <p className="text-[var(--theme-text)] font-[var(--theme-font-body)] text-lg max-w-2xl mx-auto leading-relaxed">
        Welcome to the ultimate destination for ranking and celebrating hip-hop's greatest lyricists. 
        Where the culture decides who truly deserves to be at the top of the game.
      </p>
    </div>
  );
};

export default AboutHero;
