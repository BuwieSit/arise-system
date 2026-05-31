import { useEffect, useState } from 'react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const interval = 20;
    const increment = 100 / (duration / interval);
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-monolith flex flex-col items-center justify-center z-[200] p-6 text-center">
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-ethereal-blue blur-3xl opacity-20 animate-pulse"></div>
        <div className="w-24 h-24 rounded-full border-4 border-ethereal-blue/20 border-t-ethereal-blue animate-spin relative z-10 shadow-[0_0_20px_rgba(0,210,255,0.3)]"></div>
      </div>

      <h1 className="font-orbitron text-3xl md:text-5xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-ethereal-blue via-white to-necrotic-purple animate-pulse mb-4 drop-shadow-[0_0_15px_rgba(0,210,255,0.5)]">
        ARISE: THE SYSTEM
      </h1>
      
      <div className="w-64 md:w-80 space-y-4">
        <div className="flex justify-between items-end font-mono text-[10px] text-gray-500 uppercase tracking-widest">
           <span>Connecting to the Great Gate...</span>
           <span className="text-ethereal-blue font-bold">{Math.floor(progress)}%</span>
        </div>
        <div className="h-1 w-full bg-shadow-slate rounded-full overflow-hidden border border-white/5">
           <div 
             className="h-full bg-gradient-to-r from-ethereal-blue to-necrotic-purple shadow-[0_0_10px_#00D2FF] transition-all duration-300"
             style={{ width: `${progress}%` }}
           ></div>
        </div>
        <p className="font-orbitron text-[8px] text-gray-600 uppercase tracking-[0.3em] animate-pulse">
          Syncing core biometric matrices...
        </p>
      </div>
    </div>
  );
};
