import { Bell, Check, CheckCheck, Trophy, TrendingUp, MessageSquare, Vote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { Link, useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect, useRef } from 'react';


const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'achievement': return <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
    case 'level_up': return <TrendingUp className="w-4 h-4 text-purple-500 flex-shrink-0" />;
    case 'comment_reply': return <MessageSquare className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    case 'ranking_vote':
    case 'skill_vote': return <Vote className="w-4 h-4 text-green-500 flex-shrink-0" />;
    default: return <Bell className="w-4 h-4 text-muted-foreground flex-shrink-0" />;
  }
};

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const autoReadTimer = useRef<ReturnType<typeof setTimeout>>();

  const latest10 = notifications?.slice(0, 10) || [];

  const isOtherUserNotification = (type: string) =>
    type === 'ranking_vote' || type === 'skill_vote';

  // Auto-mark visible notifications as read after popover opens
  useEffect(() => {
    if (open && unreadCount > 0) {
      autoReadTimer.current = setTimeout(() => {
        markAllAsRead.mutate();
      }, 1000);
    }
    return () => {
      if (autoReadTimer.current) clearTimeout(autoReadTimer.current);
    };
  }, [open]);

  const handleItemClick = (notification: typeof latest10[0]) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    // Don't navigate for other-user vote notifications
    if (notification.link_url && !isOtherUserNotification(notification.type)) {
      setOpen(false);
      navigate(notification.link_url);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
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
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 max-h-[80vh] flex flex-col" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
          {latest10.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {latest10.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors flex items-start gap-3 ${
                    !n.is_read ? 'bg-accent/20' : ''
                  }`}
                >
                  <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold' : ''} text-foreground`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2">
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="text-xs text-primary hover:underline font-medium"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
