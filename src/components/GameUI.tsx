import React, { useState, useEffect, memo } from 'react';
import type { GameState, UpgradeChoice, Monster, Achievement, LeaderboardEntry, Player, Weapon, DialogueEntry, Buff, Obstacle } from '../types';
import { MONSTER_DATA, translations, PISTOL_WEAPON, PLAYER_POISON_DURATION, DIALOGUE_LIFESPAN, ACHIEVEMENT_EXIT_DURATION } from '../constants';
import { getWeaponQualityInfo } from '../utils';

/** 成就/宝箱获得弹窗组件 */
export const AchievementPopup: React.FC<{ achievement: Achievement; t: (key: keyof (typeof translations.zh & typeof translations.en)) => string; }> = ({ achievement, t }) => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const { category = 'achievement', title, message } = achievement;
    
    let baseClasses = 'p-3 rounded-lg border-2 shadow-lg w-max max-w-md ';
    let textClasses = '';
    let titleClasses = 'font-bold text-lg';

    switch (category) {
        case 'praise':
            baseClasses += 'bg-cyan-500 border-cyan-700';
            textClasses = 'text-white';
            titleClasses += ' text-2xl';
            break;
        case 'announcement':
            textClasses = 'text-white';
            if (title === t('treasureAcquired')) baseClasses += 'bg-green-500 border-green-700';
            else if (title === t('cardPackAcquired')) baseClasses += 'bg-purple-500 border-purple-700';
            else if (title === t('boom')) {
                baseClasses += 'bg-red-600 border-red-800';
                titleClasses += ' text-3xl animate-ping';
            }
            else { baseClasses += 'bg-blue-500 border-blue-700'; }
            break;
        case 'special':
            baseClasses += 'bg-gradient-to-r from-gray-800 via-red-900 to-gray-800 border-red-500';
            textClasses = 'text-white';
            break;
        case 'game_remark':
            baseClasses += 'bg-gray-900 bg-opacity-80 border-yellow-500';
            textClasses = 'text-yellow-200';
            titleClasses += ' text-yellow-400';
            break;
        case 'achievement':
        default:
            textClasses = 'text-black';
            const isArtifact = title === t('artifactTitle');
            if (isArtifact) baseClasses += 'bg-gradient-to-r from-yellow-300 to-orange-400 border-black';
            else baseClasses += 'bg-yellow-400 border-black';
            break;
    }
    
    let animationClass = 'opacity-0 -translate-x-full';
    if (isMounted && !achievement.isExiting) {
        animationClass = 'achievement-popup-enter';
    } else if (achievement.isExiting) {
        animationClass = 'achievement-popup-exit';
    }
    
    return (
        <div className={`${baseClasses} ${animationClass} ${textClasses}`}>
            <h3 className={titleClasses}>{title || t('achievementUnlocked')}</h3>
            <p>{message}</p>
        </div>
    );
};

/** 对话侧边栏条目组件 */
export const DialogueLine: React.FC<{ entry: DialogueEntry }> = ({ entry }) => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const isFadingOut = entry.isExiting;
    const animationClass = isFadingOut ? 'achievement-popup-exit' : 'achievement-popup-enter';

    const speakerColor = {
        ally: 'text-teal-300',
        boss: 'text-red-400',
        thematic: 'text-purple-400',
        game: 'text-yellow-300',
    }[entry.speakerType || ''] || 'text-yellow-300'; // Default color
    
    return (
        <div className={`bg-black bg-opacity-60 p-2 rounded-md text-sm ${animationClass}`}>
            <span className={`font-bold ${speakerColor}`}>{entry.speaker}: </span>
            <span>{entry.text}</span>
        </div>
    );
};

