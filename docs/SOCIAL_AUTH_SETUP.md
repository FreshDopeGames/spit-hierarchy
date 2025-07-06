
# Social Authentication Setup Guide

This guide contains complete instructions for setting up and re-integrating social authentication providers with Supabase.

## Prerequisites
- Supabase project configured
- Access to provider developer consoles
- Domain/redirect URLs configured

## Google OAuth Setup

### 1. Google Cloud Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Navigate to "Consent Screen" configuration page
4. Under "Authorized domains", add your Supabase project domain: `<PROJECT_ID>.supabase.co`
5. Configure non-sensitive scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`

### 2. OAuth Client ID Setup
1. Go to API Credentials page
2. Click "Create credentials" → "OAuth Client ID"
3. Choose "Web application"
4. Under "Authorized JavaScript origins", add your site URL
5. Under "Authorized redirect URLs", add: `https://<PROJECT_ID>.supabase.co/auth/v1/callback`
6. Save Client ID and Client Secret

### 3. Supabase Configuration
1. In Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add Client ID and Client Secret from Google Console
4. Configure redirect URL in Authentication → URL Configuration

## Facebook OAuth Setup

### 1. Facebook Developer Account
1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Create new app or use existing
3. Add "Facebook Login" product
4. In Facebook Login settings, add valid OAuth redirect URIs:
   - `https://<PROJECT_ID>.supabase.co/auth/v1/callback`

### 2. App Configuration
1. Get App ID and App Secret from App Dashboard
2. Configure permissions: `email`, `public_profile`
3. Set app domain to your site domain

### 3. Supabase Configuration
1. Enable Facebook provider in Supabase Dashboard
2. Add App ID and App Secret
3. Configure redirect URLs

## Twitter/X OAuth Setup

### 1. Twitter Developer Portal
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create new app or use existing
3. Navigate to "User authentication settings"
4. Enable OAuth 2.0
5. Set callback URL: `https://<PROJECT_ID>.supabase.co/auth/v1/callback`
6. Get Client ID and Client Secret

### 2. Permissions
1. Ensure "Read and Write" permissions are enabled
2. Configure OAuth 2.0 settings properly

### 3. Supabase Configuration
1. Enable Twitter provider in Supabase Dashboard
2. Add Client ID and Client Secret
3. Configure redirect URLs

## Environment Variables Required

```bash
# These would be configured in Supabase Edge Functions if needed
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

## Supabase URL Configuration
Make sure these are set in Authentication → URL Configuration:
- Site URL: Your production domain
- Redirect URLs: Include both development and production URLs

## Testing Checklist
- [ ] Google sign-in works in development
- [ ] Google sign-in works in production
- [ ] Facebook sign-in works in development
- [ ] Facebook sign-in works in production
- [ ] Twitter sign-in works in development
- [ ] Twitter sign-in works in production
- [ ] Email confirmation flows work
- [ ] User profiles are created correctly
- [ ] Redirect after auth works properly

## Common Issues
1. **"requested path is invalid"** - Check Site URL and Redirect URLs in Supabase
2. **Unauthorized errors** - Verify client IDs and secrets
3. **CORS issues** - Ensure all domains are whitelisted in provider consoles
4. **Redirect loops** - Check redirect URL configuration
