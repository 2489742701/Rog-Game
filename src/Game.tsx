import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { GameState, UpgradeChoice, Difficulty, AIBehavior, Card, Weapon, Player, Ally } from './types';
import { useGameLoop } from './hooks/useGameLoop';
// FIX: Add FOCUS_RING_DURATION to imports.
import { translations, WORLD_WIDTH, WORLD_HEIGHT, MAX_DIALOGUE_HISTORY, ALLY_CURSED_UPGRADE_DIALOGUE, GAME_REMARKS_DIALOGUE, FOCUS_RING_DURATION } from './constants';
import { 
    PlayerComponent, AllyComponent, MonsterComponent, BulletComponent, EnemyBulletComponent, HomingEnemyBulletComponent,
    WeaponDropComponent, ExperienceGemComponent, TreasureChestComponent, OrbitalComponent, ExplosionComponent,
    DamageNumberComponent, ObstacleComponent, ExplosiveBarrelComponent, HealthPackComponent, ShieldPackComponent,
    DamageZoneComponent, VisualEffectComponent
} from './components/GameEntities';
import { 
    HUD, GameOverScreen, LevelUpScreen, SettingsMenu, WaveThemeAnnouncer, 
    MonsterIntroPopup, AchievementPopup, EffectsHUD, WeaponBar, DialogueLine, BuffBar
} from './components/GameUI';
import { Joystick } from './components/Joystick';
import { uuid } from './utils';

/**
 * @file This file contains the main Game component, which is the root of the active gameplay experience.
 * It orchestrates the game loop, rendering, and UI interactions during a run.
 */

interface GameProps {
  difficulty: Difficulty;
  aiBehavior: AIBehavior;
  onGameOver: (lang: 'zh' | 'en') => void;
  onPlayAgain: (lang: 'zh' | 'en') => void;
  onReturnToMenu: () => void;
  onCardPackGained: () => void;
  equippedCards: Card[];
}

/**
 * The main component that renders and manages an active game session.
 * It initializes the game loop, handles user input, and renders all game entities and UI elements.
 * @param {GameProps} props - The props required to initialize the game.
 * @returns {React.ReactElement} The rendered game.
 */
