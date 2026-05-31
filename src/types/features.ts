export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface InventoryItem {
  id: string;
  name: string;
  rarity: ItemRarity;
  description: string;
  isConsumable: boolean;
  attributeBoost?: {
    strength?: number;
    agility?: number;
    vitality?: number;
    intelligence?: number;
    sense?: number;
  };
  quantity: number;
}

export type LogCategory = 'SYSTEM_EVENT' | 'QUEST_LOG' | 'ACHIEVEMENT' | 'PENALTY';

export interface SystemLog {
  id: string;
  timestamp: Date;
  category: LogCategory;
  message: string;
  metadata?: {
    questId?: string;
    levelUp?: number;
    statsAdded?: string;
    raw_sensor_summary?: string;
  };
}
