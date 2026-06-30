## Verified Artist Profiles

Give real rappers / their social media managers a way to claim and operate their own profile, with distinctive comment styling and limited site permissions.

---

### 1. Data model (migration)

New table `public.rapper_claims`:
- `rapper_id` (FK rappers, unique — enforces 1:1)
- `user_id` (FK auth.users, unique — a user can only own one rapper)
- `status` enum: `pending`, `approved`, `rejected`
- `claim_method` enum: `self_request`, `admin_assigned`
- `proof_url` text (optional, e.g. link to Instagram post confirming identity)
- `reviewed_by`, `reviewed_at`, `notes`
- Standard timestamps

New enum value on `app_role`: `verified_artist`. Inserted into `user_roles` automatically when a claim is approved (via trigger).

Helper functions:
- `is_verified_artist(_user_id uuid) returns boolean`
- `get_verified_rapper_id(_user_id uuid) returns uuid` — returns the rapper they own, or null
- `is_verified_for_rapper(_user_id uuid, _rapper_id uuid) returns boolean`

All `SECURITY DEFINER`, used in RLS to avoid recursion.

RLS additions:
- `ranking_votes` INSERT policy: block when `is_verified_artist(auth.uid())` is true.
- `rappers` UPDATE policy: allow when `is_verified_for_rapper(auth.uid(), id)` — but restrict updatable columns via a trigger to only `bio`, `instagram_handle`, `twitter_handle`, `homepage_url`, `spotify_id` (everything else reverts to OLD value). Updates by verified artists also flip a `pending_review` flag for moderator approval (reuses existing moderation patterns).
- `comments` already lets users post; no policy change needed — styling is presentation-only.

### 2. Claim flows

**Self-claim** (rapper detail page, logged in, not already verified):
- "Claim this profile" button → modal asking for proof URL + short note → inserts `rapper_claims` row with `status='pending'`, `claim_method='self_request'`.
- Triggers a notification to all admins.

**Admin assignment** (admin panel → rapper edit dialog → new "Verification" tab):
- Search user → assign → inserts approved claim, grants `verified_artist` role.

**Admin review queue** (new admin page `/admin/verifications` or new tab in existing admin):
- Lists pending claims with rapper, requesting user, proof link.
- Approve → sets `status='approved'`, grants role via trigger.
- Reject → sets `status='rejected'` with reason, notifies user.

### 3. Comment styling — "Full highlighted card"

Update `CommentItem.tsx` (and `CypherComments`, `VSMatchComments`, blog comments — anywhere the same component renders):
- Detect verified author via a new field returned by the comments query: join `rapper_claims` (approved) on `comments.user_id` to get `verified_rapper: { id, name, slug, image_url }`.
- When present:
  - Outer card: 2px gold border (`border-[hsl(var(--theme-primary))]`), subtle gold-to-transparent gradient background, faint inner glow.
  - Avatar: swap user avatar for the rapper's `xlarge` image, with a small gold check badge in the bottom-right corner.
  - Display name: rapper name (links to `/rapper/{slug}`) with "Verified Artist" pill underneath in gold.
  - Small "official" tag inline next to the timestamp.
- Add a "Pin to top" affordance only on comments authored by the verified owner on their own rapper page — out of scope for this pass per your selection; we'll leave room for it but not build it.

Site-wide highlighting (your selection): the verified styling applies on **every** comment they post (blog, VS matches, cypher, other rapper pages), since `verified_rapper` is resolved from the author, not the page context.

### 4. Voting / quiz permission changes

- `useRankingVotes` / `useDailyVoteStatus`: surface `isVerifiedArtist` from a new `useVerifiedArtist()` hook and disable vote buttons with tooltip "Verified artists can't vote on rankings."
- Server-side enforcement still happens via the RLS policy above.
- VS match votes (`vs_match_votes`) and quiz attempts (`user_quiz_attempts`) — no changes; verified artists keep access.

### 5. Profile editing for verified artists

- New page `/my-rapper` (or new tab inside existing `UserProfile`): if the logged-in user owns a rapper, show an edit form scoped to allowed fields (bio, IG, Twitter, homepage, Spotify ID).
- On save, write to `rappers`; trigger flips moderation flag; admin sees the pending edit in the existing moderation surface.
- Public rapper page continues to show the last approved values until moderation clears the new ones.

### 6. New hooks / components

- `src/hooks/useVerifiedArtist.tsx` — returns `{ isVerifiedArtist, ownedRapperId, ownedRapper }` for current user.
- `src/hooks/useRapperClaim.tsx` — submit/cancel claim, read current claim status for a rapper.
- `src/components/rapper/ClaimProfileButton.tsx` — on `RapperHeader`.
- `src/components/comments/VerifiedArtistBadge.tsx` — reusable pill.
- `src/components/admin/verifications/VerificationQueue.tsx` — admin review UI.
- `src/components/admin/rapper-edit/VerificationTab.tsx` — admin-side direct assignment.
- `src/pages/MyRapper.tsx` — verified-artist edit form.

### 7. Notifications

Reuse existing `notifications` table:
- On self-claim submission → notify admins.
- On approval/rejection → notify the requesting user.
- On verified-artist edit submission → notify moderators.

### 8. Out of scope (call out for later)

- Pinning comments on own profile.
- Verified-artist analytics (who's viewing my profile, etc.).
- Multi-manager support (currently strict 1:1).
- Verified artists posting blog/journal entries as the rapper persona.

---

### Implementation order

1. Migration: `rapper_claims` table, enum, helper functions, RLS updates, trigger to grant role.
2. Hooks: `useVerifiedArtist`, `useRapperClaim`; update comment queries to join verified info.
3. Comment styling pass across `CommentItem`, `CypherComments`, `VSMatchComments`, blog comments.
4. `ClaimProfileButton` on rapper page + claim modal.
5. Admin verification queue + admin-assign tab.
6. Voting gates (UI + RLS already in step 1).
7. `/my-rapper` edit page + moderation hookup.
8. Notifications wiring.
