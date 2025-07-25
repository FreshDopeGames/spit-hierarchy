
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RapperForm from "./forms/RapperForm";
import RapperAvatarUpload from "./RapperAvatarUpload";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

interface AdminRapperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rapper?: Rapper | null;
  onSuccess: () => void;
}

const AdminRapperDialog = ({
  open,
  onOpenChange,
  rapper,
  onSuccess
}: AdminRapperDialogProps) => {
  const handleClose = () => {
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black border border-rap-gold/30">
        <DialogHeader>
          <DialogTitle className="text-rap-gold font-ceviche text-xl font-thin">
            {rapper ? `Edit ${rapper.name}` : "Add New Rapper"}
          </DialogTitle>
        </DialogHeader>
        
        {rapper ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent">
              <TabsTrigger 
                value="details" 
                className="bg-rap-gold text-rap-carbon data-[state=active]:bg-white data-[state=active]:text-rap-carbon"
              >
                Rapper Details
              </TabsTrigger>
              <TabsTrigger 
                value="avatar" 
                className="bg-rap-gold text-rap-carbon data-[state=active]:bg-white data-[state=active]:text-rap-carbon"
              >
                Avatar Upload
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <RapperForm rapper={rapper} onSuccess={handleClose} onCancel={() => onOpenChange(false)} />
            </TabsContent>
            
            <TabsContent value="avatar">
              <RapperAvatarUpload rapper={rapper} />
            </TabsContent>
          </Tabs>
        ) : (
          <RapperForm rapper={null} onSuccess={handleClose} onCancel={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminRapperDialog;
