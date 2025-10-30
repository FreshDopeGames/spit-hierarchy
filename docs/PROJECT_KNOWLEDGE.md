# Project Knowledge Base - Rapper Ranking Platform

## Project Overview
A comprehensive web application for ranking and voting on rap artists, featuring community engagement, content creation, and detailed analytics.

## Core Features Implemented

### 1. Authentication & User Management
- **User Registration/Login**: Email-based authentication with Supabase Auth
- **Social Authentication**: Currently disabled (infrastructure preserved for future restoration - see DEVELOPER_NOTES.md)
- **User Profiles**: Custom profiles with avatars, bios, usernames
- **Member Status System**: Bronze → Silver → Gold → Platinum → Diamond progression based on achievement points
- **Achievement System**: Point-based achievements with automatic awarding via database triggers
- **Secure Profile Viewing**: Authenticated users can view other members' public profiles with access logging
- **New User Onboarding**: 3-step guided onboarding flow (Welcome → Username → Top 5 Selection)
- **Profile Access Tracking**: Security logging for profile views and access patterns

### 2. Rapper Management
- **Rapper Profiles**: Comprehensive rapper data (name, bio, birth info, career details)
- **Avatar Management**: Multiple image styles (photo-real, cartoon, anime, etc.)
- **Discography Integration**: MusicBrainz API integration for album/single data
- **Tag System**: Categorization with custom tags
- **Verification System**: Verified rapper badges
- **Image Gallery**: Multiple images per rapper with style variants
- **Enhanced All Rappers Page**:
  - Persistent filter controls during all loading states (no UI hiding)
  - Optimized skeleton loading (4 cards matching grid layout)
  - Non-intrusive inline loading indicators for search/filter operations
  - Improved accessibility with proper focus state visibility
  - Smooth state transitions without layout shifts
  - Scroll position restoration after detail page navigation

### 3. Voting & Ranking System
- **Daily Voting**: One vote per rapper per day with rating (1-10)
- **Vote Weighting**: Higher member tiers get increased vote power
- **Ranking Categories**: Multiple voting categories (lyricism, flow, etc.)
- **Official Rankings**: Admin-curated rankings with real-time updates
- **User Rankings**: Community-created custom rankings
- **Vote Notes**: Optional comments with votes
- **Position Tracking**: Weekly snapshots for trend analysis

### 4. Community Features
- **Comments**: Threaded comments on rappers and content with nested replies
- **Comment Likes**: Engagement system for community content with like counts
- **User Top 5**: Personal top rapper lists with searchable rapper selection
- **Profile Sharing**: Shareable profile links via username-based URLs
- **Public Profiles**: Secure viewing of other users' stats and rankings with minimal data exposure
- **VS Matches**: Head-to-head rapper battle voting system with real-time results
- **Community Cypher**: Long-form community space for rap bars and verses (up to 2000 characters)
- **Content Moderation**: User-initiated content flagging with moderator review workflow

### 5. Content Management
- **Blog System**: Full-featured blog with categories, tags, rich content
- **Blog Management**: Admin interface for content creation
- **SEO Optimization**: Meta tags, structured data, clean URLs
- **Featured Content**: Highlighted posts and rankings
- **Media Management**: Image uploads and optimization

### 6. Analytics & Insights
- **Voting Analytics**: Comprehensive voting statistics and trends
- **Member Analytics**: User engagement and activity metrics
- **Rapper Performance**: Vote counts, ratings, and trending data
- **Global Stats**: Platform-wide statistics and insights
- **Achievement Tracking**: Progress monitoring for achievements

### 7. Administrative Tools
- **Admin Dashboard**: Comprehensive management interface
- **User Role Management**: Admin, moderator, blog editor roles
- **Content Moderation**: Flagging and moderation workflows
- **Data Management**: Bulk operations and maintenance tools
- **Bulk Discography Fetching**: Batch processing system for MusicBrainz data with progress monitoring and error tracking
- **Audit Logging**: Security and activity tracking

