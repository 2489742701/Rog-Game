import type { Monster, Player, Obstacle, ExplosiveBarrel, DifficultyModifiers, EnemyBullet, HomingEnemyBullet, ExplosiveBarrel as ExplosiveBarrelType, DialogueEntry, AIResult } from '../../types';
import { getSlidingMove, isLineOfSightClear, uuid, randomInRange } from '../../utils';
import { ENEMY_BULLET_SIZE, MINION_SIZE, EXPLOSIVE_BARREL_SIZE, BOSS_DEFEAT_DIALOGUE, BOSS_ATTACK_DIALOGUE, THEMATIC_BOSS_DIALOGUE } from '../../constants';

/**
 * @file This file contains the complex AI logic for the 'boss' monster type.
 */

/**
 * Handles the AI for a 'boss' monster.
 *
 * This AI uses a state machine to cycle through various attack patterns and phases,
 * creating a dynamic and challenging encounter.
 *
 * **Phases:**
 * The boss changes its behavior based on its health, defined by `healthThresholds`.
 * Each phase can introduce new or more aggressive attack patterns.
 *
 * **Attack Patterns (States):**
 * - `barrage`: Fires a spiral or stream of bullets.
 * - `charging` -> `dashing`: Prepares and then executes a high-speed dash across the arena.
 * - `throwing`: Hurls explosive barrels at the player.
 * - **Minion Spawning:** Periodically summons minions to assist in the fight.
 *
 * The boss also has dialogue, taunting the player during specific attacks.
 *
 * @param monster The boss entity to process.
 * @param player The player entity.
 * @param allObstacles An array of all obstacles and barrels.
 * @param difficultyModifiers The difficulty settings for the current game.
 * @param now The current timestamp (Date.now()).
 * @param viewport The dimensions of the game viewport.
 * @returns An `AIResult` object containing the updated boss and any new entities it created.
 */
