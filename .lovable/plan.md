

## Plan: Enforce Username for All Users

### Problem
1. Username is optional during sign-up (users can skip the onboarding modal)
2. Users who sign in via Google OAuth get auto-generated usernames that look like email addresses
3. No enforcement to set a proper username after login

### Approach

Create a new **`UsernameEnforcementModal`** component that displays a blocking modal when:
- User is authenticated
- Their profile username is missing, empty, or looks like an email (contains `@`)

This modal cannot be dismissed — it requires setting a valid username before continuing.

### Changes

#### 1. New component: `src/components/auth/UsernameEnforcementModal.tsx`
- A blocking `Dialog` (no close button, `onOpenChange` disabled) that:
  - Shows messaging about style and anonymity: "Choose a username that represents your style. This keeps your identity anonymous while you rep your favorites."
  - Reuses the same username validation logic from `OnboardingModal` (check availability, 3-30 chars, alphanumeric + `_` and `-`)
  - On save, updates the `profiles` table and invalidates relevant query caches
  - No skip/close option

#### 2. New hook: `src/hooks/useUsernameCheck.ts`
- Fetches the current user's profile username
- Returns `needsUsername: boolean` — true if username is null, empty, or matches an email pattern (`/@/` test)
- Uses `useAuth()` for the user ID

#### 3. Wire into `src/main.tsx`
- Add `UsernameEnforcementModal` inside the provider tree (after `SecureAuthProvider`, before `OnboardingProvider`) so it takes priority over onboarding

#### 4. Update sign-up in `src/components/auth/AuthForm.tsx`
- Username field is already present and marked with `*` but `required` is only set when `!isLogin`
- Add client-side validation: prevent submit if username is empty or invalid during sign-up (already mostly done via `validateUsername`)
- No changes needed here — existing validation already enforces it on the form level

#### 5. Update `src/components/onboarding/OnboardingModal.tsx`
- Skip step 2 (username) if the user already has a valid username (since the enforcement modal handles it)
- This avoids double-prompting

### Technical Details

**Email-like username detection:**
```typescript
const looksLikeEmail = (username: string) => username.includes('@');
```

**Modal priority:** The enforcement modal renders unconditionally when `needsUsername` is true, blocking all other UI. It sits above `OnboardingProvider` in the tree so it fires first.

**Cache invalidation on save:** Invalidate `['own-profile']`, `['public-profile-minimal']`, and `['profile-for-display']` after username update.

