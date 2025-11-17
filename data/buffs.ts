import type { Buff } from '../src/types';

/**
 * @file This file contains predefined templates for temporary buffs (Buffs)
 * that the player can acquire from sources like treasure chests.
 */

/**
 * An array of predefined buff objects. When a player acquires a buff,
 * one of these templates is used to create a new Buff instance in the game state.
 */
export const PREDEFINED_BUFFS: Omit<Buff, 'id' | 'createdAt'>[] = [
  {
    title: { en: 'Rage', zh: '狂怒' },
    description: { en: '+50% Damage for 10s', zh: '+50% 伤害，持续10秒' },
    duration: 10000,
    effects: [{ type: 'STAT_MOD', stat: 'damageMultiplier', op: 'multiply', value: 1.5 }],
    color: '#ef4444', // red-500
  },
  {
    title: { en: 'Haste', zh: '急速' },
    description: { en: '+30% Speed for 15s', zh: '+30% 移动速度，持续15秒' },
    duration: 15000,
    effects: [{ type: 'STAT_MOD', stat: 'speed', op: 'multiply', value: 1.3 }],
    color: '#3b82f6', // blue-500
  },
  {
    title: { en: 'Rapid Fire', zh: '速射' },
    description: { en: '+40% Fire Rate for 10s', zh: '+40% 射速，持续10秒' },
    duration: 10000,
    effects: [{ type: 'STAT_MOD', stat: 'fireRate', op: 'multiply', value: 1.4 }],
    color: '#eab308', // yellow-500
  },
  {
    title: { en: 'Ironskin', zh: '钢铁皮肤' },
    description: { en: 'Gain 100 temporary shield', zh: '获得100点临时护盾' },
    duration: 20000,
    effects: [{ type: 'ADD_SHIELD', amount: 100 }],
    color: '#6b7280', // gray-500
  },
];