

## Plan: Replace "Pharaoh Not Found" with Rapper Not Found + Inline Search

### Overview
Replace the current "Pharaoh Not Found" card in `RapperDetail.tsx` with a user-friendly "Rapper Not Found" message, an inline search bar (reusing existing search hooks), and a "Suggest a Rapper to Admins" link.

### Changes

**`src/pages/RapperDetail.tsx`** (lines 142-147)

Replace the existing `ThemedCard` content with:
- **Heading**: "Rapper Not Found"
- **Description**: "Our rapper database is growing, but we don't have that one yet! Try a different spelling, or suggest one to the admins."
- **Inline search bar**: Uses `useRapperAutocomplete` hook with a styled input + results dropdown (rapper avatars, names, click to navigate)
- **"Suggest a Rapper to Admins" button**: Uses `useCanSuggestRappers` + `RapperSuggestionModal` (same pattern as `GlobalSearch.tsx` and `AllRappersEmptyState.tsx`)

New imports needed: `useState`, `useRapperAutocomplete`, `useCanSuggestRappers`, `RapperSuggestionModal`, `Search`, `Music`, `Loader2` icons.

The search bar will be a simplified inline version — text input with search icon, results list below showing matching rappers (avatar + name, clickable to navigate), and "No results" state with the suggest button. The suggest button also appears below the search bar by default for easy access.

### Files
- **Modify**: `src/pages/RapperDetail.tsx`

