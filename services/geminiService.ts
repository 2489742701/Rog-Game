import type { Weapon } from '../src/types';
import { WEAPON_PREFIXES, WEAPON_SUFFIXES } from '../data/weaponNames';
import { randomInRange } from '../src/utils';

/**
 * @file This service handles procedural generation of new, upgraded weapons for the player.
 * This is an offline system that replaces the previous Gemini API integration.
 */

/**
 * A helper function to pick a random item from an array.
 * @template T
 * @param {T[]} arr - The array to pick from.
 * @returns {T} A random item from the array.
 */
const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Procedurally generates a new, upgraded weapon based on a baseline weapon and the current wave.
 * This function is designed to be a self-contained, offline replacement for the original AI-based generation.
 *
 * Implementation Details:
 * 1.  It calculates a power scale based on the wave number, ensuring weapons get better in later stages.
 * 2.  It applies a number of random "stat points" to the current weapon's stats, improving things like damage, fire rate, and critical chance.
 * 3.  It guarantees certain stats (like damage) are always an improvement to ensure a feeling of progression.
 * 4.  It constructs a new, thematic name by combining random prefixes and suffixes.
 * 5.  It recalculates the weapon's "quality" score and ensures it's higher than the previous weapon.
 *
 * @param {Weapon} currentWeapon - The player's current weapon, used as a baseline for the generation.
 * @param {number} wave - The current game wave, used to scale the power of the new weapon.
 * @returns {Weapon | null} The newly generated weapon object, or null if generation fails.
 */
export const generateUpgradedWeapon = (currentWeapon: Weapon, wave: number): Weapon | null => {
    try {
        const statPoints = 5 + Math.floor(wave / 3); // Number of random upgrades to apply.

        let newStats = { ...currentWeapon };

        // Apply stat upgrades randomly based on the number of stat points.
        for (let i = 0; i < statPoints; i++) {
            const roll = Math.random();
            if (roll < 0.25) { // 25% chance to upgrade damage
                newStats.damage = Math.round(newStats.damage * (1.05 + Math.random() * 0.1) * (1 + wave / 50));
            } else if (roll < 0.5) { // 25% chance to upgrade fire rate
                newStats.fireRate = parseFloat((newStats.fireRate * (1.02 + Math.random() * 0.08)).toFixed(2));
            } else if (roll < 0.6) { // 10% chance for clip size
                newStats.clipSize = (newStats.clipSize || 10) + Math.ceil(randomInRange(1, 5));
            } else if (roll < 0.7) { // 10% chance for reload time (lower is better)
                newStats.reloadTime = Math.max(500, (newStats.reloadTime || 2000) * (0.95 - Math.random() * 0.05));
            } else if (roll < 0.8) { // 10% chance for crit chance
                newStats.critChance = Math.min(0.75, (newStats.critChance || 0.05) + 0.01);
            } else if (roll < 0.9) { // 10% chance for crit damage
                newStats.critDamage = (newStats.critDamage || 1.5) + 0.05;
            } else if (roll < 0.95 && wave > 5) { // 5% chance for piercing
                 newStats.piercing = (newStats.piercing || 1) + 1;
            } else if (newStats.category === 'shotgun') { // Extra chance for bullet count on shotguns
                 newStats.bulletCount = (newStats.bulletCount || 1) + Math.floor(randomInRange(1, 2));
            }
        }
        
        // Ensure some base stats are always better as a failsafe.
        newStats.damage = Math.max(newStats.damage, Math.round(currentWeapon.damage * 1.1));
        newStats.fireRate = Math.max(newStats.fireRate, parseFloat((currentWeapon.fireRate * 1.01).toFixed(2)));

        // Generate a new procedural name.
        const prefix = pickRandom(WEAPON_PREFIXES);
        const suffix = pickRandom(WEAPON_SUFFIXES);
        const name = {
            en: `${prefix.en} ${suffix.en}`,
            zh: `${prefix.zh}${suffix.zh}`
        };

        // Generate a new random color.
        const color = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;

        // Recalculate quality score based on a weighted formula of its stats.
        const quality = Math.floor(
            (newStats.damage * newStats.fireRate * (newStats.bulletCount || 1)) *
            (1 + (newStats.critChance || 0) * (newStats.critDamage || 0)) +
            (newStats.piercing || 1) * 20 +
            (newStats.bulletSpeed || 5) * 5 -
            (newStats.reloadTime || 2000) / 100
        );
        newStats.quality = Math.max(quality, currentWeapon.quality + 10); // Ensure quality is always higher.
        
        // Assemble the final weapon object.
        const durability = Math.max(100, Math.floor(newStats.quality * 2.5));
        const finalWeapon: Weapon = {
            ...newStats,
            name,
            color,
            ammoInClip: newStats.clipSize,
            durability,
            maxDurability: durability,
            category: 'special' as const, // Mark it as a special, procedurally generated weapon.
        };

        return finalWeapon;

    } catch (error) {
        console.error("Error generating offline weapon:", error);
        return null;
    }
};