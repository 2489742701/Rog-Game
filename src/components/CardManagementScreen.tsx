import React, { useState, useMemo } from 'react';
import type { PlayerProfile, Card } from '../types';
import { ALL_CARDS } from '../../data/cards';
import { MAX_EQUIPPED_CARDS, translations } from '../constants';

/**
 * @file This file contains the components for the Card Management screen,
 * where players can view their card collection, equip cards for the next run,
 * and open new card packs.
 */

/**
 * A component that displays a single card with its details.
 * @param {{ card: Card, lang: 'zh' | 'en', count?: number }} props
 */
const CardComponent: React.FC<{ card: Card, lang: 'zh' | 'en', count?: number }> = ({ card, lang, count }) => {
    const rarityColor = {
        common: 'border-gray-400 bg-gray-700',
        rare: 'border-blue-400 bg-blue-800',
        epic: 'border-purple-500 bg-purple-900',
    }[card.rarity];

    return (
        <div className={`relative p-3 rounded-lg border-2 w-48 h-60 flex flex-col justify-between ${rarityColor}`}>
            <div>
                <h4 className="font-bold text-lg">{card.name[lang]}</h4>
                <p className="text-xs mt-2">{card.description[lang]}</p>
            </div>
            <span className="text-xs text-right italic opacity-70">{card.rarity}</span>
            {/* Display count for stacked cards in inventory */}
            {count && count > 1 && (
                <div className="absolute top-1 right-1 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    x{count}
                </div>
            )}
        </div>
    );
};

/**
 * A component specifically for displaying a card during the pack opening reveal animation.
 * Includes a "DUPE" tag for duplicate cards.
 * @param {{ card: Card, lang: 'zh' | 'en', isDuplicate?: boolean }} props
 */
const CardRevealComponent: React.FC<{ card: Card, lang: 'zh' | 'en', isDuplicate?: boolean }> = ({ card, lang, isDuplicate }) => {
    const rarityColor = {
        common: 'border-gray-400 bg-gray-700',
        rare: 'border-blue-400 bg-blue-800',
        epic: 'border-purple-500 bg-purple-900',
    }[card.rarity];

    return (
        <div className={`relative p-3 rounded-lg border-2 w-48 h-60 flex flex-col justify-between ${rarityColor} ${isDuplicate ? 'opacity-70' : ''}`}>
            <div>
                <h4 className="font-bold text-lg">{card.name[lang]}</h4>
                <p className="text-xs mt-2">{card.description[lang]}</p>
            </div>
            <span className="text-xs text-right italic opacity-70">{card.rarity}</span>
             {isDuplicate && (
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                    {lang === 'zh' ? '重复' : 'DUPE'}
                </div>
            )}
        </div>
    );
};

interface CardManagementScreenProps {
    /** The player's persistent profile data. */
    profile: PlayerProfile;
    /** Function to update the player's profile. */
    setProfile: React.Dispatch<React.SetStateAction<PlayerProfile>>;
    /** Callback to navigate back to the start screen. */
    onBack: () => void;
    /** Translation function. */
    t: (key: keyof (typeof translations.zh & typeof translations.en)) => string;
}

/**
 * The main component for the card management screen.
 * It orchestrates the pack opening, inventory display, and card equipping logic.
 * @param {CardManagementScreenProps} props
 */
