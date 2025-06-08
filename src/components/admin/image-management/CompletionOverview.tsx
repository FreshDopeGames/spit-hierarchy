
import { Card, CardContent } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";

type ImageStyle = Database["public"]["Enums"]["image_style"];

const styleLabels: Record<ImageStyle, string> = {
  photo_real: "Photo Real",
  comic_book: "Comic Book",
  anime: "Anime", 
  video_game: "Video Game",
  hardcore: "Hardcore",
  minimalist: "Minimalist",
  retro: "Retro"
};

interface CompletionOverviewProps {
  completionStats: Record<ImageStyle, number>;
}

const CompletionOverview = ({ completionStats }: CompletionOverviewProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
      {Object.entries(styleLabels).map(([style, label]) => (
        <Card key={style} className="bg-carbon-fiber border-rap-gold/30">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-rap-gold">{completionStats[style as ImageStyle] || 0}</div>
            <div className="text-xs text-rap-platinum font-kaushan">{label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CompletionOverview;
