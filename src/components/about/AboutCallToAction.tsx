
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutCallToAction = () => {
  return (
    <div className="text-center space-y-6 py-8">
      <h2 className="font-ceviche text-rap-gold text-3xl animate-text-glow">Ready to Join the Culture?</h2>
      <p className="text-rap-platinum font-kaushan max-w-2xl mx-auto">
        Whether you're a day-one fan or new to the game, your voice matters. 
        Help us build the definitive ranking of hip-hop's greatest artists.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/auth">
          <Button className="font-kaushan px-8 py-3 shadow-lg border border-rap-gold text-rap-carbon text-xl font-extrabold bg-rap-gold">
            Start Voting!
          </Button>
        </Link>
        <Link to="/all-rappers">
          <Button variant="outline" className="border-rap-gold/50 text-rap-gold hover:bg-rap-gold/10 hover:border-rap-gold text-rap-carbon-light font-kaushan px-8 py-3 shadow-lg shadow-rap-gold/20 text-xl font-extrabold">
            Browse Artists
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AboutCallToAction;
