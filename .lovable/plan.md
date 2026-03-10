

## Plan: Admin/Mod Flagging + Member Journals on Blog Page

### 1. Database Changes

**Add `is_flagged` column to `member_journal_entries`**:
- `is_flagged BOOLEAN NOT NULL DEFAULT false` — when flagged by admin/mod, entry becomes unpublished
- `flagged_by UUID` — references the moderator who flagged it
- `flagged_at TIMESTAMPTZ` — when it was flagged
- `flag_reason TEXT` — reason for flagging

**New RLS policies**:
- Allow admins/moderators to UPDATE `member_journal_entries` (specifically `is_flagged`, `flagged_by`, `flagged_at`, `flag_reason`, and set `status` to `'draft'`)

### 2. Admin/Mod Flagging Capability

**Create `useModerationJournal` hook**:
- Mutation to flag a journal entry: sets `is_flagged = true`, `status = 'draft'`, records moderator info
- Mutation to unflag/restore an entry

**Update public entry visibility**:
- Modify the existing RLS "Public can view published public entries" policy to also require `is_flagged = false`

### 3. Member Journals on the Blog Page

**Add a "Member Journals" section to `src/pages/Blog.tsx`**:
- Below the editorial blog posts grid, add a section similar to how Community Rankings appear on the Rankings page
- Query `member_journal_entries` where `is_public = true`, `status = 'published'`, `is_flagged = false`
- Join with `profiles` to get author username/avatar
- Display as cards in a grid with title, excerpt, author, date
- Link each card to a dedicated journal entry detail page

**Create `MemberJournalCard` component**:
- Styled consistently with `BlogPostGrid` cards but distinguished with a "Member Journal" badge
- Shows author name, date, excerpt

**Create journal entry detail page** (`/journal/:username/:slug`):
- Renders the full journal entry content
- Shows author info, date, public/private status
- If user is admin/mod, show a "Flag as Inappropriate" button

### 4. Route Addition

- Add route `/journal/:username/:slug` for individual journal entry viewing

### 5. Flag UI for Admins/Mods

- On the journal detail page, admins/mods see a flag button
- Clicking opens a dialog to enter a reason, then calls the flag mutation
- Flagged entries revert to draft status and become invisible publicly

### Technical Notes

- The RLS policy update ensures flagged entries are excluded from public reads at the database level
- The moderator UPDATE policy will use the existing `is_moderator_or_admin()` security definer function
- Member journal cards on the blog page will use a separate query with its own pagination

