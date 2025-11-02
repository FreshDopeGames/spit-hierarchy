import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useSystemAnnouncements } from '@/hooks/useSystemAnnouncements';
import HeaderNavigation from '@/components/HeaderNavigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCheck, Bell, Inbox } from 'lucide-react';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { SystemAnnouncementCard } from '@/components/notifications/SystemAnnouncementCard';
import SEOHead from '@/components/seo/SEOHead';

export default function Notifications() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  const { announcements } = useSystemAnnouncements();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread'
    ? notifications?.filter(n => !n.is_read)
    : notifications;

  return (
    <div className="min-h-screen bg-[hsl(var(--theme-background))]">
      <SEOHead 
        title="Notifications"
        description="View your notifications, achievements, and system announcements"
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

        {/* System Announcements */}
        {announcements && announcements.length > 0 && (
          <div className="mb-6 space-y-3">
            {announcements.map(announcement => (
              <SystemAnnouncementCard 
                key={announcement.id} 
                announcement={announcement} 
              />
            ))}
          </div>
        )}

        {/* Notifications Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
          <TabsList>
            <TabsTrigger value="all">
              <Bell className="w-4 h-4 mr-2" />
              All ({notifications?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="unread">
              <Inbox className="w-4 h-4 mr-2" />
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6 space-y-3">
            {filteredNotifications?.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-[hsl(var(--theme-text))]/30 mb-4" />
                <h3 className="text-xl font-semibold text-[hsl(var(--theme-text))] mb-2">
                  {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
                </h3>
                <p className="text-[hsl(var(--theme-text))]/60">
                  {filter === 'unread' 
                    ? "You've read all your notifications"
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
