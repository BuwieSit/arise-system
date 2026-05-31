import { create } from 'zustand';
import type { UserProfile, UserStats, Quest } from '../types';
import type { InventoryItem, SystemLog } from '../types/features';
import { db } from '../db/database';
import { calculateRequiredXp, getRankFromLevel, getRankTitle } from '../utils/systemCalculations';
import { generateSystemDirective } from '../utils/geminiService';

interface SystemState {
  profile: UserProfile;
  stats: UserStats;
  quests: Quest[];
  inventory: InventoryItem[];
  logs: SystemLog[];
  isLoading: boolean;
  isPenaltyActive: boolean;
  isInitialized: boolean;
  systemDirective: string;
  
  // Actions
  initialize: () => Promise<void>;
  addXp: (amount: number) => Promise<void>;
  allocateAttributePoint: (stat: keyof UserStats) => Promise<void>;
  updateQuestProgress: (questId: string, objectiveId: string, amount: number) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
  seedDailyQuest: () => Promise<void>;
  checkPenalty: () => void;
  fetchSystemDirective: () => Promise<void>;
  addLog: (category: SystemLog['category'], message: string, metadata?: SystemLog['metadata']) => Promise<void>;
  addItem: (item: Omit<InventoryItem, 'quantity'>, quantity: number) => Promise<void>;
  useItem: (itemId: string) => Promise<void>;
}

const INITIAL_PROFILE: UserProfile = {
  name: 'Hunter',
  title: 'Newbie Hunter',
  level: 1,
  xp: 0,
  rank: 'E-Rank',
  attributePoints: 0
};

const INITIAL_STATS: UserStats = {
  strength: 10,
  agility: 10,
  vitality: 10,
  intelligence: 10,
  sense: 10
};

