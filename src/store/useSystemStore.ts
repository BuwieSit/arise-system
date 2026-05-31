import { create } from 'zustand';
import type { UserProfile, UserStats, Quest, WellnessTask, QuestDifficulty, SystemSettings, Program, OnboardingData } from '../types';
import type { InventoryItem, SystemLog, SystemToast } from '../types/features';
import { db } from '../db/database';
import { supabase } from '../lib/supabase';
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
  session: any | null;
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
  syncWithCloud: () => Promise<void>;
  signOut: () => Promise<void>;
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
  id: '',
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
      { id: 'phys_2', text: `3 Sets of ${Math.ceil(10 * scalingFactor)} Bodyweight Squats`, type: 'strength', completed: false },
      { id: 'phys_3', text: `3 Sets of Maximum Push-up Reps`, type: 'strength', completed: false }
    ],
    rewards: { xp: 500, stats: { strength: 5, agility: 5, vitality: 3 }, item: 'Gate Key of Restructuring' }
  },
  {
    id: 'prog-phys-2',
    title: 'Strength Foundation Phase II',
    difficulty: 'Medium',
    category: 'Physical',
    tasks: [
      { id: 'phys_4', text: `3 Sets of ${Math.ceil(12 * scalingFactor)} Diamond Push-ups`, type: 'strength', completed: false },
      { id: 'phys_5', text: `3 Sets of ${Math.ceil(15 * scalingFactor)} Bulgarian Split Squats`, type: 'strength', completed: false },
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
  session: null,
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
    supabase.auth.onAuthStateChange((_event, session) => { set({ session, isInitialized: true }); });
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, isInitialized: true });
  },

  syncWithCloud: async () => {
    const { session } = get();
    if (!session) {
      let profile = await db.userProfile.get('local');
      let stats = await db.userStats.get('local');
      let quests = await db.quests.toArray();
      let inventory = await db.inventory.toArray();
      let logs = await db.systemLogs.orderBy('timestamp').reverse().toArray();
      let wellness = await db.wellnessTasks.toArray();
      let programs = await db.programs.toArray();

      if (wellness.length === 0) { await db.wellnessTasks.bulkPut(DEFAULT_WELLNESS_TASKS); wellness = await db.wellnessTasks.toArray(); }
      set({ profile: profile || INITIAL_PROFILE, stats: (stats as any) || INITIAL_STATS, quests, inventory, logs, wellnessTasks: wellness, programs, isLoading: false });
      return;
    }

    try {
      const { data: pData } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', session.user.id).maybeSingle();

      if (pData && stats) {
        const profile: UserProfile = { ...pData, attributePoints: (pData as any).attribute_points };
        const { data: qData } = await supabase.from('quests').select('*').eq('user_id', session.user.id);
        const { data: iData } = await supabase.from('inventory').select('*').eq('user_id', session.user.id);
        const { data: logs } = await supabase.from('system_logs').select('*').eq('user_id', session.user.id).order('timestamp', { ascending: false });
        const { data: wData } = await supabase.from('wellness_tasks').select('*').eq('user_id', session.user.id);
        const { data: programs } = await supabase.from('programs').select('*').eq('user_id', session.user.id);

        set({ 
          profile, 
          stats, 
          quests: (qData || []).map((q: any) => ({ ...q, taskType: q.task_type, expiresAt: q.expires_at ? new Date(q.expires_at) : undefined, completedAt: q.completed_at ? new Date(q.completed_at) : undefined, isPenalty: q.is_penalty })), 
          inventory: iData || [], 
          logs: logs || [], 
          wellnessTasks: (wData && wData.length > 0) ? wData.map((w: any) => ({ ...w, rewardXp: w.reward_xp, isCompleted: w.is_completed, completedAt: w.completed_at ? new Date(w.completed_at) : undefined })) : DEFAULT_WELLNESS_TASKS, 
          programs: (programs || []).map((p: any) => ({ ...p, isClaimed: p.is_claimed })), 
          isLoading: false 
        });
        get().checkPenalty();
        get().fetchSystemDirective();
      } else {
        set({ profile: { ...INITIAL_PROFILE, id: session.user.id }, stats: INITIAL_STATS, isLoading: false });
      }
    } catch (error) { console.error('Cloud Sync Failed:', error); set({ isLoading: false }); }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: INITIAL_PROFILE, stats: INITIAL_STATS, quests: [], inventory: [], logs: [], wellnessTasks: [], programs: [] });
  },

  playSound: (sound: SoundEffect) => { playSystemSFX(sound, get().settings.sfxEnabled); },

  fetchSystemDirective: async () => {
    const { profile, stats, quests } = get();
    const response = await generateSystemDirective(profile, stats, quests);
    set({ systemDirective: response.directive });
  },

  seedDailyQuest: async () => {
    const { globalDifficulty, profile, session } = get();
    const scalar = globalDifficulty === 'BOSS' ? 3 : globalDifficulty === 'HARD' ? 1.5 : globalDifficulty === 'MEDIUM' ? 1 : 0.5;
    const physicalIndex = profile.onboarding?.physicalIndex || 1.0;
    const combinedScale = scalar * physicalIndex;

    const titles = ['Prep for Building Power', 'Shadow Hunter Conditioning', 'Legacy of the Great King', 'Uprising: Leveling the Field'];
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
      rewards: { xp: Math.ceil(100 * scalar), attributePoints: globalDifficulty === 'BOSS' ? 10 : Math.ceil(3 * scalar) },
      expiresAt: new Date(new Date().setHours(new Date().getHours() + 24))
    };

    if (session) {
      await supabase.from('quests').insert({ 
          ...dailyQuest, 
          user_id: session.user.id,
          task_type: dailyQuest.taskType,
          expires_at: dailyQuest.expiresAt,
          completed_at: dailyQuest.completedAt
      });
    } else { await db.quests.put(dailyQuest); }
    
    set(state => ({ quests: [...state.quests, dailyQuest] }));
  },

  seedInventory: async () => {
    const initialItems: InventoryItem[] = [
      { id: 'item_potion_time_01', name: 'Temporal Extension Elixir', rarity: 'RARE', description: 'Extends mission window by 30m.', isConsumable: true, quantity: 2 },
      { id: 'item_strength_shard_01', name: 'Fragment of a Giant', rarity: 'UNCOMMON', description: 'Permanently increases STR by 1.', isConsumable: true, attributeBoost: { strength: 1 }, quantity: 1 }
    ];
    
    const { session } = get();
    if (session) { await supabase.from('inventory').insert(initialItems.map(i => ({ ...i, user_id: session.user.id }))); }
    else { await db.inventory.bulkPut(initialItems); }
    
    const inventory = session ? (await supabase.from('inventory').select('*').eq('user_id', session.user.id)).data : await db.inventory.toArray();
    set({ inventory: inventory || [] });
  },

  seedPrograms: async () => {
    const { profile, session } = get();
    const scalingFactor = profile.onboarding?.physicalIndex || 1.0;
    const programsWithScaling = getProgramData(scalingFactor);

    if (session) {
        await supabase.from('programs').delete().eq('user_id', session.user.id);
        await supabase.from('programs').insert(programsWithScaling.map(p => ({ ...p, user_id: session.user.id, is_claimed: p.isClaimed })));
    } else {
        await db.programs.clear();
        await db.programs.bulkPut(programsWithScaling);
    }
    
    const programs = session ? (await supabase.from('programs').select('*').eq('user_id', session.user.id)).data : await db.programs.toArray();
    set({ programs: programs || [] });
  },

  completeOnboarding: async (data: OnboardingData, name: string) => {
    const { session } = get();
    const profile: any = { id: session?.user.id || '', name, title: 'Newbie Hunter', level: 1, xp: 0, rank: 'E-Rank', attribute_points: 0, onboarding: data };

    if (session) {
      await supabase.from('profiles').upsert(profile);
      await supabase.from('user_stats').upsert({ user_id: session.user.id, strength: 10, agility: 10, vitality: 10, intelligence: 10, sense: 10 });
    } else {
      await (db.userProfile as any).put({ ...profile, id: 'local', attributePoints: profile.attribute_points });
      await (db.userStats as any).put({ ...INITIAL_STATS, id: 'local' });
    }

    set({ profile: { ...INITIAL_PROFILE, ...profile, attributePoints: profile.attribute_points } });
    await get().seedDailyQuest();
    await get().seedInventory();
    await get().seedPrograms();
    get().addToast({ type: 'SUCCESS', title: 'System Awakening', message: `Welcome, Hunter ${name}.` });
  },

  addLog: async (category, message, metadata) => {
    const { session } = get();
    const newLog: any = { category, message, metadata, timestamp: new Date() };
    if (session) { await supabase.from('system_logs').insert({ ...newLog, user_id: session.user.id }); }
    else { newLog.id = crypto.randomUUID(); await db.systemLogs.put(newLog); }
    set(state => ({ logs: [{ ...newLog, id: newLog.id || crypto.randomUUID() }, ...state.logs].slice(0, 100) }));
  },

  addToast: (toast) => {
    const id = crypto.randomUUID();
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => get().removeToast(id), 5000);
  },

  removeToast: (id) => { set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })); },

  addItem: async (item, quantity) => {
    const { session, inventory } = get();
    const existing = inventory.find(i => i.id === item.id);
    const updatedItem = existing ? { ...existing, quantity: existing.quantity + quantity } : { ...item, quantity };
    if (session) { await supabase.from('inventory').upsert({ ...updatedItem, user_id: session.user.id }); }
    else { await db.inventory.put(updatedItem); }
    set(state => ({ inventory: state.inventory.map(i => i.id === item.id ? updatedItem : i).concat(existing ? [] : [updatedItem]) }));
    get().addToast({ type: 'SUCCESS', title: 'Item Acquired', message: item.name });
  },

  useItem: async (itemId) => {
    const { session, inventory, stats, quests } = get();
    const item = inventory.find(i => i.id === itemId);
    if (!item || item.quantity <= 0) return;

    if (item.isConsumable) {
       get().playSound('sfx_ui_click.mp3');
       if (item.id.includes('potion_time') || item.id.includes('chronos')) {
        const activeDaily = quests.find(q => q.type === 'DAILY' && !q.completedAt);
        if (activeDaily && activeDaily.expiresAt) {
          const newExpiry = new Date(activeDaily.expiresAt.getTime() + (30 * 60000));
          if (session) await supabase.from('quests').update({ expires_at: newExpiry }).eq('id', activeDaily.id);
          else await db.quests.update(activeDaily.id, { expiresAt: newExpiry });
          set(state => ({ quests: state.quests.map(q => q.id === activeDaily.id ? { ...q, expiresAt: newExpiry } : q) }));
        } else return;
      }

      const updatedQty = item.quantity - 1;
      if (session) {
        if (updatedQty > 0) await supabase.from('inventory').update({ quantity: updatedQty }).match({ id: itemId, user_id: session.user.id });
        else await supabase.from('inventory').delete().match({ id: itemId, user_id: session.user.id });
      } else {
        if (updatedQty > 0) await db.inventory.update(itemId, { quantity: updatedQty });
        else await db.inventory.delete(itemId);
      }
      
      if (item.attributeBoost) {
        const updatedStats = { strength: stats.strength + (item.attributeBoost.strength || 0), agility: stats.agility + (item.attributeBoost.agility || 0), vitality: stats.vitality + (item.attributeBoost.vitality || 0), intelligence: stats.intelligence + (item.attributeBoost.intelligence || 0), sense: stats.sense + (item.attributeBoost.sense || 0) };
        if (session) await supabase.from('user_stats').update(updatedStats).eq('user_id', session.user.id);
        else await db.userStats.update(1, updatedStats);
        set({ stats: updatedStats });
      }
      set(state => ({ inventory: updatedQty > 0 ? state.inventory.map(i => i.id === itemId ? { ...i, quantity: updatedQty } : i) : state.inventory.filter(i => i.id !== itemId) }));
    }
  },

  addXp: async (amount, silent = false) => {
    const { profile, session } = get();
    let newXp = profile.xp + amount;
    let newLevel = profile.level;
    let newAttributePoints = profile.attributePoints;
    let leveledUp = false;

    while (newXp >= calculateRequiredXp(newLevel)) { newXp -= calculateRequiredXp(newLevel); newLevel++; newAttributePoints += 3; leveledUp = true; }
    const newRank = getRankFromLevel(newLevel);
    const updatedProfile = { ...profile, xp: newXp, level: newLevel, rank: newRank, title: getRankTitle(newRank), attributePoints: newAttributePoints };

    if (session) {
        await supabase.from('profiles').update({ xp: newXp, level: newLevel, rank: newRank, title: updatedProfile.title, attribute_points: newAttributePoints }).eq('id', session.user.id);
    } else { await (db.userProfile as any).update('local', updatedProfile); }
    
    set({ profile: updatedProfile });
    if (leveledUp && !silent) { get().playSound('sfx_level_up.mp3'); get().addToast({ type: 'LEVEL_UP', title: 'Rank Progression', message: `Leveled up to ${newLevel}!`, stats: { xp: amount, attributePoints: 3 } }); }
  },

  updateQuestProgress: async (questId, objectiveId, amount) => {
    const { quests, session, systemLocked } = get();
    if (systemLocked) return;
    const now = Date.now();
    if (now - lastClickTime < 800) clickCount++; else clickCount = 1;
    lastClickTime = now;
    if (clickCount > 5) {
      set({ systemLocked: true }); get().playSound('sfx_warning_alert.mp3');
      setTimeout(() => set({ systemLocked: false, clickCount: 0 } as any), 20000);
      return;
    }

    const updatedQuests = quests.map(q => {
      if (q.id === questId) {
        const objectives = q.objectives.map(obj => obj.id === objectiveId ? { ...obj, current: Math.min(obj.current + amount, obj.target) } : obj);
        return { ...q, objectives };
      }
      return q;
    });

    const target = updatedQuests.find(q => q.id === questId);
    if (target) {
      if (session) await supabase.from('quests').update({ objectives: target.objectives }).eq('id', questId);
      else await db.quests.put(target);
    }
    set({ quests: updatedQuests });
  },

  completeQuest: async (questId) => {
    const { quests, stats, session, systemLocked } = get();
    if (systemLocked) return;
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.completedAt || !quest.objectives.every(obj => obj.current >= obj.target)) return;

    const completedAt = new Date();
    if (session) await supabase.from('quests').update({ completed_at: completedAt }).eq('id', questId);
    else await db.quests.put({ ...quest, completedAt });

    const difficultyScalar = quest.difficulty === 'BOSS' ? 3 : quest.difficulty === 'HARD' ? 1.5 : quest.difficulty === 'MEDIUM' ? 1 : 0.5;
    const baseGain = Math.ceil(1 * difficultyScalar);
    let gains: any = { strength: 0, agility: 0, vitality: 0, intelligence: 0, sense: 0 };
    if (quest.taskType === 'AGI_FOCUS') { gains.agility = Math.ceil(baseGain * 0.7); gains.vitality = Math.ceil(baseGain * 0.3); }
    else if (quest.taskType === 'STR_FOCUS') { gains.strength = Math.ceil(baseGain * 0.7); gains.vitality = Math.ceil(baseGain * 0.3); }
    else { gains.strength = Math.ceil(baseGain * 0.2); gains.agility = Math.ceil(baseGain * 0.2); gains.vitality = Math.ceil(baseGain * 0.2); gains.intelligence = Math.ceil(baseGain * 0.2); gains.sense = Math.ceil(baseGain * 0.2); }

    const updatedStats = { ...stats };
    Object.entries(gains).forEach(([k, v]) => updatedStats[k as keyof UserStats] += v as number);
    if (session) await supabase.from('user_stats').update(updatedStats).eq('user_id', session.user.id);
    else await db.userStats.update(1, updatedStats);

    set({ stats: updatedStats, quests: quests.map(q => q.id === questId ? { ...q, completedAt } : q) });
    await get().addXp(quest.rewards.xp);
    get().addToast({ type: 'SUCCESS', title: 'Mission Cleared', message: quest.title, stats: { ...gains, xp: quest.rewards.xp } });
    if (quest.type === 'DAILY') setTimeout(() => get().seedDailyQuest(), 1000);
  },

  undoQuestCompletion: async (questId) => {
    const { quests, session } = get();
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.completedAt || Date.now() - new Date(quest.completedAt).getTime() > 300000) return;
    if (session) await supabase.from('quests').update({ completed_at: null }).eq('id', questId);
    else await db.quests.put({ ...quest, completedAt: undefined });
    set({ quests: quests.map(q => q.id === questId ? { ...q, completedAt: undefined } : q) });
    await get().addXp(-quest.rewards.xp, true);
  },

  checkPenalty: () => {
    const { quests } = get();
    const daily = quests.find(q => q.type === 'DAILY' && !q.completedAt);
    if (daily && daily.expiresAt && new Date() > new Date(daily.expiresAt)) {
      if (!get().isPenaltyActive) { set({ isPenaltyActive: true }); get().addToast({ type: 'ERROR', title: 'Penalty Incurred', message: 'Mission failed.' }); }
    } else set({ isPenaltyActive: false });
  },

  completeWellnessTask: async (taskId) => {
    const { wellnessTasks, session, systemLocked, cooldownTasks } = get();
    if (systemLocked || cooldownTasks[taskId]) return;
    const now = Date.now();
    if (now - lastClickTime < 1500) clickCount++; else clickCount = 1;
    lastClickTime = now;
    if (clickCount > 2) { set({ systemLocked: true }); setTimeout(() => set({ systemLocked: false, clickCount: 0 } as any), 20000); return; }

    const task = wellnessTasks.find(t => t.id === taskId);
    if (!task || task.isCompleted) return;

    set(s => ({ cooldownTasks: { ...s.cooldownTasks, [taskId]: true } }));
    setTimeout(() => set(s => ({ cooldownTasks: { ...s.cooldownTasks, [taskId]: false } })), 10000);

    const completedAt = new Date();
    if (session) await supabase.from('wellness_tasks').update({ is_completed: true, completed_at: completedAt }).match({ id: taskId, user_id: session.user.id });
    else await db.wellnessTasks.update(taskId, { isCompleted: true, completedAt });

    let gain: any = { vitality: 0, intelligence: 0, sense: 0 };
    if (task.type === 'PHYSICAL') gain.vitality = 1; else if (task.type === 'MENTAL') gain.intelligence = 1; else gain.sense = 1;
    const updatedStats = { ...get().stats };
    Object.entries(gain).forEach(([k, v]) => updatedStats[k as keyof UserStats] += v as number);
    
    if (session) await supabase.from('user_stats').update(updatedStats).eq('user_id', session.user.id);
    else await db.userStats.update(1, updatedStats);

    set({ stats: updatedStats, wellnessTasks: wellnessTasks.map(t => t.id === taskId ? { ...t, isCompleted: true, completedAt } : t) });
    await get().addXp(task.rewardXp);
    get().addToast({ type: 'SUCCESS', title: 'Task Synced', message: task.title, stats: { ...gain, xp: task.rewardXp } });
  },

  undoWellnessTask: async (taskId) => {
    const { wellnessTasks, session } = get();
    const task = wellnessTasks.find(t => t.id === taskId);
    if (!task || !task.isCompleted || !task.completedAt || Date.now() - new Date(task.completedAt).getTime() > 300000) return;
    if (session) await supabase.from('wellness_tasks').update({ is_completed: false, completed_at: null }).match({ id: taskId, user_id: session.user.id });
    else await db.wellnessTasks.update(taskId, { isCompleted: false, completedAt: undefined });
    set({ wellnessTasks: wellnessTasks.map(t => t.id === taskId ? { ...t, isCompleted: false, completedAt: undefined } : t) });
    await get().addXp(-task.rewardXp, true);
  },

  toggleProgramTask: async (programId, taskId) => {
    const { programs, stats, session, systemLocked, cooldownTasks } = get();
    if (systemLocked || cooldownTasks[taskId]) return;
    const program = programs.find(p => p.id === programId);
    const task = program?.tasks.find(t => t.id === taskId);
    if (!task) return;

    const isChecking = !task.completed;
    const updatedTasks = program!.tasks.map(t => t.id === taskId ? { ...t, completed: isChecking, completedAt: isChecking ? new Date() : undefined } : t);
    if (session) await supabase.from('programs').update({ tasks: updatedTasks }).match({ id: programId, user_id: session.user.id });
    else await db.programs.update(programId, { tasks: updatedTasks });

    set({ programs: programs.map(p => p.id === programId ? { ...p, tasks: updatedTasks } : p) });
    if (isChecking) {
      const updatedStats = { ...stats, [task.type]: stats[task.type] + 1 };
      if (session) await supabase.from('user_stats').update(updatedStats).eq('user_id', session.user.id);
      else await db.userStats.update(1, updatedStats);
      set({ stats: updatedStats });
      await get().addXp(15);
      get().addToast({ type: 'SUCCESS', title: 'Objective Synced', stats: { [task.type]: 1, xp: 15 } } as any);
    }
  },

  claimProgramRewards: async (programId) => {
    const { programs, stats, session } = get();
    const program = programs.find(p => p.id === programId);
    if (!program || program.isClaimed || !program.tasks.every(t => t.completed)) return;

    const updatedStats = { ...stats };
    Object.entries(program.rewards.stats).forEach(([stat, val]) => updatedStats[stat as keyof UserStats] += val as number);
    const resetTasks = program.tasks.map(t => ({ ...t, completed: false }));

    if (session) {
      await supabase.from('user_stats').update(updatedStats).eq('user_id', session.user.id);
      await supabase.from('programs').update({ is_claimed: true, tasks: resetTasks }).match({ id: programId, user_id: session.user.id });
    }
    set(s => ({ stats: updatedStats, programs: s.programs.map(p => p.id === programId ? { ...p, isClaimed: true, tasks: resetTasks } : p) }));
    await get().addXp(program.rewards.xp);
    get().addToast({ type: 'SUCCESS', title: 'Payload Claimed', message: program.title });
  },

  setDifficulty: async (difficulty) => {
    const { session } = get();
    set({ globalDifficulty: difficulty, quests: [] });
    if (session) await supabase.from('quests').delete().eq('user_id', session.user.id);
    else await db.quests.clear();
    await get().seedDailyQuest();
    get().addToast({ type: 'INFO', title: 'System Calibrated', message: difficulty });
  },

  setTrainingFocus: (focus) => { set({ trainingFocus: focus }); get().addToast({ type: 'INFO', title: 'Focus Set', message: focus }); },
  updateSettings: (s) => set(state => ({ settings: { ...state.settings, ...s } })),

  rebirth: async () => {
    const { session } = get();
    if (session) {
      await supabase.from('profiles').update({ level: 1, xp: 0, rank: 'E-Rank', title: 'Newbie Hunter', attribute_points: 0 }).eq('id', session.user.id);
      await supabase.from('user_stats').update(INITIAL_STATS).eq('user_id', session.user.id);
      await supabase.from('quests').delete().eq('user_id', session.user.id);
      await supabase.from('inventory').delete().eq('user_id', session.user.id);
    }
    set({ profile: INITIAL_PROFILE, stats: INITIAL_STATS, quests: [], inventory: [], wellnessTasks: [], programs: [] });
    get().addToast({ type: 'SUCCESS', title: 'Rebirth Sequence', message: 'Matrix baseline restored.' });
  }
}));
