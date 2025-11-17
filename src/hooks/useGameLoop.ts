import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Player, Monster, Bullet, Weapon, WeaponDrop, Vector2D, GameState, ExperienceGem, UpgradeChoice, DamageNumber, Obstacle, EnemyBullet, HomingEnemyBullet, LeaderboardEntry, HealthPack, Achievement, ShieldPack, Orbital, Difficulty, DifficultyModifiers, ExplosiveBarrel, Explosion, WaveTheme, AIBehavior, Ally, AutoWalkState, TreasureChest, Card, DamageZone, VisualEffect, DialogueEntry, Buff, GameEvent, AIResult } from '../types';
import { PREDEFINED_UPGRADES, CURSED_UPGRADES, ARTIFACT_UPGRADES } from '../../data/upgrades';
import { PREDEFINED_WEAPONS } from '../../data/weapons';
import { PREDEFINED_BUFFS } from '../../data/buffs';
import { generatePlayerName, generateWorldObjects, uuid, randomInRange, checkCollision, isLineOfSightClear, findSafeTeleportLocation, getSlidingMove } from '../utils';
import {
    WORLD_WIDTH, WORLD_HEIGHT, PLAYER_SIZE, ALLY_SIZE, MONSTER_SIZE, ELITE_MONSTER_SIZE, BOSS_SIZE, MINION_SIZE,
    HEALER_SIZE, SUMMONER_SIZE, WISP_SIZE, BLOATER_SIZE, BULLET_SIZE, ENEMY_BULLET_SIZE, HOMING_ENEMY_BULLET_SIZE, XP_GEM_SIZE,
    HEALTH_PACK_SIZE, SHIELD_PACK_SIZE, ORBITAL_SIZE, EXPLOSIVE_BARREL_SIZE, TREASURE_CHEST_SIZE, MAX_HEALTH_PACKS,
    MAX_SHIELD_PACKS, MAX_TREASURE_CHESTS, MAX_ALLIES, DAMAGE_NUMBER_LIFESPAN, ACHIEVEMENT_LIFESPAN,
    ACHIEVEMENT_EXIT_DURATION, MONSTER_INTRO_LIFESPAN, EXPLOSION_DURATION, INVINCIBILITY_DURATION, TARGET_INFO_LOCK_DURATION,
    BULLET_LIFESPAN, BOSS_BULLET_LIFESPAN, MONSTER_FORCE_UNSTUCK_DURATION, ALLY_SPAWN_STUCK_CHECK_DURATION, INITIAL_WEAPON, PISTOL_WEAPON, BROKEN_WEAPON_THRESHOLDS,
    DIFFICULTY_SETTINGS, ALLY_IDLE_DIALOGUE, ALLY_HURT_DIALOGUE, ALLY_BOSS_ENCOUNTER_DIALOGUE, translations, generateThematicWave,
    DROP_CHANCE_HEALTH, DROP_CHANCE_SHIELD, AI_JITTER_STUCK_TIME, AI_BREAKOUT_DURATION, WRAP_PADDING,
    SCORE_ACHIEVEMENT_THRESHOLDS, ARTIFACT_CHANCE, CARD_PACK_DROP_CHANCE, PLAYER_WALL_BUMP_DAMAGE, PLAYER_WALL_BUMP_COOLDOWN,
    WISP_TELEPORT_COOLDOWN, WISP_TELEPORT_DURATION, DOT_TICK_RATE, PLAYER_POISON_DURATION, PLAYER_POISON_DAMAGE_PER_TICK,
    EXPLOSIVE_BARREL_COUNT, MONSTER_XP_ABSORB_CHANCE, MONSTER_WEAPON_PICKUP_CHANCE, MONSTER_WEAPON_FIRE_RATE_MODIFIER, DIALOGUE_LIFESPAN, MAX_DIALOGUE_HISTORY, ALLY_SPAWN_CHANCE_DOUBLE, ALLY_SPAWN_CHANCE_TRIPLE,
    BOSS_SPAWN_DIALOGUE, BOSS_ATTACK_DIALOGUE, BOSS_DEFEAT_DIALOGUE, PLAYER_PRAISE_DIALOGUE, THEMATIC_MONSTER_DIALOGUE, GAME_REMARKS_DIALOGUE, THEMATIC_BOSS_DIALOGUE, WEAPON_QUALITY_THRESHOLDS,
    MONSTER_KILL_ACHIEVEMENT_THRESHOLDS, WAVE_ACHIEVEMENT_THRESHOLDS, ALLY_CURSED_UPGRADE_DIALOGUE, DEATH_ANIMATION_DURATION, FOCUS_RING_DURATION
} from '../constants';
import { handleAutoWalk } from '../ai/player/playerAI';
import { handleAllyAI } from '../ai/ally/allyAI';
import { handleMonsterAI } from '../ai/monsters/monsterAIHandler';
import { processExplosiveBarrels } from '../ai/monsters/explosiveBarrelAI';
import { generateUpgradedWeapon } from '../../services/geminiService';
import { handleWrapAround } from '../systems/wrapSystem';

/**
 * @file This file contains the `useGameLoop` custom hook, which is the heart of the game's logic.
 * It manages the entire game state, updates it every frame, and handles all game mechanics
 * like player movement, combat, AI behavior, and wave progression.
 */

/**
 * Generates the initial state for a new game session.
 * @param {boolean} isMobile - Whether the game is running on a mobile device.
 * @param {Difficulty} difficulty - The selected game difficulty.
 * @param {AIBehavior} aiBehavior - The selected ally AI behavior.
 * @param {Card[]} equippedCards - The player's equipped cards for this run.
 * @returns {GameState} The complete initial game state object.
 */
const getInitialState = (isMobile: boolean, difficulty: Difficulty, aiBehavior: AIBehavior, equippedCards: Card[]): GameState => {
  const playerInitialPos = { x: WORLD_WIDTH / 2 - PLAYER_SIZE / 2, y: WORLD_HEIGHT / 2 - PLAYER_SIZE / 2 };
  const { obstacles, barrels } = generateWorldObjects([ { id: 'player_spawn_zone', position: playerInitialPos, size: { width: 200, height: 200 }} ]);
  const language: 'zh' | 'en' = 'zh';
  const { fullName } = generatePlayerName(language);
  
  let leaderboard: LeaderboardEntry[] = [];
  try {
      const storedLeaderboard = localStorage.getItem('geminiRogueLeaderboard');
      if (storedLeaderboard) leaderboard = JSON.parse(storedLeaderboard);
  } catch (e) {
      console.error("Could not load leaderboard", e);
  }
  
  const difficultyModifiers = DIFFICULTY_SETTINGS[difficulty];

  // Initialize the base player object.
  const player: Player = {
    id: 'player', name: fullName, position: playerInitialPos,
    size: { width: PLAYER_SIZE, height: PLAYER_SIZE },
    health: 100, maxHealth: 100, shield: 50, maxShield: 50,
    shieldAbsorption: 0.75, weapons: [], equippedWeaponIndex: 0,
    speed: 4, baseDamage: 0, damageMultiplier: 1, thornsDamage: 0, level: 1, xp: 0,
    xpToNextLevel: 100, gemMagnetRadius: 60, invincibleUntil: 0,
    artifacts: [], brokenWeaponCount: 0, visualState: 'idle',
    shotsWithCurrentLauncher: 0, statusEffects: [],
    isReloading: false, reloadUntil: 0, buffs: [],
    lastPosition: playerInitialPos, timeAtLastPosition: Date.now(),
  };

    // Apply effects from equipped cards to the initial player state.
    equippedCards.forEach(card => {
        card.effects.forEach(effect => {
          if (effect.type === 'STAT_MOD') {
            const { stat, op, value } = effect;
            const numericStats: (keyof Player)[] = ['maxHealth', 'speed', 'gemMagnetRadius', 'thornsDamage', 'maxShield', 'baseDamage', 'damageMultiplier'];
            if (numericStats.includes(stat)) {
                if (op === 'add') {
                    (player[stat] as number) += value;
                    if (stat === 'maxHealth') player.health += value;
                    if (stat === 'maxShield') player.shield += value;
                } else if (op === 'multiply') {
                    (player[stat] as number) *= value;
                }
            }
          }
        });
      });

  const initialKillCounts: Record<Monster['type'], number> = { normal: 0, elite: 0, shooter: 0, shotgun_shooter: 0, healer: 0, summoner: 0, minion: 0, boss: 0, wisp: 0, bloater: 0, lich_guard: 0 };

  // Construct the full initial game state.
  return {
      player: player,
      equippedWeapons: [{...INITIAL_WEAPON}, null, null],
      allies: [], monsters: [], bullets: [], enemyBullets: [],
      homingEnemyBullets: [], weaponDrops: [], experienceGems: [],
      damageNumbers: [], obstacles: obstacles, explosiveBarrels: barrels,
      explosions: [], damageZones: [], visualEffects: [],
      healthPacks: [], shieldPacks: [], treasureChests: [],
      orbitals: [],
      camera: { x: playerInitialPos.x - 600, y: playerInitialPos.y - 450 },
      keys: {}, score: 0, wave: 1, monstersToKillForNextWave: 10,
      monstersKilledThisWave: 0, isWaitingForBossClear: false,
      isBossWave: false, isGameOver: false, isLevelingUp: false,
      isPaused: false, currentWaveTheme: null, waveThemeDisplayUntil: 0,
      levelUpChoices: [], lastShotTime: 0, lastMonsterSpawnTime: 0,
      lastTreasureChestSpawnTime: 0, screenShake: 0,
      settings: {
        autoFire: true, autoWalk: true, autoSwitchWeapon: true,
        screenShakeEnabled: true, language: language,
        showOnScreenControls: isMobile, aiBehavior: aiBehavior,
      },
      autoWalkState: {
        target: null, lastDirectionChange: 0, randomDirection: { x: 1, y: 0},
        isUnstucking: false, unstuckUntil: 0, unstuckDirection: { x: 0, y: 0 },
        weaponSwitchCooldown: 0,
      },
      leaderboard, achievements: [], dialogueHistory: [], difficulty,
      difficultyModifiers, encounteredMonsters: new Set(),
      encounteredThematicMonsters: new Set(), monsterIntro: null,
      targetedMonsters: [null, null, null],
      targetedObstacle: null,
      nextAllySpawnTime: Date.now() + randomInRange(30, 45) * 1000,
      isInitialAllySpawned: false, unlockedAchievements: new Set(),
      killCounts: initialKillCounts,
      lastObstacleRefreshWave: 1,
      activeEvent: null,
    }
};


