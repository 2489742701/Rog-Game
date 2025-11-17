import type { Weapon, Difficulty, DifficultyModifiers, WaveTheme, Monster } from './types';

/**
 * @file This file contains all the hardcoded constants and game balance values.
 * Centralizing these values makes it easy to tweak and balance the game.
 */

// --- World Dimensions ---
export const WORLD_WIDTH = 2400; // The total width of the game world.
export const WORLD_HEIGHT = 1800; // The total height of the game world.
export const WRAP_PADDING = 10; // A small buffer when entities wrap around the screen to prevent getting stuck in cooldown walls.

// --- Entity Sizes ---
export const PLAYER_SIZE = 20;
export const ALLY_SIZE = 20;
export const MONSTER_SIZE = 24;
export const ELITE_MONSTER_SIZE = 40;
export const BOSS_SIZE = 80;
export const MINION_SIZE = 12;
export const HEALER_SIZE = 26;
export const SUMMONER_SIZE = 28;
export const WISP_SIZE = 22;
export const BLOATER_SIZE = 36;
export const BULLET_SIZE = 8;
export const ENEMY_BULLET_SIZE = 10;
export const HOMING_ENEMY_BULLET_SIZE = 12;
export const XP_GEM_SIZE = 10;
export const HEALTH_PACK_SIZE = 24;
export const SHIELD_PACK_SIZE = 24;
export const ORBITAL_SIZE = 16;
export const EXPLOSIVE_BARREL_SIZE = 30;
export const TREASURE_CHEST_SIZE = 28;

// --- Gameplay Parameters ---
export const MAX_HEALTH_PACKS = 3;
export const MAX_SHIELD_PACKS = 3;
export const MAX_TREASURE_CHESTS = 3;
export const MAX_ALLIES = 3; // Maximum number of allies that can be on the field at once.
export const OBSTACLE_COUNT = 25; // Number of obstacles to generate on the map.
export const EXPLOSIVE_BARREL_COUNT = 10; // Number of explosive barrels to generate.
export const MIN_OBSTACLE_SIZE = 50;
export const MAX_OBSTACLE_SIZE = 150;
export const OBSTACLE_PADDING = 15; // Minimum space between obstacles.
export const DAMAGE_NUMBER_LIFESPAN = 1000; // Duration damage numbers are visible (ms).
export const ACHIEVEMENT_LIFESPAN = 8000; // Duration achievement popups are visible (ms).
export const ACHIEVEMENT_EXIT_DURATION = 500; // Duration of the achievement exit animation (ms).
export const DIALOGUE_LIFESPAN = 10000; // Duration dialogue stays in the side log (ms).
export const MAX_DIALOGUE_HISTORY = 5; // Maximum number of dialogue entries in the log.
export const MONSTER_INTRO_LIFESPAN = 8000; // Duration of the new monster intro popup (ms).
export const MAX_ACHIEVEMENTS = 5; // Max number of achievements displayed on screen simultaneously.
export const EXPLOSION_DURATION = 400; // Duration of the explosion visual effect (ms).
export const DEATH_ANIMATION_DURATION = 1500; // Duration of monster death animations (ms).
export const INVINCIBILITY_DURATION = 3000; // Player invincibility duration after being hit (ms).
export const TARGET_INFO_LOCK_DURATION = 3000; // How long a targeted monster's info stays on the HUD after the last hit (ms).
export const FOCUS_RING_DURATION = 500; // Duration of the focus ring visual effect (ms).
export const BULLET_LIFESPAN = 3000; // Maximum lifetime of a standard bullet (ms).
export const BOSS_BULLET_LIFESPAN = 8000; // Maximum lifetime of a boss's bullet (ms).
export const MONSTER_STUCK_DURATION = 1200; // Time a monster must be stationary to be considered "stuck" (ms).
export const MONSTER_FORCE_UNSTUCK_DURATION = 800; // Threshold to force unstuck logic for monsters.
export const ALLY_SPAWN_STUCK_CHECK_DURATION = 3000; // Time after an ally spawns to check if they are stuck.
export const ALLY_SPAWN_CHANCE_DOUBLE = 0.2; // 20% chance to spawn two allies.
export const ALLY_SPAWN_CHANCE_TRIPLE = 0.05; // 5% chance to spawn three allies.
export const DROP_CHANCE_HEALTH = 0.03; // Base chance for a normal monster to drop a health pack.
export const DROP_CHANCE_SHIELD = 0.05; // Base chance for a normal monster to drop a shield pack.
export const CARD_PACK_DROP_CHANCE = 0.02; // Base chance for a monster to drop a card pack.
export const AI_JITTER_STUCK_TIME = 300; // Time the player AI must be near-stationary to be considered stuck (ms).
export const AI_BREAKOUT_DURATION = 500; // Duration of the AI's "breakout" maneuver (ms).
export const BULLET_CLEAR_INTERVAL = 60000; // Interval to clear all bullets to prevent performance degradation (ms).
export const ARTIFACT_CHANCE = 0.1; // Base chance for an Artifact to appear in level-up choices.
export const MAX_EQUIPPED_CARDS = 5; // Maximum number of cards a player can equip.
export const PLAYER_WALL_BUMP_DAMAGE = 20; // Damage the player does to obstacles by bumping into them.
export const PLAYER_WALL_BUMP_COOLDOWN = 1000; // Cooldown for player wall bump damage (ms).
export const WISP_TELEPORT_COOLDOWN = 4000; // Cooldown for Wisp's teleport ability (ms).
export const WISP_TELEPORT_DURATION = 300; // Duration of the Wisp's teleport visual effect (ms).
export const DOT_TICK_RATE = 500; // How often Damage over Time effects tick (ms).
export const PLAYER_POISON_DURATION = 5000; // Duration of poison on the player (ms).
export const PLAYER_POISON_DAMAGE_PER_TICK = 5; // Damage per poison tick on the player.
export const MONSTER_XP_ABSORB_CHANCE = 0.05; // Chance for a monster to absorb a nearby XP gem.
export const MONSTER_WEAPON_PICKUP_CHANCE = 0.1; // Chance for a monster to pick up a dropped weapon.
export const MONSTER_WEAPON_FIRE_RATE_MODIFIER = 0.5; // Penalty to fire rate when a monster uses a player weapon.

