import type { Monster, Player, Obstacle, ExplosiveBarrel, Ally, Vector2D, AIResult } from '../../types';
import { getSlidingMove } from '../../utils';

/**
 * @file This file contains the AI logic for the 'bloater' monster type.
 * Bloaters are volatile enemies that explode on death.
 */

/**
 * Handles the AI for a 'bloater' monster.
 *
 * The Bloater's primary threat comes from its on-death effects (spawning minions and a damage zone),
 * which are handled in the main game loop. Therefore, its active AI is very simple: it just
 * moves directly towards the nearest target (player or ally).
 *
 * @param monster The bloater entity to process.
 * @param player The player entity.
 * @param allies An array of all active allies.
 * @param allObstacles An array of all obstacles and barrels.
 * @returns An `AIResult` object containing the updated monster.
 */
export const handleBloaterAI = (
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