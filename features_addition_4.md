+-----------------------------------------------------------------------+
|                            THE SYSTEM EYE                             |
|                                                                       |
|   [SYSTEM WARNING: REBIRTH SEQUENCE REQUIRES ABSOLUTE CONFIRMATION]  |
|   "Are you prepared to return your physical matrix back to Level 1?"  |
|                                                                       |
|                [ ACCEPT ]                  [ DECLINE ]                |
+-----------------------------------------------------------------------+

# Blueprint Expansion: Absolute Confirmation Matrix, Automated Attribute Loops, & Audio Architecture

This document maps out the core application logic updates for handling data security, task adjustments, item configurations, automated stat scaling, and the complete auditory experience framework for *Arise: The System*.

---

## 1. Safety-Lock Modals & State Reversals (Fail-Safe Matrix)

To prevent structural deviations, critical user interface state transitions utilize strict confirmation interceptors.

### A. Rebirth Protocol (Level Reset)
* **Trigger:** An active button component located inside the core Hunter Profile layout workspace.
* **Behavior:** Renders a full-screen, high-contrast interceptor modal. The player must explicitly type the string **"ARISE"** into a dedicated verification input field to unlock the confirmation trigger.
* **Execution Effect:** Instantly resets the global Player Level back to `1`, wipes current base attributes to archetype baselines, and clears active inventory arrays. Historical logs are preserved within the audit ledger to track cumulative run metrics.

### B. Difficulty Shift Penalties
* **Trigger:** Interacting with any of the target difficulty parameters (Easy, Medium, Hard, BOSS Mode) located inside the persistent navigation panel.
* **Behavior:** Intercepts the request with a warning modal detailing active penalty metrics:
  > ⚠️ **CRITICAL SYSTEM ALERT:** Changing difficulty parameters mid-cycle will instantly terminate your active instances. All current tracking data for today's active tasks will be completely deleted.
* **Execution Effect:** Erases current active quest entries, resets daily metrics to zero, and forces the serverless Gemini backend layer to generate a brand-new set of directives matching the updated difficulty scalar.

### C. The Misclick Safeguard (Task Undo Action)
* **Trigger:** Clicking a checkbox component that is already marked as complete.
* **Behavior:** Provides fluid tracking recovery. If a user marks a task complete by mistake, they can click it again within a 5-minute grace window to toggle it back to an open state.
* **Execution Effect:** Deducts the experience and attribute points that were instantly awarded upon completion and restores the objective tracker to its active tracking state.

---

## 2. Automated Attribute Allocation (System-Driven Growth)

Players do not manually allocate attribute points. The System monitors active biomechanical and cognitive metrics to calculate adjustments based on task category and difficulty.

### Attribute Mapping Formulas

$$XP_{\text{earned}} = \text{Base Task XP} \times \text{Difficulty Scalar}$$

$$\Delta \text{Stat} = \text{Ceil}(\text{Base Stat Gain} \times \text{Difficulty Scalar})$$

### Stat Allocation Matrix

| Executed Deck Instance | Primary Attribute Gain ($70\%$) | Secondary Attribute Gain ($30\%$) | System Rationale |
| :--- | :--- | :--- | :--- |
| **Running / Agility Focus** | **AGI (Agility)** | **VIT (Vitality)** | Cardiorespiratory adaptation and vascular pacing metrics. |
| **Heavy Resistance Weight Training** | **STR (Strength)** | **VIT (Vitality)** | High muscle-fiber motor recruitment and tissue rebuilding. |
| **Mental Focus / Meditation Lock** | **INT (Intelligence)** | **SEN (Sense)** | Cortisol reduction metrics and neural attention network stabilization. |
| **Nutritional / Discipline Routine** | **VIT (Vitality)** | **INT (Intelligence)** | Metabolic homeostatic consistency and intentional willpower choices. |

---

## 3. Expanded Arsenal (The Advanced Item Vault)

Items are managed in the inventory collection array and feature distinct execution triggers to manipulate real-time session limits.

### High-Tier Consumable Manifest

