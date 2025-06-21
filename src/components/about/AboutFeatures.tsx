
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, BarChart3, Vote } from "lucide-react";
const AboutFeatures = () => {
  return <div className="grid md:grid-cols-2 gap-6">
      <Card className="bg-rap-carbon border-rap-burgundy/100 shadow-lg shadow-rap-burgundy/20 border-2">
        <CardHeader>
          <CardTitle className="text-rap-silver font-ceviche flex items-center font-normal text-4xl">
            <Vote className="w-5 h-5 mr-3 text-rap-burgundy" />
            Vote & Rank
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-rap-platinum font-merienda">
            Cast your vote for your favorite MCs across different categories. 
            Rate their lyrical ability, flow, impact, and overall contribution to the culture.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-rap-carbon border-rap-forest/100 shadow-lg border-2 ">
        <CardHeader>
          <CardTitle className="text-rap-silver font-ceviche flex items-center font-normal text-4xl">
            <Trophy className="w-5 h-5 mr-3 text-rap-forest" />
            Real Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-rap-platinum font-merienda">
            See live rankings that change based on community votes. 
            Watch as new artists climb the charts and legends defend their positions.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-rap-carbon border-rap-gold/100 shadow-lg shadow-rap-gold/20 border-2 ">
        <CardHeader>
          <CardTitle className="font-ceviche flex items-center font-thin text-4xl text-rap-platinum">
            <Users className="w-5 h-5 mr-3 text-rap-gold" />
            Community Driven
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-rap-platinum font-merienda">
            Join a community of true hip-hop heads. Share your opinions, 
            debate the rankings, and connect with fans who share your passion.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-rap-carbon border-rap-silver/100 shadow-lg shadow-rap-silver/20 border-2">
        <CardHeader>
          <CardTitle className="font-ceviche flex items-center text-rap-platinum font-normal text-4xl">
            <BarChart3 className="w-5 h-5 mr-3 text-rap-silver" />
            Deep Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-rap-platinum font-merienda">
            Dive deep into the data with comprehensive analytics. 
            Track voting trends, see regional preferences, and discover emerging artists.
          </p>
        </CardContent>
      </Card>
    </div>;
};
export default AboutFeatures;
