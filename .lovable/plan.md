

## Admin User Management + Moderator Role + Staff Writer Polls Access

### Summary
Add a **Users** tab to the admin panel for managing user roles. Introduce a **Moderator** role for comment deletion. Ensure **Staff Writers** (`blog_editor`) can also manage polls.

### Role Mapping (UI Label → DB Role)
- **Regular User** → no entry in `user_roles`
- **Staff Writer** → `blog_editor` (access: Blogs, Rankings, Quizzes, Polls)
- **Moderator** → `moderator` (access: delete comments, manage moderation flags)
- **Admin** → `admin` (full access)

### Database Changes

**1. Create `get_all_users_paginated` RPC** (security definer, admin-only)
- Joins `auth.users` with `profiles` and `user_roles`
- Accepts `page_number`, `page_size` (default 50), `search_term`
- Returns: id, email, username, avatar_url, role, created_at, total_count

**2. Create `set_user_role` RPC** (security definer, admin-only)
- Accepts `target_user_id` and `new_role` (text: 'user', 'staff_writer', 'moderator', 'admin')
- Maps 'staff_writer' → inserts `blog_editor` role
- Maps 'moderator' → inserts `moderator` role
- Maps 'admin' → inserts `admin` role
- Maps 'user' → deletes all roles for that user
- Prevents removing your own admin role

**3. Update `can_manage_blog_content()` function** — already includes `blog_editor`, no change needed.

**4. Add polls RLS policy for `blog_editor`** — Currently polls are admin-only. Add a new policy allowing `blog_editor` role to manage polls and poll_options:
```sql
CREATE POLICY "Staff writers can manage polls"
ON public.polls FOR ALL
USING (can_manage_blog_content())
WITH CHECK (can_manage_blog_content());

CREATE POLICY "Staff writers can manage poll options"
ON public.poll_options FOR ALL
USING (can_manage_blog_content())
WITH CHECK (can_manage_blog_content());
```

**5. Moderator comment deletion** — The existing RLS policy `"Admins can delete any comment"` on `comments` only allows admins. Add:
```sql
CREATE POLICY "Moderators can delete comments"
ON public.comments FOR DELETE
USING (is_moderator_or_admin());
```

### Frontend Changes

**1. New component: `src/components/admin/AdminUserManagement.tsx`**
- Paginated table (50 per page) with columns: Username, Email, Role, Joined
- Search input to filter by username/email
- Role dropdown per row: Regular User / Staff Writer / Moderator / Admin
- Confirmation dialog before role changes
- Prev/Next pagination controls

**2. Update `src/pages/Admin.tsx`**
- Add "Users" tab to `tabOptions`
- Add case in `renderTabContent()` switch
- Adjust grid columns for the extra tab (8+7 split)

**3. Update `src/hooks/useSecurityContext.tsx`**
- Add `isStaffWriter` boolean derived from `canManageBlog` check
- Used to conditionally show a limited set of admin tabs for staff writers

**4. Update Admin page access**
- Allow staff writers (`blog_editor`) and moderators to access the admin page
- Staff writers see only: Blog, Rankings, Quizzes, Polls tabs
- Moderators see only: a Comments/Moderation tab (existing moderation features)
- Admins see all tabs including Users

