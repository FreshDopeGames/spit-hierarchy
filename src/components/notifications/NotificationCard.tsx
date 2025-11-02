import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Trophy, TrendingUp, MessageSquare, Bell, Vote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCardProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    link_url: string | null;
    created_at: string;
  };
  onMarkAsRead: () => void;
  onDelete: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'achievement': return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 'level_up': return <TrendingUp className="w-5 h-5 text-purple-500" />;
    case 'comment_reply': return <MessageSquare className="w-5 h-5 text-blue-500" />;
    case 'ranking_vote':
    case 'skill_vote': return <Vote className="w-5 h-5 text-green-500" />;
    default: return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

export const NotificationCard = ({ notification, onMarkAsRead, onDelete }: NotificationCardProps) => {
  const content = (
    <Card className={`p-4 transition-colors ${!notification.is_read ? 'bg-accent/20 border-[hsl(var(--theme-primary))]/30' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[hsl(var(--theme-text))]">
            {notification.title}
          </h3>
          <p className="text-sm text-[hsl(var(--theme-text))]/70 mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-[hsl(var(--theme-text))]/50 mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!notification.is_read && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                onMarkAsRead();
              }}
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            title="Delete notification"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return notification.link_url ? (
    <Link 
      to={notification.link_url} 
      onClick={() => !notification.is_read && onMarkAsRead()}
      className="block"
    >
      {content}
    </Link>
  ) : content;
};
