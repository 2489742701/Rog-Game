import React, { memo } from 'react';
import type { Player, Ally, Monster, Bullet, EnemyBullet, HomingEnemyBullet, WeaponDrop, ExperienceGem, HealthPack, ShieldPack, TreasureChest, Orbital, Obstacle, ExplosiveBarrel, Explosion, DamageNumber, DamageZone, VisualEffect } from '../types';
import { DAMAGE_NUMBER_LIFESPAN, DEATH_ANIMATION_DURATION, FOCUS_RING_DURATION } from '../constants';

/**
 * @file This file contains all the React components responsible for rendering
 * individual game objects (entities) like the player, monsters, bullets, etc.
 * Each component is memoized for performance.
 */

/**
 * Renders the player character.
 * Includes a visual indicator for the invincibility state.
 * @param {{ player: Player }} props - The player object to render.
 */
export const PlayerComponent: React.FC<{ player: Player }> = memo(({ player }) => {
    const isInvincible = player.invincibleUntil && player.invincibleUntil > Date.now();
    
    // --- SPRITE RENDERING LOGIC (Placeholder) ---
    // In a full implementation with spritesheets, this logic would select the correct
    // sprite based on the player's `visualState` ('idle' or 'running').
    // const spriteState = player.visualState;
    // const spriteSrc = `/assets/sprites/player/${spriteState}.png`;
    // The div below would be replaced with:
    // <img src={spriteSrc} style={{...}} alt="Player" />
    
    return (
    <>
      {/* Current rendering uses simple colored divs */}
      <div className="absolute bg-blue-400 border-2 border-blue-200" style={{ left: player.position.x, top: player.position.y, width: player.size.width, height: player.size.height, boxShadow: '0 0 10px rgba(59, 130, 246, 0.7)', zIndex: 10 }}/>
      {/* Invincibility shield effect */}
      {isInvincible && <div className="absolute rounded-full border-2 border-white animate-pulse" style={{ left: player.position.x - 4, top: player.position.y - 4, width: player.size.width + 8, height: player.size.height + 8, zIndex: 9, opacity: 0.8, pointerEvents: 'none' }}/>}
    </>
)});

/**
 * Renders the dialogue bubble above an ally.
 * @param {{ ally: Ally }} props - The ally object.
 */
const AllyDialogueComponent: React.FC<{ ally: Ally }> = memo(({ ally }) => {
    if (!ally.dialogue || Date.now() > ally.dialogue.displayUntil) {
        return null;
    }
    return (
        <div 
            className="absolute bg-white text-black text-xs px-2 py-1 rounded-md shadow-lg"
            style={{
                left: ally.position.x + ally.size.width / 2,
                top: ally.position.y - 30,
                transform: 'translateX(-50%)',
                zIndex: 20,
                maxWidth: '120px',
                textAlign: 'center',
            }}
        >
            {ally.dialogue.text}
        </div>
    );
});

/**
 * Renders a friendly ally NPC.
 * Includes their name and dialogue bubble.
 * @param {{ ally: Ally }} props - The ally object to render.
 */
export const AllyComponent: React.FC<{ ally: Ally }> = memo(({ ally }) => {
    return (
    <>
      <div className="absolute bg-teal-400 border-2 border-teal-200" style={{ left: ally.position.x, top: ally.position.y, width: ally.size.width, height: ally.size.height, boxShadow: '0 0 10px rgba(45, 212, 191, 0.7)', zIndex: 10 }}/>
      <div className="absolute text-center text-xs text-white" style={{ left: ally.position.x, top: ally.position.y - 20, width: ally.size.width, zIndex: 10, textShadow: '1px 1px 1px black' }}>
        {ally.name}
      </div>
      <AllyDialogueComponent ally={ally} />
    </>
)});

/**
 * Renders the dialogue bubble above a monster (typically a boss).
 * @param {{ monster: Monster }} props - The monster object.
 */
const MonsterDialogueComponent: React.FC<{ monster: Monster }> = memo(({ monster }) => {
    if (!monster.dialogue || Date.now() > monster.dialogue.displayUntil) {
        return null;
    }
    return (
        <div 
            className="absolute bg-white text-black text-sm px-2 py-1 rounded-md shadow-lg"
            style={{
                left: monster.position.x + monster.size.width / 2,
                top: monster.position.y - 30,
                transform: 'translateX(-50%)',
                zIndex: 20,
                maxWidth: '150px',
                textAlign: 'center',
            }}
        >
            {monster.dialogue.text}
        </div>
    );
});


