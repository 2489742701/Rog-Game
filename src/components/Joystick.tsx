import React, { useRef, useEffect, useCallback } from 'react';
import type { Vector2D } from '../types';

/**
 * @file This file contains the virtual joystick component for mobile controls.
 */

interface JoystickProps {
  /** Callback function when the joystick is moved. Provides a normalized vector. */
  onMove: (vec: Vector2D) => void;
  /** Callback function when the joystick is released. */
  onStop: () => void;
}

/**
 * A virtual joystick component for controlling player movement on touch devices.
 * It tracks touch events to calculate a normalized movement vector.
 * @param {JoystickProps} props - The component's props.
 * @returns {React.ReactElement} The rendered joystick.
 */
export const Joystick: React.FC<JoystickProps> = ({ onMove, onStop }) => {
    const baseRef = useRef<HTMLDivElement>(null);
    const stickRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const radius = 50; // The radius of the joystick's movement area.

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        isDragging.current = true;
        // The move/end listeners are global, so we only need to initiate dragging here.
    };

    // Use useCallback to prevent re-creating these functions on every render.
    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging.current || !baseRef.current || !stickRef.current) return;

        // Prevent default browser actions like scrolling while dragging the joystick.
        e.preventDefault();

        const touch = e.touches[0];
        const baseRect = baseRef.current.getBoundingClientRect();
        // Center of the joystick base.
        const baseX = baseRect.left + baseRect.width / 2;
        const baseY = baseRect.top + baseRect.height / 2;

        // Calculate displacement from the center.
        let dx = touch.clientX - baseX;
        let dy = touch.clientY - baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Constrain the stick's movement within the joystick's radius.
        if (distance > radius) {
            dx = (dx / distance) * radius;
            dy = (dy / distance) * radius;
        }

        // Update the visual position of the stick.
        stickRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
        
        // Calculate and emit the movement vector. Its magnitude represents the speed percentage.
        const moveVector = { x: dx / radius, y: dy / radius };
        onMove(moveVector);
    }, [onMove]);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging.current || !stickRef.current) return;
        
        isDragging.current = false;
        // Reset the stick's visual position.
        stickRef.current.style.transform = 'translate(0, 0)';
        // Signal that movement has stopped.
        onStop();
    }, [onStop]);

    useEffect(() => {
        // We add the move and end listeners to the window to track the touch
        // even if it moves outside of the joystick component's boundaries.
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('touchcancel', handleTouchEnd);

        // Cleanup function to remove the listeners when the component unmounts.
        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [handleTouchMove, handleTouchEnd]);

    return (
        <div
            ref={baseRef}
            className="fixed bottom-10 left-10 w-28 h-28 bg-gray-500 bg-opacity-50 rounded-full flex items-center justify-center z-50"
            onTouchStart={handleTouchStart}
        >
            <div ref={stickRef} className="w-14 h-14 bg-gray-400 bg-opacity-70 rounded-full transition-transform duration-100 pointer-events-none"></div>
        </div>
    );
};