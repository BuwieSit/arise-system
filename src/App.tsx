import { useState } from 'react';
import { Plus, Clock, Swords, BookOpen, User as UserIcon, ListTodo } from 'lucide-react';

export default function App() {
  const [level] = useState(42);
  const [hp] = useState(100);
  const [mp] = useState(100);
  const [xpProgress] = useState(68);

  const stats = [
    { name: 'Strength (STR)', val: 85 },
    { name: 'Agility (AGI)', val: 92 },
    { name: 'Vitality (VIT)', val: 60 },
    { name: 'Intelligence (INT)', val: 40 },
    { name: 'Sense (SEN)', val: 54 }
  ];

  const tasks = [
    { task: 'Push-Ups', current: 80, target: 100 },
    { task: 'Squats', current: 100, target: 100 },
    { task: 'Shadow Running Distance', current: 4.2, target: 10, unit: 'km' }
  ];

  return (
    <div className="min-h-screen bg-monolith text-monolith-text font-inter antialiased selection:bg-ethereal-blue/30">
      
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
                  <div className="h-full bg-system-alert shadow-[0_0_8px_#FF0055]" style={{ width: `${hp}%` }}></div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-necrotic-purple font-orbitron tracking-tighter">MP</span>
                <div className="w-24 h-1.5 bg-monolith rounded-full overflow-hidden border border-necrotic-purple/10">
                  <div className="h-full bg-necrotic-purple shadow-[0_0_8px_#7000FF]" style={{ width: `${mp}%` }}></div>
                </div>
              </div>
            </div>
            <div className="text-right font-orbitron">
              <span className="text-xs text-ethereal-blue block tracking-wider">LEVEL</span>
              <span className="text-xl font-bold text-white">{level}</span>
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
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Status Metrics */}
        <section className="md:col-span-1 glass-panel p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-ethereal-blue/10 to-transparent rounded-bl-full pointer-events-none"></div>
          <h2 className="text-xs text-ethereal-blue mb-4 font-bold border-l-2 border-ethereal-blue pl-2">
            Status Metrics
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-gray-400 font-orbitron">CURRENT TITLE</p>
              <p className="text-lg font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                Shadow Monarch
              </p>
            </div>
            
            <div className="space-y-3 font-orbitron">
              {stats.map((stat, i) => (
                <div key={i} className="flex justify-between items-center bg-monolith/50 p-2.5 rounded border border-white/5 hover:border-ethereal-blue/20 transition-colors duration-300">
                  <span className="text-xs text-gray-300">{stat.name}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-ethereal-blue">{stat.val}</span>
                    <button className="w-5 h-5 bg-ethereal-blue/10 hover:bg-ethereal-blue text-ethereal-blue hover:text-monolith border border-ethereal-blue/30 rounded flex items-center justify-center text-xs font-bold transition-all duration-200">
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
          <div className="glass-panel p-6 relative shadow-[0_4px_20px_rgba(0,210,255,0.05)]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] tracking-widest font-orbitron bg-system-alert/10 border border-system-alert/30 text-system-alert px-2 py-0.5 rounded mr-2">
                  DAILY QUEST
                </span>
                <h3 className="text-lg font-bold text-white mt-2">Preparation for Building Power</h3>
              </div>
              <div className="text-right font-orbitron">
                <span className="text-[10px] text-gray-400 block">TIME LEFT</span>
                <span className="text-sm font-bold text-system-alert tracking-wider animate-pulse flex items-center justify-end">
                  <Clock size={14} className="mr-1" /> 11:42:09
                </span>
              </div>
            </div>

            <div className="space-y-4 font-orbitron">
              {tasks.map((obj, i) => (
                <div key={i} className="bg-monolith/80 p-3 rounded border border-white/5">
                  <div className="flex justify-between text-[10px] mb-2">
                    <span className="text-gray-300 uppercase tracking-tighter">{obj.task}</span>
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
          </div>

          {/* System AI Module */}
          <div className="bg-shadow-slate/40 border border-necrotic-purple/20 rounded-lg p-4 font-orbitron relative overflow-hidden shadow-[0_4px_25px_rgba(112,0,255,0.05)]">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-necrotic-purple to-transparent"></div>
            <h4 className="text-[10px] text-necrotic-purple font-bold tracking-widest uppercase mb-1">System Intelligence Module</h4>
            <p className="text-xs text-gray-400 italic leading-relaxed">
              "The current pacing matrix confirms structural muscle transformation is active. Do not halt your training regimen; the gate opens soon."
            </p>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-shadow-slate/95 border-t border-ethereal-blue/10 backdrop-blur-lg px-2 py-2 shadow-[0_-10px_25px_rgba(4,8,20,0.9)]">
        <div className="max-w-md mx-auto flex justify-between items-center text-center font-orbitron">
          {[
            { label: 'Dashboard', icon: <UserIcon size={18} /> },
            { label: 'Quest Log', icon: <ListTodo size={18} /> },
            { label: 'Inventory', icon: <Swords size={18} /> },
            { label: 'Logs', icon: <BookOpen size={18} /> }
          ].map((tab, i) => (
            <button 
              key={i} 
              className={`flex-1 flex flex-col items-center py-2 tracking-wider font-bold transition-all duration-200 ${i === 0 ? 'text-ethereal-blue' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab.icon}
              <span className="text-[8px] mt-1">{tab.label.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
