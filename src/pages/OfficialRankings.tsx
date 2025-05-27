
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import RankingHeader from "@/components/rankings/RankingHeader";
import RankingCard from "@/components/rankings/RankingCard";
import RankingDetailView from "@/components/rankings/RankingDetailView";

// Mock data for official rankings (expanded list)
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
  },
  {
    id: "official-3",
    title: "Greatest Lyricists of All Time",
    description: "Ranking the most skilled wordsmiths in hip-hop history based on wordplay, metaphors, and storytelling ability.",
    author: "Editorial Team",
    authorId: "admin",
    createdAt: "2024-01-10",
    timeAgo: "2 weeks ago",
    rappers: [
      { rank: 1, name: "MF DOOM", reason: "Unmatched wordplay complexity" },
      { rank: 2, name: "Kendrick Lamar", reason: "Modern poetry master" },
      { rank: 3, name: "Black Thought", reason: "Consistent lyrical excellence" },
      { rank: 4, name: "Andre 3000", reason: "Creative linguistic genius" },
      { rank: 5, name: "Lupe Fiasco", reason: "Multi-layered storytelling" },
    ],
    likes: 623,
    comments: 156,
    views: 3420,
    isPublic: true,
    isOfficial: true,
    tags: ["Official", "Lyricism", "Wordplay"]
  },
  {
    id: "official-4",
    title: "Most Influential Hip-Hop Albums",
    description: "Albums that changed the course of hip-hop history and influenced generations of artists.",
    author: "Music History Team",
    authorId: "admin",
    createdAt: "2024-01-12",
    timeAgo: "1 week ago",
    rappers: [
      { rank: 1, name: "Nas", reason: "Illmatic - Genre-defining masterpiece" },
      { rank: 2, name: "Dr. Dre", reason: "The Chronic - West Coast blueprint" },
      { rank: 3, name: "Wu-Tang Clan", reason: "Enter the Wu-Tang - Raw innovation" },
      { rank: 4, name: "Public Enemy", reason: "It Takes a Nation - Political awakening" },
      { rank: 5, name: "OutKast", reason: "ATLiens - Southern hip-hop revolution" },
    ],
    likes: 789,
    comments: 201,
    views: 4560,
    isPublic: true,
    isOfficial: true,
    tags: ["Official", "Albums", "Influence"]
  }
];

const OfficialRankings = () => {
  const [selectedRanking, setSelectedRanking] = useState<string | null>(null);

  const selectedRankingData = officialRankings.find(r => r.id === selectedRanking);

  if (selectedRanking && selectedRankingData) {
    return (
      <RankingDetailView 
        ranking={selectedRankingData}
        onBack={() => setSelectedRanking(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/40 border-b border-purple-500/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/rankings">
            <Button variant="ghost" className="text-purple-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Rankings
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <RankingHeader 
          title="Official Rankings"
          description="Curated rankings created by our expert editorial team, featuring the most comprehensive and authoritative lists in hip-hop."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {officialRankings.map((ranking) => (
            <RankingCard
              key={ranking.id}
              {...ranking}
              onClick={setSelectedRanking}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default OfficialRankings;
