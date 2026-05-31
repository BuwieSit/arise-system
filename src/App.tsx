import { useState, useEffect, useCallback } from 'react';
import { Plus, Clock, Swords, BookOpen, User as UserIcon, ListTodo, Loader2, Heart, Zap, Brain, Eye, Target } from 'lucide-react';
import { useSystemStore } from './store/useSystemStore';
import { calculateRequiredXp } from './utils/systemCalculations';
import type { UserStats, QuestDifficulty } from './types';
import { PenaltyZone } from './components/PenaltyZone';
import { useNotifications } from './hooks/useNotifications';
import { Inventory } from './components/Inventory';
import { SystemLogs } from './components/SystemLogs';
import { SplashScreen } from './components/SplashScreen';

type Tab = 'DASHBOARD' | 'QUEST LOG' | 'INVENTORY' | 'LOGS';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  const [showSplash, setShowSplash] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { 
    profile, 
    stats, 
    quests, 
    wellnessTasks,
    isLoading, 
    systemDirective,
    globalDifficulty,
    trainingFocus,
    initialize, 
    allocateAttributePoint, 
    updateQuestProgress, 
    completeQuest,
    completeWellnessTask,
    setDifficulty,
    setTrainingFocus
  } = useSystemStore();
  
  const { requestPermission } = useNotifications();

  useEffect(() => {
    initialize();
    requestPermission().catch(err => console.log('System: Notification permission deferred', err));

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [initialize, requestPermission]);

  const xpRequired = calculateRequiredXp(profile.level);
  const xpProgress = (profile.xp / xpRequired) * 100;

  const statEntries: { name: string; key: keyof UserStats; val: number; icon: any; color: string }[] = [
    { name: 'Strength', key: 'strength', val: stats.strength, icon: Zap, color: 'text-red-500' },
    { name: 'Agility', key: 'agility', val: stats.agility, icon: Swords, color: 'text-ethereal-blue' },
    { name: 'Vitality', key: 'vitality', val: stats.vitality, icon: Heart, color: 'text-green-500' },
    { name: 'Intelligence', key: 'intelligence', val: stats.intelligence, icon: Brain, color: 'text-necrotic-purple' },
    { name: 'Sense', key: 'sense', val: stats.sense, icon: Eye, color: 'text-yellow-500' }
  ];

  const dailyQuests = quests.filter(q => q.type === 'DAILY' && !q.completedAt);

  const getTimerString = useCallback((expiresAt?: Date) => {
    if (!expiresAt) return "00:00:00";
    const diff = expiresAt.getTime() - currentTime.getTime();
    if (diff <= 0) return "00:00:00";
    
    const hrs = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }, [currentTime]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-monolith flex items-center justify-center">
        <Loader2 className="text-ethereal-blue animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-monolith text-monolith-text font-inter antialiased selection:bg-ethereal-blue/30 pb-24">
      
      {/* Dynamic Header with Tactical Styling */}
      <header className="sticky top-0 z-50 bg-shadow-slate/90 backdrop-blur-xl border-b-2 border-ethereal-blue/30 px-4 py-4 shadow-[0_4px_30px_rgba(0,210,255,0.15)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start">
            <h1 className="font-orbitron text-2xl md:text-3xl font-black tracking-[0.15em] text-white drop-shadow-[0_0_12px_rgba(0,210,255,0.6)]">
              ARISE: THE SYSTEM
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-[10px] font-orbitron font-black text-ethereal-blue bg-ethereal-blue/10 px-2 py-0.5 rounded border border-ethereal-blue/30 uppercase tracking-widest">
                Hunter Rank: {profile.rank.split('-')[0]}
              </span>
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">
                Instance v3.2.0.4
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4 bg-monolith/50 p-2 rounded-lg border border-white/5">
              <div className="text-right font-orbitron">
                 <span className="text-[9px] text-ethereal-blue block tracking-widest font-black">LEVEL</span>
                 <span className="text-2xl md:text-3xl font-black text-white tabular-nums leading-none">{profile.level}</span>
              </div>
              <div className="w-16 h-8 flex items-center">
                 <div className="w-full h-1.5 bg-shadow-slate rounded-full overflow-hidden border border-white/10">
                    <div className="h-full bg-ethereal-blue shadow-[0_0_10px_#00D2FF]" style={{ width: `${xpProgress}%` }}></div>
                 </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-2 bg-monolith/50 p-1.5 rounded-lg border border-gray-800">
              {(['EASY', 'MEDIUM', 'HARD', 'BOSS'] as QuestDifficulty[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDifficulty(mode)}
                  className={`px-3 py-1 rounded font-orbitron text-[9px] font-black transition-all duration-300 ${
                    globalDifficulty === mode 
                      ? 'bg-system-alert text-white shadow-[0_0_15px_#FF0055] border-system-alert' 
                      : 'text-gray-600 hover:text-gray-400 border-transparent'
                  } border`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Real-time XP Bar beneath header */}
        <div className="w-full h-0.5 bg-monolith absolute bottom-0 left-0">
          <div 
            className="h-full bg-gradient-to-r from-ethereal-blue to-necrotic-purple shadow-[0_0_8px_#00D2FF] transition-all duration-1000" 
            style={{ width: `${xpProgress}%` }}
          ></div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'DASHBOARD' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Status & Attributes (Col 1-4) */}
            <div className="lg:col-span-4 space-y-8">
              <section className="glass-panel p-6 relative overflow-hidden group border-2 border-ethereal-blue/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-ethereal-blue/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="flex justify-between items-center mb-6 border-l-4 border-ethereal-blue pl-3">
                  <h2 className="text-sm font-black text-ethereal-blue uppercase tracking-widest">
                    Status Metrics
                  </h2>
                  {profile.attributePoints > 0 && (
                    <div className="flex items-center space-x-1 animate-pulse">
                      <span className="text-[10px] font-black font-orbitron text-ethereal-blue">{profile.attributePoints}</span>
                      <Plus size={10} className="text-ethereal-blue" />
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-monolith/40 p-4 rounded border border-white/5">
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Assigned Title</p>
                    <p className="text-xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
                      {profile.title}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {statEntries.map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <div key={i} className="flex justify-between items-center bg-monolith/60 p-4 rounded-lg border border-white/5 hover:border-ethereal-blue/30 transition-all duration-300 group/stat shadow-lg hover:shadow-[0_0_20px_rgba(0,210,255,0.05)]">
                          <div className="flex items-center space-x-3">
                             <div className={`p-2 rounded bg-monolith border border-white/5 ${stat.color} group-hover/stat:scale-110 transition-transform`}>
                               <Icon size={16} />
                             </div>
                             <span className="text-xs font-black text-gray-300 uppercase tracking-widest">{stat.name}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-xl md:text-2xl font-black text-ethereal-blue tabular-nums drop-shadow-[0_0_8px_rgba(0,210,255,0.4)]">{stat.val}</span>
                            <button 
                              onClick={() => allocateAttributePoint(stat.key)}
                              disabled={profile.attributePoints <= 0}
                              className={`w-7 h-7 flex items-center justify-center rounded border-2 transition-all duration-300 ${
                                profile.attributePoints > 0 
                                ? 'bg-ethereal-blue/10 border-ethereal-blue/40 text-ethereal-blue hover:bg-ethereal-blue hover:text-monolith shadow-[0_0_15px_rgba(0,210,255,0.2)]' 
                                : 'bg-gray-900/20 border-gray-800 text-gray-700 cursor-not-allowed'
                              }`}
                            >
                              <Plus size={14} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Training Focus Optimization Tray */}
              <section className="bg-shadow-slate border border-white/5 rounded-xl p-6 shadow-xl">
                 <div className="flex items-center space-x-2 mb-4">
                    <Target size={14} className="text-necrotic-purple" />
                    <h3 className="font-orbitron text-xs tracking-widest text-white uppercase font-black">Optimization Tray</h3>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    {(['BALANCED', 'STRENGTH', 'AGILITY', 'VITALITY'] as const).map((focus) => (
                      <button
                        key={focus}
                        onClick={() => setTrainingFocus(focus)}
                        className={`py-2 rounded font-orbitron text-[8px] font-black transition-all duration-300 border ${
                          trainingFocus === focus 
                            ? 'bg-necrotic-purple/20 border-necrotic-purple text-necrotic-purple shadow-[0_0_10px_rgba(112,0,255,0.2)]' 
                            : 'bg-monolith/50 border-white/5 text-gray-600 hover:text-gray-400'
                        }`}
                      >
                        {focus}
                      </button>
                    ))}
                 </div>
                 <p className="mt-3 text-[7px] text-gray-600 font-mono uppercase text-center tracking-tighter">
                   // ADJUSTING FOCUS SHIFTS SYSTEM XP ALLOCATION MATRICES
                 </p>
              </section>

              {/* Health Matrix / Wellness Deck */}
              <section className="bg-[#0B1528] border-2 border-gray-800 rounded-xl p-6 shadow-2xl">
                <h3 className="font-orbitron text-xs tracking-[0.2em] text-[#00D2FF] uppercase font-black border-l-4 border-[#00D2FF] pl-3 mb-6">
                  DAILY LIVING SYSTEM
                </h3>
                <div className="space-y-4">
                  {wellnessTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className={`bg-[#040814] p-4 rounded-lg border flex justify-between items-center transition-all duration-500 ${
                        task.isCompleted 
                        ? 'border-ethereal-blue/50 opacity-60' 
                        : 'border-gray-900 hover:border-ethereal-blue/30'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className={`text-xs md:text-sm font-bold ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                          {task.title}
                        </p>
                        <span className="font-mono text-[9px] text-gray-500 tracking-widest bg-gray-900/80 px-2 py-0.5 rounded border border-gray-800">
                          {task.type}
                        </span>
                      </div>
                      <button 
                        onClick={() => completeWellnessTask(task.id)}
                        disabled={task.isCompleted}
                        className={`font-orbitron text-[9px] font-black px-3 py-2 rounded border transition-all duration-300 ${
                          task.isCompleted
                          ? 'bg-gray-900 text-gray-700 border-gray-800'
                          : 'bg-ethereal-blue/10 text-ethereal-blue border-ethereal-blue/30 hover:bg-ethereal-blue hover:text-monolith'
                        }`}
                      >
                        {task.isCompleted ? 'VERIFIED' : `+${task.rewardXp} XP`}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Quests & AI Intelligence (Col 5-12) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Daily Critical Window */}
              {dailyQuests.length > 0 ? (
                dailyQuests.map(quest => (
                  <section key={quest.id} className="bg-[#0B1528] border-2 border-system-alert/40 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_40px_rgba(255,0,85,0.15)] group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-system-alert/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-105 transition-transform duration-1000"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 mb-8 gap-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                           <span className="bg-system-alert/20 border-2 border-system-alert text-system-alert font-orbitron text-[10px] font-black px-3 py-1 rounded tracking-[0.2em] uppercase">
                             CRITICAL MISSION WINDOW
                           </span>
                           <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{quest.rank}</span>
                        </div>
                        <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">{quest.title}</h2>
                      </div>
                      
                      <div className="font-orbitron text-right md:bg-monolith/40 md:p-4 md:rounded-xl md:border md:border-white/5">
                        <span className="text-[9px] text-gray-500 block tracking-[0.2em] font-black uppercase mb-1">Time Remaining</span>
                        <span className="text-3xl md:text-5xl font-black text-system-alert drop-shadow-[0_0_15px_rgba(255,0,85,0.5)] tracking-tight tabular-nums animate-pulse">
                          {getTimerString(quest.expiresAt)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {quest.objectives.map((obj, i) => (
                        <div key={i} className="bg-monolith/60 p-5 rounded-xl border border-white/5 hover:border-ethereal-blue/30 transition-all duration-300 group/obj cursor-pointer shadow-xl" onClick={() => updateQuestProgress(quest.id, obj.id, 10)}>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/obj:text-ethereal-blue transition-colors">{obj.task}</span>
                            <span className={`text-base font-black tabular-nums ${obj.current >= obj.target ? "text-ethereal-blue" : "text-gray-300"}`}>
                              {obj.current} <span className="text-[10px] text-gray-600 font-normal">/ {obj.target} {obj.unit || ''}</span>
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-monolith rounded-full overflow-hidden border border-white/5 p-0.5">
                            <div 
                              className={`h-full transition-all duration-700 rounded-full shadow-[0_0_12px_rgba(0,210,255,0.4)] ${obj.current >= obj.target ? 'bg-ethereal-blue' : 'bg-gradient-to-r from-necrotic-purple to-ethereal-blue'}`}
                              style={{ width: `${Math.min((obj.current / obj.target) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {quest.objectives.every(obj => obj.current >= obj.target) && (
                      <button 
                        onClick={() => completeQuest(quest.id)}
                        className="w-full py-4 bg-gradient-to-r from-ethereal-blue to-necrotic-purple text-monolith font-orbitron text-sm font-black tracking-[0.3em] uppercase rounded-xl shadow-[0_0_30px_rgba(0,210,255,0.5)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
                      >
                        Finalize awakening protocol
                      </button>
                    )}
                  </section>
                ))
              ) : (
                <section className="glass-panel p-20 flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                  <div className="w-20 h-20 rounded-full border-4 border-dashed border-gray-800 flex items-center justify-center text-gray-700 animate-spin-slow">
                    <Clock size={40} />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-lg font-black text-gray-500 uppercase tracking-widest">System Recalibrating</h3>
                    <p className="text-[10px] font-mono text-gray-600 uppercase mt-2 tracking-tighter">No active critical instances detected in this sector.</p>
                  </div>
                </section>
              )}

              {/* System AI Intelligence Module */}
              <section className="bg-shadow-slate/40 border-2 border-necrotic-purple/30 rounded-2xl p-6 font-orbitron relative overflow-hidden shadow-[0_4px_30px_rgba(112,0,255,0.08)] group">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-necrotic-purple via-ethereal-blue to-transparent"></div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded bg-necrotic-purple/10 border border-necrotic-purple/30">
                    <Brain size={18} className="text-necrotic-purple" />
                  </div>
                  <h4 className="text-xs text-necrotic-purple font-black tracking-[0.2em] uppercase">System Intelligence Module</h4>
                  <div className="h-px flex-1 bg-gradient-to-r from-necrotic-purple/30 to-transparent"></div>
                </div>
                <p className="text-sm md:text-base text-gray-300 italic leading-relaxed font-inter pl-2 border-l border-white/5">
                  "{systemDirective}"
                </p>
                <div className="mt-4 flex justify-end">
                   <span className="text-[8px] text-gray-600 uppercase tracking-widest font-black group-hover:text-necrotic-purple transition-colors duration-500">Live Analysis Stream: Synchronized</span>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Tab content for other tabs */}
        {activeTab === 'QUEST LOG' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="flex items-center border-l-4 border-ethereal-blue pl-4 mb-8">
               <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">Active Mission Hub</h2>
             </div>
             {/* Existing Quest Log Content with higher visibility */}
             <div className="grid grid-cols-1 gap-8">
               {quests.filter(q => !q.completedAt).map(quest => (
                 <div key={quest.id} className="glass-panel p-8 relative overflow-hidden group border-2 border-white/5 hover:border-ethereal-blue/30 transition-all duration-500 shadow-2xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                       <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${quest.type === 'DAILY' ? 'border-system-alert text-system-alert bg-system-alert/5' : 'border-ethereal-blue text-ethereal-blue bg-ethereal-blue/5'}`}>
                              {quest.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] font-orbitron text-gray-500 uppercase tracking-widest bg-monolith/50 px-2 py-1 rounded">{quest.rank}</span>
                            {quest.difficulty && (
                              <span className="text-[10px] font-black text-system-alert uppercase tracking-tighter bg-system-alert/10 px-2 py-1 rounded border border-system-alert/20">
                                {quest.difficulty}
                              </span>
                            )}
                          </div>
                          <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">{quest.title}</h3>
                          <p className="text-xs md:text-sm text-gray-400 max-w-2xl font-inter leading-relaxed">{quest.description}</p>
                       </div>
                       <div className="bg-monolith/80 p-6 rounded-2xl border-2 border-white/5 flex flex-row md:flex-col items-center justify-center gap-6 shadow-inner">
                          <div className="text-center">
                            <span className="block text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">XP Gain</span>
                            <span className="text-2xl font-black text-ethereal-blue drop-shadow-[0_0_10px_#00D2FF]">+{quest.rewards.xp}</span>
                          </div>
                          {quest.rewards.attributePoints && (
                            <div className="text-center md:pt-4 md:mt-4 md:border-t md:border-white/5">
                              <span className="block text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Points</span>
                              <span className="text-2xl font-black text-necrotic-purple drop-shadow-[0_0_10px_#7000FF]">+{quest.rewards.attributePoints}</span>
                            </div>
                          )}
                       </div>
                    </div>
                    <div className="space-y-6">
                      {quest.objectives.map((obj, i) => (
                        <div key={i} className="space-y-3">
                          <div className="flex justify-between items-end font-orbitron">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{obj.task}</span>
                            <span className="text-lg font-black text-white tabular-nums">{obj.current} <span className="text-xs text-gray-600 font-normal">/ {obj.target}</span></span>
                          </div>
                          <div className="h-2 w-full bg-monolith rounded-full overflow-hidden border border-white/10 p-0.5">
                             <div className="h-full bg-gradient-to-r from-ethereal-blue via-white to-necrotic-purple shadow-[0_0_15px_rgba(0,210,255,0.5)] transition-all duration-1000 rounded-full" style={{ width: `${(obj.current / obj.target) * 100}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
               ))}
               {quests.filter(q => !q.completedAt).length === 0 && (
                <div className="p-32 text-center glass-panel flex flex-col items-center justify-center space-y-6 opacity-40">
                  <ListTodo size={64} className="text-gray-700" />
                  <p className="font-orbitron text-sm tracking-[0.4em] uppercase font-black">System Standby: No Directives Available</p>
                </div>
              )}
             </div>
          </div>
        )}

        {activeTab === 'INVENTORY' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Inventory />
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <SystemLogs />
          </div>
        )}
      </main>

      {/* High-Visibility Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-shadow-slate/95 border-t-2 border-ethereal-blue/20 backdrop-blur-2xl px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.9)]">
        <div className="max-w-2xl mx-auto flex justify-between items-center text-center font-orbitron">
          {[
            { label: 'DASHBOARD', icon: <UserIcon size={22} /> },
            { label: 'QUEST LOG', icon: <ListTodo size={22} /> },
            { label: 'INVENTORY', icon: <Swords size={22} /> },
            { label: 'LOGS', icon: <BookOpen size={22} /> }
          ].map((tab, i) => (
            <button 
              key={i} 
              onClick={() => setActiveTab(tab.label as Tab)}
              className={`flex-1 flex flex-col items-center py-2 tracking-[0.2em] font-black transition-all duration-500 relative group ${activeTab === tab.label ? 'text-ethereal-blue' : 'text-gray-600 hover:text-gray-400'}`}
            >
              {activeTab === tab.label && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-ethereal-blue shadow-[0_0_15px_#00D2FF] rounded-full"></div>
              )}
              <div className={`${activeTab === tab.label ? 'scale-125 -translate-y-1' : 'scale-100'} transition-all duration-500 group-hover:scale-110`}>
                {tab.icon}
              </div>
              <span className={`text-[8px] md:text-[9px] mt-2 uppercase font-black ${activeTab === tab.label ? 'opacity-100' : 'opacity-60'}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <PenaltyZone />
    </div>
  );
}