/** 新波数宣告组件 */
export const WaveThemeAnnouncer: React.FC<{ 
    theme: NonNullable<GameState['currentWaveTheme']>; 
    wave: number;
    lang: 'zh' | 'en';
    t: (key: keyof (typeof translations.zh & typeof translations.en)) => string; 
}> = ({ theme, wave, lang, t }) => (
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 p-4 md:p-6 rounded-lg border-2 border-yellow-400 text-center z-40 achievement-popup-enter">
        <h2 className="text-2xl md:text-4xl font-bold text-yellow-300">{`${t('wave')} ${wave}: ${theme.title[lang]}`}</h2>
        <p className="mt-2 text-base md:text-lg text-gray-200">{theme.description[lang]}</p>
    </div>
);

const MonsterPreview: React.FC<{ type: Monster['type'] }> = memo(({ type }) => {
    const styles: Record<Monster['type'], { bg: string, border: string }> = {
        normal: { bg: 'bg-red-600', border: 'border-red-400' },
        elite: { bg: 'bg-purple-600', border: 'border-purple-400' },
        shooter: { bg: 'bg-pink-500', border: 'border-pink-300' },
        shotgun_shooter: { bg: 'bg-cyan-500', border: 'border-cyan-300' },
        healer: { bg: 'bg-green-500', border: 'border-green-300' },
        summoner: { bg: 'bg-indigo-500', border: 'border-indigo-300' },
        minion: { bg: 'bg-gray-500', border: 'border-gray-400' },
        wisp: { bg: 'bg-teal-300', border: 'border-teal-100' },
        boss: { bg: 'bg-yellow-500', border: 'border-yellow-300' },
        bloater: { bg: 'bg-orange-700', border: 'border-orange-500' },
        lich_guard: { bg: 'bg-gray-800', border: 'border-cyan-300' },
    };
    const style = styles[type] || styles['normal'];
    return <div className={`w-6 h-6 ${style.bg} border-2 ${style.border} mr-3 flex-shrink-0`}></div>;
});


/** 新怪物介绍弹窗组件 */
export const MonsterIntroPopup: React.FC<{ intro: NonNullable<GameState['monsterIntro']>; lang: 'zh' | 'en', t: (key: keyof typeof translations.zh) => string; }> = ({ intro, lang, t }) => {
    
    const monsterInfo = MONSTER_DATA[intro.type];
    
    const isVisible = Date.now() < intro.displayUntil;
    if (!monsterInfo || !isVisible) return null;

    return (
        <div className="fixed bottom-24 left-4 bg-gray-800 text-white p-4 rounded-lg border-2 border-red-500 shadow-lg w-80 z-[60] achievement-popup-enter">
            <h3 className="font-bold text-xl text-red-400 mb-2">{t('monsterIntroTitle')}</h3>
            <div className="flex items-start">
                <MonsterPreview type={intro.type} />
                <div className="flex-1">
                    <h4 className="font-bold text-lg">{monsterInfo.name[lang]}</h4>
                    <p className="text-sm text-gray-300 my-1">{monsterInfo.description[lang]}</p>
                </div>
            </div>
            <p className="text-xs text-yellow-300 italic mt-2">"{monsterInfo.tip[lang]}"</p>
        </div>
    );
};

/** Boss/锁定怪物信息组件 */
interface TargetInfoProps {
    monsters: Monster[];
    targetedMonsters: ((Monster & { lastHitTime: number; lockedUntil?: number; }) | null)[];
    targetedObstacle: (Obstacle & { lastHitTime: number; lockedUntil?: number; }) | null;
    isBossWave: boolean;
    lang: 'zh' | 'en';
    t: (key: keyof (typeof translations.zh & typeof translations.en)) => string;
}

const TargetInfo: React.FC<TargetInfoProps> = memo(({ monsters, targetedMonsters, targetedObstacle, isBossWave, lang, t }) => {
    // During a boss wave, always and only display the boss's health bar.
    if (isBossWave) {
        const boss = monsters.find(m => m.type === 'boss');
        if (boss) {
            const healthDisplay = Math.max(0, Math.ceil(boss.health));
            return (
                <div className="flex flex-col items-center">
                    <div className="text-xl font-bold">{boss.name?.[lang] || MONSTER_DATA[boss.type]?.name[lang] || boss.type}</div>
                    <div className="w-80 h-6 bg-gray-700 border-2 border-gray-500">
                        <div className="h-full bg-gradient-to-r from-red-500 to-yellow-500 transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, (boss.health / boss.maxHealth) * 100))}%` }}></div>
                    </div>
                    <div className="text-xs">{healthDisplay} / {boss.maxHealth}</div>
                </div>
            );
        }
    }
    
    // For non-boss waves, show targets from the dedicated slots.
    const displayTargets: ((Monster | Obstacle) & { lastHitTime: number })[] = targetedMonsters.filter((m): m is NonNullable<typeof m> => m !== null);
    if (targetedObstacle) {
        displayTargets.push(targetedObstacle);
    }


    if (displayTargets.length === 0) {
        return <div className="min-h-[44px]"></div>; // Placeholder to prevent layout shifts.
    }

    return (
        <div className="flex flex-row items-start justify-center gap-2">
            {displayTargets.map(target => {
                const isObstacle = 'maxHealth' in target && !('xpValue' in target);
                const name = isObstacle ? t('obstacle') : ((target as Monster).name?.[lang] || MONSTER_DATA[(target as Monster).type]?.name[lang] || (target as Monster).type);
                const healthDisplay = Math.max(0, Math.ceil(target.health));
                
                return (
                    <div key={target.id} className="flex flex-col items-center w-36">
                        <div className="text-xs font-bold truncate w-full text-center">{name}</div>
                        <div className="w-full h-3 bg-gray-700 border border-gray-500">
                            <div className="h-full bg-gradient-to-r from-red-500 to-yellow-500 transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(0, (target.health / target.maxHealth) * 100))}%` }}></div>
                        </div>
                        <div className="text-xs">{healthDisplay} / {target.maxHealth}</div>
                    </div>
                );
            })}
        </div>
    );
});


/** 游戏主界面HUD */
export const HUD: React.FC<{ 
    state: GameState; 
    t: (key: keyof (typeof translations.zh & typeof translations.en)) => string; 
    onSettingChange: <K extends keyof GameState['settings']>(key: K, value: GameState['settings'][K]) => void;
    onPause: () => void;
}> = ({ state, t, onSettingChange, onPause }) => {
    
    const waveDisplay = state.currentWaveTheme 
        ? `${t('wave')} ${state.wave}: ${state.currentWaveTheme.title[state.settings.language]}` 
        : `${t('wave')}: ${state.wave}`;

    const { player, equippedWeapons } = state;
    const lang = state.settings.language;
    const currentWeapon = equippedWeapons[player.equippedWeaponIndex] || PISTOL_WEAPON;
    const ammoInClip = currentWeapon.ammoInClip ?? 0;
    const reserveAmmo = (currentWeapon.durability ?? 0) > 9999 ? '∞' : Math.ceil(currentWeapon.durability ?? 0);
    const ammoText = `${ammoInClip} / ${reserveAmmo}`;
    const displayedDamage = ((player.baseDamage + currentWeapon.damage) * player.damageMultiplier).toFixed(1);
    const poisonEffect = player.statusEffects?.find(e => e.type === 'poison');

    return (
        <div className="p-2 md:p-4 bg-black bg-opacity-30 flex flex-col text-sm md:text-lg font-bold font-mono z-20 flex-shrink-0">
            <div className="flex justify-between items-start">
                 {/* 左侧信息: 玩家状态 */}
                <div className="flex-1 flex flex-col items-start gap-1">
                    <div className="flex items-center">
                        <span className="w-12">{t('hp')}:</span>
                        <div className="w-24 md:w-48 h-4 md:h-5 bg-gray-700 border-2 border-gray-500 inline-block align-middle">
                            <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, (player.health / player.maxHealth) * 100))}%` }}></div>
                        </div>
                        <span className="ml-2 hidden md:inline">{Math.ceil(player.health)}/{player.maxHealth}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-12">{t('shield')}:</span>
                        <div className="w-24 md:w-48 h-4 md:h-5 bg-gray-700 border-2 border-gray-500 inline-block align-middle">
                            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, (player.shield / player.maxShield) * 100))}%` }}></div>
                        </div>
                        <span className="ml-2 hidden md:inline">{Math.ceil(player.shield)}/{player.maxShield}</span>
                    </div>
                    {poisonEffect && (
                        <div className="flex items-center">
                            <span className="w-12 text-green-400">POISON:</span>
                            <div className="w-24 md:w-48 h-4 md:h-5 bg-gray-700 border-2 border-gray-500 inline-block align-middle">
                                <div className="h-full bg-green-500" style={{ width: `${Math.max(0, (poisonEffect.expiresAt - Date.now()) / (poisonEffect.expiresAt - poisonEffect.appliedAt)) * 100}%` }}></div>
                            </div>
                        </div>
                    )}
                    <div className="mt-2 text-xs md:text-sm text-cyan-300">
                        {t('weapon')}: {currentWeapon.name[lang]} | {t('dmg')}: {displayedDamage} | {t('rate')}: {currentWeapon.fireRate.toFixed(1)} | {t('ammo')}: {ammoText}
                    </div>
                </div>
                 {/* 中间信息: 波数、分数等 */}
                <div className="text-center flex-1">
                    <div className="text-yellow-300">{waveDisplay}</div>
                    <div>{state.player.name}</div>
                    <div>{t('score')}: {state.score}</div>
                </div>
                {/* 右侧信息: 等级、经验、设置按钮 */}
                <div className="text-right flex-1 flex flex-col items-end">
                    <div>{t('lvl')}: {state.player.level}</div>
                    <div className="w-24 md:w-48 h-3 md:h-4 bg-gray-700 border-2 border-gray-500 inline-block ml-2 align-middle">
                        <div className="h-full bg-purple-500" style={{ width: `${(state.player.xp / state.player.xpToNextLevel) * 100}%` }}></div>
                    </div>
                     <div className="flex items-center mt-1 gap-2">
                        <button onClick={() => { onSettingChange('autoWalk', !state.settings.autoWalk); }} className="px-3 py-1 text-sm md:text-base font-bold bg-gray-600 hover:bg-gray-500 rounded transition-colors">
                            {state.settings.autoWalk ? t('autoWalk') : t('manualWalk')}
                        </button>
                        <button onClick={onPause} className="px-3 py-1 text-sm md:text-base font-bold bg-gray-600 hover:bg-gray-500 rounded transition-colors">
                           ❚❚
                        </button>
                    </div>
                </div>
            </div>
             {/* 底部信息: 目标信息 */}
            <div className="mt-2 flex justify-between items-end">
                <div className="flex-1"></div>
                <div className="flex-1">
                    <TargetInfo
                        monsters={state.monsters}
                        targetedMonsters={state.targetedMonsters}
                        targetedObstacle={state.targetedObstacle}
                        isBossWave={state.isBossWave}
                        lang={state.settings.language}
                        t={t}
                    />
                </div>
                <div className="flex-1"></div>
            </div>
            {state.isPaused && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl text-white font-extrabold tracking-widest" style={{ textShadow: '3px 3px 0px black' }}>
                    {t('paused')}
                </div>
            )}
        </div>
    );
};

/** 排行榜组件 */
export const Leaderboard: React.FC<{scores: LeaderboardEntry[], currentScore: LeaderboardEntry, t: (key: keyof typeof translations.zh) => string;}> = ({ scores, currentScore, t }) => {
    const allScores = [...scores, currentScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    return (
        <div className="bg-gray-800 p-4 rounded-lg w-80">
            <h3 className="text-2xl font-bold mb-3 text-yellow-300 text-center">{t('leaderboardTitle')}</h3>
            <ol className="list-decimal list-inside">
                {allScores.map((score, index) => (
                    <li key={index} className={`p-1 rounded ${score === currentScore ? 'bg-yellow-500 text-black' : ''}`}>
                        <span>{index + 1}. {score.name} - {score.score} ({t('wave')} {score.wave})</span>
                    </li>
                ))}
            </ol>
        </div>
    );
};

/** 游戏结束界面 */
export const GameOverScreen: React.FC<{ 
    state: GameState; 
    onPlayAgain: () => void; 
    onMainMenu: () => void; 
    t: (key: keyof typeof translations.zh) => string; 
}> = ({ state, onPlayAgain, onMainMenu, t }) => (
  <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-30">
    <h2 className="text-6xl font-extrabold mb-4 text-red-500">{t('gameOver')}</h2>
    <p className="text-2xl mb-2">{t('finalScore')}: {state.score}</p>
    <p className="text-2xl mb-6">{t('waveReached')}: {state.wave}</p>
    <div className="flex gap-4">
        <Leaderboard scores={state.leaderboard} currentScore={{ name: state.player.name, score: state.score, wave: state.wave }} t={t} />
        <div className="flex flex-col gap-4">
            <button onClick={onPlayAgain} className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg text-2xl transition-transform transform hover:scale-105">
                {t('playAgain')}
            </button>
            <button onClick={onMainMenu} className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-2xl transition-transform transform hover:scale-105">
                {t('mainMenu')}
            </button>
        </div>
    </div>
  </div>
);

/** 升级选择界面 */
export const LevelUpScreen: React.FC<{ choices: UpgradeChoice[]; onSelect: (choice: UpgradeChoice) => void; lang: 'zh' | 'en'; t: (key: keyof typeof translations.zh) => string; }> = ({ choices, onSelect, lang, t }) => {
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        if (choices.length === 0) return;
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onSelect(choices[Math.floor(Math.random() * choices.length)]);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [choices, onSelect]);

    if (choices.length === 0) return null;

    return (
        <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-80 flex flex-col items-center justify-end z-40 p-4">
            <h2 className="text-4xl font-extrabold mb-2 text-yellow-300 animate-pulse">{t('levelUp')}</h2>
            <div className="flex gap-4 my-4">
                {choices.map((choice) => {
                    let classes = 'p-6 border-4 rounded-lg w-64 text-center cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-2xl ';
                    if (choice.isArtifact) classes += 'border-yellow-400 bg-yellow-900 hover:bg-yellow-800 animate-pulse';
                    else if (choice.isCursed) classes += 'border-red-500 bg-red-900 hover:bg-red-800';
                    else classes += 'border-green-500 bg-green-900 hover:bg-green-800';

                    return (
                        <div key={choice.id} onClick={() => onSelect(choice)} className={classes}>
                            <h3 className="text-2xl font-bold mb-2">{choice.title[lang]}</h3>
                            <p className="text-sm whitespace-pre-line">{choice.description[lang]}</p>
                        </div>
                    );
                })}
            </div>
            <p className="text-lg">{t('autoSelectIn')}: {countdown}s</p>
        </div>
    );
};

