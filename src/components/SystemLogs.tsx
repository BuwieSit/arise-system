import { useSystemStore } from '../store/useSystemStore';
import { Terminal, Zap, Trophy, AlertTriangle, Clock } from 'lucide-react';

const categoryIcons: any = {
  SYSTEM_EVENT: <Terminal size={14} className="text-ethereal-blue" />,
  QUEST_LOG: <Trophy size={14} className="text-yellow-500" />,
  ACHIEVEMENT: <Zap size={14} className="text-necrotic-purple" />,
  PENALTY: <AlertTriangle size={14} className="text-red-500" />,
};

const categoryColors: any = {
  SYSTEM_EVENT: 'border-ethereal-blue/20 bg-ethereal-blue/5',
  QUEST_LOG: 'border-yellow-500/20 bg-yellow-500/5',
  ACHIEVEMENT: 'border-necrotic-purple/20 bg-necrotic-purple/5',
  PENALTY: 'border-red-500/30 bg-red-500/10 animate-pulse',
};

export const SystemLogs = () => {
  const { logs } = useSystemStore();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-l-4 border-ethereal-blue pl-4 mb-8 gap-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">Operational Ledger</h2>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">Live Synchronization Stream</p>
        </div>
        <div className="flex items-center space-x-2 bg-monolith/50 border border-white/5 rounded-lg px-4 py-2">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Feed Status: Synchronized</span>
        </div>
      </div>

      <div className="glass-panel overflow-hidden border-white/5 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ethereal-blue to-transparent opacity-30"></div>
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-6 space-y-3">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div 
                key={log.id} 
                className={`flex items-start space-x-4 p-4 rounded-xl border transition-all duration-300 hover:border-white/20 group ${categoryColors[log.category] || 'border-white/5 bg-white/5'}`}
              >
                <div className="mt-1 shrink-0 p-2 rounded-lg bg-monolith border border-white/10 group-hover:scale-110 transition-transform">
                  {categoryIcons[log.category] || <Terminal size={14} />}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">
                      {log.category.replace('_', ' ')}
                    </span>
                    <span className="text-[8px] font-mono text-gray-600 flex items-center">
                      <Clock size={8} className="mr-1" />
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <p className="text-xs font-medium text-gray-300 leading-relaxed font-mono">
                    <span className="text-gray-600 mr-2">{">>"}</span>
                    {log.message}
                  </p>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap gap-2">
                       {log.metadata.levelUp && (
                         <span className="text-[8px] font-black px-2 py-0.5 rounded bg-necrotic-purple/20 text-necrotic-purple border border-necrotic-purple/30 uppercase">
                           Level Reached: {log.metadata.levelUp}
                         </span>
                       )}
                       {log.metadata.statsAdded && (
                         <span className="text-[8px] font-black px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 uppercase">
                           Sync: {log.metadata.statsAdded}
                         </span>
                       )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4 opacity-30">
               <Terminal size={32} className="mx-auto text-gray-600" />
               <p className="text-[10px] font-mono uppercase tracking-[0.3em]">No logs recorded in this session</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Summary Overlay */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', val: logs.length, icon: <Terminal size={12} /> },
          { label: 'Critical Errors', val: logs.filter(l => l.category === 'PENALTY').length, icon: <AlertTriangle size={12} /> },
          { label: 'Achievements', val: logs.filter(l => l.category === 'ACHIEVEMENT').length, icon: <Zap size={12} /> },
          { label: 'Mission Logs', val: logs.filter(l => l.category === 'QUEST_LOG').length, icon: <Trophy size={12} /> }
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-4 bg-white/5 border-white/5 flex items-center justify-between">
             <div className="flex items-center space-x-3 text-gray-500">
                {stat.icon}
                <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
             </div>
             <span className="text-sm font-mono font-black text-white">{stat.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
