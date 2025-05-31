
export interface PainPoint {
  id: string;
  headline: string;
  subheadline: string;
  painPoint: string;
  solution: string;
  tags: string[];
  valuationEstimate: number;
  voteCount: number;
  commentCount: number;
  createdAt: string;
  authorId: string;
  totalPoints: number;
  isPainPoint: boolean;
  cta?: string;
}