/**
 * The main game loop as a React hook.
 * This hook encapsulates all the game logic for updating the state each frame.
 * @param {boolean} isMobile - Is the game on a mobile device?
 * @param {Difficulty} difficulty - The selected difficulty.
 * @param {AIBehavior} aiBehavior - The selected ally AI behavior.
 * @param {{ width: number, height: number }} viewport - The dimensions of the game viewport.
 * @param {() => void} onCardPackGained - Callback when a card pack is gained.
 * @param {Card[]} equippedCards - The player's equipped cards.
 * @returns An object containing the current `gameState`, a function to `setGameState`, and refs for user input.
 */
export const useGameLoop = (
    isMobile: boolean,
    difficulty: Difficulty,
    aiBehavior: AIBehavior,
    viewport: { width: number, height: number },
    onCardPackGained: () => void,
    equippedCards: Card[]
) => {
    // Memoize initial state to prevent re-creation on re-renders.
    const initialState = useMemo(() => getInitialState(isMobile, difficulty, aiBehavior, equippedCards), [isMobile, difficulty, aiBehavior, equippedCards]);
    const [gameState, setGameState] = useState<GameState>(initialState);
    
    // Refs are used for mouse and joystick input to avoid re-rendering the component on every input change.
    const mousePosRef = useRef<Vector2D>({ x: 0, y: 0 });
    const joystickMoveRef = useRef<Vector2D | null>(null);
    const isShootingRef = useRef(false);

    // Ref for cooldowns on certain game remarks to avoid spam.
    const lowHealthRemarkCooldownRef = useRef(0);

    /**
     * Initiates a manual reload for the player's current weapon.
     */
    const handleReload = useCallback(() => {
        setGameState(prevState => {
            if (prevState.isGameOver || prevState.isPaused) return prevState;

            const { player, equippedWeapons } = prevState;
            const weaponIndex = player.equippedWeaponIndex;
            const currentWeapon = equippedWeapons[weaponIndex];

            // Conditions to prevent reloading.
            if (player.isReloading || !currentWeapon || (currentWeapon.ammoInClip ?? 0) >= (currentWeapon.clipSize ?? 0) || (currentWeapon.durability ?? 0) <= 0) {
                return prevState;
            }

            return {
                ...prevState,
                player: {
                    ...player,
                    isReloading: true,
                    reloadUntil: Date.now() + (currentWeapon.reloadTime || 2000),
                }
            };
        });
    }, [setGameState]);

    /**
     * The main game loop function. This is called on every frame (via setInterval).
     * It calculates the next game state based on the previous state and user input.
     */
    const gameLoop = useCallback(() => {
        setGameState(prevState => {
            if (prevState.isPaused || prevState.isGameOver || prevState.isLevelingUp) return prevState;

            const now = Date.now();
            let state = { ...prevState };
            let t = (key: keyof (typeof translations.zh & typeof translations.en)) => translations[state.settings.language][key] || translations['en'][key];

            // --- State Initialization for this Frame ---
            let player = { ...state.player };
            let allies = [...state.allies];
            let monsters = [...state.monsters];
            let bullets = [...state.bullets];
            let enemyBullets = [...state.enemyBullets];
            let homingEnemyBullets = [...state.homingEnemyBullets];
            let weaponDrops = [...state.weaponDrops];
            let experienceGems = [...state.experienceGems];
            let damageNumbers = state.damageNumbers.filter(dn => now - dn.createdAt < DAMAGE_NUMBER_LIFESPAN);
            let obstacles = [...state.obstacles];
            let explosiveBarrels = [...state.explosiveBarrels];
            let explosions = state.explosions.filter(e => now - e.createdAt < EXPLOSION_DURATION);
            let damageZones = state.damageZones.filter(z => now - z.createdAt < z.duration);
            let visualEffects = state.visualEffects.filter(e => now - e.createdAt < e.duration);
            let healthPacks = [...state.healthPacks];
            let shieldPacks = [...state.shieldPacks];
            let treasureChests = [...state.treasureChests];
            let orbitals = [...state.orbitals];
            let score = state.score;
            let screenShake = Math.max(0, state.screenShake - 1);
            let lastMonsterSpawnTime = state.lastMonsterSpawnTime;
            
            // Fix: Add logic to set 'isExiting' for fade-out animations.
            let achievements = state.achievements.map(ach => {
                if (now - ach.createdAt > ACHIEVEMENT_LIFESPAN - ACHIEVEMENT_EXIT_DURATION) {
                    return { ...ach, isExiting: true };
                }
                return ach;
            }).filter(ach => now - ach.createdAt < ACHIEVEMENT_LIFESPAN);

            let dialogueHistory = state.dialogueHistory.map(entry => {
                if (now - entry.createdAt > DIALOGUE_LIFESPAN - ACHIEVEMENT_EXIT_DURATION) {
                    return { ...entry, isExiting: true };
                }
                return entry;
            }).filter(entry => now - entry.createdAt < DIALOGUE_LIFESPAN);
            
            let killCounts = { ...state.killCounts };
            let unlockedAchievements = new Set(state.unlockedAchievements);
            const equippedWeapons = state.equippedWeapons.map(w => w ? {...w} : null);
            let activeEvent = state.activeEvent;
            let targetedMonsters = [...state.targetedMonsters];
            let targetedObstacle = state.targetedObstacle ? { ...state.targetedObstacle } : null;
            if (activeEvent && now > activeEvent.expiresAt) {
                activeEvent = null;
            }

            const { difficultyModifiers } = state;

            /**
             * Handles the logic for the player taking damage inside the game loop.
             * This prevents nested state updates by modifying the current frame's draft state.
             */
            const _takeDamage = (amount: number, sourceType?: Monster['type'] | 'event') => {
                if (state.isGameOver || (player.invincibleUntil && now < player.invincibleUntil)) {
                    return;
                }
    
                const finalAmount = Math.ceil(amount * difficultyModifiers.playerDamageTaken);
                if(finalAmount <= 0) return;
                
                player.invincibleUntil = now + INVINCIBILITY_DURATION;
                
                const damageToShield = Math.min(player.shield, finalAmount);
                const damageAbsorbedByShield = damageToShield * (player.shieldAbsorption || 0.75);
                const remainingDamage = finalAmount - damageAbsorbedByShield;
                
                player.shield -= damageToShield;
                if (remainingDamage > 0) {
                    player.health = Math.max(0, player.health - remainingDamage);
                }
                
                damageNumbers.push({ id: uuid(), position: {x: player.position.x, y: player.position.y - 10}, amount: finalAmount, createdAt: now, isCrit: false });
    
                if (state.settings.screenShakeEnabled) {
                    screenShake = Math.min(15, screenShake + 5);
                }
                
                if (player.health <= 0) {
                     const newLeaderboard = [...state.leaderboard, { name: player.name, score: score, wave: state.wave }]
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 10);
                    try {
                        localStorage.setItem('geminiRogueLeaderboard', JSON.stringify(newLeaderboard));
                    } catch(e) { console.error("Could not save leaderboard", e); }
                    
                    state.isGameOver = true; 
                    state.leaderboard = newLeaderboard;
                }
    
                const newEncounteredMonsters = new Set(state.encounteredMonsters);
                if (sourceType && sourceType !== 'event' && !newEncounteredMonsters.has(sourceType)) {
                    newEncounteredMonsters.add(sourceType);
                    state.monsterIntro = { type: sourceType, displayUntil: now + MONSTER_INTRO_LIFESPAN };
                    state.encounteredMonsters = newEncounteredMonsters;
                }
            };

            // --- Active Event Processing ---
            if (activeEvent?.type === 'meteor_shower') {
                const tickInterval = 100; // spawn meteors every 100ms
                if (now - (activeEvent.lastTick || 0) > tickInterval) {
                    activeEvent.lastTick = now;
                    const meteorCount = 3;
                    for (let i = 0; i < meteorCount; i++) {
                        const spawnX = randomInRange(0, WORLD_WIDTH);
                        enemyBullets.push({
                            id: uuid(),
                            sourceId: 'event',
                            sourceType: 'event',
                            position: { x: spawnX, y: -50 },
                            size: { width: 15, height: 30 },
                            velocity: { x: 0, y: 15 }, // falling straight down
                            damage: 25 * difficultyModifiers.monsterDamage,
                            color: '#f59e0b', // orange
                            createdAt: now,
                            lifespan: 5000,
                        });
                    }
                }
            }
            
            let allObstacles = [...obstacles, ...explosiveBarrels];

            // --- Buffs Processing ---
            player.buffs = player.buffs.filter(b => now < b.createdAt + b.duration);

            let effectiveStats = {
                speed: player.speed,
                damageMultiplier: player.damageMultiplier,
                fireRateMultiplier: 1,
            };

            player.buffs.forEach(buff => {
                buff.effects.forEach(effect => {
                    if (effect.type === 'STAT_MOD' && effect.op === 'multiply') {
                        if (effect.stat === 'speed') effectiveStats.speed *= effect.value;
                        if (effect.stat === 'damageMultiplier') effectiveStats.damageMultiplier *= effect.value;
                        if (effect.stat === 'fireRate') effectiveStats.fireRateMultiplier *= effect.value;
                    }
                });
            });

             // --- Reloading Logic ---
            if (player.isReloading && now >= (player.reloadUntil || 0)) {
                const weaponIndex = player.equippedWeaponIndex;
                const currentWeapon = equippedWeapons[weaponIndex];

                if (currentWeapon) {
                    const neededAmmo = (currentWeapon.clipSize || 0) - (currentWeapon.ammoInClip || 0);
                    const ammoFromReserve = Math.min(neededAmmo, currentWeapon.durability ?? 0);
                    
                    if (ammoFromReserve > 0) {
                        currentWeapon.ammoInClip = (currentWeapon.ammoInClip || 0) + ammoFromReserve;
                        if ((currentWeapon.durability ?? 0) < 9999) { // Don't reduce infinite ammo
                            currentWeapon.durability = (currentWeapon.durability ?? 0) - ammoFromReserve;
                        }
                    }
                }
                player.isReloading = false;
                player.reloadUntil = undefined;
            }

            // --- Player Movement ---
            let moveVector: Vector2D = { x: 0, y: 0 };
            const hasKeyboardInput = state.keys['w'] || state.keys['a'] || state.keys['s'] || state.keys['d'];
            const hasJoystickInput = !!joystickMoveRef.current;
            const hasManualInput = hasKeyboardInput || hasJoystickInput;

            if (state.settings.autoWalk && !hasManualInput) {
                // AUTO-WALK AI
                const aiResult = handleAutoWalk(player, state.autoWalkState, experienceGems, monsters.filter(m => !m.diesAt), allObstacles, now, healthPacks, shieldPacks, treasureChests, weaponDrops);
                moveVector = aiResult.moveVector; // AI provides a normalized direction vector
                state.autoWalkState = aiResult.updatedState;
            } else {
                // MANUAL MOVEMENT
                if (hasJoystickInput) {
                    // Joystick vector has magnitude representing speed. Use it directly.
                    moveVector = joystickMoveRef.current!;
                } else if (hasKeyboardInput) {
                    // Keyboard is binary, so we build a vector and normalize it.
                    let kbdVector = { x: 0, y: 0 };
                    if (state.keys['w']) kbdVector.y -= 1;
                    if (state.keys['s']) kbdVector.y += 1;
                    if (state.keys['a']) kbdVector.x -= 1;
                    if (state.keys['d']) kbdVector.x += 1;
                    
                    const mag = Math.sqrt(kbdVector.x ** 2 + kbdVector.y ** 2);
                    if (mag > 0) {
                        moveVector = { x: kbdVector.x / mag, y: kbdVector.y / mag };
                    }
                }
            }

            // Move the player based on the final vector. The moveVector is multiplied by speed in getSlidingMove.
            // For joystick, this scales the speed. For keyboard/AI, it's a normalized vector for full speed.
            if (moveVector.x !== 0 || moveVector.y !== 0) {
                player.position = getSlidingMove(player, moveVector, effectiveStats.speed, allObstacles);
                player.visualState = 'running';
            } else {
                player.visualState = 'idle';
            }
            player.position = handleWrapAround(player);
            
            // --- Player Shooting ---
            const currentWeapon = equippedWeapons[player.equippedWeaponIndex] || PISTOL_WEAPON;
            const fireInterval = 1000 / (currentWeapon.fireRate * effectiveStats.fireRateMultiplier);

            // FIX: Refactor auto-reload to prevent nested state updates
            if ((currentWeapon.ammoInClip ?? 0) <= 0 && !player.isReloading) {
                if (currentWeapon && (currentWeapon.durability ?? 0) > 0) {
                    player.isReloading = true;
                    player.reloadUntil = now + (currentWeapon.reloadTime || 2000);
                }
            }


            if (!player.isReloading && (state.settings.autoFire || isShootingRef.current) && now - state.lastShotTime > fireInterval && (currentWeapon.ammoInClip ?? 0) > 0) {
                let targetPos: Vector2D | null = null;
                const livingMonstersForShooting = monsters.filter(m => !m.diesAt);
                if(state.settings.autoFire && !isShootingRef.current) {
                    let strategicTarget: Vector2D | null = null;
                    let bestBarrelScore = 0;
                    
                    explosiveBarrels.forEach(barrel => {
                        let monstersNearBarrel = 0;
                        const barrelCenter = { x: barrel.position.x + barrel.size.width / 2, y: barrel.position.y + barrel.size.height / 2 };
                        livingMonstersForShooting.forEach(monster => {
                            const monsterCenter = { x: monster.position.x + monster.size.width / 2, y: monster.position.y + monster.size.height / 2 };
                            const distSq = (barrelCenter.x - monsterCenter.x)**2 + (barrelCenter.y - monsterCenter.y)**2;
                            if (distSq < 100 * 100) { monstersNearBarrel++; }
                        });
                        if (monstersNearBarrel > bestBarrelScore) {
                            bestBarrelScore = monstersNearBarrel;
                            strategicTarget = barrel.position;
                        }
                    });

                    if (bestBarrelScore >= 2 && strategicTarget) {
                        targetPos = strategicTarget;
                    } else {
                        let closestMonster: Monster | null = null;
                        let closestMonsterDistSq = Infinity;
                        livingMonstersForShooting.forEach(m => {
                            const distSq = (m.position.x - player.position.x)**2 + (m.position.y - player.position.y)**2;
                            if(distSq < closestMonsterDistSq) {
                                closestMonsterDistSq = distSq;
                                closestMonster = m;
                            }
                        });
                        if (closestMonster) targetPos = closestMonster.position;
                    }
                } else if (isShootingRef.current) {
                    targetPos = {x: mousePosRef.current.x + state.camera.x, y: mousePosRef.current.y + state.camera.y};
                }

                if(targetPos) {
                    const playerCenterX = player.position.x + player.size.width / 2;
                    const playerCenterY = player.position.y + player.size.height / 2;
                    const dx = targetPos.x - playerCenterX;
                    const dy = targetPos.y - playerCenterY;
                    const calculatedDamage = (player.baseDamage + currentWeapon.damage) * effectiveStats.damageMultiplier;
                    
                    for (let i = 0; i < (currentWeapon.bulletCount || 1); i++) {
                        const angle = Math.atan2(dy, dx);
                        const spread = (currentWeapon.bulletCount || 1) > 1 ? (Math.random() - 0.5) * 0.5 : 0;
                        const finalAngle = angle + spread;
                        bullets.push({
                            id: uuid(), ownerId: 'player',
                            position: { x: playerCenterX - BULLET_SIZE / 2, y: playerCenterY - BULLET_SIZE / 2 },
                            size: { width: BULLET_SIZE, height: BULLET_SIZE },
                            velocity: { x: Math.cos(finalAngle) * currentWeapon.bulletSpeed, y: Math.sin(finalAngle) * currentWeapon.bulletSpeed },
                            damage: calculatedDamage, color: currentWeapon.color, piercingLeft: currentWeapon.piercing || 1, createdAt: now, onImpact: currentWeapon.onImpact
                        });
                    }
                    if(currentWeapon.ammoInClip) currentWeapon.ammoInClip--;
                    state.lastShotTime = now;
                    if (state.settings.screenShakeEnabled) {
                        let baseShake = Math.min(8, 1 + (currentWeapon.damage / 20) + ((currentWeapon.bulletCount || 1) - 1) * 0.5);
                        if (currentWeapon.category === 'launcher') baseShake *= 2;
                        if (currentWeapon.category === 'shotgun') baseShake *= 1.5;
                        screenShake = Math.min(20, screenShake + baseShake);
                    }
                }
            }
            
            // --- Process Dying Monsters ---
            monsters = monsters.map(m => {
                if (!m.diesAt) return m; // Not dying, skip

                const elapsed = now - m.diesAt;
                if (elapsed > DEATH_ANIMATION_DURATION) {
                    return m; // Will be removed later
                }

                let updatedMonster = { ...m };
                const progress = elapsed / DEATH_ANIMATION_DURATION;

                switch (updatedMonster.deathEffect) {
                    case 'run_wild':
                    case 'run_and_explode': {
                        if (!updatedMonster.deathAnimationData?.runDirection || now > (updatedMonster.deathAnimationData?.lastRunDirectionChange || 0)) {
                            const angle = Math.random() * 2 * Math.PI;
                            updatedMonster.deathAnimationData = {
                                ...updatedMonster.deathAnimationData,
                                runDirection: { x: Math.cos(angle), y: Math.sin(angle) },
                                lastRunDirectionChange: now + 200,
                            };
                        }
                        const speed = updatedMonster.speed * (updatedMonster.deathEffect === 'run_and_explode' ? 2 : 1) * (1 - progress);
                        if (updatedMonster.deathAnimationData.runDirection) {
                            updatedMonster.position = getSlidingMove(updatedMonster, updatedMonster.deathAnimationData.runDirection, speed, allObstacles);
                        }
                        updatedMonster.deathAnimationData = {
                            ...updatedMonster.deathAnimationData,
                            spinAngle: ((updatedMonster.deathAnimationData?.spinAngle || 0) + 25) % 360,
                        };
                        break;
                    }
                    case 'spin_fade': {
                        const spinSpeed = 15;
                        updatedMonster.deathAnimationData = {
                            ...updatedMonster.deathAnimationData,
                            spinAngle: ((updatedMonster.deathAnimationData?.spinAngle || 0) + spinSpeed) % 360,
                        };
                        break;
                    }
                    case 'explode': // Visuals handled in component
                        break;
                }
                return updatedMonster;
            });
            
            // --- AI Processing ---
            const livingMonsters = monsters.filter(m => !m.diesAt);
            const monsterUpdateMap = new Map<string, Monster>();
            const otherMonsterUpdatesFromAI = new Map<string, Monster>();

            for (const monster of livingMonsters) {
                const aiResult = handleMonsterAI(monster, player, livingMonsters, allies, allObstacles, difficultyModifiers, now, viewport);
                monsterUpdateMap.set(aiResult.updatedMonster.id, aiResult.updatedMonster);

                if (aiResult.newEnemyBullets) enemyBullets.push(...aiResult.newEnemyBullets);
                if (aiResult.newHomingBullets) homingEnemyBullets.push(...aiResult.newHomingBullets);
                if (aiResult.newMonsters) monsters.push(...aiResult.newMonsters);
                if (aiResult.newExplosiveBarrels) explosiveBarrels.push(...aiResult.newExplosiveBarrels);
                if (aiResult.newVisualEffects) visualEffects.push(...aiResult.newVisualEffects);
                if (aiResult.newDialogueHistory) dialogueHistory.push(...aiResult.newDialogueHistory);
                
                if (aiResult.updatedOtherMonsters) {
                    aiResult.updatedOtherMonsters.forEach(m => otherMonsterUpdatesFromAI.set(m.id, m));
                }
            }

            // --- Apply AI Updates ---
            // A temporary map to hold the next state of all monsters to avoid overwrites.
            const nextMonsterStates = new Map<string, Monster>();

            // 1. Initialize with the current state of all monsters.
            for (const monster of monsters) {
                nextMonsterStates.set(monster.id, monster);
            }

            // 2. Apply updates from other sources (e.g., healers).
            for (const [id, update] of otherMonsterUpdatesFromAI.entries()) {
                const existing = nextMonsterStates.get(id);
                if (existing) {
                    nextMonsterStates.set(id, { ...existing, ...update });
                }
            }

            // 3. Apply the monster's own AI update, which takes precedence for most properties.
            for (const [id, update] of monsterUpdateMap.entries()) {
                const existing = nextMonsterStates.get(id);
                if (existing) {
                    // Smart merge: A heal should only affect health, not overwrite the monster's new position.
                    const finalHealth = otherMonsterUpdatesFromAI.has(id) ? otherMonsterUpdatesFromAI.get(id)!.health : update.health;
                    nextMonsterStates.set(id, { ...update, health: finalHealth });
                }
            }

            // 4. Convert the map back to an array.
            monsters = Array.from(nextMonsterStates.values());


            // --- Ally AI ---
            const allyAIResults = allies.map(ally => handleAllyAI(ally, player, livingMonsters, allObstacles, now));
            allies = allyAIResults.map(res => res.updatedAlly);
            allyAIResults.forEach(res => bullets.push(...res.newBullets));
            allies.forEach(ally => {
                ally.position = handleWrapAround(ally);
            });

            // --- Monster Stuck and Boundary Check ---
            monsters = monsters.map(m => {
                if (m.diesAt) return m; // Don't unstuck dying monsters
                let updatedMonster = { ...m };
                updatedMonster.position = handleWrapAround(updatedMonster);

                const posChanged = updatedMonster.lastPosition && (
                    Math.abs(updatedMonster.position.x - updatedMonster.lastPosition.x) > 0.1 ||
                    Math.abs(updatedMonster.position.y - updatedMonster.lastPosition.y) > 0.1
                );

                if (updatedMonster.lastPosition && !posChanged) {
                    if (!updatedMonster.timeAtLastPosition) {
                        updatedMonster.timeAtLastPosition = now;
                    }
                } else {
                    updatedMonster.timeAtLastPosition = undefined;
                }

                // If stuck for 2 seconds
                const isStuck = updatedMonster.timeAtLastPosition && now - updatedMonster.timeAtLastPosition > 2000;

                if (isStuck) {
                    visualEffects.push({ id: uuid(), type: 'teleport_afterimage', position: updatedMonster.position, size: updatedMonster.size, createdAt: now, duration: 300, color: 'rgba(255, 0, 0, 0.7)' });
                    updatedMonster.position = findSafeTeleportLocation(updatedMonster.size, allObstacles);
                    updatedMonster.timeAtLastPosition = undefined; // Reset timer
                }

                updatedMonster.lastPosition = { ...updatedMonster.position };
                return updatedMonster;
            });

            // --- Barrel Processing ---
            // Create a temporary state object with the most up-to-date entity lists for barrel processing.
            const stateForBarrels: GameState = {
                ...state,
                player,
                monsters,
                obstacles,
                explosiveBarrels,
            };
            const barrelResult = processExplosiveBarrels(stateForBarrels, _takeDamage, now, t);
            explosiveBarrels = barrelResult.updatedBarrels;
            obstacles = barrelResult.updatedObstacles;
            monsters = barrelResult.updatedMonsters;
            explosions.push(...barrelResult.newExplosions);
            damageNumbers.push(...barrelResult.newDamageNumbers);
            achievements.push(...barrelResult.newAchievements);
            targetedObstacle = barrelResult.updatedTargetedObstacle;
            
            // --- Bullet & Collision Processing ---
            let allyUpdateMap = new Map<string, Partial<Ally>>();

            // Player Bullet Collisions
            let newBullets: Bullet[] = [];
            for (const b of bullets) {
                let bullet = { ...b, position: { x: b.position.x + b.velocity.x, y: b.position.y + b.velocity.y }};
                bullet.position = handleWrapAround(bullet);
                if (now - bullet.createdAt > BULLET_LIFESPAN) {
                    if (bullet.onImpact) {
                        damageZones.push({ id: uuid(), type: bullet.onImpact.type, position: bullet.position, size: bullet.onImpact.size, damage: bullet.onImpact.damage, duration: bullet.onImpact.duration, createdAt: now });
                    }
                    continue;
                };

                let hitSomething = false;

                // vs Obstacles
                for (let i = 0; i < obstacles.length; i++) {
                    if (checkCollision(bullet, obstacles[i])) {
                        obstacles[i].health -= bullet.damage;
                        damageNumbers.push({ id: uuid(), position: bullet.position, amount: Math.round(bullet.damage), createdAt: now, isCrit: false, isWallDamage: true });
                        const hitObstacle = obstacles[i];
                        if (targetedObstacle && targetedObstacle.id === hitObstacle.id) {
                            targetedObstacle = { ...hitObstacle, lastHitTime: now, lockedUntil: targetedObstacle.lockedUntil };
                        } else {
                            if (!targetedObstacle || now >= (targetedObstacle.lockedUntil || 0)) {
                                targetedObstacle = { ...hitObstacle, lastHitTime: now, lockedUntil: now + 1000 };
                            }
                        }
                        bullet.piercingLeft--;
                        hitSomething = true;
                        break;
                    }
                }
                if (hitSomething && bullet.piercingLeft <= 0) continue;

                // vs Barrels - This check remains to damage barrels with bullets
                for (let i = 0; i < explosiveBarrels.length; i++) {
                    if (checkCollision(bullet, explosiveBarrels[i])) {
                        // Fix: Player bullets now damage explosive barrels.
                        explosiveBarrels[i].health -= bullet.damage;
                        bullet.piercingLeft--; 
                        hitSomething = true;
                        break;
                    }
                }
                if (hitSomething && bullet.piercingLeft <= 0) continue;

                // vs Monsters
                for (let i = 0; i < monsters.length; i++) {
                    if (monsters[i].diesAt) continue; // Don't hit dying monsters
                    if(checkCollision(bullet, monsters[i])) {
                        const weaponUsed = equippedWeapons[player.equippedWeaponIndex] || PISTOL_WEAPON;
                        const critChance = weaponUsed.critChance || 0;
                        const isCrit = Math.random() < critChance;
                        const critDamageMultiplier = isCrit ? (weaponUsed.critDamage || 1.5) : 1.0;
                        
                        const finalDamage = bullet.damage * critDamageMultiplier;

                        monsters[i].health -= finalDamage;
                        damageNumbers.push({ id: uuid(), position: bullet.position, amount: Math.round(finalDamage), createdAt: now, isCrit });
                        
                        const hitMonster = monsters[i];
                        const existingIndex = targetedMonsters.findIndex(m => m?.id === hitMonster.id);

                        if (existingIndex > -1) {
                            const oldTarget = targetedMonsters[existingIndex];
                            targetedMonsters[existingIndex] = { ...hitMonster, lastHitTime: now, lockedUntil: oldTarget?.lockedUntil };
                        } else {
                            const emptySlotIndex = targetedMonsters.findIndex(m => m === null);
                            if (emptySlotIndex > -1) {
                                targetedMonsters[emptySlotIndex] = { ...hitMonster, lastHitTime: now, lockedUntil: now + 1000 };
                            } else {
                                let oldestUnlockedIndex = -1;
                                let oldestTime = Infinity;
                                for (let j = 0; j < targetedMonsters.length; j++) {
                                    const monsterInSlot = targetedMonsters[j];
                                    if (monsterInSlot && now >= (monsterInSlot.lockedUntil || 0)) {
                                        if (monsterInSlot.lastHitTime < oldestTime) {
                                            oldestTime = monsterInSlot.lastHitTime;
                                            oldestUnlockedIndex = j;
                                        }
                                    }
                                }
                                if (oldestUnlockedIndex > -1) {
                                    targetedMonsters[oldestUnlockedIndex] = { ...hitMonster, lastHitTime: now, lockedUntil: now + 1000 };
                                }
                            }
                        }
                        
                        bullet.piercingLeft--;
                        hitSomething = true;
                        break;
                    }
                }

                if (bullet.piercingLeft > 0 && !hitSomething) {
                    newBullets.push(bullet);
                }
            }
            bullets = newBullets;
            
            // Enemy bullets
            const nextEnemyBullets: EnemyBullet[] = [];
            for (const bullet of enemyBullets) {
                const updatedBullet = { ...bullet, position: { x: bullet.position.x + bullet.velocity.x, y: bullet.position.y + bullet.velocity.y } };
                updatedBullet.position = handleWrapAround(updatedBullet);
                let hitSomething = false;

                for (let i = obstacles.length - 1; i >= 0; i--) {
                    if (checkCollision(updatedBullet, obstacles[i])) {
                        if (updatedBullet.sourceType === 'boss') obstacles[i].health = 0;
                        hitSomething = true;
                        break;
                    }
                }
                if (hitSomething) continue;

                for (let i = 0; i < explosiveBarrels.length; i++) {
                    if (checkCollision(updatedBullet, explosiveBarrels[i])) {
                        explosiveBarrels[i].health -= updatedBullet.damage;
                        // Explosion trigger is handled by processExplosiveBarrels
                        hitSomething = true;
                        break;
                    }
                }
                if (hitSomething) continue;

                if (checkCollision(updatedBullet, player)) {
                    _takeDamage(updatedBullet.damage, updatedBullet.sourceType);
                    hitSomething = true;
                }
                if (hitSomething) continue;

                for (const ally of allies) {
                    if (checkCollision(updatedBullet, ally)) {
                        if (now >= (ally.invincibleUntil || 0)) {
                            const currentUpdates = allyUpdateMap.get(ally.id) || {};
                            const currentHealth = currentUpdates.health ?? ally.health;
                            const damageDealt = Math.round(updatedBullet.damage * difficultyModifiers.playerDamageTaken);
                            const newHealth = currentHealth - damageDealt;
                            
                            damageNumbers.push({ id: uuid(), position: { x: ally.position.x, y: ally.position.y - 10 }, amount: damageDealt, createdAt: now, isCrit: false });

                            let newDialogue = currentUpdates.dialogue ?? ally.dialogue;
                            let newLastDialogueTime = currentUpdates.lastDialogueTime ?? ally.lastDialogueTime;
                            if (now > (newLastDialogueTime || 0) + 5000) {
                                newLastDialogueTime = now;
                                const hurtDialogueOptions = ALLY_HURT_DIALOGUE[state.settings.language];
                                const text = hurtDialogueOptions[Math.floor(Math.random() * hurtDialogueOptions.length)];
                                newDialogue = { text, displayUntil: now + 4000 };
                                dialogueHistory.push({ id: uuid(), speaker: ally.name, text, createdAt: now, speakerType: 'ally' });
                            }

                            allyUpdateMap.set(ally.id, { 
                                ...currentUpdates, 
                                health: newHealth, 
                                invincibleUntil: now + INVINCIBILITY_DURATION,
                                dialogue: newDialogue,
                                lastDialogueTime: newLastDialogueTime
                            });
                        }
                        hitSomething = true;
                        break;
                    }
                }
                if (hitSomething) continue;

                if (now - updatedBullet.createdAt > (updatedBullet.lifespan || BOSS_BULLET_LIFESPAN)) {
                    if (updatedBullet.onImpact) {
                        damageZones.push({ id: uuid(), type: updatedBullet.onImpact.type, position: updatedBullet.position, size: updatedBullet.onImpact.size, damage: updatedBullet.onImpact.damage, duration: updatedBullet.onImpact.duration, createdAt: now });
                    }
                    continue;
                }
                nextEnemyBullets.push(updatedBullet);
            }
            enemyBullets = nextEnemyBullets;
            
            // Homing Enemy Bullet Movement & Collision
            let newHomingEnemyBullets: HomingEnemyBullet[] = [];
            for (const b of homingEnemyBullets) {
                if (now - b.createdAt > (b.lifespan || BOSS_BULLET_LIFESPAN)) continue;

                let newVelocity = { ...b.velocity };
                
                // Homing logic
                let target: Player | null = null;
                if (b.targetId === 'player') {
                    target = player;
                }
                
                if (target) {
                    const dx = target.position.x + target.size.width / 2 - (b.position.x + b.size.width / 2);
                    const dy = target.position.y + target.size.height / 2 - (b.position.y + b.size.height / 2);
                    const angleToTarget = Math.atan2(dy, dx);
                    const currentAngle = Math.atan2(b.velocity.y, b.velocity.x);
                    
                    let angleDiff = angleToTarget - currentAngle;
                    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                    
                    const turnAmount = Math.min(Math.abs(angleDiff), b.turnSpeed);
                    const newAngle = currentAngle + Math.sign(angleDiff) * turnAmount;

                    const speed = Math.sqrt(b.velocity.x**2 + b.velocity.y**2);
                    newVelocity.x = Math.cos(newAngle) * speed;
                    newVelocity.y = Math.sin(newAngle) * speed;
                }

                const updatedBullet = {
                    ...b,
                    position: {
                        x: b.position.x + newVelocity.x,
                        y: b.position.y + newVelocity.y,
                    },
                    velocity: newVelocity,
                };
                updatedBullet.position = handleWrapAround(updatedBullet);

                let hitSomething = false;

                if (checkCollision(updatedBullet, player)) {
                    _takeDamage(updatedBullet.damage, updatedBullet.sourceType);
                    hitSomething = true;
                }
                
                if (!hitSomething) {
                    for (const ally of allies) {
                        if (checkCollision(updatedBullet, ally)) {
                             if (now >= (ally.invincibleUntil || 0)) {
                                const currentUpdates = allyUpdateMap.get(ally.id) || {};
                                const currentHealth = currentUpdates.health ?? ally.health;
                                const damageDealt = Math.round(updatedBullet.damage * difficultyModifiers.playerDamageTaken);
                                const newHealth = currentHealth - damageDealt;
                                
                                damageNumbers.push({ id: uuid(), position: { x: ally.position.x, y: ally.position.y - 10 }, amount: damageDealt, createdAt: now, isCrit: false });

                                let newDialogue = currentUpdates.dialogue ?? ally.dialogue;
                                let newLastDialogueTime = currentUpdates.lastDialogueTime ?? ally.lastDialogueTime;
                                if (now > (newLastDialogueTime || 0) + 5000) {
                                    newLastDialogueTime = now;
                                    const hurtDialogueOptions = ALLY_HURT_DIALOGUE[state.settings.language];
                                    const text = hurtDialogueOptions[Math.floor(Math.random() * hurtDialogueOptions.length)];
                                    newDialogue = { text, displayUntil: now + 4000 };
                                    dialogueHistory.push({ id: uuid(), speaker: ally.name, text, createdAt: now, speakerType: 'ally' });
                                }

                                allyUpdateMap.set(ally.id, { 
                                    ...currentUpdates, 
                                    health: newHealth, 
                                    invincibleUntil: now + INVINCIBILITY_DURATION,
                                    dialogue: newDialogue,
                                    lastDialogueTime: newLastDialogueTime
                                });
                            }
                            hitSomething = true;
                            break;
                        }
                    }
                }
                
                if (!hitSomething) {
                    for (const obs of allObstacles) {
                        if (checkCollision(updatedBullet, obs)) {
                            hitSomething = true;
                            break;
                        }
                    }
                }

                if (!hitSomething) {
                    newHomingEnemyBullets.push(updatedBullet);
                }
            }
            homingEnemyBullets = newHomingEnemyBullets;

            allies = allies.map(ally => allyUpdateMap.has(ally.id) ? { ...ally, ...allyUpdateMap.get(ally.id) } : ally);
            
            // --- Ally Dialogue Logic ---
            allies = allies.map(ally => {
                let updatedAlly = {...ally};
                const wasJustHurt = allyUpdateMap.has(ally.id) && allyUpdateMap.get(ally.id)?.dialogue;
                if(wasJustHurt) return updatedAlly;

                const dialogueCooldown = 15000; // 15 seconds cooldown
                if (now - (updatedAlly.lastDialogueTime || 0) > dialogueCooldown && Math.random() < 0.25) { // 25% chance to speak after cooldown
                    updatedAlly.lastDialogueTime = now;
                    
                    const lang = state.settings.language;
                    let dialogueSet: { zh: string[]; en: string[] };
                    
                    if (livingMonsters.length > 0) {
                        const isBossPresent = livingMonsters.some(m => m.type === 'boss');
                        if (isBossPresent) {
                            dialogueSet = ALLY_BOSS_ENCOUNTER_DIALOGUE;
                        } else {
                            dialogueSet = ALLY_IDLE_DIALOGUE; // Use general combat dialogue
                        }
                    } else {
                        dialogueSet = ALLY_IDLE_DIALOGUE;
                    }
                    
                    const dialoguePool = dialogueSet[lang];
                    const text = dialoguePool[Math.floor(Math.random() * dialoguePool.length)];
                    updatedAlly.dialogue = { text, displayUntil: now + 4000 };
                    dialogueHistory.push({ id: uuid(), speaker: updatedAlly.name, text, createdAt: now, speakerType: 'ally' });
                }
                return updatedAlly;
            });

            // --- Player-Monster & Boss Collision ---
            monsters.forEach(monster => {
                if (monster.diesAt) return; // Dying monsters don't collide
                if (checkCollision(player, monster)) {
                     if (monster.type === 'boss' && monster.aiState?.type === 'dashing') {
                        player.health = Math.floor(player.health / 2);
                        const safePos = findSafeTeleportLocation(player.size, allObstacles);
                        visualEffects.push({ id: uuid(), type: 'teleport_afterimage', position: player.position, size: player.size, createdAt: now, duration: 300, color: 'rgba(255, 0, 0, 0.7)' });
                        player.position = safePos;
                        player.teleportedByBossAt = now;
                        player.timeAtLastPosition = now;
                        if (monster.aiState) {
                            monster.aiState.type = 'hesitate';
                            monster.aiState.lastActionTime = now;
                        }
                    } else {
                        _takeDamage(10 * state.difficultyModifiers.monsterDamage, monster.type);
                        if (player.thornsDamage && player.thornsDamage > 0) {
                            monster.health -= player.thornsDamage;
                            damageNumbers.push({ id: uuid(), position: { ...monster.position }, amount: Math.round(player.thornsDamage), createdAt: now, isCrit: false, isDoT: true });
                        }
                    }
                }
            });
            
            // Ally-Monster Collision
            allies.forEach(ally => {
                if (now < (ally.invincibleUntil || 0)) return;
                for (const monster of monsters) {
                    if (monster.diesAt) continue;
                    if (checkCollision(ally, monster)) {
                        const damageDealt = Math.round(10 * difficultyModifiers.monsterDamage);
                        ally.health -= damageDealt;
                        ally.invincibleUntil = now + INVINCIBILITY_DURATION;
                        damageNumbers.push({ id: uuid(), position: { x: ally.position.x, y: ally.position.y - 10 }, amount: damageDealt, createdAt: now, isCrit: false });
                        break;
                    }
                }
            });


            // --- Post-collision cleanup ---
            const newlyKilledMonsters: Monster[] = [];
            monsters = monsters.map(m => {
                if (m.health <= 0 && !m.diesAt) {
                    const newM = { ...m };
                    newlyKilledMonsters.push(newM);
                    
                    let chosenEffect: Monster['deathEffect'];
                    if (newM.type === 'normal' && Math.random() < 0.3) {
                        chosenEffect = 'run_and_explode';
                    } else {
                        const effects: Monster['deathEffect'][] = ['explode', 'run_wild', 'spin_fade'];
                        chosenEffect = effects[Math.floor(Math.random() * effects.length)];
                    }
                    
                    return {
                        ...newM,
                        diesAt: now,
                        deathEffect: chosenEffect,
                        deathAnimationData: ['spin_fade', 'run_and_explode', 'run_wild'].includes(chosenEffect) ? { spinAngle: 0 } : {},
                    };
                }
                return m;
            });
            
            obstacles = obstacles.filter(o => o.health > 0);
            allObstacles = [...obstacles, ...explosiveBarrels]; // Update allObstacles after cleanup

            if (newlyKilledMonsters.length > 0) {
                 if (newlyKilledMonsters.length >= 4 && Math.random() < 0.3) {
                    const praiseOptions = PLAYER_PRAISE_DIALOGUE[state.settings.language];
                    achievements.push({ id: uuid(), title: t('praiseTitle'), message: praiseOptions[Math.floor(Math.random() * praiseOptions.length)], createdAt: now, category: 'praise' });
                }

                newlyKilledMonsters.forEach(m => {
                    score += Math.floor((m.level || 1) * 10 * (1 + (m.empoweredLevel || 0) * 0.5));
                    experienceGems.push({ id: uuid(), position: m.position, size: { width: XP_GEM_SIZE, height: XP_GEM_SIZE }, xpValue: m.xpValue });
                    if (Math.random() < DROP_CHANCE_HEALTH) healthPacks.push({ id: uuid(), position: m.position, size: {width: HEALTH_PACK_SIZE, height: HEALTH_PACK_SIZE} });
                    if (Math.random() < DROP_CHANCE_SHIELD) shieldPacks.push({ id: uuid(), position: m.position, size: {width: SHIELD_PACK_SIZE, height: SHIELD_PACK_SIZE} });
                    
                    if (m.type === 'bloater') {
                        explosions.push({ id: uuid(), position: { x: m.position.x + m.size.width / 2, y: m.position.y + m.size.height / 2 }, size: { width: 250, height: 250 }, createdAt: now, duration: EXPLOSION_DURATION, damage: 80 });
                        damageZones.push({ id: uuid(), type: 'goop', position: { x: m.position.x - 50, y: m.position.y - 50 }, size: { width: m.size.width + 100, height: m.size.height + 100 }, damage: 0, duration: 8000, createdAt: now, slow: 0.5 });
                        for (let i = 0; i < 3; i++) {
                            const health = 20 * difficultyModifiers.monsterHealth;
                            monsters.push({
                                id: uuid(),
                                type: 'minion',
                                position: { x: m.position.x + randomInRange(-20, 20), y: m.position.y + randomInRange(-20, 20) },
                                size: { width: MINION_SIZE, height: MINION_SIZE },
                                speed: 1.5 * difficultyModifiers.monsterSpeed,
                                health: health,
                                maxHealth: health,
                                xpValue: 2,
                                spawnTime: now,
                            });
                        }
                    }

                    if (m.type === 'elite' || m.type === 'boss') {
                        if (Math.random() < CARD_PACK_DROP_CHANCE) {
                            onCardPackGained();
                            achievements.push({ id: uuid(), title: t('cardPackAcquired'), message: '', createdAt: now, category: 'announcement' });
                        }
                        const weaponToUpgrade = equippedWeapons[player.equippedWeaponIndex] || INITIAL_WEAPON;
                        const newWeapon = generateUpgradedWeapon(weaponToUpgrade, state.wave);
                        if (newWeapon) {
                            weaponDrops.push({ id: uuid(), position: m.position, size: { width: 32, height: 32 }, weapon: newWeapon });
                        }
                    }
                    killCounts[m.type] = (killCounts[m.type] || 0) + 1;
                });
                // --- New Achievement Checks for Monster Kills ---
                MONSTER_KILL_ACHIEVEMENT_THRESHOLDS.forEach(ach => {
                    if (!unlockedAchievements.has(ach.id) && (killCounts[ach.type] || 0) >= ach.count) {
                        unlockedAchievements.add(ach.id);
                        achievements.push({ id: uuid(), message: t(ach.title as keyof typeof translations.en), createdAt: now, category: 'achievement' });
                    }
                });
            }

             // --- Pickup Collection ---
            experienceGems = experienceGems.filter(gem => {
                const distSq = (gem.position.x - player.position.x)**2 + (gem.position.y - player.position.y)**2;
                if (distSq < player.gemMagnetRadius**2) {
                     const dx = player.position.x - gem.position.x;
                     const dy = player.position.y - gem.position.y;
                     const dist = Math.sqrt(distSq);
                     gem.position.x += (dx/dist) * 10;
                     gem.position.y += (dy/dist) * 10;
                }
                if (checkCollision(player, gem)) {
                    player.xp += gem.xpValue * state.difficultyModifiers.xpGain;
                    return false;
                }
                return true;
            });
            healthPacks = healthPacks.filter(p => {
                if (checkCollision(player, p)) {
                    player.health = Math.min(player.maxHealth, player.health + 25);
                    visualEffects.push({ id: uuid(), type: 'focus_ring', targetId: player.id, position: player.position, size: player.size, createdAt: now, duration: FOCUS_RING_DURATION });
                    return false;
                }
                return true;
            });
            shieldPacks = shieldPacks.filter(p => {
                if (checkCollision(player, p)) {
                    player.shield = Math.min(player.maxShield, player.shield + 25);
                    visualEffects.push({ id: uuid(), type: 'focus_ring', targetId: player.id, position: player.position, size: player.size, createdAt: now, duration: FOCUS_RING_DURATION });
                    return false;
                }
                return true;
            });
             treasureChests = treasureChests.filter(c => {
                if (checkCollision(player, c)) {
                    const randomBuff = PREDEFINED_BUFFS[Math.floor(Math.random() * PREDEFINED_BUFFS.length)];
                    player.buffs.push({ ...randomBuff, id: uuid(), createdAt: now });
                    achievements.push({ id: uuid(), title: t('treasureAcquired'), message: randomBuff.title[state.settings.language], createdAt: now, category: 'announcement' });
                    visualEffects.push({ id: uuid(), type: 'focus_ring', targetId: player.id, position: player.position, size: player.size, createdAt: now, duration: FOCUS_RING_DURATION });
                    return false;
                }
                return true;
            });
            weaponDrops = weaponDrops.filter(drop => {
                if (checkCollision(player, drop)) {
                    const emptySlotIndex = equippedWeapons.findIndex(w => w === null);
                    if (emptySlotIndex !== -1) {
                        equippedWeapons[emptySlotIndex] = drop.weapon;
                    } else {
                        equippedWeapons[player.equippedWeaponIndex] = drop.weapon;
                    }
                    visualEffects.push({ id: uuid(), type: 'focus_ring', targetId: player.id, position: player.position, size: player.size, createdAt: now, duration: FOCUS_RING_DURATION });
                    return false;
                }
                return true;
            });

            // --- Level Up Check ---
            if (player.xp >= player.xpToNextLevel) {
                player.level += 1;
                player.xp -= player.xpToNextLevel;
                player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.5);
                const choices = [...PREDEFINED_UPGRADES].sort(() => 0.5 - Math.random()).slice(0, 3);
                return { ...state, player, isLevelingUp: true, levelUpChoices: choices };
            }

            // --- Wave Progression & Spawning ---
            let monstersKilledThisWave = state.monstersKilledThisWave + newlyKilledMonsters.filter(m => m.type !== 'boss').length;
            let wave = state.wave;
            let monstersToKillForNextWave = state.monstersToKillForNextWave;
            let { isWaitingForBossClear, isBossWave } = state;

            if (!isWaitingForBossClear && !isBossWave && monstersKilledThisWave >= monstersToKillForNextWave) {
                isWaitingForBossClear = true;
            }

            if (isWaitingForBossClear && monsters.filter(m => !m.diesAt && m.type !== 'boss').length === 0) {
                isWaitingForBossClear = false;
                isBossWave = true;
                const bossTheme = state.currentWaveTheme;
                if (bossTheme) {
                    let waveHealthBonus = 0;
                    if (wave > 1) {
                        waveHealthBonus = 200 + (wave - 2) * 150;
                    }
                    const health = (800 + wave * 150 + waveHealthBonus * 5) * difficultyModifiers.monsterHealth;
                    const pos = findSafeTeleportLocation({width: BOSS_SIZE, height: BOSS_SIZE}, allObstacles);
                    monsters.push({
                        id: uuid(), name: bossTheme.bossName, position: pos, size: { width: BOSS_SIZE, height: BOSS_SIZE },
                        type: 'boss', speed: (1.5 + wave * 0.1) * difficultyModifiers.monsterSpeed,
                        health, maxHealth: health, xpValue: 200, level: wave, phase: 1,
                        spawnTime: now,
                    });
                     achievements.push({ id: uuid(), title: t('bossAppears'), message: '', createdAt: now, category: 'announcement' });
                     const remarkOptions = GAME_REMARKS_DIALOGUE.boss_encounter[state.settings.language];
                     const remark = remarkOptions[Math.floor(Math.random() * remarkOptions.length)];
                     achievements.push({ id: uuid(), title: t('gameSpeaker'), message: remark, createdAt: now, category: 'game_remark' });

                     const dialogueSet = THEMATIC_BOSS_DIALOGUE[bossTheme.bossName.en]?.spawn || BOSS_SPAWN_DIALOGUE;
                     const dialoguePool = dialogueSet[state.settings.language];
                     const text = dialoguePool[Math.floor(Math.random() * dialoguePool.length)];
                     dialogueHistory.push({ id: uuid(), speaker: bossTheme.bossName[state.settings.language], text, createdAt: now, speakerType: 'boss' });
                }
            }
             const bossKilled = newlyKilledMonsters.find(m => m.type === 'boss');
            if (isBossWave && bossKilled) {
                isBossWave = false;
                wave += 1;
                monstersKilledThisWave = 0;
                monstersToKillForNextWave = Math.floor(monstersToKillForNextWave * 1.2 + 5);
                state.currentWaveTheme = generateThematicWave(wave);
                state.waveThemeDisplayUntil = now + 4000;
                
                const dialogueSet = THEMATIC_BOSS_DIALOGUE[bossKilled.name?.en || '']?.defeat || BOSS_DEFEAT_DIALOGUE;
                const dialoguePool = dialogueSet[state.settings.language];
                const text = dialoguePool[Math.floor(Math.random() * dialoguePool.length)];
                dialogueHistory.push({ id: uuid(), speaker: bossKilled.name?.[state.settings.language] || t('bossAppears'), text, createdAt: now, speakerType: 'boss' });
                
                // Regenerate world objects for the new wave
                const avoidZones = [
                    { id: 'player_zone', position: player.position, size: {width: 200, height: 200} },
                    ...allies.map(a => ({ id: a.id, position: a.position, size: a.size })),
                    ...weaponDrops.map(d => ({ id: d.id, position: d.position, size: d.size })),
                    ...healthPacks.map(p => ({ id: p.id, position: p.position, size: p.size })),
                    ...shieldPacks.map(p => ({ id: p.id, position: p.position, size: p.size })),
                    ...treasureChests.map(c => ({ id: c.id, position: c.position, size: c.size })),
                ];

                const { obstacles: newObstacles, barrels: newBarrels } = generateWorldObjects(avoidZones);
                obstacles = newObstacles;
                explosiveBarrels = newBarrels;
                state.lastObstacleRefreshWave = wave;

                WAVE_ACHIEVEMENT_THRESHOLDS.forEach(ach => {
                    if (!unlockedAchievements.has(ach.id) && wave >= ach.wave) {
                        unlockedAchievements.add(ach.id);
                        achievements.push({ id: uuid(), message: t(ach.title as keyof typeof translations.en), createdAt: now, category: 'achievement' });
                    }
                });

                // --- Special Event Trigger ---
                if (Math.random() < 0.3) { // 30% chance for a special event
                    const eventTypeRoll = Math.random();
                    if (eventTypeRoll < 0.5) { // Meteor Shower
                        activeEvent = {
                            type: 'meteor_shower',
                            title: { en: 'Meteor Shower', zh: '流星雨' },
                            expiresAt: now + 15000, // 15 seconds
                            lastTick: now,
                        };
                    } else { // Treasure Trove
                        activeEvent = {
                            type: 'treasure_trove',
                            title: { en: 'Treasure Trove', zh: '宝藏涌现' },
                            expiresAt: now + 5000, // Duration for announcement
                        };
                        for (let i = 0; i < 5; i++) {
                            const pos = findSafeTeleportLocation({width: TREASURE_CHEST_SIZE, height: TREASURE_CHEST_SIZE}, [...allObstacles, ...treasureChests]);
                            treasureChests.push({ id: uuid(), position: pos, size: { width: TREASURE_CHEST_SIZE, height: TREASURE_CHEST_SIZE }});
                        }
                    }
                    achievements.push({ id: uuid(), title: t('specialEvent'), message: activeEvent.title[state.settings.language], createdAt: now, category: 'announcement' });
                }
            }

            const monsterSpawnInterval = Math.max(200, 3000 - wave * 100);
            const maxMonsters = 15 + wave * 3;
            if (!isWaitingForBossClear && !isBossWave && now - lastMonsterSpawnTime > monsterSpawnInterval && monsters.filter(m => !m.diesAt).length < maxMonsters) {
                lastMonsterSpawnTime = now;
                
                // Determine monster type and size first
                const typeRoll = Math.random();
                const type: Monster['type'] = 
                    typeRoll < 0.1 ? 'elite' :
                    typeRoll < 0.2 ? 'shooter' :
                    typeRoll < 0.3 ? 'healer' :
                    typeRoll < 0.4 ? 'summoner' :
                    typeRoll < 0.45 ? 'wisp' :
                    typeRoll < 0.5 ? 'bloater' : 'normal';

                const getSizeForType = (t: Monster['type']) => {
                    switch (t) {
                        case 'elite': return ELITE_MONSTER_SIZE;
                        case 'boss': return BOSS_SIZE;
                        case 'minion': return MINION_SIZE;
                        case 'healer': return HEALER_SIZE;
                        case 'summoner': return SUMMONER_SIZE;
                        case 'wisp': return WISP_SIZE;
                        case 'bloater': return BLOATER_SIZE;
                        default: return MONSTER_SIZE;
                    }
                };
                const size = getSizeForType(type);

                // Determine spawn position randomly within the world, but not too close to the player.
                let pos: Vector2D;
                const minSpawnDistFromPlayer = 300; // Minimum distance from player
                let tries = 0;
                do {
                    pos = {
                        x: randomInRange(0, WORLD_WIDTH - size),
                        y: randomInRange(0, WORLD_HEIGHT - size),
                    };
                    tries++;
                    // Check distance to player
                    const dx = pos.x - player.position.x;
                    const dy = pos.y - player.position.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq > minSpawnDistFromPlayer * minSpawnDistFromPlayer) {
                        break; // Found a good spot
                    }
                } while (tries < 50); // Failsafe to prevent infinite loop
                 
                 let waveHealthBonus = 0;
                 if (wave > 1) {
                     waveHealthBonus = 200 + (wave - 2) * 150;
                 }
                 const health = ((type === 'elite' ? 200 : 50) + wave * 15 + waveHealthBonus) * state.difficultyModifiers.monsterHealth;
                 const monsterName = state.currentWaveTheme?.monsterNames?.[type];
                 monsters.push({
                     id: uuid(), name: monsterName, position: pos, size: {width: size, height: size},
                     type, speed: (1.2 + Math.random() * 0.5) * state.difficultyModifiers.monsterSpeed,
                     health, maxHealth: health, xpValue: type === 'elite' ? 50 : 10, level: wave,
                     spawnTime: now,
                 });
            }

            // --- Ally & Treasure Chest Spawning ---
            if (now > state.nextAllySpawnTime && allies.length < MAX_ALLIES) {
                const count = Math.random() < ALLY_SPAWN_CHANCE_TRIPLE ? 3 : (Math.random() < ALLY_SPAWN_CHANCE_DOUBLE ? 2 : 1);
                for(let i = 0; i < count; i++) {
                    const { fullName } = generatePlayerName(state.settings.language);
                    const newAlly : Ally = {
                        id: uuid(), name: fullName,
                        position: { x: player.position.x + randomInRange(-50, 50), y: player.position.y + randomInRange(-50, 50) },
                        size: { width: ALLY_SIZE, height: ALLY_SIZE },
                        health: 100, maxHealth: 100,
                        weapon: PREDEFINED_WEAPONS[Math.floor(Math.random() * PREDEFINED_WEAPONS.length)],
                        speed: 3, aiBehavior: state.settings.aiBehavior,
                        autoWalkState: { target: null, lastDirectionChange: 0, randomDirection: {x: 1, y: 0} },
                        lastShotTime: 0, level: player.level,
                        disappearsAt: now + 60000, spawnTime: now,
                        visualState: 'idle',
                    };
                    allies.push(newAlly);
                    visualEffects.push({ id: uuid(), type: 'focus_ring', targetId: newAlly.id, position: newAlly.position, size: newAlly.size, createdAt: now, duration: FOCUS_RING_DURATION });
                }
                achievements.push({ id: uuid(), title: t('allyArrival'), message: '', createdAt: now, category: 'announcement' });
                state.nextAllySpawnTime = now + randomInRange(90, 150) * 1000;
            }
            if (now - state.lastTreasureChestSpawnTime > 30000 && treasureChests.length < MAX_TREASURE_CHESTS) {
                state.lastTreasureChestSpawnTime = now;
                const pos = findSafeTeleportLocation({width: TREASURE_CHEST_SIZE, height: TREASURE_CHEST_SIZE}, allObstacles);
                treasureChests.push({ id: uuid(), position: pos, size: { width: TREASURE_CHEST_SIZE, height: TREASURE_CHEST_SIZE }});
            }
            
            // --- Camera Update ---
            const targetCameraX = player.position.x - viewport.width / 2;
            const targetCameraY = player.position.y - viewport.height / 2;
            let camera = { ...state.camera };
            camera.x += (targetCameraX - camera.x) * 0.1;
            camera.y += (targetCameraY - camera.y) * 0.1;
            camera.x = Math.max(0, Math.min(WORLD_WIDTH - viewport.width, camera.x));
            camera.y = Math.max(0, Math.min(WORLD_HEIGHT - viewport.height, camera.y));

            // --- Final State Assembly & Cleanup ---
            const trulyDeadMonsters = monsters.filter(m => m.diesAt && now - m.diesAt >= DEATH_ANIMATION_DURATION);
            trulyDeadMonsters.forEach(m => {
                if (m.deathEffect === 'explode' || m.deathEffect === 'run_and_explode') {
                    const explosionSize = m.deathEffect === 'run_and_explode' ? m.size.width * 2.5 : m.size.width * 2;
                    const damage = m.deathEffect === 'run_and_explode' ? 25 : 0;
                    explosions.push({ id: uuid(), position: { x: m.position.x + m.size.width / 2, y: m.position.y + m.size.height / 2 }, size: { width: explosionSize, height: explosionSize }, createdAt: now, duration: EXPLOSION_DURATION, damage: damage });
                }
            });
            monsters = monsters.filter(m => !m.diesAt || now - m.diesAt < DEATH_ANIMATION_DURATION);
            
            // Cleanup departing and dead allies
            const departingAllies = allies.filter(a => now > a.disappearsAt);
            if (departingAllies.length > 0) {
                achievements.push({ id: uuid(), title: t('allyDeparted'), message: '', createdAt: now, category: 'announcement' });
            }
            allies = allies.filter(a => now <= a.disappearsAt);

            const deadAllies = allies.filter(a => a.health <= 0);
            if (deadAllies.length > 0) {
                const remarkOptions = GAME_REMARKS_DIALOGUE.ally_death[state.settings.language];
                const remark = remarkOptions[Math.floor(Math.random() * remarkOptions.length)];
                dialogueHistory.push({ id: uuid(), speaker: t('gameSpeaker'), text: remark, createdAt: now, speakerType: 'game' });
            }
            allies = allies.filter(a => a.health > 0);

            // Cleanup and refresh targeted entities
            targetedMonsters = targetedMonsters.map(m => {
                if (m && now - m.lastHitTime > TARGET_INFO_LOCK_DURATION) {
                    return null;
                }
                if (m) {
                    const latestMonsterData = monsters.find(monster => monster.id === m.id);
                    if (latestMonsterData) {
                        return { ...latestMonsterData, lastHitTime: m.lastHitTime, lockedUntil: m.lockedUntil };
                    } else {
                        return null; // Monster is dead and removed from main array
                    }
                }
                return m;
            });

            if (targetedObstacle && now - targetedObstacle.lastHitTime > TARGET_INFO_LOCK_DURATION) {
                targetedObstacle = null;
            } else if (targetedObstacle) {
                const latestObstacleData = allObstacles.find(o => o.id === targetedObstacle.id);
                if (latestObstacleData) {
                    targetedObstacle = { ...latestObstacleData, lastHitTime: targetedObstacle.lastHitTime, lockedUntil: targetedObstacle.lockedUntil };
                } else {
                    targetedObstacle = null; // Obstacle was destroyed
                }
            }


            player.lastPosition = { ...player.position };
            return {
                ...state, player, allies, monsters, bullets, enemyBullets, homingEnemyBullets, weaponDrops, experienceGems,
                damageNumbers, obstacles, explosiveBarrels, explosions, damageZones, visualEffects, healthPacks, shieldPacks,
                treasureChests, orbitals, score, screenShake, camera, lastMonsterSpawnTime, wave, monstersKilledThisWave, monstersToKillForNextWave,
                isWaitingForBossClear, isBossWave,
                achievements, dialogueHistory, equippedWeapons, killCounts, unlockedAchievements,
                targetedMonsters, targetedObstacle, activeEvent,
            };
        });
    }, [viewport.width, viewport.height, onCardPackGained, handleReload]);
    
    // Set the initial wave theme when the component mounts.
    useEffect(() => {
        setGameState(prev => ({
            ...prev,
            currentWaveTheme: generateThematicWave(1),
            waveThemeDisplayUntil: Date.now() + 4000
        }));
    }, []);

    // Start the game loop interval.
    useEffect(() => {
        const timer = setInterval(gameLoop, 1000 / 60); // Run at 60 FPS.
        return () => clearInterval(timer); // Clean up the interval on unmount.
    }, [gameLoop]);

    return { gameState, setGameState, mousePosRef, joystickMoveRef, isShootingRef, handleReload };
}