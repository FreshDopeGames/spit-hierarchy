

## Plan: Add "Top Quote Song Title" Field

### 1. Database Migration
Add `top_quote_song` column (TEXT, nullable) to the `rappers` table.

### 2. Admin Form Updates

**`src/components/admin/types/RapperFormTypes.ts`**: Add `top_quote_song: string`.

**`src/components/admin/forms/RapperForm.tsx`**:
- Add `top_quote_song: ""` to initial state and rapper-load logic
- Add an Input field labeled "Quote Song Title" directly below the Top Quote textarea
- Include `top_quote_song` in the data sent to Supabase

### 3. Display on Rapper Detail

**`src/components/rapper/RapperBestQuote.tsx`**: Accept optional `songTitle` prop. If present, display it below the rapper name attribution (e.g. `— Rapper Name, "Song Title"`).

**`src/components/rapper/ShareQuoteModal.tsx`**: Accept optional `songTitle` prop and include it in both square and portrait export layouts below the rapper name.

**`src/pages/RapperDetail.tsx`**: Pass `top_quote_song` to `RapperBestQuote`.

### Files
- **Migration**: Add `top_quote_song` TEXT column
- **Modify**: `RapperFormTypes.ts`, `RapperForm.tsx`, `RapperBestQuote.tsx`, `ShareQuoteModal.tsx`, `RapperDetail.tsx`

