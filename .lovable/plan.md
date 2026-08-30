# Smarter Name Matching for Trending Rappers

Rappers whose names are ordinary words ("Evidence", "Common", "Future", "Nas"-adjacent cases) currently match any article that happens to use the word, inflating the trending list and polluting the "In The News" cards. Today the only defense is a hardcoded blocklist plus a small case-sensitive list inside the edge function, which is both too blunt (blocks the artist entirely) and too narrow (only a handful of names are covered).

## What changes for you

- Ambiguous, dictionary-word rapper names only count when the article actually looks like it is talking about the artist.
- Nothing is silently blocked anymore: an ambiguous artist can still trend, it just needs real evidence.
- An admin-controlled flag per rapper lets you mark a name as "needs context" (or force it back to normal matching) without a code change.

## Approach

1. **Per-rapper flag.** Add a `requires_context_match` boolean (default false) to the `rappers` table, editable from the admin rapper edit overlay. Seed it as true for names that are single common English words, so the current problem cases are covered immediately.

2. **Context gate in the matcher.** When a rapper is flagged (or its name is a single word on the built-in common-word list), a mention only counts if the match passes at least one confirmation check:
   - The name appears with the exact capitalization of the artist's display name, AND
   - one of: a hip-hop context keyword near the match (rapper, MC, album, mixtape, single, track, verse, bars, feat./featuring, dropped, drops, LP, EP, tour, video), or the match sits inside quotes/possessive form, or another already-confirmed rapper is mentioned in the same item, or the feed itself is rap-only (2DOPEBOYZ, HipHopDX, r/hiphopheads, etc. — for these, the keyword requirement relaxes but exact-case is still required).

3. **Retire the blunt blocklist.** Names currently hard-blocked (`future`, `common`, `game`, `boss`, `king`, `ice`, `big`…) move to the context-gated path instead of being dropped, so those artists become eligible again but only with real signal. Generic non-artist words that are not any rapper's name stay blocked.

4. **Alias handling.** Short or word-like aliases get the same context gate; the full display name never loses out because of an alias rejection.

5. **Observability.** The function logs rejected candidate matches (name, source, headline, reason) so tuning is possible from edge function logs, and the response payload includes a `rejected_count`.

## Technical details

- Migration: `ALTER TABLE public.rappers ADD COLUMN requires_context_match boolean NOT NULL DEFAULT false;` plus a one-time `UPDATE` flagging single-word names that intersect a common-word list. Existing grants/RLS unchanged.
- `supabase/functions/generate-trending-rappers/index.ts`: replace `BLOCKLIST` / `CASE_SENSITIVE_NAMES` gate with a `needsContext(ref)` check and a `confirmMatch(item, ref, matchIndex)` helper that inspects a ±120 character window around the match for context keywords, checks exact-case, and consults the set of unambiguous rappers already matched in the same item (two-pass: unambiguous names first, ambiguous second).
- Media mentions are only written for confirmed matches, so `rapper_media_mentions` stops accumulating false-positive articles. Existing false positives already stored will age out via the 30-day prune; the plan can also include a one-time cleanup for flagged rappers if you want it.
- Admin UI: one checkbox ("Require hip-hop context for news matching") in the rapper edit form, alongside the aliases field.

## Verification

Run the function manually after deploy, compare the top 5 and the logged rejections against the previous run, and spot-check `/rapper/evidence` for only genuine stories.
