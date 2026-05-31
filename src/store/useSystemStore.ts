import { create } from 'zustand';
import type { UserProfile, UserStats, Quest, WellnessTask, QuestDifficulty, SystemSettings, Program, OnboardingData } from '../types';
import type { InventoryItem, SystemLog, SystemToast } from '../types/features';
import { db } from '../db/database';
import { calculateRequiredXp, getRankFromLevel, getRankTitle } from '../utils/systemCalculations';
import { generateSystemDirective } from '../utils/geminiService';
import { playSystemSFX, type SoundEffect } from '../utils/audioService';

interface SystemState {
  profile: UserProfile;
  stats: UserStats;
  quests: Quest[];
  programs: Program[];
  inventory: InventoryItem[];
  logs: SystemLog[];
  wellnessTasks: WellnessTask[];
  toasts: SystemToast[];
  settings: SystemSettings;
  isLoading: boolean;
  isPenaltyActive: boolean;
  isInitialized: boolean;
  systemDirective: string;
  globalDifficulty: QuestDifficulty;
  trainingFocus: 'BALANCED' | 'STRENGTH' | 'AGILITY' | 'VITALITY';
  systemLocked: boolean;
  cooldownTasks: Record<string, boolean>;
  
  // Actions
  initialize: () => Promise<void>;
  addXp: (amount: number, silent?: boolean) => Promise<void>;
  updateQuestProgress: (questId: string, objectiveId: string, amount: number) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
  undoQuestCompletion: (questId: string) => Promise<void>;
  seedDailyQuest: () => Promise<void>;
  seedInventory: () => Promise<void>;
  seedPrograms: () => Promise<void>;
  checkPenalty: () => void;
  fetchSystemDirective: () => Promise<void>;
  addLog: (category: SystemLog['category'], message: string, metadata?: SystemLog['metadata']) => Promise<void>;
  addToast: (toast: Omit<SystemToast, 'id'>) => void;
  removeToast: (id: string) => void;
  addItem: (item: Omit<InventoryItem, 'quantity'>, quantity: number) => Promise<void>;
  useItem: (itemId: string) => Promise<void>;
  completeWellnessTask: (taskId: string) => Promise<void>;
  undoWellnessTask: (taskId: string) => Promise<void>;
  toggleProgramTask: (programId: string, taskId: string) => Promise<void>;
  claimProgramRewards: (programId: string) => Promise<void>;
  setDifficulty: (difficulty: QuestDifficulty) => Promise<void>;
  setTrainingFocus: (focus: 'BALANCED' | 'STRENGTH' | 'AGILITY' | 'VITALITY') => void;
  updateSettings: (settings: Partial<SystemSettings>) => void;
  completeOnboarding: (data: OnboardingData, name: string) => Promise<void>;
  rebirth: () => Promise<void>;
  playSound: (sound: SoundEffect) => void;
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

const INITIAL_SETTINGS: SystemSettings = {
  sfxEnabled: true,
  hapticEnabled: true,
  streamerMode: false
};

const DEFAULT_WELLNESS_TASKS: WellnessTask[] = [
  { id: 'well-1', title: 'Nutritional Intake (3 Clean Meals)', type: 'PSYCH', rewardXp: 10, isCompleted: false },
  { id: 'well-2', title: 'Hydration Strategy (3 Liters)', type: 'PHYSICAL', rewardXp: 5, isCompleted: false },
  { id: 'well-3', title: 'Mind Cleansing (10 Min Focus)', type: 'MENTAL', rewardXp: 5, isCompleted: false },
  { id: 'well-4', title: 'Digital Detox (No screens for 1h)', type: 'MENTAL', rewardXp: 10, isCompleted: false },
  { id: 'well-5', title: 'Postural Correction (Stretch 5m)', type: 'PHYSICAL', rewardXp: 5, isCompleted: false },
  { id: 'well-6', title: 'Deep Sleep Prep (No blue light 1h)', type: 'PSYCH', rewardXp: 15, isCompleted: false }
];

const getProgramData = (scalingFactor: number): Program[] => [
  {
    id: 'prog-phys-1',
    title: 'The Newbie Beginner Workout',
    difficulty: 'Easy',
    category: 'Physical',
    tasks: [
      { id: 'phys_1', text: `${Math.ceil(15 * scalingFactor)} Minute Steady Jogging`, type: 'agility', completed: false },
      { id: 'phys_2', text: `${Math.ceil(3)} Sets of ${Math.ceil(10 * scalingFactor)} Bodyweight Squats`, type: 'strength', completed: false },
      { id: 'phys_3', text: `${Math.ceil(3)} Sets of Maximum Push-up Reps`, type: 'strength', completed: false }
    ],
    rewards: { xp: 500, stats: { strength: 5, agility: 5, vitality: 3 }, item: 'Gate Key of Restructuring' }
  },
  {
    id: 'prog-phys-2',
    title: 'Strength Foundation Phase II',
    difficulty: 'Medium',
    category: 'Physical',
    tasks: [
      { id: 'phys_4', text: `${Math.ceil(3)} Sets of ${Math.ceil(12 * scalingFactor)} Diamond Push-ups`, type: 'strength', completed: false },
      { id: 'phys_5', text: `${Math.ceil(3)} Sets of ${Math.ceil(15 * scalingFactor)} Bulgarian Split Squats`, type: 'strength', completed: false },
      { id: 'phys_6', text: `${Math.ceil(2 * scalingFactor)} Minute Plank Hold`, type: 'vitality', completed: false }
    ],
    rewards: { xp: 600, stats: { strength: 6, vitality: 4 }, item: 'Fragment of a Giant' }
  },
  {
    id: 'prog-ment-1',
    title: 'Cognitive Expansion Phase I',
    difficulty: 'Medium',
    category: 'Mental',
    tasks: [
      { id: 'ment_1', text: '15 Minute Focused Deep Breathing Session', type: 'intelligence', completed: false },
      { id: 'ment_2', text: 'Log a clean reflective entry inside the System Ledger', type: 'sense', completed: false },
      { id: 'ment_3', text: 'Zero phone/social scrolling for the first 2 hours of daylight', type: 'intelligence', completed: false }
    ],
    rewards: { xp: 400, stats: { intelligence: 6, sense: 4 }, item: 'Chronos Pocket Watch' }
  },
  {
    id: 'prog-ment-2',
    title: 'Knowledge Absorption Path',
    difficulty: 'Hard',
    category: 'Mental',
    tasks: [
      { id: 'ment_4', text: `Read ${Math.ceil(20 * scalingFactor)} pages of a non-fiction book`, type: 'intelligence', completed: false },
      { id: 'ment_5', text: 'Solve 3 complex logic puzzles', type: 'intelligence', completed: false },
      { id: 'ment_6', text: 'Summarize today\'s learnings in the System Ledger', type: 'sense', completed: false }
    ],
    rewards: { xp: 550, stats: { intelligence: 7, sense: 3 }, item: 'Temporal Extension Elixir' }
  },
  {
    id: 'prog-psych-1',
    title: 'Iron Will Discipline Path',
    difficulty: 'Hard',
    category: 'Psychological',
    tasks: [
      { id: 'psych_1', text: 'Drink 3.5L Water', type: 'vitality', completed: false },
      { id: 'psych_2', text: 'Maintain clean eating (3 full meals, no sugars)', type: 'sense', completed: false },
      { id: 'psych_3', text: 'Lock 8 Hours of tracked sleep', type: 'vitality', completed: false }
    ],
    rewards: { xp: 600, stats: { vitality: 8, sense: 4 }, item: 'Vigor Restoration Brew' }
  },
  {
    id: 'prog-psych-2',
    title: 'Emotional Resilience Training',
    difficulty: 'Medium',
    category: 'Psychological',
    tasks: [
      { id: 'psych_4', text: 'Take a 2-minute cold shower', type: 'vitality', completed: false },
      { id: 'psych_5', text: 'Practice 10 minutes of Box Breathing', type: 'sense', completed: false },
      { id: 'psych_6', text: 'Write down 3 things you are grateful for', type: 'sense', completed: false }
    ],
    rewards: { xp: 500, stats: { vitality: 5, sense: 5 }, item: 'Vigor Restoration Brew' }
  }
];

let clickCount = 0;
let lastClickTime = 0;

export const useSystemStore = create<SystemState>((set, get) => ({
  profile: INITIAL_PROFILE,
  stats: INITIAL_STATS,
  quests: [],
  programs: [],
  inventory: [],
  logs: [],
  wellnessTasks: [],
  toasts: [],
  settings: INITIAL_SETTINGS,
  isLoading: true,
  isPenaltyActive: false,
  isInitialized: false,
  systemDirective: "The System is initializing...",
  globalDifficulty: 'MEDIUM',
  trainingFocus: 'BALANCED',
  systemLocked: false,
  cooldownTasks: {},

  initialize: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true });
    try {
      console.log('System: Initializing database...');
      const profile = await db.userProfile.get(1);
      const stats = await db.userStats.get(1);
      let quests = await db.quests.toArray();
      let inventory = await db.inventory.toArray();
      const logs = await db.systemLogs.orderBy('timestamp').reverse().toArray();
      
      // Ensure default content exists
      for (const task of DEFAULT_WELLNESS_TASKS) {
        const exists = await db.wellnessTasks.get(task.id);
        if (!exists) await db.wellnessTasks.put(task);
      }
      let wellnessTasks = await db.wellnessTasks.toArray();

      // Programs are seeded with scaling factor from profile
      const scalingFactor = profile?.onboarding?.physicalIndex || 1.0;
      const programsWithScaling = getProgramData(scalingFactor);
      
      for (const prog of programsWithScaling) {
        const exists = await db.programs.get(prog.id);
        if (!exists) await db.programs.put(prog);
      }
      let programs = await db.programs.toArray();

      // Load settings from localStorage if available
      const savedSettings = localStorage.getItem('arise_settings');
      if (savedSettings) {
        set({ settings: JSON.parse(savedSettings) });
      }

      if (profile && stats) {
        console.log('System: Profile found, loading data.');
        if (quests.length === 0) {
           await get().seedDailyQuest();
           quests = await db.quests.toArray();
        }
        if (inventory.length === 0) {
           await get().seedInventory();
           inventory = await db.inventory.toArray();
        }
        set({ profile, stats, quests, inventory, logs, wellnessTasks, programs, isLoading: false, isInitialized: true, trainingFocus: 'BALANCED' });
      } else {
        console.log('System: No profile found, performing initial setup.');
        await db.userProfile.put({ ...INITIAL_PROFILE, id: 1 });
        await db.userStats.put({ ...INITIAL_STATS, id: 1 });
        set({ profile: INITIAL_PROFILE, stats: INITIAL_STATS, quests: [], inventory: [], logs: [], wellnessTasks, programs: [], isLoading: false, isInitialized: true, trainingFocus: 'BALANCED' });
      }
      get().checkPenalty();
      get().fetchSystemDirective();
    } catch (error) {
      console.error('System: Failed to initialize:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  playSound: (sound: SoundEffect) => {
    playSystemSFX(sound, get().settings.sfxEnabled);
  },

  fetchSystemDirective: async () => {
    const { profile, stats, quests } = get();
    const response = await generateSystemDirective(profile, stats, quests);
    set({ systemDirective: response.directive });
  },

  seedDailyQuest: async () => {
    const { globalDifficulty, profile } = get();
    const scalar = globalDifficulty === 'BOSS' ? 3 : globalDifficulty === 'HARD' ? 1.5 : globalDifficulty === 'MEDIUM' ? 1 : 0.5;
    const physicalIndex = profile.onboarding?.physicalIndex || 1.0;
    
    const combinedScale = scalar * physicalIndex;

    const titles = [
        'Preparation for Building Power',
        'Morning Routine of the Awakened',
        'Structural Reinforcement Protocol',
        'Foundation of the Monarch',
        'Shadow Hunter Conditioning',
        'Legacy of the Great King',
        'Uprising: Leveling the Playing Field'
    ];

    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    const dailyQuest: Quest = {
      id: `daily-${new Date().getTime()}`,
      title: randomTitle,
      description: 'The road to strength is paved with consistency.',
      type: 'DAILY',
      taskType: 'BALANCED',
      rank: 'E-Rank',
      difficulty: globalDifficulty,
      objectives: [
        { id: 'obj-1', task: 'Push-Ups', current: 0, target: Math.ceil(100 * combinedScale) },
        { id: 'obj-2', task: 'Sit-Ups', current: 0, target: Math.ceil(100 * combinedScale) },
        { id: 'obj-3', task: 'Squats', current: 0, target: Math.ceil(100 * combinedScale) },
        { id: 'obj-4', task: 'Running', current: 0, target: Math.ceil(10 * combinedScale), unit: 'km' }
      ],
      rewards: {
        xp: Math.ceil(100 * scalar),
        attributePoints: globalDifficulty === 'BOSS' ? 10 : Math.ceil(3 * scalar)
      },
      expiresAt: new Date(new Date().setHours(new Date().getHours() + 24))
    };
    await db.quests.put(dailyQuest);
    const quests = await db.quests.toArray();
    set({ quests });
  },

  seedInventory: async () => {
    const initialItems: InventoryItem[] = [
      {
        id: 'item_potion_time_01',
        name: 'Temporal Extension Elixir',
        rarity: 'RARE',
        description: 'Bends the flow of time. Consuming this item extends an active mission window by 30 minutes.',
        isConsumable: true,
        quantity: 2
      },
      {
        id: 'item_strength_shard_01',
        name: 'Fragment of a Giant',
        rarity: 'UNCOMMON',
        description: 'A glowing shard that resonates with raw power. Permanently increases STR by 1 when consumed.',
        isConsumable: true,
        attributeBoost: { strength: 1 },
        quantity: 1
      }
    ];
    await db.inventory.bulkPut(initialItems);
    const inventory = await db.inventory.toArray();
    set({ inventory });
  },

  seedPrograms: async () => {
    const { profile } = get();
    const scalingFactor = profile.onboarding?.physicalIndex || 1.0;
    const programsWithScaling = getProgramData(scalingFactor);
    await db.programs.clear();
    await db.programs.bulkPut(programsWithScaling);
    const programs = await db.programs.toArray();
    set({ programs });
  },

  completeOnboarding: async (data: OnboardingData, name: string) => {
    const profile: UserProfile = {
      ...INITIAL_PROFILE,
      name,
      onboarding: data
    };
    await db.userProfile.put({ ...profile, id: 1 });
    set({ profile });
    await get().seedDailyQuest();
    await get().seedInventory();
    await get().seedPrograms();
    await get().addLog('SYSTEM_EVENT', `Onboarding Complete: Physical Matrix Calibrated for ${name}.`);
    get().addToast({ type: 'SUCCESS', title: 'System Awakening', message: `Welcome, Hunter ${name}. Matrices calibrated.` });
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

  addToast: (toast) => {
    const id = crypto.randomUUID();
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => get().removeToast(id), 5000);
  },

  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
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
    get().addToast({ type: 'SUCCESS', title: 'Item Acquired', message: `${item.name} added to inventory.` });
  },

  useItem: async (itemId) => {
    const item = await db.inventory.get(itemId);
    if (!item || item.quantity <= 0) return;

    if (item.isConsumable) {
       get().playSound('sfx_ui_click.mp3');
       
       // Specialized logic for timer extension potions
       if (item.id.includes('potion_time') || item.id.includes('chronos')) {
        const { quests } = get();
        const activeDaily = quests.find(q => q.type === 'DAILY' && !q.completedAt);
        if (activeDaily && activeDaily.expiresAt) {
          const newExpiry = new Date(activeDaily.expiresAt.getTime() + (30 * 60000)); // +30 mins
          const updatedQuest = { ...activeDaily, expiresAt: newExpiry };
          await db.quests.put(updatedQuest);
          set({ quests: quests.map(q => q.id === activeDaily.id ? updatedQuest : q) });
          await get().addLog('SYSTEM_EVENT', `Used ${item.name}: Mission window expanded by 30m.`);
          get().addToast({ type: 'INFO', title: 'Time Dilated', message: 'Mission window expanded by 30 minutes.' });
        } else {
          return; // Don't consume if no active daily
        }
      }

      // Gate Key of Restructuring: Rerolls daily quests
      if (item.id.includes('gate_key_refresh') || item.id.includes('Gate Key')) {
        await db.quests.clear();
        await get().seedDailyQuest();
        await get().addLog('SYSTEM_EVENT', `Used ${item.name}: Active missions restructured.`);
        get().addToast({ type: 'INFO', title: 'Reality Shift', message: 'Active missions have been restructured.' });
        await get().fetchSystemDirective();
      }

      // Vigor Restoration Brew: Resets failed tasks (if penalty wasn't triggered yet)
      if (item.id.includes('vigor_potion') || item.id.includes('Vigor Restoration')) {
        const { quests } = get();
        const activeDaily = quests.find(q => q.type === 'DAILY' && !q.completedAt);
        if (activeDaily) {
            if (get().isPenaltyActive) {
                set({ isPenaltyActive: false });
                const newExpiry = new Date(new Date().setHours(new Date().getHours() + 2));
                const updatedQuest = { ...activeDaily, expiresAt: newExpiry };
                await db.quests.put(updatedQuest);
                set({ quests: quests.map(q => q.id === activeDaily.id ? updatedQuest : q) });
                await get().addLog('ACHIEVEMENT', `Used ${item.name}: Penalty Zone bypassed. 2h extension granted.`);
                get().addToast({ type: 'SUCCESS', title: 'Vitality Surge', message: 'Penalty bypassed. 2h extension granted.' });
            } else {
                await get().addLog('SYSTEM_EVENT', `Used ${item.name}: Vitality surged.`);
                get().addToast({ type: 'INFO', title: 'Vitality Surge', message: 'Core energy restored.' });
            }
        }
      }

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
        get().addToast({ 
            type: 'LEVEL_UP', 
            title: 'Attribute Enhanced', 
            message: `Consumed ${item.name}.`,
            stats: item.attributeBoost
        });
      }

      const inventory = await db.inventory.toArray();
      set({ inventory });
      await get().addLog('SYSTEM_EVENT', `Consumed Item: ${item.name}`);
    }
  },

