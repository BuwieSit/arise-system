import { useSystemStore } from '../store/useSystemStore';
import { Terminal, Activity, Trophy, Skull, Info } from 'lucide-react';
import type { LogCategory } from '../types/features';

const categoryConfig: Record<LogCategory, { color: string; icon: any }> = {
  SYSTEM_EVENT: { color: 'text-gray-400', icon: Info },
  QUEST_LOG: { color: 'text-ethereal-blue', icon: Activity },
  ACHIEVEMENT: { color: 'text-yellow-500', icon: Trophy },
  PENALTY: { color: 'text-system-alert', icon: Skull },
};

export const SystemLogs = () => {
  const { logs } = useSystemStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-l-2 border-ethereal-blue pl-2 mb-4">
        <h2 className="text-xs text-ethereal-blue font-bold uppercase tracking-widest flex items-center">
          <Terminal size={14} className="mr-2" />
          System Audit Ledger
        </h2>
        <span className="text-[8px] font-orbitron text-gray-500 uppercase tracking-tighter animate-pulse">Live Feed Active</span>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {logs.length > 0 ? (
          logs.map((log) => {
            const Config = categoryConfig[log.category];
            const Icon = Config.icon;
            
            return (
              <div 
                key={log.id} 
                className="bg-shadow-slate/30 border border-white/5 p-3 rounded flex items-start space-x-3 hover:bg-shadow-slate/50 transition-colors group"
              >
                <div className={`mt-1 p-1.5 rounded bg-monolith/50 border border-white/5 ${Config.color}`}>
                  <Icon size={12} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[8px] font-orbitron font-black uppercase tracking-widest ${Config.color}`}>
                      {log.category.replace('_', ' ')}
                    </span>
                    <span className="text-[7px] font-mono text-gray-600">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-300 font-inter leading-relaxed group-hover:text-white transition-colors">
                    {log.message}
                  </p>
                  {log.metadata?.raw_sensor_summary && (
                     <p className="mt-1 text-[7px] font-mono text-gray-600 truncate italic">
                       // DATA_STREAM: {log.metadata.raw_sensor_summary}
                     </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-10 text-center opacity-20">
             <Terminal size={32} className="mx-auto mb-2" />
             <p className="text-[10px] font-orbitron tracking-widest">NO LOG ENTRIES DETECTED</p>
          </div>
        )}
      </div>

      {/* Audit Policy */}
      <div className="bg-monolith/30 border border-white/5 rounded p-3">
         <p className="text-[7px] font-mono text-gray-600 leading-tight">
           <span className="text-ethereal-blue/60 mr-1">[!]</span>
           The System Audit Ledger maintains a rolling window of the last 100 historical transactions. Raw sensor data is pruned after 24 hours to optimize local matrix stability.
         </p>
      </div>
    </div>
  );
};
