import { useSystemStore } from '../store/useSystemStore';
import { PackageOpen, Sparkles, Shield } from 'lucide-react';
import type { ItemRarity } from '../types/features';

const rarityColors: Record<ItemRarity, string> = {
  COMMON: 'border-gray-500 text-gray-500 bg-gray-500/10',
  UNCOMMON: 'border-green-500 text-green-500 bg-green-500/10',
  RARE: 'border-ethereal-blue text-ethereal-blue bg-ethereal-blue/10',
  EPIC: 'border-necrotic-purple text-necrotic-purple bg-necrotic-purple/10',
  LEGENDARY: 'border-yellow-500 text-yellow-500 bg-yellow-500/10',
};

export const Inventory = () => {
  const { inventory, useItem } = useSystemStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-l-2 border-ethereal-blue pl-2 mb-4">
        <h2 className="text-xs text-ethereal-blue font-bold">Inventory & Armory</h2>
        <span className="text-[10px] font-orbitron text-gray-500">{inventory.length} / 20 SLOTS USED</span>
      </div>

      {inventory.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {inventory.map((item) => (
            <div 
              key={item.id}
              className={`glass-panel p-4 relative overflow-hidden group hover:neon-border-blue transition-all duration-300 flex flex-col items-center text-center cursor-pointer`}
              onClick={() => useItem(item.id)}
            >
              <div className={`absolute top-0 right-0 w-8 h-8 opacity-20 bg-current ${rarityColors[item.rarity].split(' ')[1]}`} style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
              
              <div className="mb-3 p-3 bg-monolith/50 rounded-lg border border-white/5 relative group-hover:scale-110 transition-transform duration-300">
                <PackageOpen size={24} className={rarityColors[item.rarity].split(' ')[1]} />
                {item.quantity > 1 && (
                  <span className="absolute -bottom-1 -right-1 bg-ethereal-blue text-monolith text-[8px] font-black px-1 rounded border border-monolith">
                    x{item.quantity}
                  </span>
                )}
              </div>

              <span className={`text-[8px] font-orbitron font-black px-1.5 py-0.5 rounded border mb-2 uppercase tracking-tighter ${rarityColors[item.rarity]}`}>
                {item.rarity}
              </span>

              <h3 className="text-[10px] font-bold text-white mb-1 line-clamp-1">{item.name}</h3>
              <p className="text-[8px] text-gray-500 line-clamp-2 leading-tight">{item.description}</p>
              
              {item.isConsumable && (
                <div className="mt-3 w-full pt-2 border-t border-white/5 flex justify-center">
                  <span className="text-[8px] font-orbitron text-ethereal-blue/60 group-hover:text-ethereal-blue transition-colors">USE ITEM</span>
                </div>
              )}
            </div>
          ))}
          
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 4 - inventory.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="glass-panel border-dashed border-gray-800 opacity-20 flex items-center justify-center aspect-square">
               <div className="w-4 h-4 rounded-full border border-gray-700"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-10 flex flex-col items-center justify-center text-center opacity-40">
           <PackageOpen size={32} className="text-gray-600 mb-2" />
           <p className="font-orbitron text-[10px] tracking-widest uppercase">Inventory Empty</p>
        </div>
      )}

      {/* Item Lore / Buff Legend */}
      <div className="bg-shadow-slate/40 border border-white/5 rounded p-4 font-orbitron">
        <h4 className="text-[8px] text-gray-500 uppercase tracking-widest mb-3">Item Effects Legend</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Sparkles size={12} className="text-ethereal-blue" />
            <span className="text-[9px] text-gray-400">Stat Boost: Increases physical/mental attributes.</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield size={12} className="text-system-alert" />
            <span className="text-[9px] text-gray-400">Recovery: Resets failed daily quest criteria.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
