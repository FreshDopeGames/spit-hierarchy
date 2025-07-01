
export interface DailyVoteRecord {
  user_id: string;
  rapper_id: string;
  ranking_id: string;
  vote_date: string;
}

export interface StoredVoteData {
  date: string;
  ranking_id: string;
  user_id: string;
  votes: DailyVoteRecord[];
}
