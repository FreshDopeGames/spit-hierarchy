

# Auto-Read Notifications on View + Fix Other-User Notification Links

## Two issues to fix

### 1. Auto-mark notifications as read when the popover opens
Currently, notifications stay unread until explicitly clicked. The user wants viewing them in the dropdown to be sufficient to dismiss the unread indicator.

**Approach**: When the popover opens and there are unread notifications visible in the latest 10, batch-mark them as read after a short delay (~1 second) so the user has time to register the visual state before it changes. Use a `useEffect` tied to the `open` state.

**File**: `src/components/NotificationBell.tsx`
- Add a `useEffect` that watches `open` — when it becomes `true`, wait ~1s then call `markAllAsRead.mutate()` for the visible unread notifications (or use individual `markAsRead` calls for just the visible 10).
- Simpler approach: just call `markAllAsRead` since the user wants viewing to equal dismissal.

### 2. Disable navigation for "other user" notifications
Notifications like "AhmadTC just voted for UGK in Best Groups!" describe another user's action. These currently link to `/rankings/best-groups` which 404s (correct route would be `/rankings/official/best-groups`).

**Approach**: Rather than fixing the link (since the user says these shouldn't be clickable at all), strip the navigation behavior for vote-type notifications about other users. Specifically:
- In `NotificationBell.tsx`: for `ranking_vote` and `skill_vote` type notifications, do not navigate on click.
- In `NotificationCard.tsx` (full page): same treatment — render as non-link.
- Additionally, fix the DB function or trigger that generates these notifications to either stop creating them or store corrected `link_url` values going forward. The user may want to stop receiving notifications about *other* users' votes entirely.

**Clarification needed**: Should we stop generating vote notifications about other users entirely, or just make them non-clickable?

## Technical changes

| File | Change |
|------|--------|
| `src/components/NotificationBell.tsx` | Add `useEffect` to auto-mark visible notifications as read ~1s after popover opens. Remove navigation for `ranking_vote`/`skill_vote` types. |
| `src/components/notifications/NotificationCard.tsx` | Skip wrapping in `<Link>` for vote-type notifications about other users. |
| `src/hooks/useNotifications.tsx` | Add a `markVisibleAsRead` mutation that marks specific IDs as read in batch (optional — could reuse `markAllAsRead`). |

## Open question
Should notifications about other users' votes (e.g., "AhmadTC just voted for UGK") stop being generated entirely, or just be kept as non-clickable informational items?