// --- Initial Player Weapon ---
export const INITIAL_WEAPON: Weapon = {
  name: { en: 'Pea Shooter', zh: '豌豆射手' },
  category: 'special',
  damage: 10,
  fireRate: 3,
  bulletSpeed: 6,
  color: '#a3e635',
  bulletCount: 1,
  piercing: 1,
  critChance: 0.05,
  critDamage: 1.5,
  quality: 50,
  durability: 999999, // "Infinite" ammo
  maxDurability: 999999,
  clipSize: 20,
  ammoInClip: 20,
  reloadTime: 2000,
};

// Default weapon if player has no weapons (e.g., after breaking all of them).
export const PISTOL_WEAPON: Weapon = {
  name: { en: 'Basic Pistol', zh: '基础手枪' },
  category: 'smg',
  damage: 5,
  fireRate: 2,
  bulletSpeed: 7,
  color: '#9ca3af',
  bulletCount: 1,
  piercing: 1,
  critChance: 0.01,
  critDamage: 1.5,
  quality: 10,
  durability: 999999, // "Infinite" ammo
  maxDurability: 999999,
  clipSize: 12,
  ammoInClip: 12,
  reloadTime: 1500,
};

// --- Weapon Quality Tiers ---
// Defines the quality score thresholds and corresponding colors/names for UI.
export const WEAPON_QUALITY_THRESHOLDS = [
    { threshold: 0, color: '#9ca3af', name: { en: 'Common', zh: '普通' } },
    { threshold: 150, color: '#22c55e', name: { en: 'Uncommon', zh: '非凡' } },
    { threshold: 250, color: '#3b82f6', name: { en: 'Rare', zh: '稀有' } },
    { threshold: 400, color: '#a855f7', name: { en: 'Epic', zh: '史诗' } },
    { threshold: 550, color: '#f97316', name: { en: 'Legendary', zh: '传说' } },
];


