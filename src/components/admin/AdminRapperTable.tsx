
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Calendar, Verified, Music, Edit, Trash2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

interface AdminRapperTableProps {
  rappers: Rapper[];
  isLoading: boolean;
  onEdit: (rapper: Rapper) => void;
  onDelete: (id: string) => void;
}

const AdminRapperTable = ({ rappers, isLoading, onEdit, onDelete }: AdminRapperTableProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-rap-carbon-light border-rap-gold/20 animate-pulse">
            <CardContent className="p-4">
              <div className="h-32 bg-rap-charcoal rounded mb-3"></div>
              <div className="h-4 bg-rap-charcoal rounded mb-2"></div>
              <div className="h-3 bg-rap-charcoal rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (rappers.length === 0) {
    return (
      <Card className="bg-rap-carbon-light border-rap-gold/20">
        <CardContent className="p-8 text-center">
          <Music className="w-16 h-16 text-rap-gold mx-auto mb-4" />
          <h3 className="text-xl font-bold text-rap-platinum mb-2">No Rappers Yet</h3>
          <p className="text-rap-smoke">Add your first rapper to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rappers.map((rapper) => (
        <Card key={rapper.id} className="bg-rap-carbon-light border-rap-gold/20 hover:border-rap-gold/40 transition-all duration-300">
          <CardContent className="p-4">
            {/* Rapper Image Placeholder */}
            <div className="w-full h-32 bg-gradient-to-br from-rap-gold to-rap-burgundy rounded-lg mb-3 flex items-center justify-center">
              <Music className="w-8 h-8 text-white/70" />
            </div>

            {/* Rapper Info */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="text-rap-platinum font-bold text-sm leading-tight">{rapper.name}</h3>
                {rapper.verified && (
                  <Verified className="w-4 h-4 text-rap-gold flex-shrink-0" />
                )}
              </div>

              {rapper.real_name && (
                <p className="text-rap-smoke text-xs">{rapper.real_name}</p>
              )}

              <div className="flex flex-wrap gap-1 text-xs">
                {rapper.origin && (
                  <div className="flex items-center gap-1 text-rap-silver">
                    <MapPin className="w-3 h-3" />
                    <span>{rapper.origin}</span>
                  </div>
                )}
                {rapper.birth_year && (
                  <div className="flex items-center gap-1 text-rap-silver">
                    <Calendar className="w-3 h-3" />
                    <span>{rapper.birth_year}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-rap-gold" />
                  <span className="text-rap-platinum font-semibold text-xs">
                    {rapper.average_rating ? Number(rapper.average_rating).toFixed(1) : "—"}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-rap-gold/20 text-rap-gold text-xs">
                  {rapper.total_votes || 0} votes
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => onEdit(rapper)}
                  size="sm"
                  variant="outline"
                  className="flex-1 border-rap-gold/30 text-rap-gold hover:bg-rap-gold/20"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => onDelete(rapper.id)}
                  size="sm"
                  variant="outline"
                  className="border-rap-burgundy/30 text-rap-burgundy hover:bg-rap-burgundy/20"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminRapperTable;
