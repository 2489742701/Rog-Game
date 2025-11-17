import type { Vector2D, Obstacle, ExplosiveBarrel, GameObject } from './types';
import { WORLD_WIDTH, WORLD_HEIGHT, OBSTACLE_COUNT, EXPLOSIVE_BARREL_COUNT, MIN_OBSTACLE_SIZE, MAX_OBSTACLE_SIZE, OBSTACLE_PADDING, EXPLOSIVE_BARREL_SIZE, WEAPON_QUALITY_THRESHOLDS } from './constants';
import { PREFIXES, SUFFIXES } from '../data/names';

/**
 * @file This file contains miscellaneous utility functions used across the game.
 */

// --- Helper Functions ---

/**
 * Generates a short, unique-enough ID string.
 * @returns {string} A random alphanumeric string.
 */
export const uuid = (): string => Math.random().toString(36).substring(2, 9);

/**
 * Generates a random number within a specified range.
 * @param {number} min - The minimum value (inclusive).
 * @param {number} max - The maximum value (exclusive).
 * @returns {number} A random floating-point number.
 */
export const randomInRange = (min: number, max: number): number => Math.random() * (max - min) + min;

/**
 * Checks for collision between two rectangular game objects using AABB (Axis-Aligned Bounding Box) collision detection.
 * @param a - The first game object.
 * @param b - The second game object.
 * @returns {boolean} `true` if they are colliding, otherwise `false`.
 */
export const checkCollision = (a: { position: Vector2D; size: { width: number; height: number; } }, b: { position: Vector2D; size: { width: number; height: number; } }): boolean => {
  return (
    a.position.x < b.position.x + b.size.width &&
    a.position.x + a.size.width > b.position.x &&
    a.position.y < b.position.y + b.size.height &&
    a.position.y + a.size.height > b.position.y
  );
};

/**
 * Checks if there is an uninterrupted line of sight between two points, considering obstacles.
 * This is used for AI decision-making, such as determining if an enemy can shoot the player.
 * @param {Vector2D} start - The starting point.
 * @param {Vector2D} end - The ending point.
 * @param {(Obstacle | ExplosiveBarrel)[]} obstacles - An array of objects that can block line of sight.
 * @returns {boolean} `true` if the line of sight is clear, otherwise `false`.
 */
export const isLineOfSightClear = (start: Vector2D, end: Vector2D, obstacles: (Obstacle | ExplosiveBarrel)[]): boolean => {
    for (const obs of obstacles) {
        // This is a simplified line-rectangle intersection check.
        // A more robust solution might use an algorithm like Liang-Barsky, but this is sufficient for many game scenarios.
        const { x: ox, y: oy } = obs.position;
        const { width: ow, height: oh } = obs.size;

        const x1 = start.x, y1 = start.y;
        const x2 = end.x, y2 = end.y;

        // Check for intersection with each of the four edges of the rectangle.
        // This is a basic implementation and might not cover all edge cases perfectly but is performant.
        // Top edge
        if (lineIntersect(x1, y1, x2, y2, ox, oy, ox + ow, oy)) return false;
        // Bottom edge
        if (lineIntersect(x1, y1, x2, y2, ox, oy + oh, ox + ow, oy + oh)) return false;
        // Left edge
        if (lineIntersect(x1, y1, x2, y2, ox, oy, ox, oy + oh)) return false;
        // Right edge
        if (lineIntersect(x1, y1, x2, y2, ox + ow, oy, ox + ow, oy + oh)) return false;
    }
    return true; // No intersections found, sight is clear.
};

/**
 * Helper for isLineOfSightClear to check if two line segments intersect.
 * @private
 */
const lineIntersect = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): boolean => {
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den === 0) return false; // Lines are parallel

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    return t > 0 && t < 1 && u > 0 && u < 1;
};


/**
 * Generates obstacles and explosive barrels for the game world, ensuring they don't overlap with specified zones.
 * @param {GameObject[]} avoidZones - An array of areas where objects should not be placed (e.g., the player's spawn area).
 * @returns {{ obstacles: Obstacle[], barrels: ExplosiveBarrel[] }} An object containing the generated obstacles and barrels.
 */
