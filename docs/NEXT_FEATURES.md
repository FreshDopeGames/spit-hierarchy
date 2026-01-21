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
- [ ] Regional landing pages (/region/east-coast, etc.)
- [ ] Rapper comparison tool
- [ ] User-generated content moderation improvements
- [ ] Mobile app (PWA enhancements)

### Low Priority / Future
- [ ] Creator partnerships program
- [ ] Merchandise integration
- [ ] Live event coverage features
- [ ] Podcast/video content integration

---

## Recently Completed

_Move items here as they are finished, then archive periodically._

| Feature | Completed | Notes |
|---------|-----------|-------|
| Profile card border styling (100% opacity) | 2026-01-21 | My Top 5, Achievements, Cypher Journal, earned achievement cards |

---

## How to Use This Document

1. **Add new features**: Add to appropriate section (Backlog or Phase)
2. **Update status**: Change status column as work progresses
3. **Move completed items**: Shift to "Recently Completed" section
4. **Archive**: Periodically move old completed items to PROJECT_KNOWLEDGE.md
5. **Reference**: Link from other docs when discussing future work