/**
 * Renders an enemy monster.
 * The appearance changes based on the monster's type.
 * Also renders health bar, weapon, and special state indicators (invincibility, charging).
 * @param {{ monster: Monster }} props - The monster object to render.
 */
export const MonsterComponent: React.FC<{ monster: Monster }> = memo(({ monster }) => {
    if (monster.isHidden) {
        return null;
    }

    // Define styles for each monster type.
    const styles: Record<Monster['type'], { bg: string, border: string, shadow: string }> = {
        normal: { bg: 'bg-red-600', border: 'border-red-400', shadow: 'rgba(220, 38, 38, 0.7)' },
        elite: { bg: 'bg-purple-600', border: 'border-purple-400', shadow: 'rgba(147, 51, 234, 0.7)' },
        shooter: { bg: 'bg-pink-500', border: 'border-pink-300', shadow: 'rgba(236, 72, 153, 0.7)' },
        shotgun_shooter: { bg: 'bg-cyan-500', border: 'border-cyan-300', shadow: 'rgba(34, 211, 238, 0.7)' },
        healer: { bg: 'bg-green-500', border: 'border-green-300', shadow: 'rgba(34, 197, 94, 0.7)' },
        summoner: { bg: 'bg-indigo-500', border: 'border-indigo-300', shadow: 'rgba(99, 102, 241, 0.7)' },
        minion: { bg: 'bg-gray-500', border: 'border-gray-400', shadow: 'rgba(107, 114, 128, 0.7)' },
        wisp: { bg: 'bg-teal-300', border: 'border-teal-100', shadow: 'rgba(45, 212, 191, 0.9)' },
        boss: { bg: 'bg-yellow-500', border: 'border-yellow-300', shadow: 'rgba(234, 179, 8, 0.7)' },
        bloater: { bg: 'bg-orange-700', border: 'border-orange-500', shadow: 'rgba(249, 115, 22, 0.7)' },
        lich_guard: { bg: 'bg-gray-800', border: 'border-cyan-300', shadow: 'rgba(34, 211, 238, 0.7)' },
    };
    const style = styles[monster.type] || styles['normal'];
    const isDying = !!monster.diesAt;
    const isShooter = !isDying && (['shooter', 'shotgun_shooter', 'boss', 'wisp'].includes(monster.type) || !!monster.weapon);

    // Render the monster's gun if it's a shooter type.
    let gunElement = null;
    if (isShooter && monster.facingAngle !== undefined) {
        const gunWidth = monster.size.width * 1.2;
        const gunHeight = 5;
        const angleDeg = monster.facingAngle * 180 / Math.PI;
        const gunColor = monster.weapon?.color ? '' : (styles[monster.type]?.bg || 'bg-gray-800');

        gunElement = (
            <div
                className={`absolute ${gunColor} rounded`}
                style={{
                    left: monster.position.x + monster.size.width / 2,
                    top: monster.position.y + monster.size.height / 2 - gunHeight / 2,
                    width: gunWidth,
                    height: gunHeight,
                    transformOrigin: 'left center',
                    transform: `rotate(${angleDeg}deg)`,
                    zIndex: 1,
                    backgroundColor: monster.weapon?.color // Override color if it has a specific weapon
                }}
            />
        );
    }
    
    // Check for various visual states.
    const isInvincible = monster.invincibleUntil && monster.invincibleUntil > Date.now();
    const isCharging = monster.type === 'boss' && monster.aiState?.type === 'charging';
    const empoweredGlow = monster.empoweredLevel ? `0 0 ${5 + monster.empoweredLevel * 5}px rgba(168, 85, 247, 0.9)` : `0 0 10px ${style.shadow}`;
    
    const mainStyle: React.CSSProperties = {
        left: monster.position.x,
        top: monster.position.y,
        width: monster.size.width,
        height: monster.size.height,
        boxShadow: empoweredGlow,
        zIndex: 2,
        transition: 'transform 0.1s linear, opacity 0.1s linear',
    };

    // Apply death animation style.
    if (isDying) {
        const elapsed = Date.now() - monster.diesAt!;
        const progress = Math.min(1, elapsed / DEATH_ANIMATION_DURATION);
        
        mainStyle.opacity = 1 - progress;

        switch (monster.deathEffect) {
            case 'explode':
                mainStyle.transform = `scale(${1 + progress * 1.5})`;
                break;
            case 'run_wild':
            case 'run_and_explode':
                mainStyle.transform = `rotate(${monster.deathAnimationData?.spinAngle || 0}deg)`;
                break;
            case 'spin_fade':
                mainStyle.transform = `rotate(${monster.deathAnimationData?.spinAngle || 0}deg) scale(${1 - progress})`;
                break;
        }
    }

    return (<>
        {gunElement}
        <div className={`absolute ${style.bg} border-2 ${style.border}`} style={mainStyle} />
        {!isDying && isInvincible && <div className="absolute rounded-full border-4 border-white animate-pulse" style={{ left: monster.position.x - 5, top: monster.position.y - 5, width: monster.size.width + 10, height: monster.size.height + 10, zIndex: 3, opacity: 0.9, pointerEvents: 'none' }}/>}
        {!isDying && isCharging && <div className="absolute rounded-full border-4 border-red-500 animate-ping" style={{ left: monster.position.x, top: monster.position.y, width: monster.size.width, height: monster.size.height, zIndex: 3, opacity: 0.9, pointerEvents: 'none' }}/>}
        {/* Health bar */}
        {!isDying && <div className="absolute bg-gray-600" style={{ left: monster.position.x, top: monster.position.y - 8, width: monster.size.width, height: 4, zIndex: 4 }}>
            <div className="bg-red-500 h-full" style={{ width: `${Math.min(100, Math.max(0, (monster.health / monster.maxHealth) * 100))}%` }}></div>
        </div>}
        {!isDying && monster.type === 'healer' && <div className="absolute text-3xl font-bold text-white" style={{ left: monster.position.x, top: monster.position.y - 3, width: monster.size.width, height: monster.size.height, textAlign: 'center' }}>+</div>}
        {!isDying && monster.type === 'wisp' && monster.aiState?.isChargingAttack && <div className="absolute rounded-full animate-ping" style={{ left: monster.position.x, top: monster.position.y, width: monster.size.width, height: monster.size.height, backgroundColor: 'white', zIndex: -1 }}/>}
        <MonsterDialogueComponent monster={monster} />
    </>);
});

