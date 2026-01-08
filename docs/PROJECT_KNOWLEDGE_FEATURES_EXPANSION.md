# Expanded Feature Documentation

This document provides detailed documentation for advanced features that are implemented in the Rapper Ranking Platform.

---

## VS Matches System

### Overview
Head-to-head rapper matchup system where users vote for their favorite rapper in curated battles.

### Core Features
- **VS Match Creation**: Admin-managed matchups with custom titles and descriptions
- **Voting System**: One vote per user per match with real-time tallying
- **Vote Distribution**: Visual representation of voting percentages
- **Comments Section**: Threaded discussions on each VS match
- **Search & Sort**: Filter by newest, oldest, most votes
- **Slug-based URLs**: SEO-friendly URLs (`/vs/:slug`)

### Implementation Details
**Database Tables**:
- `vs_matches` - Match configuration and metadata
- `vs_match_votes` - Individual user votes
- `comments` - VS match discussions (content_type: 'vs_match')

**Key Components**:
- `src/pages/VSMatches.tsx` - Main VS matches listing page
- `src/pages/VSMatchDetail.tsx` - Individual match detail with voting
- `src/hooks/useVSMatches.tsx` - Data fetching and voting logic
- `src/hooks/useVSMatchComments.tsx` - Comment management

**Admin Management**:
- VS Matches tab in Admin dashboard
- Create, edit, delete VS matches
- Manage featured status
- View vote statistics

---

## Community Cypher

### Overview
Community space for users to post rap bars, verses, and freestyle content with engagement features.

### Core Features
- **Long-form Posting**: Up to 2000 characters for rap content
- **Threaded Comments**: Nested reply system with depth support
- **Like/Upvote System**: Community engagement on posts and comments
- **Sorting Options**: Sort by "Top Voted" or "Latest"
- **Character Counter**: Real-time character count with visual warnings
- **Guest CTA**: Call-to-action for non-authenticated users
- **Load More Pagination**: Infinite scroll pattern for content loading

### Implementation Details
**Database Tables**:
- `comments` - Cypher posts (content_type: 'cypher', content_id: 'community-cypher')
- `comment_likes` - Like tracking for posts and comments

**Key Components**:
- `src/pages/CommunityCypher.tsx` - Main cypher page
- `src/components/CommentBubble.tsx` - Individual cypher post display
- `src/components/CommentItem.tsx` - Comment rendering with replies
- `src/hooks/useCypherComments.tsx` - Cypher-specific comment management

**UI Features**:
- Responsive instructions (desktop vs mobile guidance)
- Empty state for first post encouragement
- Real-time character count with color coding (green → yellow → red)
- Nested reply threading with visual indicators

---

## Cypher Journal (Profile Feature)

### Overview
Personal archive of a user's Community Cypher contributions displayed on their profile page, creating a "Spit Hierarchy" showcase of lyrical content and engagement.

### Core Features
- **Verse Collection**: All cypher posts (parent comments only, not replies) from the user
- **Aggregated Statistics**: Total verses, total bars (likes), average bars per verse
- **Chronological Display**: Most recent verses first with scrollable list
- **Empty State CTA**: Encouragement to drop first verse with direct link to Community Cypher

### Statistics Displayed
| Stat | Description |
|------|-------------|
| Cypher Verses | Total number of posts in Community Cypher |
| Total Bars | Sum of likes received across all verses |
| Avg Bars/Verse | Average engagement per post (bars ÷ verses) |

### Terminology
- **Cypher Verses**: Individual posts in Community Cypher (not replies)
- **Bars**: Likes/upvotes on cypher content (rap terminology for quality lines)
- **Spit Hierarchy**: Community leaderboard concept based on lyrical engagement

### UI/UX Details
- **Card Styling**: Black background with themed primary color borders (consistent with other profile sections)
- **Verse Cards**: Individual verses with timestamp and "View in Cypher" link
- **Bars Badge**: Each verse shows like count with thumbs-up icon
- **Max Height**: Scrollable container (max-h-96) for long verse lists
- **Link to Cypher**: Footer link to continue posting in Community Cypher
- **Loading State**: Skeleton loaders during data fetch
- **Empty State**: Encouragement message with CTA when no verses exist

### Implementation Details

**Hook**: `src/hooks/useUserCypherJournal.tsx`
- Fetches user's cypher comments with like counts
- Calculates aggregate statistics (totalVerses, totalBars, averageBarsPerVerse)
- Returns verses array and stats object
- React Query integration with caching

**Component**: `src/components/profile/CypherJournalSection.tsx`
- Displays on profile page after Vote Notes section
- Loading skeleton during data fetch
- Empty state with CTA when no verses exist
- Responsive grid for stats summary
- Scrollable verse list with themed styling

**Database Query**:
```sql
SELECT id, comment_text, created_at, comment_likes
FROM comments
WHERE user_id = :userId
  AND content_type = 'cypher'
  AND content_id = 'community-cypher'
  AND parent_id IS NULL
ORDER BY created_at DESC
```

**Data Interfaces**:
```typescript
interface CypherVerse {
  id: string;
  comment_text: string;
  created_at: string;
  bars_count: number;
}

interface CypherJournalStats {
  totalVerses: number;
  totalBars: number;
  averageBarsPerVerse: number;
}
```

---


### Overview
3-step guided onboarding flow to help new users set up their account and start engaging with the platform.

### Onboarding Steps

#### Step 1: Welcome Screen
- **Purpose**: Introduce platform benefits and features
- **Content**: Feature highlights with icons
- **Actions**: Continue or Skip buttons

