

## Plan: Visually Separate Sign-Up CTA from Sign-In Flow

### Overview
When in login mode, replace the current subtle outline "New to the game? Join the Culture" button with a visually distinct section featuring a header ("First Time Here?") and a prominent gradient button ("Join the Community").

### Changes to `src/components/auth/AuthToggle.tsx`

When `isLogin` is true, render:
1. A divider line (matching the "Or continue with email" divider style)
2. A heading **"First Time Here?"** using `font-ceviche text-5xl` — matching the "Welcome Back" `CardTitle` styling in `AuthHeader.tsx`
3. A large gradient button **"Join the Community"** using the same `bg-gradient-to-r from-[#e39516] to-[#c0720c]` gradient as the Google and Sign In buttons
4. Keep the "Learn more" link below

When `isLogin` is false (sign-up mode), show the current "Already in the crew? Sign In" button as-is (outline style).

### Files
- **Modify**: `src/components/auth/AuthToggle.tsx`

