import type { UpgradeChoice } from '../src/types';

/**
 * @file This file contains predefined arrays of upgrade choices available to the player upon leveling up.
 * They are categorized into standard, cursed, and artifact tiers.
 */

/**
 * An array of standard, common upgrade choices.
 * These provide straightforward bonuses to the player's stats or weapon capabilities.
 */
export const PREDEFINED_UPGRADES: UpgradeChoice[] = [
  // --- Health ---
  {
    id: 'hp_up_1',
    title: { en: 'Iron Will', zh: '钢铁意志' },
    description: { en: '+20 Max HP', zh: '+20 最大生命值' },
    effects: [{ type: 'STAT_MOD', stat: 'maxHealth', op: 'add', value: 20 }],
  },
  {
    id: 'hp_up_2',
    title: { en: 'Vitality Boost', zh: '活力增强' },
    description: { en: '+30 Max HP', zh: '+30 最大生命值' },
    effects: [{ type: 'STAT_MOD', stat: 'maxHealth', op: 'add', value: 30 }],
  },
   {
    id: 'hp_up_3',
    title: { en: 'Colossus', zh: '巨像' },
    description: { en: '+40 Max HP', zh: '+40 最大生命值' },
    effects: [{ type: 'STAT_MOD', stat: 'maxHealth', op: 'add', value: 40 }],
  },
  // --- Movement Speed ---
  {
    id: 'speed_up_1',
    title: { en: 'Lightfoot', zh: '健步如飞' },
    description: { en: '+10% Movement Speed', zh: '+10% 移动速度' },
    effects: [{ type: 'STAT_MOD', stat: 'speed', op: 'multiply', value: 1.1 }],
  },
  {
    id: 'speed_up_2',
    title: { en: 'Adrenaline Rush', zh: '肾上腺素' },
    description: { en: '+15% Movement Speed', zh: '+15% 移动速度' },
    effects: [{ type: 'STAT_MOD', stat: 'speed', op: 'multiply', value: 1.15 }],
  },
  // --- Damage ---
  {
    id: 'dmg_up_1',
    title: { en: 'Heavy Caliber', zh: '重型口径' },
    description: { en: '+15% Damage', zh: '+15% 伤害' },
    effects: [{ type: 'STAT_MOD', stat: 'damageMultiplier', op: 'multiply', value: 1.15 }],
  },
  {
    id: 'dmg_up_2',
    title: { en: 'Sharpshooter', zh: '神射手' },
    description: { en: '+20% Damage', zh: '+20% 伤害' },
    effects: [{ type: 'STAT_MOD', stat: 'damageMultiplier', op: 'multiply', value: 1.2 }],
  },
  // --- Fire Rate ---
  {
    id: 'fr_up_1',
    title: { en: 'Rapid Fire', zh: '急速射击' },
    description: { en: '+15% Fire Rate', zh: '+15% 射速' },
    effects: [{ type: 'STAT_MOD', stat: 'fireRate', op: 'multiply', value: 1.15 }],
  },
  {
    id: 'fr_up_2',
    title: { en: 'Hair Trigger', zh: '一触即发' },
    description: { en: '+20% Fire Rate', zh: '+20% 射速' },
    effects: [{ type: 'STAT_MOD', stat: 'fireRate', op: 'multiply', value: 1.2 }],
  },
  // --- Bullet Speed ---
  {
    id: 'bs_up_1',
    title: { en: 'High Velocity', zh: '高速弹药' },
    description: { en: '+20% Bullet Speed', zh: '+20% 子弹速度' },
    effects: [{ type: 'STAT_MOD', stat: 'bulletSpeed', op: 'multiply', value: 1.2 }],
  },
  {
    id: 'bs_up_2',
    title: { en: 'Railgun Rounds', zh: '磁轨炮弹' },
    description: { en: '+30% Bullet Speed', zh: '+30% 子弹速度' },
    effects: [{ type: 'STAT_MOD', stat: 'bulletSpeed', op: 'multiply', value: 1.3 }],
  },
  // --- Gem Magnet ---
  {
    id: 'magnet_up_1',
    title: { en: 'Gem Seeker', zh: '宝石探寻者' },
    description: { en: '+50% Gem Pickup Radius', zh: '+50% 宝石拾取范围' },
    effects: [{ type: 'STAT_MOD', stat: 'gemMagnetRadius', op: 'add', value: 30 }],
  },
   {
    id: 'magnet_up_2',
    title: { en: 'Greed Sensor', zh: '贪婪传感器' },
    description: { en: '+75% Gem Pickup Radius', zh: '+75% 宝石拾取范围' },
    effects: [{ type: 'STAT_MOD', stat: 'gemMagnetRadius', op: 'add', value: 45 }],
  },
  // --- Piercing ---
  {
    id: 'pierce_up_1',
    title: { en: 'Armor Piercing', zh: '穿甲弹' },
    description: { en: 'Bullets pierce +1 enemy', zh: '子弹可多穿透1个敌人' },
    effects: [{ type: 'WEAPON_MOD', mod: 'piercing', value: 1 }],
  },
    {
    id: 'pierce_up_2',
    title: { en: 'Railgun', zh: '轨道炮' },
    description: { en: 'Bullets pierce +2 enemies', zh: '子弹可多穿透2个敌人' },
    effects: [{ type: 'WEAPON_MOD', mod: 'piercing', value: 2 }],
  },
  // --- Bullet Count (Shotgun) ---
  {
    id: 'bullet_count_up_1',
    title: { en: 'Buckshot', zh: '鹿弹' },
    description: { en: 'Fire +1 projectile per shot', zh: '每次射击+1弹丸' },
    effects: [{ type: 'WEAPON_MOD', mod: 'bulletCount', value: 1 }],
  },
   {
    id: 'bullet_count_up_2',
    title: { en: 'Spreadshot', zh: '散射' },
    description: { en: 'Fire +2 projectiles per shot', zh: '每次射击+2弹丸' },
    effects: [{ type: 'WEAPON_MOD', mod: 'bulletCount', value: 2 }],
  },
  // --- Crit Chance ---
  {
    id: 'crit_chance_1',
    title: { en: 'Precision', zh: '精确打击' },
    description: { en: '+10% Crit Chance', zh: '+10% 暴击几率' },
    effects: [{ type: 'STAT_MOD', stat: 'critChance', op: 'multiply', value: 1.10 }],
  },
  // --- Crit Damage ---
  {
    id: 'crit_damage_1',
    title: { en: 'Vicious Strikes', zh: '恶毒攻击' },
    description: { en: '+50% Crit Damage', zh: '+50% 暴击伤害' },
    effects: [{ type: 'STAT_MOD', stat: 'critDamage', op: 'multiply', value: 1.5 }],
  },
  // --- Thorns ---
  {
    id: 'thorns_1',
    title: { en: 'Static Field', zh: '静电场' },
    description: { en: 'Deal 15 damage to enemies that touch you', zh: '对接触你的敌人造成15点伤害' },
    effects: [{ type: 'STAT_MOD', stat: 'thornsDamage', op: 'add', value: 15 }],
  },
  // --- Heal ---
  {
    id: 'heal_1',
    title: { en: 'First Aid', zh: '急救' },
    description: { en: 'Heal for 25% of Max HP', zh: '恢复25%最大生命值' },
    effects: [{ type: 'HEAL', amount: 25 }],
  },
  {
    id: 'heal_2',
    title: { en: 'Rejuvenate', zh: '恢复活力' },
    description: { en: 'Heal for 50% of Max HP', zh: '恢复50%最大生命值' },
    effects: [{ type: 'HEAL', amount: 50 }],
  },
  // --- Shield & Orbitals ---
  {
    id: 'orbital_shield_1',
    title: { en: 'Kinetic Orb', zh: '动能法球' },
    description: { en: 'A rotating orb damages nearby enemies', zh: '一个旋转的能量球会伤害附近的敌人' },
    effects: [{ type: 'ORBITAL_SHIELD', count: 1, damage: 15, speed: 2, radius: 70 }],
  },
  {
    id: 'max_shield_1',
    title: { en: 'Shield Capacitor', zh: '护盾电容' },
    description: { en: '+50 Max Shield', zh: '+50 最大护盾值' },
    effects: [{ type: 'STAT_MOD', stat: 'maxShield', op: 'add', value: 50 }],
  },
  {
    id: 'add_shield_1',
    title: { en: 'Energy Infusion', zh: '能量注入' },
    description: { en: 'Gain 50 shield points', zh: '获得50点护盾' },
    effects: [{ type: 'ADD_SHIELD', amount: 50 }],
  },
];