#### Step 2: Username Creation
- **Purpose**: Set up unique username for profile
- **Features**:
  - Real-time username validation
  - Availability checking with visual feedback
  - Character validation (alphanumeric, underscores, hyphens)
  - Duplicate detection
  - Status indicators (checkmark for available, alert for taken)

#### Step 3: Top 5 Selection
- **Purpose**: Personalize experience with favorite rappers
- **Features**:
  - Searchable rapper overlay with autocomplete
  - Drag-and-drop positioning (future enhancement)
  - Skip option for later completion
  - Progress saving to member_stats

### Implementation Details
**Database Tracking**:
- `member_stats.top_five_created` - Completion flag
- Trigger onboarding modal when value is 0

**Key Components**:
- `src/components/onboarding/OnboardingModal.tsx` - Main modal with step routing
- `src/components/onboarding/OnboardingProvider.tsx` - Context and state management
- `src/hooks/useOnboardingStatus.tsx` - Completion status checking

**State Management**:
- LocalStorage for skip preferences
- Database for completion tracking
- Context API for modal visibility

---

## Security & Moderation System

### Overview
Comprehensive security infrastructure with content moderation, audit logging, and role-based access control.

### Content Moderation

**Flagging System**:
- Users can flag inappropriate content (comments, rankings, avatars)
- Flag reasons: Offensive, Spam, Inappropriate, Other
- Status workflow: Pending → Approved/Rejected

**Moderator Tools**:
- Review flagged content in admin dashboard
- Add moderator notes
- Accept or reject flags with reasoning
- View flag history and patterns

**Database Table**: `content_moderation_flags`
- `content_type` - Type of content flagged
- `content_id` - Reference to flagged content
- `reason` - User-provided reason
- `status` - Current moderation status
- `moderator_id` - Reviewing moderator

### Security Features

**Role-Based Access Control**:
- `SecurityBoundary` component for conditional rendering
- Roles: admin, moderator, blog_editor
- Function-level security with `is_admin()`, `is_moderator_or_admin()`

**Audit Logging**:
- `audit_logs` table for sensitive operations
- Tracks: user_id, action, table_name, old/new values
- Automatic logging via triggers on sensitive tables
- Admin-only access to audit log viewer

**Profile Access Logging**:
- `profile_access_logs` table tracks profile views
- `log_profile_access()` function for secure tracking
- Detects unauthorized access attempts
- IP address and timestamp tracking

**Content Security Policy (CSP)**:
- `ContentSecurityPolicy` component for XSS prevention
- Configured headers for script/style sources
- Form submission and frame policies

### Implementation Details

**Key Components**:
- `src/components/security/SecurityBoundary.tsx` - RBAC wrapper
- `src/components/security/ContentSecurityPolicy.tsx` - CSP headers
- `src/components/security/AuditLogViewer.tsx` - Admin audit interface
- `src/hooks/useModerationStatus.tsx` - Content flagging hooks
- `src/hooks/useSecurityContext.tsx` - Security context management

**Database Functions**:
- `is_admin()` - Admin role check
- `is_moderator_or_admin()` - Moderator/admin check
- `can_manage_blog()` - Blog editor permission
- `audit_trigger_function()` - Automatic audit logging
- `log_profile_access_secure()` - Profile access tracking

---

## MusicBrainz Discography Integration

### Overview
Automated discography fetching system using MusicBrainz API with comprehensive error handling, rate limiting, and audit logging.

### Core Features

**Automatic Fetching**:
- Auto-fetch on rapper detail page load if `musicbrainz_id` exists
- Manual refresh capability for admins
- Bulk population tool for multiple rappers

**Album Placeholder Generation**:
- Smart color extraction from album art
- Fallback to rapper image colors
- External streaming links generation (Spotify, Apple Music, YouTube)

**Rate Limiting**:
- User and IP-based rate limiting
- Configurable limits (default: 10 requests per 60 minutes)
- `musicbrainz_rate_limits` table for tracking
- `check_musicbrainz_rate_limit()` function

**Audit Logging**:
- `musicbrainz_audit_logs` table for all API interactions
- Execution time tracking (ms)
- Request/response data storage
- Error message logging
- Status tracking: STARTED, REQUIRES_EXTERNAL_API, SUCCESS, FAILED

### Implementation Details

**Database Tables**:
- `albums` - Album metadata with MusicBrainz IDs
- `rapper_albums` - Many-to-many relationship
- `musicbrainz_audit_logs` - API interaction tracking
- `musicbrainz_rate_limits` - Rate limit enforcement

**Edge Function**: `supabase/functions/fetch-rapper-discography/`
- Handles actual MusicBrainz API calls
- Parses and stores album data
- Generates placeholder images
- Creates external links

**Key Components**:
- `src/components/rapper/RapperDiscography.tsx` - Discography display
- `src/components/admin/MusicBrainzBulkPopulation.tsx` - Bulk fetch tool
- `src/hooks/useRapperDiscography.ts` - Data fetching logic

**Database Functions**:
- `fetch_musicbrainz_discography()` - Initiates fetch with audit logging
- `check_musicbrainz_rate_limit()` - Rate limit validation

**UI Features**:
- Album/Mixtape tabs with chronological sorting
- Loading states during fetch
- Error handling for 404/rate-limit scenarios
- External streaming links with icons
- Admin refresh button

---

## Hot/Trending Rappers System

### Overview
Algorithm-based system to identify trending rappers based on recent voting activity.

### Algorithm Details

**Voting Window**: Last 7 days

**Calculation Method**:
1. Aggregate all votes from last 7 days by rapper_id
2. Count votes per rapper
3. Sort by vote count descending
4. Calculate 85th percentile threshold (top 15%)
5. Return rappers meeting or exceeding threshold

