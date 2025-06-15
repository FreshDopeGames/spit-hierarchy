import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music } from "lucide-react";
const AboutWhatWeDo = () => {
  return <Card className="bg-carbon-fiber border-rap-gold/100 shadow-lg shadow-rap-gold/20 border-2">
      <CardHeader>
        <CardTitle className="text-rap-gold font-ceviche flex items-center text-5xl font-normal">
          <Music className="w-6 h-6 mr-3 text-rap-gold" />
          What We Do
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-rap-platinum font-merienda">
          Spit Hierarchy is a community-driven platform where hip-hop fans vote, rank, and debate 
          the greatest rappers of all time. We're not just another ranking site – we're the voice 
          of the culture, powered by real fans who live and breathe hip-hop.
        </p>
        <p className="text-rap-platinum font-merienda">
          From underground legends to mainstream superstars, every MC gets their due respect. 
          Our rankings reflect what the streets are saying, what the clubs are playing, 
          and what the culture is feeling.
        </p>
      </CardContent>
    </Card>;
};
export default AboutWhatWeDo;