// --- Monster Data ---
// Provides names, descriptions, and tips for each monster type for the UI.
export const MONSTER_DATA: Record<Monster['type'], { name: { en: string; zh: string; }; description: { en: string; zh: string; }; tip: { en: string; zh: string; }; }> = {
    normal: { name: { en: 'Slime', zh: '史莱姆' }, description: { en: 'A basic, slow-moving creature. Predictable but can overwhelm in numbers.', zh: '一种基础的、移动缓慢的生物。行为可以预测，但数量多时也会造成威胁。' }, tip: { en: 'Easy to kite. Keep your distance and clear them out.', zh: '很容易风筝。保持距离并清理它们。' } },
    elite: { name: { en: 'Armored Brute', zh: '装甲蛮兵' }, description: { en: 'A heavily armored foe with high health. It\'s slow but can take a lot of punishment.', zh: '一个拥有高生命值的重甲敌人。它行动缓慢，但能承受大量伤害。' }, tip: { en: 'Focus fire to break through its defense. Piercing shots are effective.', zh: '集中火力突破它的防御。穿透射击很有效。' } },
    shooter: { name: { en: 'Ranged Imp', zh: '远程小鬼' }, description: { en: 'Keeps its distance and fires single projectiles at its target.', zh: '会保持距离并向目标发射单个投射物。' }, tip: { en: 'Use obstacles for cover and close the distance when it\'s not firing.', zh: '利用障碍物作掩护，在它不射击时拉近距离。' } },
    shotgun_shooter: { name: { en: 'Spitter', zh: '喷吐者' }, description: { en: 'Unleashes a cone-shaped burst of projectiles, covering a wide area.', zh: '释放锥形的投射物爆发，覆盖广阔区域。' }, tip: { en: 'Difficult to dodge up close. Stay far away to find gaps in the spread.', zh: '近距离难以躲避。待在远处寻找散射的间隙。' } },
    healer: { name: { en: 'Support Cleric', zh: '辅助牧师' }, description: { en: 'Avoids direct conflict, preferring to heal other monsters from a safe distance.', zh: '避免直接冲突，喜欢从安全距离治疗其他怪物。' }, tip: { en: 'Prioritize taking these out first! They can make fights last much longer.', zh: '优先干掉它们！它们会使战斗持续更长时间。' } },
    summoner: { name: { en: 'Necromancer', zh: '亡灵法师' }, description: { en: 'Spawns weaker Minions to swarm and distract its enemies.', zh: '会召唤较弱的仆从，用数量淹没和分散敌人的注意力。' }, tip: { en: 'Target the Summoner directly. Its Minions will disappear once it\'s defeated.', zh: '直接攻击召唤师。一旦它被击败，它的仆从就会消失。' } },
    minion: { name: { en: 'Minion', zh: '仆从' }, description: { en: 'Small and weak, summoned by other powerful monsters.', zh: '小而弱，由其他强大的怪物召唤而来。' }, tip: { en: 'They are fragile, but their numbers can be a problem. Area of effect damage is great against them.', zh: '它们很脆弱，但数量可能是个问题。范围伤害对它们效果很好。' } },
    boss: { name: { en: 'The Warden', zh: '典狱长' }, description: { en: 'A massive, powerful entity that combines multiple attack patterns.', zh: '一个巨大而强大的实体，结合了多种攻击模式。' }, tip: { en: 'Stay mobile, learn its attack patterns, and never stop shooting.', zh: '保持移动，学习它的攻击模式，并且永远不要停止射击。' } },
    wisp: { name: { en: 'Phase Wisp', zh: '相位灵' }, description: { en: 'An ethereal being that teleports around and fires homing projectiles.', zh: '一种会四处传送并发射追踪投射物的虚空生物。' }, tip: { en: 'Its projectiles are slow. Use obstacles to block them or make sharp turns to evade.', zh: '它的投射物很慢。利用障碍物阻挡它们或急转弯来躲避。' } },
    bloater: { name: { en: 'Bloater', zh: '膨胀者' }, description: { en: 'A volatile creature that explodes upon death, releasing slowing goop and minions.', zh: '一种不稳定的生物，死亡时会爆炸，释放减速粘液和仆从。' }, tip: { en: 'Keep your distance when you defeat it! The aftermath can be dangerous.', zh: '击败它时要保持距离！后果可能很危险。' } },
    lich_guard: { name: { en: 'Lich Guard', zh: '巫妖守卫' }, description: { en: 'A resilient sentinel summoned by powerful necromancers, protecting its master at all costs.', zh: '由强大亡灵法师召唤的坚韧哨兵，不惜一切代价保护其主人。' }, tip: { en: 'They are tough and often guard a high-value target. Focus them down to expose their master.', zh: '它们很坚韧，通常守卫着一个高价值目标。集中火力干掉它们，以暴露其主人。' } },
};

// --- Dialogue Pools ---
// These provide flavor text for allies and bosses to make the game more dynamic.
export const ALLY_IDLE_DIALOGUE = {
    zh: ['在这地方可不好受，哈？', '这些家伙到底哪来的？', '你有考虑去看会书吗？', '晚上吃什么？', '你知道这个游戏是谁开发的？', '你肯定想不到。', '我的脚好酸...', '但愿我的保险还管用。', '这波打完我就退休。', '又一个？它们就像蟑螂一样。', '我需要一杯咖啡...大杯的。', '我们有报酬吗？', '我怀疑它们有没有牙科保险。', '我的心理医生会拿这个大做文章的。', '至少这比开会强。', '我开始看到粉色的大象了。', '如果我们失败了，能读档吗？', '说真的，谁在清理这些烂摊子？', '我打赌我能闭着眼睛打中一个。别，我开玩笑的。', '这就像最糟糕的实习。', '记住，换弹总比被打死快。', '我觉得我看到一个长得像我叔叔的。真尴尬。', '我的任务简报里可没说有这么多。', '你有没有带零食？', '我觉得我们转错弯了。', '这只是个游戏...对吧？', '小心你的背后！哦等等，那只是我的影子。', '我们到了吗？', '我觉得我的保修期刚过。', '这一切都很好。', '现在是休息时间吗？不？好吧。', '我只是个配角，我没有发言权。', '这墙看起来...很墙。', '你有没有觉得我们一直在绕圈子？'],
    en: ['This place is rough, huh?', 'Where do these things even come from?', 'Ever think about reading a book?', 'What\'s for dinner tonight?', 'Do you know who made this game?', 'You\'d never guess.', 'My feet are killing me...', 'Hope my insurance covers this.', 'I\'m retiring after this wave.', 'Another one? They are like cockroaches.', 'I need a coffee... a large one.', 'Are we getting paid for this?', 'I wonder if they have dental.', 'My therapist is going to have a field day with this.', 'At least it\'s not another meeting.', 'I\'m starting to see pink elephants.', 'If we fail, can we just load a save?', 'Seriously, who cleans up this mess?', 'I bet I could hit one with my eyes closed. No, I\'m kidding.', 'This is like the worst internship ever.', 'Remember, switching to your pistol is always faster than reloading. Wait, we only have one gun.', 'I think I saw one that looked like my uncle. Awkward.', 'This wasn\'t in my mission briefing.', 'Did you bring any snacks?', 'I think we took a wrong turn.', 'It\'s just a game... right?', 'Watch your back! Oh wait, that\'s just my shadow.', 'Are we there yet?', 'I think my warranty just expired.', 'This is fine. Everything is fine.', 'Is it break time? No? Okay.', 'I\'m just the sidekick, I don\'t get a say.', 'These walls look very... wally.', 'Do you ever get the feeling we\'re just going in circles?']
};
export const ALLY_HURT_DIALOGUE = {
    zh: ['我中招了!', '我中弹了!', '我完了。', '请求支援！', '老天，你的名字是谁起的？', '妈妈生的!', '只是擦伤!', '他们打中我了!', '哎哟！', '我感觉到了！', '呃，正中要害。', '我为什么来这儿？', '我的医疗保险不够付这个。', '只是皮外伤!', '走开...走开...', '好吧，这下得留疤了。', '嘿，我这件衬衫是新的！', '行，行，我倒下就是了！'],
    en: ['I\'m hit!', 'Took a bullet!', 'I\'m done for.', 'Requesting backup!', 'Good lord, who gave you that name?', 'My mother did!', 'Tis but a scratch!', 'They got me!', 'Ouch!', 'I felt that!', 'Ugh, right in the money maker.', 'Why did I sign up for this?', 'I am not paid enough for this.', 'Just a flesh wound!', 'Walk it off... walk it off...', 'Well, that\'s gonna leave a mark.', 'Hey, this was a new shirt!', 'Okay, okay, I\'m down!']
};
export const ALLY_BOSS_ENCOUNTER_DIALOGUE = {
    zh: ['大家伙来了！', '准备好迎接一场恶战吧！', '这东西看起来很生气。', '集中火力！', '它看起来比照片上大多了！', '我们肯定需要一把更大的枪。'],
    en: ['Here comes the big one!', 'Get ready for a real fight!', 'That thing looks angry.', 'Focus fire!', 'It\'s much bigger in person!', 'We\'re gonna need a bigger gun. For sure.']
};