/**
 * An array of Cursed upgrade choices.
 * These offer significant power boosts but come with substantial drawbacks,
 * encouraging a high-risk, high-reward playstyle.
 */
export const CURSED_UPGRADES: UpgradeChoice[] = [
    {
        id: 'curse_glass_cannon',
        title: { en: 'Glass Cannon', zh: '玻璃大炮' },
        description: { en: '+100% Damage\n-50% Max HP', zh: '+100% 伤害\n-50% 最大生命值' },
        isCursed: true,
        effects: [
            { type: 'STAT_MOD', stat: 'damageMultiplier', op: 'multiply', value: 2 },
            { type: 'STAT_MOD', stat: 'maxHealth', op: 'multiply', value: 0.5 },
        ]
    },
    {
        id: 'curse_reckless_haste',
        title: { en: 'Reckless Haste', zh: '鲁莽急速' },
        description: { en: '+50% Fire Rate & Speed\n-30% Damage', zh: '+50% 射速和移速\n-30% 伤害' },
        isCursed: true,
        effects: [
            { type: 'STAT_MOD', stat: 'fireRate', op: 'multiply', value: 1.5 },
            { type: 'STAT_MOD', stat: 'speed', op: 'multiply', value: 1.5 },
            { type: 'STAT_MOD', stat: 'damageMultiplier', op: 'multiply', value: 0.7 },
        ]
    },
    {
        id: 'curse_blood_pact',
        title: { en: 'Blood Pact', zh: '血之契约' },
        description: { en: '+150 Max HP\n-50% all healing', zh: '+150 最大生命值\n-50% 所有治疗效果' },
        isCursed: true,
        effects: [
            { type: 'STAT_MOD', stat: 'maxHealth', op: 'add', value: 150 },
            // Note: Healing reduction is a conceptual curse and needs to be implemented in the game loop if desired.
        ]
    },
    {
        id: 'curse_heavy_body',
        title: { en: 'Heavy Body', zh: '沉重身躯' },
        description: { en: '+50% Crit Damage\n+2 Projectiles\n-25% Movement Speed', zh: '+50% 暴击伤害\n+2 弹丸\n-25% 移动速度' },
        isCursed: true,
        effects: [
            { type: 'STAT_MOD', stat: 'critDamage', op: 'multiply', value: 1.5 },
            { type: 'WEAPON_MOD', mod: 'bulletCount', value: 2 },
            { type: 'STAT_MOD', stat: 'speed', op: 'multiply', value: 0.75 },
        ]
    },
];

