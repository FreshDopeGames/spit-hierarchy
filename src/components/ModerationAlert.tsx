
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModerationAlertProps {
  type: "profanity" | "inappropriate" | "flagged";
  message: string;
  onEdit?: () => void;
  onFlag?: () => void;
  className?: string;
}

const ModerationAlert = ({ type, message, onEdit, onFlag, className }: ModerationAlertProps) => {
  const getIcon = () => {
    switch (type) {
      case "profanity":
      case "inappropriate":
        return <AlertTriangle className="w-4 h-4" />;
      case "flagged":
        return <Flag className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case "profanity":
      case "inappropriate":
        return "destructive";
      case "flagged":
        return "default";
      default:
        return "destructive";
    }
  };

  return (
    <Alert variant={getVariant() as any} className={className}>
      {getIcon()}
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        <div className="flex gap-2 ml-4">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onFlag && (
            <Button variant="outline" size="sm" onClick={onFlag}>
              <Flag className="w-3 h-3 mr-1" />
              Flag
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ModerationAlert;
