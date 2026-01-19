import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { usePWA } from '@/hooks/usePWA';
import HeaderNavigation from '@/components/HeaderNavigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCheck, Bell, Inbox, BellRing, BellOff, Settings } from 'lucide-react';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import SEOHead from '@/components/seo/SEOHead';
import { toast } from 'sonner';

export default function Notifications() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  const { notificationPermission, requestNotificationPermission } = usePWA();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const handleToggleNotifications = async () => {
    if (notificationPermission === 'granted') {
      toast.info('To disable notifications, update your browser settings');
      return;
    }
    
    const result = await requestNotificationPermission();
    if (result.success) {
      toast.success('Push notifications enabled!');
    } else {
      toast.error('Could not enable notifications. Check your browser settings.');
    }
  };

  const getNotificationStatus = () => {
    switch (notificationPermission) {
      case 'granted':
        return { icon: BellRing, color: 'text-green-500', message: 'Push notifications are enabled', enabled: true };
      case 'denied':
        return { icon: BellOff, color: 'text-red-500', message: 'Blocked - enable in browser settings', enabled: false };
      case 'unsupported':
        return { icon: BellOff, color: 'text-[hsl(var(--theme-text))]/50', message: 'Not supported in this browser', enabled: false };
      default:
        return { icon: Bell, color: 'text-amber-500', message: 'Enable to receive push notifications', enabled: false };
    }
  };

  const status = getNotificationStatus();

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

        {/* Notification Settings */}
        <div className="mb-6 p-4 rounded-xl bg-[hsl(var(--theme-surface))] border border-[hsl(var(--theme-primary))]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-[hsl(var(--theme-background))] ${status.color}`}>
                <status.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[hsl(var(--theme-text))]">Push Notifications</h3>
                <p className="text-sm text-[hsl(var(--theme-text))]/60">{status.message}</p>
              </div>
            </div>
            <Switch
              checked={status.enabled}
              onCheckedChange={handleToggleNotifications}
              disabled={notificationPermission === 'unsupported'}
            />
          </div>
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
