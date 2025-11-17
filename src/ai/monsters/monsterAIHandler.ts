import type { Monster, Player, Ally, Obstacle, ExplosiveBarrel, DifficultyModifiers, AIResult } from '../../types';
import { handleNormalMonsterAI } from './normalMonsterAI';
import { handleShooterMonsterAI } from './shooterMonsterAI';
import { handleHealerAI } from './healerMonsterAI';
import { handleSummonerAI } from './summonerAI';
import { handleMinionAI } from './minionAI';
import { handleWispAI } from './wispAI';
import { handleBloaterAI } from './bloaterAI';
import { handleLichGuardAI } from './lichGuardAI';
import { handleBossAI } from './bossAI';

/**
 * @file This file contains the centralized handler for all monster AI logic.
 */

/**
 * A centralized handler for all monster AI logic.
 * It takes a monster and the current game context, and routes it to the correct AI handler based on its type.
 * This also ensures that `aiState` is initialized for monsters that need it, preventing crashes.
 *
 * @param monster The monster to process.
 * @param player The player entity.
 * @param allMonsters The full list of all monsters (for context like healing).
 * @param allies The list of allies.
 * @param allObstacles All obstacles and barrels.
 * @param difficultyModifiers Current difficulty settings.
 * @param now Current timestamp.
 * @param viewport The game viewport dimensions.
 * @returns An `AIResult` object with the outcome of the AI's turn.
 */
export const handleMonsterAI = (
    monster: Monster,
    player: Player,
    allMonsters: Monster[],
    allies: Ally[],
    allObstacles: (Obstacle | ExplosiveBarrel)[],
    difficultyModifiers: DifficultyModifiers,
    now: number,
    viewport: { width: number, height: number }
): AIResult => {
    // Ensure complex monsters have an initialized aiState.
    if (['shooter', 'shotgun_shooter', 'healer', 'summoner', 'wisp', 'boss'].includes(monster.type) && !monster.aiState) {
        monster.aiState = { type: 'hesitate', lastActionTime: now };
    }

    switch (monster.type) {
        case 'normal':
        case 'elite':
            return handleNormalMonsterAI(monster, player, allies, allObstacles);
        case 'minion':
            return handleMinionAI(monster, player, allies, allObstacles);
        case 'bloater':
            return handleBloaterAI(monster, player, allies, allObstacles);
        case 'lich_guard':
            return handleLichGuardAI(monster, player, allies, allObstacles);
        case 'shooter':
        case 'shotgun_shooter':
            return handleShooterMonsterAI(monster, player, allObstacles, difficultyModifiers, now);
        case 'healer':
            return handleHealerAI(monster, player, allMonsters, allObstacles, now);
        case 'summoner':
            return handleSummonerAI(monster, player, allObstacles, difficultyModifiers, now);
        case 'wisp':
            return handleWispAI(monster, player, allObstacles, difficultyModifiers, now);
        case 'boss':
            return handleBossAI(monster, player, allObstacles, difficultyModifiers, now, viewport);
        default:
            // This is a safety net. Any unknown monster type will behave like a 'normal' one.
            return handleNormalMonsterAI(monster, player, allies, allObstacles);
    }
};
