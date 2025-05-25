import { useState } from "react";
import { Search, TrendingUp, Star, Users, Music, Award, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user, signOut } = useAuth();

  const categories = [
    { 
      name: "Storytelling", 
      icon: Music, 
      color: "bg-purple-500", 
      description: "Narrative mastery and lyrical depth" 
    },
    { 
      name: "Wordplay", 
      icon: Star, 
      color: "bg-blue-500", 
      description: "Entendre use and linguistic creativity" 
    },
    { 
      name: "Sonic Appeal", 
      icon: Award, 
      color: "bg-indigo-500", 
      description: "Flow, delivery, and musicality" 
    },
    { 
      name: "Commercial Success", 
      icon: TrendingUp, 
      color: "bg-yellow-500", 
      description: "Sales, streams, and market impact" 
    },
    { 
      name: "Technical Skill", 
      icon: Users, 
      color: "bg-green-500", 
      description: "Rhyme schemes and complexity" 
    },
    { 
      name: "Cultural Impact", 
      icon: Award, 
      color: "bg-red-500", 
      description: "Influence on hip-hop culture" 
    }
  ];

  const featuredArtists = [
    {
      name: "Kendrick Lamar",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      overallScore: 9.4,
      categories: {
        storytelling: 9.8,
        wordplay: 9.2,
        sonic: 9.1,
        commercial: 8.9,
        technical: 9.5,
        cultural: 9.7
      }
    },
    {
      name: "Nas",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
      overallScore: 9.3,
      categories: {
        storytelling: 9.7,
        wordplay: 9.4,
        sonic: 8.8,
        commercial: 8.5,
        technical: 9.2,
        cultural: 9.8
      }
    },
    {
      name: "Drake",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      overallScore: 8.9,
      categories: {
        storytelling: 8.2,
        wordplay: 7.8,
        sonic: 9.3,
        commercial: 9.8,
        technical: 8.1,
        cultural: 9.2
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-md border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Rap Rankings
              </h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">Rankings</a>
              <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">Artists</a>
              <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">Categories</a>
              <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">Community</a>
            </nav>
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-gray-300 text-sm">
                  Welcome, {user.email}
                </span>
              )}
              <Button 
                onClick={signOut}
                variant="outline" 
                size="sm"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-yellow-400 bg-clip-text text-transparent">
          Rank The Culture
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          The ultimate destination for ranking rap artists across storytelling, wordplay, sonic appeal, 
          commercial success, and cultural impact.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search artists, songs, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/50 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-400"
            />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-white mb-8 text-center">Ranking Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card key={index} className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold text-white">{category.name}</h4>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-center">{category.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Featured Artists */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold text-white">Top Ranked Artists</h3>
          <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
            View All Rankings
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredArtists.map((artist, index) => (
            <Card key={index} className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
              <div className="relative">
                <img 
                  src={artist.image} 
                  alt={artist.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    #{index + 1}
                  </Badge>
                </div>
                <div className="absolute bottom-4 right-4">
                  <div className="bg-black/80 rounded-lg px-3 py-1">
                    <span className="text-2xl font-bold text-yellow-400">{artist.overallScore}</span>
                    <span className="text-gray-300 text-sm ml-1">/10</span>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold text-white mb-4">{artist.name}</h4>
                
                <div className="space-y-2">
                  {Object.entries(artist.categories).map(([key, score]) => {
                    const categoryName = categories.find(c => 
                      c.name.toLowerCase().includes(key) || 
                      key.includes(c.name.toLowerCase().split(' ')[0])
                    )?.name || key;
                    
                    return (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm capitalize">{categoryName}</span>
                        <span className="text-purple-400 font-semibold">{score}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">1,200+</div>
            <div className="text-gray-300">Ranked Artists</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">50K+</div>
            <div className="text-gray-300">User Votes</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-yellow-400 mb-2">6</div>
            <div className="text-gray-300">Categories</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
            <div className="text-gray-300">Updated Rankings</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 border-t border-purple-500/20 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Rap Rankings
            </span>
          </div>
          <p className="text-gray-400">© 2024 Rap Rankings. Keeping the culture honest.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
