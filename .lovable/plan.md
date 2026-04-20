

## Goal
Improve the Quiz page's logged-out state by replacing the quiz card with a compelling join/login CTA, while keeping the header with title, subtitle, and 5-tile rotating mosaic.

## Approach

**1. Modify `src/pages/Quiz.tsx`**
- Import `ThemedCard` components for the CTA card (consistent with quiz theming)
- Create an inline `QuizGuestCTA` component that:
  - Uses `ThemedCard` with `variant="dark"` and gold border styling
  - Title: "Ready to Take the Quiz?"
  - Subtitle: Benefits (earn badges, test your hip-hop knowledge, track progress)
  - Primary button linking to `/auth` with solid gold fill (per memory: Primary Button Style)
  - Secondary button or text mentioning "Already joined? Sign in"
- Conditionally render:
  - **Logged out**: Show the CTA card instead of `QuizContainer`
  - **Logged in**: Show `QuizContainer` as-is
- Badge display at bottom remains `user &&` conditional (only for logged-in users)

**2. Visual styling**
- Match existing GuestCallToAction pattern: black background, gold border/accents, gold button
- Keep the page header section (title, subtitle, mosaic) visible to all users as requested
- Use consistent theme tokens: `theme-primary` for gold accents, `theme-font-heading` for headings

## Files
- **Edit**: `src/pages/Quiz.tsx` (add conditional rendering for logged-out CTA)

