import type { Vector2D, GameObject } from '../types';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../constants';

/**
 * @file This file contains the screen wrap-around logic for all game entities.
 */

/**
 * Handles the seamless wrapping of an entity from one edge of the world to the opposite.
 * If an entity moves completely off one side of the screen, it will reappear on the other side.
 *
 * @param {GameObject} entity - The game object to check for wrapping.
 * @returns {Vector2D} The new position of the entity after potentially wrapping.
 */
export const handleWrapAround = (entity: GameObject): Vector2D => {
    const newPosition = { ...entity.position };
    const { width, height } = entity.size;

    // Horizontal wrap (right to left)
    if (newPosition.x > WORLD_WIDTH) {
        newPosition.x = -width;
    }
    // Horizontal wrap (left to right)
    else if (newPosition.x + width < 0) {
        newPosition.x = WORLD_WIDTH;
    }

    // Vertical wrap (bottom to top)
    if (newPosition.y > WORLD_HEIGHT) {
        newPosition.y = -height;
    }
    // Vertical wrap (top to bottom)
    else if (newPosition.y + height < 0) {
        newPosition.y = WORLD_HEIGHT;
    }

    return newPosition;
};
