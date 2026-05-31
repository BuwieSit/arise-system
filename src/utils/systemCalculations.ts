import type { HunterRank } from '../types';

export const calculateRequiredXp = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5)) + (level * 50);
};

export const getRankFromLevel = (level: number): HunterRank => {
  if (level >= 100) return 'S-Rank';
  if (level >= 71) return 'A-Rank';
  if (level >= 46) return 'B-Rank';
  if (level >= 26) return 'C-Rank';
  if (level >= 11) return 'D-Rank';
  return 'E-Rank';
};

export const getRankTitle = (rank: HunterRank): string => {
  switch (rank) {
    case 'S-Rank': return 'Monarch';
    case 'A-Rank': return 'High-Rank Hunter';
    case 'B-Rank': return 'Veteran Hunter';
    case 'C-Rank': return 'Advanced Hunter';
    case 'D-Rank': return 'Junior Hunter';
    case 'E-Rank': return 'Newbie Hunter';
    default: return 'Hunter';
  }
};