**Momentum Score**:
```
momentum = (recent_vote_count × average_rating) / 7 days
```

### Implementation Details

**Database Query**:
```sql
SELECT rapper_id, COUNT(*) as vote_count
FROM votes
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY rapper_id
HAVING COUNT(*) >= :threshold
ORDER BY COUNT(*) DESC
```

**Key Hooks**:
- `src/hooks/useHotRappers.tsx` - Main hook for fetching hot rappers
- `useIsHotRapper(rapperId)` - Check if specific rapper is hot

**Usage**:
- "Hot" badge on rapper cards
- Trending section on homepage
- Vote velocity indicators
- Momentum-based sorting

**Cache Strategy**:
- 5-minute stale time to reduce database load
- React Query automatic refetching
- Cached results across components

---

## Rapper Activity Tracking & Page Views

### Overview
System for tracking rapper page views and calculating activity scores based on unique visitor engagement.

### Page View Tracking

**Data Collection**:
- `rapper_page_views` table stores all page visits
- Tracks user_id (authenticated) or session_id (guests)
- Timestamp of view (`viewed_at`)
- Rapper being viewed (`rapper_id`)

**Privacy Considerations**:
- Anonymous visitor tracking via session_id
- No personal information stored for guests
- Users can view own page view history

### Activity Score Calculation

**Algorithm**:
```
activity_score = COUNT(DISTINCT user_id/session_id) 
                 WHERE viewed_at >= NOW() - 7 days
```

**Update Triggers**:
- Automatic update on each page view via trigger
- `update_rapper_activity_on_view()` function
- `calculate_rapper_activity_score()` calculates score

**Usage**:
- "Hot" rapper identification
- Trending content recommendations
- Popularity metrics in analytics
- Feature prioritization

### Data Maintenance

**Cleanup Function**: `cleanup_old_page_views()`
- Automatically deletes views older than 30 days
- Maintains database performance
- Preserves aggregated statistics

**Scheduled Maintenance**:
- Run via scheduled job or manual trigger
- Reduces table bloat
- Maintains query performance

### Implementation Details

**Database Table**: `rapper_page_views`
- `id` - UUID primary key
- `rapper_id` - Rapper being viewed
- `user_id` - Authenticated user (nullable)
- `session_id` - Anonymous session (nullable)
- `viewed_at` - Timestamp
- `created_at` - Record creation

**Database Functions**:
- `calculate_rapper_activity_score(rapper_id)` - Score calculation
- `update_rapper_activity_on_view()` - Trigger on insert
- `cleanup_old_page_views()` - Maintenance function

**Key Components**:
- `src/hooks/useRapperStats.ts` - Activity score fetching
- `src/pages/RapperDetail.tsx` - Page view tracking

---

## Poll System

### Overview
Flexible polling system supporting homepage polls and blog-embedded polls with multiple question types and voting mechanisms.

### Poll Types

**By Placement**:
- **Homepage Polls**: Featured polls on main landing page
- **Blog Polls**: Embedded within blog posts

**By Question Type**:
- **Single Choice**: User selects one option
- **Multiple Choice**: User selects multiple options
- **Write-in**: User can add custom response (optional feature)

### Core Features

**Poll Configuration**:
- Title and description
- Multiple options (unlimited)
- Expiration date/time (optional)
- Featured status for priority display
- Placement targeting (homepage vs blog)

**Voting Mechanics**:
- **Authenticated Users**: Vote tracked by user_id
- **Guest Users**: Vote tracked by session_id
- One vote per user/session per poll
- Real-time results aggregation

**Results Display**:
- Vote counts per option
- Percentage distribution
- Total votes
- Visual bar charts

### Implementation Details

**Database Tables**:
- `polls` - Poll configuration
  - `id`, `title`, `description`
  - `type` (single_choice, multiple_choice)
  - `status` (draft, active, closed)
  - `placement` (homepage, blog)
  - `expires_at`, `allow_write_in`, `is_featured`
  
- `poll_options` - Answer choices
  - `id`, `poll_id`, `option_text`, `option_order`
  
- `poll_votes` - Individual votes
  - `id`, `poll_id`, `option_id`
  - `user_id` (nullable), `session_id` (nullable)
  
- `poll_results` - Materialized view
  - Aggregated vote counts per option
  - Real-time calculation

**Key Components**:
- `src/components/polls/HomepagePoll.tsx` - Homepage poll display
- `src/components/polls/BlogPoll.tsx` - Blog-embedded poll
- `src/components/polls/PollWidget.tsx` - Reusable poll component
- `src/hooks/usePolls.tsx` - Poll data fetching
- `src/hooks/usePollResults.tsx` - Results aggregation
- `src/hooks/usePollVoting.tsx` - Vote submission

**Admin Management**:
- Poll creation and editing in Admin dashboard
- Option management with drag-and-drop ordering
- Status control (draft/active/closed)
- Expiration management
- Results viewing and export

---

## Member Status & Achievement System (Detailed)

### Overview
Comprehensive gamification system with automatic achievement tracking, XP-based progression, and member tier advancement designed for long-term engagement.

### Member Tiers & XP Economy

**Status Levels** (Bronze → Silver → Gold → Platinum → Diamond):
- **Bronze**: 0-499 XP (1x vote weight)
- **Silver**: 500-1,499 XP (2x vote weight)
- **Gold**: 1,500-3,499 XP (3x vote weight)
- **Platinum**: 3,500-6,999 XP (4x vote weight)
- **Diamond**: 7,000+ XP (5x vote weight)

