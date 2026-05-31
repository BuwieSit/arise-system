# Blueprint Addendum: System Log, Inventory, & Quest Tracking

This document outlines the core architecture, state data models, and UI/UX flows for managing the **Quest Log**, **Inventory**, and **System Activity Logs** within the *Arise* gamified fitness ecosystem. These modules provide the tracking layer required for the generative AI ("System Director") to read player history and distribute contextual rewards.

---

## 1. Architecture Overview & Interfacing

These three sub-systems act as a bridge between your local device's database storage and the Generative AI engine.

+-------------------------------------------------------------+
|                     Generative AI Engine                    |
|                (Gemini API / System Director)               |
+------------------------------+------------------------------+
|
Reads historical state  |  Injects custom items/quests
v
+-------------------------------------------------------------+
|                   Application State Layer                   |
+-------------------------------------------------------------+
|                       |                       |
v                       v                       v
+--------------+        +--------------+        +--------------+
|  Quest Log   |        |  Inventory   |        | System Logs  |
| (Active/Hist)|        | (Gear/Buffs) |        | (Raw Audit)  |
+--------------+        +--------------+        +--------------+


---

## 2. Component Blueprints

### A. Quest Log (Mission Command)
The Quest Log manages all active, failed, and completed missions. It displays daily mandatory workouts, weekly long-term raids, and dynamic AI-generated "Instant Dungeons."

#### Core Data Schema
```json
{
  "quest_id": "q_instant_098x",
  "title": "Instant Dungeon: Kinetic Retribution",
  "rank": "B-Rank",
  "type": "AI_GENERATED", 
  "flavor_text": "The System has detected critical atrophy in your lower-body endurance matrices. Clear this localized instance or face structural regression.",
  "objectives": [
    { "description": "Execute 50 explosive bodyweight squats", "target": 50, "current": 0 },
    { "description": "Maintain an elevated heart rate above 135 BPM for 20 mins", "target": 20, "current": 0 }
  ],
  "rewards": {
    "exp": 450,
    "stat_points": { "STR": 2, "VIT": 1 },
    "items": ["item_elixir_01"]
  },
  "time_limit_seconds": 86400,
  "status": "ACTIVE"
}


UI Layout Priorities
The Directives Grid: High-contrast progress bars for tracking real-time sensor variables (e.g., Apple Health / Google Fit streaming outputs vs. target quest values).

The Penalty Timer: A prominent countdown for timed quests, styled with structural red alerts mimicking the Solo Leveling penalty zone prompt.

B. Inventory & Armory
The Inventory houses active gear, vanity cosmetic achievements, and consumable items (e.g., Elixirs, instance keys) acquired through workout streaks.


Core Data Schema
{
  "item_id": "item_elixir_01",
  "name": "High-Grade Fatigue Recovery Elixir",
  "rarity": "RARE",
  "description": "Restores systemic vitality. Consuming this item immediately resets one failed Daily Quest criteria without incurring a Penalty Quest.",
  "is_consumable": true,
  "attributes_boost": {
    "VIT": 0
  },
  "quantity": 3
}


UI Layout Priorities
The Item Grid: A responsive grid containing item slots. Each slot features clear tier highlights reflecting item rarity (e.g., Gray for E-Rank trash loot, Purple for A-Rank Epic relics).

The Stat Inspection Panel: Selecting an item displays its lore, usage logic, and active multiplier values alongside a distinct execution action button.

C. System Audit Logs
The Log ledger records the raw historical data stream of the player's performance. The AI reads this chronologically to spot progression plateaus or sudden drop-offs.

Core Data Schema


{
  "log_id": "log_sys_99812",
  "timestamp": "2026-05-31T15:00:00Z",
  "category": "SYSTEM_EVENT",
  "message": "Player Vincent reached Level 12. Strength matrix optimized (+2 STR).",
  "metadata": {
    "associated_quest_id": "q_daily_0531",
    "raw_sensor_summary": "45mins steady state run, avg HR 142BPM"
  }
}

UI Layout Priorities
Chronological Feed: A scannable list view showing recent milestones, failures, and item status adjustments.

Filtering Architecture: Simple filtering tabs to separate raw biometric data sync messages from narrative achievements.


3. Cross-Module Data Integrations

+----------------------------------------+
        |  Player completes Dungeon Quest criteria|
        +-------------------+--------------------+
                            |
                            v
        +-------------------+--------------------+
        |  System Logs appends:                  |
        |  "Quest Clear: Kinetic Retribution"    |
        +-------------------+--------------------+
                            |
                            v
        +-------------------+--------------------+
        |  Inventory pushes:                     |
        |  "High-Grade Fatigue Recovery Elixir"  |
        +----------------------------------------+


    1. State Upgrades: When an active entity within the Quest Log moves to COMPLETED, the runtime system evaluates the payload variables inside the rewards object block.

    2. Inventory Appending: Any strings or object references discovered in the reward tier's items list trigger an append command to the player's active storage dictionary.

    3. Audit Registration: Concurrently, a structured logging event transaction is dispatched to the raw audit ledger to preserve context history for subsequent AI prompt windows.