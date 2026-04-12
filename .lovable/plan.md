

## Plan: Add IP-Based Geolocation Disclosure to Privacy Policy

### What changes
Add a new section to the Privacy Policy (as section 8, bumping current 8-12 to 9-13) disclosing IP-based geolocation data collection for voter analytics, covering:

- **What we collect**: Approximate geographic location (country, state/region, city) derived from your IP address
- **How we collect it**: Automatically via a server-side geolocation lookup when you interact with the platform while logged in
- **Why**: To provide geographic voting analytics and regional community insights
- **What we store**: Only the derived location (country, region, city) — not the IP address itself
- **Legal basis**: Legitimate interest (GDPR) / disclosed in this policy (CCPA)
- **Your rights**: Location data is subject to the same access, deletion, and correction rights listed in Section 9 (renumbered)
- **Opt-out**: Users can request deletion of their location data via support channels

Also update the "Last updated" date to April 2026.

### File modified
- `src/pages/PrivacyPolicy.tsx` — insert new section, renumber subsequent sections, update date