// --- UI Translations ---
// Centralized object for all UI strings to support multiple languages.
export const translations = {
    zh: {
        // StartScreen & App
        title: 'Gemini 侠盗',
        welcomeDescription: '欢迎来到一个由AI驱动的rogue-like射击游戏。准备好迎接无尽的怪物浪潮，并用AI生成的强大武器武装自己。',
        instructionsTitle: '游戏说明',
        moveInstruction: '移动: WASD / 箭头键 / 左摇杆',
        shootInstruction: '射击: 鼠标左键 / 自动射击',
        pauseInstruction: '暂停/设置: ESC',
        difficulty: '难度',
        easy: '简单',
        normal: '普通',
        hard: '困难',
        hell: '地狱',
        aiBehavior: '援军AI行为',
        resolute_recruit: '坚决的新兵',
        evasion_first: '闪避优先',
        daring_breakout: '大胆突围',
        startGame: '开始游戏',
        manageCards: '卡牌管理',
        deathPenaltyMessage: '你阵亡了！装备的卡牌已丢失。',

        // GameUI
        achievementUnlocked: '成就已解锁',
        treasureAcquired: '获得宝箱！',
        cardPackAcquired: '获得卡包！',
        boom: '爆炸！',
        artifactTitle: '获得神器！',
        wave: '波数',
        monsterIntroTitle: '新怪物出现',
        hp: '生命',
        shield: '护盾',
        score: '分数',
        lvl: '等级',
        autoWalk: '自动行走',
        manualWalk: '手动行走',
        weapon: '武器',
        dmg: '伤害',
        rate: '射速',
        ammo: '弹药',
        paused: '已暂停',
        leaderboardTitle: '排行榜',
        gameOver: '游戏结束',
        finalScore: '最终分数',
        waveReached: '到达波数',
        playAgain: '再玩一次',
        mainMenu: '主菜单',
        levelUp: '升级！',
        autoSelectIn: '自动选择于',
        settings: '设置',
        autoFire: '自动开火',
        autoSwitchWeapon: '自动切换武器',
        onScreenControls: '显示屏幕控件',
        screenShake: '屏幕震动',
        language: '语言',
        resume: '继续',
        obstacle: '障碍物',

        // Game Logic (useGameLoop)
        allyArrival: '援军抵达！',
        allyDeparted: '援军已撤离。',
        bossAppears: '一个巨大的威胁出现了！',
        praiseTitle: '干得漂亮！',
        cursedUpgrade: '诅咒升级',
        cursedUpgradeTaken: '你接受了诅咒之力...',
        gameSpeaker: '游戏',
        specialEvent: '特殊事件！',
        meteorShower: '流星雨',
        treasureTrove: '宝藏涌现',
        
        // CardManagementScreen
        back: '返回',
        cardPacks: '卡包',
        openCardPack: '打开卡包',
        newCards: '新卡牌！',
        myCards: '我的卡牌',
        equippedCards: '已装备',
        cardInventory: '库存',

        // Achievements
        score10k: '得分超过 10,000！',
        score50k: '得分超过 50,000！',
        score100k: '得分超过 100,000！',
        allObstaclesDestroyed: '场地清理工',
        broken_weapon_1: '第一次损坏',
        broken_weapon_5: '废品收藏家',
        broken_weapon_10: '武器破坏者',
        slimeSquisher: '史莱姆杀手 (击杀100只史莱姆)',
        bulletDodger: '子弹闪避者 (击杀50名射手)',
        eliteHunter: '精英猎手 (击杀25名精英)',
        supportSquasher: '辅助终结者 (击杀10名治疗者)',
        crowdControl: '控场大师 (击杀10名召唤师)',
        bossBane: 'Boss灾星 (击杀5名Boss)',
        survivor: '幸存者 (到达第5波)',
        veteran: '老兵 (到达第10波)',
        warlord: '战争领主 (到达第15波)',
        legend: '传奇 (到达第20波)',
    },
    en: {
        // StartScreen & App
        title: 'Gemini Rogue',
        welcomeDescription: 'Welcome to an AI-powered roguelike shooter. Prepare for endless waves of monsters and arm yourself with powerful AI-generated weapons.',
        instructionsTitle: 'Instructions',
        moveInstruction: 'Move: WASD / Arrow Keys / Left Joystick',
        shootInstruction: 'Shoot: Left Mouse Button / Auto-Fire',
        pauseInstruction: 'Pause/Settings: ESC',
        difficulty: 'Difficulty',
        easy: 'Easy',
        normal: 'Normal',
        hard: 'Hard',
        hell: 'Hell',
        aiBehavior: 'Ally AI Behavior',
        resolute_recruit: 'Resolute Recruit',
        evasion_first: 'Evasion First',
        daring_breakout: 'Daring Breakout',
        startGame: 'Start Game',
        manageCards: 'Manage Cards',
        deathPenaltyMessage: 'You have fallen! Your equipped cards have been lost.',
        
        // GameUI
        achievementUnlocked: 'Achievement Unlocked',
        treasureAcquired: 'Treasure Acquired!',
        cardPackAcquired: 'Card Pack Acquired!',
        boom: 'BOOM!',
        artifactTitle: 'Artifact Acquired!',
        wave: 'Wave',
        monsterIntroTitle: 'New Monster Encountered',
        hp: 'HP',
        shield: 'Shield',
        score: 'Score',
        lvl: 'Lvl',
        autoWalk: 'Auto-Walk',
        manualWalk: 'Manual Walk',
        weapon: 'Weapon',
        dmg: 'Dmg',
        rate: 'Rate',
        ammo: 'Ammo',
        paused: 'PAUSED',
        leaderboardTitle: 'Leaderboard',
        gameOver: 'Game Over',
        finalScore: 'Final Score',
        waveReached: 'Wave Reached',
        playAgain: 'Play Again',
        mainMenu: 'Main Menu',
        levelUp: 'LEVEL UP!',
        autoSelectIn: 'Auto-select in',
        settings: 'Settings',
        autoFire: 'Auto-Fire',
        autoSwitchWeapon: 'Auto-Switch Weapon',
        onScreenControls: 'On-Screen Controls',
        screenShake: 'Screen Shake',
        language: 'Language',
        resume: 'Resume',
        obstacle: 'Obstacle',

        // Game Logic (useGameLoop)
        allyArrival: 'Reinforcements have arrived!',
        allyDeparted: 'Allies have departed.',
        bossAppears: 'A massive threat has appeared!',
        praiseTitle: 'NICE SHOT!',
        cursedUpgrade: 'Cursed Upgrade',
        cursedUpgradeTaken: 'You accepted the cursed power...',
        gameSpeaker: 'Game',
        specialEvent: 'SPECIAL EVENT!',
        meteorShower: 'Meteor Shower',
        treasureTrove: 'Treasure Trove',
        
        // CardManagementScreen
        back: 'Back',
        cardPacks: 'Card Packs',
        openCardPack: 'Open Card Pack',
        newCards: 'New Cards!',
        myCards: 'My Cards',
        equippedCards: 'Equipped',
        inventory: 'Inventory',

        // Achievements
        score10k: 'Score over 10,000!',
        score50k: 'Score over 50,000!',
        score100k: 'Score over 100,000!',
        allObstaclesDestroyed: 'Site Surveyor',
        broken_weapon_1: 'First Break',
        broken_weapon_5: 'Scrapper',
        broken_weapon_10: 'Weapon Breaker',
        slimeSquisher: 'Slime Squisher (Slay 100 Slimes)',
        bulletDodger: 'Bullet Dodger (Slay 50 Shooters)',
        eliteHunter: 'Elite Hunter (Slay 25 Elites)',
        supportSquasher: 'Support Squasher (Slay 10 Healers)',
        crowdControl: 'Crowd Control (Slay 10 Summoners)',
        bossBane: 'Boss Bane (Slay 5 Bosses)',
        survivor: 'Survivor (Reach Wave 5)',
        veteran: 'Veteran (Reach Wave 10)',
        warlord: 'Warlord (Reach Wave 15)',
        legend: 'Legend (Reach Wave 20)',
    }
};

