import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Trophy, Star, Users, Calendar, Edit, Trash2, Eye, Award } from "lucide-react";
import CommentBubble from "@/components/CommentBubble";
import VoteButton from "@/components/VoteButton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

// Mock data for official rankings
const officialRankings = [
  {
    id: "official-1",
    title: "Hip-Hop Hall of Fame: The Greatest Ever",
    description: "Our definitive ranking of the most influential rappers in hip-hop history.",
    author: "Admin Team",
    authorId: "admin",
    createdAt: "2024-01-01",
    timeAgo: "1 month ago",
    rappers: [
      { rank: 1, name: "Nas", reason: "Illmatic changed everything" },
      { rank: 2, name: "Jay-Z", reason: "Blueprint for success" },
      { rank: 3, name: "The Notorious B.I.G.", reason: "Storytelling legend" },
      { rank: 4, name: "Tupac Shakur", reason: "Voice of a generation" },
      { rank: 5, name: "Eminem", reason: "Technical virtuoso" },
    ],
    likes: 892,
    comments: 234,
    views: 5240,
    isPublic: true,
    isOfficial: true,
    tags: ["Official", "GOAT", "Hall of Fame"]
  },
  {
    id: "official-2",
    title: "Best New Artists 2024",
    description: "Rising stars making waves in the hip-hop scene this year, curated by our music experts.",
    author: "Content Team",
    authorId: "admin",
    createdAt: "2024-01-05",
    timeAgo: "3 weeks ago",
    rappers: [
      { rank: 1, name: "Doechii", reason: "Breakthrough versatility" },
      { rank: 2, name: "Lil Yachty", reason: "Artistic evolution" },
      { rank: 3, name: "Ice Spice", reason: "Cultural impact" },
      { rank: 4, name: "Central Cee", reason: "Global crossover appeal" },
      { rank: 5, name: "Sexyy Red", reason: "Authentic street energy" },
    ],
    likes: 445,
    comments: 89,
    views: 2890,
    isPublic: true,
    isOfficial: true,
    tags: ["Official", "2024", "Rising Stars"]
  }
];

// Mock data for user-generated rankings
const userRankings = [
  {
    id: "1",
    title: "Top 10 G.O.A.T. Rappers of All Time",
    description: "My personal ranking of the greatest rappers ever, based on lyricism, influence, and cultural impact.",
    author: "HipHopHead92",
    authorId: "user1",
    createdAt: "2024-01-15",
    timeAgo: "3 days ago",
    rappers: [
      { rank: 1, name: "Nas", reason: "Illmatic alone secures his spot" },
      { rank: 2, name: "Jay-Z", reason: "Business acumen and longevity" },
      { rank: 3, name: "Biggie", reason: "Storytelling master" },
      { rank: 4, name: "Tupac", reason: "Raw emotion and social consciousness" },
      { rank: 5, name: "Eminem", reason: "Technical skill and wordplay" },
    ],
    likes: 247,
    comments: 89,
    views: 1240,
    isPublic: true,
    isOfficial: false,
    tags: ["GOAT", "Classic Hip-Hop", "All-Time"]
  },
  {
    id: "2",
    title: "Best New School Rappers (2020-2024)",
    description: "Rising stars who are shaping the future of hip-hop right now.",
    author: "NextGenMusic",
    authorId: "user2",
    createdAt: "2024-01-10",
    timeAgo: "1 week ago",
    rappers: [
      { rank: 1, name: "Baby Keem", reason: "Innovative sound and production" },
      { rank: 2, name: "JID", reason: "Incredible flow and technical ability" },
      { rank: 3, name: "Denzel Curry", reason: "Versatility and energy" },
      { rank: 4, name: "Vince Staples", reason: "Unique perspective and delivery" },
      { rank: 5, name: "Earl Sweatshirt", reason: "Artistic evolution and depth" },
    ],
    likes: 156,
    comments: 34,
    views: 890,
    isPublic: true,
    isOfficial: false,
    tags: ["New School", "2020s", "Rising Stars"]
  },
  {
    id: "3",
    title: "Best Lyricists in Hip-Hop",
    description: "Ranking rappers purely on their lyrical ability and wordplay.",
    author: "WordplayWizard",
    authorId: "user3",
    createdAt: "2024-01-08",
    timeAgo: "1 week ago",
    rappers: [
      { rank: 1, name: "MF DOOM", reason: "Complex wordplay and metaphors" },
      { rank: 2, name: "Kendrick Lamar", reason: "Storytelling and social commentary" },
      { rank: 3, name: "Black Thought", reason: "Consistent excellence" },
      { rank: 4, name: "Andre 3000", reason: "Creative and unpredictable" },
      { rank: 5, name: "Lupe Fiasco", reason: "Double entendres and complexity" },
    ],
    likes: 203,
    comments: 67,
    views: 1150,
    isPublic: true,
    isOfficial: false,
    tags: ["Lyricism", "Wordplay", "Technical"]
  }
];