**XP Economy**:
- **Session XP**: +10 XP per new web session (tracked via `sessionStorage` and `increment_session_count` RPC)
- **Achievement XP**: +5 to +4,000 XP depending on achievement rarity
- **Diamond Goal**: Approximately 1 year of consistent engagement to reach top tier
- **Session Tracking**: `member_stats.session_count` tracks total sessions for "Session Warrior" achievements

**Vote Weight Impact**:
- Whole-number vote weight multipliers (1x, 2x, 3x, 4x, 5x) for simplicity
- Vote weight multiplier applied to all official ranking votes
- Higher tiers have greater influence on final rankings
- Encourages long-term engagement and consistent participation

### Achievement System

**Achievement Categories**:

#### Account Milestone Achievements
| Achievement | Requirement | Points | Rarity |
|-------------|-------------|--------|--------|
| Welcome | Join the community | 10 | Common |
| Early Adopter | Join in the first year | 500 | Epic |
| Beta Tester | Participate in beta testing | 200 | Epic |

#### Community Voice Achievements (threshold_field: total_comments)
| Achievement | Threshold | Points | Rarity |
|-------------|-----------|--------|--------|
| First Comment | 1 comment | 10 | Common |
| Getting Chatty | 5 comments | 30 | Common |
| Conversationalist | 10 comments | 50 | Common |
| Discussion Starter | 25 comments | 80 | Rare |
| Community Voice | 50 comments | 130 | Rare |
| Discussion Leader | 100 comments | 200 | Rare |
| Forum Expert | 250 comments | 350 | Epic |
| Community Pillar | 500 comments | 600 | Epic |
| Discussion Legend | 1,000 comments | 1,000 | Legendary |

#### Consistency King Achievements (threshold_field: consecutive_voting_days)
| Achievement | Threshold | Points | Rarity |
|-------------|-----------|--------|--------|
| First Streak | 2 days | 25 | Common |
| Weekend Warrior | 3 days | 40 | Common |
| Work Week | 5 days | 65 | Common |
| Week Warrior | 7 days | 125 | Rare |
| Two Week Streak | 14 days | 200 | Rare |
| Month Master | 30 days | 400 | Epic |
| Quarter Champion | 90 days | 1,000 | Epic |
| Streak Legend | 180 days | 2,000 | Legendary |
| Year of Dedication | 365 days | 4,000 | Legendary |

#### Discovery Achievements (threshold_field: profile_views_count)
| Achievement | Threshold | Points | Rarity |
|-------------|-----------|--------|--------|
| Explorer | 10 profiles | 20 | Common |
| Deep Diver | 50 profiles | 60 | Rare |
| Researcher | 100 profiles | 120 | Rare |

#### Exploration Achievements (various threshold_fields)
| Achievement | Requirement | Points | Rarity |
|-------------|-------------|--------|--------|
| Blog Reader | Visit blog page | 20 | Common |
| About Explorer | Visit About page | 30 | Common |
| Self Reflector | Visit own profile | 30 | Common |
| VS Enthusiast | Visit VS Matches page | 40 | Common |
| Cypher Junkie I | Visit Community Cypher | 30 | Common |
| Cypher Junkie II | 5 cypher visits | 60 | Rare |
| Cypher Junkie III | 25 cypher visits | 120 | Epic |
| Data Analyst I | Visit Analytics page | 50 | Rare |
| Data Analyst II | 5 analytics visits | 100 | Epic |
| Data Analyst III | 25 analytics visits | 200 | Legendary |

#### Rapper Connoisseur Achievements (threshold_field: rappers_voted_count)
| Achievement | Threshold | Points | Rarity |
|-------------|-----------|--------|--------|
| First Rating | 1 rapper | 10 | Common |
| Exploring Talent | 5 rappers | 25 | Common |
| Diverse Voter | 10 rappers | 50 | Common |
| Hip Hop Scholar | 25 rappers | 85 | Rare |
| Rap Encyclopedia | 50 rappers | 150 | Rare |
| Genre Expert | 100 rappers | 250 | Epic |
| Rap Historian | 250 rappers | 450 | Epic |
| Complete Authority | 500 rappers | 800 | Legendary |

#### Ranking Curator Achievements (threshold_field: ranking_lists_created)
| Achievement | Threshold | Points | Rarity |
|-------------|-----------|--------|--------|
| First List | 1 list | 15 | Common |
| List Builder | 3 lists | 40 | Common |
| Ranking Enthusiast | 5 lists | 75 | Rare |
| Master Curator | 10 lists | 150 | Epic |

#### Top Five Achievements (threshold_field: top_five_created)
| Achievement | Threshold | Points | Rarity |
|-------------|-----------|--------|--------|
| Top Five Beginner | Create top 5 list | 20 | Common |

#### Upvote Champion Achievements (threshold_field: total_upvotes)
| Achievement | Threshold | Points | Rarity |
|-------------|-----------|--------|--------|
| First Like | 1 upvote | 10 | Common |
| Getting Noticed | 5 upvotes | 30 | Common |
| Popular Voice | 10 upvotes | 50 | Common |
| Community Favorite | 25 upvotes | 80 | Rare |
| Rising Star | 50 upvotes | 130 | Rare |
| Influential Voice | 100 upvotes | 200 | Rare |
| Crowd Pleaser | 250 upvotes | 350 | Epic |
| Community Star | 500 upvotes | 600 | Epic |
| Legendary Contributor | 1,000 upvotes | 1,000 | Legendary |

