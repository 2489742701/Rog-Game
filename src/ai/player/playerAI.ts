import type { Player, AutoWalkState, ExperienceGem, Monster, Obstacle, ExplosiveBarrel, Vector2D, HealthPack, ShieldPack, TreasureChest, WeaponDrop } from '../../types';
import { getSlidingMove, randomInRange, calculateWrappedDistanceVector } from '../../utils';
import { AI_JITTER_STUCK_TIME, AI_BREAKOUT_DURATION } from '../../constants';

/**
 * @file This file contains the AI logic for the player's "Auto-Walk" feature.
 * It governs how the player character navigates and behaves when not under manual control.
 */

/**
 * Handles the player's automatic movement AI.
 *
 * This function determines the player's movement vector when Auto-Walk is enabled.
 * The AI has a clear priority list for its actions.
 *
 * AI Behavior Hierarchy:
 * 1.  **Unstuck/Breakout:** If stuck or an enemy is too close, perform an evasive maneuver. This is top priority.
 * 2.  **Collect Health/Shields:** If missing health or shields, move towards the nearest health or shield pack.
 * 3.  **Collect Treasure Chests:** Move towards treasure chests to gain temporary buffs.
 * 4.  **Collect Weapons:** Move towards the nearest weapon drop to acquire new gear.
 * 5.  **Collect Gems:** Move towards the nearest experience gem.
 * 6.  **Engage Monsters (Kiting):** If no pickups are available, engage the nearest monster using intelligent kiting logic to maintain optimal distance.
 * 7.  **Wander:** If no targets are available, move around randomly to explore.
 *
 * @param player The current player object.
 * @param autoWalkState The current state of the auto-walk AI.
 * @param experienceGems An array of all experience gems on the map.
 * @param monsters An array of all monsters on the map.
 * @param allObstacles An array of all obstacles and barrels on the map.
 * @param now The current timestamp (Date.now()).
 * @param healthPacks An array of all health packs on the map.
 * @param shieldPacks An array of all shield packs on the map.
 * @param treasureChests An array of all treasure chests on the map.
 * @param weaponDrops An array of all weapon drops on the map.
 * @returns An object containing the calculated `moveVector` for the player and the `updatedState` for the auto-walk AI.
 */
