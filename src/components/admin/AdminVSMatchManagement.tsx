import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Edit, Trash2, Plus, Eye } from "lucide-react";
import AdminTabHeader from "./AdminTabHeader";
import AdminVSMatchDialog from "./AdminVSMatchDialog";
import { useAdminVSMatches } from "@/hooks/useAdminVSMatches";
import { VSMatch } from "@/types/vsMatches";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";

const AdminVSMatchManagement = () => {
  const [selectedMatch, setSelectedMatch] = useState<VSMatch | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const {
    vsMatches,
    isLoading,
    refetch,
    createVSMatch,
    updateVSMatch,
    deleteVSMatch,
    isCreating,
    isUpdating,
    isDeleting
  } = useAdminVSMatches();

  const handleCreate = () => {
    setSelectedMatch(null);
    setDialogOpen(true);
  };

  const handleEdit = (vsMatch: VSMatch) => {
    setSelectedMatch(vsMatch);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedMatch) {
        await updateVSMatch(data);
        toast.success("VS Match updated successfully!");
      } else {
        await createVSMatch(data);
        toast.success("VS Match created successfully!");
      }
      setDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to save VS Match. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVSMatch(id);
      toast.success("VS Match deleted successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to delete VS Match. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500 text-white">Published</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-rap-platinum">Loading VS Matches...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminTabHeader
        title="VS Match Management"
        icon={Swords}
        description="Create and manage head-to-head rapper battles"
      >
        <Button
          onClick={handleCreate}
          className="bg-rap-gold text-rap-carbon hover:bg-rap-gold/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create VS Match
        </Button>
      </AdminTabHeader>

      <div className="grid gap-4">
        {!vsMatches || vsMatches.length === 0 ? (
          <Card className="bg-rap-carbon-light border-rap-gold/30">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Swords className="w-12 h-12 text-rap-gold/50 mb-4" />
              <p className="text-rap-platinum text-center mb-4">No VS matches created yet</p>
              <Button
                onClick={handleCreate}
                className="bg-rap-gold text-rap-carbon hover:bg-rap-gold/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First VS Match
              </Button>
            </CardContent>
          </Card>
        ) : (
          vsMatches.map((match) => (
            <Card key={match.id} className="bg-rap-carbon-light border-rap-gold/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-rap-gold font-ceviche text-lg font-thin">
                      {match.title}
                    </CardTitle>
                    {match.description && (
                      <p className="text-rap-platinum/70 text-sm mt-1">
                        {match.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(match.status)}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-rap-platinum hover:text-rap-gold hover:bg-rap-gold/10"
                      >
                        <Link to={`/vs/${match.slug}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(match)}
                        className="text-rap-platinum hover:text-rap-gold hover:bg-rap-gold/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-rap-carbon border-rap-gold/30">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-rap-gold">Delete VS Match</AlertDialogTitle>
                            <AlertDialogDescription className="text-rap-platinum/70">
                              Are you sure you want to delete "{match.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-rap-gold/30 text-rap-platinum hover:bg-rap-gold/10">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(match.id)}
                              disabled={isDeleting}
                              className="bg-red-500 text-white hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center text-rap-platinum">
                  <div className="text-center">
                    <div className="text-sm text-rap-platinum/70 mb-1">Rapper 1</div>
                    <div className="font-medium">{match.rapper_1.name}</div>
                  </div>
                  <div className="mx-8 text-2xl text-rap-gold">VS</div>
                  <div className="text-center">
                    <div className="text-sm text-rap-platinum/70 mb-1">Rapper 2</div>
                    <div className="font-medium">{match.rapper_2.name}</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-rap-platinum/50 text-center">
                  Created: {new Date(match.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AdminVSMatchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vsMatch={selectedMatch}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
};

export default AdminVSMatchManagement;