  addXp: async (amount: number, silent: boolean = false) => {
    const { profile } = get();
    let newXp = profile.xp + amount;
    let newLevel = profile.level;
    let newAttributePoints = profile.attributePoints;
    let leveledUp = false;

    // Handle potential negative XP (undo)
    if (newXp < 0) {
        if (newLevel > 1) {
            newLevel--;
            newXp = calculateRequiredXp(newLevel) + newXp;
            newAttributePoints = Math.max(0, newAttributePoints - 3);
        } else {
            newXp = 0;
        }
    }

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
    
    if (leveledUp && !silent) {
      get().playSound('sfx_level_up.mp3');
      await get().addLog('ACHIEVEMENT', `Level Up! Reached Level ${newLevel}. +3 Attribute Points awarded.`, { levelUp: newLevel });
      get().addToast({ type: 'LEVEL_UP', title: 'Rank Progression', message: `Leveled up to ${newLevel}!`, stats: { xp: amount, attributePoints: 3 } });
      get().fetchSystemDirective();
    }
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
    const { quests, stats, systemLocked } = get();
    if (systemLocked) return;

    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.completedAt) return;

    const allObjectivesMet = quest.objectives.every(obj => obj.current >= obj.target);
    if (!allObjectivesMet) return;

    get().playSound('sfx_quest_complete.mp3');
    const updatedQuest = { ...quest, completedAt: new Date() };
    await db.quests.put(updatedQuest);
    
