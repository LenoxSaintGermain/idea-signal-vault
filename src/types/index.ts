
export interface Idea {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  valuationEstimate: number;
  voteCount: number;
  commentCount: number;
  createdAt: string;
  authorId: string;
  totalPoints: number;
  // Pain Point specific fields
  headline?: string;
  subheadline?: string;
  painPoint?: string;
  solution?: string;
  isPainPoint?: boolean;
  cta?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  signalPoints: number;
  ideasInfluenced: number;
  estimatedTake: number;
}

export interface Contribution {
  id: string;
  userId: string;
  ideaId: string;
  action: 'upvote' | 'comment' | 'detailed_feedback' | 'enhancement_accepted' | 'idea_submission';
  points: number;
  timestamp: string;
}

export interface ROISimulation {
  investmentAmount: number;
  exitValuation: number;
  equityOwned: number;
  estimatedExitValue: number;
  roi: number;
}
