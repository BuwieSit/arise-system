import Dexie, { type Table } from 'dexie';
import type { UserProfile, UserStats, Quest } from '../types';
import type { InventoryItem, SystemLog } from '../types/features';

export class AriseDatabase extends Dexie {
  userProfile!: Table<UserProfile & { id: number }>;
  userStats!: Table<UserStats & { id: number }>;
  quests!: Table<Quest>;
  inventory!: Table<InventoryItem>;
  systemLogs!: Table<SystemLog>;

  constructor() {
    super('AriseSystemDB');
    this.version(2).stores({
      userProfile: 'id',
      userStats: 'id',
      quests: 'id, type, rank, expiresAt',
      inventory: 'id, rarity',
      systemLogs: 'id, category, timestamp'
    });
  }
}

export const db = new AriseDatabase();