export const generateWorldObjects = (avoidZones: GameObject[]): { obstacles: Obstacle[], barrels: ExplosiveBarrel[] } => {
    const obstacles: Obstacle[] = [];
    const barrels: ExplosiveBarrel[] = [];
    const allObjects: (Obstacle | ExplosiveBarrel)[] = [];

    // Add padding to avoid zones to prevent objects spawning too close.
    const paddedAvoidZones = avoidZones.map(zone => ({
        position: { x: zone.position.x - 50, y: zone.position.y - 50 },
        size: { width: zone.size.width + 100, height: zone.size.height + 100 }
    }));

    /**
     * Tries to place an object of a given size at a random position without collisions.
     * @param {{width: number, height: number}} size - The size of the object to place.
     * @returns {Vector2D | null} The valid position, or null if no position could be found after 100 tries.
     */
    const placeObject = (size: {width: number, height: number}): Vector2D | null => {
        let position: Vector2D;
        let collision: boolean;
        let tries = 0;
        do {
            tries++;
            if (tries > 100) return null; // Failsafe to prevent infinite loops.
            
            collision = false;
            // Generate a random position within the world boundaries.
            position = {
                x: Math.random() * (WORLD_WIDTH - size.width),
                y: Math.random() * (WORLD_HEIGHT - size.height),
            };
            const newObject = { id: '', position, size };
            
            // Check against critical zones (like player spawn).
            for (const zone of paddedAvoidZones) {
                 if (checkCollision(newObject, zone)) {
                    collision = true;
                    break;
                }
            }
            if(collision) continue;

            // Check against already placed objects, with padding.
            for (const existingObj of allObjects) {
                 const paddedObstacle = {
                    position: { x: existingObj.position.x - OBSTACLE_PADDING, y: existingObj.position.y - OBSTACLE_PADDING },
                    size: { width: existingObj.size.width + OBSTACLE_PADDING * 2, height: existingObj.size.height + OBSTACLE_PADDING * 2 }
                };
                if (checkCollision(newObject, paddedObstacle)) {
                    collision = true;
                    break;
                }
            }
        } while (collision);
        return position;
    }
    
    // Generate obstacles.
    for (let i = 0; i < OBSTACLE_COUNT; i++) {
        const size = {
            width: randomInRange(MIN_OBSTACLE_SIZE, MAX_OBSTACLE_SIZE),
            height: randomInRange(MIN_OBSTACLE_SIZE, MAX_OBSTACLE_SIZE),
        };
        const position = placeObject(size);
        if(position) {
            const health = randomInRange(100, 2000);
            const newObstacle: Obstacle = { id: uuid(), position, size, health, maxHealth: health };
            obstacles.push(newObstacle);
            allObjects.push(newObstacle);
        }
    }

    // Generate explosive barrels.
    for (let i = 0; i < EXPLOSIVE_BARREL_COUNT; i++) {
        const size = { width: EXPLOSIVE_BARREL_SIZE, height: EXPLOSIVE_BARREL_SIZE };
        const position = placeObject(size);
        if(position) {
            // Fix: Add maxHealth to match the updated ExplosiveBarrel type.
            const newBarrel: ExplosiveBarrel = { id: uuid(), position, size, health: 10, maxHealth: 10 };
            barrels.push(newBarrel);
            allObjects.push(newBarrel);
        }
    }
    return { obstacles, barrels };
};

/**
 * Calculates the final position of an entity after moving, accounting for collisions with obstacles.
 * This allows entities to "slide" along walls instead of getting stuck.
 * @param entity The entity that is moving.
 * @param moveVector The normalized direction vector of the movement.
 * @param speed The speed of the entity.
 * @param obstacles An array of obstacles to check for collision against.
 * @returns The new, valid position for the entity.
 */
