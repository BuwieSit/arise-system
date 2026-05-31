# Arise: The System — Advanced Feature Expansion & Structural Architecture

## 1. Tactical Interface Overhaul & High-Visibility Typography

To fix scaling issues where critical numeric fields or system updates feel unnoticeable on small viewports, the application enforces a strict high-contrast font scale. Elements no longer rely on micro-copy layout conventions.

### Typography & Hierarchy Matrix

| Element Type | Old Scaling | New Tailwind Scaling | Applied Styling Constraints |
| :--- | :--- | :--- | :--- |
| **System Alert / Rank Text** | `text-xs` | `text-sm md:text-base font-black tracking-widest` | Uppercase tracking, clear background fills, glow shadows. |
| **Numeric Attribute Values** | `text-sm` | `text-xl md:text-2xl font-black text-[#00D2FF]` | Bold numerical readouts with sharp drop-shadow rendering. |
| **Quest Countdown Timers** | `text-sm` | `text-2xl md:text-4xl font-black tabular-nums` | Blinking animation cycles when critically low, vibrant red/blue. |
| **System Log Readouts** | `text-xs` | `text-sm font-mono leading-relaxed` | Deep contrast text against dark backdrops for easy reading. |

---

## 2. Dynamic Splash Screen (The Awakening Phase)

Before mounting the dashboard framework, the application initializes an automated hardware-check loading screen to establish the *Solo Leveling* theme immediately upon launching the PWA.

+---------------------------------------------+
   |                                             |
   |               [ SYSTEM ICON ]               |
   |                                             |
   |              ARISE: THE SYSTEM              |
   |                                             |
   |       Connecting to the Great Gate...       |
   |         [████████████████░░░░░░] 74%        |
   |                                             |
   +---------------------------------------------+


   ### Splash Screen Rules
1. **Asset Caching:** Pre-cached via Service Worker to ensure instant display even during offline launching states.
2. **Telemetry Validation:** While active, the loader initializes database validation cycles, checking historic date transitions to determine if a day was skipped (triggering the Penalty Zone before the dashboard mounts).

---

## 3. Dynamic Quest Mechanics & Adaptive Core Loops

### A. Modular Training Selection
Players are no longer bound to a generic tracking sheet. The interface features an optimization tray allowing Hunters to select a **Single-Focus Training Deck** (e.g., Pure Running Focus) or build a custom array.

### B. Difficulty Tuning Configuration
A persistent configuration profile handles real-time scalar adjustments across task metrics, countdown timers, and reward payouts.

| Difficulty Mode | Task Metric Multiplier | Active Timer Constraints | Reward Base Scalar |
| :--- | :--- | :--- | :--- |
| **Easy** | $0.5\times$ base values | Relaxed (No passive drain) | $0.5\times$ base XP & Points |
| **Medium** | $1.0\times$ base values | Standard 24-Hour window | $1.0\times$ base XP & Points |
| **Hard** | $1.5\times$ base values | Strict Window (Task dependent) | $1.5\times$ base XP & Points |
| **BOSS Mode** | $3.0\times$ base values | High-velocity countdowns | $3.0\times$ XP + Rare Relic Items |

### C. Active Moving Timers (The Real-Time Countdown)
Timers are no longer static text strings updated on refreshes. They must run via live, high-frequency react-state intervals down to the millisecond. If a quest difficulty dictates a 45-minute completion window for a 5km run, the app counts down visibly: `00:44:59:99`.

---

## 4. Multi-Dimensional Health Matrix (Mental, Physical, & Psychological)

To build sustainable daily structure, "The System" tracks minor daily routines across three wellness categories. These yield minor rewards, matching their lightweight execution difficulty.

### 1. Physical Wellness Deck (The Vessel)
*   **Target Activities:** Hydration tracking (Drink 3L of water), posture checks, stretching micro-sessions.
*   **Rewards:** $+5 \text{ XP}$, minimal Vitality progress increments.

### 2. Mental & Cognitive Deck (The Mind)
*   **Target Activities:** Focused breathing exercises, complete a 10-minute meditation lock, document gratitude lines within the log ledger.
*   **Rewards:** $+5 \text{ XP}$, minimal Intelligence progress increments.

### 3. Psychological / Discipline Deck (The Will)
*   **Target Activities:** Consumption checkmarks (Eat 3 clean meals spaced cleanly, zero processed sugars), sleep schedule alignment windows.
*   **Rewards:** $+10 \text{ XP}$, minimal Sense progress increments.

---

## 5. Screen Component Upgrades

### A. Enhanced Quest Log
*   **Active Target Trackers:** High-visibility text cards highlighting current velocities.
*   **Contextual AI Injections:** A clean interface node parsing data fields directly to the serverless backend function, providing clear diagnostic reviews of your active training configuration.

### B. Upgraded Inventory (The Vault)
*   **Consumables Shelf:** Store logic allowing players to use high-grade potions to instantly extend active quest timers by 30 minutes when in a pinch.
*   **Equipped Stat Shards:** Visual relic slots for displaying special rewards unlocked by successfully surviving intense **BOSS Mode** windows.

