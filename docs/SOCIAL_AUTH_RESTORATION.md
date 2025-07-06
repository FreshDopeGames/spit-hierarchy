
# Social Authentication Restoration Guide

This guide explains how to restore social authentication functionality that was temporarily removed.

## Files to Restore

### 1. SocialAuthButtons Component
File: `src/components/auth/SocialAuthButtons.tsx`
- Currently commented out with `/* SOCIAL_AUTH_DISABLED` markers
- Uncomment the entire component
- Update any TypeScript interfaces if needed

### 2. Auth Page Integration
File: `src/pages/Auth.tsx`
- Uncomment `SocialAuthButtons` import
- Uncomment `socialLoading` state
- Uncomment `handleSocialAuth` function
- Uncomment social buttons rendering
- Restore "Or continue with email" divider

### 3. TypeScript Interfaces
File: `src/components/auth/AuthForm.tsx` (if social-related props were added)
- Look for `// FUTURE_USE:` comments
- Uncomment social authentication related interfaces

## Step-by-Step Restoration

### Step 1: Restore SocialAuthButtons Component
1. Open `src/components/auth/SocialAuthButtons.tsx`
2. Remove `/* SOCIAL_AUTH_DISABLED` comment blocks
3. Ensure all imports are working
4. Test component renders without errors

### Step 2: Restore Auth Page Social Integration
1. Open `src/pages/Auth.tsx`
2. Uncomment lines marked with `// SOCIAL_AUTH_RESTORATION_POINT`
3. Restore these sections:
   - Import statement for SocialAuthButtons
   - socialLoading state declaration
   - handleSocialAuth function
   - SocialAuthButtons component usage
   - Email divider section

### Step 3: Configure Supabase Providers
1. Follow setup guides in `SOCIAL_AUTH_SETUP.md`
2. Enable desired providers in Supabase Dashboard
3. Configure OAuth apps in respective provider consoles

### Step 4: Update Environment Configuration
1. Add any required environment variables
2. Update Supabase URL configuration
3. Test redirect URLs

### Step 5: Test Each Provider
1. Test Google sign-in
2. Test Facebook sign-in  
3. Test Twitter sign-in
4. Verify user creation and profile setup
5. Test sign-out functionality

## Code Markers to Look For
- `/* SOCIAL_AUTH_DISABLED` - Start of disabled code blocks
- `SOCIAL_AUTH_DISABLED */` - End of disabled code blocks
- `// SOCIAL_AUTH_RESTORATION_POINT` - Lines to uncomment
- `// FUTURE_USE:` - Preserved types and interfaces

## Verification Checklist
- [ ] Social buttons render correctly
- [ ] Each social provider redirects properly
- [ ] User accounts are created successfully
- [ ] Profile data is populated from social providers
- [ ] Error handling works for failed authentication
- [ ] Loading states work correctly
- [ ] UI layout looks proper with all buttons

## Support Resources
- Supabase Auth Documentation: https://supabase.com/docs/guides/auth
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Facebook Login: https://developers.facebook.com/docs/facebook-login/web
- Twitter OAuth: https://developer.twitter.com/en/docs/authentication/oauth-2-0