/** Renders a player's projectile. */
export const BulletComponent: React.FC<{ bullet: Bullet }> = memo(({ bullet }) => (
  <div className="absolute rounded-full" style={{ left: bullet.position.x, top: bullet.position.y, width: bullet.size.width, height: bullet.size.height, backgroundColor: bullet.color, boxShadow: `0 0 8px ${bullet.color}` }} />
));

/** Renders an enemy's projectile. */
export const EnemyBulletComponent: React.FC<{ bullet: EnemyBullet }> = memo(({ bullet }) => (
  <div className="absolute rounded-md" style={{ left: bullet.position.x, top: bullet.position.y, width: bullet.size.width, height: bullet.size.height, backgroundColor: bullet.color, boxShadow: `0 0 8px ${bullet.color}` }} />
));

/** Renders an enemy's homing projectile. */
export const HomingEnemyBulletComponent: React.FC<{ bullet: HomingEnemyBullet }> = memo(({ bullet }) => (
  <div className="absolute rounded-full" style={{ left: bullet.position.x, top: bullet.position.y, width: bullet.size.width, height: bullet.size.height, backgroundColor: bullet.color, boxShadow: `0 0 10px ${bullet.color}` }}>
    <div className="w-1/2 h-1/2 bg-white rounded-full absolute top-1/4 left-1/4" />
  </div>
));

/** Renders a weapon drop on the ground. */
export const WeaponDropComponent: React.FC<{ drop: WeaponDrop }> = memo(({ drop }) => (
  <div className="absolute border-2 animate-pulse" style={{ left: drop.position.x, top: drop.position.y, width: drop.size.width, height: drop.size.height, backgroundColor: drop.weapon.color, borderColor: 'white', boxShadow: `0 0 15px ${drop.weapon.color}` }} />
));

/** Renders an experience gem on the ground. */
export const ExperienceGemComponent: React.FC<{ gem: ExperienceGem }> = memo(({ gem }) => (
    <div className="absolute bg-green-400 rounded-full border-2 border-green-200" style={{ left: gem.position.x, top: gem.position.y, width: gem.size.width, height: gem.size.height, boxShadow: '0 0 8px rgba(74, 222, 128, 0.8)' }} />
));