// --- Difficulty Settings ---
// Defines the multipliers for game parameters based on difficulty level.
export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultyModifiers> = {
  easy: { playerDamageTaken: 0.75, monsterHealth: 0.8, monsterSpeed: 0.9, xpGain: 1.2, monsterDamage: 0.8 },
  normal: { playerDamageTaken: 1.0, monsterHealth: 1.0, monsterSpeed: 1.0, xpGain: 1.0, monsterDamage: 1.0 },
  hard: { playerDamageTaken: 1.25, monsterHealth: 1.8, monsterSpeed: 1.1, xpGain: 0.9, monsterDamage: 1.4 },
  hell: { playerDamageTaken: 1.5, monsterHealth: 2.5, monsterSpeed: 1.2, xpGain: 0.8, monsterDamage: 1.8 },
};

// --- Achievement Thresholds ---
export const BROKEN_WEAPON_THRESHOLDS = [
    { count: 1, id: 'broken_weapon_1', title: 'broken_weapon_1' },
    { count: 5, id: 'broken_weapon_5', title: 'broken_weapon_5' },
    { count: 10, id: 'broken_weapon_10', title: 'broken_weapon_10' },
];

export const SCORE_ACHIEVEMENT_THRESHOLDS = [
    { score: 10000, id: 'score10k' },
    { score: 50000, id: 'score50k' },
    { score: 100000, id: 'score100k' },
];

