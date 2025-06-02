
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { RapperForm } from "./forms/RapperForm";

type Rapper = Tables<"rappers">;

interface AdminRapperDialogProps {
  rapper: Rapper | null;
  isOpen: boolean;
  onClose: () => void;
}

const AdminRapperDialog = ({ rapper, isOpen, onClose }: AdminRapperDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[var(--theme-primary)] font-[var(--theme-font-heading)]">
            {rapper ? "Edit Rapper" : "Add New Rapper"}
          </DialogTitle>
        </DialogHeader>

        <RapperForm rapper={rapper} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default AdminRapperDialog;
