import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteAccountSectionProps {
  userId: string;
  username: string;
}

const DeleteAccountSection = ({ userId, username }: DeleteAccountSectionProps) => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    setIsDeleting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      const { data, error } = await supabase.functions.invoke("delete-user-account", {
        body: { target_user_id: userId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await supabase.auth.signOut();
      toast.success("Your account has been deleted");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setShowDialog(false);
      setConfirmText("");
    }
  };

  return (
    <div className="mt-8 sm:mt-12">
      <div className="bg-red-950/30 border-2 border-red-500/40 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-bold text-red-400 font-[var(--theme-font-heading)] mb-2">
          Danger Zone
        </h3>
        <p className="text-sm text-[hsl(var(--theme-text))]/70 mb-4 font-[var(--theme-font-body)]">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button
          variant="destructive"
          onClick={() => setShowDialog(true)}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete My Account
        </Button>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="bg-[hsl(var(--theme-surface))] border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="text-[hsl(var(--theme-text))] space-y-3">
              <span className="block">
                This will permanently delete your account <strong>{username}</strong> and all your data including votes, comments, rankings, and journal entries.
              </span>
              <span className="block font-semibold text-red-400">
                This cannot be undone.
              </span>
              <span className="block">
                Type <strong>DELETE</strong> to confirm:
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="bg-[hsl(var(--theme-background))] border-red-500/50 text-[hsl(var(--theme-text))]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[hsl(var(--theme-primary))] text-[hsl(var(--theme-text))]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={confirmText !== "DELETE" || isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Forever"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeleteAccountSection;
