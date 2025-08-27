
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Star, Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface RankingTag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface Ranking {
  id: string;
  title: string;
  description: string;
  category: string;
  slug: string;
  display_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  ranking_tag_assignments: Array<{
    tag_id: string;
    ranking_tags: RankingTag;
  }>;
}

interface AdminRankingsTableProps {
  rankings: Ranking[];
  onEdit: (ranking: Ranking) => void;
  onDelete: (ranking: Ranking) => void;
}

const AdminRankingsTable = ({ rankings, onEdit, onDelete }: AdminRankingsTableProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-4">
        {rankings.map((ranking) => (
          <Card key={ranking.id} className="bg-[var(--theme-surface)] border border-[var(--theme-border)]">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header with title and featured status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[var(--theme-text)] font-[var(--theme-font-heading)] text-lg truncate">
                      {ranking.title}
                    </h3>
                    <p className="text-sm text-[var(--theme-textMuted)] font-[var(--theme-font-body)] mt-1">
                      /{ranking.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {ranking.is_featured && (
                      <Star className="w-4 h-4 text-[var(--theme-primary)] flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* Category and Status */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-[var(--theme-surface)] text-[var(--theme-text)] border-[var(--theme-border)]">
                    {ranking.category}
                  </Badge>
                  <Badge 
                    variant={ranking.is_featured ? "default" : "secondary"}
                    className={ranking.is_featured 
                      ? "bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border-[var(--theme-primary)]/30" 
                      : "bg-[var(--theme-textMuted)]/20 text-[var(--theme-textMuted)] border-[var(--theme-textMuted)]/30"
                    }
                  >
                    {ranking.is_featured ? "Featured" : "Standard"}
                  </Badge>
                </div>

                {/* Tags */}
                {ranking.ranking_tag_assignments && ranking.ranking_tag_assignments.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {ranking.ranking_tag_assignments.map((assignment) => (
                      <Badge
                        key={assignment.tag_id}
                        variant="outline"
                        className="text-xs border-[var(--theme-border)] text-[var(--theme-text)]"
                        style={{ borderColor: assignment.ranking_tags.color }}
                      >
                        {assignment.ranking_tags.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--theme-border)]">
                  <span className="text-sm text-[var(--theme-textMuted)] font-[var(--theme-font-body)]">
                    Order: {ranking.display_order}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/rankings/official/${ranking.slug}`, '_blank')}
                      className="text-[var(--theme-text)] hover:text-[var(--theme-primary)] h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(ranking)}
                      className="text-[var(--theme-text)] hover:text-[var(--theme-primary)] h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(ranking)}
                      className="text-[var(--theme-text)] hover:text-red-400 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[var(--theme-border)]">
      <Table>
        <TableHeader>
          <TableRow className="border-[var(--theme-border)]">
            <TableHead className="text-[var(--theme-primary)] font-[var(--theme-font-heading)]">Title</TableHead>
            <TableHead className="text-[var(--theme-primary)] font-[var(--theme-font-heading)]">Category</TableHead>
            <TableHead className="text-[var(--theme-primary)] font-[var(--theme-font-heading)]">Tags</TableHead>
            <TableHead className="text-[var(--theme-primary)] font-[var(--theme-font-heading)]">Order</TableHead>
            <TableHead className="text-[var(--theme-primary)] font-[var(--theme-font-heading)]">Status</TableHead>
            <TableHead className="text-[var(--theme-primary)] font-[var(--theme-font-heading)]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rankings.map((ranking) => (
            <TableRow key={ranking.id} className="border-[var(--theme-border)]">
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium text-[var(--theme-text)] font-[var(--theme-font-heading)]">
                    {ranking.title}
                  </div>
                  <div className="text-sm text-[var(--theme-textMuted)] font-[var(--theme-font-body)]">
                    /{ranking.slug}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-[var(--theme-surface)] text-[var(--theme-text)] border-[var(--theme-border)]">
                  {ranking.category}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {ranking.ranking_tag_assignments?.map((assignment) => (
                    <Badge
                      key={assignment.tag_id}
                      variant="outline"
                      className="text-xs border-[var(--theme-border)] text-[var(--theme-text)]"
                      style={{ borderColor: assignment.ranking_tags.color }}
                    >
                      {assignment.ranking_tags.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-[var(--theme-text)] font-[var(--theme-font-body)]">
                  {ranking.display_order}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {ranking.is_featured && (
                    <Star className="w-4 h-4 text-[var(--theme-primary)]" />
                  )}
                  <Badge 
                    variant={ranking.is_featured ? "default" : "secondary"}
                    className={ranking.is_featured 
                      ? "bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border-[var(--theme-primary)]/30" 
                      : "bg-[var(--theme-textMuted)]/20 text-[var(--theme-textMuted)] border-[var(--theme-textMuted)]/30"
                    }
                  >
                    {ranking.is_featured ? "Featured" : "Standard"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/rankings/official/${ranking.slug}`, '_blank')}
                    className="text-[var(--theme-text)] hover:text-[var(--theme-primary)]"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(ranking)}
                    className="text-[var(--theme-text)] hover:text-[var(--theme-primary)]"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(ranking)}
                    className="text-[var(--theme-text)] hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
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

export default AdminRankingsTable;