### 8. Enhanced Theme Management System (PHASES 7-8 COMPLETED)
- **Interactive Theme Editor**: Click-to-select element customization with 40+ customizable elements
- **Comprehensive Color Palette**: Global and element-specific color control with theme variable integration
- **Advanced Typography Controls**: Font size, weight, spacing, line height, letter spacing, and text transform
- **Gradient Builder**: Visual gradient editor with linear, radial, and conic gradient types
- **Element Customization**: Individual styling for all UI components including buttons, cards, inputs, forms, tables, navigation
- **Border & Effects Control**: Complete border styling (width, style, color, radius) and box shadow customization
- **Real-time Preview**: Live updates with organized element sections and preview mode tracking
- **Theme Persistence**: Local storage with apply/reset functionality and unsaved changes indicator
- **Design System Integration**: Full migration from hardcoded classes to semantic CSS custom properties
- **Component Library Migration**: All components converted to themed equivalents (ThemedButton, ThemedCard, etc.)

### 9. Advanced Features
- **Poll System**: Homepage and blog-embedded polls with multiple/single choice, write-in options, expiration, and session-based voting
- **Daily Vote Tracking**: Rate limiting, vote history, and streak mechanics
- **Member Status Progression**: Automatic tier advancement with vote weight multipliers (1x Bronze → 5x Diamond)
- **Hot/Trending Rappers**: Algorithm-based trending detection using 7-day vote velocity (85th percentile threshold)
- **Rapper Activity Tracking**: Page view tracking with unique visitor counting and activity score calculation
- **MusicBrainz Integration**: Automated discography fetching with rate limiting, audit logging, and placeholder generation
- **Bulk Discography Management**: Edge function-based batch processing for fetching MusicBrainz data across multiple rappers with timeout management (2 rappers/batch), real-time progress tracking, and comprehensive error reporting
- **Multi-Style Image Management**: Style-variant uploads (photo_real, cartoon, anime, artistic, pixel_art) with default selection
- **Security Features**: Rate limiting, content validation, secure file uploads, content flagging, audit logging
- **Performance Optimization**: Caching, lazy loading, optimized queries, materialized views, LCP-targeted optimizations
- **Enhanced Search**: PostgreSQL unaccent extension with accent/symbol normalization and relevance scoring

## Technical Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety throughout the application
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first styling with custom design system
- **Enhanced Theme System**: Comprehensive theming with CSS custom properties
- **React Router**: Client-side routing with protected routes
- **React Query**: Data fetching, caching, and synchronization
- **React Hook Form**: Form management with validation

### Backend & Database
- **Supabase**: Backend-as-a-Service providing:
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication and authorization
  - Edge Functions for custom logic
  - File storage with multiple buckets
- **Database Design**:
  - Normalized schema with proper relationships
  - Comprehensive RLS policies for security
  - Materialized views for performance
  - Triggers for data consistency

### Key Design Patterns
- **Component Composition**: Reusable UI components with variants
- **Custom Hooks**: Business logic abstraction
- **Context Providers**: Global state management
- **Error Boundaries**: Robust error handling
- **Optimistic Updates**: Immediate UI feedback
- **Security-First**: All data access through secure functions
- **Theme System Architecture**: CSS custom properties with semantic tokens
- **Interactive Element Selection**: Click-to-customize UI elements
- **Real-time Theme Preview**: Live updates without page refresh

## Data Models

### Core Entities
- **Users/Profiles**: User accounts with extended profile data
- **Rappers**: Artist entities with comprehensive metadata
- **Rankings**: Both official and user-generated lists
- **Votes**: Individual rating submissions with metadata
- **Comments**: Threaded discussion system
- **Achievements**: Gamification elements
- **Blog Posts**: Content management entities

### Key Relationships
- Users → Member Stats (1:1)
- Users → Votes (1:many)
- Users → Rankings (1:many)
- Users → Achievements (many:many)
- Rappers → Votes (1:many)
- Rappers → Albums/Singles (many:many)
- Rankings → Items (1:many)

## Security Implementation

### Authentication
- JWT-based authentication through Supabase Auth
- Secure session management
- Role-based access control (RBAC)

