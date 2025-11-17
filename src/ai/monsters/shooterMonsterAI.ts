import type { Monster, Player, Obstacle, ExplosiveBarrel, EnemyBullet, DifficultyModifiers, AIResult } from '../../types';
import { getSlidingMove, isLineOfSightClear, uuid } from '../../utils';
import { ENEMY_BULLET_SIZE } from '../../constants';

/**
 * @file This file contains the AI logic for ranged monster types ('shooter' and 'shotgun_shooter').
 */

/**
 * Handles the AI for a ranged 'shooter' or 'shotgun_shooter' monster.
 *
 * This AI's behavior is tactical:
 * 1.  It checks for a clear line of sight. If blocked, it moves towards the player to find a better angle.
 * 2.  If it has line of sight, it attempts to maintain an optimal distance—not too close, not too far.
 * 3.  It will retreat if the player gets too close (within 200px).
 * 4.  It will advance if the player is too far (beyond 400px).
 * 5.  If the player is at an optimal distance, it will strafe (move sideways) to be a harder target.
 * 6.  If the view is clear and its attack is off cooldown, it fires a projectile (or a spread of projectiles for shotgunners).
 *
 * @param monster The shooter entity to process.
 * @param player The player entity.
 * @param allObstacles An array of all obstacles and barrels.
 * @param difficultyModifiers The difficulty settings for the current game.
 * @param now The current timestamp (Date.now()).
 * @returns An `AIResult` object containing the updated monster and any new bullets it fired.
 */
export const handleShooterMonsterAI = (
    monster: Monster,
    player: Player,
    allObstacles: (Obstacle | ExplosiveBarrel)[],
    difficultyModifiers: DifficultyModifiers,
    now: number
): AIResult => {
    let updatedMonster = { ...monster };
    const newEnemyBullets: EnemyBullet[] = [];
    if (!updatedMonster.aiState) {
        updatedMonster.aiState = { type: 'strafe', lastActionTime: now };
    }
    const aiState = updatedMonster.aiState;

    const dx = player.position.x - monster.position.x;
    const dy = player.position.y - monster.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const monsterCenterBeforeMove = { x: monster.position.x + monster.size.width / 2, y: monster.position.y + monster.size.height / 2 };
    const playerCenter = { x: player.position.x + player.size.width / 2, y: player.position.y + player.size.height / 2 };
    const hasLineOfSight = isLineOfSightClear(monsterCenterBeforeMove, playerCenter, allObstacles);

    // --- Movement Logic ---
    let moveVector = { x: 0, y: 0 };

    if (hasLineOfSight) {
        // Maintain optimal distance if we can see the player
        if (dist < 200) { // Too close, retreat
            moveVector = { x: -dx / dist, y: -dy / dist };
        } else if (dist > 400) { // Too far, advance
            moveVector = { x: dx / dist, y: dy / dist };
        } else { // Optimal distance, strafe
            if (now - aiState.lastActionTime > 2000) { // Change strafe direction every 2s
                aiState.strafeDirection = (Math.random() > 0.5 ? 1 : -1);
                aiState.lastActionTime = now;
            }
            // Move perpendicular to the player
            moveVector = { x: (dy / dist) * (aiState.strafeDirection || 1), y: (-dx / dist) * (aiState.strafeDirection || 1) };
        }
    } else {
        // No line of sight, move towards the player to get a better position
        if (dist > 1) {
            moveVector = { x: dx / dist, y: dy / dist };
        }
    }

    const mag = Math.sqrt(moveVector.x ** 2 + moveVector.y ** 2);
    if (mag > 0) {
        const normalized = { x: moveVector.x / mag, y: moveVector.y / mag };
        updatedMonster.position = getSlidingMove(updatedMonster, normalized, monster.speed, allObstacles);
    }
    
    // --- Shooting Logic ---
    // Recalculate LoS from the new position before shooting.
    const monsterCenterAfterMove = { x: updatedMonster.position.x + updatedMonster.size.width / 2, y: updatedMonster.position.y + updatedMonster.size.height / 2 };
    const hasLineOfSightForShooting = isLineOfSightClear(monsterCenterAfterMove, playerCenter, allObstacles);

    if (hasLineOfSightForShooting) {
        const finalDx = player.position.x - updatedMonster.position.x;
        const finalDy = player.position.y - updatedMonster.position.y;
        updatedMonster.facingAngle = Math.atan2(finalDy, finalDx);
        
        const fireRate = monster.type === 'shotgun_shooter' ? 1500 : 2000;
        if (now - (aiState.lastAttackTime || 0) > fireRate) {
            aiState.lastAttackTime = now;
            const bulletCount = monster.type === 'shotgun_shooter' ? 5 : 1;
            for (let i = 0; i < bulletCount; i++) {
                const spread = bulletCount > 1 ? (Math.random() - 0.5) * 0.4 : 0;
                const angle = (updatedMonster.facingAngle || 0) + spread;
                newEnemyBullets.push({
                    id: uuid(),
                    sourceId: monster.id,
                    sourceType: monster.type,
                    position: { ...monsterCenterAfterMove },
                    size: { width: ENEMY_BULLET_SIZE, height: ENEMY_BULLET_SIZE },
                    velocity: { x: Math.cos(angle) * 4, y: Math.sin(angle) * 4 },
                    damage: 10 * difficultyModifiers.monsterDamage,
                    color: '#f43f5e',
                    createdAt: now,
                });
            }
        }
    }
    
    return { updatedMonster, newEnemyBullets };
};
