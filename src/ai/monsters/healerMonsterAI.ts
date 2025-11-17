import type { Monster, Player, Obstacle, ExplosiveBarrel, Vector2D, AIResult } from '../../types';
import { getSlidingMove } from '../../utils';
import { HEALER_SIZE } from '../../constants';

/**
 * @file This file contains the AI logic for the 'healer' monster type.
 */

/**
 * Handles the AI for a 'healer' monster.
 *
 * The Healer's logic is unique:
 * 1.  It scans for other monsters that are below 80% of their max health.
 * 2.  If an injured ally is found, it moves towards them.
 * 3.  If it gets close enough to an injured ally and its healing cooldown is ready, it heals them for a flat amount.
 * 4.  If no allies need healing, it will actively move away from the player to maintain a safe distance.
 *
 * @param monster The healer entity to process.
 * @param player The player entity.
 * @param allMonsters An array of all active monsters (including the healer itself).
 * @param allObstacles An array of all obstacles and barrels.
 * @param now The current timestamp (Date.now()).
 * @returns An `AIResult` object containing the updated healer and an array of any other monsters that were healed.
 */
export const handleHealerAI = (
    monster: Monster,
    player: Player,
    allMonsters: Monster[],
    allObstacles: (Obstacle | ExplosiveBarrel)[],
    now: number
): AIResult => {
    let updatedMonster = { ...monster };
    const updatedOtherMonsters: Monster[] = [];

    // --- Target Selection (for healing) ---
    let healTarget: Monster | null = null;
    let closestInjuredDistSq = Infinity;

    for (const otherMonster of allMonsters) {
        if (otherMonster.id !== monster.id && otherMonster.health < otherMonster.maxHealth * 0.8) {
            const distSq = (otherMonster.position.x - monster.position.x) ** 2 + (otherMonster.position.y - monster.position.y) ** 2;
            if (distSq < closestInjuredDistSq) {
                closestInjuredDistSq = distSq;
                healTarget = otherMonster;
            }
        }
    }

    // --- Movement & Healing Logic ---
    if (healTarget) {
        const dx = healTarget.position.x - monster.position.x;
        const dy = healTarget.position.y - monster.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Move towards heal target if not in range.
        if (dist > 150) {
            const moveVector = { x: dx / dist, y: dy / dist };
            updatedMonster.position = getSlidingMove(updatedMonster, moveVector, monster.speed, allObstacles);
        }

        // Heal if in range and cooldown is ready.
        const healCooldown = 3000;
        if (dist < 160 && now - (monster.lastHealTime || 0) > healCooldown) {
            updatedMonster.lastHealTime = now;
            const healedMonster = { ...healTarget, health: Math.min(healTarget.maxHealth, healTarget.health + 50) };
            updatedOtherMonsters.push(healedMonster);
        }
    } else {
        // If no one to heal, run away from the player.
        const dx = player.position.x - monster.position.x;
        const dy = player.position.y - monster.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            const moveVector = { x: -dx / dist, y: -dy / dist }; // Note the negative sign to move away
            updatedMonster.position = getSlidingMove(updatedMonster, moveVector, monster.speed, allObstacles);
        }
    }
    
    return { updatedMonster, updatedOtherMonsters };
};
