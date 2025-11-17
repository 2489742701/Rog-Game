import React, { useState, useCallback, useEffect } from 'react';
import type { Difficulty, AIBehavior, PlayerProfile, Card } from './src/types';
import { translations } from './src/constants';
import { StartScreen } from './src/components/StartScreen';
import { Game } from './src/Game';
import { CardManagementScreen } from './src/components/CardManagementScreen';
import { ALL_CARDS } from './data/cards';

/**
 * Creates the initial player profile if one doesn't exist.
 * This is used for new players or if localStorage data is corrupted.
 * @returns {PlayerProfile} The default player profile.
 */
const getInitialProfile = (): PlayerProfile => ({
    cardPacks: 1,
    cardInventory: [],
    equippedCardIds: [],
});

/**
 * The root component of the application.
 * It manages the current view (start screen, game, card management),
 * game settings (difficulty, AI behavior), and player profile persistence.
 * @returns {React.ReactElement} The rendered application.
 */
const App: React.FC = () => {
    // A key to force-remount the Game component for a clean restart.
    const [gameKey, setGameKey] = useState(Date.now());
    // Determines which view is currently active: 'start', 'game', or 'cards'.
    const [currentView, setCurrentView] = useState<'start' | 'game' | 'cards'>('start');
    // Stores the selected game difficulty.
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    // Stores the selected ally AI behavior.
    const [aiBehavior, setAiBehavior] = useState<AIBehavior | null>(null);
    // Manages the language for the start screen and card management UI.
    const [startScreenLang, setStartScreenLang] = useState<'zh' | 'en'>('zh');

    // Manages the player's persistent profile (card packs, inventory).
    // It lazily initializes from localStorage on the first render.
    const [profile, setProfile] = useState<PlayerProfile>(() => {
        try {
            const savedProfile = localStorage.getItem('geminiRogueProfile');
            if (savedProfile) {
                const parsedProfile = JSON.parse(savedProfile);
                // Basic validation to handle old data structures and prevent crashes.
                if (Array.isArray(parsedProfile.cardInventory) && (parsedProfile.cardInventory.length === 0 || typeof parsedProfile.cardInventory[0] === 'object' && 'cardId' in parsedProfile.cardInventory[0])) {
                    return parsedProfile;
                }
            }
            return getInitialProfile();
        } catch (e) {
            console.error("Failed to load profile from localStorage", e);
            return getInitialProfile();
        }
    });

    // Effect hook to save the player's profile to localStorage whenever it changes.
    useEffect(() => {
        try {
            localStorage.setItem('geminiRogueProfile', JSON.stringify(profile));
        } catch (e) {
            console.error("Failed to save profile to localStorage", e);
        }
    }, [profile]);

    /**
     * Callback function to start the game.
     * It sets the difficulty and AI behavior, switches to the game view,
     * and generates a new key to ensure the Game component remounts.
     * @param {Difficulty} selectedDifficulty - The chosen difficulty level.
     * @param {AIBehavior} selectedAiBehavior - The chosen ally AI behavior.
     */
    const handleStart = useCallback((selectedDifficulty: Difficulty, selectedAiBehavior: AIBehavior) => {
        setDifficulty(selectedDifficulty);
        setAiBehavior(selectedAiBehavior);
        setCurrentView('game');
        setGameKey(Date.now()); // Update key to force remount of Game component.
    }, []);

    /**
     * Callback function for when the game ends.
     * It applies a death penalty (unequipping cards), displays an alert,
     * and returns the user to the start screen.
     * @param {'zh' | 'en'} lang - The current language for the alert message.
     */
    const handleGameOver = useCallback((lang: 'zh' | 'en') => {
        // Death penalty: Only unequip cards, inventory is kept.
        alert(translations[lang]['deathPenaltyMessage']);
        setProfile(p => ({
            ...p,
            equippedCardIds: [], // Clear equipped cards.
        }));
        setCurrentView('start');
        setDifficulty(null);
        setAiBehavior(null);
    }, []);

    /**
     * Callback function to play again after a game over.
     * It applies the death penalty and remounts the Game component.
     * @param {'zh' | 'en'} lang - The current language for the alert message.
     */
    const handlePlayAgain = useCallback((lang: 'zh' | 'en') => {
        alert(translations[lang]['deathPenaltyMessage']);
        setProfile(p => ({
            ...p,
            equippedCardIds: [], // Clear equipped cards.
        }));
        setGameKey(Date.now()); // Just restart the game with same settings
    }, []);

    /**
     * Callback function to return to the main menu from the pause screen
     * without applying any penalties.
     */
    const handleReturnToMenu = useCallback(() => {
        setCurrentView('start');
        setDifficulty(null);
        setAiBehavior(null);
    }, []);
    
    /**
     * Callback function to increment the player's card pack count.
     */
    const handleCardPackGained = useCallback(() => {
        setProfile(p => ({ ...p, cardPacks: p.cardPacks + 1 }));
    }, []);

    /**
     * Memoized list of cards currently equipped by the player.
     * This prevents recalculating on every render unless the equipped card IDs change.
     */
    const equippedCards = React.useMemo(() => {
        return ALL_CARDS.filter(card => profile.equippedCardIds.includes(card.id));
    }, [profile.equippedCardIds]);

    /**
     * A utility function to get translated strings based on the current `startScreenLang`.
     * @param key - The key of the translation string.
     * @returns {string} The translated string.
     */
    const t = (key: keyof (typeof translations.zh & typeof translations.en)) => translations[startScreenLang][key];

    /**
     * Renders the current view based on the `currentView` state.
     * @returns {React.ReactElement | null} The component for the current view.
     */
    const renderView = () => {
        switch (currentView) {
            case 'game':
                if (difficulty && aiBehavior) {
                    return <Game 
                        key={gameKey} 
                        difficulty={difficulty} 
                        aiBehavior={aiBehavior} 
                        onGameOver={handleGameOver}
                        onPlayAgain={handlePlayAgain}
                        onReturnToMenu={handleReturnToMenu}
                        onCardPackGained={handleCardPackGained}
                        equippedCards={equippedCards}
                    />;
                }
                // Fallback: If game settings are missing, return to start.
                setCurrentView('start');
                return null;
            
            case 'cards':
                return <CardManagementScreen 
                    profile={profile}
                    setProfile={setProfile}
                    onBack={() => setCurrentView('start')}
                    t={t}
                />

            case 'start':
            default:
                return (
                     <>
                        <div className="absolute top-2 right-2 z-40">
                            <button onClick={() => setStartScreenLang('zh')} className={`px-2 py-1 text-sm rounded ${startScreenLang === 'zh' ? 'bg-yellow-500 text-black' : 'bg-gray-600'}`}>中文</button>
                            <button onClick={() => setStartScreenLang('en')} className={`px-2 py-1 text-sm rounded ml-1 ${startScreenLang === 'en' ? 'bg-yellow-500 text-black' : 'bg-gray-600'}`}>EN</button>
                        </div>
                        <StartScreen 
                            onStart={handleStart} 
                            onNavigateToCards={() => setCurrentView('cards')}
                            t={t} 
                            profile={profile}
                        />
                    </>
                );
        }
    }
    
    return <div className="w-screen h-screen bg-gray-900 text-white">{renderView()}</div>;
}

export default App;