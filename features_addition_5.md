# Blueprint Addendum: Automated Growth Mechanics, Anti-Cheating Controls, & Program Modules

This document outlines the system rules for automated attribute growth, anti-spam execution layers, split-tier reward logic, and categorization systems for dynamic training programs.

---

## 1. Automated Stat Allocation & Anti-Spam Safeguards

### A. Automated Attribute Injection
The user has zero manual access to stat points. Growth is determined entirely behind the scenes by "The System Director" mapping active category tags directly to biomechanical and cognitive attributes.

$$\text{Total Points Allocated} = \text{Base Value} \times \text{Program Difficulty Scalar}$$

*   **Physical Tracks (Running, Strength):** Primary injection targets **STR** and **AGI** with minor spillovers into **VIT**.
*   **Mental Tracks (Meditation, Reading):** Primary injection targets **INT** and **SEN**.
*   **Psychological Tracks (Discipline, Routine):** Distributed universally across **VIT** and **SEN** to simulate structural willpower.

### B. Anti-Spam Velocity Limiter (Rate Guard)
To prevent players from repeatedly clicking tasks to artificially inflate levels, farm experience points, or manipulate rewards, a hardware verification gate is enforced:

1.  **The Cooldown Buffer:** Checking a task triggers a strict, localized **10-second processing lock** on that specific checkbox component. During this time, the element is visual-only and disabled.
2.  **The Click Velocity Tracker:** If a user clicks a checkbox element more than **3 times within a 2-second window**, the UI triggers a hidden exception block that locks the entire application view for 15 seconds alongside an authoritative warning prompt: 
    > *[SYSTEM ALERT: Anomalous interaction pattern detected. Core matrix sync suspended temporarily to prevent progression data corruption.]*

### C. Graceful State Rollbacks (The Undo Protocol)
If a user genuinely misclicks a task completion checkbox, they can uncheck it to execute an immediate rollback.
*   **Deduction Processing:** The system recalculates stats and experience levels down to the exact baseline held prior to that specific check execution.
*   **Reward Eviction:** Any item drop or temporary stat boost awarded by that specific task is instantly deleted from the inventory dictionary array.

---

## 2. Multi-Tier Reward Infrastructure

Rewards map cleanly to the complexity and scale of the completed target challenge.

+-------------------------------------------------------------------------+
|                              REWARD MATRIX                              |
+-------------------------------------------------------------------------+
|  [SMALL TASK]  ---> +5-10 XP  | Light Consumables (Fatigue Potions)     |
+-------------------------------------------------------------------------+
|  [LARGE PROGRAM] -> +500+ XP | Rare Relic Gear | Permanent Stat Buffs  |
+-------------------------------------------------------------------------+

### Tier A: Minor Tasks (Daily Routines)
*   **Examples:** Eating 3 meals spaced out, reading 10 pages, tracking hydration.
*   **Rewards:** Low experience point caps ($+5$ to $+15 \text{ XP}$), minor temporary attribute buffs, and low drop-rates for common item consumables like a *Vigor Restoration Brew*.

### Tier B: Major Tasks & Full Program Milestones
*   **Examples:** Completing an entire multi-week structural workout or surviving a intense BOSS-mode workout instance.
*   **Rewards:** Massive permanent experience rewards ($+500 \text{ to } +1500 \text{ XP}$), guaranteed drops for high-tier loot artifacts (e.g., *Chronos Pocket Watch*), and structural multi-point base stat unlocks.

---

## 3. Quest Log Categorization & Training Programs

The Quest Log dashboard interface is divided into cleanly sorted filter tabs matching specialized training blueprints.

### Program Index Manifest