const Rankings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRanking, setSelectedRanking] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "my-rankings" | "popular">("all");

  // Combine all rankings for selection
  const allRankings = [...officialRankings, ...userRankings];
  const selectedRankingData = allRankings.find(r => r.id === selectedRanking);

  const filteredUserRankings = userRankings.filter(ranking => {
    if (filter === "my-rankings") return user && ranking.authorId === user.id;
    if (filter === "popular") return ranking.likes > 200;
    return true;
  });

  const handleVote = (rapperName: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote for rappers.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Vote submitted!",
      description: `Your vote for ${rapperName} has been recorded.`,
    });
  };

  const handleVoteWithNote = (rapperName: string, note: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote for rappers.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Vote with note submitted!",
      description: `Your vote for ${rapperName} with note has been recorded.`,
    });
  };

  if (selectedRanking && selectedRankingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <header className="bg-black/40 border-b border-purple-500/20 p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setSelectedRanking(null)}
              className="text-purple-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Rankings
            </Button>
            
            <div className="flex items-center gap-2">
              {selectedRankingData.isOfficial && (
                <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300">
                  <Award className="w-3 h-3 mr-1" />
                  Official
                </Badge>
              )}
              <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                <Eye className="w-3 h-3 mr-1" />
                {selectedRankingData.views}
              </Badge>
              <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                <Star className="w-3 h-3 mr-1" />
                {selectedRankingData.likes}
              </Badge>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6">
          {/* Ranking Header */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedRankingData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-purple-600/20 text-purple-300">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {selectedRankingData.title}
            </h1>
            
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              {selectedRankingData.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>by {selectedRankingData.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{selectedRankingData.timeAgo}</span>
              </div>
            </div>
          </div>

          {/* Ranking List */}
          <Card className="bg-black/40 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                The Rankings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedRankingData.rappers.map((rapper) => (
                <div 
                  key={rapper.rank}
                  className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">#{rapper.rank}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{rapper.name}</h3>
                    <p className="text-gray-300">{rapper.reason}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <VoteButton
                      onVote={() => handleVote(rapper.name)}
                      onVoteWithNote={(note) => handleVoteWithNote(rapper.name, note)}
                      disabled={!user}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-300 hover:text-white"
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </main>

        {/* Comment Bubble */}
        <CommentBubble contentType="ranking" contentId={selectedRanking} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/40 border-b border-purple-500/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" className="text-purple-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          {user && (
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Ranking
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Rankings & Lists
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover community-created rapper rankings, or create your own custom lists to share your opinions with the hip-hop community.
          </p>
        </div>

        {/* Official Rankings Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-yellow-500" />
            <h2 className="text-3xl font-bold text-white">Official Rankings</h2>
            <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300">
              Curated Topics
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {officialRankings.map((ranking) => (
              <Card key={ranking.id} className="bg-black/40 border-yellow-500/30 hover:border-yellow-400/50 transition-colors group cursor-pointer">
                <CardContent className="p-6" onClick={() => setSelectedRanking(ranking.id)}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-300 text-xs">
                      <Award className="w-3 h-3 mr-1" />
                      Official
                    </Badge>
                    {ranking.tags.filter(tag => tag !== "Official").map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-purple-600/20 text-purple-300 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                    {ranking.title}
                  </h2>
                  
                  <p className="text-gray-300 mb-4 line-clamp-2">
                    {ranking.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {ranking.rappers.slice(0, 3).map((rapper) => (
                      <div key={rapper.rank} className="flex items-center gap-2 text-sm">
                        <span className="text-yellow-400 font-semibold">#{rapper.rank}</span>
                        <span className="text-white">{rapper.name}</span>
                      </div>
                    ))}
                    {ranking.rappers.length > 3 && (
                      <div className="text-gray-400 text-sm">
                        +{ranking.rappers.length - 3} more...
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-gray-400 text-sm border-t border-gray-700 pt-4">
                    <div className="flex items-center gap-4">
                      <span>by {ranking.author}</span>
                      <span>{ranking.timeAgo}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{ranking.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{ranking.likes}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Member Made Rankings Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-400" />
              <h2 className="text-3xl font-bold text-white">Member Made Rankings</h2>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-4">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                size="sm"
                className={filter === "all" 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600" 
                  : "border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                }
              >
                All
              </Button>
              <Button
                variant={filter === "popular" ? "default" : "outline"}
                onClick={() => setFilter("popular")}
                size="sm"
                className={filter === "popular" 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600" 
                  : "border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                }
              >
                <Star className="w-4 h-4 mr-2" />
                Popular
              </Button>
              {user && (
                <Button
                  variant={filter === "my-rankings" ? "default" : "outline"}
                  onClick={() => setFilter("my-rankings")}
                  size="sm"
                  className={filter === "my-rankings" 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600" 
                    : "border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                  }
                >
                  Mine
                </Button>
              )}
            </div>
          </div>

          {/* User Rankings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredUserRankings.map((ranking) => (
              <Card key={ranking.id} className="bg-black/40 border-purple-500/20 hover:border-purple-400/40 transition-colors group cursor-pointer">
                <CardContent className="p-6" onClick={() => setSelectedRanking(ranking.id)}>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {ranking.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-purple-600/20 text-purple-300 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {ranking.title}
                  </h2>
                  
                  <p className="text-gray-300 mb-4 line-clamp-2">
                    {ranking.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {ranking.rappers.slice(0, 3).map((rapper) => (
                      <div key={rapper.rank} className="flex items-center gap-2 text-sm">
                        <span className="text-purple-400 font-semibold">#{rapper.rank}</span>
                        <span className="text-white">{rapper.name}</span>
                      </div>
                    ))}
                    {ranking.rappers.length > 3 && (
                      <div className="text-gray-400 text-sm">
                        +{ranking.rappers.length - 3} more...
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-gray-400 text-sm border-t border-gray-700 pt-4">
                    <div className="flex items-center gap-4">
                      <span>by {ranking.author}</span>
                      <span>{ranking.timeAgo}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{ranking.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{ranking.likes}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredUserRankings.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {filter === "my-rankings" ? "No rankings created yet" : "No rankings found"}
              </h3>
              <p className="text-gray-400 mb-6">
                {filter === "my-rankings" 
                  ? "Create your first ranking to share your opinions with the community."
                  : "Be the first to create a ranking for this category."
                }
              </p>
              {user && (
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Ranking
                </Button>
              )}
            </div>
          )}
        </div>

        {!user && (
          <Card className="bg-black/40 border-purple-500/20 mt-8">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Join the Community</h3>
              <p className="text-gray-400 mb-6">
                Sign up to create your own rapper rankings and engage with other hip-hop fans.
              </p>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Sign Up Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Rankings;
