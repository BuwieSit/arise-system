export type HunterRank = 'E-Rank' | 'D-Rank' | 'C-Rank' | 'B-Rank' | 'A-Rank' | 'S-Rank';

export interface UserStats {
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  sense: number;
}

export interface OnboardingData {
  height: number;
  weight: number;
  build: 'High Body Fat' | 'Average' | 'Athletic & High Muscle';
  exerciseFrequency: '0 days' | '1–2 days' | '3–4 days' | '5+ days';
  conditions: string[];
  sleepHours: number;
  stressLevel: number;
  bmi: number;
  physicalIndex: number; // 0.1 to 2.0 multiplier
}

export interface UserProfile {
  id: string; // Supabase UID
  name: string;
  title: string;
  level: number;
  xp: number;
  rank: HunterRank;
  attributePoints: number;
  onboarding?: OnboardingData;
  created_at?: string;
  updated_at?: string;
}

export interface UserSession {
  user_id: string;
  email: string;
}

export type QuestDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'BOSS';

export type TaskType = 'STR_FOCUS' | 'AGI_FOCUS' | 'INT_FOCUS' | 'VIT_FOCUS' | 'BALANCED';

export interface WellnessTask {
  id: string;
  title: string;
  type: 'PHYSICAL' | 'MENTAL' | 'PSYCH';
  rewardXp: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface ProgramTask {
  id: string;
  text: string;
  type: keyof UserStats;
  completed: boolean;
  completedAt?: Date;
}

export interface ProgramRewards {
  xp: number;
  stats: Partial<UserStats>;
  item: string;
}

export interface Program {
  id: string;
  title: string;
  difficulty: string;
  category: 'Physical' | 'Mental' | 'Psychological';
  tasks: ProgramTask[];
  rewards: ProgramRewards;
  isClaimed?: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'DAILY' | 'SIDE' | 'URGENT' | 'AI_GENERATED';
  taskType?: TaskType;
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
  items?: string[];
}

export interface SystemSettings {
  sfxEnabled: boolean;
  hapticEnabled: boolean;
  streamerMode: boolean;
}
