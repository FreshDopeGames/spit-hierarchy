
import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Crown, Star, Trophy, Eye, Users, Lock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import HeaderNavigation from "@/components/HeaderNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const { user } = useAuth();
  const [ranking, setRanking] = useState<UserRankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchUserRanking();
    }
  }, [slug, user]);

  const fetchUserRanking = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
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
        .single();

      if (fetchError) {
        console.error("Error fetching user ranking:", fetchError);
        
        if (fetchError.code === 'PGRST116') {
          setError("Ranking not found or you don't have permission to view it.");
        } else {
          setError("Failed to load ranking. Please try again later.");
        }
        return;
      }

      if (!data) {
        setError("Ranking not found.");
        return;
      }

      // Check if user can access this ranking
      if (!data.is_public && (!user || user.id !== data.user_id)) {
        setError("This ranking is private and you don't have permission to view it.");
        return;
      }

      setRanking(data);
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred. Please try again later.");
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
        <HeaderNavigation isScrolled={false} />
        <div className="max-w-4xl mx-auto pt-20 px-4">
          <div className="mb-8">
            <Link to="/rankings" className="flex items-center space-x-2 text-rap-gold hover:text-rap-gold-light transition-colors font-kaushan">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Rankings</span>
            </Link>
          </div>
          
          <Alert className="bg-red-900/20 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200 font-merienda">
              {error}
            </AlertDescription>
          </Alert>

          {error.includes("permission") && !user && (
            <div className="mt-6 text-center">
              <p className="text-rap-smoke font-merienda mb-4">
                This content may require you to be logged in.
              </p>
              <Link 
                to="/auth" 
                className="text-rap-gold hover:text-rap-gold-light font-kaushan underline"
              >
                Sign in to continue
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!ranking) {
    return <Navigate to="/rankings" replace />;
  }

  const sortedItems = ranking.user_ranking_items.sort((a, b) => a.position - b.position);
  const isOwner = user && user.id === ranking.user_id;

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
              <Badge variant="secondary" className="bg-rap-burgundy/20 text-rap-burgundy border-rap-burgundy/30 font-kaushan">
                <Users className="w-3 h-3 mr-1" />
                Community
              </Badge>
              {!ranking.is_public && (
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-kaushan">
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </Badge>
              )}
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
                  by <span className="text-rap-gold">{ranking.profiles?.username || "Unknown User"}</span>
                  {isOwner && <span className="text-rap-smoke ml-2">(You)</span>}
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
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-rap-burgundy-dark via-rap-burgundy to-rap-burgundy-light shadow-lg">
                    <span className="text-white font-mogra text-lg font-bold">
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
