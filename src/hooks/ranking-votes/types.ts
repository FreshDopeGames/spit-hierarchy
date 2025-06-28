
export interface VoteSubmissionParams {
  rankingId: string;
  rapperId: string;
}

export interface VoteMutationContext {
  previousData: any;
  voteWeight: number;
}
