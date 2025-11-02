import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { Link } from 'react-router-dom';

export const NotificationBell = () => {
  const { unreadCount } = useNotifications();

  return (
    <Link
      to="/notifications"
      className="relative p-2 hover:bg-accent rounded-full transition-colors"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5 text-[hsl(var(--theme-text))]" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Link>
  );
};