#### Vote Master Achievements (threshold_field: total_votes)
| Achievement | Threshold | Points | Rarity |
|-------------|-----------|--------|--------|
| First Vote | 1 vote | 10 | Common |
| Vote Apprentice | 5 votes | 25 | Common |
| Vote Enthusiast | 10 votes | 50 | Common |
| Vote Contributor | 25 votes | 85 | Common |
| Vote Specialist | 50 votes | 125 | Rare |
| Vote Expert | 100 votes | 185 | Rare |
| Vote Professional | 250 votes | 300 | Rare |
| Vote Master | 500 votes | 500 | Epic |
| Vote Champion | 1,000 votes | 850 | Epic |
| Vote Legend | 2,500 votes | 1,500 | Legendary |
| Vote Immortal | 5,000 votes | 2,500 | Legendary |

**Achievement Configuration**:
- `threshold_field` - Stat to track (e.g., 'total_votes', 'consecutive_voting_days')
- `threshold_value` - Required value to unlock
- `points` - XP awarded on unlock
- `rarity` - Common, Rare, Epic, Legendary
- `series_name` - Achievement category grouping
- `tier_level` - Progression level within series

### Automatic Achievement Checking

**Trigger System**:
Database triggers automatically check achievements on:
- Vote submissions (ranking votes and attribute votes)
- Comment creation
- Top 5 updates
- Ranking list creation

**Check Function**: `check_and_award_achievements(user_id)`
1. Fetches current user stats from `member_stats`
2. Loops through all active achievements
3. Compares current stat values to thresholds
4. Awards achievements if criteria met
5. Inserts into `user_achievements` table

**Progress Tracking**:
- `user_achievements.progress_value` stores current progress
- Enables partial progress display (e.g., "45/100 votes")
- Real-time progress updates

### Status Calculation

**Function**: `calculate_member_status(total_points)`
- Called automatically when achievement awarded
- Updates `member_stats.status` column
- Recalculates vote weight for future votes

**Trigger**: `update_member_status_on_achievement()`
- Fires after achievement awarded
- Sums total points from all achievements
- Updates member status tier
- Logs status changes

### Notification System

**Toast Notifications**:
- `AchievementToast` component shows unlock notifications
- Displays achievement name, icon, and points
- Auto-dismisses after 5 seconds
- Sound effect on unlock (optional)

**Achievement Gallery**:
- `AchievementGallery` component shows all achievements
- Locked/unlocked states with progress bars
- Rarity-based coloring
- Click for detailed view

### Implementation Details

**Database Tables**:
- `achievements` - Achievement definitions
- `user_achievements` - User unlock records
- `member_stats` - Aggregated user statistics

**Database Functions**:
- `check_and_award_achievements(user_id)` - Automatic checking
- `calculate_member_status(total_points)` - Tier calculation
- `get_vote_weight(status)` - Weight lookup by tier

**Triggers**:
- `trigger_achievement_check()` - On vote, comment, ranking
- `update_member_status_on_achievement()` - On achievement unlock
- `update_member_stats_on_vote()` - On vote submission
- `update_member_stats_on_comment()` - On comment creation

**Key Components**:
- `src/components/achievements/AchievementProvider.tsx` - Context
- `src/components/achievements/AchievementNotification.tsx` - Unlock UI
- `src/components/achievements/AchievementGallery.tsx` - Display grid
- `src/components/achievements/AchievementCard.tsx` - Individual achievement
- `src/hooks/useAchievements.tsx` - Achievement fetching

---

## Advanced Image Management

### Overview
Multi-style image system allowing multiple visual representations of each rapper across different art styles.

### Image Styles

**Supported Styles** (enum `image_style`):
- `photo_real` - Photorealistic images
- `cartoon` - Cartoon/animated style
- `anime` - Anime/manga style  
- `artistic` - Artistic/painted style
- `pixel_art` - Pixel art/retro style
- `sketch` - Sketch/line art style
- `3d_render` - 3D rendered style

### Core Features

**Multi-Style Upload**:
- Upload different style variants for each rapper
- Style selector in upload interface
- Each style can have multiple images
- One default image per style

**Default Image Selection**:
- Mark one image per style as default
- `is_default` flag in `rapper_images` table
- Fallback to first image if no default

**Completion Tracking**:
- `CompletionOverview` component shows coverage
- Displays which rappers have images for each style
- Progress bars and statistics
- Filter by incomplete styles

**Bulk Upload Interface**:
- `RapperImageManagement` component
- Select rapper, then upload multiple styles
- Style selector dropdown
- Preview before save

### Implementation Details

**Database Table**: `rapper_images`
- `id` - UUID primary key
- `rapper_id` - Foreign key to rappers
- `image_url` - Storage URL
- `style` - Image style enum
- `is_default` - Default for this style
- `created_at`, `updated_at`

**Storage Organization**:
```
rapper-images/
  {rapper_id}/
    photo_real/
      {image_id}.jpg
    cartoon/
      {image_id}.jpg
    anime/
      {image_id}.jpg
```

**Key Components**:
- `src/components/admin/RapperImageManagement.tsx` - Main interface
- `src/components/admin/image-management/StyleSelector.tsx` - Style picker
- `src/components/admin/image-management/StyleImageCard.tsx` - Image display
- `src/components/admin/image-management/CompletionOverview.tsx` - Coverage stats
- `src/components/admin/RapperAvatarUpload.tsx` - Upload controls

**Image Cropping**:
- `AvatarCropper` component for aspect ratio control
- Supports square, 16:9, 4:3 ratios
- Real-time preview
- Export cropped image

### User Preference System

**Profile Setting**: `profiles.preferred_image_style`
- Users can select preferred art style
- Automatically shows preferred style when available
- Fallback to photo_real if preference unavailable

**Style Switching**:
- `ImageStyleSelector` component
- Toggle between available styles
- Persistent preference in localStorage

---

## Ranking System Enhancements (Technical Details)