export const Game: React.FC<GameProps> = ({ difficulty, aiBehavior, onGameOver, onPlayAgain, onReturnToMenu, onCardPackGained, equippedCards }) => {
    // Detect if the user is on a mobile device to enable on-screen controls.
    const isMobile = useMemo(() => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent), []);
    
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const [viewport, setViewport] = useState({ width: 1200, height: 900 });

    // Use a ResizeObserver to dynamically update the viewport dimensions.
    // This ensures the camera and UI scale correctly if the window is resized.
    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setViewport({ width, height });
            }
        });
        const currentRef = gameAreaRef.current;
        if (currentRef) observer.observe(currentRef);
        return () => { if (currentRef) observer.unobserve(currentRef); };
    }, []);

    // The core of the game's logic is encapsulated in the useGameLoop custom hook.
    const { gameState, setGameState, mousePosRef, joystickMoveRef, isShootingRef, handleReload } = useGameLoop(isMobile, difficulty, aiBehavior, viewport, onCardPackGained, equippedCards);
    
    /**
     * A memoized translation function to avoid re-creating it on every render.
     * @param key - The key of the translation string.
     * @returns The translated string for the current language.
     */
    const tForRender = useCallback((key: keyof (typeof translations.zh & typeof translations.en)) => {
        const lang = gameState.settings.language;
        return translations[lang][key] || translations['en'][key];
    }, [gameState.settings.language]);

    /**
     * Callback for handling changes to game settings from the UI.
     * @param {K} key - The setting key to change.
     * @param {GameState['settings'][K]} value - The new value for the setting.
     */
    const handleSettingChange = useCallback(<K extends keyof GameState['settings']>(key: K, value: GameState['settings'][K]) => {
        setGameState(prev => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
    }, [setGameState]);

    /** Toggles the paused state of the game. */
    const handlePauseToggle = useCallback(() => {
        setGameState(prev => ({...prev, isPaused: !prev.isPaused }));
    }, [setGameState]);

    /**
     * Handles switching the player's active weapon.
     * @param {number} index - The index of the weapon to switch to.
     */
    const handleWeaponSwitch = useCallback((index: number) => {
        setGameState(prev => {
            // Prevent switching while reloading.
            if (prev.player.isReloading) return prev;
            return {
                ...prev,
                player: {
                    ...prev.player,
                    equippedWeaponIndex: index,
                }
            }
        });
    }, [setGameState]);

    /**
     * Applies the effects of a chosen upgrade to the player and game state.
     * This function is called when the player selects an option on the level-up screen.
     * @param {UpgradeChoice} choice - The selected upgrade.
     */
    const handleLevelUpSelect = useCallback((choice: UpgradeChoice) => {
        setGameState(prev => {
            let p = { ...prev.player };
            const newEquippedWeapons = prev.equippedWeapons.map(w => w ? { ...w } : null);
            
            const newAchievements = [...prev.achievements];
            let updatedAllies = [...prev.allies];
            let updatedDialogueHistory = [...prev.dialogueHistory];
            const newVisualEffects = [...prev.visualEffects];
            const t = (key: keyof (typeof translations.zh & typeof translations.en)) => translations[prev.settings.language][key];
            
            newVisualEffects.push({ id: uuid(), type: 'focus_ring', targetId: p.id, position: p.position, size: p.size, createdAt: Date.now(), duration: FOCUS_RING_DURATION });

            // Handle special logic for artifact and cursed upgrades.
            if (choice.isArtifact) {
                p.artifacts = [...p.artifacts, choice];
                const artifactRemarkOptions = GAME_REMARKS_DIALOGUE.artifact_upgrade[prev.settings.language];
                const artifactRemark = artifactRemarkOptions[Math.floor(Math.random() * artifactRemarkOptions.length)];
                newAchievements.push({ id: uuid(), title: t('gameSpeaker'), message: artifactRemark, createdAt: Date.now(), category: 'game_remark' });
            }

            if (choice.isCursed) {
                // Allies react to the player taking a cursed upgrade.
                if (updatedAllies.length > 0) {
                    // Fix: Explicitly define the dialogue set before accessing the language-specific array to help TypeScript's type inference.
                    const cursedDialogueSet = ALLY_CURSED_UPGRADE_DIALOGUE;
                    const cursedDialogueOptions = cursedDialogueSet[prev.settings.language];
                    const newText = cursedDialogueOptions[Math.floor(Math.random() * cursedDialogueOptions.length)];
                    const randomAllyIndex = Math.floor(Math.random() * updatedAllies.length);
                    const speakingAlly = updatedAllies[randomAllyIndex];
                    updatedAllies[randomAllyIndex] = { ...speakingAlly, dialogue: { text: newText, displayUntil: Date.now() + 4000 }};
                    updatedDialogueHistory.push({ id: uuid(), speaker: speakingAlly.name, text: newText, createdAt: Date.now(), speakerType: 'ally' });
                } else {
                    newAchievements.push({ id: uuid(), title: t('cursedUpgrade'), message: t('cursedUpgradeTaken'), createdAt: Date.now(), category: 'achievement' });
                }
                const gameRemarkOptions = GAME_REMARKS_DIALOGUE['cursed_upgrade'][prev.settings.language];
                const gameRemarkText = gameRemarkOptions[Math.floor(Math.random() * gameRemarkOptions.length)];
                newAchievements.push({ id: uuid(), title: t('gameSpeaker'), message: gameRemarkText, createdAt: Date.now(), category: 'game_remark' });
            }

            if (updatedDialogueHistory.length > MAX_DIALOGUE_HISTORY) {
                updatedDialogueHistory.splice(0, updatedDialogueHistory.length - MAX_DIALOGUE_HISTORY);
            }

            // Apply all effects from the chosen upgrade.
            choice.effects.forEach(effect => {
                switch (effect.type) {
                    case 'STAT_MOD': {
                        const { stat, op, value } = effect;
                         if (op === 'add') {
                            (p as any)[stat] = ((p as any)[stat] || 0) + value;
                            if (stat === 'maxHealth') p.health += value;
                            if (stat === 'maxShield') p.shield += value;
                        } else if (op === 'multiply') {
                            (p as any)[stat] = ((p as any)[stat] || 1) * value;
                        }
                        break;
                    }
                    case 'WEAPON_MOD': {
                        const { mod, value } = effect;
                        newEquippedWeapons.forEach(w => {
                            if (w) {
                                if(mod === 'piercing') w.piercing = (w.piercing || 1) + value;
                                if(mod === 'bulletCount') w.bulletCount = (w.bulletCount || 1) + value;
                            }
                        });
                        break;
                    }
                    case 'HEAL':
                        p.health = Math.min(p.maxHealth, p.health + p.maxHealth * (effect.amount / 100));
                        break;
                    case 'ADD_SHIELD':
                        p.shield = Math.min(p.maxShield, p.shield + effect.amount);
                        break;
                    case 'ORBITAL_SHIELD':
                        if (!p.orbitals) {
                            p.orbitals = { count: 0, damage: 0, speed: 0, radius: 0, angle: 0 };
                        }
                        p.orbitals.count += effect.count;
                        p.orbitals.damage = Math.max(p.orbitals.damage, effect.damage);
                        p.orbitals.speed = Math.max(p.orbitals.speed, effect.speed);
                        p.orbitals.radius = Math.max(p.orbitals.radius, effect.radius);
                        break;
                }
            });

            if (p.health > p.maxHealth) p.health = p.maxHealth;
            if (p.shield > p.maxShield) p.shield = p.maxShield;
            let newScore = prev.score;
            if (choice.isCursed) newScore = Math.floor(newScore * 1.2); 

            // Return the updated state, exiting the "leveling up" mode.
            return { ...prev, player: p, equippedWeapons: newEquippedWeapons, isLevelingUp: false, isPaused: false, score: newScore, levelUpChoices: [], achievements: newAchievements, allies: updatedAllies, dialogueHistory: updatedDialogueHistory, visualEffects: newVisualEffects };
        });
    }, [setGameState]);

    // Set up event listeners for keyboard and mouse input.
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handlePauseToggle();
            if (['1', '2', '3'].includes(e.key)) handleWeaponSwitch(parseInt(e.key, 10) - 1);
            if (e.key.toLowerCase() === 'r') { handleReload(); }
            if(!e.repeat) setGameState(prev => ({...prev, keys: { ...prev.keys, [e.key.toLowerCase()]: true }}));
        };
        const handleKeyUp = (e: KeyboardEvent) => setGameState(prev => ({...prev, keys: { ...prev.keys, [e.key.toLowerCase()]: false }}));
        const handleMouseMove = (e: MouseEvent) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        const handleMouseDown = () => { isShootingRef.current = true; };
        const handleMouseUp = () => { isShootingRef.current = false; };

        const gameArea = gameAreaRef.current;
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        gameArea?.addEventListener('mousemove', handleMouseMove as EventListener);
        gameArea?.addEventListener('mousedown', handleMouseDown as EventListener);
        gameArea?.addEventListener('mouseup', handleMouseUp as EventListener);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            gameArea?.removeEventListener('mousemove', handleMouseMove as EventListener);
            gameArea?.removeEventListener('mousedown', handleMouseDown as EventListener);
            gameArea?.removeEventListener('mouseup', handleMouseUp as EventListener);
        };
    }, [setGameState, mousePosRef, isShootingRef, handlePauseToggle, handleWeaponSwitch, handleReload]);

    // Calculate screen shake effect.
    const screenShakeX = gameState.settings.screenShakeEnabled ? (Math.random() - 0.5) * gameState.screenShake : 0;
    const screenShakeY = gameState.settings.screenShakeEnabled ? (Math.random() - 0.5) * gameState.screenShake : 0;
    
    // Combine all popups and achievements into one list, filtering for spam control.
    const allPopups = [...gameState.achievements];
    const booms = allPopups.filter(a => a.title === tForRender('boom'));
    const latestBoom = booms.length > 0 ? booms[booms.length - 1] : undefined;
    const latestPraises = allPopups.filter(a => a.category === 'praise').slice(-3);

    const displayedPopups = allPopups.filter(a => {
        if (a.category === 'praise') return latestPraises.includes(a);
        if (a.title === tForRender('boom')) return a.id === latestBoom?.id;
        return true;
    }).sort((a,b) => a.createdAt - b.createdAt); // Ensure oldest are first for flex-col-reverse

    const handleFireStart = useCallback(() => { isShootingRef.current = true; }, []);
    const handleFireStop = useCallback(() => { isShootingRef.current = false; }, []);
    
    const allEntities = useMemo(() => [...gameState.allies, gameState.player], [gameState.allies, gameState.player]);

    return (
        <div className="w-screen h-screen overflow-hidden bg-gray-800 flex flex-col select-none">
            <HUD state={gameState} t={tForRender} onSettingChange={handleSettingChange} onPause={handlePauseToggle} />
            <div
                ref={gameAreaRef}
                className="flex-grow relative bg-gray-900 overflow-hidden cursor-crosshair"
                style={{ 
                    transform: `translate(${screenShakeX}px, ${screenShakeY}px)`,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            >
                {/* Game World Container: This div is moved opposite to the camera to create the scrolling effect. */}
                <div style={{ transform: `translate(${-gameState.camera.x}px, ${-gameState.camera.y}px)`, width: WORLD_WIDTH, height: WORLD_HEIGHT, position: 'absolute' }}>
                    
                    {/* Render all game entities */}
                    {gameState.obstacles.map(o => <ObstacleComponent key={o.id} obstacle={o} />)}
                    {gameState.explosiveBarrels.map(b => <ExplosiveBarrelComponent key={b.id} barrel={b} />)}
                    <PlayerComponent player={gameState.player} />
                    {gameState.allies.map(a => <AllyComponent key={a.id} ally={a} />)}
                    {gameState.monsters.map(m => <MonsterComponent key={m.id} monster={m} />)}
                    {gameState.bullets.map(b => <BulletComponent key={b.id} bullet={b} />)}
                    {gameState.enemyBullets.map(b => <EnemyBulletComponent key={b.id} bullet={b} />)}
                    {gameState.homingEnemyBullets.map(b => <HomingEnemyBulletComponent key={b.id} bullet={b} />)}
                    {gameState.weaponDrops.map(d => <WeaponDropComponent key={d.id} drop={d} />)}
                    {gameState.experienceGems.map(g => <ExperienceGemComponent key={g.id} gem={g} />)}
                    {gameState.healthPacks.map(p => <HealthPackComponent key={p.id} pack={p} />)}
                    {gameState.shieldPacks.map(p => <ShieldPackComponent key={p.id} pack={p} />)}
                    {gameState.treasureChests.map(c => <TreasureChestComponent key={c.id} chest={c} />)}
                    {gameState.orbitals.map(o => <OrbitalComponent key={o.id} orbital={o} />)}
                    {gameState.explosions.map(e => <ExplosionComponent key={e.id} explosion={e} />)}
                    {gameState.damageZones.map(z => <DamageZoneComponent key={z.id} zone={z} />)}
                    {gameState.damageNumbers.map(dn => <DamageNumberComponent key={dn.id} damageNumber={dn} />)}
                    {gameState.visualEffects.map(e => {
                        const target = e.targetId ? allEntities.find(entity => entity.id === e.targetId) : undefined;
                        return <VisualEffectComponent key={e.id} effect={e} target={target} />
                    })}
                </div>
            </div>

            {/* UI Popups and Dialogue Layer */}
            <div className="absolute bottom-40 left-4 flex flex-col-reverse gap-2 z-40 pointer-events-none">
                {displayedPopups.map(ach => (
                    <AchievementPopup key={ach.id} achievement={ach} t={tForRender} />
                ))}
            </div>
            <div className="absolute top-20 right-4 flex flex-col gap-2 z-40 w-64 pointer-events-none">
                {gameState.dialogueHistory.map(entry => (
                    <DialogueLine key={entry.id} entry={entry} />
                ))}
            </div>
            {gameState.currentWaveTheme && Date.now() < gameState.waveThemeDisplayUntil && (
                <WaveThemeAnnouncer 
                    theme={gameState.currentWaveTheme} 
                    wave={gameState.wave} 
                    lang={gameState.settings.language}
                    t={tForRender}
                />
            )}
            {gameState.monsterIntro && <MonsterIntroPopup intro={gameState.monsterIntro} lang={gameState.settings.language} t={tForRender} />}


            {/* UI Overlay Layer */}
            <EffectsHUD player={gameState.player} lang={gameState.settings.language} />
            <BuffBar buffs={gameState.player.buffs} lang={gameState.settings.language} />
            <WeaponBar 
                equippedWeapons={gameState.equippedWeapons} 
                activeIndex={gameState.player.equippedWeaponIndex} 
                onSwitch={handleWeaponSwitch} 
                lang={gameState.settings.language}
                player={gameState.player}
                lastShotTime={gameState.lastShotTime}
            />
            {gameState.isGameOver && <GameOverScreen state={gameState} onPlayAgain={() => onPlayAgain(gameState.settings.language)} onMainMenu={() => onGameOver(gameState.settings.language)} t={tForRender} />}
            {gameState.isLevelingUp && <LevelUpScreen choices={gameState.levelUpChoices} onSelect={handleLevelUpSelect} lang={gameState.settings.language} t={tForRender} />}
            {gameState.isPaused && !gameState.isGameOver && !gameState.isLevelingUp && <SettingsMenu settings={gameState.settings} onSettingChange={handleSettingChange} onResume={handlePauseToggle} onReturnToMenu={onReturnToMenu} t={tForRender} />}
            
            {gameState.settings.showOnScreenControls && (
                <>
                    <Joystick onMove={(vec) => joystickMoveRef.current = vec} onStop={() => joystickMoveRef.current = null} />
                     <div className="fixed bottom-10 right-10 flex flex-col items-center gap-4 z-40">
                        <button 
                            onTouchStart={handleReload}
                            className="w-20 h-20 bg-blue-500 bg-opacity-50 rounded-full flex items-center justify-center text-white font-bold"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0M2.985 19.644A8.25 8.25 0 0116.023 9.348" />
                            </svg>
                        </button>
                        <button
                            onTouchStart={handleFireStart}
                            onTouchEnd={handleFireStop}
                            className="w-24 h-24 bg-red-500 bg-opacity-50 rounded-full flex items-center justify-center text-white font-bold"
                        >
                            FIRE
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};