export const handleBossAI = (
    monster: Monster,
    player: Player,
    allObstacles: (Obstacle | ExplosiveBarrel)[],
    difficultyModifiers: DifficultyModifiers,
    now: number,
    viewport: { width: number; height: number }
): AIResult => {
    let updatedMonster = { ...monster };
    const newEnemyBullets: EnemyBullet[] = [];
    const newHomingBullets: HomingEnemyBullet[] = [];
    const newMonsters: Monster[] = [];
    const newExplosiveBarrels: ExplosiveBarrelType[] = [];
    const newDialogueHistory: DialogueEntry[] = [];
    
    if (!updatedMonster.aiState) {
        updatedMonster.aiState = { type: 'hesitate', lastActionTime: now };
    }
    const aiState = updatedMonster.aiState;
    // This is a simplification; in a full app, the language would be passed down from game state.
    const lang = 'zh'; 

    // --- Phase Transition Logic ---
    const healthPercent = updatedMonster.health / updatedMonster.maxHealth;
    const currentPhase = updatedMonster.phase || 1;
    let nextPhase = currentPhase;
    if (currentPhase === 1 && healthPercent < 0.75) nextPhase = 2;
    if (currentPhase === 2 && healthPercent < 0.4) nextPhase = 3;
    
    if (nextPhase > currentPhase) {
        updatedMonster.phase = nextPhase;
        updatedMonster.invincibleUntil = now + 2000; // Become invincible during phase change
        aiState.type = 'hesitate';
        aiState.lastActionTime = now;
    }

    // --- Main AI State Machine ---
    const timeInState = now - aiState.lastActionTime;

    // --- Dialogue Trigger ---
    if (now - (aiState.lastDialogueTime || 0) > 10000 && Math.random() < 0.2) {
        aiState.lastDialogueTime = now;
        // Fix: Use the English name as the key for thematic dialogue and ensure consistent structure before accessing language-specific arrays.
        const dialoguePools = THEMATIC_BOSS_DIALOGUE[updatedMonster.name?.en || ''] || { attack: BOSS_ATTACK_DIALOGUE };
        const text = dialoguePools.attack[lang][Math.floor(Math.random() * dialoguePools.attack[lang].length)];
        newDialogueHistory.push({ id: uuid(), speaker: updatedMonster.name?.[lang] || 'Boss', text, createdAt: now, speakerType: 'boss' });
    }

    // Handle active dash
    if (aiState.type === 'dashing' && aiState.dashTarget) {
        const dx = aiState.dashTarget.x - updatedMonster.position.x;
        const dy = aiState.dashTarget.y - updatedMonster.position.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 30 || now > (aiState.dashEndTime || 0)) {
            aiState.type = 'hesitate';
            aiState.lastActionTime = now;
        } else {
            const moveVector = { x: dx/dist, y: dy/dist };
            updatedMonster.position = getSlidingMove(updatedMonster, moveVector, updatedMonster.speed * 3, allObstacles);
        }
    }
    // Handle state transitions from hesitation
    else if (aiState.type === 'hesitate' && timeInState > 2000) {
        const randomAction = Math.random();
        aiState.lastActionTime = now;
        if (randomAction < 0.4) {
            aiState.type = 'barrage';
            aiState.barrageAngle = 0;
        } else if (randomAction < 0.7 && updatedMonster.phase! >= 2) {
             aiState.type = 'charging';
        } else {
             aiState.type = 'throwing';
        }
    }
    
    // Handle specific action states
    switch (aiState.type) {
        case 'barrage':
            if (timeInState > 3000) {
                 aiState.type = 'hesitate';
                 aiState.lastActionTime = now;
                 break;
            }
            const bulletsPerTick = updatedMonster.phase === 3 ? 3 : 2;
            for(let i=0; i < bulletsPerTick; i++) {
                const angle = (aiState.barrageAngle || 0) + (i * 2 * Math.PI / bulletsPerTick);
                newEnemyBullets.push({
                    id: uuid(), sourceId: monster.id, sourceType: monster.type,
                    position: { x: monster.position.x + monster.size.width / 2, y: monster.position.y + monster.size.height / 2 },
                    size: { width: ENEMY_BULLET_SIZE, height: ENEMY_BULLET_SIZE },
                    velocity: { x: Math.cos(angle) * 5, y: Math.sin(angle) * 5 },
                    damage: 12 * difficultyModifiers.monsterDamage, color: '#facc15', createdAt: now,
                });
            }
            aiState.barrageAngle = (aiState.barrageAngle || 0) + 0.15;
            break;

        case 'charging':
             if (timeInState > 1500) {
                 aiState.type = 'dashing';
                 aiState.lastActionTime = now;
                 aiState.dashTarget = {...player.position};
                 aiState.dashEndTime = now + 1000;
             }
             break;

        case 'throwing':
             if (timeInState > 2500) {
                  aiState.type = 'hesitate';
                  aiState.lastActionTime = now;
                  break;
             }
             if (now - (aiState.lastSpecialAttackTime || 0) > 800) {
                 aiState.lastSpecialAttackTime = now;
                 const barrelVelX = (player.position.x - monster.position.x) / 50;
                 const barrelVelY = (player.position.y - monster.position.y) / 50 - 5; // Add arc
                 newExplosiveBarrels.push({
                     id: uuid(),
                     position: { x: monster.position.x, y: monster.position.y },
                     size: { width: EXPLOSIVE_BARREL_SIZE, height: EXPLOSIVE_BARREL_SIZE },
                     health: 1,
                     maxHealth: 1,
                     velocity: { x: barrelVelX, y: barrelVelY },
                 });
             }
             break;
    }
    
    // --- Minion Spawning (independent of state) ---
    const spawnCooldown = 8000 - (updatedMonster.phase || 1) * 1000;
    if (now - (aiState.lastMinionSpawnTime || 0) > spawnCooldown) {
        aiState.lastMinionSpawnTime = now;
        const minionCount = 1 + (updatedMonster.phase || 1);
        for (let i = 0; i < minionCount; i++) {
            const health = 30 * difficultyModifiers.monsterHealth;
            newMonsters.push({
                id: uuid(), type: 'minion',
                position: { x: monster.position.x + randomInRange(-50, 50), y: monster.position.y + randomInRange(-50, 50) },
                size: { width: MINION_SIZE, height: MINION_SIZE },
                speed: 1.8 * difficultyModifiers.monsterSpeed,
                health, maxHealth: health, xpValue: 5,
                spawnTime: now,
            });
        }
    }
    
    return { updatedMonster, newEnemyBullets, newHomingBullets, newMonsters, newExplosiveBarrels, newDialogueHistory };
};