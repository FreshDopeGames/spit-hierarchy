import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import UserRankingDetail from "@/pages/UserRankingDetail";

const UserRankingRedirect = () => {
  const { slug } = useParams();
  const [actualSlug, setActualSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const checkAndGetSlug = async () => {
      if (!slug) {
        setIsLoading(false);
        setNotFound(true);
        return;
      }

      // Check if the slug is a UUID (old format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(slug)) {
        // This is an old UUID-based URL, look up the ranking to get the slug
        try {
          const { data, error } = await supabase
            .from("user_rankings")
            .select("slug")
            .eq("id", slug)
            .maybeSingle();

          if (!error && data?.slug) {
            // Redirect to the new slug-based URL by replacing the browser history
            window.history.replaceState(null, '', `/rankings/community-rankings/${data.slug}`);
            setActualSlug(data.slug);
          } else {
            setNotFound(true);
          }
        } catch (error) {
          console.error("Error looking up ranking:", error);
          setNotFound(true);
        }
      } else {
        // This is already a slug-based URL, use it directly
        setActualSlug(slug);
      }
      
      setIsLoading(false);
    };

    checkAndGetSlug();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center">
        <div className="text-rap-gold font-mogra text-xl">Loading...</div>
      </div>
    );
  }

  if (notFound || !actualSlug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center">
        <div className="text-rap-gold font-mogra text-xl">Ranking not found</div>
      </div>
    );
  }

  // Render the actual UserRankingDetail component with the correct slug
  return <UserRankingDetail overrideSlug={actualSlug} />;
};

export default UserRankingRedirect;