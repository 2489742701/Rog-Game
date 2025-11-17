import type { Monster, Player, Ally, Obstacle, ExplosiveBarrel, Vector2D, AIResult } from '../../types';
import { getSlidingMove } from '../../utils';

/**
 * @file This file contains the AI logic for the 'normal' monster type.
 */

/**
 * Handles the AI for a standard 'normal' monster.
 *
 * This is the simplest AI. It identifies the closest target (player or ally)
 * and moves directly towards it. It relies on the `getSlidingMove` utility
 * to handle collisions with obstacles, allowing it to navigate the map effectively.
 *
 * @param monster The monster entity to process.
 * @param player The player entity.
 * @param allies An array of all active allies.
 * @param allObstacles An array of all obstacles and barrels.
 * @returns An `AIResult` object containing the updated monster.
 */
export const handleNormalMonsterAI = (
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