| Category Name | Program Blueprint Title | Included Directives / Exercise Arrays | Complete Program Reward Payload |
| :--- | :--- | :--- | :--- |
| **Physical** | *The Newbie Beginner Workout* | • 15 Min Steady Jogging<br>• 3 Sets of 10 Bodyweight Squats<br>• 3 Sets of Max Push-ups | • $+500 \text{ XP}$<br>• $+5 \text{ STR}$, $+5 \text{ AGI}$, $+3 \text{ VIT}$<br>• $1\times$ *Gate Key of Restructuring* |
| **Mental** | *Cognitive Expansion Phase I* | • 15 Min Focused Deep Breathing<br>• Write a structural journal log entry<br>• No social media consumption before noon | • $+400 \text{ XP}$<br>• $+6 \text{ INT}$, $+4 \text{ SEN}$<br>• $1\times$ *Chronos Pocket Watch* |
| **Psychological** | *Iron Will Discipline Path* | • Drink 3.5L Water<br>• Maintain clean eating (3 full meals, no sugars)<br>• Lock 8 Hours of tracked sleep | • $+600 \text{ XP}$<br>• $+8 \text{ VIT}$, $+4 \text{ SEN}$<br>• $1\times$ *Vigor Restoration Brew* |

---

## 4. React Architecture Implementation (`QuestLogPrograms.jsx`)

```jsx
import React, { useState, useEffect, useRef } from 'react';

export default function QuestLogPrograms() {
  // Global Player Tracking State Container
  const [player, setPlayer] = useState({
    level: 1,
    xp: 0,
    stats: { STR: 10, AGI: 10, VIT: 10, INT: 10, SEN: 10 },
    inventory: []
  });

  const [activeCategory, setActiveCategory] = useState('Physical');
  const [systemLocked, setSystemLocked] = useState(false);
  const [cooldownTasks, setCooldownTasks] = useState({}); // Tracks processing locks per task ID
  
  // Anti-Spam click parameters
  const clickTracker = useRef({ count: 0, lastClickTime: 0 });

  // Mock Data Store representing our target programs
  const programsData = {
    Physical: {
      title: "The Newbie Beginner Workout",
      difficulty: "Easy",
      tasks: [
        { id: "phys_1", text: "15 Minute Steady Jogging", type: "AGI", completed: false },
        { id: "phys_2", text: "3 Sets of 10 Bodyweight Squats", type: "STR", completed: false },
        { id: "phys_3", text: "3 Sets of Maximum Push-up Reps", type: "STR", completed: false }
      ],
      rewards: { xp: 500, stats: { STR: 5, AGI: 5, VIT: 3 }, item: "Gate Key of Restructuring" }
    },
    Mental: {
      title: "Cognitive Expansion Phase I",
      difficulty: "Medium",
      tasks: [
        { id: "ment_1", text: "15 Minute Focused Deep Breathing Session", type: "INT", completed: false },
        { id: "ment_2", text: "Log a clean reflective entry inside the System Ledger", type: "SEN", completed: false },
        { id: "ment_3", text: "Zero phone/social scrolling for the first 2 hours of daylight", type: "INT", completed: false }
      ],
      rewards: { xp: 400, stats: { INT: 6, SEN: 4 }, item: "Chronos Pocket Watch" }
    }
  };

  const [activePrograms, setActivePrograms] = useState(programsData);

  // Velocity Click Monitoring Loop
  const checkSpamVelocity = () => {
    const now = Date.now();
    const timeDelta = now - clickTracker.current.lastClickTime;

    if (timeDelta < 2000) {
      clickTracker.current.count += 1;
    } else {
      clickTracker.current.count = 1; // Reset tracking scale
    }
    
    clickTracker.current.lastClickTime = now;

    if (clickTracker.current.count > 3) {
      setSystemLocked(true);
      setTimeout(() => {
        setSystemLocked(false);
        clickTracker.current.count = 0;
      }, 15000); // 15 Second Lockout Window
      return true;
    }
    return false;
  };

  const handleTaskToggle = (category, taskId) => {
    if (systemLocked) return;
    if (checkSpamVelocity()) return;
    if (cooldownTasks[taskId]) return; // Block input if currently executing processing cycle

    // Engage 10-Second Processing Local Lockout on this task element
    setCooldownTasks(prev => ({ ...prev, [taskId]: true }));
    setTimeout(() => {
      setCooldownTasks(prev => ({ ...prev, [taskId]: false }));
    }, 10000);

    const targetedProgram = activePrograms[category];
    const targetTask = targetedProgram.tasks.find(t => t.id === taskId);
    const isChecking = !targetTask.completed;

    // Deep copy tracking state structures
    const updatedPrograms = { ...activePrograms };
    updatedPrograms[category].tasks = updatedPrograms[category].tasks.map(t => 
      t.id === taskId ? { ...t, completed: isChecking } : t
    );
    setActivePrograms(updatedPrograms);

    if (isChecking) {
      // Small Task Completion Reward Matrix Allocation Logic
      setPlayer(prev => ({
        ...prev,
        xp: prev.xp + 15,
        stats: {
          ...prev.stats,
          STR: targetTask.type === "STR" ? prev.stats.STR + 1 : prev.stats.STR,
          AGI: targetTask.type === "AGI" ? prev.stats.AGI + 1 : prev.stats.AGI,
          INT: targetTask.type === "INT" ? prev.stats.INT + 1 : prev.stats.INT,
          SEN: targetTask.type === "SEN" ? prev.stats.SEN + 1 : prev.stats.SEN
        },
        inventory: Math.random() > 0.7 ? [...prev.inventory, "Vigor Restoration Brew"] : prev.inventory
      }));
    } else {
      // Absolute Undo Protocol: Deducts exact parameters back to base thresholds
      setPlayer(prev => ({
        ...prev,
        xp: Math.max(0, prev.xp - 15),
        stats: {
          ...prev.stats,
          STR: targetTask.type === "STR" ? Math.max(10, prev.stats.STR - 1) : prev.stats.STR,
          AGI: targetTask.type === "AGI" ? Math.max(10, prev.stats.AGI - 1) : prev.stats.AGI,
          INT: targetTask.type === "INT" ? Math.max(10, prev.stats.INT - 1) : prev.stats.INT,
          SEN: targetTask.type === "SEN" ? Math.max(10, prev.stats.SEN - 1) : prev.stats.SEN
        }
      }));
    }
  };

  // Check if all elements within a program are complete to release Tier B rewards
  const handleClaimProgramRewards = (category) => {
    const program = activePrograms[category];
    const allDone = program.tasks.every(t => t.completed);
    
    if (!allDone) return;

    setPlayer(prev => ({
      ...prev,
      xp: prev.xp + program.rewards.xp,
      stats: {
        STR: prev.stats.STR + program.rewards.stats.STR,
        AGI: prev.stats.AGI + program.rewards.stats.AGI,
        VIT: prev.stats.VIT + (program.rewards.stats.VIT || 0),
        INT: prev.stats.INT + (program.rewards.stats.INT || 0),
        SEN: prev.stats.SEN + (program.rewards.stats.SEN || 0)
      },
      inventory: [...prev.inventory, program.rewards.item]
    }));

    // Flush/Reset tasks for that module to prevent infinite metric claiming loop cycles
    const clearedPrograms = { ...activePrograms };
    clearedPrograms[category].tasks = clearedPrograms[category].tasks.map(t => ({ ...t, completed: false }));
    setActivePrograms(clearedPrograms);
  };

  const currentProgram = activePrograms[activeCategory];

  return (
    <div className="min-h-screen bg-[#040814] text-[#E2E8F0] p-6 font-mono relative">
      
      
      {systemLocked && (
        <div className="fixed top-4 inset-x-4 bg-red-950 border-2 border-red-600 p-4 rounded-xl z-50 text-center shadow-[0_0_30px_rgba(220,38,38,0.4)] animate-pulse">
          <p className="text-red-400 font-black text-sm tracking-wider">⚠️ COOLDOWN PROTOCOL ENGAGED: UNUSUAL INPUT FLOOD ENCOUNTERED</p>
          <p className="text-xs text-gray-400 mt-1">System connectivity locked for 15 seconds to sync data cleanly.</p>
        </div>
      )}

      
      <section className="bg-[#0B1528] border border-gray-800 p-6 rounded-xl mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(player.stats).map(([statName, val]) => (
          <div key={statName} className="bg-[#040814] p-3 rounded-lg border border-gray-900 text-center">
            <span className="text-xs text-gray-500 block tracking-widest">{statName}</span>
            <span className="text-xl font-black text-[#00D2FF] drop-shadow-[0_0_8px_rgba(0,210,255,0.2)]">{val}</span>
          </div>
        ))}
      </section>

      {/* CATEGORY SWITCHER NAVIGATION BAR */}
      <div className="flex border-b border-gray-800 mb-6 gap-2">
        {Object.keys(activePrograms).map(cat => (
          <button
            key={cat}
            onClick={() => !systemLocked && setActiveCategory(cat)}
            className={`px-5 py-2.5 font-black text-sm tracking-widest transition-all ${activeCategory === cat ? 'border-b-2 border-[#00D2FF] text-white bg-[#00D2FF]/5' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      
      {currentProgram ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          
          <div className="lg:col-span-2 space-y-4">
            <div className="border-l-4 border-[#00D2FF] pl-3 mb-2">
              <h2 className="text-lg font-black text-white">{currentProgram.title}</h2>
              <span className="text-xs text-gray-500">Difficulty Matrix: {currentProgram.difficulty}</span>
            </div>

            {currentProgram.tasks.map(task => {
              const isLocked = cooldownTasks[task.id];
              return (
                <div 
                  key={task.id} 
                  className={`bg-[#0B1528] border p-4 rounded-xl flex justify-between items-center transition-all ${isLocked ? 'opacity-40 border-yellow-600/30' : 'border-gray-800 hover:border-gray-700'}`}
                >
                  <div>
                    <p className={`text-base font-bold ${task.completed ? 'line-through text-gray-600' : 'text-gray-200'}`}>{task.text}</p>
                    <span className="text-[10px] bg-[#040814] px-2 py-0.5 rounded border border-gray-900 text-[#00D2FF] mt-1.5 inline-block font-black">+{task.type} MATRIX</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    disabled={systemLocked || isLocked}
                    onChange={() => handleTaskToggle(activeCategory, task.id)}
                    className="w-6 h-6 accent-[#00D2FF] cursor-pointer rounded bg-[#040814] border-gray-800"
                  />
                </div>
              );
            })}
          </div>

          
          <div className="lg:col-span-1 bg-[#0B1528] border border-gray-800 p-6 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black tracking-widest text-[#00D2FF] border-b border-gray-800 pb-3 uppercase">PROGRAM COMPLETION MATRIX</h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Bonus Experience:</span><span className="font-black text-white">+{currentProgram.rewards.xp} XP</span></div>
                <div className="flex justify-between items-start text-sm">
                  <span className="text-gray-500">Attribute Boosts:</span>
                  <div className="text-right text-[#00D2FF] font-black">
                    {Object.entries(currentProgram.rewards.stats).map(([s, v]) => <div key={s}>+{v} {s}</div>)}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Guaranteed Item Loot:</span><span className="font-black text-purple-400 border border-purple-900 bg-purple-950/20 px-2 py-0.5 rounded text-xs">{currentProgram.rewards.item}</span></div>
              </div>
            </div>

            <button
              onClick={() => handleClaimProgramRewards(activeCategory)}
              disabled={!currentProgram.tasks.every(t => t.completed)}
              className={`w-full font-black py-3 rounded-lg text-sm border tracking-widest transition-all mt-6 ${currentProgram.tasks.every(t => t.completed) ? 'bg-gradient-to-r from-[#00D2FF] to-[#7000FF] border-[#00D2FF] text-white hover:opacity-90 shadow-[0_0_20px_rgba(0,210,255,0.2)]' : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'}`}
            >
              CLAIM CAMPAIGN REWARDS
            </button>
          </div>

        </div>
      ) : (
        <p className="text-gray-500 text-center py-12">No active program matrix configuration detected inside this target category slot.</p>
      )}
    </div>
  );
}