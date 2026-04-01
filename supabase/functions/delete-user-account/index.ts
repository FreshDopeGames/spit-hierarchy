import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify the caller's JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { target_user_id } = await req.json();
    
    if (!target_user_id || typeof target_user_id !== 'string') {
      return new Response(JSON.stringify({ error: 'target_user_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isSelfDelete = caller.id === target_user_id;

    // If not self-delete, verify caller is admin
    if (!isSelfDelete) {
      const { data: callerRoles } = await supabaseAuth
        .from('user_roles')
        .select('role')
        .eq('user_id', caller.id)
        .eq('role', 'admin');
      
      if (!callerRoles || callerRoles.length === 0) {
        return new Response(JSON.stringify({ error: 'Only admins can delete other users' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Delete user data from public tables (cascading from auth.users deletion handles FK refs,
    // but we clean up tables without FK constraints)
    const tablesToClean = [
      // Rankings & Top 5
      { table: 'user_ranking_items', column: 'user_id' },
      { table: 'user_ranking_votes', column: 'user_id' },
      { table: 'user_ranking_views', column: 'user_id' },
      { table: 'user_rankings', column: 'user_id' },
      { table: 'user_top_rappers', column: 'user_id' },
      // Voting
      { table: 'daily_vote_tracking', column: 'user_id' },
      { table: 'ranking_votes', column: 'user_id' },
      { table: 'poll_votes', column: 'user_id' },
      { table: 'votes', column: 'user_id' },
      { table: 'vote_notes', column: 'user_id' },
      { table: 'vs_match_votes', column: 'user_id' },
      { table: 'track_votes', column: 'user_id' },
      // Achievements & Quiz
      { table: 'user_achievements', column: 'user_id' },
      { table: 'user_quiz_attempts', column: 'user_id' },
      { table: 'user_quiz_badges', column: 'user_id' },
      // Social & Comments
      { table: 'comment_likes', column: 'user_id' },
      { table: 'comments', column: 'user_id' },
      { table: 'blog_post_likes', column: 'user_id' },
      { table: 'member_journal_entries', column: 'user_id' },
      { table: 'content_moderation_flags', column: 'user_id' },
      { table: 'rapper_suggestions', column: 'user_id' },
      // Notifications & Preferences
      { table: 'notification_preferences', column: 'user_id' },
      { table: 'notifications', column: 'user_id' },
      // Analytics & Logs
      { table: 'rapper_page_views', column: 'user_id' },
      { table: 'profile_access_logs', column: 'accessor_user_id' },
      { table: 'consent_logs', column: 'user_id' },
      { table: 'user_referrals', column: 'user_id' },
      // Stats (uses id, not user_id)
      { table: 'member_stats', column: 'id' },
    ];

    for (const { table, column } of tablesToClean) {
      await supabaseAuth.from(table).delete().eq(column, target_user_id);
    }

    // Delete profile (uses id, not user_id)
    await supabaseAuth.from('profiles').delete().eq('id', target_user_id);

    // Delete user_roles
    await supabaseAuth.from('user_roles').delete().eq('user_id', target_user_id);

    // Finally, delete the auth user
    const { error: deleteError } = await supabaseAuth.auth.admin.deleteUser(target_user_id);
    
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      return new Response(JSON.stringify({ error: 'Failed to delete user account' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
