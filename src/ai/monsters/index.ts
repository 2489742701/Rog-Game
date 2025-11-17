/**
 * @file This file serves as a central hub for exporting all individual monster AI handlers.
 * This allows the main game loop to import all monster AI logic from a single source.
 */

export { handleNormalMonsterAI } from './normalMonsterAI';
export { handleShooterMonsterAI } from './shooterMonsterAI';
export { handleHealerAI } from './healerMonsterAI';
export { handleSummonerAI } from './summonerAI';
export { handleMinionAI } from './minionAI';
export { handleWispAI } from './wispAI';
export { handleBloaterAI } from './bloaterAI';
export { handleLichGuardAI } from './lichGuardAI';
export { handleBossAI } from './bossAI';
export { processExplosiveBarrels } from './explosiveBarrelAI';
