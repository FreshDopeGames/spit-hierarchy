# Next Features Roadmap

This document tracks upcoming features, improvements, and the platform's monetization progression. Items are moved or removed as they are completed.

---

## Monetization Progression Phases

### Phase 1: Foundation (Current)
**Goal**: Complete bio expansion → Get AdSense approved

| Task | Status | Notes |
|------|--------|-------|
| Expand 299+ rapper biographies to 500+ words | In Progress | Required for AdSense "original content" approval |
| Publish 20-30 blog articles (800-1200 words each) | Planned | See GOOGLE_ADSENSE_APPROVAL_STRATEGY.md |
| Create educational pages (How We Rank, Glossary) | Planned | Establishes editorial authority |
| Submit for AdSense re-review | Blocked | Waiting on content expansion |

**Success Criteria**: Google AdSense approval with ad units displaying on site

---

### Phase 2: Engagement Gates
**Goal**: Soft paywall with engagement gates → Test user interest

| Task | Status | Notes |
|------|--------|-------|
| Implement quiz-gated feature unlocks | Planned | e.g., "Answer 3 quiz questions to unlock VS Matches today" |
| Add engagement requirements for premium features | Planned | Daily engagement actions to access content |
| Track feature unlock conversion rates | Planned | Analytics to measure user interest |
| A/B test different gate types | Planned | Quiz gates vs voting gates vs other engagement |

**Features to Gate** (Planned):
- VS Matches (head-to-head battles)
- Advanced Analytics
- Poll participation
- Quiz access
- Premium blog content

**Success Criteria**: Data on user willingness to complete engagement tasks for premium access

---

### Phase 3: Subscription Conversion
**Goal**: Stripe subscription integration → Convert engaged users to paying subscribers

| Task | Status | Notes |
|------|--------|-------|
| Enable Stripe integration | Planned | See Lovable Stripe integration docs |
| Create subscription tiers (Free/Pro/Premium) | Planned | Define feature access per tier |
| Build subscription management UI | Planned | Account settings, billing history |
| Implement paywall for premium features | Planned | Replace engagement gates with payment |
| Add subscriber-only benefits | Planned | Badge, vote weight bonus, exclusive content |

**Subscription Tier Concepts** (Draft):
- **Free**: Core features (rankings, Top 5, basic voting, Community Cypher)
- **Pro** ($X/month): VS Matches, Quizzes, Polls, Advanced Analytics
- **Premium** ($Y/month): All Pro features + priority support, exclusive content, enhanced vote weight

**Success Criteria**: Paying subscribers generating recurring revenue

---

## Feature Backlog

### High Priority
- [ ] Social authentication restoration (Google, Facebook, Twitter)
- [ ] Google Analytics integration (Phase 2 of cookie consent)
- [ ] IP geolocation for region detection
- [ ] Push notification campaigns

### Medium Priority
- [ ] YouTube video buttons on album tracklist (edge function + YouTube Data API + caching table)
- [ ] Regional landing pages (/region/east-coast, etc.)
- [ ] Rapper comparison tool
- [ ] User-generated content moderation improvements

### Low Priority / Future
- [ ] Creator partnerships program
- [ ] Merchandise integration
- [ ] Live event coverage features
- [ ] Podcast/video content integration

---

## Planned: Official Album Reviews in Blog Posts

Let admins turn a blog post into an official Spit Hierarchy album review: pick the album (from our DB, or import it fresh from MusicBrainz), score it on the same five metrics users rate albums with, and publish a manual overall score out of 5.

### Data model

- **`album_reviews`** table — one review per blog post
  - links to a blog post and to an album
  - `overall_score` — admin-entered, 0.5–5.0 in half-star steps (manual)
  - `verdict` — short one-line summary shown in the score card
  - `reviewer_id` — the admin who scored it
  - unique on blog post; unique on album so one album has one official review
- **`album_review_scores`** table — one row per review per metric
  - reuses existing `album_voting_categories` (Production, Lyricism, Cohesion, Replay Value, Cultural Impact), scored 1–10 like the community modal
  - granular editorial metrics; displayed as a breakdown but do **not** drive the overall number
- **Access rules**: anyone can read reviews attached to published posts; admins and blog editors can create/edit/delete. Grants for `anon`, `authenticated`, `service_role` included in the migration.

### Album lookup in the new/edit blog post overlay

- Toggle: "This post is an album review"
- Search box searches our `albums` table first (title + artist), showing cover, artist, release year
- If nothing matches, a "Search MusicBrainz" fallback lists release-groups from MB (artist-scoped when an artist is picked), showing title, type, first release date
- Selecting a MusicBrainz result imports it: creates the `albums` row (title, MBID, release date, type, track count, label), links it to the artist via `rapper_albums`, caches cover art into the existing `album-covers` bucket, and optionally pulls the tracklist — reusing the logic and rate-limit handling already in the discography functions
- Once an album is attached, the five metric sliders (1–10) appear, an equal-weight suggested score is displayed for reference, and the admin types the final score out of 5
- Everything saves alongside the post so drafts keep their scores

### Display

- **Blog post page**: score card near the top — album cover, artist/album title (linking to the album detail page), large /5 star score, verdict line, and the five-metric breakdown bars. Review metadata added to the post's structured data so search engines see a rating.
- **Album detail page**: editorial score shown beside the existing community rating ("Spit Hierarchy Review: 4.5/5"), with a link to the full review post. Community average stays unchanged and separate — editorial and user scores are never blended.

### Technical notes

- Two new Supabase edge functions: one to search MusicBrainz release-groups, one to import a selected release into `albums` + `rapper_albums` (both admin-gated, honoring the existing 1100ms MusicBrainz delay and audit logging)
- New hooks: `useAlbumReview(albumId | postId)` for reads and an admin mutation hook for saving review + metric rows in one transaction-like call, with `.select('id')` verification per the project's silent-RLS-failure rule
- Metric definitions come from `album_voting_categories`, so adding a category later flows into both user ratings and editorial reviews
- Editorial scores are stored independently of `album_votes`, so `recompute_album_rating_aggregates` and the community average are untouched
- Admin dropdowns/inputs in the new section follow the existing themed dark-overlay styling

---

## Recently Completed

_Move items here as they are finished, then archive periodically._

| Feature | Completed | Notes |
|---------|-----------|-------|
| Profile card border styling (100% opacity) | 2026-01-21 | My Top 5, Achievements, Cypher Journal, earned achievement cards |
| PWA enhancements (Mobile app) | 2026-01-21 | Install prompts, platform detection, push notifications, Workbox caching |

---

## How to Use This Document

1. **Add new features**: Add to appropriate section (Backlog or Phase)
2. **Update status**: Change status column as work progresses
3. **Move completed items**: Shift to "Recently Completed" section
4. **Archive**: Periodically move old completed items to PROJECT_KNOWLEDGE.md
5. **Reference**: Link from other docs when discussing future work
