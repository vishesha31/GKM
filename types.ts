
export type FeedbackType = 'word' | 'emoji' | 'poll' | 'comment';

export interface FeedbackEntry {
  id: string;
  type: FeedbackType;
  value: string;
  timestamp: number;
}

export enum PollOption {
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  AVERAGE = 'Average',
  NEEDS_IMPROVEMENT = 'Needs Improvement'
}

export const EMOJIS = ['😊', '⭐', '❤️', '👏'];
