# Gemini Rogue: AI-Powered Roguuelike Shooter

## 🚀 Game Concept

**Gemini Rogue** is a dynamic pixel-art roguelike shooter where survival is just the beginning. You are thrown into a relentless arena, battling ever-stronger waves of monstrous foes. Your key to victory lies not just in your skill, but in your ability to harness the power of procedural generation. By defeating elite monsters, you can acquire new, unique, and powerful weapons forged on the fly. Adapt, upgrade, and let a sophisticated procedural system design your arsenal in this ultimate test of survival.

*(Note: The original concept used Google's Gemini AI for weapon generation. This version now features a robust, offline procedural generation system to create unique weapons, ensuring a similar feel of discovery and randomness without an API dependency.)*

---

## 🎮 Gameplay Overview

### Core Loop
1.  **Survive:** Navigate a large, wrap-around map and defend against waves of enemies.
2.  **Level Up:** Defeat monsters to gain XP. Each level-up grants you a choice of three random upgrades to enhance your abilities.
3.  **Upgrade:** Choose from a wide variety of buffs, including passive stat boosts, weapon modifications, and powerful "Cursed" or "Artifact" tier upgrades.
4.  **Loot:** Defeat powerful Elite and Boss monsters to find special weapon drops.
5.  **Evolve:** Picking up these special drops grants you a brand-new, procedurally generated weapon based on your current gear and wave progress. No two generated weapons are the same!
6.  **Repeat:** Face the next, more challenging wave with your new-found power.

### Controls
-   **Desktop:**
    -   **Move:** `W`, `A`, `S`, `D`
    -   **Aim:** Mouse
    -   **Shoot:** Left Mouse Button
    -   **Reload:** `R`
    -   **Switch Weapon:** `1`, `2`, `3`
    -   **Pause / Settings:** `ESC`
-   **Mobile:**
    -   **Move:** On-screen virtual joystick (left side).
    -   **Shoot:** Auto-fire is enabled by default, targeting the nearest enemy.
    -   **Reload / Fire:** On-screen buttons (right side).
    -   **Pause / Settings:** Pause button `❚❚` (top right).

---

## ⚙️ Core Game Systems & Logic

This section provides a deep dive into the underlying mechanics that power the game.

### The Game Loop (`useGameLoop.ts`)
The entire game is driven by a central loop that updates 60 times per second. Each "tick" or frame, the following sequence of events occurs:

1.  **State Initialization:** A new "draft" of the game state is created based on the previous frame's state. This ensures updates are predictable and don't conflict.
2.  **Input Processing:** Player input from keyboard, mouse, and joystick is processed to determine the desired movement vector and shooting state.
3.  **Player AI (Auto-Walk):** If no manual input is detected and Auto-Walk is enabled, the player AI calculates a movement vector.
4.  **Movement & Collision:** The player's final position is calculated using a "slide" collision algorithm (`getSlidingMove`), which prevents getting stuck on obstacles. All entities then wrap around the world boundaries (`handleWrapAround`).
5.  **Shooting Logic:** If the player is shooting (manually or via auto-fire), bullets are created based on the equipped weapon's stats (fire rate, bullet count, damage, etc.). Ammo and reloading state are also updated here.
6.  **AI Processing:**
    -   Each **Monster** on the map is processed through the `monsterAIHandler`, which routes it to its specific AI logic based on its type (e.g., `handleShooterMonsterAI`).
    -   Each friendly **Ally** is processed by `handleAllyAI`.
7.  **Entity Updates & Physics:**
    -   All **Bullets** (player and enemy) are moved according to their velocity.
    -   Collisions are checked between entities:
        -   Player bullets vs. monsters/obstacles.
        -   Enemy bullets vs. player/allies/obstacles.
        -   Player vs. monsters (contact damage).
        -   Explosive barrels vs. player/monsters.
8.  **Barrel Processing (`processExplosiveBarrels`):** A dedicated function checks if any barrels have been triggered. If so, it creates explosion entities and calculates area-of-effect damage.
9.  **State Cleanup:**
    -   Entities with health at or below zero are marked for removal or enter a "dying" state (for animations).
    -   Expired entities (bullets at max range, temporary effects, etc.) are removed from the state.
10. **Pickup Collection:** The player's position is checked against all pickups (XP gems, weapons, health packs).
11. **Wave Management:** The game checks if the conditions for the next wave or boss spawn have been met. If so, it updates the wave counter and spawns new enemies.
12. **Camera Update:** The camera smoothly follows the player's position.
13. **Final State Commit:** The fully processed "draft" state becomes the new official `gameState`, triggering a re-render of the game world.

### Procedural Weapon Generation (`services/geminiService.ts`)
This is a key feature, now handled by a powerful offline system. When an elite or boss monster is defeated, `generateUpgradedWeapon` is called.

**Method:**
1.  **Baseline:** It takes the player's currently equipped weapon as a starting point.
2.  **Power Scaling:** It calculates a number of "stat points" to distribute based on the current `wave` number. Higher waves grant more points, leading to more powerful weapons.
3.  **Randomized Upgrades:** It iterates through the stat points, each time randomly selecting a stat to improve (e.g., damage, fire rate, clip size, crit chance). The magnitude of the improvement is also randomized within a small range.
4.  **Guaranteed Progression:** To ensure every new weapon feels like an upgrade, it enforces a minimum 10% damage increase and a slight fire rate boost over the baseline weapon, regardless of the random rolls.
5.  **Name Generation:** A new, thematic name is created by randomly combining a prefix (e.g., "Void-forged", "Infernal") and a suffix (e.g., "Annihilator", "Blaster") from predefined lists (`weaponNames.ts`).
6.  **Quality Recalculation:** A `quality` score is recalculated based on a weighted formula of its core stats. This score determines its rarity and display color in the UI. The new weapon's quality is guaranteed to be higher than the old one.
7.  **Final Assembly:** The new stats, name, color, and recalculated quality are assembled into a new `Weapon` object, which is then dropped into the game world for the player to pick up.

### Leveling, Upgrades & Artifacts (`data/upgrades.ts`)
-   **Leveling:** When the player collects enough XP from gems, the game pauses and enters the `isLevelingUp` state.
-   **Choices:** The player is presented with three randomly selected `UpgradeChoice` objects.
-   **Tiers:**
    -   **Standard:** Common, straightforward stat boosts (`PREDEFINED_UPGRADDERS`).
    -   **Cursed:** High-risk, high-reward choices that offer a massive bonus in one area at the cost of a significant penalty in another (`CURSED_UPGRADES`).
    -   **Artifacts:** Extremely rare, game-changing upgrades that can fundamentally alter gameplay (e.g., making all hits critical, or adding a life-steal effect) (`ARTIFACT_UPGRADES`).
-   **Application (`handleLevelUpSelect`):** When a choice is made, its `effects` array is processed, directly modifying the player's stats or weapon properties.

### Persistent Progression (The Card System)
-   **Earning:** Players have a small chance to earn a Card Pack when defeating any enemy.
-   **Opening:** In the `CardManagementScreen`, players can open packs to receive three random cards, with rarities weighted towards common.
-   **Inventory:** All collected cards are stored in the player's profile in `localStorage`.
-   **Equipping:** Before a run, players can equip up to 5 cards. The effects of these cards are applied to the player's initial stats when a new game begins in `getInitialState`.

---

## 🧠 AI Behavior Deep Dive

The game features distinct AI logic for the player, allies, and a wide variety of monsters.

### Player Co-Pilot (Auto-Walk - `playerAI.ts`)
When enabled, this AI takes control of player movement with a clear set of priorities:
1.  **Evasion (Highest Priority):**
    -   **Breakout:** If a monster gets too close (within 150 pixels), the AI will immediately move directly away from it for a short duration (`AI_BREAKOUT_DURATION`).
    -   **Unstuck:** If the player's position hasn't changed for a brief period (`AI_JITTER_STUCK_TIME`), the AI assumes it's stuck and moves in a random direction to free itself.
2.  **Resource Collection (High Priority):**
    -   If health is not full, it targets the nearest **Health Pack**.
    -   If shields are not full, it targets the nearest **Shield Pack**.
3.  **Looting (Medium Priority):**
    -   It will move towards **Treasure Chests** to gain buffs.
    -   It will move towards **Weapon Drops** to upgrade its arsenal.
4.  **XP Collection (Standard Priority):** It targets the nearest **Experience Gem**.
5.  **Combat (Default Behavior):**
    -   If no higher-priority targets exist, it engages the nearest monster using **kiting logic**.
    -   It tries to maintain an optimal distance (200-350 pixels).
    -   If too close, it retreats. If too far, it advances. At optimal range, it **strafes** (moves perpendicular to the target) to be harder to hit.
6.  **Wandering (Lowest Priority):** If there are no enemies or pickups, it moves in a random direction to explore the map.

### Ally AI (`allyAI.ts`)
Friendly allies provide support and have their behavior determined by a selected profile:
-   **Targeting:** An ally always targets the closest monster it has a clear **Line of Sight** to. If no monster is visible, it moves towards the nearest one, even if it's behind a wall. If no monsters are present at all, it moves towards the player to regroup.
-   **Behavior Profiles:**
    -   `resolute_recruit`: A balanced approach. Moves towards the enemy but tries to keep a moderate distance.
    -   `evasion_first`: A defensive style. Prioritizes retreating if enemies get too close and strafing while firing.
    -   `daring_breakout`: A highly aggressive style. Will always attempt to close the distance to the enemy.

### Monster AI (`monsterAIHandler.ts`)
This is a central router that calls the specific AI logic for each monster type.

-   **Normal / Elite / Minion / Bloater / Lich Guard:**
    -   **Logic:** The simplest AI. They identify the closest target (player or ally) and move directly towards it. Their threat comes from their numbers, speed, or durability.

-   **Shooter / Shotgun Shooter:**
    -   **Logic:** A tactical ranged AI. They check for Line of Sight (`isLineOfSightClear`).
    -   If they can't see a target, they move towards the player.
    -   If they can see a target, they use kiting logic similar to the player's AI, retreating if too close and strafing at optimal range.
    -   They only fire when their weapon cooldown is ready and they have a clear shot.

-   **Healer:**
    -   **Logic:** A support AI. Its priority is to find another monster that is below 80% health.
    -   If an injured ally is found, it moves towards them and heals them when in range.
    -   If no monsters need healing, it actively **runs away** from the player.

-   **Summoner:**
    -   **Logic:** A "controller" type. It constantly runs away from the player.
    -   Every 5 seconds, it spawns a new `minion` monster to swarm the player.

-   **Wisp:**
    -   **Logic:** An elusive, magical-style AI.
    -   It teleports to a new random location every ~4 seconds, becoming briefly invisible.
    -   After reappearing, it charges for 1 second, then fires a slow-moving **homing projectile** that tracks the player.

-   **Boss:**
    -   **Logic:** The most complex AI, using a state machine and health-based phases.
    -   **Phases:** At 75% and 40% health, the boss enters a new phase, becoming briefly invincible and unlocking more dangerous attack patterns.
    -   **States:**
        -   `hesitate`: A brief pause between attacks to choose the next one.
        -   `barrage`: Fires a continuous spiral of projectiles.
        -   `charging`: Stands still for 1.5 seconds, signaling a dash.
        -   `dashing`: Moves at high speed towards the player's last known location.
        -   `throwing`: Hurls explosive barrels with an arcing trajectory.
    -   **Independent Spawning:** The boss also periodically spawns `minion` monsters, independent of its current attack state.

## 🛠️ Technology Stack

-   **Core Framework:** React 19 with Hooks
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS
-   **Development Environment:** Vite-based (provided by the web platform)

---

Good luck, and may the procedural generation be ever in your favor!
