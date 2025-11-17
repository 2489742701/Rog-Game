import React, { useState } from 'react';
import type { Difficulty, AIBehavior, PlayerProfile } from '../types';
import { translations } from '../constants';

/**
 * @file Contains the StartScreen component, the main menu of the game.
 */

interface StartScreenProps {
  /** Callback to start the game with the selected settings. */
  onStart: (difficulty: Difficulty, aiBehavior: AIBehavior) => void;
  /** Callback to navigate to the card management screen. */
  onNavigateToCards: () => void;
  /** Translation function. */
  t: (key: keyof (typeof translations.zh & typeof translations.en)) => string;
  /** The player's profile, used to display card pack count. */
  profile: PlayerProfile;
}

/**
 * The main menu component where players can configure their game session and start playing.
 * It allows selection of difficulty and ally AI behavior.
 * @param {StartScreenProps} props - The component's props.
 * @returns {React.ReactElement} The rendered start screen.
 */
export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onNavigateToCards, t, profile }) => {
    const [difficulty, setDifficulty] = useState<Difficulty>('normal');
    const [aiBehavior, setAiBehavior] = useState<AIBehavior>('resolute_recruit');

    return (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-30 text-center p-4">
            <h1 className="text-6xl md:text-8xl font-extrabold text-yellow-300" style={{ textShadow: '4px 4px 0px #000' }}>{t('title')}</h1>
            <p className="max-w-xl my-6 text-lg md:text-xl text-gray-300">{t('welcomeDescription')}</p>
            
            {/* Instructions Panel */}
            <div className="bg-gray-800 p-4 rounded-lg my-4 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{t('instructionsTitle')}</h2>
                <p>{t('moveInstruction')}</p>
                <p>{t('shootInstruction')}</p>
                <p>{t('pauseInstruction')}</p>
            </div>

            {/* Difficulty Selector */}
            <div className="my-2 w-full max-w-md">
                <h3 className="text-xl font-bold mb-2">{t('difficulty')}</h3>
                <div className="flex gap-2 p-1 bg-gray-700 rounded-lg">
                    {(['easy', 'normal', 'hard', 'hell'] as Difficulty[]).map(d => (
                        <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm md:text-base ${difficulty === d ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-600 hover:bg-gray-500'}`}>
                            {t(d)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ally AI Behavior Selector */}
             <div className="my-2 w-full max-w-md">
                <h3 className="text-xl font-bold mb-2">{t('aiBehavior')}</h3>
                <div className="flex gap-2 p-1 bg-gray-700 rounded-lg">
                    {(['resolute_recruit', 'evasion_first', 'daring_breakout'] as AIBehavior[]).map(d => (
                        <button key={d} onClick={() => setAiBehavior(d)} className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm md:text-base ${aiBehavior === d ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-600 hover:bg-gray-500'}`}>
                           {t(d)}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
                <button onClick={() => onStart(difficulty, aiBehavior)} className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-2xl transition-transform transform hover:scale-105 animate-pulse order-1 md:order-2">
                    {t('startGame')}
                </button>
                <button onClick={onNavigateToCards} className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-2xl transition-transform transform hover:scale-105 order-2 md:order-1 relative">
                    {t('manageCards')}
                    {/* Notification bubble for available card packs */}
                    {profile.cardPacks > 0 && 
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold border-2 border-white">
                            {profile.cardPacks}
                        </span>
                    }
                </button>
            </div>
        </div>
    );
};