export const MONSTER_KILL_ACHIEVEMENT_THRESHOLDS = [
    { type: 'normal' as const, count: 100, id: 'kill_slime_100', title: 'slimeSquisher' },
    { type: 'shooter' as const, count: 50, id: 'kill_shooter_50', title: 'bulletDodger' },
    { type: 'elite' as const, count: 25, id: 'kill_elite_25', title: 'eliteHunter' },
    { type: 'healer' as const, count: 10, id: 'kill_healer_10', title: 'supportSquasher' },
    { type: 'summoner' as const, count: 10, id: 'kill_summoner_10', title: 'crowdControl' },
    { type: 'boss' as const, count: 5, id: 'kill_boss_5', title: 'bossBane' },
];

export const WAVE_ACHIEVEMENT_THRESHOLDS = [
    { wave: 5, id: 'wave_5', title: 'survivor' },
    { wave: 10, id: 'wave_10', title: 'veteran' },
    { wave: 15, id: 'wave_15', title: 'warlord' },
    { wave: 20, id: 'wave_20', title: 'legend' },
];


// --- More Dialogue Pools ---
export const ALLY_CURSED_UPGRADE_DIALOGUE = {
    zh: ['你确定要这么做吗？', '这股力量...感觉不对劲。', '风险很高，但回报也可能很高。', '我希望你知道你在做什么。', '不要被力量蒙蔽了双眼！'],
    en: ['Are you sure about this?', 'This power... it feels wrong.', 'High risk, high reward, I guess.', 'I hope you know what you\'re doing.', 'Don\'t let the power consume you!']
};

export const BOSS_SPAWN_DIALOGUE = {
    zh: ['你以为你能打败我？', '到此为止了，凡人。', '感受我的怒火！', '游戏结束了。'],
    en: ['You think you can defeat me?', 'This ends now, mortal.', 'Feel my wrath!', 'It\'s game over for you.']
};

export const BOSS_ATTACK_DIALOGUE = {
    zh: ['躲开这个！', '太慢了！', '无处可逃！', '感受痛苦吧！'],
    en: ['Dodge this!', 'Too slow!', 'Nowhere to run!', 'Suffer!']
};

export const BOSS_DEFEAT_DIALOGUE = {
    zh: ['不...这不可能...', '我...还会回来的...', '这只是个开始...', '呃啊啊啊！'],
    en: ['No... this can\'t be...', 'I... will return...', 'This is only the beginning...', 'Arrrgh!']
};

export const PLAYER_PRAISE_DIALOGUE = {
    zh: ['漂亮！', '干得好！', '致命一击！', '打得不错！', '正中目标！', '不可思议！', '完美！', '大师级操作！', '无人能挡！', '漂亮的一枪！', '很好的射击！', '不错！', '做的好！', '继续加油！'],
    en: ['Nice shot!', 'Good one!', 'Critical hit!', 'Well played!', 'Right on target!', 'Incredible!', 'Flawless!', 'Masterful!', 'Unstoppable!', 'Beautiful shot!', 'Great shot!', 'Not bad!', 'Well done!', 'Keep it up!']
};

export const THEMATIC_MONSTER_DIALOGUE: Record<string, { zh: string[], en: string[] }> = {
    "Angry Shopper": {
        zh: ["我的优惠券过期了？！", "我要找经理！"],
        en: ["My coupon expired?!", "I want to see the manager!"]
    },
    "Karen": {
        zh: ["这是不可接受的！", "让我跟你的上司说话！"],
        en: ["This is UNACCEPTABLE!", "Let me speak to your supervisor!"]
    },
    "Secret Service": {
        zh: ["保护总统！", "目标已锁定。"],
        en: ["Protect the president!", "Target acquired."]
    },
};

