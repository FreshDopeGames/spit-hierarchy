

# Revise Weekly Rap-Up Tone and Cadence

## Problems Identified

1. **Cookie-cutter openings** -- Every post starts with nearly the same "What up, people? It's once again that time..." line
2. **Forced "creator lesson" syndrome** -- Every single bullet shoehorns in advice for "independent creators" or "emerging artists," making the whole thing read like a motivational newsletter instead of a hip-hop blog
3. **Section overlap** -- The same stories appear in both "Top 5 Headlines" and "New Drops," wasting space
4. **Generic Community Check-In** -- Always "hit the comments below" with no reference to actual Spit Hierarchy features like voting or rankings
5. **Double-linking bug** -- The rapper mention post-processor wraps names that already appear inside markdown link URLs, creating broken nested links like `[Drizzy](https://spithierarchy.com/rapper/[drake](...))` 

## Changes

### 1. Rewrite the AI System Prompt

**File: `supabase/functions/generate-weekly-hip-hop-roundup/index.ts`**

Update the `systemPrompt` variable with these tone/cadence changes:

- **Varied openings**: Instruct the AI to rotate opening styles (direct headline lead-in, rhetorical question, bold statement about the week) -- explicitly say "Do NOT start with 'What up, people' or any version of 'It's that time again'"
- **Cut the preachiness**: Remove instructions about "weave in references to hustle" and "independent creators" from every bullet. Instead, limit the creator/hustle angle to ONLY the Deep Move Spotlight section where it fits naturally. Headlines and New Drops should just be sharp commentary, not life lessons
- **No duplicate stories**: Add explicit instruction that a story covered in Top 5 Headlines must NOT reappear in New Drops
- **Specific Community Check-In**: Replace generic "hit the comments" with instructions to reference actual Spit Hierarchy features -- voting on rapper rankings, checking out rapper profiles, upcoming battles, etc.
- **Tighter word count**: Reduce from 400-600 words to 350-500 to cut the filler
- **More personality, less formula**: Encourage humor, hot takes, and unpredictable phrasing rather than the same cadence every week

### 2. Fix the Double-Linking Bug

**File: `supabase/functions/generate-weekly-hip-hop-roundup/index.ts`**

Update the `wrapRapperMentionsWithLinks` function:

- Add a check to skip replacement when the match is already inside a markdown link (both the text portion `[...]` and the URL portion `(...)`)
- The current negative lookahead `(?![^\[]*\])` only checks if the match is inside `[...]` brackets but doesn't prevent matches inside `(...)` URL parentheses
- Add a second check: skip if the match position falls between `(` and `)` that are part of a markdown link pattern

### 3. Instruct AI to Use Canonical Rapper Names

**File: `supabase/functions/generate-weekly-hip-hop-roundup/index.ts`**

- Pass the list of rapper names from the database into the user prompt so the AI uses exact spellings
- Add instruction: "When mentioning rappers, use their name exactly as written -- do NOT add markdown links yourself, links will be added automatically in post-processing"
- This prevents the AI from creating its own `[rapper](url)` links that then get double-wrapped by the post-processor

## Technical Details

### System Prompt Revision (key changes)

```
Old: "Example opening: 'What up, people? It's once again that time...'"
New: "Vary your opening every week. NEVER start with 'What up people' or 
     'It's that time again.' Try: leading with the biggest headline, a 
     rhetorical question, a bold cultural statement, or a quick-hit summary 
     of the week's energy."

Old: "Weave in references to hustle, culture, creative control"
New: "Save the hustle/creator angle for the Deep Move Spotlight only. 
     Headlines and New Drops should be pure commentary -- witty, opinionated, 
     and brief. No life lessons in bullet points."

Old: "End with a call to action for voting/commenting on Spit Hierarchy"
New: "End with a SPECIFIC call to action referencing Spit Hierarchy features: 
     vote on rapper rankings, check a specific rapper's profile, weigh in on 
     a debate in the rankings, etc. Never use generic 'hit the comments below.'"

Add: "Stories in Top 5 Headlines MUST NOT repeat in New Drops. Each section 
     covers different stories."
```

### Double-Link Fix

Update the regex in `wrapRapperMentionsWithLinks` to also skip matches inside URL parentheses:

```typescript
// Before replacing, check if position is inside a markdown URL
const beforeMatch = processedContent.slice(0, offset);
const openParens = (beforeMatch.match(/\]\(/g) || []).length;
const closeParens = (beforeMatch.slice(beforeMatch.lastIndexOf(']('))
  .match(/\)/g) || []).length;
if (openParens > closeParens) {
  return match; // Inside a URL, don't wrap
}
```

Also add instruction to the AI prompt: "Do NOT add any markdown links to rapper names. Links are added automatically after generation."

### User Prompt Enhancement

Pass rapper names to the AI so it uses correct spellings:

```typescript
const rapperNamesList = rappers.map(r => r.name).join(', ');
const userPrompt = `Here are this week's hip-hop articles...\n\n${articlesContext}\n\n
Artists in our database (use exact names, do NOT add links to them): ${rapperNamesList}\n\n
Write the weekly roundup blog post.`;
```

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/generate-weekly-hip-hop-roundup/index.ts` | Rewrite system prompt for better tone/variety; fix double-linking bug; pass rapper names to AI; tell AI not to link rappers |