export const getSlidingMove = (
    entity: { position: Vector2D, size: { width: number, height: number } },
    moveVector: Vector2D,
    speed: number,
    obstacles: (Obstacle | ExplosiveBarrel)[]
): Vector2D => {
    let newPos = { ...entity.position };
    
    // Move on the X axis and check for collisions.
    newPos.x += moveVector.x * speed;
    const colliderX = { position: newPos, size: entity.size };
    let collidedX = false;
    for (const obs of obstacles) {
        if (checkCollision(colliderX, obs)) {
            newPos.x = entity.position.x; // Revert X movement on collision.
            collidedX = true;
            break;
        }
    }

    // Move on the Y axis and check for collisions.
    // Important: Start the Y-check from the original Y position, but the (potentially reverted) X position.
    let tempPosY = entity.position.y + moveVector.y * speed;
    const colliderY = { position: { x: newPos.x, y: tempPosY }, size: entity.size };
    for (const obs of obstacles) {
         if (checkCollision(colliderY, obs)) {
            tempPosY = entity.position.y; // Revert Y movement on collision.
            break;
        }
    }
    newPos.y = tempPosY;

    return newPos;
};


/**
 * Finds a safe, random location for an entity to teleport to, avoiding collisions with existing objects.
 * @param {{ width: number, height: number }} entitySize - The size of the entity teleporting.
 * @param {({ position: Vector2D; size: { width: number; height: number } })[]} existingObjects - An array of objects to avoid.
 * @returns {Vector2D} A safe coordinate point.
 */
export const findSafeTeleportLocation = (
    entitySize: { width: number; height: number },
    existingObjects: { position: Vector2D; size: { width: number; height: number } }[]
): Vector2D => {
    let position: Vector2D;
    let collision: boolean;
    let tries = 0;
    const maxTries = 100;

    do {
        tries++;
        collision = false;
        position = {
            x: randomInRange(0, WORLD_WIDTH - entitySize.width),
            y: randomInRange(0, WORLD_HEIGHT - entitySize.height),
        };
        const entityCollider = { position, size: entitySize };

        for (const obj of existingObjects) {
            if (checkCollision(entityCollider, obj)) {
                collision = true;
                break;
            }
        }

    } while (collision && tries < maxTries);
    
    // If a safe spot isn't found after many tries, default to the center of the map.
    if (collision) {
        return { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 };
    }

    return position;
};

/**
 * Generates a random name for the player or an ally.
 * @param {'zh' | 'en'} language - The desired language for the name.
 * @returns {{ fullName: string; prefix: string; }} An object containing the full name and the Chinese prefix.
 */
export const generatePlayerName = (language: 'zh' | 'en'): { fullName: string, prefix: string } => {
    const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    return {
        fullName: `${prefix[language]} ${suffix[language]}`,
        prefix: prefix.zh
    }
};

/**
 * Gets the color and name for a weapon's quality tier based on its quality score.
 * @param {number} quality - The weapon's quality score.
 * @returns The tier object containing color and name information.
 */
export const getWeaponQualityInfo = (quality: number) => {
    // The thresholds are sorted, so we reverse and find the first one that matches.
    return WEAPON_QUALITY_THRESHOLDS.slice().reverse().find(tier => quality >= tier.threshold) || WEAPON_QUALITY_THRESHOLDS[0];
};

/**
 * Calculates the shortest vector between two points in a toroidal (wrap-around) world.
 * @param pos1 The starting position.
 * @param pos2 The target position.
 * @returns The shortest vector from pos1 to pos2.
 */
export const calculateWrappedDistanceVector = (pos1: Vector2D, pos2: Vector2D): Vector2D => {
  let dx = pos2.x - pos1.x;
  let dy = pos2.y - pos1.y;

  // Check wrapped horizontal distance
  if (Math.abs(dx) > WORLD_WIDTH / 2) {
    if (dx > 0) {
      dx -= WORLD_WIDTH;
    } else {
      dx += WORLD_WIDTH;
    }
  }

  // Check wrapped vertical distance
  if (Math.abs(dy) > WORLD_HEIGHT / 2) {
    if (dy > 0) {
      dy -= WORLD_HEIGHT;
    } else {
      dy += WORLD_HEIGHT;
    }
  }

  return { x: dx, y: dy };
};
