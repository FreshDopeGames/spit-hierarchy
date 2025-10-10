import { useState } from "react";
import { useVSMatches } from "@/hooks/useVSMatches";
import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Swords, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import InternalPageHeader from "@/components/InternalPageHeader";
import RapperAvatar from "@/components/RapperAvatar";

const VSMatches = () => {
  const {
    data: vsMatches,
    isLoading
  } = useVSMatches();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filteredAndSortedMatches = vsMatches?.filter(match => match.title.toLowerCase().includes(searchTerm.toLowerCase()) || match.rapper_1.name.toLowerCase().includes(searchTerm.toLowerCase()) || match.rapper_2.name.toLowerCase().includes(searchTerm.toLowerCase()))?.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "most-votes":
        return b.total_votes - a.total_votes;
      default:
        return 0;
    }
  });

  return (
    <>
      <SEOHead title="VS Matches - Rap Battle Matchups" description="Discover head-to-head rapper matchups and vote for your favorites. Compare legends, rising stars, and iconic artists in epic VS battles." canonicalUrl="/vs" />
      
      <HeaderNavigation isScrolled={false} />
      
      <div className="max-w-7xl mx-auto pt-20 px-4 pb-12">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl md:text-8xl font-ceviche text-rap-gold mb-4 lg:text-6xl text-primary ">
            VS
          </h1>
          <p className="text-lg text-rap-platinum font-merienda max-w-3xl mx-auto">
            Who ya got??
          </p>
        </div>

        <main className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rap-smoke w-4 h-4" />
              <Input placeholder="Search VS matches or rappers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-rap-charcoal border-rap-smoke/30 text-rap-platinum" />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 bg-rap-charcoal border-rap-smoke/30">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Newest First
                  </div>
                </SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="most-votes">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Most Votes
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* VS Matches Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({
            length: 6
          }).map((_, i) => <Card key={i} className="bg-rap-charcoal border-rap-burgundy/30">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 bg-rap-smoke/20" />
                    <Skeleton className="h-4 w-full bg-rap-smoke/20" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <Skeleton className="w-16 h-16 rounded-full bg-rap-smoke/20" />
                      <Skeleton className="w-8 h-8 bg-rap-smoke/20" />
                      <Skeleton className="w-16 h-16 rounded-full bg-rap-smoke/20" />
                    </div>
                    <Skeleton className="h-4 w-full bg-rap-smoke/20" />
                  </CardContent>
                </Card>)}
            </div>
          ) : filteredAndSortedMatches?.length === 0 ? (
            <div className="text-center py-12">
              <Swords className="w-16 h-16 text-rap-smoke mx-auto mb-4" />
              <h3 className="text-xl font-bold text-rap-platinum mb-2">No VS matches found</h3>
              <p className="text-rap-smoke">
                {searchTerm ? "Try adjusting your search terms" : "Check back soon for epic matchups!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedMatches?.map(match => (
                <Link key={match.id} to={`/vs/${match.slug}`}>
                  <Card className="border-4 border-primary bg-gradient-to-br from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-primaryDark))] group-hover:border-[hsl(var(--theme-background))] transition-all duration-300 hover:shadow-lg group">
                    <CardHeader>
                      <h3 className="text-lg font-bold text-[hsl(var(--theme-textInverted))] group-hover:text-[hsl(var(--theme-background))] transition-colors">
                        {match.title}
                      </h3>
                      {match.description && <p className="text-sm text-[hsl(var(--theme-textInverted))]/80 line-clamp-2">
                          {match.description}
                        </p>}
                    </CardHeader>
                    <CardContent>
                      {/* Head-to-head display */}
                      <div className="flex items-center justify-center gap-3 sm:gap-6 mb-4">
                        <div className="flex flex-col items-center space-y-1.5 flex-1 min-w-0">
                          <RapperAvatar rapper={match.rapper_1} size="sm" variant="square" />
                          <span className="text-xs sm:text-sm font-semibold text-[hsl(var(--theme-textInverted))] text-center leading-tight px-1">
                            {match.rapper_1.name}
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-center px-1 sm:px-2 flex-shrink-0">
                          <Swords className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--theme-background)] mb-1 sm:mb-2" />
                          <Badge variant="outline" className="text-xs text-[hsl(var(--theme-textInverted))] border-[hsl(var(--theme-background))] px-1.5 py-0.5">
                            {match.total_votes}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col items-center space-y-1.5 flex-1 min-w-0">
                          <RapperAvatar rapper={match.rapper_2} size="sm" variant="square" />
                          <span className="text-xs sm:text-sm font-semibold text-[hsl(var(--theme-textInverted))] text-center leading-tight px-1">
                            {match.rapper_2.name}
                          </span>
                        </div>
                      </div>

                      {/* Vote distribution */}
                      {match.total_votes > 0 && <div className="w-full bg-[hsl(var(--theme-background))]/50 rounded-full h-2 mb-3">
                          <div className="bg-[hsl(var(--theme-background))] h-2 rounded-full transition-all duration-300" style={{
                    width: `${match.rapper_1_votes / match.total_votes * 100}%`
                  }} />
                        </div>}

                      <div className="text-xs text-[hsl(var(--theme-textInverted))]/70 text-center">
                        {new Date(match.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
      
      <Footer />
    </>
  );
};

export default VSMatches;