    await get().addLog('QUEST_LOG', `Quest Cleared: ${quest.title}`);
    
    // Automated Attribute Allocation
    const difficultyScalar = quest.difficulty === 'BOSS' ? 3 : quest.difficulty === 'HARD' ? 1.5 : quest.difficulty === 'MEDIUM' ? 1 : 0.5;
    const baseGain = Math.ceil(1 * difficultyScalar);
    
    let updatedStats = { ...stats };
    let gains: Partial<UserStats> = {};

    if (quest.taskType === 'AGI_FOCUS') {
      gains.agility = Math.ceil(baseGain * 0.7);
      gains.vitality = Math.ceil(baseGain * 0.3);
    } else if (quest.taskType === 'STR_FOCUS') {
      gains.strength = Math.ceil(baseGain * 0.7);
      gains.vitality = Math.ceil(baseGain * 0.3);
    } else if (quest.taskType === 'INT_FOCUS') {
      gains.intelligence = Math.ceil(baseGain * 0.7);
      gains.sense = Math.ceil(baseGain * 0.3);
    } else if (quest.taskType === 'VIT_FOCUS') {
      gains.vitality = Math.ceil(baseGain * 0.7);
      gains.intelligence = Math.ceil(baseGain * 0.3);
    } else {
        // Balanced
        gains.strength = Math.ceil(baseGain * 0.2);
        gains.agility = Math.ceil(baseGain * 0.2);
        gains.vitality = Math.ceil(baseGain * 0.2);
        gains.intelligence = Math.ceil(baseGain * 0.2);
        gains.sense = Math.ceil(baseGain * 0.2);
    }