// Dialogue for the "Game" speaker, providing meta-commentary.
export const GAME_REMARKS_DIALOGUE: Record<string, { zh: string[], en: string[] }> = {
    cursed_upgrade: {
        zh: ["高风险，高回报！", "你感觉力量涌入...但代价是什么？", "一个有趣的决定...", "我们喜欢看热闹。", "哦，这个会很有趣。"],
        en: ["High risk, high reward!", "You feel power coursing through you... but at what cost?", "An interesting choice...", "We do love a bit of chaos.", "Ooh, this is gonna be fun."]
    },
    artifact_upgrade: {
        zh: ["现在才像话！", "宇宙为你屈服了...一点点。", "这大概算作弊吧。", "平衡性是什么？能吃吗？"],
        en: ["Now we're talking!", "The universe bends to your will... a little.", "That's probably cheating.", "What is game balance, anyway?"]
    },
    big_explosion: {
        zh: ["这才是烟花！", "清理干净！", "大...大爆炸！", "比我预期的要响。", "艺术就是爆炸！"],
        en: ["Now that's what I call fireworks!", "Clean sweep!", "Bada... Bada-BOOM!", "Louder than I expected.", "Art is an explosion!"]
    },
    boss_encounter: {
        zh: ["看看这只猫拖进来了什么。一只又大又气的猫。", "期末考试时间。别挂科。", "你记得存档了吗？", "温馨提示：大的那个是坏人。"],
        en: ["Look what the cat dragged in. A very big, angry cat.", "Time for the final exam. Don't fail.", "Did you remember to save?", "Friendly reminder: the big one is the bad guy."]
    },
    ally_death: {
        zh: ["好吧，少了一张要喂的嘴。", "他是个好...人。大概吧。", "别担心，他们能重生。我猜。", "他会没事的。大概。"],
        en: ["Well, that's one less mouth to feed.", "He was a good... guy. Probably.", "Don't worry, they're respawnable. I think.", "He'll be fine. Probably."]
    },
    player_low_health: {
        zh: ["你看起来有点憔悴。", "专业提示：试着别被打到。", "红色的东西应该待在里面。", "情况不妙...但你还活着！", "坚持住！", "那看起来很疼。"],
        en: ["Looking a bit peaky there.", "Pro tip: Try not getting hit.", "The red stuff is supposed to stay on the inside.", "That was close... but you're still kicking!", "Hang in there!", "That looked like it hurt."]
    },
    epic_weapon_pickup: {
        zh: ["这东西看起来能造成点真伤。", "现在我们来真的了！", "我喜欢这把枪的颜色。"],
        en: ["This looks like it'll do some real damage.", "Now we're talking!", "I like the color of this one."]
    },
    legendary_weapon_pickup: {
        zh: ["我的天... 这合法吗？", "他们会后悔看到我拿着这个。", "这简直就是一件艺术品！", "现在去造成一些严重的破坏吧。"],
        en: ["Oh my... is this even legal?", "They're gonna regret seeing me with this.", "This is a work of art!", "Now go do some serious damage."]
    },
    wave_clear_low_hp: {
        zh: ["死里逃生！", "我甚至都没出汗。好吧，也许出了一点。", "他们差点就抓到我了！"],
        en: ["Survived by the skin of my teeth!", "I'm not even sweating. Okay, maybe a little.", "They almost had me!"]
    }
};


// --- Thematic Waves ---
export const THEMATIC_WAVES: WaveTheme[] = [
    {
        title: { en: 'Supermarket Pandemonium', zh: '胡闹超市' },
        description: { en: 'Cleanup on aisle 5... and 6, and 7, and 8.', zh: '五号通道需要清理……六、七、八号也一样。' },
        bossName: { en: 'The Manager', zh: '经理' },
        monsterNames: {
            normal: { en: 'Angry Shopper', zh: '愤怒的顾客' },
            shooter: { en: 'Price Scanner', zh: '价格扫描枪' },
            healer: { en: 'Janitor', zh: '保洁员' },
            elite: { en: 'Karen', zh: '凯伦' },
            summoner: { en: 'Coupon Dispenser', zh: '优惠券分发机' },
        },
        modifiers: { health: 1.0, speed: 1.0, count: 1.0 }
    },
    {
        title: { en: 'Happy Fun Park', zh: '快乐公园' },
        description: { en: 'The rides are a bit more aggressive than advertised.', zh: '这里的游乐设施比广告上说的要刺激一点。' },
        bossName: { en: 'Furious Mascot', zh: '愤怒的吉祥物' },
        monsterNames: {
            normal: { en: 'Lost Child', zh: '走失的小孩' },
            shooter: { en: 'Popcorn Vendor', zh: '爆米花小贩' },
            bloater: { en: 'Over-inflated Balloon', zh: '过度充气的气球' },
            wisp: { en: 'Cotton Candy Ghost', zh: '棉花糖幽灵' },
        },
        modifiers: { health: 1.0, speed: 1.2, count: 1.0 }
    },
    {
        title: { en: 'Presidential Office', zh: '总统办公室' },
        description: { en: 'This meeting has gotten out of hand.', zh: '这场会议已经失控了。' },
        bossName: { en: 'The President', zh: '总统' },
        monsterNames: {
            normal: { en: 'Intern', zh: '实习生' },
            shooter: { en: 'Paparazzi', zh: '狗仔队' },
            healer: { en: 'Spin Doctor', zh: '公关' },
            lich_guard: { en: 'Secret Service', zh: '特勤' },
        },
        modifiers: { health: 1.2, speed: 1.0, count: 0.9 }
    },
    {
        title: { en: 'Street Art', zh: '街头艺术' },
        description: { en: 'The exhibition is... interactive.', zh: '这次展览是……互动式的。' },
        bossName: { en: 'The Critic', zh: '评论家' },
        monsterNames: {
            normal: { en: 'Living Graffiti', zh: '活体涂鸦' },
            shooter: { en: 'Paintball Gunner', zh: '彩弹枪手' },
            shotgun_shooter: { en: 'Spray Can', zh: '喷漆罐' },
            summoner: { en: 'The Muse', zh: '缪斯' },
        },
        modifiers: { health: 0.8, speed: 1.1, count: 1.2 }
    },
    {
        title: { en: 'Arcade Invasion', zh: '街机入侵' },
        description: { en: 'These games are playing YOU.', zh: '是这些游戏在玩你。' },
        bossName: { en: 'High Score', zh: '最高分' },
        monsterNames: {
            normal: { en: 'Pixelated Pawn', zh: '像素兵' },
            wisp: { en: 'Ghost in the Machine', zh: '机器里的幽灵' },
            elite: { en: 'Corrupted Sprite', zh: '损坏的精灵图' },
            shooter: { en: 'Token Launcher', zh: '代币发射器' },
        },
        modifiers: { health: 1.1, speed: 1.1, count: 1.1 }
    }
];


