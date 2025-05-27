
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, MapPin, Calendar, Verified, Music, Instagram, Twitter } from "lucide-react";
import VoteModal from "@/components/VoteModal";
import CommentBubble from "@/components/CommentBubble";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

const getZodiacSign = (month: number | null, day: number | null): string => {
  if (!month || !day) return '';
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries ♈';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus ♉';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini ♊';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer ♋';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo ♌';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo ♍';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra ♎';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio ♏';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius ♐';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn ♑';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius ♒';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces ♓';
  
  return '';
};

const formatBirthdate = (year: number | null, month: number | null, day: number | null): string => {
  if (!month || !day) return '';
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthName = monthNames[month - 1];
  const yearText = year ? `, ${year}` : '';
  
  return `${monthName} ${day}${yearText}`;
};

const RapperDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedCategory] = useState("overall");

  const { data: rapper, isLoading } = useQuery({
    queryKey: ["rapper", id],
    queryFn: async () => {
      if (!id) throw new Error("No rapper ID provided");
      
      const { data, error } = await supabase
        .from("rappers")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-32 mb-6"></div>
            <div className="h-96 bg-gray-700 rounded mb-6"></div>
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!rapper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto p-6">
          <Link to="/">
            <Button variant="outline" className="mb-6 border-purple-500/30 text-purple-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Card className="bg-black/40 border-purple-500/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Rapper Not Found</h2>
              <p className="text-gray-400">The rapper you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const zodiacSign = getZodiacSign(rapper.birth_month, rapper.birth_day);
  const birthdate = formatBirthdate(rapper.birth_year, rapper.birth_month, rapper.birth_day);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <Link to="/">
          <Button variant="outline" className="mb-6 border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Rapper Header */}
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
                  onClick={() => setShowVoteModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  Vote & Rate This Rapper
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio Section */}
        {rapper.bio && (
          <Card className="bg-black/40 border-purple-500/20 mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">About</h2>
              <p className="text-gray-300 leading-relaxed">{rapper.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Voting Stats & Analytics could go here in the future */}
        <Card className="bg-black/40 border-purple-500/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Community Stats</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {rapper.total_votes || 0}
                </div>
                <div className="text-gray-400">Total Votes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {rapper.average_rating ? Number(rapper.average_rating).toFixed(1) : "—"}
                </div>
                <div className="text-gray-400">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {rapper.verified ? "✓" : "—"}
                </div>
                <div className="text-gray-400">Verified Status</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vote Modal */}
      {showVoteModal && (
        <VoteModal
          rapper={rapper}
          isOpen={showVoteModal}
          onClose={() => setShowVoteModal(false)}
          selectedCategory={selectedCategory}
        />
      )}

      {/* Comment Bubble - Pinned to bottom */}
      <CommentBubble contentType="rapper" contentId={rapper.id} />
    </div>
  );
};

export default RapperDetail;
