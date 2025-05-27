
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import RankingHeader from "@/components/rankings/RankingHeader";
import OfficialRankingsSection from "@/components/rankings/OfficialRankingsSection";
import UserRankingsSection from "@/components/rankings/UserRankingsSection";
import RankingDetailView from "@/components/rankings/RankingDetailView";

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
  const [selectedRanking, setSelectedRanking] = useState<string | null>(null);

  // Combine all rankings for selection
  const allRankings = [...officialRankings, ...userRankings];
  const selectedRankingData = allRankings.find(r => r.id === selectedRanking);

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
        <RankingHeader 
          title="Rankings & Lists"
          description="Discover community-created rapper rankings, or create your own custom lists to share your opinions with the hip-hop community."
        />

        <OfficialRankingsSection 
          rankings={officialRankings}
          onRankingClick={setSelectedRanking}
        />

        <UserRankingsSection 
          rankings={userRankings}
          onRankingClick={setSelectedRanking}
        />
      </main>
    </div>
  );
};

export default Rankings;
