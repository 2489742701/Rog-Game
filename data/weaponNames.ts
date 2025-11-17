/**
 * @file This file contains arrays of name components for the procedural weapon generator.
 * It supports both English and Chinese names to create thematic weapon titles.
 */

/**
 * An array of prefixes for procedurally generated weapon names.
 * These are typically evocative, powerful-sounding adjectives or concepts.
 */
export const WEAPON_PREFIXES: { en: string; zh: string }[] = [
    { en: 'Void-forged', zh: '虚空锻造' },
    { en: 'Infernal', zh: '炼狱' },
    { en: 'Glacial', zh: '冰川' },
    { en: 'Thunderclap', zh: '雷鸣' },
    { en: 'Stardust', zh: '星尘' },
    { en: 'Shadow-fused', zh: '暗影融合' },
    { en: 'Hallowed', zh: '神圣' },
    { en: 'Demonsbane', zh: '屠魔' },
    { en: 'Giga-Pulse', zh: '千兆脉冲' },
    { en: 'Nanotech', zh: '纳米技术' },
    { en: 'Quantum', zh: '量子' },
    { en: 'Galactic', zh: '银河' },
    { en: 'Apocalyptic', zh: '末日' },
    { en: 'Crystalline', zh: '水晶' },
    { en: 'Hyper-Kinetic', zh: '超动能' },
    { en: 'Phase-Shift', zh: '相位' },
];

/**
 * An array of suffixes (base weapon types) for procedurally generated weapon names.
 */
export const WEAPON_SUFFIXES: { en: string; zh: string }[] = [
    { en: 'Rifle', zh: '步枪' },
    { en: 'Cannon', zh: '巨炮' },
    { en: 'Blaster', zh: '爆能枪' },
    { en: 'Repeater', zh: '连射器' },
    { en: 'Launcher', zh: '发射器' },
    { en: 'Annihilator', zh: '湮灭者' },
    { en: 'Shredder', zh: '撕碎者' },
    { en: 'Disruptor', zh: '裂解者' },
    { en: 'Obliterator', zh: '抹除者' },
    { en: 'Executioner', zh: '行刑官' },
    { en: 'Vindicator', zh: '复仇者' },
    { en: 'Howitzer', zh: '榴弹炮' },
    { en: 'Carbine', zh: '卡宾枪' },
    { en: 'Devastator', zh: '毁灭者' },
    { en: 'Reaver', zh: '掠夺者' },
    { en: 'Striker', zh: '打击者' },
];
