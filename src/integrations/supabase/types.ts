export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
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
      albums: {
        Row: {
          cover_art_colors: Json | null
          cover_art_url: string | null
          created_at: string
          external_cover_links: Json | null
          has_cover_art: boolean | null
          id: string
          label_id: string | null
          musicbrainz_id: string | null
          release_date: string | null
          release_type: string
          title: string
          track_count: number | null
          updated_at: string
        }
        Insert: {
          cover_art_colors?: Json | null
          cover_art_url?: string | null
          created_at?: string
          external_cover_links?: Json | null
          has_cover_art?: boolean | null
          id?: string
          label_id?: string | null
          musicbrainz_id?: string | null
          release_date?: string | null
          release_type?: string
          title: string
          track_count?: number | null
          updated_at?: string
        }
        Update: {
          cover_art_colors?: Json | null
          cover_art_url?: string | null
          created_at?: string
          external_cover_links?: Json | null
          has_cover_art?: boolean | null
          id?: string
          label_id?: string | null
          musicbrainz_id?: string | null
          release_date?: string | null
          release_type?: string
          title?: string
          track_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "albums_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "record_labels"
            referencedColumns: ["id"]
          },
        ]
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
      musicbrainz_audit_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          ip_address: unknown | null
          rapper_id: string
          request_data: Json | null
          response_data: Json | null
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          ip_address?: unknown | null
          rapper_id: string
          request_data?: Json | null
          response_data?: Json | null
          status: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          ip_address?: unknown | null
          rapper_id?: string
          request_data?: Json | null
          response_data?: Json | null
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      musicbrainz_rate_limits: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          request_count: number | null
          updated_at: string
          user_id: string | null
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          request_count?: number | null
          updated_at?: string
          user_id?: string | null
          window_start?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          request_count?: number | null
          updated_at?: string
          user_id?: string | null
          window_start?: string
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
            referencedRelation: "rapper_vote_stats"
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
      poll_options: {
        Row: {
          created_at: string
          id: string
          option_order: number
          option_text: string
          poll_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_order?: number
          option_text: string
          poll_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_order?: number
          option_text?: string
          poll_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          poll_id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          poll_id: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          poll_id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          allow_write_in: boolean
          blog_post_id: string | null
          created_at: string
          created_by: string
          description: string | null
          expires_at: string | null
          id: string
          is_featured: boolean | null
          placement: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          allow_write_in?: boolean
          blog_post_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_featured?: boolean | null
          placement?: string
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          allow_write_in?: boolean
          blog_post_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_featured?: boolean | null
          placement?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_access_logs: {
        Row: {
          access_type: string
          accessed_profile_id: string
          accessor_user_id: string | null
          created_at: string | null
          id: string
        }
        Insert: {
          access_type: string
          accessed_profile_id: string
          accessor_user_id?: string | null
          created_at?: string | null
          id?: string
        }
        Update: {
          access_type?: string
          accessed_profile_id?: string
          accessor_user_id?: string | null
          created_at?: string | null
          id?: string
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
            referencedRelation: "rapper_vote_stats"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "rapper_vote_stats"
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
            referencedRelation: "rapper_vote_stats"
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
      rapper_albums: {
        Row: {
          album_id: string
          created_at: string
          id: string
          rapper_id: string
          role: string | null
        }
        Insert: {
          album_id: string
          created_at?: string
          id?: string
          rapper_id: string
          role?: string | null
        }
        Update: {
          album_id?: string
          created_at?: string
          id?: string
          rapper_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rapper_albums_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapper_albums_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_vote_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapper_albums_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_voting_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapper_albums_rapper_id_fkey"
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
            referencedRelation: "rapper_vote_stats"
            referencedColumns: ["id"]
          },
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
      rapper_labels: {
        Row: {
          created_at: string
          end_year: number | null
          id: string
          is_current: boolean | null
          label_id: string
          rapper_id: string
          start_year: number | null
        }
        Insert: {
          created_at?: string
          end_year?: number | null
          id?: string
          is_current?: boolean | null
          label_id: string
          rapper_id: string
          start_year?: number | null
        }
        Update: {
          created_at?: string
          end_year?: number | null
          id?: string
          is_current?: boolean | null
          label_id?: string
          rapper_id?: string
          start_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rapper_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "record_labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapper_labels_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_vote_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapper_labels_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_voting_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapper_labels_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rappers"
            referencedColumns: ["id"]
          },
        ]
      }
      rapper_singles: {
        Row: {
          created_at: string
          id: string
          rapper_id: string
          role: string | null
          single_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rapper_id: string
          role?: string | null
          single_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rapper_id?: string
          role?: string | null
          single_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rapper_singles_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_vote_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapper_singles_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_voting_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapper_singles_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rappers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapper_singles_single_id_fkey"
            columns: ["single_id"]
            isOneToOne: false
            referencedRelation: "singles"
            referencedColumns: ["id"]
          },
        ]
      }
      rapper_tag_assignments: {
        Row: {
          created_at: string
          id: string
          rapper_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rapper_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rapper_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_rapper_tag_assignments_rapper"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_vote_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rapper_tag_assignments_rapper"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_voting_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rapper_tag_assignments_rapper"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rappers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rapper_tag_assignments_tag"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "rapper_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      rapper_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      rappers: {
        Row: {
          average_rating: number | null
          bio: string | null
          birth_day: number | null
          birth_month: number | null
          birth_year: number | null
          career_end_year: number | null
          career_start_year: number | null
          created_at: string
          death_day: number | null
          death_month: number | null
          death_year: number | null
          discography_last_updated: string | null
          id: string
          image_url: string | null
          instagram_handle: string | null
          musicbrainz_id: string | null
          name: string
          origin: string | null
          origins_description: string | null
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
          career_end_year?: number | null
          career_start_year?: number | null
          created_at?: string
          death_day?: number | null
          death_month?: number | null
          death_year?: number | null
          discography_last_updated?: string | null
          id?: string
          image_url?: string | null
          instagram_handle?: string | null
          musicbrainz_id?: string | null
          name: string
          origin?: string | null
          origins_description?: string | null
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
          career_end_year?: number | null
          career_start_year?: number | null
          created_at?: string
          death_day?: number | null
          death_month?: number | null
          death_year?: number | null
          discography_last_updated?: string | null
          id?: string
          image_url?: string | null
          instagram_handle?: string | null
          musicbrainz_id?: string | null
          name?: string
          origin?: string | null
          origins_description?: string | null
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
      record_labels: {
        Row: {
          country: string | null
          created_at: string
          founded_year: number | null
          id: string
          logo_url: string | null
          musicbrainz_id: string | null
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          musicbrainz_id?: string | null
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          musicbrainz_id?: string | null
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      section_headers: {
        Row: {
          background_image_url: string | null
          created_at: string
          id: string
          is_active: boolean
          section: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          background_image_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          section: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          background_image_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          section?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      singles: {
        Row: {
          album_id: string | null
          chart_country: string | null
          created_at: string
          duration_ms: number | null
          id: string
          musicbrainz_id: string | null
          peak_chart_position: number | null
          release_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          album_id?: string | null
          chart_country?: string | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          musicbrainz_id?: string | null
          peak_chart_position?: number | null
          release_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          album_id?: string | null
          chart_country?: string | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          musicbrainz_id?: string | null
          peak_chart_position?: number | null
          release_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "singles_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "rapper_vote_stats"
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
            referencedRelation: "rapper_vote_stats"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "rapper_vote_stats"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "rapper_vote_stats"
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
      vs_match_votes: {
        Row: {
          created_at: string
          id: string
          rapper_choice_id: string
          user_id: string
          vote_date: string
          vs_match_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rapper_choice_id: string
          user_id: string
          vote_date?: string
          vs_match_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rapper_choice_id?: string
          user_id?: string
          vote_date?: string
          vs_match_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vs_match_votes_rapper_choice_id_fkey"
            columns: ["rapper_choice_id"]
            isOneToOne: false
            referencedRelation: "rapper_vote_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vs_match_votes_rapper_choice_id_fkey"
            columns: ["rapper_choice_id"]
            isOneToOne: false
            referencedRelation: "rapper_voting_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vs_match_votes_rapper_choice_id_fkey"
            columns: ["rapper_choice_id"]
            isOneToOne: false
            referencedRelation: "rappers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vs_match_votes_vs_match_id_fkey"
            columns: ["vs_match_id"]
            isOneToOne: false
            referencedRelation: "vs_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      vs_matches: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          rapper_1_id: string
          rapper_2_id: string
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          rapper_1_id: string
          rapper_2_id: string
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          rapper_1_id?: string
          rapper_2_id?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vs_matches_rapper_1_id_fkey"
            columns: ["rapper_1_id"]
            isOneToOne: false
            referencedRelation: "rapper_vote_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vs_matches_rapper_1_id_fkey"
            columns: ["rapper_1_id"]
            isOneToOne: false
            referencedRelation: "rapper_voting_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vs_matches_rapper_1_id_fkey"
            columns: ["rapper_1_id"]
            isOneToOne: false
            referencedRelation: "rappers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vs_matches_rapper_2_id_fkey"
            columns: ["rapper_2_id"]
            isOneToOne: false
            referencedRelation: "rapper_vote_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vs_matches_rapper_2_id_fkey"
            columns: ["rapper_2_id"]
            isOneToOne: false
            referencedRelation: "rapper_voting_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vs_matches_rapper_2_id_fkey"
            columns: ["rapper_2_id"]
            isOneToOne: false
            referencedRelation: "rappers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      blog_post_like_counts: {
        Row: {
          like_count: number | null
          post_id: string | null
        }
        Relationships: []
      }
      comment_like_counts: {
        Row: {
          comment_id: string | null
          like_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_results: {
        Row: {
          option_id: string | null
          poll_id: string | null
          vote_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_vote_counts: {
        Row: {
          avg_vote_weight: number | null
          ranking_id: string | null
          rapper_id: string | null
          total_vote_weight: number | null
          vote_count: number | null
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
            referencedRelation: "rapper_vote_stats"
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
      rapper_popularity_stats: {
        Row: {
          average_position: number | null
          rapper_id: string | null
          times_in_top_five: number | null
          times_ranked_first: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_top_rappers_rapper_id_fkey"
            columns: ["rapper_id"]
            isOneToOne: false
            referencedRelation: "rapper_vote_stats"
            referencedColumns: ["id"]
          },
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
      rapper_vote_counts: {
        Row: {
          average_rating: number | null
          category_id: string | null
          rapper_id: string | null
          unique_voter_count: number | null
          vote_count: number | null
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
            referencedRelation: "rapper_vote_stats"
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
      rapper_vote_stats: {
        Row: {
          average_rating: number | null
          first_vote_date: string | null
          id: string | null
          last_vote_date: string | null
          name: string | null
          slug: string | null
          total_votes: number | null
          unique_voters: number | null
          votes_last_30_days: number | null
          votes_last_7_days: number | null
        }
        Relationships: []
      }
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
      check_musicbrainz_rate_limit: {
        Args: {
          p_ip_address?: string
          p_max_requests?: number
          p_user_id?: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          action_type: string
          max_requests?: number
          user_uuid?: string
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
      fetch_musicbrainz_discography: {
        Args: {
          p_force_refresh?: boolean
          p_rapper_id: string
          p_user_id?: string
        }
        Returns: Json
      }
      find_user_by_username: {
        Args: { search_username: string }
        Returns: {
          id: string
          username: string
        }[]
      }
      get_category_voting_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          average_rating: number
          description: string
          id: string
          name: string
          total_votes: number
          unique_rappers: number
          unique_voters: number
        }[]
      }
      get_official_ranking_vote_count: {
        Args: { ranking_uuid: string }
        Returns: number
      }
      get_own_complete_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          bio: string
          birthdate: string
          created_at: string
          full_name: string
          id: string
          location: string
          preferred_image_style: Database["public"]["Enums"]["image_style"]
          social_links: Json
          updated_at: string
          username: string
        }[]
      }
      get_own_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          bio: string
          birthdate: string
          created_at: string
          full_name: string
          id: string
          location: string
          preferred_image_style: Database["public"]["Enums"]["image_style"]
          social_links: Json
          updated_at: string
          username: string
        }[]
      }
      get_position_delta: {
        Args: { p_ranking_id: string; p_rapper_id: string }
        Returns: number
      }
      get_profile_for_display: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          bio_preview: string
          created_at: string
          full_name: string
          id: string
          username: string
        }[]
      }
      get_profiles_batch: {
        Args: { profile_user_ids: string[] }
        Returns: {
          avatar_url: string
          first_name: string
          id: string
          username: string
        }[]
      }
      get_public_category_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          average_rating: number
          category_id: string
          category_name: string
          total_votes: number
          unique_rappers: number
          unique_voters: number
        }[]
      }
      get_public_profile_full: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          id: string
          member_stats: Json
          username: string
        }[]
      }
      get_public_profile_minimal: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          first_name: string
          id: string
          username: string
        }[]
      }
      get_public_profile_safe: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          bio_preview: string
          created_at: string
          first_name: string
          id: string
          username: string
        }[]
      }
      get_public_profiles_batch: {
        Args: { profile_user_ids: string[] }
        Returns: {
          avatar_url: string
          id: string
          username: string
        }[]
      }
      get_public_rapper_voting_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          average_rating: number
          id: string
          name: string
          total_votes: number
          unique_voters: number
          votes_last_30_days: number
          votes_last_7_days: number
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
          average_rating: number
          id: string
          name: string
          total_votes: number
          unique_voters: number
          votes_last_30_days: number
          votes_last_7_days: number
        }[]
      }
      get_total_member_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_trending_rappers: {
        Args: { days_back?: number }
        Returns: {
          momentum_score: number
          rapper_id: string
          rapper_name: string
          recent_average_rating: number
          recent_votes: number
          total_votes: number
        }[]
      }
      get_user_ranking_preview_items: {
        Args: { item_limit?: number; ranking_uuid: string }
        Returns: {
          id: string
          is_ranked: boolean
          item_position: number
          rapper_id: string
          rapper_image_url: string
          rapper_name: string
          rapper_slug: string
          reason: string
        }[]
      }
      get_user_ranking_vote_count: {
        Args: { ranking_uuid: string }
        Returns: number
      }
      get_user_voting_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          average_rating_given: number
          categories_used: number
          first_vote_date: string
          last_vote_date: string
          total_votes: number
          unique_rappers_voted: number
          user_id: string
        }[]
      }
      get_vote_weight: {
        Args: { status: Database["public"]["Enums"]["member_status"] }
        Returns: number
      }
      has_role: {
        Args: { _role: string; _user_id: string }
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
      log_profile_access: {
        Args: { access_type?: string; accessed_id: string }
        Returns: undefined
      }
      log_profile_access_secure: {
        Args: { access_type?: string; accessed_id: string }
        Returns: undefined
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
      search_profiles_admin: {
        Args: { search_term?: string }
        Returns: {
          avatar_url: string
          created_at: string
          full_name: string
          id: string
          username: string
        }[]
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