* **Chronos Pocket Watch (`item_chronos_watch`)**
  * *Rarity:* Epic (Blue Aura)
  * *Effect:* Adds an emergency 30-minute extension block directly onto an active running or dungeon quest countdown timer.
  * *Confirmation Check:* "Activate Chronos Engine to delay instances?"
* **Gate Key of Restructuring (`item_gate_key_refresh`)**
  * *Rarity:* Rare (Purple Aura)
  * *Effect:* Instantly forces the Gemini proxy layer to flush the active daily task array and fetch an entirely new layout profile without breaking active level streaks.
  * *Confirmation Check:* "Reroll your active system quests for today?"
* **Vigor Restoration Brew (`item_vigor_potion`)**
  * *Rarity:* Common (Green Aura)
  * *Effect:* Instantly restores a single failed physical task criteria back into an open state if the countdown window hasn't lapsed yet.

---

## 4. System Settings Blueprint & Auditory Framework

A comprehensive **Settings Page** layout controls core hardware hooks.

### Core Configuration Flags
* **SFX Masters Toggle:** `true / false` (Controls execution sounds)
* **Haptic Pulse Feedback:** `true / false` (Triggers physical vibration components on mobile screens during task updates)
* **Streamer Mode Privacy:** `true / false` (Blurs raw user biometric weights on public interface viewports)

### System Audio Asset Registry
These file paths are explicitly registered within the audio context layer service manager:

* `public/audio/sfx_quest_complete.mp3` - Dispatched when an active quest shifts state to completed.
* `public/audio/sfx_level_up.mp3` - Dispatched when the state container processes a target experience cap breach.
* `public/audio/sfx_warning_alert.mp3` - Loops cleanly during confirmation overlays or whenever countdown indicators drop below a 60-second limit.
* `public/audio/sfx_ui_click.mp3` - Light interactive audio node attached to non-destructive toggle components.
* `public/audio/sfx_rebirth_sequence.mp3` - High-impact, dark atmospheric drone sound played during the final execution of a player reset.

---

## 5. React Code Implementation (`EnhancedDashboardV2.jsx`)

