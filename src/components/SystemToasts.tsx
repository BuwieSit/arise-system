import { useSystemStore } from '../store/useSystemStore';
import { X, CheckCircle2, AlertTriangle, ShieldAlert, Info, TrendingUp } from 'lucide-react';
import type { ToastType } from '../types/features';

const toastStyles: Record<ToastType, { icon: any; color: string; border: string; bg: string }> = {
  SUCCESS: { icon: CheckCircle2, color: 'text-green-500', border: 'border-green-500/50', bg: 'bg-green-500/10' },
  WARNING: { icon: AlertTriangle, color: 'text-yellow-500', border: 'border-yellow-500/50', bg: 'bg-yellow-500/10' },
  ERROR: { icon: ShieldAlert, color: 'text-red-500', border: 'border-red-500/50', bg: 'bg-red-500/10' },
  INFO: { icon: Info, color: 'text-ethereal-blue', border: 'border-ethereal-blue/50', bg: 'bg-ethereal-blue/10' },
  LEVEL_UP: { icon: TrendingUp, color: 'text-necrotic-purple', border: 'border-necrotic-purple/50', bg: 'bg-necrotic-purple/10' },
};

export const SystemToasts = () => {
  const { toasts, removeToast } = useSystemStore();

  return (
    <div className="fixed bottom-24 right-4 z-[300] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Style = toastStyles[toast.type];
        const Icon = Style.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex flex-col w-full glass-panel border-2 ${Style.border} ${Style.bg} p-4 animate-in slide-in-from-right-full duration-300 relative overflow-hidden group shadow-2xl`}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-50" style={{ color: `rgb(var(--${toast.type === 'INFO' || toast.type === 'SUCCESS' ? 'ethereal-blue' : toast.type === 'LEVEL_UP' ? 'necrotic-purple' : 'system-alert'}))` }} />
            
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Icon size={18} className={Style.color} />
                <h4 className="font-orbitron text-[10px] font-black tracking-widest uppercase text-white">
                  {toast.title}
                </h4>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-300 font-medium leading-relaxed">
              {toast.message}
            </p>

            {toast.stats && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {Object.entries(toast.stats).map(([stat, val]) => (
                  val !== 0 && (
                    <div key={stat} className="flex items-center space-x-1.5 bg-monolith/60 px-2 py-1 rounded border border-white/5">
                      <span className="text-[8px] text-gray-500 uppercase font-black">{stat.slice(0, 3)}</span>
                      <span className={`text-[9px] font-black font-mono ${val > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {val > 0 ? `+${val}` : val}
                      </span>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