### Daily Maintenance Jobs

**Function**: `daily_ranking_maintenance()`
- Runs daily via scheduled job
- Calls two main functions:
  1. `populate_all_rankings_with_missing_rappers()` - Adds new rappers
  2. `recalculate_ranking_positions()` - Updates all positions

**Maintenance Tasks**:
- Add newly created rappers to all rankings
- Recalculate positions based on current vote totals
- Clean up orphaned ranking items
- Update activity scores
- Log maintenance completion

### Automatic Rapper Population

**Trigger**: `add_rapper_to_all_rankings()`
- Fires when new rapper created
- Automatically adds rapper to all official rankings
- Adds rapper to all user rankings
- Assigns position at end of list
- Sets `is_ranked = false` initially

**Function**: `populate_ranking_with_all_rappers(ranking_id)`
- Adds all missing rappers to specific ranking
- Used by maintenance job and manual admin action
- Preserves existing positions
- Appends new rappers at end

### Position Recalculation

**Function**: `recalculate_ranking_positions(ranking_id)`
- Recalculates all positions based on vote totals
- Weighted by member status (1x-5x multiplier)
- Tie-breaking using earliest first vote timestamp
- Updates `ranking_items.position` column
- Atomic operation to prevent conflicts

**Algorithm**:
1. Sum weighted votes per rapper in ranking
2. Sort by total votes (descending)
3. For ties, sort by earliest vote timestamp
4. Assign positions sequentially (1, 2, 3...)
5. Update database in transaction

### Vote Velocity Tracking

**Metrics**:
- `vote_velocity_24_hours` - Votes in last 24 hours
- `vote_velocity_7_days` - Votes in last 7 days
- Stored in `ranking_items` table

**Calculation**:
- Run during position recalculation
- Count votes within time window
- Update alongside position updates
- Used for "Rising" indicators

### Position History & Deltas

**Weekly Snapshots**: `create_weekly_ranking_snapshot()`
- Runs every Sunday at 11:59 PM
- Captures current positions for all rappers
- Stores in `ranking_position_history` table
- Enables trend analysis

**Delta Calculation**: `get_position_delta(ranking_id, rapper_id)`
- Compares current position to last Sunday
- Returns positive (dropped) or negative (improved)
- Powers "↑ 5" or "↓ 3" indicators
- Returns 0 if no historical data

### "Is Ranked" Flag

**Purpose**: Distinguish top-ranked rappers from pool
- `ranking_items.is_ranked` boolean flag
- `true` for rappers with significant votes
- `false` for rappers in "pool" waiting for votes

**Usage**:
- Display ranked rappers at top
- Show pool rappers separately
- Enable different UI for each group
- Sort ranked items before pool items

### Implementation Details

**Database Functions**:
- `daily_ranking_maintenance()` - Main maintenance job
- `populate_all_rankings_with_missing_rappers()` - Bulk rapper addition
- `populate_ranking_with_all_rappers(ranking_id)` - Single ranking population
- `recalculate_ranking_positions(ranking_id)` - Position updates
- `create_weekly_ranking_snapshot()` - History snapshot
- `get_position_delta(ranking_id, rapper_id)` - Delta calculation
- `add_rapper_to_all_rankings()` - New rapper trigger
- `add_rapper_to_all_user_rankings()` - User ranking trigger

**Scheduled Jobs**:
- Daily maintenance: 3:00 AM daily
- Weekly snapshots: Sunday 11:59 PM
- Configurable via Supabase cron or external scheduler

---

## Public Profile System (Security Focus)

### Overview
Secure public profile viewing system with minimal data exposure and comprehensive access logging.

### Security Architecture

**Data Minimization Principle**:
- Only expose necessary public data
- Hide sensitive fields (email, birthdate, location)
- Truncate long text fields (bio preview)
- Batch fetching to reduce queries

**Security Definer Functions**:
All profile access through secure database functions:
- `get_public_profile_minimal(user_id)` - Basic data only
- `get_public_profile_full(user_id)` - Extended public data
- `get_public_profile_safe(user_id)` - With bio truncation
- `find_user_by_username(username)` - Username lookup
- `get_profiles_batch(user_ids[])` - Efficient batch fetching

### Access Logging

**Function**: `log_profile_access(accessed_id, access_type)`
- Logs all profile view attempts
- Stores: accessor_user_id, accessed_profile_id, access_type, timestamp
- Table: `profile_access_logs`

**Access Types**:
- `'view'` - Normal profile viewing
- `'stats'` - Statistics page access
- `'rankings'` - Rankings tab access
- `'unauthorized_attempt'` - Security violation

**Security Monitoring**:
- Detects unusual access patterns
- Flags potential scraping or abuse
- Admin dashboard for access review
- IP tracking for unauthorized attempts

### Public vs Private Data

**Public Data** (anyone can view):
- Username
- Avatar URL
- First name only (split from full_name)
- Bio (truncated to 200 chars for non-owners)
- Member status and tier
- Total votes count
- Public rankings and top 5
- Achievement badges (count only)

**Private Data** (owner only):
- Full name
- Email address
- Birthdate
- Location
- Social media links (full)
- Detailed voting history
- Private rankings
- Full bio
- IP addresses

### Username-Based Routing

**Routes**:
- `/user/:username` - Public profile by username
- `/profile/:id` - Public profile by ID (legacy)
- `/profile` - Own profile (authenticated)

**Lookup Process**:
1. Extract username from URL
2. Call `find_user_by_username(username)`
3. Fetch public profile data via `get_public_profile_full(user_id)`
4. Log access via `log_profile_access(user_id, 'view')`
5. Render profile with public data only

