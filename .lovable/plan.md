

## Add Notification Dropdown with Activity Feed

**Goal**: Convert the notification bell from a simple link into a dropdown that shows the latest 10 notifications — combining both database notifications (admin/system) and real-time activity toasts (votes from other users) — so users can review recent activity without navigating away.

### Approach

**Two-source merge**: Database notifications already exist in the `notifications` table. Activity toasts (from `ActivityToastProvider`) are ephemeral — they show and disappear. To persist them in the dropdown, we have two options:

1. **Client-side buffer** — Keep a rolling in-memory array of the last N activity events captured by `ActivityToastProvider`, merge with DB notifications, show latest 10 in dropdown. Simple, no schema changes, but activity items are lost on page refresh.

2. **Write activity to `notifications` table** — When `ActivityToastProvider` fires, also insert a row into `notifications`. The dropdown just queries DB notifications (latest 10). Activity persists across refreshes and is visible on the full Notifications page too.

**Recommendation**: Option 2. It's cleaner — one source of truth, notifications persist, and the dropdown just reads from the existing hook. The `notifications` table already supports different `type` values.

### Changes

1. **`src/components/ActivityToastProvider.tsx`**
   - After showing each toast, insert a notification row into `notifications` table with `type: 'ranking_vote'` or `type: 'skill_vote'`, the formatted message, and `user_id` set to the current user.
   - Skip insert if user is not authenticated (activity toasts for anonymous users stay ephemeral).

2. **`src/components/NotificationBell.tsx`** — Replace the `<Link>` with a `Popover` (from shadcn):
   - Trigger: the existing bell icon with badge.
   - Content: a dropdown panel (~320px wide) showing:
     - Header row: "Notifications" title + "Mark all read" button.
     - Scrollable list of the latest 10 notifications (sliced from existing `useNotifications` hook data).
     - Each item: icon, title, time ago, unread dot. Clicking marks as read and navigates if `link_url` exists.
     - Footer: "View all" link to `/notifications`.

3. **`src/hooks/useNotifications.tsx`** — No changes needed. Already fetches latest 50, the dropdown just takes the first 10.

### Technical Detail

- The `notifications` table INSERT policy allows anyone (`WITH CHECK: true`), so the client can insert activity notifications for the current user.
- Activity notifications will use types `ranking_vote` and `skill_vote`, which `NotificationCard` already has icons for.
- To avoid duplicate activity notifications (e.g., if multiple tabs are open), we can add a simple dedup check: skip insert if a notification with the same title exists within the last 30 seconds.

