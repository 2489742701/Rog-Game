import type { Monster, Player, Obstacle, ExplosiveBarrel, DifficultyModifiers, AIResult } from '../../types';
import { getSlidingMove, uuid } from '../../utils';
import { MINION_SIZE } from '../../constants';

/**
 * @file This file contains the AI logic for the 'summoner' monster type.
 */

/**
 * Handles the AI for a 'summoner' monster.
 *
 * The Summoner's strategy is indirect:
 * 1.  It actively tries to run away from the player to keep a safe distance.
 * 2.  Periodically (every 5 seconds, if its cooldown is ready), it spawns a new 'minion' monster
 *     near itself to attack the player.
 *
 * @param monster The summoner entity to process.
 * @param player The player entity.
 * @param allObstacles An array of all obstacles and barrels.
 * @param difficultyModifiers The difficulty settings for the current game.
 * @param now The current timestamp (Date.now()).
 * @returns An `AIResult` object containing the updated summoner and an array of any new minions it spawned.
 */
export const handleSummonerAI = (
    monster: Monster,
    player: Player,
    allObstacles: (Obstacle | ExplosiveBarrel)[],
    difficultyModifiers: DifficultyModifiers,
    now: number
): AIResult => {
    let updatedMonster = { ...monster };
    const newMonsters: Monster[] = [];
    const aiState = updatedMonster.aiState || { type: 'hesitate' as const, lastActionTime: 0 };

    // --- Movement: Run away from the player ---
    const dx = player.position.x - monster.position.x;
    const dy = player.position.y - monster.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
        const moveVector = { x: -dx / dist, y: -dy / dist };
        updatedMonster.position = getSlidingMove(updatedMonster, moveVector, monster.speed, allObstacles);
    }

    // --- Spawning Logic ---
    const spawnCooldown = 5000;
    if (now - (updatedMonster.lastSpawnTime || 0) > spawnCooldown) {
        updatedMonster.lastSpawnTime = now;
        const health = 20 * difficultyModifiers.monsterHealth;
        newMonsters.push({
            id: uuid(),
            type: 'minion',
            position: { x: monster.position.x, y: monster.position.y },
            size: { width: MINION_SIZE, height: MINION_SIZE },
            speed: 1.5 * difficultyModifiers.monsterSpeed,
            health: health,
            maxHealth: health,
            xpValue: 2,
            spawnTime: now,
        });
    }

    return { updatedMonster, newMonsters };
};