### Authorization
- Row Level Security (RLS) on all database tables
- Function-level security for sensitive operations
- Secure profile viewing with privacy controls

### Data Protection
- Input validation and sanitization
- Rate limiting on voting and API calls
- Audit logging for sensitive operations
- Secure file upload validation

## User Flows

### New User Journey
1. Registration/Login (email-based authentication)
2. Onboarding flow (Welcome → Username → Top 5 Selection)
3. Profile setup and customization
4. Discover rappers and rankings
5. Start voting and engaging
6. Unlock achievements and advance member status

### Daily Engagement
1. Browse featured content and trending rappers
2. Cast daily votes on rappers in official rankings
3. Participate in community discussions and comment threads
4. Vote in VS Matches (head-to-head battles)
5. Drop rap bars in Community Cypher
6. Create and share personal rankings

### VS Matches Engagement
1. Browse active VS matches
2. Vote for favorite rapper in matchup
3. View real-time vote distribution
4. Comment on VS match debates
5. Share favorite battles

### Community Cypher Participation
1. Read community rap bars and verses
2. Post original rap content (up to 2000 characters)
3. Like and upvote favorite posts
4. Reply to verses with threaded comments
5. Sort by top voted or latest content

### Content Creation
1. Create custom user rankings with reasons
2. Write and share blog posts (blog editors only)
3. Comment and engage with community across content types
4. Build and share Top 5 lists with searchable rapper selection
5. Post rap verses in Community Cypher

## Performance Optimizations
- **LCP-Targeted Optimizations**: Resource hints (preconnect, dns-prefetch) for Supabase storage, critical image preloading with fetchPriority="high", priority prop system for above-the-fold ranking cards (target: <2.5s LCP)
- **Cache Strategy**: Optimized React Query staleTime configurations (5-minute cache for rankings and images) balancing freshness with performance
- **Image Loading Strategy**: Priority flag propagation for first ranking card and first rapper image, ensures browser prioritizes LCP elements
- **Database Queries**: Optimized queries with proper indexing and materialized views
- **Image Lazy Loading**: Below-the-fold image lazy loading with optimization
- **Code Splitting**: Component-level code splitting for faster initial loads
- **React Query Caching**: Efficient caching strategies with tuned staleTime and refetchOnWindowFocus settings
- **Materialized Views**: Complex analytics pre-computed for instant access

## Development Standards
- TypeScript for type safety
- ESLint/Prettier for code formatting
- Component testing with React Testing Library
- Git workflows with feature branches
- Semantic versioning for releases

## Deployment & Infrastructure
- Automatic deployments through Lovable platform
- Supabase edge functions for serverless logic
- CDN for static asset delivery
- Database migrations for schema changes
- Environment-specific configurations

## CSS System & Theme Architecture

### Current CSS System Status ✅ COMPLETE MIGRATION
- **Migration Complete**: All components migrated from legacy `useTheme` to `useEnhancedTheme` (December 2024)
- **Theme Provider**: Application fully uses `EnhancedThemeProvider` with proper context management
- **Hook Migration**: 100% migration from `useTheme()` → `useEnhancedTheme()`
- **Component Integration**: All theme-dependent components now use enhanced theme system
- **Error Resolution**: Fixed "useTheme must be used within a ThemeProvider" errors across application

### Enhanced Theme Architecture (40+ Customizable Elements)

#### Core Theme Files
- `src/config/enhancedTheme.ts` - Complete theme configuration system with 200+ CSS variables
- `src/hooks/useEnhancedTheme.tsx` - Enhanced theme state management with preview mode
- `src/components/admin/theme/EnhancedThemeManagement.tsx` - Main theme interface
- `src/components/admin/theme/ElementCustomizer.tsx` - Element-specific customization
- `src/components/admin/theme/EnhancedThemePreviewExpanded.tsx` - Comprehensive preview

### CSS Variable Architecture
- **200+ CSS Variables**: Auto-generated from theme configuration
- **CSS Custom Properties**: All styling uses `var(--theme-*)` pattern
- **Runtime Theme Switching**: CSS variables enable instant theme changes
- **Semantic Token System**: Prevents style conflicts and ensures consistency
- **Performance Optimized**: <5% bundle size impact with tree-shaking

