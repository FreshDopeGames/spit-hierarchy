# Project Knowledge Base - Rapper Ranking Platform

## Project Overview
A comprehensive web application for ranking and voting on rap artists, featuring community engagement, content creation, and detailed analytics.

## Core Features Implemented

### 1. Authentication & User Management
- **User Registration/Login**: Email-based authentication with Supabase Auth
- **Social Authentication**: Support for social login providers
- **User Profiles**: Custom profiles with avatars, bios, usernames
- **Member Status System**: Bronze → Silver → Gold → Platinum → Diamond progression
- **Achievement System**: Point-based achievements for user engagement
- **Secure Profile Viewing**: Authenticated users can view other members' public profiles

### 2. Rapper Management
- **Rapper Profiles**: Comprehensive rapper data (name, bio, birth info, career details)
- **Avatar Management**: Multiple image styles (photo-real, cartoon, anime, etc.)
- **Discography Integration**: MusicBrainz API integration for album/single data
- **Tag System**: Categorization with custom tags
- **Verification System**: Verified rapper badges
- **Image Gallery**: Multiple images per rapper with style variants

### 3. Voting & Ranking System
- **Daily Voting**: One vote per rapper per day with rating (1-10)
- **Vote Weighting**: Higher member tiers get increased vote power
- **Ranking Categories**: Multiple voting categories (lyricism, flow, etc.)
- **Official Rankings**: Admin-curated rankings with real-time updates
- **User Rankings**: Community-created custom rankings
- **Vote Notes**: Optional comments with votes
- **Position Tracking**: Weekly snapshots for trend analysis

### 4. Community Features
- **Comments**: Threaded comments on rappers and content
- **Comment Likes**: Engagement system for community content
- **User Top 5**: Personal top rapper lists
- **Profile Sharing**: Shareable profile links
- **Public Profiles**: Secure viewing of other users' stats and rankings

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
- **Audit Logging**: Security and activity tracking

### 8. Enhanced Theme Management System
- **Interactive Theme Editor**: Click-to-select element customization
- **Comprehensive Color Palette**: Global and element-specific color control
- **Advanced Typography Controls**: Font size, weight, spacing, and transform settings
- **Gradient Builder**: Visual gradient editor with multiple gradient types (linear, radial, conic)
- **Element Customization**: Individual styling for buttons, cards, inputs, modals, navigation
- **Border & Effects Control**: Width, style, color, radius, and shadow customization
- **Real-time Preview**: Live updates with preview mode and unsaved change tracking
- **Theme Persistence**: Local storage with apply/reset functionality
- **Design System Integration**: Semantic tokens and CSS custom properties

### 9. Advanced Features
- **Poll System**: Community polls with multiple choice options
- **Daily Vote Tracking**: Rate limiting and vote history
- **Member Status Progression**: Automatic tier advancement
- **Security Features**: Rate limiting, content validation, secure file uploads
- **Performance Optimization**: Caching, lazy loading, optimized queries

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
1. Registration/Login
2. Profile setup
3. Discover rappers and rankings
4. Start voting and engaging
5. Unlock achievements and advance member status

### Daily Engagement
1. Browse featured content
2. Cast daily votes on rappers
3. Participate in community discussions
4. Create and share personal rankings

### Content Creation
1. Create custom rankings
2. Write and share blog posts (editors)
3. Comment and engage with community
4. Build and share Top 5 lists

## Performance Optimizations
- Optimized database queries with proper indexing
- Image lazy loading and optimization
- Component-level code splitting
- Efficient caching strategies with React Query
- Materialized views for complex analytics

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

## Theme System Details

### Enhanced Theme Configuration
- **EnhancedThemeConfig**: Comprehensive interface for all theme properties
- **Element-Specific Styling**: Individual configs for buttons, cards, inputs, modals, etc.
- **Typography System**: Granular control over font properties for each element type
- **Gradient System**: Custom gradient definitions with visual builder
- **Border Configuration**: Complete border styling with width, style, color, and radius

### Theme Components
- **EnhancedThemePreview**: Interactive preview with clickable elements
- **ElementCustomizer**: Context-sensitive property panels
- **GradientBuilder**: Visual gradient editor with real-time preview
- **ColorPaletteTab**: Color management with contrast validation
- **TypographyTab**: Font family and weight selection

### Implementation Features
- **CSS Custom Properties**: Dynamic theme application via CSS variables
- **Local Storage Persistence**: Theme settings saved across sessions
- **Preview Mode**: Non-destructive theme testing before applying
- **Semantic Tokens**: Design system integration with meaningful color names
- **Real-time Updates**: Immediate visual feedback during customization

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