import type { Monster, Player, Ally, Obstacle, ExplosiveBarrel, Vector2D, AIResult } from '../../types';
import { getSlidingMove } from '../../utils';

/**
 * @file This file contains the AI logic for the 'minion' monster type.
 * Minions are typically spawned by Summoner-type enemies.
 */

/**
 * Handles the AI for a 'minion' monster.
 *
 * This AI is intentionally simple, mirroring the behavior of the 'normal' monster.
 * It identifies the closest target (player or ally) and moves directly towards it.
 *
 * @param monster The minion entity to process.
 * @param player The player entity.
 * @param allies An array of all active allies.
 * @param allObstacles An array of all obstacles and barrels.
 * @returns An `AIResult` object containing the updated minion.
 */
export const handleMinionAI = (
    monster: Monster,
    player: Player,
    allies: Ally[],
    allObstacles: (Obstacle | ExplosiveBarrel)[]
): AIResult => {
    let updatedMonster = { ...monster };

    // --- Target Selection ---
    let target: { position: Vector2D } = player;
    let closestDistSq = (player.position.x - monster.position.x) ** 2 + (player.position.y - monster.position.y) ** 2;

    allies.forEach(ally => {
        const distSq = (ally.position.x - monster.position.x) ** 2 + (ally.position.y - monster.position.y) ** 2;
        if (distSq < closestDistSq) {
            closestDistSq = distSq;
            target = ally;
        }
    });

    // --- Movement ---
    const dx = target.position.x - monster.position.x;
    const dy = target.position.y - monster.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 1) {
        const moveVector = { x: dx / dist, y: dy / dist };
        updatedMonster.position = getSlidingMove(updatedMonster, moveVector, monster.speed, allObstacles);
    }
    
    return { updatedMonster };
};
