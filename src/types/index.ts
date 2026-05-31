export type HunterRank = 'E-Rank' | 'D-Rank' | 'C-Rank' | 'B-Rank' | 'A-Rank' | 'S-Rank';

export interface UserStats {
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  sense: number;
}

export interface UserProfile {
  name: string;
  title: string;
  level: number;
  xp: number;
  rank: HunterRank;
  attributePoints: number;
}

export type QuestDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'BOSS';

export interface WellnessTask {
  id: string;
  title: string;
  type: 'PHYSICAL' | 'MENTAL' | 'PSYCH';
  rewardXp: number;
  isCompleted: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'DAILY' | 'SIDE' | 'URGENT' | 'AI_GENERATED';
  rank: HunterRank;
  difficulty?: QuestDifficulty;
  objectives: QuestObjective[];
  rewards: QuestRewards;
  expiresAt?: Date;
  completedAt?: Date;
  isPenalty?: boolean;
}

export interface QuestObjective {
  id: string;
  task: string;
  current: number;
  target: number;
  unit?: string;
}

export interface QuestRewards {
  xp: number;
  attributePoints?: number;
  title?: string;
}
