import React from "react";
import InternalPageHeader from "@/components/InternalPageHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trophy, Users, BarChart3, Music, Vote } from "lucide-react";
const About = () => {
  return <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative">
      {/* Background overlay for future custom backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
      
      <div className="relative z-10">
        <InternalPageHeader title="About Spit Hierarchy" subtitle="Where Bars Meet Rankings" backLink="/" backText="Back to Home" />
        
        <div className="pt-20 max-w-4xl mx-auto p-6 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img alt="Spit Hierarchy Logo" className="w-16 h-16 object-contain animate-glow-pulse" src="/lovable-uploads/8a42312a-e1dc-4889-ae2a-9eaed3baede1.png" />
              <div>
                <h1 className="font-ceviche bg-gradient-to-r from-rap-gold to-rap-silver bg-clip-text text-transparent animate-text-glow text-8xl">
                  Spit Hierarchy
                </h1>
                <p className="text-rap-smoke font-kaushan text-sm">The Culture's Voice</p>
              </div>
            </div>
            
            <p className="text-rap-platinum font-kaushan text-lg max-w-2xl mx-auto leading-relaxed">
              Welcome to the ultimate destination for ranking and celebrating hip-hop's greatest lyricists. 
              Where the culture decides who truly deserves to be at the top of the game.
            </p>
          </div>

          {/* What We Do */}
          <Card className="bg-carbon-fiber border-rap-gold/30 shadow-lg shadow-rap-gold/20">
            <CardHeader>
              <CardTitle className="text-rap-gold font-ceviche flex items-center text-5xl font-normal">
                <Music className="w-6 h-6 mr-3 text-rap-gold" />
                What We Do
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-rap-platinum font-kaushan">
                Spit Hierarchy is a community-driven platform where hip-hop fans vote, rank, and debate 
                the greatest rappers of all time. We're not just another ranking site – we're the voice 
                of the culture, powered by real fans who live and breathe hip-hop.
              </p>
              <p className="text-rap-platinum font-kaushan">
                From underground legends to mainstream superstars, every MC gets their due respect. 
                Our rankings reflect what the streets are saying, what the clubs are playing, 
                and what the culture is feeling.
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-carbon-fiber border-rap-burgundy/30 shadow-lg shadow-rap-burgundy/20">
              <CardHeader>
                <CardTitle className="text-rap-silver font-mogra flex items-center">
                  <Vote className="w-5 h-5 mr-3 text-rap-burgundy" />
                  Vote & Rank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-rap-platinum font-kaushan">
                  Cast your vote for your favorite MCs across different categories. 
                  Rate their lyrical ability, flow, impact, and overall contribution to the culture.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-carbon-fiber border-rap-forest/30 shadow-lg shadow-rap-forest/20">
              <CardHeader>
                <CardTitle className="text-rap-silver font-mogra flex items-center">
                  <Trophy className="w-5 h-5 mr-3 text-rap-forest" />
                  Real Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-rap-platinum font-kaushan">
                  See live rankings that change based on community votes. 
                  Watch as new artists climb the charts and legends defend their positions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-carbon-fiber border-rap-gold/30 shadow-lg shadow-rap-gold/20">
              <CardHeader>
                <CardTitle className="text-rap-silver font-mogra flex items-center">
                  <Users className="w-5 h-5 mr-3 text-rap-gold" />
                  Community Driven
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-rap-platinum font-kaushan">
                  Join a community of true hip-hop heads. Share your opinions, 
                  debate the rankings, and connect with fans who share your passion.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-carbon-fiber border-rap-silver/30 shadow-lg shadow-rap-silver/20">
              <CardHeader>
                <CardTitle className="text-rap-silver font-mogra flex items-center">
                  <BarChart3 className="w-5 h-5 mr-3 text-rap-silver" />
                  Deep Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-rap-platinum font-kaushan">
                  Dive deep into the data with comprehensive analytics. 
                  Track voting trends, see regional preferences, and discover emerging artists.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="bg-carbon-fiber border-rap-gold/30 shadow-lg shadow-rap-gold/20">
            <CardHeader>
              <CardTitle className="text-rap-gold font-ceviche font-normal text-5xl">
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-rap-burgundy to-rap-forest rounded-full w-8 h-8 flex items-center justify-center text-rap-silver font-mogra shadow-lg">1</div>
                  <div>
                    <h3 className="font-mogra text-rap-silver">Browse Artists</h3>
                    <p className="text-rap-platinum font-kaushan">Explore our comprehensive database of rappers from all eras and regions.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-rap-burgundy to-rap-forest rounded-full w-8 h-8 flex items-center justify-center text-rap-silver font-mogra shadow-lg">2</div>
                  <div>
                    <h3 className="font-mogra text-rap-silver">Cast Your Vote</h3>
                    <p className="text-rap-platinum font-kaushan">Rate artists based on skills, impact, and your personal preference.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-rap-burgundy to-rap-forest rounded-full w-8 h-8 flex items-center justify-center text-rap-silver font-mogra shadow-lg">3</div>
                  <div>
                    <h3 className="font-mogra text-rap-silver">Watch Rankings</h3>
                    <p className="text-rap-platinum font-kaushan">See how your votes contribute to the live, community-driven rankings.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-rap-burgundy to-rap-forest rounded-full w-8 h-8 flex items-center justify-center text-rap-silver font-mogra shadow-lg">4</div>
                  <div>
                    <h3 className="font-mogra text-rap-silver">Join the Debate</h3>
                    <p className="text-rap-platinum font-kaushan">Engage with the community and defend your favorite artists.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center space-y-6 py-8">
            <h2 className="font-ceviche text-rap-gold text-3xl animate-text-glow">Ready to Join the Culture?</h2>
            <p className="text-rap-platinum font-kaushan max-w-2xl mx-auto">
              Whether you're a day-one fan or new to the game, your voice matters. 
              Help us build the definitive ranking of hip-hop's greatest artists.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-rap-burgundy to-rap-forest hover:from-rap-burgundy-light hover:to-rap-forest-light font-mogra text-rap-silver px-8 py-3 shadow-lg shadow-rap-burgundy/30 border border-rap-gold/20">
                  Join the Hierarchy
                </Button>
              </Link>
              <Link to="/all-rappers">
                <Button variant="outline" className="border-rap-gold/50 text-rap-gold hover:bg-rap-gold/10 hover:border-rap-gold font-kaushan px-8 py-3 shadow-lg shadow-rap-gold/20">
                  Browse Artists
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>;
};
export default About;