### Implementation Details

**Key Components**:
- `src/pages/PublicUserProfile.tsx` - Profile by ID
- `src/pages/PublicUserProfileByUsername.tsx` - Profile by username
- `src/components/profile/PublicProfileHeader.tsx` - Profile header
- `src/components/profile/PublicProfileRankings.tsx` - Rankings display
- `src/hooks/usePublicProfiles.tsx` - Data fetching
- `src/hooks/usePublicUserData.ts` - User data access

**Database Functions**:
- `get_public_profile_minimal(user_id)` - Minimal public data
- `get_public_profile_full(user_id)` - Full public data
- `get_public_profile_safe(user_id)` - Safe with truncation
- `get_profiles_batch(user_ids[])` - Batch fetching
- `find_user_by_username(username)` - Username resolution
- `log_profile_access(user_id, type)` - Access logging
- `log_profile_access_secure(user_id, type)` - Secure logging with violation detection

**RLS Policies**:
All profile queries go through security definer functions, bypassing RLS while maintaining security through function-level checks.

---

## Admin Data Management Tools

### Overview
Administrative tools for bulk operations, data maintenance, and system management.

### Voting Data Reset

**Function**: `reset_all_voting_data()`
- **Permission**: Admin-only (checks `is_admin()`)
- **Action**: Complete voting data reset across entire platform
- **Safety**: Confirmation dialog with password verification

**Deleted Data**:
- All votes from `votes` table
- All ranking votes from `ranking_votes` table
- Daily vote tracking from `daily_vote_tracking` table
- Vote notes from `vote_notes` table
- Position history from `ranking_position_history` table

**Reset Statistics**:
- Resets `rappers.total_votes` to 0
- Resets `rappers.average_rating` to 0
- Resets `member_stats.total_votes` to 0
- Resets `member_stats.consecutive_voting_days` to 0
- Clears `member_stats.last_vote_date`

**Audit Trail**:
- Logs complete action to `audit_logs` table
- Records row counts for each table
- Timestamps the reset operation
- Tracks admin user who performed reset

