import Dexie, { type Table } from 'dexie';
import type { UserProfile, UserStats, Quest, WellnessTask, Program } from '../types';
import type { InventoryItem, SystemLog } from '../types/features';

export class AriseDatabase extends Dexie {
  userProfile!: Table<UserProfile & { id: number }>;
  userStats!: Table<UserStats & { id: number }>;
  quests!: Table<Quest>;
  inventory!: Table<InventoryItem>;
  systemLogs!: Table<SystemLog>;
  wellnessTasks!: Table<WellnessTask>;
  programs!: Table<Program>;

  constructor() {
    super('AriseSystemDB');
    this.version(4).stores({
      userProfile: 'id',
      userStats: 'id',
      quests: 'id, type, rank, expiresAt',
      inventory: 'id, rarity',
      systemLogs: 'id, category, timestamp',
      wellnessTasks: 'id, type',
      programs: 'id, category'
    });
  }
}

export const db = new AriseDatabase();