/** Renders a health pack pickup. */
export const HealthPackComponent: React.FC<{ pack: HealthPack }> = memo(({ pack }) => (
    <div className="absolute flex items-center justify-center animate-pulse" style={{ left: pack.position.x, top: pack.position.y, width: pack.size.width, height: pack.size.height, zIndex: 15 }}>
        <div className="absolute w-full h-1/3 bg-green-500 border-2 border-white rounded" style={{ boxShadow: '0 0 10px rgba(34, 197, 94, 0.9)' }}></div>
        <div className="absolute w-1/3 h-full bg-green-500 border-2 border-white rounded" style={{ boxShadow: '0 0 10px rgba(34, 197, 94, 0.9)' }}></div>
    </div>
));

/** Renders a shield pack pickup. */
export const ShieldPackComponent: React.FC<{ pack: ShieldPack }> = memo(({ pack }) => (
    <div className="absolute flex items-center justify-center animate-pulse" style={{ left: pack.position.x, top: pack.position.y, width: pack.size.width, height: pack.size.height, zIndex: 15 }}>
        <div className="absolute w-full h-full bg-blue-500 border-2 border-white rounded-full" style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.9)' }}></div>
    </div>
));

/** Renders a treasure chest pickup. */
export const TreasureChestComponent: React.FC<{ chest: TreasureChest }> = memo(({ chest }) => (
    <div className="absolute flex items-center justify-center animate-pulse" style={{ left: chest.position.x, top: chest.position.y, width: chest.size.width, height: chest.size.height, zIndex: 15 }}>
        <div className="absolute w-full h-full bg-yellow-600 border-2 border-yellow-300 rounded-md" style={{ boxShadow: '0 0 12px rgba(202, 138, 4, 0.9)' }}>
          <div className="w-full h-1/3 bg-yellow-800"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 rounded-sm"></div>
        </div>
    </div>
));

/** Renders an orbital shield that circles the player. */
export const OrbitalComponent: React.FC<{ orbital: Orbital }> = memo(({ orbital }) => (
    <div className="absolute rounded-full bg-cyan-400 border-2 border-cyan-200" style={{ left: orbital.position.x, top: orbital.position.y, width: orbital.size.width, height: orbital.size.height, boxShadow: '0 0 12px rgba(34, 211, 238, 0.8)', zIndex: 11 }} />
));

/** Renders a destructible obstacle. */
export const ObstacleComponent: React.FC<{ obstacle: Obstacle }> = memo(({ obstacle }) => {
    const isDamaged = obstacle.health < 400;
    const bgColor = isDamaged ? 'bg-yellow-800' : 'bg-gray-700';
    const borderColor = isDamaged ? 'border-yellow-900' : 'border-gray-600';
    return (
    <div className={`absolute ${bgColor} border-2 ${borderColor}`} style={{ left: obstacle.position.x, top: obstacle.position.y, width: obstacle.size.width, height: obstacle.size.height, zIndex: 5 }} />
)});

/** Renders an explosive barrel. */
export const ExplosiveBarrelComponent: React.FC<{ barrel: ExplosiveBarrel }> = memo(({ barrel }) => (
    <div className="absolute bg-red-800 border-2 border-red-500 rounded-md flex items-center justify-center" style={{ left: barrel.position.x, top: barrel.position.y, width: barrel.size.width, height: barrel.size.height, zIndex: 6 }}>
      <div className="w-2/3 h-1/4 bg-yellow-400" />
    </div>
));

/** Renders the visual effect for an explosion. */
export const ExplosionComponent: React.FC<{ explosion: Explosion }> = memo(({ explosion }) => {
    const { position, size, duration } = explosion;

    // Use Tailwind classes and keyframes for a more dynamic effect
    return (
        <div 
            className="absolute"
            style={{
                left: position.x,
                top: position.y,
                width: 0,
                height: 0,
                zIndex: 15,
            }}
        >
            {/* Shockwave element */}
            <div 
                className="absolute rounded-full border-orange-300"
                style={{
                    left: -size.width / 2,
                    top: -size.height / 2,
                    width: size.width,
                    height: size.height,
                    animation: `explosion-shockwave ${duration}ms ease-out forwards`,
                }}
            />
            {/* Fiery core element */}
            <div
                className="absolute rounded-full"
                 style={{
                    left: -size.width / 4,
                    top: -size.height / 4,
                    width: size.width / 2,
                    height: size.height / 2,
                    animation: `explosion-core ${duration * 0.8}ms ease-in forwards`,
                }}
            />
        </div>
    );
});

