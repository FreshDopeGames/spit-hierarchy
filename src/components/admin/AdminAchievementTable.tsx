import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Edit, Trash2, Star, Coins } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Achievement = Tables<"achievements">;

interface AdminAchievementTableProps {
  achievements: Achievement[];
  isLoading: boolean;
  onEdit: (achievement: Achievement) => void;
  onDelete: (id: string) => void;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black';
    case 'epic':
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    case 'rare':
      return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    case 'common':
    default:
      return 'bg-gray-500 text-white';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'voting':
      return <Star className="w-4 h-4" />;
    case 'engagement':
      return <Trophy className="w-4 h-4" />;
    default:
      return <Coins className="w-4 h-4" />;
  }
};

const AdminAchievementTable = ({ achievements, isLoading, onEdit, onDelete }: AdminAchievementTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-gradient-to-br from-black via-rap-carbon to-rap-carbon-light border-rap-gold/20 animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-rap-charcoal rounded mb-2"></div>
              <div className="h-3 bg-rap-charcoal rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-rap-charcoal rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-black via-rap-carbon to-rap-carbon-light border-rap-gold/20">
        <CardContent className="p-8 text-center">
          <Trophy className="w-16 h-16 text-rap-gold mx-auto mb-4" />
          <h3 className="text-xl font-bold text-rap-platinum mb-2">No Achievements Yet</h3>
          <p className="text-rap-smoke">Create your first achievement to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-rap-gold/20">
            <TableHead className="text-rap-gold font-bold">Name</TableHead>
            <TableHead className="text-rap-gold font-bold">Description</TableHead>
            <TableHead className="text-rap-gold font-bold">Type</TableHead>
            <TableHead className="text-rap-gold font-bold">Rarity</TableHead>
            <TableHead className="text-rap-gold font-bold">Points</TableHead>
            <TableHead className="text-rap-gold font-bold">Threshold</TableHead>
            <TableHead className="text-rap-gold font-bold">Status</TableHead>
            <TableHead className="text-rap-gold font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {achievements.map((achievement) => (
            <TableRow key={achievement.id} className="border-rap-gold/10 hover:bg-rap-carbon/30">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{achievement.icon}</span>
                  <span className="text-rap-platinum font-semibold">{achievement.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-rap-smoke max-w-xs">
                <div className="truncate" title={achievement.description}>
                  {achievement.description}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getTypeIcon(achievement.type)}
                  <span className="text-rap-platinum capitalize">{achievement.type.replace('_', ' ')}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={`${getRarityColor(achievement.rarity)} font-semibold`}>
                  {achievement.rarity}
                </Badge>
              </TableCell>
              <TableCell className="text-rap-gold font-bold">
                {achievement.points}
              </TableCell>
              <TableCell className="text-rap-silver">
                {achievement.threshold_value ? (
                  <div className="text-xs">
                    <div>{achievement.threshold_value}</div>
                    {achievement.threshold_field && (
                      <div className="text-rap-smoke">{achievement.threshold_field}</div>
                    )}
                  </div>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <Badge variant={achievement.is_active ? "default" : "secondary"} 
                       className={achievement.is_active ? "bg-green-600 text-white" : "bg-gray-600 text-white"}>
                  {achievement.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onEdit(achievement)}
                    size="sm"
                    variant="outline"
                    className="border-rap-gold/30 text-rap-gold hover:bg-rap-gold/20"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => onDelete(achievement.id)}
                    size="sm"
                    variant="outline"
                    className="border-rap-burgundy/30 text-rap-burgundy hover:bg-rap-burgundy/20"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminAchievementTable;