import type { Card } from '../src/types';

/**
 * @file This file defines all the collectible cards available in the game.
 * Cards provide permanent, passive bonuses that players can equip before starting a run.
 */

/**
 * An array containing the definitions for every card in the game.
 * Each card has an ID, name, description, rarity, and a list of effects.
 */
export const ALL_CARDS: Card[] = [
    // Common Cards
    {
        id: 'c_hp_1',
        name: { en: 'Minor Fortitude', zh: '初级坚韧' },
        description: { en: '+10 Max HP at the start of a run.', zh: '游戏开始时+10最大生命值。' },
        rarity: 'common',
        effects: [{ type: 'STAT_MOD', stat: 'maxHealth', op: 'add', value: 10 }]
    },
    {
        id: 'c_speed_1',
        name: { en: 'Swiftness', zh: '迅捷' },
        description: { en: '+5% Movement Speed.', zh: '+5% 移动速度。' },
        rarity: 'common',
        effects: [{ type: 'STAT_MOD', stat: 'speed', op: 'multiply', value: 1.05 }]
    },
    {
        id: 'c_xp_1',
        name: { en: 'Learner', zh: '学习者' },
        description: { en: '+10% XP gain from all sources.', zh: '+10% 所有经验获取。' },
        rarity: 'common',
        // Note: This effect is specially handled in the `getInitialState` function of the game loop.
        effects: [] 
    },
    {
        id: 'c_shield_1',
        name: { en: 'Energy Shell', zh: '能量外壳' },
        description: { en: '+15 Max Shield at the start of a run.', zh: '游戏开始时+15最大护盾。' },
        rarity: 'common',
        effects: [{ type: 'STAT_MOD', stat: 'maxShield', op: 'add', value: 15 }]
    },

    // Rare Cards
    {
        id: 'r_hp_2',
        name: { en: 'Major Fortitude', zh: '高级坚韧' },
        description: { en: '+25 Max HP at the start of a run.', zh: '游戏开始时+25最大生命值。' },
        rarity: 'rare',
        effects: [{ type: 'STAT_MOD', stat: 'maxHealth', op: 'add', value: 25 }]
    },
    {
        id: 'r_damage_1',
        name: { en: 'Sharpened Edge', zh: '锋锐之刃' },
        description: { en: '+5 Base Damage.', zh: '+5 基础伤害。' },
        rarity: 'rare',
        effects: [{ type: 'STAT_MOD', stat: 'baseDamage', op: 'add', value: 5 }]
    },
    {
        id: 'r_magnet_1',
        name: { en: 'Collector', zh: '收藏家' },
        description: { en: '+50% Gem Pickup Radius.', zh: '+50% 宝石拾取范围。' },
        rarity: 'rare',
        effects: [{ type: 'STAT_MOD', stat: 'gemMagnetRadius', op: 'add', value: 30 }]
    },
    {
        id: 'r_thorns_1',
        name: { en: 'Barbed Armor', zh: '倒刺装甲' },
        description: { en: 'Gain 5 Thorns damage.', zh: '获得5点荆棘伤害。' },
        rarity: 'rare',
        effects: [{ type: 'STAT_MOD', stat: 'thornsDamage', op: 'add', value: 5 }]
    },

    // Epic Cards
    {
        id: 'e_haste_1',
        name: { en: 'Adrenaline Junkie', zh: '肾上腺素狂人' },
        description: { en: '+10% Movement Speed and +10% Fire Rate.', zh: '+10% 移动速度和+10%射速。' },
        rarity: 'epic',
        // Note: Fire rate bonus is handled specially in the game loop.
        effects: [{ type: 'STAT_MOD', stat: 'speed', op: 'multiply', value: 1.10 }] 
    },
    {
        id: 'e_crit_1',
        name: { en: 'Deadeye', zh: '神射手' },
        description: { en: '+5% Crit Chance and +25% Crit Damage to all weapons.', zh: '所有武器+5%暴击率和+25%暴击伤害。' },
        rarity: 'epic',
        // Note: This effect is specially handled in the `getInitialState` function.
        effects: [] 
    },
    {
        id: 'e_shield_regen_1',
        name: { en: 'Shield Battery', zh: '护盾电池' },
        description: { en: 'Start with an extra +50 Max Shield.', zh: '游戏开始时额外+50最大护盾。' },
        rarity: 'epic',
        effects: [{ type: 'STAT_MOD', stat: 'maxShield', op: 'add', value: 50 }]
    },
    {
        id: 'e_greed_1',
        name: { en: 'Golden Touch', zh: '点金手' },
        description: { en: 'Gain +25% more score from all sources.', zh: '+25% 所有分数获取。' },
        rarity: 'epic',
        // Note: This effect is handled in the game loop where score is calculated.
        effects: [] 
    }
];
