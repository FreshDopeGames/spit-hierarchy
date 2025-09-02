
import { Button } from "@/components/ui/button";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Edit, Trash2, Star, Coins } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as LucideIcons from "lucide-react";

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
      return 'bg-[var(--theme-rarity-legendary)] text-[var(--theme-textLight)]';
    case 'epic':
      return 'bg-[var(--theme-rarity-epic)] text-[var(--theme-textLight)]';
    case 'rare':
      return 'bg-[var(--theme-rarity-rare)] text-[var(--theme-textLight)]';
    case 'common':
    default:
      return 'bg-[var(--theme-rarity-common)] text-[var(--theme-textInverted)]';
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

const renderAchievementIcon = (iconName: string) => {
  // First check if it's an emoji (contains non-ASCII characters)
  if (/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(iconName)) {
    return <span className="text-2xl">{iconName}</span>;
  }
  
  // Try to get the Lucide icon
  const IconComponent = (LucideIcons as any)[iconName];
  if (IconComponent) {
    return <IconComponent className="w-5 h-5" />;
  }
  
  // Fallback to Trophy icon if not found
  return <Trophy className="w-5 h-5" />;
};

const AdminAchievementTable = ({ achievements, isLoading, onEdit, onDelete }: AdminAchievementTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-[var(--theme-surface)] border-[var(--theme-border)] animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-[var(--theme-background)] rounded mb-2"></div>
              <div className="h-3 bg-[var(--theme-background)] rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-[var(--theme-background)] rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <Card className="bg-[var(--theme-surface)] border-[var(--theme-border)]">
        <CardContent className="p-8 text-center">
          <Trophy className="w-16 h-16 text-[var(--theme-primary)] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[var(--theme-text)] mb-2">No Achievements Yet</h3>
          <p className="text-[var(--theme-textMuted)]">Create your first achievement to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-[var(--theme-border)]">
            <TableHead className="text-[var(--theme-primary)] font-bold">Name</TableHead>
            <TableHead className="text-[var(--theme-primary)] font-bold">Description</TableHead>
            <TableHead className="text-[var(--theme-primary)] font-bold">Type</TableHead>
            <TableHead className="text-[var(--theme-primary)] font-bold">Rarity</TableHead>
            <TableHead className="text-[var(--theme-primary)] font-bold">Points</TableHead>
            <TableHead className="text-[var(--theme-primary)] font-bold">Threshold</TableHead>
            <TableHead className="text-[var(--theme-primary)] font-bold">Status</TableHead>
            <TableHead className="text-[var(--theme-primary)] font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {achievements.map((achievement) => (
            <TableRow key={achievement.id} className="border-[var(--theme-border)] hover:bg-[var(--theme-surface)]">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {renderAchievementIcon(achievement.icon)}
                  <span className="text-[var(--theme-text)] font-semibold">{achievement.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-[var(--theme-textMuted)] max-w-xs">
                <div className="truncate" title={achievement.description}>
                  {achievement.description}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getTypeIcon(achievement.type)}
                  <span className="text-[var(--theme-text)] capitalize">{achievement.type.replace('_', ' ')}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={`${getRarityColor(achievement.rarity)} font-semibold`}>
                  {achievement.rarity}
                </Badge>
              </TableCell>
              <TableCell className="text-[var(--theme-primary)] font-bold">
                {achievement.points}
              </TableCell>
              <TableCell className="text-[var(--theme-textMuted)]">
                {achievement.threshold_value ? (
                  <div className="text-xs">
                    <div>{achievement.threshold_value}</div>
                    {achievement.threshold_field && (
                      <div className="text-[var(--theme-textMuted)]">{achievement.threshold_field}</div>
                    )}
                  </div>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <Badge variant={achievement.is_active ? "default" : "secondary"} 
                       className={achievement.is_active ? "bg-[var(--theme-success)] text-[var(--theme-textLight)]" : "bg-[var(--theme-textMuted)] text-[var(--theme-textInverted)]"}>
                  {achievement.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onEdit(achievement)}
                    size="sm"
                    variant="outline"
                    className="border-[var(--theme-border)] text-[var(--theme-primary)] hover:bg-[var(--theme-surface)]"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => onDelete(achievement.id)}
                    size="sm"
                    variant="outline"
                    className="border-[var(--theme-error)]/30 text-[var(--theme-error)] hover:bg-[var(--theme-error)]/20"
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