export const CardManagementScreen: React.FC<CardManagementScreenProps> = ({ profile, setProfile, onBack, t }) => {
    const [lastOpenedCards, setLastOpenedCards] = useState<(Card & { isDuplicate: boolean })[]>([]);
    const [isRevealing, setIsRevealing] = useState(false);
    const lang = t('back') === 'Back' ? 'en' : 'zh';

    /**
     * Handles the logic for opening a card pack.
     * It decrements the pack count, simulates drawing 3 random cards based on rarity,
     * updates the player's inventory, and displays the revealed cards.
     */
    const handleOpenPack = () => {
        if (profile.cardPacks <= 0 || isRevealing) return;

        setProfile(p => ({ ...p, cardPacks: p.cardPacks - 1 }));
        setIsRevealing(true);
        
        // Simulate a delay for the opening animation.
        setTimeout(() => {
            const drawnCards: Card[] = [];
            // Draw 3 cards with weighted rarity.
            for (let i = 0; i < 3; i++) {
                const rand = Math.random();
                if (rand < 0.1) { // 10% chance for Epic
                    const epics = ALL_CARDS.filter(c => c.rarity === 'epic');
                    drawnCards.push(epics[Math.floor(Math.random() * epics.length)]);
                } else if (rand < 0.4) { // 30% chance for Rare
                    const rares = ALL_CARDS.filter(c => c.rarity === 'rare');
                    drawnCards.push(rares[Math.floor(Math.random() * rares.length)]);
                } else { // 60% chance for Common
                    const commons = ALL_CARDS.filter(c => c.rarity === 'common');
                    drawnCards.push(commons[Math.floor(Math.random() * commons.length)]);
                }
            }
            
            // Set the drawn cards for the reveal modal, checking for duplicates.
            setLastOpenedCards(drawnCards.map(c => ({
                ...c,
                isDuplicate: profile.cardInventory.some(invCard => invCard.cardId === c.id)
            })));
            
            // Update the profile's inventory with the new cards.
            setProfile(p => {
                const newInventory = [...p.cardInventory];
                drawnCards.forEach(newCard => {
                    const existingCard = newInventory.find(c => c.cardId === newCard.id);
                    if (existingCard) {
                        existingCard.count++;
                    } else {
                        newInventory.push({ cardId: newCard.id, count: 1 });
                    }
                });
                return { ...p, cardInventory: newInventory };
            });

            setIsRevealing(false);
        }, 1000);
    };

    /**
     * Handles equipping or unequipping a card when it's clicked.
     * It moves the card between the inventory and the equipped slots.
     * @param {Card} card - The card that was clicked.
     */
    const handleCardClick = (card: Card) => {
        setProfile(p => {
            const isEquipped = p.equippedCardIds.includes(card.id);
            const newInventory = [...p.cardInventory];
            const inventoryCard = newInventory.find(c => c.cardId === card.id);

            if (isEquipped) {
                // Unequip: Move from equipped to inventory.
                if (inventoryCard) {
                    inventoryCard.count++;
                } else {
                    newInventory.push({ cardId: card.id, count: 1 });
                }
                return { ...p, equippedCardIds: p.equippedCardIds.filter(id => id !== card.id), cardInventory: newInventory };
            } else {
                // Equip: Move from inventory to equipped, if there's space.
                if (p.equippedCardIds.length < MAX_EQUIPPED_CARDS && inventoryCard && inventoryCard.count > 0) {
                    inventoryCard.count--;
                    return { ...p, equippedCardIds: [...p.equippedCardIds, card.id], cardInventory: newInventory };
                }
            }
            return p; // No change if trying to equip more than max or a card not owned.
        });
    };

    /** Memoized calculation of the player's card inventory from the profile data. */
    const cardInventory = useMemo(() => {
        return profile.cardInventory
            .map(invCard => {
                const cardData = ALL_CARDS.find(c => c.id === invCard.cardId);
                return cardData ? { ...cardData, count: invCard.count } : null;
            })
            .filter((c): c is Card & { count: number } => c !== null && c.count > 0);
    }, [profile.cardInventory]);
    
    /** Memoized calculation of the player's equipped cards. */
    const equippedCards = useMemo(() => {
         return ALL_CARDS.filter(c => profile.equippedCardIds.includes(c.id));
    }, [profile.equippedCardIds]);

    return (
        <div className="p-8 h-screen w-screen bg-gray-900 text-white flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">{t('manageCards')}</h1>
                <button onClick={onBack} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl">{t('back')}</button>
            </div>

            {/* Pack Opening Section */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6 flex items-center justify-between">
                <div className="text-lg">
                    {t('cardPacks')}: <span className="font-bold text-yellow-400">{profile.cardPacks}</span>
                </div>
                <button onClick={handleOpenPack} disabled={profile.cardPacks <= 0 || isRevealing} className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-xl disabled:bg-gray-500 disabled:cursor-not-allowed">
                    {isRevealing ? '...' : t('openCardPack')}
                </button>
            </div>

            {/* Card Reveal Modal */}
            {lastOpenedCards.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
                    <h2 className="text-3xl font-bold mb-4 animate-pulse">{t('newCards')}</h2>
                    <div className="flex gap-4">
                        {lastOpenedCards.map((cardData, i) => (
                            <div key={i} className="animate-bounce-in" style={{ animationDelay: `${i * 200}ms` }}>
                                 <CardRevealComponent card={cardData} lang={lang} isDuplicate={cardData.isDuplicate} />
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setLastOpenedCards([])} className="mt-8 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg">Close</button>
                </div>
            )}
            
            {/* My Cards Section */}
            <div className="flex-grow flex flex-col min-h-0">
                <h2 className="text-3xl font-bold mb-4">{t('myCards')}</h2>
                <div className="flex-grow grid grid-cols-2 gap-6 min-h-0">
                    {/* Equipped Panel */}
                    <div className="bg-gray-800 p-4 rounded-lg flex flex-col">
                         <h3 className="text-2xl font-semibold mb-2 text-yellow-300">{t('equippedCards')} ({equippedCards.length}/{MAX_EQUIPPED_CARDS})</h3>
                         <div className="flex-grow flex flex-wrap gap-4 overflow-y-auto p-2">
                            {equippedCards.length > 0 ? equippedCards.map(card => (
                                <div key={card.id} className="cursor-pointer" onClick={() => handleCardClick(card)}>
                                    <CardComponent card={card} lang={lang} />
                                </div>
                            )) : <p className="text-gray-400">Click a card from your inventory to equip it.</p>}
                         </div>
                    </div>
                    {/* Inventory Panel */}
                     <div className="bg-gray-800 p-4 rounded-lg flex flex-col">
                         <h3 className="text-2xl font-semibold mb-2">{t('cardInventory')}</h3>
                         <div className="flex-grow flex flex-wrap gap-4 overflow-y-auto p-2">
                             {cardInventory.length > 0 ? cardInventory.map(card => (
                                <div key={card.id} className="cursor-pointer" onClick={() => handleCardClick(card)}>
                                    <CardComponent card={card} lang={lang} count={card.count} />
                                </div>
                             )) : <p className="text-gray-400">Open card packs to get more cards!</p>}
                         </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes bounce-in {
                    0% { transform: scale(0.5); opacity: 0; }
                    80% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
