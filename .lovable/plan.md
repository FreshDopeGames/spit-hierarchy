# Fix Blog Draft Visibility & Standardize Editor Permissions

## What I found

Verified directly against the live database:

1. **The draft exists.** Today's draft "Oddisee & Heno. Linked Up Overseas..." (id `a8f7761b...`, status `draft`, created 2026-05-01 00:32 UTC) is in `blog_posts`, authored by user `314b1dd3...` = **Uralg323**.
2. **Uralg323 IS an admin** in `user_roles` (role = `admin`). All 3 admins (Uralg323, S2BKAS, f00te) are correctly assigned.
3. **The RPC `get_admin_blog_posts()` is correct.** It uses `WHERE can_manage_blog(auth.uid())`, and `can_manage_blog` accepts `admin`, `blog_editor`, `author`. Uralg's admin role passes this check.
4. **RLS on `blog_posts` is permissive enough** — the "Admins and blog editors can view all posts" SELECT policy uses `can_manage_blog(auth.uid())` and would return drafts.
5. **Real mismatch: roles vs. enum.** `app_role` enum contains `admin, moderator, blog_editor, user, author` — there is **no `staff_writer` value**. But `src/pages/Admin.tsx` filters tabs against the literal string `"staff_writer"` (lines 26-29, 50). For an admin this still works (admin sees all `admin` tabs). For someone assigned the "Staff Writer" UI label (which maps to enum `blog_editor`), the security context sets `isStaffWriter = canManageBlog && !isAdmin = true`, and `getUserRole()` returns `"staff_writer"`, so this string match accidentally works. But it's fragile and confusing.
6. **No `moderator` tab access.** `getUserRole()` returns `"moderator"` for moderators, but no tab has `"moderator"` in its `roles` list, so moderators land on Admin and see zero tabs — they're effectively locked out of blog previews/edits even though the request is to give them privileges.

So why can't Uralg see his draft? The data and RPC say he should. The most likely remaining causes:

- **Stale React Query cache** with `queryKey: ['admin-blog-posts']` — a result from before the RPC fix is being served. The query has no `staleTime` override, so React Query will return cached data instantly on revisit and only refetch in background. If the prior result was an empty array (from when the RPC errored), the user keeps seeing "no posts" until refetch completes — and on a tab switch, that empty render happens first.
- **Missing search-bar match on draft status text.** `BlogPostsTab` filters on `post.title` and `post.status`. Fine for empty search, but worth double-checking nothing else strips drafts.
- **No status filter UI hint.** Admin has no visible "show drafts" toggle, so if there's a default filter elsewhere (there isn't in code I read, but worth confirming the rendered list component) the editor may think drafts are hidden.

I'll address the visibility issue and broaden permissions in one pass.

## The fix

### 1. Force-refresh the admin blog list and add visible draft affordance
- In `src/components/admin/blog/BlogPostsTab.tsx`: set `staleTime: 0`, `refetchOnMount: 'always'`, and `refetchOnWindowFocus: true` on the `admin-blog-posts` query so admins always see the freshest list including new drafts.
- Add a small status filter (All / Draft / Published / Scheduled) above the list so the editor in chief can isolate drafts at a glance and confirm visibility. Default = All.
- Add a "Draft" colored badge in `BlogPostList` rows if not already prominent (verify when implementing).

### 2. Make moderators first-class blog editors (per request)
- Update `can_manage_blog(_user_id)` to also include `moderator`:
  `role IN ('admin', 'blog_editor', 'author', 'moderator')`.
  This single change cascades to:
  - `get_admin_blog_posts()` (uses `can_manage_blog`) → moderators see all posts incl. drafts.
  - `blog_posts` RLS "Admins and blog editors can manage/view all posts" → moderators can edit/insert/update/delete and view drafts.
  - `blog_categories`, `blog_tags`, `blog_post_tags`, `polls`, `poll_options` policies that use `can_manage_blog_content()` → moderators get full management rights.

### 3. Give moderators (and staff writers) a Blog tab in Admin
- In `src/pages/Admin.tsx`:
  - Add `"moderator"` to the `roles` array on the `blog`, `polls`, and `quizzes` tabs (matching the user's "across the board" intent for editing/posting).
  - Replace the brittle `"staff_writer"` literal logic with the enum-aligned label `"blog_editor"`, OR keep `"staff_writer"` as the UI alias but document it. Simplest: keep `"staff_writer"` since `AdminUserManagement` already uses that as the display label and `useSecurityContext` derives `isStaffWriter` the same way. Just ensure moderator role also yields tab visibility.
- Default `activeTab` falls back to the first available tab — already handled by `tabOptions[0]?.value`.

### 4. Tighten the BlogPostDialog save path for non-admin editors
- `BlogPostDialog` already does `update`/`insert` with `author_id: user?.id`. The new RLS (with moderator added to `can_manage_blog`) covers ALL operations, so no additional change needed beyond verifying the dialog works for moderator role. No code change unless a regression appears.

### 5. Sanity migrations
- Single migration:
  - `CREATE OR REPLACE FUNCTION public.can_manage_blog(...)` to add `moderator` to the role list.
  - No need to recreate `get_admin_blog_posts` — it inherits via the function.
  - Re-run no-op `CREATE OR REPLACE` on `can_manage_blog_content` for clarity.

## Technical details

```text
can_manage_blog(_user_id)
   role IN ('admin', 'blog_editor', 'author', 'moderator')   <-- adds moderator
        |
        +-- used by RLS on blog_posts (manage + view drafts)
        +-- used by RPC get_admin_blog_posts
        +-- used (via can_manage_blog_content) by RLS on
            blog_categories, blog_tags, blog_post_tags,
            polls, poll_options
```

Files to change:
- `supabase/migrations/<new>.sql` — update `can_manage_blog`.
- `src/components/admin/blog/BlogPostsTab.tsx` — query freshness + status filter.
- `src/components/admin/blog/BlogPostList.tsx` — confirm draft badge prominence (read first; edit only if missing).
- `src/pages/Admin.tsx` — add `"moderator"` to blog/polls/quizzes tab roles.

## Verification after implementation

1. Sign in as Uralg323 → Admin → Blog: today's draft appears at top of list with a "Draft" badge.
2. Filter dropdown set to "Draft" → only drafts shown, including today's.
3. Click eye icon → `/blog/<slug>` renders draft (already works since `BlogDetail` honors `canManageBlog`).
4. Open draft, schedule by setting `published_at` to tomorrow + status `published` (or keep your existing scheduling flow) → save succeeds.
5. Sign in as a moderator-only user → Admin shows Blog/Polls/Quizzes tabs and they can view + edit drafts.

## What I'm NOT changing

- No changes to auth, session handling, or `useSecurityContext` (already fixed in prior turn).
- No new role added to the `app_role` enum — moderator already exists; we just expand what they can do for blog content as requested.
- No changes to public blog visibility — drafts remain hidden from non-staff users.
