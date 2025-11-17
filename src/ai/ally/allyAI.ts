import type { Ally, Player, Monster, Obstacle, ExplosiveBarrel, Bullet, Vector2D } from '../../types';
import { getSlidingMove, isLineOfSightClear, uuid, randomInRange } from '../../utils';
import { BULLET_SIZE, ALLY_SIZE } from '../../constants';

/**
 * @file This file contains the AI logic for friendly ally NPCs.
 */

/**
 * The result structure returned by the ally AI handler.
 */
interface AllyAIResult {
    updatedAlly: Ally;
    newBullets: Bullet[];
}

/**
 * Manages the AI for a single friendly ally.
 * 
 * This function controls the ally's behavior based on its `aiBehavior` profile:
 * - **Targeting:** Allies prioritize the closest monster they have a clear line of sight to for shooting. For movement, they will target the nearest monster even if it's behind a wall.
 * - **Movement:**
 *   - If no enemies exist, the ally will move towards the player to regroup.
 *   - `resolute_recruit`: Moves directly towards the target.
 *   - `evasion_first`: Tries to maintain a safe distance while strafing.
 *   - `daring_breakout`: Aggressively closes the distance to the target.
 * - **Shooting:** Fires its weapon only when it has a clear line of sight to a target and its firing cooldown is ready.
 * - **Collision:** Uses the `getSlidingMove` utility to navigate around obstacles.
 *
 * @param ally The ally entity to process.
 * @param player The player entity.
 * @param monsters An array of all active monsters.
 * @param allObstacles An array of all obstacles and barrels.
 * @param now The current timestamp (Date.now()).
 * @returns An `AllyAIResult` object containing the updated ally and any new bullets it fired.
 */
export const handleAllyAI = (
    ally: Ally,
    player: Player,
    monsters: Monster[],
    allObstacles: (Obstacle | ExplosiveBarrel)[],
    now: number
): AllyAIResult => {
    let updatedAlly = { ...ally };
    const newBullets: Bullet[] = [];
    
    let losTarget: Monster | null = null;
    let closestLosDistSq = Infinity;
    let overallClosestTarget: Monster | Player | null = null;
    let closestOverallDistSq = Infinity;

    // --- Target Selection ---
    // First, find the closest monster overall to use as a fallback for movement.
    // Also find the closest monster with Line of Sight for shooting.
    for (const monster of monsters) {
        const distSq = (monster.position.x - updatedAlly.position.x) ** 2 + (monster.position.y - updatedAlly.position.y) ** 2;
        if (distSq < closestOverallDistSq) {
            closestOverallDistSq = distSq;
            overallClosestTarget = monster;
        }

        if (distSq < closestLosDistSq) {
             const allyCenter = { x: updatedAlly.position.x + ALLY_SIZE / 2, y: updatedAlly.position.y + ALLY_SIZE / 2 };
             const monsterCenter = { x: monster.position.x + monster.size.width / 2, y: monster.position.y + monster.size.height / 2 };
            if (isLineOfSightClear(allyCenter, monsterCenter, allObstacles)) {
                closestLosDistSq = distSq;
                losTarget = monster;
            }
        }
    }
    
    // Fallback to player if no monsters
    if (!overallClosestTarget) {
        overallClosestTarget = player;
    }

    let moveTarget: { position: Vector2D } | null = losTarget || overallClosestTarget;
    
    // --- Movement Logic ---
    if (moveTarget) {
        const distToPlayerSq = (player.position.x - updatedAlly.position.x) ** 2 + (player.position.y - updatedAlly.position.y) ** 2;
        
        // If no enemies, stick close to the player. If too close, don't move.
        if (monsters.length === 0 && distToPlayerSq < 150 * 150) {
            moveTarget = null;
        }

        if (moveTarget) {
            const dx = moveTarget.position.x - updatedAlly.position.x;
            const dy = moveTarget.position.y - updatedAlly.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let moveVector: Vector2D = { x: 0, y: 0 };
            
            // Behavior-based movement
            switch(updatedAlly.aiBehavior) {
                case 'resolute_recruit':
                    if (dist > 150) moveVector = { x: dx / dist, y: dy / dist };
                    break;
                case 'evasion_first':
                    // Only evade if the target is a monster and is close
                    if (losTarget && dist < 200) moveVector = { x: -dx / dist, y: -dy / dist }; // Retreat
                    else if (dist > 300) moveVector = { x: dx / dist, y: dy / dist }; // Advance
                    // Add strafing component
                    moveVector.x += dy/dist * 0.5;
                    moveVector.y += -dx/dist * 0.5;
                    break;
                case 'daring_breakout':
                    if (dist > 50) moveVector = { x: dx / dist, y: dy / dist }; // Always advance
                     break;
            }

            const mag = Math.sqrt(moveVector.x ** 2 + moveVector.y ** 2);
            if (mag > 0) {
                const normalized = { x: moveVector.x / mag, y: moveVector.y / mag };
                updatedAlly.position = getSlidingMove(updatedAlly, normalized, updatedAlly.speed, allObstacles);
            }
        }
    }

    // --- Shooting Logic (Only if we have a Line of Sight target) ---
    if (losTarget) {
        const dx = losTarget.position.x - updatedAlly.position.x;
        const dy = losTarget.position.y - updatedAlly.position.y;
        const fireInterval = 1000 / updatedAlly.weapon.fireRate;
        if (now - updatedAlly.lastShotTime > fireInterval) {
            updatedAlly.lastShotTime = now;
            const angle = Math.atan2(dy, dx);
            newBullets.push({
                id: uuid(),
                ownerId: updatedAlly.id,
                position: { x: updatedAlly.position.x + ALLY_SIZE / 2, y: updatedAlly.position.y + ALLY_SIZE / 2 },
                size: { width: BULLET_SIZE, height: BULLET_SIZE },
                velocity: { x: Math.cos(angle) * updatedAlly.weapon.bulletSpeed, y: Math.sin(angle) * updatedAlly.weapon.bulletSpeed },
                damage: updatedAlly.weapon.damage,
                color: updatedAlly.weapon.color,
                piercingLeft: updatedAlly.weapon.piercing || 1,
                createdAt: now,
            });
        }
    }
    
    return { updatedAlly, newBullets };
};
