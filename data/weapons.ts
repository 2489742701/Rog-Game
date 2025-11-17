import type { Weapon } from '../src/types';

/**
 * @file This file contains a predefined library of weapons.
 * These weapons are used for:
 * - The player's starting weapon options.
 * - Equipping friendly ally NPCs.
 * - Fallback weapon drops if the AI generation fails.
 * - Providing a baseline for monster-held weapons.
 */

/**
 * An array of predefined weapon objects.
 * Each weapon is designed with a specific role or characteristic in mind
 * (e.g., high fire rate, multiple projectiles, high damage).
 */
export const PREDEFINED_WEAPONS: Weapon[] = [
  {
    name: { en: 'Scattergun', zh: '散射枪' },
    category: 'shotgun',
    damage: 8,
    fireRate: 2,
    bulletSpeed: 7,
    color: '#f97316',
    bulletCount: 5, // Characteristic: multiple projectiles
    piercing: 1,
    critChance: 0.05,
    critDamage: 1.5,
    quality: 114,
    durability: 80, // Reserve Ammo
    maxDurability: 80,
    clipSize: 6,
    ammoInClip: 6,
    reloadTime: 2500,
  },
  {
    name: { en: 'Rapid SMG', zh: '速射冲锋枪' },
    category: 'smg',
    damage: 6,
    fireRate: 12, // Characteristic: high fire rate
    bulletSpeed: 8,
    color: '#eab308',
    bulletCount: 1,
    piercing: 1,
    critChance: 0.05,
    critDamage: 1.5,
    quality: 160,
    durability: 200,
    maxDurability: 200,
    clipSize: 40,
    ammoInClip: 40,
    reloadTime: 2000,
  },
  {
    name: { en: 'Heavy Rifle', zh: '重型步枪' },
    category: 'rifle',
    damage: 40, // Characteristic: high damage
    fireRate: 1.5,
    bulletSpeed: 15,
    color: '#6366f1',
    bulletCount: 1,
    piercing: 3, // Characteristic: high piercing
    critChance: 0.15,
    critDamage: 2.0,
    quality: 240,
    durability: 60,
    maxDurability: 60,
    clipSize: 10,
    ammoInClip: 10,
    reloadTime: 3000,
  },
  {
    name: { en: 'Plasma Repeater', zh: '等离子连射枪' },
    category: 'smg',
    damage: 15,
    fireRate: 5,
    bulletSpeed: 12, // Characteristic: high bullet speed
    color: '#ec4899',
    bulletCount: 1,
    piercing: 2,
    critChance: 0.08,
    critDamage: 1.6,
    quality: 201,
    durability: 120,
    maxDurability: 120,
    clipSize: 25,
    ammoInClip: 25,
    reloadTime: 2200,
  },
    {
    name: { en: 'Flamethrower', zh: '火焰喷射器' },
    category: 'launcher',
    damage: 5,
    fireRate: 20,
    bulletSpeed: 5, // Characteristic: short range
    color: '#f59e0b',
    bulletCount: 1,
    piercing: 1,
    critChance: 0.01,
    critDamage: 1.5,
    quality: 210,
    durability: 300,
    maxDurability: 300,
    clipSize: 100,
    ammoInClip: 100,
    reloadTime: 3500,
    onImpact: {
        type: 'fire',
        size: { width: 40, height: 40 },
        duration: 3000, // 3 seconds
        damage: 15, // Damage per second
    },
  },
  {
    name: { en: 'Pollution Launcher', zh: '污染发射器' },
    category: 'launcher',
    damage: 25,
    fireRate: 1,
    bulletSpeed: 4,
    color: '#84cc16',
    bulletCount: 1,
    piercing: 1,
    critChance: 0.05,
    critDamage: 1.5,
    quality: 180,
    durability: 20,
    maxDurability: 20,
    clipSize: 3,
    ammoInClip: 3,
    reloadTime: 4000,
    onImpact: {
        type: 'poison',
        size: { width: 120, height: 120 }, // Large area of effect
        duration: 8000, // 8 seconds
        damage: 20, // Damage per second
    },
  },
  {
    name: { en: 'Triple Shot', zh: '三连发' },
    category: 'shotgun',
    damage: 12,
    fireRate: 4,
    bulletSpeed: 6,
    color: '#14b8a6',
    bulletCount: 3, // Characteristic: three projectiles
    piercing: 1,
    critChance: 0.05,
    critDamage: 1.5,
    quality: 150,
    durability: 100,
    maxDurability: 100,
    clipSize: 12,
    ammoInClip: 12,
    reloadTime: 2800,
  },
  {
    name: { en: 'Singularity Cannon', zh: '奇点炮' },
    category: 'rifle',
    damage: 150, // Characteristic: extremely high damage
    fireRate: 0.5, // Characteristic: extremely low fire rate
    bulletSpeed: 20,
    color: '#ffffff',
    bulletCount: 1,
    piercing: 10, // Characteristic: extremely high piercing
    critChance: 0.25,
    critDamage: 2.5,
    quality: 557,
    durability: 10,
    maxDurability: 10,
    clipSize: 1,
    ammoInClip: 1,
    reloadTime: 5000,
  },
  {
    name: { en: 'Lightning SMG', zh: '闪电冲锋枪' },
    category: 'smg',
    damage: 10,
    fireRate: 15, // Characteristic: very high fire rate
    bulletSpeed: 10,
    color: '#8b5cf6',
    bulletCount: 1,
    piercing: 4,
    critChance: 0.1,
    critDamage: 1.7,
    quality: 275,
    durability: 250,
    maxDurability: 250,
    clipSize: 50,
    ammoInClip: 50,
    reloadTime: 1800,
  },
  {
    name: { en: 'Bullet Cyclone Minigun', zh: '子弹飓风机枪' },
    category: 'shotgun',
    damage: 7,
    fireRate: 10,
    bulletSpeed: 9,
    color: '#fbbf24',
    bulletCount: 8, // Characteristic: very high projectile count
    piercing: 1,
    critChance: 0.02,
    critDamage: 1.5,
    quality: 224,
    durability: 300,
    maxDurability: 300,
    clipSize: 80,
    ammoInClip: 80,
    reloadTime: 4500,
  },
  // --- New Fun Weapons ---
  {
    name: { en: 'Bubble Gun', zh: '泡泡枪' },
    category: 'special',
    damage: 2,
    fireRate: 10,
    bulletSpeed: 4,
    color: '#60a5fa',
    bulletCount: 3,
    piercing: 1,
    critChance: 0.01,
    critDamage: 1.5,
    quality: 90,
    durability: 400,
    maxDurability: 400,
    clipSize: 60,
    ammoInClip: 60,
    reloadTime: 1500,
  },
   {
    name: { en: 'Bouncing Blade Launcher', zh: '弹射刀刃发射器' },
    category: 'launcher',
    damage: 30,
    fireRate: 1.2,
    bulletSpeed: 8,
    color: '#f43f5e',
    bulletCount: 1,
    piercing: 3, // Bounces are handled via piercing logic for simplicity
    critChance: 0.1,
    critDamage: 1.8,
    quality: 280,
    durability: 25,
    maxDurability: 25,
    clipSize: 5,
    ammoInClip: 5,
    reloadTime: 3200,
  },
  {
    name: { en: 'Confetti Cannon', zh: '五彩纸屑炮' },
    category: 'shotgun',
    damage: 15,
    fireRate: 1,
    bulletSpeed: 6,
    color: '#fde047',
    bulletCount: 15,
    piercing: 1,
    critChance: 0.05,
    critDamage: 1.6,
    quality: 250,
    durability: 40,
    maxDurability: 40,
    clipSize: 8,
    ammoInClip: 8,
    reloadTime: 2000,
  }
];