### C. Enhanced System Logs (The Ledger)
*   **Performance Metrics:** Clear text entries mapping real-time logs of precisely how long a specific quest took to complete.
*   **Historical Diagnostic Storage:** Retains a scrolling archive of completed training configurations, making it clean and readable for your Gemini CLI engine to parse during updates.

---

## 6. High-Visibility Tailwind Layout Core (`EnhancedDashboard.jsx`)

```jsx
import React, { useState, useEffect } from 'react';

export default function EnhancedDashboard() {
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(2700); // 45 Minute Moving Countdown in Seconds
  const [difficulty, setDifficulty] = useState('Medium');

  // Splash Screen Simulation Look
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Moving Timer Loop
  useEffect(() => {
    if (loading || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [loading, timeLeft]);

  const formatTimer = (seconds) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#040814] flex flex-col items-center justify-center z-50 p-6">
        <div className="w-24 h-24 rounded-full border-4 border-[#00D2FF]/20 border-t-[#00D2FF] animate-spin mb-6 shadow-[0_0_20px_rgba(0,210,255,0.3)]"></div>
        <h1 className="font-mono text-2xl md:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] to-[#7000FF] animate-pulse">
          INITIALIZING AWAKENING...
        </h1>
        <p className="font-mono text-sm text-gray-500 mt-2 tracking-wide">Syncing core biometric matrices...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040814] text-[#E2E8F0] font-sans antialiased pb-24">
      
      <header className="bg-[#0B1528] border-b-2 border-[#00D2FF]/30 p-4 sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="font-mono text-2xl md:text-3xl font-black tracking-widest text-white drop-shadow-[0_0_12px_rgba(0,210,255,0.6)]">
            ARISE: THE SYSTEM
          </h1>
          
          <div className="flex items-center space-x-2 bg-[#040814] p-1.5 rounded-lg border border-gray-800">
            {['Easy', 'Medium', 'Hard', 'BOSS'].map((mode) => (
              <button
                key={mode}
                onClick={() => setDifficulty(mode)}
                className={`px-3 py-1 rounded font-mono text-xs md:text-sm font-black transition-all duration-200 ${
                  difficulty === mode 
                    ? 'bg-[#CC0044] text-white shadow-[0_0_10px_#FF0055]' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      
      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        
        
        <section className="lg:col-span-2 bg-[#0B1528] border-2 border-[#FF0055]/40 rounded-xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(255,0,85,0.1)]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800 pb-4 mb-4 gap-2">
            <div>
              <span className="bg-[#FF0055]/20 border border-[#FF0055] text-[#FF0055] font-mono text-xs font-black px-2.5 py-1 rounded tracking-widest">
                CRITICAL MISSION WINDOW
              </span>
              <h2 className="font-mono text-xl md:text-2xl font-black text-white mt-2">RUNNING INSTANCE FOCUS</h2>
            </div>
            
            <div className="font-mono text-right">
              <span className="text-xs text-gray-400 block tracking-wider">TIME REMAINING</span>
              <span className="text-2xl md:text-4xl font-black text-[#FF0055] drop-shadow-[0_0_10px_rgba(255,0,85,0.4)] tracking-tight">
                {formatTimer(timeLeft)}
              </span>
            </div>
          </div>

          
          <div className="space-y-4">
            <div className="bg-[#040814] p-4 rounded-lg border border-gray-800 flex justify-between items-center">
              <span className="font-mono text-base md:text-lg font-bold text-gray-300">Target Distance</span>
              <span className="font-mono text-2xl md:text-3xl font-black text-[#00D2FF]">4.2 / 10.0 <span className="text-sm font-normal text-gray-500">KM</span></span>
            </div>
          </div>
        </section>

        
        <section className="lg:col-span-1 bg-[#0B1528] border border-gray-800 rounded-xl p-6 shadow-xl">
          <h3 className="font-mono text-sm tracking-widest text-[#00D2FF] uppercase font-black border-l-4 border-[#00D2FF] pl-2 mb-4">
            DAILY LIVING SYSTEM
          </h3>
          <div className="space-y-3">
            {[
              { title: 'Nutritional Intake (3 Clean Meals)', type: 'PSYCH', reward: '+10 XP' },
              { title: 'Hydration Strategy (3 Liters)', type: 'PHYSICAL', reward: '+5 XP' },
              { title: 'Mind Cleansing (10 Min Focus)', type: 'MENTAL', reward: '+5 XP' }
            ].map((task, i) => (
              <div key={i} className="bg-[#040814] p-3.5 rounded-lg border border-gray-900 flex justify-between items-center group hover:border-[#00D2FF]/30 transition-all">
                <div className="space-y-1">
                  <p className="font-sans text-sm md:text-base font-bold text-gray-200">{task.title}</p>
                  <span className="font-mono text-[10px] text-gray-500 tracking-wider bg-gray-900/50 px-1.5 py-0.5 rounded border border-gray-800">{task.type}</span>
                </div>
                <button className="bg-[#00D2FF]/10 text-[#00D2FF] hover:bg-[#00D2FF] hover:text-[#040814] font-mono text-xs font-black px-3 py-2 rounded border border-[#00D2FF]/30 transition-all">
                  {task.reward}
                </button>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}