// Specific dialogue sets for each local boss.
export const THEMATIC_BOSS_DIALOGUE: Record<string, {
    spawn: { zh: string[], en: string[] },
    attack: { zh: string[], en: string[] },
    defeat: { zh: string[], en: string[] }
}> = {
    'The Manager': {
        spawn: { zh: ["清理这个烂摊子！", "我要见你的经理！哦等等，我就是。"], en: ["Clean up this mess!", "I want to see your manager! Oh wait, I AM the manager."] },
        attack: { zh: ["你被解雇了！", "价格检查！", "这不符合公司规定！"], en: ["You're fired!", "Price check!", "That's against company policy!"] },
        defeat: { zh: ["我...要...申请...加班...", "我的季度奖金..."], en: ["I'm... putting in for... overtime...", "My quarterly bonus..."] }
    },
    'Furious Mascot': {
        spawn: { zh: ["欢迎来到快乐地狱！", "拥抱时间到！"], en: ["Welcome to the happiest place on... DOOM!", "Time for a hug!"] },
        attack: { zh: ["笑一个！", "玩得开心点！", "感受魔法吧！"], en: ["Smile!", "Have fun!", "Feel the magic!"] },
        defeat: { zh: ["我的合同里...没写这个...", "快乐时光...结束了..."], en: ["This... wasn't in my contract...", "The fun time... is over..."] }
    },
     'The President': {
        spawn: { zh: ["我否决你的存在！", "为了国家！"], en: ["I veto your existence!", "For the nation!"] },
        attack: { zh: ["行政命令！", "无可奉告！", "这是为了更大的利益！"], en: ["Executive Order!", "No comment!", "This is for the greater good!"] },
        defeat: { zh: ["我...的支持率...", "我还会回来的...在下个任期..."], en: ["My... approval ratings...", "I'll be back... next term..."] }
    },
    'The Critic': {
        spawn: { zh: ["你的表现缺乏创意！", "毫无新意！"], en: ["Your performance lacks creativity!", "Derivative!"] },
        attack: { zh: ["太生硬了！", "没有灵魂！", "这根本不叫艺术！"], en: ["Too rigid!", "No soul!", "This is not art!"] },
        defeat: { zh: ["我收回...我的话...", "也许...我错了..."], en: ["I take... it all back...", "Perhaps... I was wrong..."] }
    },
    'High Score': {
        spawn: { zh: ["新玩家加入！", "准备好了吗，玩家一号？"], en: ["New player has entered!", "Ready player one?"] },
        attack: { zh: ["连击！", "多重球！", "提升难度！"], en: ["COMBO!", "MULTI-BALL!", "DIFFICULTY INCREASED!"] },
        defeat: { zh: ["游戏...结束...", "请...投入...硬币..."], en: ["GAME... OVER...", "PLEASE... INSERT... COIN..."] }
    }
};

/**
 * Generates a procedural wave theme based on the current wave number.
 * @param wave - The current wave number.
 * @returns {WaveTheme} The generated theme for the wave.
 */
export const generateThematicWave = (wave: number): WaveTheme => {
    const theme = THEMATIC_WAVES[(wave - 1) % THEMATIC_WAVES.length];
    
    // Add a chance for some extra flavor text.
    if (Math.random() < 0.3) {
        theme.flavorText = {
            en: 'A strange energy emanates from this wave...',
            zh: '这一波散发着一股奇怪的能量...'
        };
    }
    
    return theme;
};