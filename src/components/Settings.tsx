import { useSystemStore } from '../store/useSystemStore';
import { Volume2, VolumeX, Smartphone, EyeOff, Eye, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmationModal } from './ConfirmationModal';

export const Settings = () => {
  const { settings, updateSettings, rebirth } = useSystemStore();
  const [showRebirthModal, setShowRebirthModal] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="border-l-4 border-ethereal-blue pl-4 mb-8">
        <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">System Preferences</h2>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Calibrating hunter interface parameters</p>
      </div>

      {/* Hardware Hooks */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Hardware Integration</h3>
        
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => handleToggle('sfxEnabled')}
            className={`glass-panel p-5 flex items-center justify-between group transition-all duration-300 border-2 ${settings.sfxEnabled ? 'border-ethereal-blue/30' : 'border-white/5'}`}
          >
            <div className="flex items-center space-x-4">
               <div className={`p-3 rounded bg-monolith border border-white/5 ${settings.sfxEnabled ? 'text-ethereal-blue' : 'text-gray-600'}`}>
                 {settings.sfxEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
               </div>
               <div className="text-left">
                  <p className="text-sm font-bold text-white uppercase tracking-tighter">System Audio Feedback</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">Toggle immersive acoustic response</p>
               </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors duration-500 ${settings.sfxEnabled ? 'bg-ethereal-blue' : 'bg-gray-800'}`}>
               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings.sfxEnabled ? 'left-7' : 'left-1'}`}></div>
            </div>
          </button>

          <button 
            onClick={() => handleToggle('hapticEnabled')}
            className={`glass-panel p-5 flex items-center justify-between group transition-all duration-300 border-2 ${settings.hapticEnabled ? 'border-ethereal-blue/30' : 'border-white/5'}`}
          >
            <div className="flex items-center space-x-4">
               <div className={`p-3 rounded bg-monolith border border-white/5 ${settings.hapticEnabled ? 'text-ethereal-blue' : 'text-gray-600'}`}>
                 <Smartphone size={20} />
               </div>
               <div className="text-left">
                  <p className="text-sm font-bold text-white uppercase tracking-tighter">Haptic Pulse Feedback</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">Biometric vibration on task completion</p>
               </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors duration-500 ${settings.hapticEnabled ? 'bg-ethereal-blue' : 'bg-gray-800'}`}>
               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings.hapticEnabled ? 'left-7' : 'left-1'}`}></div>
            </div>
          </button>

          <button 
            onClick={() => handleToggle('streamerMode')}
            className={`glass-panel p-5 flex items-center justify-between group transition-all duration-300 border-2 ${settings.streamerMode ? 'border-necrotic-purple/30' : 'border-white/5'}`}
          >
            <div className="flex items-center space-x-4">
               <div className={`p-3 rounded bg-monolith border border-white/5 ${settings.streamerMode ? 'text-necrotic-purple' : 'text-gray-600'}`}>
                 {settings.streamerMode ? <EyeOff size={20} /> : <Eye size={20} />}
               </div>
               <div className="text-left">
                  <p className="text-sm font-bold text-white uppercase tracking-tighter">Streamer Privacy Filter</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">Obfuscate sensitive biometric telemetry</p>
               </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors duration-500 ${settings.streamerMode ? 'bg-necrotic-purple' : 'bg-gray-800'}`}>
               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings.streamerMode ? 'left-7' : 'left-1'}`}></div>
            </div>
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4 pt-10 border-t border-white/5">
        <h3 className="text-xs font-black text-system-alert uppercase tracking-widest mb-4">Forbidden Protocols</h3>
        
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => setShowRebirthModal(true)}
            className="bg-system-alert/5 border-2 border-system-alert/20 p-6 rounded-xl flex items-center justify-between group hover:bg-system-alert/10 hover:border-system-alert/50 transition-all duration-500"
          >
            <div className="flex items-center space-x-4">
               <div className="p-3 rounded bg-monolith border border-system-alert/30 text-system-alert group-hover:scale-110 transition-transform">
                 <RefreshCw size={24} />
               </div>
               <div className="text-left">
                  <p className="text-base font-black text-white uppercase tracking-tighter">Initialize Rebirth Protocol</p>
                  <p className="text-[10px] text-system-alert font-bold uppercase tracking-widest mt-1 opacity-70">Warning: Permanent structure reset</p>
               </div>
            </div>
            <Trash2 size={20} className="text-system-alert opacity-40 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </section>

      {/* Version Info */}
      <div className="text-center pt-10 opacity-30">
         <p className="font-orbitron text-[8px] uppercase tracking-[0.5em] text-gray-500">
           System Core 3.2.0.4 — [Synchronized]
         </p>
      </div>

      <ConfirmationModal 
        isOpen={showRebirthModal}
        onClose={() => setShowRebirthModal(false)}
        onConfirm={rebirth}
        isDangerous={true}
        requireInput="ARISE"
        title="Forbidden Sacrifice Metric"
        message="This action will terminate your current physical matrix. All levels, attributes, and inventory items will be purged. Your logs will remain as a testament to your previous life. Are you prepared to ARISE again from Level 1?"
        confirmText="Finalize Sacrifice"
      />
    </div>
  );
};