### Customizable Element Categories

#### Button Variants (7 elements)
- `button-default`, `button-secondary`, `button-accent`, `button-outline`
- `button-gradient`, `button-destructive`, `button-ghost`

#### Layout Elements (5 elements)  
- `page_background`, `container`, `section`, `sidebar`, `breadcrumb`

#### Form Elements (5 elements)
- `textarea`, `checkbox`, `radio`, `switch`, `slider`

#### Content Elements (6 elements)
- `badge`, `avatar`, `separator`, `accordion`, `tabs`, `tooltip`

#### Interactive & Navigation (4 elements)
- `link`, `hover_overlay`, `focus_ring`, `navbar`

#### Modal Elements (2 elements)
- `modal_header`, `modal_footer`

#### Feedback Elements (4 elements)
- `alert`, `notification`, `loading`, `skeleton`

#### Table Elements (4 elements)
- `table`, `table_header`, `table_row`, `table_cell`

#### Core UI Elements (8 elements)
- `card`, `input`, `select`, `modal`, `navigation`, `footer`, `global_header`, `dropdown`, `dropdown_item`

#### Typography Elements (6 elements)
- `typography-h1`, `typography-h2`, `typography-h3`, `typography-body`, `typography-display`, `typography-code`

### CSS Variable System

#### Naming Convention
All elements generate CSS variables following the pattern:
```css
--theme-element-{element_name}-{property}
```

#### Generated Properties
Each element can have the following customizable properties:
- `bg` - Background color
- `color` - Text color  
- `border-width`, `border-style`, `border-color`, `border-radius` - Border properties
- `padding`, `margin` - Spacing
- `shadow` - Box shadows
- `hover-bg`, `hover-color` - Hover states
- `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `fontFamily` - Typography

### Themed Component Library Migration

#### Component Mapping (100% Migration Complete)
All standard UI components replaced with themed equivalents:
```typescript
Button → ThemedButton
Card → ThemedCard  
Input → ThemedInput
Select → ThemedSelect
Tabs → ThemedTabs
Textarea → ThemedTextarea
Label → ThemedLabel
Separator → ThemedSeparator
Badge → ThemedBadge
Avatar → ThemedAvatar
Progress → ThemedProgress
Skeleton → ThemedSkeleton
Link → ThemedLink
DropdownMenu → ThemedDropdownMenu
```

#### Hardcoded Class Migration
Complete replacement of legacy rap-themed classes:
```css
/* OLD rap-themed classes */
bg-rap-gold → var(--theme-primary)
text-rap-gold → var(--theme-primary)  
bg-rap-carbon → var(--theme-background)
text-rap-platinum → var(--theme-text)
text-rap-silver → var(--theme-textMuted)
border-rap-gold → var(--theme-border)

/* NEW semantic theme variables */  
bg-[var(--theme-primary)]
text-[var(--theme-primary)]
bg-[var(--theme-background)]
text-[var(--theme-text)]
text-[var(--theme-textMuted)]
border-[var(--theme-border)]
```

### Theme Management Features

#### Real-time Customization
- **Element Selection**: Click any element in preview to customize
- **Property Panels**: Context-sensitive controls for selected element
- **Live Updates**: Changes apply immediately in preview mode
- **Organized Sections**: Elements grouped by category (Layout, Forms, Content, etc.)

#### Advanced Controls
- **Typography System**: Complete font control per element
- **Border System**: Width, style, color, radius for all elements  
- **Color System**: Theme-aware color picker with semantic tokens
- **Gradient System**: Custom gradients with visual builder
- **Spacing System**: Padding and margin controls
- **Shadow System**: Box shadow configuration

#### Theme State Management
- **Preview Mode**: Non-destructive testing before applying changes
- **Unsaved Changes**: Visual indicator for pending modifications  
- **Apply/Reset**: Safe theme modification workflow
- **Persistence**: Automatic localStorage saving/loading

### Implementation Status

#### ✅ Phase 7 Complete - Theme Management Interface Updates
- ElementCustomizer expanded to support all 40+ elements
- EnhancedThemePreviewExpanded includes comprehensive element examples  
- Fixed component imports (ThemedButton, ThemedSeparator, ThemedTabs)
- Element selection and customization working for all element types
- Real-time CSS variable generation confirmed

#### ✅ Phase 8 Complete - Testing & Documentation  
- Critical hardcoded class replacement in achievement components
- Admin form components migrated to theme variables
- ElementCustomizer and preview components fully themed
- Complete documentation updated in PROJECT_KNOWLEDGE.md
- Performance testing confirmed <5% bundle size impact

### Technical Implementation

#### CSS Variable Generation  
The `applyEnhancedThemeToDOM()` function generates over 200+ CSS variables:
```typescript
// Element-specific variables
--theme-element-card-bg: hsl(43, 12%, 17%)
--theme-element-card-border-color: hsl(46, 87%, 65%)
--theme-element-button-default-bg: hsl(46, 87%, 65%)
--theme-element-input-border-radius: 8px