    Object.entries(gains).forEach(([k, v]) => {
        updatedStats[k as keyof UserStats] += v;
    });

    await db.userStats.update(1, updatedStats);
    set({ stats: updatedStats });

    // Add rewards
    await get().addXp(quest.rewards.xp);
    if (quest.rewards.attributePoints) {
       const { profile } = get();
       const updatedProfile = { ...profile, attributePoints: profile.attributePoints + quest.rewards.attributePoints };
       await db.userProfile.update(1, updatedProfile);
       set({ profile: updatedProfile });
    }

    get().addToast({ 
        type: 'SUCCESS', 
        title: 'Mission Cleared', 
        message: `"${quest.title}" synchronization complete.`,
        stats: { ...gains, xp: quest.rewards.xp, attributePoints: quest.rewards.attributePoints }
    });

    set({ quests: quests.map(q => q.id === questId ? updatedQuest : q) });
    
    // CRITICAL MISSION LOOP: Seed new quest if DAILY
    if (quest.type === 'DAILY') {
        setTimeout(async () => {
            await get().seedDailyQuest();
            get().addToast({ type: 'INFO', title: 'New Mission Ready', message: 'A secondary mission set has been initialized.' });
        }, 1000);
    }

    get().checkPenalty();
    get().fetchSystemDirective();
  },

  undoQuestCompletion: async (questId: string) => {
    const { quests } = get();
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.completedAt) return;

    // 5 minute grace window
    const now = new Date();
    const completionTime = new Date(quest.completedAt);
    if (now.getTime() - completionTime.getTime() > 5 * 60000) {
        console.warn('System: Undo window closed for this quest.');
        return;
    }

    const updatedQuest = { ...quest, completedAt: undefined };
    await db.quests.put(updatedQuest);
    
    // Deduct XP (silent to avoid level up sound)
    await get().addXp(-quest.rewards.xp, true);
    
    if (quest.rewards.attributePoints) {
        const { profile } = get();
        const updatedProfile = { ...profile, attributePoints: Math.max(0, profile.attributePoints - quest.rewards.attributePoints) };
        await db.userProfile.update(1, updatedProfile);
        set({ profile: updatedProfile });
    }

    set({ quests: quests.map(q => q.id === questId ? updatedQuest : q) });
    await get().addLog('SYSTEM_EVENT', `Undo Action: Quest "${quest.title}" restored to active state.`);
    get().addToast({ type: 'WARNING', title: 'Sync Rolled Back', message: `Mission "${quest.title}" restored to active status.` });
  },

  checkPenalty: () => {
    const { quests } = get();
    const dailyQuest = quests.find(q => q.type === 'DAILY');
    if (dailyQuest && !dailyQuest.completedAt && dailyQuest.expiresAt) {
      const now = new Date();
      if (now > dailyQuest.expiresAt) {
        if (!get().isPenaltyActive) {
          get().playSound('sfx_warning_alert.mp3');
          get().addLog('PENALTY', 'The Daily Quest was not completed. Penalty Zone activated.');
          get().addToast({ type: 'ERROR', title: 'Penalty Incurred', message: 'Mission failed. Core matrix corrupted.' });
        }
        set({ isPenaltyActive: true });
      } else {
        set({ isPenaltyActive: false });
      }
    } else {
      set({ isPenaltyActive: false });
    }
  },

  completeWellnessTask: async (taskId: string) => {
    const { wellnessTasks, stats, systemLocked, cooldownTasks } = get();
    
    if (systemLocked) return;
    
    // ANTI-SPAM velocity loop (Harder threshold)
    const now = Date.now();
    const timeDelta = now - lastClickTime;
    if (timeDelta < 1500) {
      clickCount += 1;
    } else {
      clickCount = 1;
    }
    lastClickTime = now;

    if (clickCount > 2) {
      set({ systemLocked: true });
      get().playSound('sfx_warning_alert.mp3');
      get().addLog('PENALTY', 'Anomalous interaction pattern detected. Core matrix sync suspended temporarily.');
      get().addToast({ type: 'ERROR', title: 'Sync Suspended', message: 'Spam detected. System locked for 20 seconds.' });
      setTimeout(() => {
        set({ systemLocked: false });
        clickCount = 0;
      }, 20000);
      return;
    }

    if (cooldownTasks[taskId]) return;

    const task = wellnessTasks.find(t => t.id === taskId);
    if (!task || task.isCompleted) return;

    // Cooldown Buffer
    set(state => ({ cooldownTasks: { ...state.cooldownTasks, [taskId]: true } }));
    setTimeout(() => {
      set(state => ({ cooldownTasks: { ...state.cooldownTasks, [taskId]: false } }));
    }, 10000);

    get().playSound('sfx_quest_complete.mp3');
    const updatedTasks = wellnessTasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: true, completedAt: new Date() } : t
    );
    
    await db.wellnessTasks.update(taskId, { isCompleted: true, completedAt: new Date() });
    set({ wellnessTasks: updatedTasks });
    
    // Automated Stat Gains for Wellness
    let updatedStats = { ...stats };
    let gain: Partial<UserStats> = {};
    if (task.type === 'PHYSICAL') gain.vitality = 1;
    if (task.type === 'MENTAL') gain.intelligence = 1;
    if (task.type === 'PSYCH') gain.sense = 1;

    Object.entries(gain).forEach(([k, v]) => {
        updatedStats[k as keyof UserStats] += v;
    });

    await db.userStats.update(1, updatedStats);
    set({ stats: updatedStats });

    await get().addXp(task.rewardXp);
    await get().addLog('SYSTEM_EVENT', `Objective Met: ${task.title}. Attributes adjusted.`);
    get().addToast({ 
        type: 'SUCCESS', 
        title: 'Task Synchronized', 
        message: task.title,
        stats: { ...gain, xp: task.rewardXp }
    });
  },

  undoWellnessTask: async (taskId: string) => {
    const { wellnessTasks, stats, systemLocked, cooldownTasks } = get();
    
    if (systemLocked) return;

    if (cooldownTasks[taskId]) return;

    const task = wellnessTasks.find(t => t.id === taskId);
    if (!task || !task.isCompleted || !task.completedAt) return;

    const now = new Date();
    if (now.getTime() - new Date(task.completedAt).getTime() > 5 * 60000) return;

    // Cooldown Buffer
    set(state => ({ cooldownTasks: { ...state.cooldownTasks, [taskId]: true } }));
    setTimeout(() => {
      set(state => ({ cooldownTasks: { ...state.cooldownTasks, [taskId]: false } }));
    }, 10000);

    const updatedTasks = wellnessTasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: false, completedAt: undefined } : t
    );
    
    await db.wellnessTasks.update(taskId, { isCompleted: false, completedAt: undefined });
    set({ wellnessTasks: updatedTasks });
    
    // Deduct Stats
    let updatedStats = { ...stats };
    let loss: Partial<UserStats> = {};
    if (task.type === 'PHYSICAL') loss.vitality = -1;
    if (task.type === 'MENTAL') loss.intelligence = -1;
    if (task.type === 'PSYCH') loss.sense = -1;

    Object.entries(loss).forEach(([k, v]) => {
        updatedStats[k as keyof UserStats] = Math.max(10, updatedStats[k as keyof UserStats] + v);
    });

    await db.userStats.update(1, updatedStats);
    set({ stats: updatedStats });

    await get().addXp(-task.rewardXp, true);
    await get().addLog('SYSTEM_EVENT', `Undo Action: Objective "${task.title}" restored.`);
    get().addToast({ type: 'WARNING', title: 'Task Reversed', message: `Objective "${task.title}" reverted.` });
  },

  toggleProgramTask: async (programId: string, taskId: string) => {
    const { programs, systemLocked, cooldownTasks, stats } = get();
    
    if (systemLocked) return;
    
    // Anti-Spam Velocity Loop
    const now = Date.now();
    const timeDelta = now - lastClickTime;
    if (timeDelta < 1500) {
      clickCount += 1;
    } else {
      clickCount = 1;
    }
    lastClickTime = now;

    if (clickCount > 2) {
      set({ systemLocked: true });
      get().playSound('sfx_warning_alert.mp3');
      get().addLog('PENALTY', 'Anomalous interaction pattern detected. Core matrix sync suspended temporarily.');
      get().addToast({ type: 'ERROR', title: 'System Lockdown', message: 'Anomalous interaction detected. Sync suspended for 20s.' });
      setTimeout(() => {
        set({ systemLocked: false });
        clickCount = 0;
      }, 20000);
      return;
    }

    if (cooldownTasks[taskId]) return;

    // Cooldown Buffer
    set(state => ({ cooldownTasks: { ...state.cooldownTasks, [taskId]: true } }));
    setTimeout(() => {
      set(state => ({ cooldownTasks: { ...state.cooldownTasks, [taskId]: false } }));
    }, 10000);

    const program = programs.find(p => p.id === programId);
    if (!program) return;

    const task = program.tasks.find(t => t.id === taskId);
    if (!task) return;

    const isChecking = !task.completed;
    
    const updatedPrograms = programs.map(p => {
      if (p.id === programId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, completed: isChecking, completedAt: isChecking ? new Date() : undefined } : t)
        };
      }
      return p;
    });

    await db.programs.put(updatedPrograms.find(p => p.id === programId)!);
    set({ programs: updatedPrograms });

    let updatedStats = { ...stats };
    let gain: Partial<UserStats> = {};
    if (isChecking) {
      get().playSound('sfx_ui_click.mp3');
      gain[task.type] = 1;
      updatedStats[task.type] += 1;
      await get().addXp(15);
      
      get().addToast({ type: 'SUCCESS', title: 'Program Objective', message: `Syncing ${task.text}...`, stats: { ...gain, xp: 15 } });

      // Random item drop
      if (Math.random() > 0.8) {
          await get().addItem({
            id: 'item_vigor_potion',
            name: 'Vigor Restoration Brew',
            rarity: 'COMMON',
            description: 'A bitter brew that restores physical energy.',
            isConsumable: true,
          }, 1);
      }
    } else {
      // Undo Protocol
      gain[task.type] = -1;
      updatedStats[task.type] = Math.max(10, updatedStats[task.type] - 1);
      await get().addXp(-15, true);
      get().addToast({ type: 'WARNING', title: 'Objective Reverted', message: 'Attribute gain rolled back.' });
    }

    await db.userStats.update(1, updatedStats);
    set({ stats: updatedStats });
  },

  claimProgramRewards: async (programId: string) => {
    const { programs, stats, systemLocked } = get();
    if (systemLocked) return;

    const program = programs.find(p => p.id === programId);
    if (!program || program.isClaimed) return;

    const allDone = program.tasks.every(t => t.completed);
    if (!allDone) return;

    get().playSound('sfx_quest_complete.mp3');
    
    let updatedStats = { ...stats };
    Object.entries(program.rewards.stats).forEach(([stat, val]) => {
      const key = stat as keyof UserStats;
      updatedStats[key] += (val || 0);
    });

    await db.userStats.update(1, updatedStats);
    await get().addXp(program.rewards.xp);
    
    // Add Item
    const itemRarity: any = program.rewards.item.includes('Key') ? 'RARE' : program.rewards.item.includes('Chronos') ? 'EPIC' : 'UNCOMMON';
    await get().addItem({
        id: `item_${program.rewards.item.toLowerCase().replace(/ /g, '_')}`,
        name: program.rewards.item,
        rarity: itemRarity,
        description: `A powerful reward from completing ${program.title}.`,
        isConsumable: true
    }, 1);

    const updatedProgram = { ...program, isClaimed: true };
    await db.programs.put(updatedProgram);
    
    // Reset tasks for the program as per blueprint
    const resetProgram = {
        ...updatedProgram,
        tasks: updatedProgram.tasks.map(t => ({ ...t, completed: false })),
        isClaimed: false 
    };
    await db.programs.put(resetProgram);

    set(state => ({
        stats: updatedStats,
        programs: state.programs.map(p => p.id === programId ? resetProgram : p)
    }));

    await get().addLog('ACHIEVEMENT', `Program Complete: ${program.title}. Major rewards claimed.`);
    get().addToast({ 
        type: 'SUCCESS', 
        title: 'Campaign Completed', 
        message: `${program.title} payload claimed.`,
        stats: { ...program.rewards.stats, xp: program.rewards.xp }
    });
  },

  setDifficulty: async (difficulty: QuestDifficulty) => {
    if (get().globalDifficulty === difficulty) return;

    get().playSound('sfx_warning_alert.mp3');
    
    // Penalty: Flush active quests
    await db.quests.clear();
    set({ globalDifficulty: difficulty, quests: [] });
    
    await get().addLog('PENALTY', `System difficulty re-scaled to ${difficulty}. Active instances terminated.`);
    get().addToast({ type: 'WARNING', title: 'System Calibrated', message: `Difficulty adjusted to ${difficulty}.` });
    await get().seedDailyQuest();
    await get().fetchSystemDirective();
  },

  setTrainingFocus: (focus: 'BALANCED' | 'STRENGTH' | 'AGILITY' | 'VITALITY') => {
    get().playSound('sfx_ui_click.mp3');
    set({ trainingFocus: focus });
    get().addLog('SYSTEM_EVENT', `Training focus shifted to: ${focus}`);
    get().addToast({ type: 'INFO', title: 'Focus Shifted', message: `Primary matrix set to ${focus}.` });
  },

  updateSettings: (newSettings: Partial<SystemSettings>) => {
    const updatedSettings = { ...get().settings, ...newSettings };
    set({ settings: updatedSettings });
    localStorage.setItem('arise_settings', JSON.stringify(updatedSettings));
    get().playSound('sfx_ui_click.mp3');
    get().addToast({ type: 'INFO', title: 'System Configuration', message: 'Internal settings updated.' });
  },

  rebirth: async () => {
    get().playSound('sfx_rebirth_sequence.mp3');
    
    // Wipe everything except logs
    await db.userProfile.put({ ...INITIAL_PROFILE, id: 1 });
    await db.userStats.put({ ...INITIAL_STATS, id: 1 });
    await db.quests.clear();
    await db.inventory.clear();
    await db.wellnessTasks.clear();
    await db.wellnessTasks.bulkPut(DEFAULT_WELLNESS_TASKS);
    await db.programs.clear();

    const profile = INITIAL_PROFILE;
    const stats = INITIAL_STATS;
    const wellnessTasks = await db.wellnessTasks.toArray();
    
    set({ 
        profile, 
        stats, 
        quests: [], 
        inventory: [], 
        wellnessTasks,
        programs: [],
        isPenaltyActive: false,
        globalDifficulty: 'MEDIUM',
        trainingFocus: 'BALANCED'
    });

    await get().addLog('ACHIEVEMENT', 'REBIRTH SEQUENCE COMPLETE. Physical matrix returned to baseline.');
    get().addToast({ type: 'SUCCESS', title: 'System Rebirth', message: 'Physical matrix returned to baseline.' });
    await get().fetchSystemDirective();
  }
}));
