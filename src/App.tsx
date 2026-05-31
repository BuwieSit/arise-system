import { useState, useEffect } from 'react';
import { Plus, Clock, Swords, BookOpen, User as UserIcon, ListTodo, Loader2 } from 'lucide-react';
import { useSystemStore } from './store/useSystemStore';
import { calculateRequiredXp } from './utils/systemCalculations';
import type { UserStats } from './types';
import { PenaltyZone } from './components/PenaltyZone';
import { useNotifications } from './hooks/useNotifications';
import { Inventory } from './components/Inventory';
import { SystemLogs } from './components/SystemLogs';

type Tab = 'DASHBOARD' | 'QUEST LOG' | 'INVENTORY' | 'LOGS';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  
  const { 
    profile, 
    stats, 
    quests, 
    isLoading, 
    systemDirective,
    initialize, 
    allocateAttributePoint, 
    updateQuestProgress, 
    completeQuest 
  } = useSystemStore();
  
  const { requestPermission } = useNotifications();

  useEffect(() => {
    initialize();
    requestPermission().catch(err => console.log('System: Notification permission deferred', err));

    const timer = setTimeout(() => {
      if (useSystemStore.getState().isLoading) {
        console.warn('System: Loading threshold reached. Forcing interface...');
        useSystemStore.setState({ isLoading: false });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [initialize, requestPermission]); 


  if (isLoading) {
    return (
      <div className="min-h-screen bg-monolith flex items-center justify-center">
        <Loader2 className="text-ethereal-blue animate-spin" size={48} />
      </div>
    );
  }

  const xpRequired = calculateRequiredXp(profile.level);
  const xpProgress = (profile.xp / xpRequired) * 100;

  const statEntries: { name: string; key: keyof UserStats; val: number }[] = [
    { name: 'Strength (STR)', key: 'strength', val: stats.strength },
    { name: 'Agility (AGI)', key: 'agility', val: stats.agility },
    { name: 'Vitality (VIT)', key: 'vitality', val: stats.vitality },
    { name: 'Intelligence (INT)', key: 'intelligence', val: stats.intelligence },
    { name: 'Sense (SEN)', key: 'sense', val: stats.sense }
  ];

  const dailyQuests = quests.filter(q => q.type === 'DAILY' && !q.completedAt);

  return (
    <div className="min-h-screen bg-monolith text-monolith-text font-inter antialiased selection:bg-ethereal-blue/30 pb-20">
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-shadow-slate/80 backdrop-blur-md border-b border-ethereal-blue/20 px-4 py-3 shadow-[0_4px_30px_rgba(4,8,20,0.8)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="font-orbitron text-xl tracking-widest font-black text-transparent bg-clip-text bg-gradient-to-r from-ethereal-blue to-necrotic-purple drop-shadow-[0_0_10px_rgba(0,210,255,0.5)]">
            ARISE: THE SYSTEM
          </h1>
          <div className="flex items-center space-x-6">
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-ethereal-blue font-orbitron tracking-tighter">HP</span>
                <div className="w-24 h-1.5 bg-monolith rounded-full overflow-hidden border border-ethereal-blue/10">
                  <div className="h-full bg-system-alert shadow-[0_0_8px_#FF0055]" style={{ width: `100%` }}></div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-necrotic-purple font-orbitron tracking-tighter">MP</span>
                <div className="w-24 h-1.5 bg-monolith rounded-full overflow-hidden border border-necrotic-purple/10">
                  <div className="h-full bg-necrotic-purple shadow-[0_0_8px_#7000FF]" style={{ width: `100%` }}></div>
                </div>
              </div>
            </div>
            <div className="text-right font-orbitron">
              <span className="text-xs text-ethereal-blue block tracking-wider uppercase">Rank</span>
              <span className="text-xl font-bold text-white tracking-tighter uppercase">{profile.rank.split('-')[0]}</span>
            </div>
            <div className="text-right font-orbitron">
              <span className="text-xs text-ethereal-blue block tracking-wider">LEVEL</span>
              <span className="text-xl font-bold text-white">{profile.level}</span>
            </div>
          </div>
        </div>
        
        {/* XP Bar */}
        <div className="w-full h-1 bg-monolith absolute bottom-0 left-0">
          <div 
            className="h-full bg-gradient-to-r from-ethereal-blue to-necrotic-purple shadow-[0_0_8px_#00D2FF] transition-all duration-1000" 
            style={{ width: `${xpProgress}%` }}
          ></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'DASHBOARD' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Status Metrics */}
            <section className="md:col-span-1 glass-panel p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-ethereal-blue/10 to-transparent rounded-bl-full pointer-events-none"></div>
              <div className="flex justify-between items-center mb-4 border-l-2 border-ethereal-blue pl-2">
                <h2 className="text-xs text-ethereal-blue font-bold uppercase">
                  Status Metrics
                </h2>
                {profile.attributePoints > 0 && (
                  <span className="text-[10px] font-orbitron text-ethereal-blue animate-pulse">
                    {profile.attributePoints} POINTS AVAILABLE
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-orbitron uppercase">Current Title</p>
                  <p className="text-lg font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    {profile.title}
                  </p>
                </div>
                
                <div className="space-y-3 font-orbitron">
                  {statEntries.map((stat, i) => (
                    <div key={i} className="flex justify-between items-center bg-monolith/50 p-2.5 rounded border border-white/5 hover:border-ethereal-blue/20 transition-colors duration-300">
                      <span className="text-xs text-gray-300 uppercase tracking-tighter">{stat.name}</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-ethereal-blue">{stat.val}</span>
                        <button 
                          onClick={() => allocateAttributePoint(stat.key)}
                          disabled={profile.attributePoints <= 0}
                          className={`w-5 h-5 flex items-center justify-center text-xs font-bold rounded border transition-all duration-200 ${
                            profile.attributePoints > 0 
                            ? 'bg-ethereal-blue/10 hover:bg-ethereal-blue text-ethereal-blue hover:text-monolith border-ethereal-blue/30 shadow-[0_0_8px_rgba(0,210,255,0.2)]' 
                            : 'bg-gray-800/50 text-gray-600 border-gray-700 cursor-not-allowed'
                          }`}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Right Column: Quests & System AI */}
            <section className="md:col-span-2 space-y-6">
              {/* Daily Quest Card */}
              {dailyQuests.length > 0 ? (
                dailyQuests.map(quest => (
                  <div key={quest.id} className="glass-panel p-6 relative shadow-[0_4px_20px_rgba(0,210,255,0.05)]">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] tracking-widest font-orbitron bg-system-alert/10 border border-system-alert/30 text-system-alert px-2 py-0.5 rounded mr-2 uppercase">
                          {quest.type.replace('_', ' ')}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-2 uppercase">{quest.title}</h3>
                      </div>
                      <div className="text-right font-orbitron">
                        <span className="text-[10px] text-gray-400 block uppercase">Time Left</span>
                        <span className="text-sm font-bold text-system-alert tracking-wider animate-pulse flex items-center justify-end">
                          <Clock size={14} className="mr-1" /> 11:42:09
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 font-orbitron">
                      {quest.objectives.map((obj, i) => (
                        <div key={i} className="bg-monolith/80 p-3 rounded border border-white/5 group cursor-pointer" onClick={() => updateQuestProgress(quest.id, obj.id, 10)}>
                          <div className="flex justify-between text-[10px] mb-2">
                            <span className="text-gray-300 uppercase tracking-tighter group-hover:text-ethereal-blue transition-colors">{obj.task}</span>
                            <span className={obj.current >= obj.target ? "text-ethereal-blue font-bold" : "text-gray-400"}>
                              {obj.current}/{obj.target} {obj.unit || ''}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-monolith rounded-full overflow-hidden border border-white/5">
                            <div 
                              className={`h-full transition-all duration-500 shadow-[0_0_8px_rgba(0,210,255,0.3)] ${obj.current >= obj.target ? 'bg-ethereal-blue' : 'bg-necrotic-purple'}`}
                              style={{ width: `${Math.min((obj.current / obj.target) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {quest.objectives.every(obj => obj.current >= obj.target) && (
                      <button 
                        onClick={() => completeQuest(quest.id)}
                        className="w-full mt-6 py-3 bg-ethereal-blue text-monolith font-orbitron font-black tracking-widest uppercase rounded shadow-[0_0_20px_rgba(0,210,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-200"
                      >
                        Claim Rewards
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="glass-panel p-10 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-700">
                    <Clock size={32} />
                  </div>
                  <p className="font-orbitron text-gray-500 text-sm tracking-widest uppercase">No Active Daily Quests. Resetting...</p>
                </div>
              )}

              {/* System AI Module */}
              <div className="bg-shadow-slate/40 border border-necrotic-purple/20 rounded-lg p-4 font-orbitron relative overflow-hidden shadow-[0_4px_25px_rgba(112,0,255,0.05)]">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-necrotic-purple to-transparent"></div>
                <h4 className="text-[10px] text-necrotic-purple font-bold tracking-widest uppercase mb-1">System Intelligence Module</h4>
                <p className="text-xs text-gray-400 italic leading-relaxed">
                  "{systemDirective}"
                </p>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'QUEST LOG' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center border-l-2 border-ethereal-blue pl-2 mb-4">
              <h2 className="text-xs text-ethereal-blue font-bold uppercase">Active Mission Hub</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {quests.filter(q => !q.completedAt).map(quest => (
                <div key={quest.id} className="glass-panel p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-ethereal-blue/5 to-transparent rounded-bl-full pointer-events-none group-hover:from-ethereal-blue/10 transition-colors duration-500"></div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tighter ${quest.type === 'DAILY' ? 'border-system-alert text-system-alert bg-system-alert/5' : 'border-ethereal-blue text-ethereal-blue bg-ethereal-blue/5'}`}>
                          {quest.type.replace('_', ' ')}
                        </span>
                        <span className="text-[8px] font-orbitron text-gray-500 uppercase tracking-widest">{quest.rank}</span>
                      </div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter">{quest.title}</h3>
                      <p className="text-[10px] text-gray-500 mt-1 max-w-xl font-inter leading-relaxed">{quest.description}</p>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="bg-monolith/50 p-2 rounded border border-white/5 flex items-center space-x-3 mb-2">
                        <div className="text-right">
                          <span className="block text-[7px] text-gray-500 uppercase">XP Reward</span>
                          <span className="text-xs font-bold text-ethereal-blue">+{quest.rewards.xp}</span>
                        </div>
                        {quest.rewards.attributePoints && (
                          <div className="text-right border-l border-white/10 pl-3">
                            <span className="block text-[7px] text-gray-500 uppercase">Points</span>
                            <span className="text-xs font-bold text-necrotic-purple">+{quest.rewards.attributePoints}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {quest.objectives.map((obj, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-orbitron">
                          <span className="text-gray-400 uppercase tracking-tighter">{obj.task}</span>
                          <span className="text-white font-bold">{obj.current} / {obj.target} {obj.unit || ''}</span>
                        </div>
                        <div className="w-full h-1.5 bg-monolith rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-gradient-to-r from-ethereal-blue to-necrotic-purple shadow-[0_0_8px_rgba(0,210,255,0.4)] transition-all duration-1000"
                            style={{ width: `${(obj.current / obj.target) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {quests.filter(q => !q.completedAt).length === 0 && (
                <div className="p-20 text-center glass-panel flex flex-col items-center justify-center space-y-4 opacity-50">
                  <ListTodo size={48} className="text-gray-600" />
                  <p className="font-orbitron text-xs tracking-[0.3em] uppercase">No Active Missions Found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'INVENTORY' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Inventory />
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SystemLogs />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-shadow-slate/95 border-t border-ethereal-blue/10 backdrop-blur-lg px-2 py-2 shadow-[0_-10px_25px_rgba(4,8,20,0.9)]">
        <div className="max-w-md mx-auto flex justify-between items-center text-center font-orbitron">
          {[
            { label: 'DASHBOARD', icon: <UserIcon size={18} /> },
            { label: 'QUEST LOG', icon: <ListTodo size={18} /> },
            { label: 'INVENTORY', icon: <Swords size={18} /> },
            { label: 'LOGS', icon: <BookOpen size={18} /> }
          ].map((tab, i) => (
            <button 
              key={i} 
              onClick={() => setActiveTab(tab.label as Tab)}
              className={`flex-1 flex flex-col items-center py-2 tracking-wider font-black transition-all duration-300 relative ${activeTab === tab.label ? 'text-ethereal-blue' : 'text-gray-600 hover:text-gray-400'}`}
            >
              {activeTab === tab.label && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-ethereal-blue shadow-[0_0_10px_#00D2FF]"></div>
              )}
              <div className={`${activeTab === tab.label ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>
                {tab.icon}
              </div>
              <span className="text-[7px] mt-1.5 uppercase tracking-tighter">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <PenaltyZone />
    </div>
  );
}
