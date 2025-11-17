import type { GameState, ExplosiveBarrel, Explosion, DamageNumber, Bullet, Monster } from '../../types';
import { checkCollision, uuid } from '../../utils';
// FIX: Import EXPLOSIVE_BARREL_SIZE constant.
import { EXPLOSION_DURATION, EXPLOSIVE_BARREL_SIZE } from '../../constants';

/**
 * @file This file centralizes all logic for explosive barrels, treating them as interactive
 * environmental entities. It handles their detonation from various sources and the resulting explosion.
 */

/**
 * The result structure returned by the explosive barrel handler.
 */
interface BarrelProcessingResult {
    updatedBarrels: ExplosiveBarrel[];
    updatedObstacles: GameState['obstacles'];
    updatedMonsters: GameState['monsters'];
    newExplosions: Explosion[];
    newDamageNumbers: GameState['damageNumbers'];
    newAchievements: GameState['achievements'];
    updatedTargetedObstacle: GameState['targetedObstacle'];
}

/**
 * Processes all interactions and effects related to explosive barrels for a single game frame.
 * This includes checking for collisions with players and monsters to trigger explosions,
 * and then applying the explosion's damage and visual effects to the game world.
 * Note: Bullet collisions are handled in the main loop due to piercing logic.
 *
 * @param state - The complete current game state.
 * @param takeDamage - A callback function to apply damage to the player.
 * @param now - The current timestamp.
 * @param t - The translation function.
 * @returns An object containing all the game state slices that were modified.
 */
export const processExplosiveBarrels = (
    state: GameState,
    takeDamage: (amount: number, sourceType?: 'event' | Monster['type']) => void,
    now: number,
    t: (key: any) => string
): BarrelProcessingResult => {
    // Destructure necessary state parts
    let { explosiveBarrels, player, monsters, obstacles } = state;
    
    const barrelsToExplode = new Map<string, { position: {x: number, y: number}, damage: number, size: number }>();
    const newExplosions: Explosion[] = [];
    const newDamageNumbers: GameState['damageNumbers'] = [];
    const newAchievements: GameState['achievements'] = [];
    
    // --- Stage 1: Detect Triggers for Explosion ---

    // Check for entity collisions (player and monsters) which cause instant explosion
    explosiveBarrels.forEach(barrel => {
        // If a barrel's health is depleted (e.g., by a bullet in the main loop), it should explode.
        if (barrel.health <= 0) {
            if (!barrelsToExplode.has(barrel.id)) {
                barrelsToExplode.set(barrel.id, { position: barrel.position, damage: 100, size: 150 });
            }
            return; // Already exploding, no need for further checks
        }

        // Check for player collision
        if (checkCollision(player, barrel)) {
            barrelsToExplode.set(barrel.id, { position: barrel.position, damage: 100, size: 150 });
            return; // Barrel is exploding, move to the next one
        }

        // Check for monster collision
        for (const monster of monsters) {
            if (monster.diesAt) continue;
            if (checkCollision(monster, barrel)) {
                barrelsToExplode.set(barrel.id, { position: barrel.position, damage: 100, size: 150 });
                break; // This barrel is exploding, no need to check more monsters for it
            }
        }
    });

    // --- Stage 2: Apply Explosion Effects ---

    if (barrelsToExplode.size > 0) {
        // Only show one "BOOM!" message per frame to avoid spam
        newAchievements.push({ id: uuid(), title: t('boom'), message: '', createdAt: now, category: 'announcement' });

        barrelsToExplode.forEach((exp) => {
            newExplosions.push({ 
                id: uuid(), 
                position: exp.position, 
                size: { width: exp.size, height: exp.size }, 
                createdAt: now, 
                duration: EXPLOSION_DURATION, 
                damage: exp.damage 
            });

            // Damage player if in range
            const playerCenter = { x: player.position.x + player.size.width / 2, y: player.position.y + player.size.height / 2 };
            const expCenter = { x: exp.position.x + EXPLOSIVE_BARREL_SIZE / 2, y: exp.position.y + EXPLOSIVE_BARREL_SIZE / 2 };
            const distToPlayerSq = (playerCenter.x - expCenter.x)**2 + (playerCenter.y - expCenter.y)**2;
            if (distToPlayerSq < (exp.size / 2)**2) {
                takeDamage(exp.damage, 'event');
            }
            
            // Damage monsters in range
            monsters = monsters.map(m => {
                if (m.diesAt) return m;
                const monsterCenter = { x: m.position.x + m.size.width / 2, y: m.position.y + m.size.height / 2 };
                const distToMonsterSq = (monsterCenter.x - expCenter.x)**2 + (monsterCenter.y - expCenter.y)**2;
                if(distToMonsterSq < (exp.size / 2)**2) {
                    newDamageNumbers.push({ id: uuid(), position: m.position, amount: exp.damage, createdAt: now, isCrit: true });
                    return { ...m, health: m.health - exp.damage };
                }
                return m;
            });
            
            // Damage obstacles in range
            obstacles = obstacles.map(o => {
                // AABB check is more suitable for rectangular obstacles than radius check
                const explosionCollider = { position: { x: expCenter.x - exp.size / 2, y: expCenter.y - exp.size / 2 }, size: { width: exp.size, height: exp.size } };
                if (checkCollision(o, explosionCollider)) {
                    return { ...o, health: o.health - exp.damage * 2 }; // Extra damage to obstacles
                }
                return o;
            });
        });
    }

    // --- Stage 3: Return updated state slices ---
    const remainingBarrels = explosiveBarrels.filter(b => !barrelsToExplode.has(b.id));

    // If the currently targeted obstacle was a barrel that exploded, clear the target.
    let updatedTargetedObstacle = state.targetedObstacle;
    if (updatedTargetedObstacle && barrelsToExplode.has(updatedTargetedObstacle.id)) {
        updatedTargetedObstacle = null;
    }

    return {
        updatedBarrels: remainingBarrels,
        updatedObstacles: obstacles,
        updatedMonsters: monsters,
        newExplosions,
        newDamageNumbers,
        newAchievements,
        updatedTargetedObstacle,
    };
};