/** Renders a persistent damage zone on the ground (e.g., fire, poison). */
export const DamageZoneComponent: React.FC<{ zone: DamageZone }> = memo(({ zone }) => {
    const elapsed = Date.now() - zone.createdAt;
    const progress = elapsed / zone.duration;
    
    const style: React.CSSProperties = {
        left: zone.position.x,
        top: zone.position.y,
        width: zone.size.width,
        height: zone.size.height,
        position: 'absolute',
        borderRadius: '50%',
        animation: 'pulse 2s infinite',
        opacity: 0.6 * (1 - progress),
        zIndex: 4,
    };

    if (zone.type === 'fire') {
        style.background = 'radial-gradient(circle, rgba(255,100,0,0.7) 0%, rgba(251,146,60,0.3) 60%, rgba(251,146,60,0) 100%)';
    } else if (zone.type === 'poison') {
        style.background = 'radial-gradient(circle, rgba(132,204,22,0.7) 0%, rgba(163,230,53,0.3) 60%, rgba(163,230,53,0) 100%)';
    }
    
    return <div style={style} />;
});


/** Renders a floating damage number. */
export const DamageNumberComponent: React.FC<{ damageNumber: DamageNumber }> = memo(({ damageNumber }) => {
    const elapsed = Date.now() - damageNumber.createdAt;
    const opacity = 1 - (elapsed / DAMAGE_NUMBER_LIFESPAN);
    const yOffset = -20 * (elapsed / DAMAGE_NUMBER_LIFESPAN);
    let classes = 'font-bold ';
    if (damageNumber.isCrit) {
        classes += 'text-yellow-300 text-lg';
    } else if (damageNumber.isDoT) {
        classes += 'text-purple-300 text-sm';
    } else if (damageNumber.isWallDamage) {
        classes += 'text-gray-400 text-xs';
    } else {
        classes += 'text-white';
    }
    return (
        <div className={`absolute pointer-events-none ${classes}`} style={{ left: damageNumber.position.x, top: damageNumber.position.y + yOffset, opacity, transition: 'top 0.1s linear, opacity 0.1s linear', zIndex: 20, textShadow: '1px 1px 2px black' }}>
            {damageNumber.amount}
        </div>
    );
});

interface VisualEffectProps {
    effect: VisualEffect;
    target?: Player | Ally;
}

/** Renders a temporary visual effect, like a teleport afterimage or a focus ring. */
export const VisualEffectComponent: React.FC<VisualEffectProps> = memo(({ effect, target }) => {
    const elapsed = Date.now() - effect.createdAt;
    
    if (effect.type === 'teleport_afterimage') {
        const progress = elapsed / effect.duration;
        const opacity = 1 - progress;
        return (
            <div 
                className="absolute border-2" 
                style={{ 
                    left: effect.position.x, 
                    top: effect.position.y, 
                    width: effect.size.width, 
                    height: effect.size.height, 
                    backgroundColor: effect.color,
                    borderColor: 'white',
                    opacity: Math.max(0, opacity * 0.5), 
                    zIndex: 1,
                    transition: 'opacity 0.2s ease-out',
                }} 
            />
        );
    }

    if (effect.type === 'focus_ring') {
        if (!target) return null; // Can't render without a target to follow
        
        const progress = Math.min(1, elapsed / FOCUS_RING_DURATION);
        // Ease-out function for smooth shrinking
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        
        const startScale = 3;
        const endScale = 1;
        const currentScale = startScale - (startScale - endScale) * easedProgress;

        const size = {
            width: target.size.width * currentScale,
            height: target.size.height * currentScale,
        };
        const position = {
            x: target.position.x + (target.size.width - size.width) / 2,
            y: target.position.y + (target.size.height - size.height) / 2,
        };

        return (
             <div 
                className="absolute border-4 border-yellow-300 rounded-md"
                style={{
                    left: position.x,
                    top: position.y,
                    width: size.width,
                    height: size.height,
                    opacity: 1 - progress,
                    zIndex: 11,
                    pointerEvents: 'none',
                    boxShadow: '0 0 15px rgba(253, 224, 71, 0.7)',
                }}
            />
        );
    }
    
    return null;
});
