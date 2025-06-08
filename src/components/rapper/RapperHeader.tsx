
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Calendar, Verified, Music, Instagram, Twitter } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { getZodiacSign, formatBirthdate } from "@/utils/zodiacUtils";

type Rapper = Tables<"rappers">;

interface RapperHeaderProps {
  rapper: Rapper;
  onVoteClick: () => void;
}

const RapperHeader = ({ rapper, onVoteClick }: RapperHeaderProps) => {
  const zodiacSign = getZodiacSign(rapper.birth_month, rapper.birth_day);
  const birthdate = formatBirthdate(rapper.birth_year, rapper.birth_month, rapper.birth_day);

  return (
    <Card className="bg-carbon-fiber border-rap-burgundy/40 mb-8 relative overflow-hidden">
      {/* Rap culture accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rap-burgundy via-rap-forest to-rap-silver"></div>
      
      <CardContent className="p-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Rapper Image */}
          <div className="md:col-span-1">
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-rap-burgundy to-rap-forest flex items-center justify-center">
              {rapper.image_url ? (
                <img 
                  src={rapper.image_url} 
                  alt={rapper.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music className="w-24 h-24 text-rap-platinum/70" />
              )}
            </div>
          </div>

          {/* Rapper Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-rap-platinum font-mogra">{rapper.name}</h1>
                  {rapper.verified && (
                    <Verified className="w-6 h-6 text-rap-forest" />
                  )}
                </div>
                {rapper.real_name && (
                  <p className="text-rap-smoke text-lg font-kaushan">{rapper.real_name}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-gradient-to-r from-rap-burgundy/30 to-rap-forest/30 px-4 py-2 rounded-lg border border-rap-silver/20">
                <Star className="w-5 h-5 text-rap-gold" />
                <span className="text-rap-platinum font-semibold font-ceviche">
                  {rapper.average_rating ? Number(rapper.average_rating).toFixed(1) : "—"}
                </span>
              </div>
              <Badge variant="secondary" className="bg-rap-forest/20 text-rap-platinum border-rap-forest/30 px-4 py-2 font-kaushan">
                {rapper.total_votes || 0} votes
              </Badge>
              {zodiacSign && (
                <Badge variant="secondary" className="bg-rap-burgundy/20 text-rap-platinum border-rap-burgundy/30 px-4 py-2 font-kaushan">
                  {zodiacSign}
                </Badge>
              )}
            </div>

            {/* Location, Birth Info & Zodiac */}
            <div className="flex flex-wrap gap-4 text-rap-smoke font-kaushan">
              {rapper.origin && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{rapper.origin}</span>
                </div>
              )}
              {birthdate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{birthdate}</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3">
              {rapper.instagram_handle && (
                <Button variant="outline" size="sm" className="border-rap-burgundy/30 text-rap-burgundy hover:bg-rap-burgundy/20 font-kaushan">
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </Button>
              )}
              {rapper.twitter_handle && (
                <Button variant="outline" size="sm" className="border-rap-burgundy/30 text-rap-burgundy hover:bg-rap-burgundy/20 font-kaushan">
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
              )}
              {rapper.spotify_id && (
                <Button variant="outline" size="sm" className="border-rap-burgundy/30 text-rap-burgundy hover:bg-rap-burgundy/20 font-kaushan">
                  <Music className="w-4 h-4 mr-2" />
                  Spotify
                </Button>
              )}
            </div>

            {/* Vote Button */}
            <Button
              onClick={onVoteClick}
              className="bg-gradient-to-r from-rap-burgundy to-rap-forest hover:from-rap-burgundy-light hover:to-rap-forest-light text-rap-platinum font-mogra shadow-lg shadow-rap-burgundy/30"
              size="lg"
            >
              Vote & Rate This Rapper
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RapperHeader;