export const useSystemStore = create<SystemState>((set, get) => ({
  profile: INITIAL_PROFILE,
  stats: INITIAL_STATS,
  quests: [],
  inventory: [],
  logs: [],
  isLoading: true,
  isPenaltyActive: false,
  isInitialized: false,
  systemDirective: "The System is initializing...",

  initialize: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true });
    try {
      console.log('System: Initializing database...');
      const profile = await db.userProfile.get(1);
      const stats = await db.userStats.get(1);
      let quests = await db.quests.toArray();
      const inventory = await db.inventory.toArray();
      const logs = await db.systemLogs.orderBy('timestamp').reverse().toArray();

      if (profile && stats) {
        console.log('System: Profile found, loading data.');
        if (quests.length === 0) {
           await get().seedDailyQuest();
           quests = await db.quests.toArray();
        }
        set({ profile, stats, quests, inventory, logs, isLoading: false, isInitialized: true });
      } else {
        console.log('System: No profile found, performing initial setup.');
        await db.userProfile.put({ ...INITIAL_PROFILE, id: 1 });
        await db.userStats.put({ ...INITIAL_STATS, id: 1 });
        await get().seedDailyQuest();
        quests = await db.quests.toArray();
        set({ profile: INITIAL_PROFILE, stats: INITIAL_STATS, quests, inventory: [], logs: [], isLoading: false, isInitialized: true });
        await get().addLog('SYSTEM_EVENT', 'System Awakening: Welcome, Hunter.');
      }
      get().checkPenalty();
      get().fetchSystemDirective();
    } catch (error) {
      console.error('System: Failed to initialize:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  fetchSystemDirective: async () => {
    const { profile, stats, quests } = get();
    const response = await generateSystemDirective(profile, stats, quests);
    set({ systemDirective: response.directive });
  },

  seedDailyQuest: async () => {
    const dailyQuest: Quest = {
      id: `daily-${new Date().toISOString().split('T')[0]}`,
      title: 'Preparation for Building Power',
      description: 'The road to strength is paved with consistency.',
      type: 'DAILY',
      rank: 'E-Rank',
      objectives: [
        { id: 'obj-1', task: 'Push-Ups', current: 0, target: 100 },
        { id: 'obj-2', task: 'Sit-Ups', current: 0, target: 100 },
        { id: 'obj-3', task: 'Squats', current: 0, target: 100 },
        { id: 'obj-4', task: 'Running', current: 0, target: 10, unit: 'km' }
      ],
      rewards: {
        xp: 100,
        attributePoints: 3
      },
      expiresAt: new Date(new Date().setHours(28, 0, 0, 0))
    };
    await db.quests.put(dailyQuest);
  },

  addLog: async (category, message, metadata) => {
    const newLog: SystemLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      category,
      message,
      metadata
    };
    await db.systemLogs.put(newLog);
    set(state => ({ logs: [newLog, ...state.logs].slice(0, 100) }));
  },

  addItem: async (item, quantity) => {
    const existing = await db.inventory.get(item.id);
    const updatedItem = existing 
      ? { ...existing, quantity: existing.quantity + quantity }
      : { ...item, quantity };
    
    await db.inventory.put(updatedItem);
    const inventory = await db.inventory.toArray();
    set({ inventory });
    await get().addLog('SYSTEM_EVENT', `Acquired Item: ${item.name} x${quantity}`);
  },

  useItem: async (itemId) => {
    const item = await db.inventory.get(itemId);
    if (!item || item.quantity <= 0) return;

    if (item.isConsumable) {
      const updatedItem = { ...item, quantity: item.quantity - 1 };
      if (updatedItem.quantity > 0) {
        await db.inventory.put(updatedItem);
      } else {
        await db.inventory.delete(itemId);
      }
      
      // Apply boosts if any
      if (item.attributeBoost) {
        const { stats } = get();
        const updatedStats = {
          strength: stats.strength + (item.attributeBoost.strength || 0),
          agility: stats.agility + (item.attributeBoost.agility || 0),
          vitality: stats.vitality + (item.attributeBoost.vitality || 0),
          intelligence: stats.intelligence + (item.attributeBoost.intelligence || 0),
          sense: stats.sense + (item.attributeBoost.sense || 0),
        };
        await db.userStats.update(1, updatedStats);
        set({ stats: updatedStats });
      }

      const inventory = await db.inventory.toArray();
      set({ inventory });
      await get().addLog('SYSTEM_EVENT', `Consumed Item: ${item.name}`);
    }
  },

  addXp: async (amount: number) => {
    const { profile } = get();
    let newXp = profile.xp + amount;
    let newLevel = profile.level;
    let newAttributePoints = profile.attributePoints;
    let leveledUp = false;

    while (newXp >= calculateRequiredXp(newLevel)) {
      newXp -= calculateRequiredXp(newLevel);
      newLevel++;
      newAttributePoints += 3;
      leveledUp = true;
    }

    const newRank = getRankFromLevel(newLevel);
    const newTitle = profile.level !== newLevel ? getRankTitle(newRank) : profile.title;

    const updatedProfile = {
      ...profile,
      xp: newXp,
      level: newLevel,
      rank: newRank,
      title: newTitle,
      attributePoints: newAttributePoints
    };

    await db.userProfile.update(1, updatedProfile);
    set({ profile: updatedProfile });
    
    if (leveledUp) {
      await get().addLog('ACHIEVEMENT', `Level Up! Reached Level ${newLevel}. +3 Attribute Points awarded.`, { levelUp: newLevel });
      get().fetchSystemDirective();
    }
  },

  allocateAttributePoint: async (stat: keyof UserStats) => {
    const { profile, stats } = get();
    if (profile.attributePoints <= 0) return;

    const updatedStats = {
      ...stats,
      [stat]: stats[stat] + 1
    };

    const updatedProfile = {
      ...profile,
      attributePoints: profile.attributePoints - 1
    };

    await db.userStats.update(1, updatedStats);
    await db.userProfile.update(1, updatedProfile);
    set({ stats: updatedStats, profile: updatedProfile });
    await get().addLog('SYSTEM_EVENT', `Stat Up: ${stat.toUpperCase()} increased to ${updatedStats[stat]}.`);
  },

  updateQuestProgress: async (questId: string, objectiveId: string, amount: number) => {
    const { quests } = get();
    const updatedQuests = quests.map(q => {
      if (q.id === questId) {
        const updatedObjectives = q.objectives.map(obj => {
          if (obj.id === objectiveId) {
            return { ...obj, current: Math.min(obj.current + amount, obj.target) };
          }
          return obj;
        });
        return { ...q, objectives: updatedObjectives };
      }
      return q;
    });

    const targetQuest = updatedQuests.find(q => q.id === questId);
    if (targetQuest) {
      await db.quests.put(targetQuest);
    }
    set({ quests: updatedQuests });
  },

  completeQuest: async (questId: string) => {
    const { quests } = get();
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.completedAt) return;

    const allObjectivesMet = quest.objectives.every(obj => obj.current >= obj.target);
    if (!allObjectivesMet) return;

    const updatedQuest = { ...quest, completedAt: new Date() };
    await db.quests.put(updatedQuest);
    
    await get().addLog('QUEST_LOG', `Quest Cleared: ${quest.title}`);
    
    // Add rewards
    await get().addXp(quest.rewards.xp);
    if (quest.rewards.attributePoints) {
       const { profile } = get();
       const updatedProfile = { ...profile, attributePoints: profile.attributePoints + quest.rewards.attributePoints };
       await db.userProfile.update(1, updatedProfile);
       set({ profile: updatedProfile });
    }

    set({ quests: quests.map(q => q.id === questId ? updatedQuest : q) });
    get().checkPenalty();
    get().fetchSystemDirective();
  },

  checkPenalty: () => {
    const { quests } = get();
    const dailyQuest = quests.find(q => q.type === 'DAILY');
    if (dailyQuest && !dailyQuest.completedAt && dailyQuest.expiresAt) {
      const now = new Date();
      if (now > dailyQuest.expiresAt) {
        if (!get().isPenaltyActive) {
          get().addLog('PENALTY', 'The Daily Quest was not completed. Penalty Zone activated.');
        }
        set({ isPenaltyActive: true });
      } else {
        set({ isPenaltyActive: false });
      }
    } else {
      set({ isPenaltyActive: false });
    }
  }
}));
