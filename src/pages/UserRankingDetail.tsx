
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Crown, Star, Trophy, Eye, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import HeaderNavigation from "@/components/HeaderNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RapperCard from "@/components/RapperCard";

interface UserRankingData {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  is_public: boolean;
  user_id: string;
  profiles: {
    username: string;
  } | null;
  user_ranking_items: Array<{
    position: number;
    reason: string | null;
    rapper: {
      id: string;
      name: string;
      real_name: string | null;
      origin: string | null;
    };
  }>;
}

const UserRankingDetail = () => {
  const { slug } = useParams();
  const [ranking, setRanking] = useState<UserRankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchUserRanking();
    }
  }, [slug]);

  const fetchUserRanking = async () => {
    try {
      const { data, error } = await supabase
        .from("user_rankings")
        .select(`
          id,
          title,
          description,
          category,
          created_at,
          is_public,
          user_id,
          profiles!inner(username),
          user_ranking_items!inner(
            position,
            reason,
            rapper:rappers!inner(
              id,
              name,
              real_name,
              origin
            )
          )
        `)
        .eq("slug", slug)
        .eq("is_public", true)
        .single();

      if (error) {
        console.error("Error fetching user ranking:", error);
        setNotFound(true);
        return;
      }

      setRanking(data);
    } catch (error) {
      console.error("Error:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center">
        <div className="text-rap-gold font-mogra text-xl">Loading ranking...</div>
      </div>
    );
  }

  if (notFound || !ranking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
        <HeaderNavigation isScrolled={false} />
        <div className="max-w-4xl mx-auto pt-20 px-4">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-rap-platinum mb-4 font-mogra">Ranking Not Found</h1>
            <p className="text-rap-smoke mb-6 font-kaushan">This ranking doesn't exist or is private.</p>
            <Link to="/rankings" className="text-rap-gold hover:text-rap-gold-light font-kaushan">
              ← Back to Rankings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sortedItems = ranking.user_ranking_items.sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <HeaderNavigation isScrolled={false} />
      
      <div className="max-w-6xl mx-auto pt-20 px-4">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link to="/rankings" className="flex items-center space-x-2 text-rap-gold hover:text-rap-gold-light transition-colors font-kaushan">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Rankings</span>
          </Link>
        </div>

        {/* Ranking Header */}
        <Card className="bg-carbon-fiber border-rap-burgundy/40 mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-rap-burgundy/20 text-rap-platinum border-rap-burgundy/30 font-kaushan">
                <Users className="w-3 h-3 mr-1" />
                Community
              </Badge>
              <Badge variant="secondary" className="bg-rap-forest/20 text-rap-forest border-rap-forest/30 font-kaushan">
                {ranking.category}
              </Badge>
            </div>
            
            <h1 className="text-4xl font-bold text-rap-platinum mb-4 font-mogra">
              {ranking.title}
            </h1>
            
            {ranking.description && (
              <p className="text-rap-smoke text-lg mb-6 font-kaushan leading-relaxed">
                {ranking.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-rap-smoke border-t border-rap-smoke/20 pt-6">
              <div className="flex items-center gap-6">
                <span className="font-kaushan">
                  by <Link to={`/user/${ranking.user_id}`} className="text-rap-gold hover:text-rap-gold-light">{ranking.profiles?.username || "Unknown User"}</Link>
                </span>
                <span className="font-kaushan">
                  {new Date(ranking.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span className="font-kaushan">{Math.floor(Math.random() * 1000) + 100}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-rap-gold" />
                  <span className="font-kaushan">{Math.floor(Math.random() * 200) + 50}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ranking Items */}
        <div className="space-y-4 mb-8">
          {sortedItems.map((item) => (
            <Card key={item.rapper.id} className="bg-carbon-fiber border-rap-silver/30 hover:border-rap-gold/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-rap-gold-dark via-rap-gold to-rap-gold-light shadow-lg">
                    <span className="text-rap-carbon font-mogra text-lg font-bold">
                      {item.position}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <Link to={`/rapper/${item.rapper.id}`} className="text-xl font-bold text-rap-platinum hover:text-rap-gold transition-colors font-mogra">
                      {item.rapper.name}
                    </Link>
                    {item.rapper.real_name && (
                      <p className="text-rap-smoke font-kaushan">
                        {item.rapper.real_name}
                      </p>
                    )}
                    {item.rapper.origin && (
                      <p className="text-rap-smoke text-sm font-kaushan">
                        {item.rapper.origin}
                      </p>
                    )}
                    {item.reason && (
                      <p className="text-rap-smoke mt-2 font-kaushan italic">
                        "{item.reason}"
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserRankingDetail;
