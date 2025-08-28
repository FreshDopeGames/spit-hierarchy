
import React from "react";
import { ThemedButton } from "@/components/ui/themed-button";
import { Link } from "react-router-dom";

const AboutCallToAction = () => {
  return (
    <div className="text-center space-y-6 py-8">
      <h2 className="font-[var(--theme-font-heading)] text-[var(--theme-primary)] text-3xl animate-text-glow">Ready to Join the Culture?</h2>
      <p className="text-[var(--theme-text)] font-[var(--theme-font-body)] max-w-2xl mx-auto">
        Whether you're a day-one fan or new to the game, your voice matters. 
        Help us build the definitive ranking of hip-hop's greatest artists.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/auth">
          <ThemedButton variant="default" size="lg" className="px-8 py-3 shadow-lg text-xl font-extrabold">
            Start Voting!
          </ThemedButton>
        </Link>
        <Link to="/all-rappers">
          <ThemedButton variant="outline" size="lg" className="px-8 py-3 shadow-lg text-xl font-extrabold">
            Browse Artists
          </ThemedButton>
        </Link>
      </div>
    </div>
  );
};

export default AboutCallToAction;
