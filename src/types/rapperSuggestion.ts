export interface RapperSuggestion {
  id: string;
  user_id: string;
  rapper_name: string;
  additional_info?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RapperSuggestionWithUser extends RapperSuggestion {
  username?: string;
  avatar_url?: string;
}
