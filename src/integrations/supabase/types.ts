export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          name: string
          points: number
          rarity: Database["public"]["Enums"]["achievement_rarity"]
          threshold_field: string | null
          threshold_value: number | null
          type: Database["public"]["Enums"]["achievement_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id?: string
          is_active?: boolean
          name: string
          points?: number
          rarity?: Database["public"]["Enums"]["achievement_rarity"]
          threshold_field?: string | null
          threshold_value?: number | null
          type: Database["public"]["Enums"]["achievement_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          points?: number
          rarity?: Database["public"]["Enums"]["achievement_rarity"]
          threshold_field?: string | null
          threshold_value?: number | null
          type?: Database["public"]["Enums"]["achievement_type"]
          updated_at?: string
        }
        Relationships: []
      }
      ad_placements: {
        Row: {
          ad_format: string
          ad_unit_id: string
          created_at: string
          id: string
          is_active: boolean
          page_name: string
          page_route: string
          placement_name: string
          updated_at: string
        }
        Insert: {
          ad_format?: string
          ad_unit_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          page_name: string
          page_route: string
          placement_name: string
          updated_at?: string
        }
        Update: {
          ad_format?: string
          ad_unit_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          page_name?: string
          page_route?: string
          placement_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: {
          id: string
          post_id: string | null
          tag_id: string | null
        }
        Insert: {
          id?: string
          post_id?: string | null
          tag_id?: string | null
        }
        Update: {
          id?: string
          post_id?: string | null
          tag_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          featured_image_url: string | null
          id: string
          likes_count: number | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string | null
          video_url: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          likes_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          likes_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_achievement_progress"
            referencedColumns: ["user_id"]
          },
        ]
      }
      comments: {
        Row: {
          comment_text: string
          content_id: string
          content_type: string
          created_at: string
          id: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment_text: string
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment_text?: string
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_achievement_progress"
            referencedColumns: ["user_id"]
          },
        ]
      }
      content_moderation_flags: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          moderator_id: string | null
          moderator_notes: string | null
          reason: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          moderator_id?: string | null
          moderator_notes?: string | null
          reason: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          moderator_id?: string | null
          moderator_notes?: string | null
          reason?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_vote_tracking: {
        Row: {
          created_at: string
          id: string
          ranking_id: string
          rapper_id: string
          user_id: string
          vote_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          ranking_id: string
          rapper_id: string
          user_id: string
          vote_date?: string
        }
        Update: {
          created_at?: string
          id?: string
          ranking_id?: string
          rapper_id?: string
          user_id?: string
          vote_date?: string
        }
        Relationships: []
      }
      member_stats: {
        Row: {
          badges: Json | null
          consecutive_voting_days: number | null
          created_at: string | null
          id: string
          last_vote_date: string | null
          ranking_lists_created: number | null
          status: Database["public"]["Enums"]["member_status"] | null
          top_five_created: number | null
          total_comments: number | null
          total_upvotes: number | null
          total_votes: number | null
          updated_at: string | null
        }
        Insert: {
          badges?: Json | null
          consecutive_voting_days?: number | null
          created_at?: string | null
          id: string
          last_vote_date?: string | null
          ranking_lists_created?: number | null
          status?: Database["public"]["Enums"]["member_status"] | null
          top_five_created?: number | null
          total_comments?: number | null
          total_upvotes?: number | null
          total_votes?: number | null
          updated_at?: string | null
        }
        Update: {
          badges?: Json | null
          consecutive_voting_days?: number | null
          created_at?: string | null
          id?: string
          last_vote_date?: string | null
          ranking_lists_created?: number | null
          status?: Database["public"]["Enums"]["member_status"] | null
          top_five_created?: number | null
          total_comments?: number | null
          total_upvotes?: number | null
          total_votes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      official_ranking_items: {
        Row: {
          created_at: string | null
          id: string
          position: number
          ranking_id: string | null
          rapper_id: string | null
          reason: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          position: number
          ranking_id?: string | null
          rapper_id?: string | null
          reason?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          position?: number
          ranking_id?: string | null
          rapper_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "official_ranking_items_ranking_id_fkey"
            columns: ["ranking_id"]
            isOneToOne: false
            referencedRelation: "official_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "official_ranking_items_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_voting_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "official_ranking_items_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rappers"
            referencedColumns: ["id"]
          },
        ]
      }
      official_rankings: {
        Row: {
          activity_score: number | null
          category: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_featured: boolean | null
          last_activity_at: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          activity_score?: number | null
          category: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          last_activity_at?: string | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          activity_score?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          last_activity_at?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      page_templates: {
        Row: {
          available_placements: string[]
          created_at: string
          description: string | null
          id: string
          route_pattern: string
          template_name: string
        }
        Insert: {
          available_placements?: string[]
          created_at?: string
          description?: string | null
          id?: string
          route_pattern: string
          template_name: string
        }
        Update: {
          available_placements?: string[]
          created_at?: string
          description?: string | null
          id?: string
          route_pattern?: string
          template_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birthdate: string | null
          created_at: string | null
          full_name: string | null
          id: string
          location: string | null
          preferred_image_style:
            | Database["public"]["Enums"]["image_style"]
            | null
          social_links: Json | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birthdate?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          preferred_image_style?:
            | Database["public"]["Enums"]["image_style"]
            | null
          social_links?: Json | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birthdate?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          preferred_image_style?:
            | Database["public"]["Enums"]["image_style"]
            | null
          social_links?: Json | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      ranking_items: {
        Row: {
          created_at: string | null
          id: string
          is_ranked: boolean | null
          position: number
          ranking_id: string
          rapper_id: string
          reason: string | null
          updated_at: string | null
          vote_velocity_24_hours: number | null
          vote_velocity_7_days: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_ranked?: boolean | null
          position: number
          ranking_id: string
          rapper_id: string
          reason?: string | null
          updated_at?: string | null
          vote_velocity_24_hours?: number | null
          vote_velocity_7_days?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_ranked?: boolean | null
          position?: number
          ranking_id?: string
          rapper_id?: string
          reason?: string | null
          updated_at?: string | null
          vote_velocity_24_hours?: number | null
          vote_velocity_7_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ranking_items_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_voting_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_items_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rappers"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_position_history: {
        Row: {
          created_at: string
          id: string
          position: number
          ranking_id: string
          rapper_id: string
          snapshot_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          position: number
          ranking_id: string
          rapper_id: string
          snapshot_date?: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          ranking_id?: string
          rapper_id?: string
          snapshot_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_position_history_ranking_id_fkey"
            columns: ["ranking_id"]
            isOneToOne: false
            referencedRelation: "official_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_position_history_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_voting_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_position_history_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rappers"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_tag_assignments: {
        Row: {
          created_at: string
          id: string
          ranking_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ranking_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ranking_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_tag_assignments_ranking_id_fkey"
            columns: ["ranking_id"]
            isOneToOne: false
            referencedRelation: "official_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "ranking_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      ranking_votes: {
        Row: {
          created_at: string
          id: string
          member_status: Database["public"]["Enums"]["member_status"]
          ranking_id: string
          rapper_id: string
          updated_at: string
          user_id: string
          vote_date: string | null
          vote_weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          member_status?: Database["public"]["Enums"]["member_status"]
          ranking_id: string
          rapper_id: string
          updated_at?: string
          user_id: string
          vote_date?: string | null
          vote_weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          member_status?: Database["public"]["Enums"]["member_status"]
          ranking_id?: string
          rapper_id?: string
          updated_at?: string
          user_id?: string
          vote_date?: string | null
          vote_weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "ranking_votes_ranking_id_fkey"
            columns: ["ranking_id"]
            isOneToOne: false
            referencedRelation: "official_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_votes_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_voting_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_votes_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rappers"
            referencedColumns: ["id"]
          },
        ]
      }
      rapper_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_default: boolean | null
          rapper_id: string
          style: Database["public"]["Enums"]["image_style"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_default?: boolean | null
          rapper_id: string
          style: Database["public"]["Enums"]["image_style"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_default?: boolean | null
          rapper_id?: string
          style?: Database["public"]["Enums"]["image_style"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rapper_images_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_voting_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapper_images_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rappers"
            referencedColumns: ["id"]
          },
        ]
      }
      rappers: {
        Row: {
          average_rating: number | null
          bio: string | null
          birth_day: number | null
          birth_month: number | null
          birth_year: number | null
          created_at: string
          id: string
          image_url: string | null
          instagram_handle: string | null
          name: string
          origin: string | null
          real_name: string | null
          slug: string
          spotify_id: string | null
          total_votes: number | null
          twitter_handle: string | null
          updated_at: string
          verified: boolean | null
        }
        Insert: {
          average_rating?: number | null
          bio?: string | null
          birth_day?: number | null
          birth_month?: number | null
          birth_year?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          instagram_handle?: string | null
          name: string
          origin?: string | null
          real_name?: string | null
          slug: string
          spotify_id?: string | null
          total_votes?: number | null
          twitter_handle?: string | null
          updated_at?: string
          verified?: boolean | null
        }
        Update: {
          average_rating?: number | null
          bio?: string | null
          birth_day?: number | null
          birth_month?: number | null
          birth_year?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          instagram_handle?: string | null
          name?: string
          origin?: string | null
          real_name?: string | null
          slug?: string
          spotify_id?: string | null
          total_votes?: number | null
          twitter_handle?: string | null
          updated_at?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      section_headers: {
        Row: {
          background_image_url: string | null
          created_at: string
          id: string
          is_active: boolean
          section_name: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          background_image_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          section_name: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          background_image_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          section_name?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          progress_value: number | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          progress_value?: number | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          progress_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "user_achievement_progress"
            referencedColumns: ["achievement_id"]
          },
        ]
      }
      user_ranking_items: {
        Row: {
          created_at: string
          id: string
          is_ranked: boolean | null
          position: number
          ranking_id: string
          rapper_id: string
          reason: string | null
          updated_at: string
          vote_velocity_24_hours: number | null
          vote_velocity_7_days: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_ranked?: boolean | null
          position: number
          ranking_id: string
          rapper_id: string
          reason?: string | null
          updated_at?: string
          vote_velocity_24_hours?: number | null
          vote_velocity_7_days?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_ranked?: boolean | null
          position?: number
          ranking_id?: string
          rapper_id?: string
          reason?: string | null
          updated_at?: string
          vote_velocity_24_hours?: number | null
          vote_velocity_7_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_ranking_items_ranking_id_fkey"
            columns: ["ranking_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ranking_items_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_voting_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ranking_items_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rappers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ranking_tag_assignments: {
        Row: {
          created_at: string
          id: string
          ranking_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ranking_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ranking_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ranking_tag_assignments_ranking_id_fkey"
            columns: ["ranking_id"]
            isOneToOne: false
            referencedRelation: "user_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ranking_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "ranking_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rankings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          slug: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          slug: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          slug?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_rankings_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_rankings_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_achievement_progress"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_top_rappers: {
        Row: {
          created_at: string | null
          id: string
          position: number | null
          rapper_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          position?: number | null
          rapper_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          position?: number | null
          rapper_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_top_rappers_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_voting_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_top_rappers_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rappers"
            referencedColumns: ["id"]
          },
        ]
      }
      vote_notes: {
        Row: {
          created_at: string
          id: string
          note: string
          ranking_id: string
          rapper_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note: string
          ranking_id: string
          rapper_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
          ranking_id?: string
          rapper_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vote_notes_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_voting_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vote_notes_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rappers"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          category_id: string
          created_at: string
          id: string
          rapper_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          rapper_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          rapper_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "voting_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_voting_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rappers"
            referencedColumns: ["id"]
          },
        ]
      }
      voting_categories: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      rapper_voting_analytics: {
        Row: {
          average_rating: number | null
          id: string | null
          name: string | null
          total_votes: number | null
          unique_voters: number | null
        }
        Relationships: []
      }
      user_achievement_progress: {
        Row: {
          achievement_id: string | null
          description: string | null
          earned_at: string | null
          icon: string | null
          is_earned: boolean | null
          name: string | null
          points: number | null
          progress_percentage: number | null
          progress_value: number | null
          rarity: Database["public"]["Enums"]["achievement_rarity"] | null
          threshold_field: string | null
          threshold_value: number | null
          type: Database["public"]["Enums"]["achievement_type"] | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_member_status: {
        Args: { total_points: number }
        Returns: Database["public"]["Enums"]["member_status"]
      }
      calculate_rapper_attribute_votes: {
        Args: { rapper_uuid: string }
        Returns: number
      }
      calculate_rapper_average_rating: {
        Args: { rapper_uuid: string }
        Returns: number
      }
      calculate_rapper_percentile: {
        Args: { rapper_uuid: string }
        Returns: number
      }
      calculate_rapper_total_votes: {
        Args: { rapper_uuid: string }
        Returns: number
      }
      can_manage_blog: {
        Args: { _user_id: string }
        Returns: boolean
      }
      can_manage_blog_content: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_and_award_achievements: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      check_rate_limit: {
        Args: {
          action_type: string
          user_uuid?: string
          max_requests?: number
          window_seconds?: number
        }
        Returns: boolean
      }
      create_weekly_ranking_snapshot: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      daily_ranking_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_category_voting_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          total_votes: number
          unique_voters: number
          unique_rappers: number
          average_rating: number
        }[]
      }
      get_position_delta: {
        Args: { p_ranking_id: string; p_rapper_id: string }
        Returns: number
      }
      get_public_rapper_voting_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          total_votes: number
          unique_voters: number
          average_rating: number
          votes_last_7_days: number
          votes_last_30_days: number
        }[]
      }
      get_rapper_top5_count: {
        Args: { rapper_uuid: string }
        Returns: number
      }
      get_rapper_top5_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          top5_count: number
        }[]
      }
      get_rapper_voting_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          total_votes: number
          unique_voters: number
          average_rating: number
          votes_last_7_days: number
          votes_last_30_days: number
        }[]
      }
      get_user_ranking_preview_items: {
        Args: { ranking_uuid: string; item_limit?: number }
        Returns: {
          item_position: number
          item_reason: string
          rapper_name: string
        }[]
      }
      get_user_voting_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          total_votes: number
          categories_used: number
          average_rating_given: number
          first_vote_date: string
          last_vote_date: string
          unique_rappers_voted: number
        }[]
      }
      get_vote_weight: {
        Args: { status: Database["public"]["Enums"]["member_status"] }
        Returns: number
      }
      has_role: {
        Args: { _user_id: string; _role: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_moderator_or_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      populate_all_rankings_with_missing_rappers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      populate_ranking_with_all_rappers: {
        Args: { ranking_uuid: string }
        Returns: undefined
      }
      populate_user_ranking_with_all_rappers: {
        Args: { ranking_uuid: string }
        Returns: undefined
      }
      recalculate_ranking_positions: {
        Args: { target_ranking_id?: string }
        Returns: undefined
      }
      reset_all_voting_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      achievement_rarity: "common" | "rare" | "epic" | "legendary"
      achievement_type:
        | "voting"
        | "engagement"
        | "quality"
        | "community"
        | "time_based"
        | "special"
      app_role: "admin" | "moderator" | "blog_editor" | "user"
      image_style:
        | "photo_real"
        | "comic_book"
        | "anime"
        | "video_game"
        | "hardcore"
        | "minimalist"
        | "retro"
      member_status: "bronze" | "silver" | "gold" | "platinum" | "diamond"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      achievement_rarity: ["common", "rare", "epic", "legendary"],
      achievement_type: [
        "voting",
        "engagement",
        "quality",
        "community",
        "time_based",
        "special",
      ],
      app_role: ["admin", "moderator", "blog_editor", "user"],
      image_style: [
        "photo_real",
        "comic_book",
        "anime",
        "video_game",
        "hardcore",
        "minimalist",
        "retro",
      ],
      member_status: ["bronze", "silver", "gold", "platinum", "diamond"],
    },
  },
} as const
