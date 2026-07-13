## Fix rapper avatar upload RLS failure

### Root cause
Storage INSERT on `rapper-images` requires `public.has_role(auth.uid(), 'admin')`. The upload fails with "new row violates row-level security policy", meaning that check returns false for the current session at the storage layer — even though the admin UI gate passes (which uses a direct `user_roles` query, not the helper).

The most likely reasons the helper returns false inside a storage policy:
- `has_role(_user_id uuid, _role text)` is defined with `_role text`, but `user_roles.role` is the `app_role` enum. The text→enum comparison can silently mismatch depending on the search_path (the function sets `search_path=''`, so the `app_role` type isn't found unqualified).
- Storage schema policies evaluate under a different search_path than public, amplifying the above.

### Changes

1. **Migration — fix `has_role` and storage policies**
   - Recreate `public.has_role` with signature `(_user_id uuid, _role public.app_role)` so the enum comparison is unambiguous, keeping `SECURITY DEFINER STABLE` and `SET search_path = public`.
   - Keep a text-accepting overload `public.has_role(uuid, text)` that casts to `public.app_role` for any existing callers.
   - Drop and recreate the `rapper-images` and `header-images` storage policies (INSERT/UPDATE/DELETE) to call `public.has_role(auth.uid(), 'admin'::public.app_role)`.
   - No changes to `avatars` bucket policies.

2. **Frontend — admin preflight in `useRapperAvatarUpload`**
   - Before the first `storage.upload`, verify the current user has the admin role via `user_roles`.
   - If not, abort with a clear "Admin permissions could not be confirmed — please sign out and back in" error instead of hitting storage.

3. **Verification**
   - Re-query `pg_policies` for `storage.objects` on `rapper-images` and confirm the new predicate.
   - Confirm `has_role` overloads exist and both return true for a known admin user id via `supabase--read_query`.

### Notes
- Admin-only access is preserved.
- No storage files are touched.
- No changes to profile avatar uploads.