export const handleAutoWalk = (
    player: Player,
    autoWalkState: AutoWalkState,
    experienceGems: ExperienceGem[],
    monsters: Monster[],
    allObstacles: (Obstacle | ExplosiveBarrel)[],
    now: number,
    healthPacks: HealthPack[],
    shieldPacks: ShieldPack[],
    treasureChests: TreasureChest[],
    weaponDrops: WeaponDrop[]
): { moveVector: Vector2D, updatedState: AutoWalkState } => {
    let updatedState = { ...autoWalkState };
    let moveVector: Vector2D = { x: 0, y: 0 };

    // --- Stuck Detection & Unstucking Logic ---
    if (updatedState.lastPosition && Math.abs(player.position.x - updatedState.lastPosition.x) < 0.1 && Math.abs(player.position.y - updatedState.lastPosition.y) < 0.1) {
        updatedState.stuckTime = (updatedState.stuckTime || 0) + (1000 / 60);
    } else {
        updatedState.stuckTime = 0;
    }
    updatedState.lastPosition = { ...player.position };

    if (updatedState.isUnstucking && now < (updatedState.unstuckUntil || 0)) {
        return { moveVector: updatedState.unstuckDirection || { x: 0, y: 0 }, updatedState };
    }
    updatedState.isUnstucking = false;

    if (updatedState.stuckTime > AI_JITTER_STUCK_TIME && !updatedState.isUnstucking) {
        updatedState.isUnstucking = true;
        updatedState.unstuckUntil = now + 300;
        const randomAngle = Math.random() * Math.PI * 2;
        updatedState.unstuckDirection = { x: Math.cos(randomAngle), y: Math.sin(randomAngle) };
        return { moveVector: updatedState.unstuckDirection, updatedState };
    }
    
    // --- Breakout Logic (evade close enemies) ---
     if (updatedState.isBreakingOut && now < (updatedState.breakoutUntil || 0)) {
        return { moveVector: updatedState.breakoutDirection || { x: 0, y: 0 }, updatedState };
    }
    updatedState.isBreakingOut = false;

    const closestEnemy = monsters.reduce((closest, monster) => {
        const vec = calculateWrappedDistanceVector(player.position, monster.position);
        const distSq = vec.x ** 2 + vec.y ** 2;
        if (distSq < (closest.distSq || Infinity)) {
            return { monster, distSq };
        }
        return closest;
    }, { monster: null as Monster | null, distSq: Infinity });

    if (closestEnemy.monster && closestEnemy.distSq < 150 * 150) { // If enemy is within 150 pixels
        updatedState.isBreakingOut = true;
        updatedState.breakoutUntil = now + AI_BREAKOUT_DURATION;
        const vecFromEnemy = calculateWrappedDistanceVector(closestEnemy.monster.position, player.position);
        const dist = Math.sqrt(vecFromEnemy.x*vecFromEnemy.x + vecFromEnemy.y*vecFromEnemy.y);
        if (dist > 0) {
            updatedState.breakoutDirection = { x: vecFromEnemy.x/dist, y: vecFromEnemy.y/dist }; // Move directly away
            return { moveVector: updatedState.breakoutDirection, updatedState };
        }
    }


    // --- Target Selection ---
    const needsHealth = player.health < player.maxHealth;
    const needsShield = player.shield < player.maxShield;

    // Find closest of each type of pickup
    let healthPackTarget: HealthPack | null = null;
    if (needsHealth) {
        let closestHealthPackDistSq = Infinity;
        healthPacks.forEach(pack => {
            const vec = calculateWrappedDistanceVector(player.position, pack.position);
            const distSq = vec.x ** 2 + vec.y ** 2;
            if (distSq < closestHealthPackDistSq) {
                closestHealthPackDistSq = distSq;
                healthPackTarget = pack;
            }
        });
    }

    let shieldPackTarget: ShieldPack | null = null;
    if (needsShield) {
        let closestShieldPackDistSq = Infinity;
        shieldPacks.forEach(pack => {
            const vec = calculateWrappedDistanceVector(player.position, pack.position);
            const distSq = vec.x ** 2 + vec.y ** 2;
            if (distSq < closestShieldPackDistSq) {
                closestShieldPackDistSq = distSq;
                shieldPackTarget = pack;
            }
        });
    }

    let weaponDropTarget: WeaponDrop | null = null;
    if (weaponDrops.length > 0) {
        let closestWeaponDropDistSq = Infinity;
        weaponDrops.forEach(drop => {
            const vec = calculateWrappedDistanceVector(player.position, drop.position);
            const distSq = vec.x ** 2 + vec.y ** 2;
            if (distSq < closestWeaponDropDistSq) {
                closestWeaponDropDistSq = distSq;
                weaponDropTarget = drop;
            }
        });
    }

    let treasureChestTarget: TreasureChest | null = null;
    if (treasureChests.length > 0) {
        let closestTreasureChestDistSq = Infinity;
        treasureChests.forEach(chest => {
            const vec = calculateWrappedDistanceVector(player.position, chest.position);
            const distSq = vec.x ** 2 + vec.y ** 2;
            if (distSq < closestTreasureChestDistSq) {
                closestTreasureChestDistSq = distSq;
                treasureChestTarget = chest;
            }
        });
    }

    let gemTarget: ExperienceGem | null = null;
    let closestGemDistSq = Infinity;
    experienceGems.forEach(gem => {
        const vec = calculateWrappedDistanceVector(player.position, gem.position);
        const distSq = vec.x ** 2 + vec.y ** 2;
        if (distSq < closestGemDistSq) {
            closestGemDistSq = distSq;
            gemTarget = gem;
        }
    });

    // Prioritize targets
    let target: { position: Vector2D } | null = null;
    if (healthPackTarget) {
        target = healthPackTarget;
    } else if (shieldPackTarget) {
        target = shieldPackTarget;
    } else if (treasureChestTarget) {
        target = treasureChestTarget;
    } else if (weaponDropTarget) {
        target = weaponDropTarget;
    } else if (gemTarget) {
        target = gemTarget;
    }

    if (target) {
        const vecToTarget = calculateWrappedDistanceVector(player.position, target.position);
        const dist = Math.sqrt(vecToTarget.x*vecToTarget.x + vecToTarget.y*vecToTarget.y);
        if (dist > 10) moveVector = { x: vecToTarget.x/dist, y: vecToTarget.y/dist };
    } else if (closestEnemy.monster) {
        // Priority 2: Engage monsters with kiting logic
        const target = closestEnemy.monster;
        const vecToTarget = calculateWrappedDistanceVector(player.position, target.position);
        const dist = Math.sqrt(vecToTarget.x * vecToTarget.x + vecToTarget.y * vecToTarget.y);
        
        if (dist < 200) { // Too close, retreat
             moveVector = { x: -vecToTarget.x / dist, y: -vecToTarget.y / dist };
        } else if (dist > 350) { // Too far, advance
            moveVector = { x: vecToTarget.x / dist, y: vecToTarget.y / dist };
        } else { // Optimal distance, strafe
            if (now - updatedState.lastDirectionChange > 2000) {
                updatedState.randomDirection = { x: vecToTarget.y/dist, y: -vecToTarget.x/dist }; // Perpendicular vector
                if (Math.random() > 0.5) { // Randomize strafe direction
                     updatedState.randomDirection.x *= -1;
                     updatedState.randomDirection.y *= -1;
                }
                updatedState.lastDirectionChange = now;
            }
            moveVector = updatedState.randomDirection;
        }
    } else {
        // Priority 3: Wander randomly if no target
        if (now - updatedState.lastDirectionChange > 3000) {
            const angle = randomInRange(0, 2 * Math.PI);
            updatedState.randomDirection = { x: Math.cos(angle), y: Math.sin(angle) };
            updatedState.lastDirectionChange = now;
        }
        moveVector = updatedState.randomDirection;
    }
    
    return { moveVector, updatedState };
};
