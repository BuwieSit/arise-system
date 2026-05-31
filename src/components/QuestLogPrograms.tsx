import { useState } from 'react';
import { useSystemStore } from '../store/useSystemStore';
import { CheckCircle2, Lock, ShieldAlert, Award, Package, Flame, Brain, Heart, ChevronRight } from 'lucide-react';

export default function QuestLogPrograms() {
  const { 
    programs, 
    systemLocked, 
    cooldownTasks, 
    toggleProgramTask, 
    claimProgramRewards
  } = useSystemStore();

  const [activeCategory, setActiveCategory] = useState<'Physical' | 'Mental' | 'Psychological'>('Physical');

  const filteredPrograms = programs.filter(p => p.category === activeCategory);
  const currentProgram = filteredPrograms[0]; // Assuming one program per category for now

  const categories: { name: 'Physical' | 'Mental' | 'Psychological'; icon: any; color: string }[] = [
    { name: 'Physical', icon: Flame, color: 'text-red-500' },
    { name: 'Mental', icon: Brain, color: 'text-ethereal-blue' },
    { name: 'Psychological', icon: Heart, color: 'text-necrotic-purple' }
  ];

  if (!currentProgram) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-mono">
        <Lock className="mb-4 opacity-20" size={48} />
        <p className="tracking-widest uppercase text-xs">No active program matrix detected</p>
      </div>
    );
  }

  const allTasksCompleted = currentProgram.tasks.every(t => t.completed);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* System Lock Alert */}
      {systemLocked && (
        <div className="fixed top-24 inset-x-4 md:inset-x-auto md:right-8 md:w-96 bg-red-950/90 backdrop-blur-md border-2 border-red-600 p-4 rounded-xl z-[100] shadow-[0_0_50px_rgba(220,38,38,0.3)] animate-pulse">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="text-red-500 shrink-0" size={20} />
            <div>
              <p className="text-red-400 font-black text-xs tracking-wider uppercase">System Sync Suspended</p>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                Anomalous interaction pattern detected. Core matrix sync suspended temporarily to prevent data corruption.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              disabled={systemLocked}
              className={`flex items-center space-x-3 px-6 py-3 rounded-lg font-orbitron text-[10px] font-black tracking-widest transition-all duration-300 border ${
                isActive 
                  ? `bg-white/5 border-${cat.color.split('-')[1]}-500/50 ${cat.color} shadow-[0_0_20px_rgba(0,0,0,0.3)]` 
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{cat.name.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Task List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-end border-l-4 border-ethereal-blue pl-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">{currentProgram.title}</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1">
                Difficulty Level: <span className="text-ethereal-blue font-black">{currentProgram.difficulty}</span>
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[9px] text-gray-600 uppercase font-black">Progression Matrix</p>
              <p className="text-lg font-mono font-black text-white">
                {currentProgram.tasks.filter(t => t.completed).length} <span className="text-gray-700">/</span> {currentProgram.tasks.length}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {currentProgram.tasks.map((task) => {
              const isCooldown = cooldownTasks[task.id];
              return (
                <div 
                  key={task.id}
                  className={`group relative overflow-hidden bg-monolith/40 border-2 rounded-xl p-5 transition-all duration-300 ${
                    task.completed 
                      ? 'border-green-500/20 opacity-60' 
                      : isCooldown 
                        ? 'border-yellow-500/20 opacity-40 grayscale' 
                        : 'border-white/5 hover:border-ethereal-blue/30 hover:bg-monolith/60'
                  }`}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-500 ${
                        task.completed 
                          ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                          : 'bg-monolith border-white/10 text-gray-600'
                      }`}>
                        {task.completed ? <CheckCircle2 size={20} /> : <div className="w-2 h-2 rounded-full bg-current opacity-20" />}
                      </div>
                      <div>
                        <p className={`text-sm font-bold tracking-tight transition-all ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                          {task.text}
                        </p>
                        <div className="flex items-center space-x-2 mt-1.5">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-white/5 border border-white/10 text-ethereal-blue uppercase tracking-tighter">
                            +{task.type.toUpperCase()} SYNC
                          </span>
                          {isCooldown && (
                            <span className="text-[9px] font-black text-yellow-500 uppercase flex items-center">
                              <Lock size={8} className="mr-1" /> processing...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <label className="relative flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        disabled={systemLocked || isCooldown}
                        onChange={() => toggleProgramTask(currentProgram.id, task.id)}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 rounded-full border-2 transition-all duration-300 ${
                        task.completed 
                          ? 'bg-green-500/20 border-green-500/50' 
                          : 'bg-monolith border-white/10'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all duration-300 ${
                          task.completed 
                            ? 'translate-x-6 bg-green-500 shadow-[0_0_10px_#22c55e]' 
                            : 'bg-gray-700'
                        }`} />
                      </div>
                    </label>
                  </div>
                  
                  {/* Cooldown Progress Bar Overlay */}
                  {isCooldown && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-yellow-500/50 w-full animate-cooldown" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rewards Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 border-2 border-white/5 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-ethereal-blue/10 rounded-full blur-3xl group-hover:bg-ethereal-blue/20 transition-all duration-700" />
            
            <h3 className="text-xs font-black tracking-[0.2em] text-gray-500 uppercase mb-6 flex items-center">
              <Award className="mr-2 text-ethereal-blue" size={14} />
              Completion Payload
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-[10px] font-black text-gray-400 uppercase">Experience Yield</span>
                <span className="text-sm font-mono font-black text-white">+{currentProgram.rewards.xp} XP</span>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-[10px] font-black text-gray-400 uppercase block mb-3">Structural Modifications</span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(currentProgram.rewards.stats).map(([stat, val]) => (
                    <div key={stat} className="flex justify-between items-center px-2 py-1 rounded bg-monolith/50 border border-white/5">
                      <span className="text-[9px] text-gray-500 uppercase">{stat.slice(0, 3)}</span>
                      <span className="text-[10px] font-black text-ethereal-blue">+{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-[10px] font-black text-gray-400 uppercase">Loot Probability</span>
                <div className="flex items-center text-purple-400">
                  <Package size={12} className="mr-1.5" />
                  <span className="text-[10px] font-black uppercase truncate max-w-[120px]">{currentProgram.rewards.item}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => claimProgramRewards(currentProgram.id)}
              disabled={!allTasksCompleted || systemLocked}
              className={`w-full mt-8 py-4 rounded-xl font-orbitron text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 border-2 ${
                allTasksCompleted 
                  ? 'bg-gradient-to-r from-ethereal-blue to-necrotic-purple border-white/20 text-white shadow-[0_0_30px_rgba(0,210,255,0.3)] hover:scale-[1.02] active:scale-95' 
                  : 'bg-monolith border-white/5 text-gray-600 cursor-not-allowed opacity-50'
              }`}
            >
              {allTasksCompleted ? 'Claim Campaign Rewards' : 'Objectives Pending'}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-shadow-slate/30 border border-white/5">
            <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center">
              <ChevronRight size={10} className="mr-1 text-ethereal-blue" />
              Program Guidelines
            </h4>
            <ul className="space-y-2 text-[10px] text-gray-400 leading-relaxed font-mono">
              <li>• Growth determined by Category Sync Mapping.</li>
              <li>• 10s processing lock enforced per objective.</li>
              <li>• Input floods trigger application-wide lockout.</li>
              <li>• Undo Protocol available for baseline sync.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
