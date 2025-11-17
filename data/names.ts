/**
 * @file This file contains arrays of name components for generating random names
 * for the player and friendly allies. It supports both English and Chinese names.
 */

/**
 * An array of prefixes for randomly generated names.
 * These are typically titles or fantasy archetypes.
 */
export const PREFIXES: { en: string; zh: string; }[] = [
    { en: 'Archmage', zh: '大法师' },
    { en: 'Swordsman', zh: '剑客' },
    { en: 'Knight-errant', zh: '侠客' },
    { en: 'Hero', zh: '侠士' },
    { en: 'Warrior', zh: '武士' },
    { en: 'Ninja', zh: '忍者' },
    { en: 'Brave', zh: '勇者' },
    { en: 'Old Sir', zh: '老先生' },
    { en: 'Melee Mage', zh: '近战法师' },
    // Easter egg
    { en: 'Rubber Duck', zh: '橡皮鸭' },
];

/**
 * An array of suffixes (given names) for randomly generated names.
 * This list includes common names from various cultures to add variety.
 */
export const SUFFIXES: { en: string; zh: string; }[] = [
    // Common Western names
    { en: 'John', zh: '约翰' },
    { en: 'Michael', zh: '迈克尔' },
    { en: 'David', zh: '大卫' },
    { en: 'Chris', zh: '克里斯' },
    { en: 'Alex', zh: '亚лек斯' },
    { en: 'Sarah', zh: '莎拉' },
    { en: 'Jessica', zh: '杰西卡' },
    { en: 'Emily', zh: '艾米丽' },
    { en: 'Lucas', zh: '卢卡斯' },
    { en: 'Sophia', zh: '索菲亚' },
    { en: 'Ethan', zh: '伊桑' },
    { en: 'Olivia', zh: '奥利维亚' },
    { en: 'Daniel', zh: '丹尼尔' },
    { en: 'Ava', zh: '艾娃' },
    { en: 'Matthew', zh: '马修' },
    { en: 'Isabella', zh: '伊莎贝拉' },
    { en: 'Anthony', zh: '安东尼' },
    { en: 'Mia', zh: '米娅' },
    { en: 'Steve', zh: '史蒂夫' },
    { en: 'Alice', zh: '爱丽丝' },
    { en: 'Max', zh: '麦斯' },
    { en: 'Morgan', zh: '摩根' },
    { en: 'Smith', zh: '史密斯' },
    { en: 'Ada', zh: '艾达' },
    { en: 'Leon', zh: '里昂' },
    { en: 'Claire', zh: '克莱尔' },

    // Common Chinese names
    { en: 'Wei', zh: '伟' },
    { en: 'Fang', zh: '芳' },
    { en: 'Qiang', zh: '强' },
    { en: 'Lin', zh: '琳' },
    { en: 'Jun', zh: '俊' },
    { en: 'Hao', zh: '浩' },
    { en: 'Mei', zh: '梅' },
    { en: 'Li', zh: '李' },
    { en: 'Wang', zh: '王' },
    { en: 'Zhang', zh: '张' },
    { en: 'Chen', zh: '陈' },
    { en: 'Liu', zh: '刘' },
    { en: 'Yang', zh: '杨' },
    { en: 'Zhao', zh: '赵' },
    { en: 'Xiao', zh: '晓' },
    { en: 'Jie', zh: '杰' },

    // Common Japanese names
    { en: 'Yuki', zh: '雪' },
    { en: 'Haru', zh: '春' },
    { en: 'Kenji', zh: '健司' },
    { en: 'Sakura', zh: '樱' },
    { en: 'Takashi', zh: '隆' },
    { en: 'Aya', zh: '彩' },
    { en: 'Hiroshi', zh: '浩' },
    { en: 'Rin', zh: '凛' },
    { en: 'Sora', zh: '空' },
    { en: 'Taro', zh: '太郎' },
    { en: 'Hana', zh: '花' },
    { en: 'Ken', zh: '健' },
    { en: 'Yui', zh: '结衣' },
    { en: 'Daiki', zh: '大辉' },
    { en: 'Mio', zh: '澪' },
];