/** 设置菜单 */
export const SettingsMenu: React.FC<{
    settings: GameState['settings'];
    onSettingChange: <K extends keyof GameState['settings']>(key: K, value: GameState['settings'][K]) => void;
    onResume: () => void;
    onReturnToMenu: () => void;
    t: (key: keyof (typeof translations.zh & typeof translations.en)) => string;
}> = ({ settings, onSettingChange, onResume, onReturnToMenu, t }) => (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
        <h2 className="text-4xl font-bold mb-6">{t('settings')}</h2>
        <div className="bg-gray-800 p-6 rounded-lg w-96 space-y-4">
            <div className="flex justify-between items-center">
                <label htmlFor="autoFire" className="text-lg">{t('autoFire')}</label>
                <input type="checkbox" id="autoFire" checked={settings.autoFire} onChange={(e) => onSettingChange('autoFire', e.target.checked)} className="w-6 h-6" />
            </div>
            <div className="flex justify-between items-center">
                <label htmlFor="autoWalk" className="text-lg">{t('autoWalk')}</label>
                <input type="checkbox" id="autoWalk" checked={settings.autoWalk} onChange={(e) => onSettingChange('autoWalk', e.target.checked)} className="w-6 h-6" />
            </div>
             <div className="flex justify-between items-center">
                <label htmlFor="autoSwitchWeapon" className="text-lg">{t('autoSwitchWeapon')}</label>
                <input type="checkbox" id="autoSwitchWeapon" checked={settings.autoSwitchWeapon} onChange={(e) => onSettingChange('autoSwitchWeapon', e.target.checked)} className="w-6 h-6" />
            </div>
             <div className="flex justify-between items-center">
                <label htmlFor="onScreenControls" className="text-lg">{t('onScreenControls')}</label>
                <input type="checkbox" id="onScreenControls" checked={settings.showOnScreenControls} onChange={(e) => onSettingChange('showOnScreenControls', e.target.checked)} className="w-6 h-6" />
            </div>
             <div className="flex justify-between items-center">
                <label htmlFor="screenShake" className="text-lg">{t('screenShake')}</label>
                <input type="checkbox" id="screenShake" checked={settings.screenShakeEnabled} onChange={(e) => onSettingChange('screenShakeEnabled', e.target.checked)} className="w-6 h-6" />
            </div>
            <div className="flex justify-between items-center">
                <label htmlFor="language" className="text-lg">{t('language')}</label>
                <select id="language" value={settings.language} onChange={(e) => onSettingChange('language', e.target.value as 'zh' | 'en')} className="bg-gray-700 p-1 rounded">
                    <option value="zh">中文</option>
                    <option value="en">English</option>
                </select>
            </div>
            <div className="border-t border-gray-600 my-2"></div>
            <div>
                <label className="text-lg block text-center mb-2">{t('aiBehavior')}</label>
                <div className="flex gap-2 p-1 bg-gray-700 rounded-lg">
                    {(['resolute_recruit', 'evasion_first', 'daring_breakout'] as (GameState['settings']['aiBehavior'])[]).map(d => (
                        <button key={d} onClick={() => onSettingChange('aiBehavior', d)} className={`flex-1 px-3 py-2 rounded-md transition-colors text-sm ${settings.aiBehavior === d ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-600 hover:bg-gray-500'}`}>
                            {t(d)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        <div className="mt-8 flex gap-4">
            <button onClick={onResume} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-xl">
                {t('resume')}
            </button>
            <button onClick={onReturnToMenu} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xl">
                {t('mainMenu')}
            </button>
        </div>
    </div>
);

/** 屏幕底部神器/效果展示栏 */
export const EffectsHUD: React.FC<{ player: Player, lang: 'zh' | 'en' }> = ({ player, lang }) => {
    if (player.artifacts.length === 0) {
        return null;
    }
    return (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 p-2 rounded-lg text-white font-mono flex items-center gap-3 z-30">
            {player.artifacts.map(artifact => (
                <div key={artifact.id} className="bg-yellow-800 border border-yellow-500 p-1 rounded" title={artifact.description[lang]}>
                    <span className="font-bold text-xs text-yellow-300">{artifact.title[lang]}</span>
                </div>
            ))}
        </div>
    );
};

/** 玩家获得的临时增益效果 (Buff) 展示栏 */
export const BuffBar: React.FC<{ buffs: Buff[]; lang: 'zh' | 'en' }> = ({ buffs, lang }) => {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 100);
        return () => clearInterval(interval);
    }, []);

    if (buffs.length === 0) return null;

    return (
        <div className="absolute bottom-[120px] left-1/2 -translate-x-1/2 flex gap-2 z-30 pointer-events-none">
            {buffs.map(buff => {
                const elapsed = now - buff.createdAt;
                const progress = Math.min(100, (elapsed / buff.duration) * 100);
                return (
                    <div key={buff.id} className="relative w-16 h-16 bg-gray-900 border-2 rounded-lg overflow-hidden" style={{ borderColor: buff.color }} title={`${buff.title[lang]}: ${buff.description[lang]}`}>
                        <div className="absolute inset-0 bg-opacity-60 transition-transform duration-100 ease-linear" style={{ backgroundColor: buff.color, transform: `translateY(${progress}%)` }} />
                        <div className="relative z-10 p-1 text-center text-xs font-bold text-white flex items-center justify-center h-full break-words">
                            {buff.title[lang]}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};


/** 武器快速切换栏 */
export const WeaponBar: React.FC<{
    equippedWeapons: (Weapon | null)[];
    activeIndex: number;
    onSwitch: (index: number) => void;
    lang: 'zh' | 'en';
    player: Player;
    lastShotTime: number;
}> = ({ equippedWeapons, activeIndex, onSwitch, lang, player, lastShotTime }) => {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 50); // Update ~20fps for smooth animations
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 p-2 rounded-xl flex items-end gap-2 z-30 border-2 border-gray-600">
            {Array.from({ length: 3 }).map((_, i) => {
                const weapon = equippedWeapons[i];
                const isActive = i === activeIndex;
                const qualityInfo = weapon ? getWeaponQualityInfo(weapon.quality) : null;

                let fireCooldownPercent = 100;
                let reloadCooldownPercent = 0;
                let isReloading = false;

                if (isActive && weapon) {
                    const fireInterval = 1000 / (weapon.fireRate || 1);
                    fireCooldownPercent = Math.min(100, ((now - lastShotTime) / fireInterval) * 100);

                    isReloading = player.isReloading === true && player.equippedWeaponIndex === i;
                    if (isReloading && player.reloadUntil && weapon.reloadTime) {
                         const reloadDuration = weapon.reloadTime;
                         const reloadStartTime = player.reloadUntil - reloadDuration;
                         const elapsed = now - reloadStartTime;
                         reloadCooldownPercent = Math.min(100, (elapsed / reloadDuration) * 100);
                    }
                }
                
                const reserveAmmo = (weapon?.durability ?? 0) > 9999 ? '∞' : Math.ceil(weapon?.durability ?? 0);
                
                const backgroundStyle: React.CSSProperties = {};
                if (isActive && weapon) {
                    let color = 'rgba(0,0,0,0)';
                    let percent = 0;
                    if (isReloading) {
                        color = 'rgba(234, 179, 8, 0.5)'; // yellow
                        percent = reloadCooldownPercent;
                    } else if (fireCooldownPercent < 100) {
                        color = 'rgba(59, 130, 246, 0.4)'; // blue
                        percent = fireCooldownPercent;
                    }
                    backgroundStyle.backgroundImage = `linear-gradient(to top, ${color} ${percent}%, rgba(0,0,0,0) ${percent}%)`;
                }

                return (
                    <button 
                        key={i} 
                        onClick={() => onSwitch(i)}
                        disabled={!weapon}
                        className={`relative w-32 h-20 rounded-lg flex flex-col justify-end p-2 text-white transition-all duration-200 overflow-hidden ${isActive ? 'transform scale-110 -translate-y-2 shadow-lg bg-gray-700 border-4' : 'bg-gray-800 hover:border-gray-600 border-2'} disabled:bg-gray-900 disabled:border-gray-700 disabled:opacity-50`}
                        style={{ 
                            borderColor: qualityInfo ? qualityInfo.color : 'rgb(75 85 99)', // gray-500
                            boxShadow: isActive && qualityInfo ? `0 0 15px ${qualityInfo.color}`: 'none',
                            ...backgroundStyle
                        }}
                    >
                        {weapon && qualityInfo && (
                            <div className="absolute bottom-0 left-0 w-full h-2" style={{ backgroundColor: qualityInfo.color }} />
                        )}
                        <div className="relative z-10">
                            {weapon ? (
                                <>
                                    <span className="text-xs font-bold truncate block text-left" style={{ color: qualityInfo ? qualityInfo.color : 'white' }}>{weapon.name[lang]}</span>
                                    <span className="text-xs opacity-80 block text-left">{`${weapon.ammoInClip ?? 0} / ${reserveAmmo}`}</span>
                                </>
                            ) : <span className="text-gray-500 text-sm">Empty</span>}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};