**Return Value**:
```json
{
  "success": true,
  "message": "All voting data has been successfully reset",
  "details": {
    "votes_deleted": 335,
    "ranking_votes_deleted": 89,
    "daily_tracking_deleted": 245,
    "vote_notes_deleted": 42,
    "position_history_deleted": 156,
    "rappers_updated": 281,
    "member_stats_updated": 14,
    "reset_timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### Bulk Operations Interface

**Component**: `src/components/admin/AdminDataManagement.tsx`

**Features**:
- Voting data reset (described above)
- Database maintenance triggers
- Analytics cleanup
- Cache invalidation
- System health checks

**Safety Features**:
- Confirmation dialogs for destructive actions
- Admin-only access with role verification
- Audit logging for all operations
- Transaction-based operations (rollback on error)
- Error handling with detailed messages

### Other Maintenance Tools

**Rapper Management**:
- Bulk tag assignment
- Batch image uploads
- Mass status updates
- Duplicate detection and merging

**Ranking Maintenance**:
- Position recalculation (all rankings)
- Rapper population (add missing rappers)
- Historical snapshot creation
- Vote velocity updates

**User Management**:
- Role assignment (bulk)
- Achievement reset/grant
- Member stats recalculation
- Inactive user cleanup

**Database Operations**:
- Index rebuilding
- Vacuum and analyze
- Statistics update
- Materialized view refresh

### Implementation Details

**Database Functions**:
- `reset_all_voting_data()` - Complete voting reset
- `daily_ranking_maintenance()` - Scheduled maintenance
- `cleanup_old_page_views()` - Page view cleanup
- `update_all_rapper_activity_scores()` - Activity score recalc

**Admin Dashboard Tab**:
- "Data Management" tab in admin panel
- Organized by operation type
- Visual feedback for operation status
- Operation history log

**Security**:
- All operations require admin role
- RLS policies enforce admin-only access
- Audit logging for accountability
- Confirmation required for destructive actions

---

## Enhanced Analytics System

### Overview
Comprehensive analytics dashboard with multiple specialized views for voting patterns, member engagement, and rapper performance.

### Category Performance Analytics

**Function**: `get_public_category_stats()`
**Metrics**:
- Total votes per category
- Unique voters per category
- Unique rappers voted on
- Average rating by category
- Vote distribution over time

**Component**: `src/components/analytics/CategoryPerformanceCard.tsx`
**Visualizations**:
- Bar charts for vote counts
- Trend lines for rating averages
- Heatmaps for category popularity

### Astrological Rankings

**Component**: `src/components/analytics/AstrologicalRankings.tsx`
**Features**:
- Group rappers by zodiac sign (based on birthdate)
- Calculate average ratings by sign
- Vote counts per sign
- "Hottest" sign determination

**Zodiac Calculations**:
- Automatic sign assignment from birthdate
- Handles missing birthdate data
- Moon/rising sign support (future)

**Visualizations**:
- Zodiac wheel chart
- Sign comparison bars
- Top rappers per sign

### Career Length Statistics

**Component**: `src/components/analytics/CareerLengthCard.tsx`
**Hook**: `src/hooks/useCareerLengthStats.ts`

**Metrics**:
- Average career length (years active)
- Longest careers
- Shortest careers
- Active vs retired comparison
- Career length vs rating correlation

**Calculations**:
```
career_length = career_end_year - career_start_year
OR
career_length = current_year - career_start_year (if still active)
```

### Top Cities Analytics

**Component**: `src/components/analytics/TopCitiesCard.tsx`
**Hook**: `src/hooks/useTopCitiesStats.ts`

**Data Points**:
- Rappers per city
- Average rating by city
- Total votes by city origin
- Regional comparisons (East Coast vs West Coast vs South)

**Visualizations**:
- Geographic heat map
- City leaderboard
- Regional breakdowns

### Album Statistics

**Component**: `src/components/analytics/AlbumStatsCard.tsx`
**Hook**: `src/hooks/useAlbumStats.ts`

**Metrics**:
- Average albums per rapper
- Most prolific rappers (album count)
- Album release trends over time
- Albums vs mixtapes ratio
- Discography completion rate (MusicBrainz integration)

**Filtering**:
- By release type (album, mixtape, EP, single)
- By year range
- By rapper status (active/retired)

### Rapper Network Graph

**Component**: `src/components/analytics/RapperNetworkGraph.tsx`

**Features**:
- Visual network of rapper relationships
- Collaboration mapping (via albums)
- Label affiliations
- Geographic clustering
- Interactive node exploration

**Node Types**:
- Rappers (sized by vote count)
- Labels (grouped connections)
- Albums (connection edges)

**Interactions**:
- Click node to view details
- Hover for quick stats
- Filter by relationship type
- Zoom and pan navigation

### Member Analytics Dashboard

**Component**: `src/components/analytics/MemberAnalytics.tsx`

**Sections**:
1. **Top Members**: Most active voters, highest status, achievement leaders
2. **Engagement Trends**: Daily/weekly/monthly activity patterns
3. **Voting Patterns**: Category preferences, rating distributions
4. **Achievement Progress**: Completion rates, popular achievements
5. **Member Growth**: Registration trends, retention metrics

**Visualizations**:
- Line charts for trends
- Leaderboards with avatars
- Progress bars for achievements
- Heatmaps for activity patterns

### Voting Trends

**Component**: `src/components/analytics/VotingTrends.tsx`

**Time-based Analysis**:
- Daily vote volume
- Peak voting hours/days
- Seasonal trends
- Event-triggered spikes

**Category Analysis**:
- Vote distribution by category
- Category popularity over time
- Cross-category correlations

**Visualizations**:
- Multi-line time series
- Stacked area charts
- Calendar heatmaps

### Implementation Details

**Database Views**:
- `rapper_voting_analytics` - Aggregated rapper stats
- `rapper_vote_stats` - Detailed vote information
- `rapper_popularity_stats` - Popularity metrics
- `poll_results` - Poll aggregations

**Database Functions**:
- `get_public_category_stats()` - Category analytics
- `get_public_rapper_voting_stats()` - Public rapper stats
- `get_trending_rappers(days_back)` - Trending calculation
- `get_rapper_top5_counts()` - Top 5 popularity

**Key Hooks**:
- `src/hooks/useCareerLengthStats.ts` - Career data
- `src/hooks/useTopCitiesStats.ts` - Geographic data
- `src/hooks/useAlbumStats.ts` - Discography data
- `src/hooks/useTopRappersByCategory.ts` - Category leaders
- `src/hooks/useTopTagsStats.ts` - Tag analytics

**Performance Optimizations**:
- Materialized views for complex aggregations
- Indexed queries for fast filtering
- React Query caching with appropriate stale times
- Lazy loading for chart components
- Virtualized lists for large datasets

---

## About Page Components

### Overview
The About page provides comprehensive information about the platform, its creator, and the member progression system.

### About Page Sections

#### Hero Section
- **Component**: `src/components/about/AboutHero.tsx`
- Animated entry with platform tagline
- Call-to-action buttons

#### What We Do Section
- **Component**: `src/components/about/AboutWhatWeDo.tsx`
- Platform mission and value proposition
- Feature highlights with descriptions

#### Features Section
- **Component**: `src/components/about/AboutFeatures.tsx`
- Icon-based feature grid
- Key platform capabilities overview

#### How It Works Section
- **Component**: `src/components/about/AboutHowItWorks.tsx`
- Step-by-step engagement guide:
  1. Vote - Cast votes on favorite rappers
  2. Earn - Gain XP and achievements
  3. Rise - Progress through member levels
  4. Connect - Engage with community

#### Member Levels Section
- **Component**: `src/components/about/AboutMemberLevels.tsx`
- **Visual Progress Bar**: Equal-width segments for all 5 tiers (Bronze → Diamond)
- **XP Thresholds**: Markers at 0, 500, 1.5k, 3.5k, 7k+ aligned to segments
- **Vote Power Grid**: Multiplier display (Bronze 1x → Diamond 5x)
- **Ways to Earn XP**:
  - Session visits (+10 XP per new session)
  - Achievements (+5 to +4,000 XP depending on rarity)
- **Design**: Dark themed card with gradient progress segments

#### Creator Section
- **Component**: `src/components/about/AboutCreator.tsx`
- **Creator Profile**: Craig Tinsley (S2BKAS)
- **Bio**: Educator, designer, and lyricist from Los Angeles
- **Image**: `src/assets/creator-craig-tinsley.jpg`
- **Layout**: Responsive flexbox (vertical mobile, horizontal desktop)
- **Styling**: Themed card with primary color borders and shadows

#### Call to Action Section
- **Component**: `src/components/about/AboutCallToAction.tsx`
- Registration encouragement
- Exploration prompts

### Implementation Details

**Page Component**: `src/pages/About.tsx`

**Features**:
- Page visit tracking for achievements (`about_visits`)
- SEO metadata with custom title and description
- Scroll-based header state management
- Consistent themed card styling throughout

**Routing**: `/about`

---

*This document provides comprehensive details on advanced features. For basic feature overview, see PROJECT_KNOWLEDGE.md. For site architecture, see SITE_REPORT.md.*