/**
 * An array of Artifact upgrade choices.
 * These are extremely rare and powerful upgrades that can fundamentally change gameplay.
 * Their effects are often unique and implemented directly in the `useGameLoop` hook.
 */
export const ARTIFACT_UPGRADES: UpgradeChoice[] = [
    {
        id: 'artifact_all_crit',
        title: { en: 'Fate\'s Decree', zh: '命运敕令' },
        description: { en: 'All your hits are now critical hits. Crit Damage is set to 125%.', zh: '你所有的攻击都将暴击。暴击伤害固定为 125%。' },
        isArtifact: true,
        effects: [
            { type: 'STAT_MOD', stat: 'critChance', op: 'multiply', value: 1000 }, // Effectively sets crit chance to 100% or more
            { type: 'STAT_MOD', stat: 'critDamage', op: 'multiply', value: 0.5 } // Balances the power by reducing crit damage
        ]
    },
    {
        id: 'artifact_vampire',
        title: { en: 'Vampiric Essence', zh: '吸血鬼精华' },
        description: { en: 'Heal for 1% of damage dealt. All other healing is halved.', zh: '你造成的伤害将为你恢复1%的生命值。所有其他治疗效果减半。' },
        isArtifact: true,
        effects: [
            // The life steal effect is implemented separately in `useGameLoop`.
        ]
    },
    {
        id: 'artifact_time_stop',
        title: { en: 'Chronomancer\'s Locket', zh: '时空法师的挂坠' },
        description: { en: 'Every 10 seconds, freeze all enemies and their projectiles for 2 seconds.', zh: '每10秒，冻结所有敌人及其弹幕2秒。' },
        isArtifact: true,
        effects: [
             // The time stop effect is implemented separately in `useGameLoop`.
        ]
    },
];