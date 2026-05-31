import { useSystemStore } from '../store/useSystemStore';
import { PackageOpen, Sparkles, Shield, Trash2, Box, Info } from 'lucide-react';
import type { ItemRarity } from '../types/features';

const rarityStyles: Record<ItemRarity, { border: string, bg: string, text: string, glow: string }> = {
  COMMON: { border: 'border-gray-500/30', bg: 'bg-gray-500/5', text: 'text-gray-400', glow: 'shadow-[0_0_15px_rgba(107,114,128,0.2)]' },
  UNCOMMON: { border: 'border-green-500/30', bg: 'bg-green-500/5', text: 'text-green-400', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.2)]' },
  RARE: { border: 'border-ethereal-blue/30', bg: 'bg-ethereal-blue/5', text: 'text-ethereal-blue', glow: 'shadow-[0_0_20px_rgba(0,210,255,0.3)]' },
  EPIC: { border: 'border-necrotic-purple/40', bg: 'bg-necrotic-purple/5', text: 'text-necrotic-purple', glow: 'shadow-[0_0_25px_rgba(112,0,255,0.4)]' },
  LEGENDARY: { border: 'border-yellow-500/50', bg: 'bg-yellow-500/5', text: 'text-yellow-400', glow: 'shadow-[0_0_30px_rgba(234,179,8,0.5)]' },
};

export const Inventory = () => {
  const { inventory, useItem, systemLocked } = useSystemStore();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-l-4 border-ethereal-blue pl-4 mb-8 gap-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">Item Matrix</h2>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">Acquired Tactical Assets</p>
        </div>
        <div className="bg-monolith/50 border border-white/5 rounded-lg px-4 py-2 flex items-center space-x-3">
          <Box size={14} className="text-gray-500" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Storage: {inventory.length} / 50</span>
        </div>
      </div>

      {inventory.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item) => {
            const style = rarityStyles[item.rarity];
            return (
              <div 
                key={item.id} 
                className={`glass-panel p-6 relative overflow-hidden group border-2 transition-all duration-500 ${style.border} ${style.bg} ${style.glow} hover:scale-[1.02]`}
              >
                <div className="absolute top-0 right-0 p-2">
                   <span className={`text-[8px] font-black uppercase tracking-widest ${style.text}`}>{item.rarity}</span>
                </div>

                <div className="flex items-start space-x-4 mb-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 ${style.border} bg-monolith relative group-hover:rotate-6 transition-transform duration-500`}>
                    <PackageOpen className={style.text} size={28} />
                    <div className="absolute -bottom-2 -right-2 bg-white text-monolith text-[10px] font-black w-6 h-6 rounded-lg flex items-center justify-center border-2 border-monolith shadow-lg">
                      x{item.quantity}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-white text-sm uppercase tracking-tight leading-tight group-hover:text-ethereal-blue transition-colors">{item.name}</h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-1 line-clamp-2 leading-relaxed italic">"{item.description}"</p>
                  </div>
                </div>

                {item.attributeBoost && (
                  <div className="mb-6 grid grid-cols-2 gap-2">
                    {Object.entries(item.attributeBoost).map(([stat, val]) => (
                      <div key={stat} className="bg-monolith/60 border border-white/5 px-2 py-1 rounded flex justify-between items-center">
                        <span className="text-[8px] text-gray-600 font-black uppercase">{stat.slice(0, 3)}</span>
                        <span className="text-[9px] text-green-400 font-black font-mono">+{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => useItem(item.id)}
                    disabled={!item.isConsumable || systemLocked}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-orbitron text-[10px] font-black tracking-widest uppercase transition-all duration-300 border-2 ${
                      item.isConsumable 
                        ? 'bg-white text-monolith hover:bg-ethereal-blue hover:text-white hover:border-transparent active:scale-95' 
                        : 'bg-gray-900/50 text-gray-700 border-gray-800 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles size={12} />
                    <span>Synchronize</span>
                  </button>
                  <button className="p-3 rounded-lg border border-white/5 text-gray-700 hover:text-red-500 hover:border-red-500/30 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-32 flex flex-col items-center justify-center text-center space-y-6 border-dashed border-2 border-white/5 opacity-40">
          <div className="w-20 h-20 rounded-full border-4 border-gray-800 flex items-center justify-center text-gray-800">
             <PackageOpen size={40} />
          </div>
          <div>
            <h3 className="font-orbitron text-lg font-black text-gray-600 uppercase tracking-widest">Inventory Null</h3>
            <p className="text-[10px] font-mono text-gray-700 uppercase mt-2 tracking-tighter">Acquire artifacts through mission completion to populate this matrix.</p>
          </div>
        </div>
      )}

      {/* Item Guide Section */}
      <section className="glass-panel p-8 border-white/5 bg-shadow-slate/30">
        <div className="flex items-center space-x-2 mb-6">
          <Info size={16} className="text-ethereal-blue" />
          <h3 className="font-orbitron text-[10px] font-black text-white uppercase tracking-[0.3em]">Asset Compatibility Notes</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="space-y-2">
              <p className="text-[9px] font-black text-ethereal-blue uppercase flex items-center">
                <Shield size={10} className="mr-1.5" /> Stability Items
              </p>
              <p className="text-[10px] text-gray-500 leading-relaxed font-mono">Consumables like "Vigor Brews" can bypass penalty windows and restore corrupted mission instances.</p>
           </div>
           <div className="space-y-2">
              <p className="text-[9px] font-black text-necrotic-purple uppercase flex items-center">
                <Trash2 size={10} className="mr-1.5" /> Deletion Protocol
              </p>
              <p className="text-[10px] text-gray-500 leading-relaxed font-mono">Assets can be discarded to free up storage matrix. This action is irreversible once finalized.</p>
           </div>
           <div className="space-y-2">
              <p className="text-[9px] font-black text-yellow-500 uppercase flex items-center">
                <Sparkles size={10} className="mr-1.5" /> Artifact Stacking
              </p>
              <p className="text-[10px] text-gray-500 leading-relaxed font-mono">Stat-boosting artifacts stack multiplicatively with active training focus bonuses.</p>
           </div>
        </div>
      </section>
    </div>
  );
};
