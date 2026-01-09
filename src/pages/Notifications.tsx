import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import HeaderNavigation from '@/components/HeaderNavigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCheck, Bell, Inbox } from 'lucide-react';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import SEOHead from '@/components/seo/SEOHead';

export default function Notifications() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = filter === 'unread'
    ? notifications?.filter(n => !n.is_read)
    : filter === 'read'
    ? notifications?.filter(n => n.is_read)
    : notifications;

  return (
    <div className="min-h-screen bg-[hsl(var(--theme-background))]">
      <SEOHead 
        title="Notifications - Spit Hierarchy"
        description="View your notifications, achievements, and system announcements"
        robots="noindex, nofollow"
      />
      <HeaderNavigation isScrolled={false} />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-ceviche text-4xl md:text-6xl text-[hsl(var(--theme-primary))]">
              Notifications
            </h1>
            <p className="text-[hsl(var(--theme-text))]/70 mt-2">
              Stay updated on your activity and achievements
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button
              onClick={() => markAllAsRead.mutate()}
              variant="outline"
              size="sm"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread' | 'read')}>
          <TabsList>
            <TabsTrigger value="all">
              <Bell className="w-4 h-4 mr-2" />
              All ({notifications?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="unread">
              <Inbox className="w-4 h-4 mr-2" />
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read">
              <CheckCheck className="w-4 h-4 mr-2" />
              Read ({(notifications?.length || 0) - unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6 space-y-3">
            {filteredNotifications?.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-[hsl(var(--theme-text))]/30 mb-4" />
                <h3 className="text-xl font-semibold text-[hsl(var(--theme-text))] mb-2">
                  {filter === 'unread' ? 'All caught up!' : filter === 'read' ? 'No read notifications' : 'No notifications yet'}
                </h3>
                <p className="text-[hsl(var(--theme-text))]/60">
                  {filter === 'unread' 
                    ? "You've read all your notifications"
                    : filter === 'read'
                    ? "You haven't read any notifications yet"
                    : "When you get notifications, they'll appear here"}
                </p>
              </div>
            ) : (
              filteredNotifications?.map(notification => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead.mutate(notification.id)}
                  onDelete={() => deleteNotification.mutate(notification.id)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