```jsx
import React, { useState, useEffect } from 'react';

export default function EnhancedDashboardV2() {
  const [playerState, setPlayerState] = useState({
    level: 12,
    xp: 450,
    stats: { STR: 18, AGI: 22, VIT: 15, INT: 12, SEN: 14 }
  });

  const [tasks, setTasks] = useState([
    { id: 1, title: '5KM Steady Road Interval Run', type: 'AGI_FOCUS', checked: false, difficulty: 'Hard' },
    { id: 2, title: 'Read 10 Pages of Documentation', type: 'INT_FOCUS', checked: false, difficulty: 'Easy' }
  ]);

  const [activeModal, setActiveModal] = useState(null); // 'rebirth' | 'difficulty' | 'item' | null
  const [difficulty, setDifficulty] = useState('Medium');
  const [pendingDifficulty, setPendingDifficulty] = useState(null);
  const [rebirthConfirmInput, setRebirthConfirmInput] = useState('');

  // Universal SFX Playback Engine
  const playSystemSFX = (fileName) => {
    const audio = new Audio(`/audio/${fileName}`);
    audio.volume = 0.5;
    audio.play().catch(() => console.log("System Audio Node: User interaction required before playback stream triggers."));
  };

  // Safe Check/Uncheck Task Handlers with Automated Stat Gains
  const handleToggleTask = (taskId) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const isChecking = !task.checked;
        
        if (isChecking) {
          playSystemSFX('sfx_quest_complete.mp3');
          // Automatically allocate attribute points based on task context and difficulty scale
          const scalar = task.difficulty === 'Hard' ? 3 : task.difficulty === 'Medium' ? 2 : 1;
          
          setPlayerState(prev => ({
            ...prev,
            xp: prev.xp + (100 * scalar),
            stats: {
              ...prev.stats,
              STR: task.type === 'STR_FOCUS' ? prev.stats.STR + (2 * scalar) : prev.stats.STR + 1,
              AGI: task.type === 'AGI_FOCUS' ? prev.stats.AGI + (2 * scalar) : prev.stats.AGI,
              INT: task.type === 'INT_FOCUS' ? prev.stats.INT + (2 * scalar) : prev.stats.INT,
              SEN: task.type === 'INT_FOCUS' ? prev.stats.SEN + scalar : prev.stats.SEN
            }
          }));
        } else {
          // Task Undo Protocol Logic
          setPlayerState(prev => ({
            ...prev,
            xp: Math.max(0, prev.xp - 100) // Reverses core experience allocation safely
          }));
        }
        return { ...task, checked: isChecking };
      }
      return task;
    }));
  };

  // Difficulty Interceptor Confirmation Execution
  const requestDifficultyChange = (targetMode) => {
    if (targetMode === difficulty) return;
    setPendingDifficulty(targetMode);
    setActiveModal('difficulty');
    playSystemSFX('sfx_warning_alert.mp3');
  };

  const confirmDifficultyChange = () => {
    setDifficulty(pendingDifficulty);
    setActiveModal(null);
    // Destroys and flushes active tasks because of scale re-balancing
    setTasks([
      { id: 3, title: `Regenerated Instance (${pendingDifficulty} Mode Active)`, type: 'STR_FOCUS', checked: false, difficulty: pendingDifficulty }
    ]);
  };

  // Rebirth Initialization Logic Execution
  const executeRebirthProtocol = () => {
    if (rebirthConfirmInput.toUpperCase() !== 'ARISE') return;
    playSystemSFX('sfx_rebirth_sequence.mp3');
    setPlayerState({
      level: 1,
      xp: 0,
      stats: { STR: 10, AGI: 10, VIT: 10, INT: 10, SEN: 10 }
    });
    setActiveModal(null);
    setRebirthConfirmInput('');
  };

  return (
    <div className="min-h-screen bg-[#040814] text-[#E2E8F0] p-6 font-mono relative">
      
      
      <header className="border-b border-gray-800 pb-4 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-white tracking-widest shadow-[0_0_10px_rgba(255,255,255,0.1)]">HUNTER INTERFACE</h1>
          <p className="text-xs text-[#00D2FF] mt-1">LVL: {playerState.level} | STR: {playerState.stats.STR} AGI: {playerState.stats.AGI} INT: {playerState.stats.INT}</p>
        </div>
        <div className="flex gap-2">
          {['Easy', 'Medium', 'Hard', 'BOSS'].map(mode => (
            <button 
              key={mode} 
              onClick={() => requestDifficultyChange(mode)}
              className={`px-3 py-1 text-xs font-black border transition-all ${difficulty === mode ? 'bg-[#CC0044] border-[#FF0055] text-white' : 'border-gray-800 text-gray-500'}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </header>

      
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2 space-y-4">
          <h2 className="text-sm font-black tracking-widest text-[#00D2FF] uppercase border-l-4 border-[#00D2FF] pl-2">ACTIVE DAILY DIRECTIVES</h2>
          {tasks.map(task => (
            <div key={task.id} className="bg-[#0B1528] border border-gray-800 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className={`text-base font-bold ${task.checked ? 'line-through text-gray-600' : 'text-gray-200'}`}>{task.title}</p>
                <span className="text-[10px] bg-gray-900 border border-gray-800 text-gray-400 px-1.5 py-0.5 rounded mt-1 inline-block">{task.type}</span>
              </div>
              <input 
                type="checkbox" 
                checked={task.checked} 
                onChange={() => handleToggleTask(task.id)} 
                className="w-5 h-5 accent-[#00D2FF] cursor-pointer"
              />
            </div>
          ))}
        </section>

        
        <section className="bg-[#0B1528] border border-gray-800 p-6 rounded-lg space-y-6">
          <div>
            <h3 className="text-sm font-black tracking-widest text-red-500 border-l-4 border-red-500 pl-2 uppercase">DANGER ZONE ACTIONS</h3>
            <button 
              onClick={() => { setActiveModal('rebirth'); playSystemSFX('sfx_warning_alert.mp3'); }} 
              className="w-full mt-3 bg-red-950/40 hover:bg-red-900/60 border border-red-700 text-red-400 font-black py-2.5 rounded text-sm transition-all shadow-[0_0_15px_rgba(239,68,68,0.05)]"
            >
              INITIALIZE REBIRTH PROTOCOL
            </button>
          </div>
        </section>
      </main>

      
      {activeModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B1528] border-2 border-red-600 max-w-md w-full p-6 rounded-xl shadow-[0_0_40px_rgba(220,38,38,0.2)]">
            
            {activeModal === 'difficulty' && (
              <>
                <h3 className="text-lg font-black text-white tracking-wider uppercase flex items-center gap-2">⚠️ SYSTEM METRIC RESET</h3>
                <p className="text-sm text-gray-400 mt-3 leading-relaxed">Altering difficulty to <span className="text-red-500 font-bold">{pendingDifficulty}</span> will force immediate closing operations on current activities. Active challenge multipliers will break.</p>
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-xs border border-gray-700 rounded text-gray-400 font-bold hover:bg-gray-800">ABORT</button>
                  <button onClick={confirmDifficultyChange} className="px-4 py-2 text-xs bg-red-600 border border-red-500 rounded text-white font-black hover:bg-red-700">CONFIRM ALTERATION</button>
                </div>
              </>
            )}

            {activeModal === 'rebirth' && (
              <>
                <h3 className="text-lg font-black text-red-500 tracking-wider uppercase">⚠️ FORBIDDEN SACRIFICE METRIC</h3>
                <p className="text-sm text-gray-300 mt-2 leading-relaxed">This resets your system back to Level 1 and strips base attribute enhancements completely. This action cannot be reversed.</p>
                <div className="mt-4 bg-[#040814] p-3 rounded border border-gray-900">
                  <p className="text-xs text-gray-500 mb-2">Type "ARISE" to authorization entry layer:</p>
                  <input 
                    type="text" 
                    value={rebirthConfirmInput} 
                    onChange={(e) => setRebirthConfirmInput(e.target.value)}
                    placeholder="ARISE" 
                    className="w-full bg-[#0B1528] border border-gray-800 rounded p-2 text-white font-black text-center tracking-widest focus:border-red-600 focus:outline-none"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => { setActiveModal(null); setRebirthConfirmInput(''); }} className="px-4 py-2 text-xs border border-gray-700 text-gray-400 font-bold rounded">CANCEL</button>
                  <button 
                    disabled={rebirthConfirmInput.toUpperCase() !== 'ARISE'} 
                    onClick={executeRebirthProtocol} 
                    className={`px-4 py-2 text-xs font-black rounded border ${rebirthConfirmInput.toUpperCase() === 'ARISE' ? 'bg-red-600 border-red-500 text-white hover:bg-red-700' : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'}`}
                  >
                    RESET PERMANENT MATRIX
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}




