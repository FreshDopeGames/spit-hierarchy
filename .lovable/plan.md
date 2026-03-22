

## Plan: Add "Top Quote" Field & Display Card

### 1. Database Migration
Add `top_quote` column (TEXT, nullable, max ~300 chars) to the `rappers` table.

### 2. Admin Form Updates

**`src/components/admin/types/RapperFormTypes.ts`**: Add `top_quote: string` to `RapperFormData`.

**`src/components/admin/forms/RapperForm.tsx`**:
- Add `top_quote` to initial state and rapper-load logic
- Add a `Textarea` field labeled "Top Quote" above the MusicBrainz ID field (before line 372), with `maxLength={300}` and placeholder text
- Include `top_quote` in the `rapperData` object sent to Supabase

### 3. "Best Quote" Display Card on Rapper Detail Page

**Create `src/components/rapper/RapperBestQuote.tsx`**:
- A styled card with large quotation marks, italic text, rapper name attribution
- Only renders if `rapper.top_quote` exists
- Themed styling consistent with existing cards

**`src/pages/RapperDetail.tsx`**:
- Insert `<RapperBestQuote>` between `RapperHeader` (line 199) and `RapperBio` (line 202)

### Technical Notes
- The `rappers` table type will auto-update after migration, making `top_quote` available on the `Rapper` type
- No RLS changes needed — existing admin policies cover the new column

