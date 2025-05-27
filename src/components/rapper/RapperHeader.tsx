
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
    <Card className="bg-black/40 border-purple-500/20 mb-8">
      <CardContent className="p-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Rapper Image */}
          <div className="md:col-span-1">
            <div className="w-full aspect-square bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Music className="w-24 h-24 text-white/70" />
            </div>
          </div>

          {/* Rapper Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white">{rapper.name}</h1>
                  {rapper.verified && (
                    <Verified className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                {rapper.real_name && (
                  <p className="text-gray-300 text-lg">{rapper.real_name}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-purple-600/20 px-4 py-2 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-white font-semibold">
                  {rapper.average_rating ? Number(rapper.average_rating).toFixed(1) : "—"}
                </span>
              </div>
              <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 px-4 py-2">
                {rapper.total_votes || 0} votes
              </Badge>
              {zodiacSign && (
                <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 px-4 py-2">
                  {zodiacSign}
                </Badge>
              )}
            </div>

            {/* Location, Birth Info & Zodiac */}
            <div className="flex flex-wrap gap-4 text-gray-300">
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
                <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-300">
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </Button>
              )}
              {rapper.twitter_handle && (
                <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-300">
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
              )}
              {rapper.spotify_id && (
                <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-300">
                  <Music className="w-4 h-4 mr-2" />
                  Spotify
                </Button>
              )}
            </div>

            {/* Vote Button */}
            <Button
              onClick={onVoteClick}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