// Typography variables  
--theme-typography-h1-fontSize: 2.5rem
--theme-typography-body-fontWeight: 400
```

#### Theme Configuration Structure
```typescript
interface EnhancedThemeConfig {
  colors: ColorPalette;           // Global color system
  fonts: FontConfig;              // Font family definitions  
  typography: TypographyConfig;   // Per-element typography
  gradients: GradientConfig[];    // Custom gradient definitions
  elements: ElementsConfig;       // 40+ element configurations
  spacing: SpacingConfig;         // Spacing scale
  borderRadius: BorderRadiusConfig; // Border radius scale  
  shadows: ShadowConfig;          // Shadow definitions
}
```

#### Performance Optimizations
- CSS custom properties enable efficient runtime theming
- Automatic tree-shaking of unused element configurations
- Optimized React context to minimize re-renders
- LocalStorage caching reduces initialization time
- Semantic token system prevents style conflicts

### Theme System Benefits

#### Developer Experience
- Type-safe theme configuration with TypeScript
- Consistent API across all customizable elements  
- Hot reloading during theme development
- Comprehensive documentation and examples
- Error handling for invalid theme configurations

#### User Experience  
- Intuitive click-to-customize interface
- Real-time visual feedback during customization
- Organized element categorization for easy discovery
- Preview mode prevents accidental changes
- Persistent themes across browser sessions

#### Maintainability
- Centralized theme configuration eliminates scattered styles
- Semantic naming convention improves code readability  
- CSS custom properties enable runtime theme switching
- Component library ensures consistent theming adoption
- Migration path from legacy hardcoded classes

### Visual Edit Tool Compatibility & Guidelines

#### How Lovable Visual Edit Works with Enhanced Theme System
The enhanced theme system is **fully compatible** with Lovable's Visual Edit tool:

- ✅ **Safe to Use**: Visual Edit modifies inline styles/CSS properties, which safely override CSS variables
- ✅ **Non-Destructive**: Changes don't break the theme system architecture
- ✅ **Cascading Override**: Element-specific changes cascade properly over global theme variables
- ✅ **Revertible**: Visual Edit changes can be undone without affecting theme system

#### Visual Edit Usage Guidelines

##### Simple Edits (Free, No Credits)
Direct edits for static elements work perfectly:
- **Text Changes**: Modify headings, paragraphs, button text
- **Color Changes**: Update background colors, text colors 
- **Font Changes**: Adjust font families, sizes, weights
- **Layout Changes**: Modify spacing, alignment, positioning

##### Advanced CSS Customization (Uses Credits)
For complex styling needs, use the **Advanced input field** in Visual Edit:

```css
/* Target specific elements with theme-aware styles */
.custom-element {
  background: var(--theme-primary);
  color: var(--theme-background);
  border: 2px solid var(--theme-accent);
  transition: var(--theme-transition-smooth);
}

/* Use theme variables for consistency */
.hero-section {
  background: linear-gradient(
    135deg, 
    var(--theme-primary), 
    var(--theme-primary-glow)
  );
  padding: var(--theme-spacing-lg);
  border-radius: var(--theme-border-radius-lg);
}

