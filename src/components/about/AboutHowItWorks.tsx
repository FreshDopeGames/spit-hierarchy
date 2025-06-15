import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const AboutHowItWorks = () => {
  return <Card className="bg-carbon-fiber border-rap-gold/100 shadow-lg shadow-rap-gold/20 border-2">
      <CardHeader>
        <CardTitle className="text-rap-gold font-ceviche font-normal text-5xl">
          How It Works
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-r from-rap-gold to-rap-gold-light rounded-full w-8 h-8 flex items-center justify-center text-rap-carbon font-mogra shadow-lg px-[15px]">1</div>
            <div>
              <h3 className="font-mogra text-rap-silver">Browse Artists</h3>
              <p className="text-rap-platinum font-merienda">Explore our comprehensive database of rappers from all eras and regions.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-r from-rap-gold to-rap-gold-light rounded-full w-8 h-8 flex items-center justify-center text-rap-carbon font-mogra shadow-lg px-[15px]">2</div>
            <div>
              <h3 className="font-mogra text-rap-silver">Cast Your Vote</h3>
              <p className="text-rap-platinum font-merienda">Rate artists based on skills, impact, and your personal preference.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-r from-rap-gold to-rap-gold-light rounded-full w-8 h-8 flex items-center justify-center text-rap-carbon font-mogra shadow-lg px-[15px]">3</div>
            <div>
              <h3 className="font-mogra text-rap-silver">Watch Rankings</h3>
              <p className="text-rap-platinum font-merienda">See how your votes contribute to the live, community-driven rankings.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-r from-rap-gold to-rap-gold-light rounded-full w-8 h-8 flex items-center justify-center text-rap-carbon font-mogra shadow-lg px-[15px]">4</div>
            <div>
              <h3 className="font-mogra text-rap-silver">Join the Debate</h3>
              <p className="text-rap-platinum font-merienda">Engage with the community and defend your favorite artists.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default AboutHowItWorks;