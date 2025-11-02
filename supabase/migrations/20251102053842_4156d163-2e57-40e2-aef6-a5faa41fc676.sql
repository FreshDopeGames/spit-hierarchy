-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'achievement', 
    'level_up', 
    'ranking_vote',
    'skill_vote',
    'comment_reply',
    'system_message',
    'admin_broadcast'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  link_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  priority INTEGER DEFAULT 0 CHECK (priority BETWEEN 0 AND 10)
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);

-- Create system_announcements table
CREATE TABLE system_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'info',
    'warning',
    'success',
    'error',
    'feature_release',
    'maintenance'
  )),
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN (
    'all',
    'bronze',
    'silver', 
    'gold',
    'platinum',
    'diamond'
  )),
  display_priority INTEGER DEFAULT 5 CHECK (display_priority BETWEEN 1 AND 10),
  icon TEXT,
  action_url TEXT,
  action_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_announcements_active ON system_announcements(is_active, starts_at, expires_at);

-- Create notification_preferences table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  achievements_enabled BOOLEAN DEFAULT true,
  level_ups_enabled BOOLEAN DEFAULT true,
  voting_activity_enabled BOOLEAN DEFAULT true,
  comment_replies_enabled BOOLEAN DEFAULT true,
  system_messages_enabled BOOLEAN DEFAULT true,
  email_notifications_enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notifications RLS policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own old notifications"
  ON notifications FOR DELETE
  USING (
    auth.uid() = user_id AND 
    created_at < NOW() - INTERVAL '30 days'
  );

-- System Announcements RLS policies
CREATE POLICY "View active announcements"
  ON system_announcements FOR SELECT
  USING (
    is_active = true AND
    starts_at <= NOW() AND
    (expires_at IS NULL OR expires_at > NOW())
  );

CREATE POLICY "Admins manage announcements"
  ON system_announcements FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Notification Preferences RLS policies
CREATE POLICY "Users manage own preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create notification function
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}',
  p_link_url TEXT DEFAULT NULL,
  p_priority INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  user_preferences RECORD;
BEGIN
  -- Check user preferences
  SELECT * INTO user_preferences 
  FROM notification_preferences 
  WHERE user_id = p_user_id;
  
  -- Check if this notification type is enabled (default to enabled if no preferences set)
  IF user_preferences IS NULL OR (
    (p_type = 'achievement' AND user_preferences.achievements_enabled) OR
    (p_type = 'level_up' AND user_preferences.level_ups_enabled) OR
    (p_type IN ('ranking_vote', 'skill_vote') AND user_preferences.voting_activity_enabled) OR
    (p_type = 'comment_reply' AND user_preferences.comment_replies_enabled) OR
    (p_type IN ('system_message', 'admin_broadcast') AND user_preferences.system_messages_enabled)
  ) THEN
    INSERT INTO notifications (user_id, type, title, message, metadata, link_url, priority)
    VALUES (p_user_id, p_type, p_title, p_message, p_metadata, p_link_url, p_priority)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create broadcast function
CREATE OR REPLACE FUNCTION broadcast_system_announcement(
  announcement_id UUID
) RETURNS INTEGER AS $$
DECLARE
  announcement RECORD;
  target_users UUID[];
  user_id UUID;
  notification_count INTEGER := 0;
BEGIN
  -- Get announcement details
  SELECT * INTO announcement 
  FROM system_announcements 
  WHERE id = announcement_id AND is_active = true;
  
  IF announcement IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Get target users based on audience
  IF announcement.target_audience = 'all' THEN
    SELECT ARRAY_AGG(id) INTO target_users FROM profiles;
  ELSE
    SELECT ARRAY_AGG(ms.id) INTO target_users
    FROM member_stats ms
    WHERE ms.status::TEXT = announcement.target_audience;
  END IF;
  
  -- Create notifications for each user
  FOREACH user_id IN ARRAY target_users LOOP
    PERFORM create_notification(
      user_id,
      'admin_broadcast',
      announcement.title,
      announcement.message,
      jsonb_build_object(
        'announcement_id', announcement.id,
        'type', announcement.type,
        'icon', announcement.icon
      ),
      announcement.action_url,
      announcement.display_priority
    );
    notification_count := notification_count + 1;
  END LOOP;
  
  RETURN notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;