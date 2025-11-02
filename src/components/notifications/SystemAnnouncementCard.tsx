import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Info, CheckCircle, XCircle, Zap, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SystemAnnouncementCardProps {
  announcement: {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error' | 'feature_release' | 'maintenance';
    action_url: string | null;
    action_text: string | null;
  };
}

const getAnnouncementIcon = (type: string) => {
  switch (type) {
    case 'warning': return <AlertCircle className="w-5 h-5" />;
    case 'success': return <CheckCircle className="w-5 h-5" />;
    case 'error': return <XCircle className="w-5 h-5" />;
    case 'feature_release': return <Zap className="w-5 h-5" />;
    case 'maintenance': return <Wrench className="w-5 h-5" />;
    default: return <Info className="w-5 h-5" />;
  }
};

export const SystemAnnouncementCard = ({ announcement }: SystemAnnouncementCardProps) => {
  return (
    <Alert variant={announcement.type === 'error' ? 'destructive' : 'default'} className="border-2">
      {getAnnouncementIcon(announcement.type)}
      <AlertTitle className="font-bold">{announcement.title}</AlertTitle>
      <AlertDescription className="mt-2">
        {announcement.message}
        {announcement.action_url && announcement.action_text && (
          <Button asChild variant="link" className="ml-2 p-0 h-auto">
            <Link to={announcement.action_url}>{announcement.action_text}</Link>
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