/* Hover states with theme integration */
.custom-button:hover {
  background: var(--theme-accent);
  color: var(--theme-accent-foreground);
  box-shadow: var(--theme-shadow-elegant);
}
```

#### Best Practices for Visual Edit Advanced CSS

##### 1. Use Theme Variables
Always use CSS custom properties from the theme system:
```css
/* ✅ CORRECT - Uses theme variables */
background: var(--theme-primary);
color: var(--theme-text);
border: 1px solid var(--theme-border);

/* ❌ AVOID - Hardcoded colors break theme consistency */
background: #f4d03f;
color: #ffffff;
border: 1px solid #cccccc;
```

##### 2. Common Theme Variables Available
```css
/* Colors */
--theme-primary, --theme-secondary, --theme-accent
--theme-background, --theme-foreground
--theme-text, --theme-textMuted
--theme-border, --theme-success, --theme-warning, --theme-error

/* Element-specific variables */
--theme-element-button-default-bg
--theme-element-card-bg
--theme-element-input-border-color

/* Typography */
--theme-typography-h1-fontSize
--theme-typography-body-fontWeight

/* Spacing & Effects */
--theme-spacing-sm, --theme-spacing-md, --theme-spacing-lg
--theme-border-radius-sm, --theme-border-radius-md
--theme-shadow-elegant, --theme-shadow-glow
--theme-transition-smooth
```

##### 3. Responsive Design in Advanced CSS
```css
/* Mobile-first responsive design */
.responsive-element {
  padding: var(--theme-spacing-sm);
  font-size: var(--theme-typography-body-fontSize);
}

@media (min-width: 768px) {
  .responsive-element {
    padding: var(--theme-spacing-lg);
    font-size: var(--theme-typography-h2-fontSize);
  }
}
```

##### 4. Animation & Transitions
```css
/* Use theme transition variables for consistency */
.animated-element {
  transition: var(--theme-transition-smooth);
  transform: translateY(0);
}

.animated-element:hover {
  transform: translateY(-2px);
  box-shadow: var(--theme-shadow-glow);
}
```

#### When to Use Each Approach

| Task | Visual Edit Simple | Visual Edit Advanced | Admin Theme Editor |
|------|-------------------|---------------------|-------------------|
| Change text content | ✅ Free | ❌ | ❌ |
| Adjust colors | ✅ Free | ✅ Credits | ✅ Global |
| Modify fonts | ✅ Free | ✅ Credits | ✅ Global |
| Custom CSS styling | ❌ | ✅ Credits | ❌ |
| Global theme changes | ❌ | ❌ | ✅ Comprehensive |
| Element-specific styling | ❌ | ✅ Credits | ✅ All elements |

#### Troubleshooting Visual Edit Issues

##### If Theme Variables Don't Work in Advanced CSS:
1. **Check Variable Name**: Ensure correct `--theme-*` naming
2. **CSS Syntax**: Verify proper `var(--theme-variable)` syntax  
3. **Specificity**: Use `!important` if needed to override existing styles
4. **Theme Loading**: Wait for theme to fully load before applying custom CSS

##### Common Advanced CSS Patterns:
```css
/* Override with theme integration */
.override-element {
  background: var(--theme-primary) !important;
  color: var(--theme-background) !important;
}

/* Complex gradients using theme */
.gradient-background {
  background: linear-gradient(
    45deg,
    var(--theme-primary) 0%,
    var(--theme-accent) 50%,
    var(--theme-secondary) 100%
  );
}
```

### Future Enhancements
- Theme preset templates for quick customization
- Advanced animation timing controls
- Component-level theme overrides
- Theme import/export functionality
- Accessibility contrast validation
- Mobile-responsive theme preview
- Theme versioning and rollback system
- Visual Edit integration improvements

## Future Considerations
- Mobile app development
- Advanced analytics dashboard
- Real-time notifications
- Enhanced moderation tools
- API rate limiting improvements
- Advanced caching strategies
- Theme marketplace and sharing
- Advanced animation controls in theme system
- Component-level theme overrides