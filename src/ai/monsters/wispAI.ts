import type { Monster, Player, Obstacle, ExplosiveBarrel, DifficultyModifiers, HomingEnemyBullet, VisualEffect, AIResult } from '../../types';
import { findSafeTeleportLocation, uuid } from '../../utils';
import { WISP_TELEPORT_COOLDOWN, WISP_TELEPORT_DURATION, HOMING_ENEMY_BULLET_SIZE } from '../../constants';

/**
 * @file This file contains the AI logic for the 'wisp' monster type.
 */

/**
 * Handles the AI for a 'wisp' monster.
 *
 * The Wisp has a unique and elusive behavior pattern controlled by a state machine:
 * 1.  **Default State:** It drifts slowly.
 * 2.  **Teleporting:**
 *     - Every `WISP_TELEPORT_COOLDOWN` milliseconds, it decides to teleport.
 *     - It finds a safe new location using `findSafeTeleportLocation`.
 *     - It enters the 'teleporting' state, becomes hidden, and leaves a visual effect at its origin.
 *     - After `WISP_TELEPORT_DURATION`, it reappears at the new location.
 * 3.  **Attacking:**
 *     - After teleporting, it charges an attack for 1 second.
 *     - After charging, it fires a slow-moving, homing projectile at the player.
 *
 * @param monster The wisp entity to process.
 * @param player The player entity.
 * @param allObstacles An array of all obstacles and barrels.
 * @param difficultyModifiers The difficulty settings for the current game.
 * @param now The current timestamp (Date.now()).
 * @returns An `AIResult` object containing the updated wisp, any new homing bullets, and any new visual effects.
 */
export const handleWispAI = (
    monster: Monster,
    player: Player,
    allObstacles: (Obstacle | ExplosiveBarrel)[],
    difficultyModifiers: DifficultyModifiers,
    now: number
): AIResult => {
    let updatedMonster = { ...monster };
    const newHomingBullets: HomingEnemyBullet[] = [];
    const newVisualEffects: VisualEffect[] = [];
    
    // Fix: Initialize aiState properly to avoid accessing properties on a partially-defined object.
    if (!updatedMonster.aiState) {
        updatedMonster.aiState = { type: 'hesitate', lastActionTime: now };
    }
    const aiState = updatedMonster.aiState;

    // --- State Machine Logic ---

    // Handle active teleportation
    if (aiState.type === 'teleporting' && aiState.teleportData) {
        if (now >= aiState.teleportData.startTime + WISP_TELEPORT_DURATION) {
            updatedMonster.position = aiState.teleportData.to;
            updatedMonster.isHidden = false;
            // Fix: Mutate aiState instead of reassigning it.
            aiState.type = 'hesitate';
            aiState.lastActionTime = now;
            aiState.isChargingAttack = true;
        }
    } else {
        // Decide to teleport if cooldown is ready
        if (now - (aiState.lastAttackTime || 0) > WISP_TELEPORT_COOLDOWN) {
            const from = { ...updatedMonster.position };
            const to = findSafeTeleportLocation(updatedMonster.size, allObstacles);
            // Fix: Mutate aiState instead of reassigning it.
            aiState.type = 'teleporting';
            aiState.lastActionTime = now;
            aiState.lastAttackTime = now;
            aiState.teleportData = { from, to, startTime: now };
            updatedMonster.isHidden = true;
            newVisualEffects.push({
                id: uuid(),
                type: 'teleport_afterimage',
                position: from,
                size: updatedMonster.size,
                createdAt: now,
                duration: WISP_TELEPORT_DURATION,
                color: 'rgba(45, 212, 191, 0.5)'
            });
        }
        
        // Handle post-teleport attack charge
        if (aiState.isChargingAttack && now - aiState.lastActionTime > 1000) {
            aiState.isChargingAttack = false;
            const dx = player.position.x - updatedMonster.position.x;
            const dy = player.position.y - updatedMonster.position.y;
            const angle = Math.atan2(dy, dx);
            newHomingBullets.push({
                id: uuid(),
                sourceId: monster.id,
                sourceType: monster.type,
                targetId: player.id,
                position: { x: updatedMonster.position.x + updatedMonster.size.width / 2, y: updatedMonster.position.y + updatedMonster.size.height / 2 },
                size: { width: HOMING_ENEMY_BULLET_SIZE, height: HOMING_ENEMY_BULLET_SIZE },
                velocity: { x: Math.cos(angle) * 2, y: Math.sin(angle) * 2 },
                damage: 15 * difficultyModifiers.monsterDamage,
                color: '#2dd4bf',
                createdAt: now,
                turnSpeed: 0.05
            });
        }
    }

    return { updatedMonster, newHomingBullets, newVisualEffects };
};