**IGNORE THIS**

1. **`sfx_quest_complete.mp3`**
   * *Search Keywords:* "Quest clear chimes", "RPG jingle", "retro level clear".
   * *Sound Profile:* A crisp, high-pitched ascending scale or chime confirmation sound (1–2 seconds long).
2. **`sfx_level_up.mp3`**
   * *Search Keywords:* "MMORPG level up fanfare", "achievement unlocked", "power swell".
   * *Sound Profile:* A heavy, rewarding audio chime combining sub-bass hits with bright synthetic elements (2–3 seconds long).
3. **`sfx_warning_alert.mp3`**
   * *Search Keywords:* "Sci-fi error alert", "nuclear threat buzzer", "tactical sonar beep".
   * *Sound Profile:* A clean, looping mechanical or digital beep to emphasize urgent situational choices.
4. **`sfx_ui_click.mp3`**
   * *Search Keywords:* "Mechanical button click", "digital tick text", "UI selection tap".
   * *Sound Profile:* An extremely short, clean, low-impact wooden or metallic tap transient (0.05 seconds long).
5. **`sfx_rebirth_sequence.mp3`**
   * *Search Keywords:* "Cinematic bass drop drop sub", "dark impact drone", "vacuum energy slam".
   * *Sound Profile:* A heavy sub-bass impact that echoes into programmatic silence, simulating an entire data profile structure being wiped out and rebuilt.