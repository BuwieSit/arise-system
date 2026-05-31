import { useEffect } from 'react';
import { useSystemStore } from '../store/useSystemStore';
import { useNotifications } from '../hooks/useNotifications';
import { AlertCircle, Loader2 } from 'lucide-react';

export const PenaltyZone = () => {
  const { isPenaltyActive, checkPenalty } = useSystemStore();
  const { triggerHaptic, sendNotification } = useNotifications();
  const timeLeft = '04:00:00';

  useEffect(() => {
    if (isPenaltyActive) {
      triggerHaptic([500, 200, 500]);
      sendNotification("PENALTY ZONE ACTIVATED", "You have failed to complete the daily quest. Survival is the only metric.");
    }
  }, [isPenaltyActive]);

  useEffect(() => {
    const timer = setInterval(() => {
      checkPenalty();
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [checkPenalty]);

  if (!isPenaltyActive) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-monolith flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-system-alert/5 animate-pulse pointer-events-none"></div>
      
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-system-alert blur-2xl opacity-20 animate-pulse"></div>
        <AlertCircle size={80} className="text-system-alert relative z-10 animate-bounce" />
      </div>

      <h1 className="text-4xl md:text-6xl font-black text-system-alert mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(255,0,85,0.6)]">
        PENALTY ZONE
      </h1>
      
      <p className="font-orbitron text-monolith-text/60 max-w-md mb-12 text-sm leading-relaxed tracking-widest uppercase">
        Inactivity has triggered the system's defensive protocol. All features are locked until the survival period concludes.
      </p>

      <div className="bg-shadow-slate border border-system-alert/30 p-8 rounded-lg mb-12 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-system-alert/20">
           <div className="h-full bg-system-alert animate-[shimmer_2s_infinite] w-1/3"></div>
        </div>
        <span className="text-[10px] text-system-alert font-orbitron block mb-2 tracking-[0.3em]">REMAINING SURVIVAL TIME</span>
        <span className="text-5xl font-mono font-bold text-white tracking-widest">{timeLeft}</span>
      </div>

      <div className="flex items-center space-x-3 text-system-alert font-orbitron text-xs animate-pulse">
        <Loader2 className="animate-spin" size={16} />
        <span className="tracking-widest">SYSTEM MONITORING ACTIVE</span>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};
