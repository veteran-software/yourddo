import type { Weapon } from '../types/weapon.ts'

export const weapons: Weapon[] = [
  {
    name: 'Green Steel Dagger',
    proficiency: 'Simple',
    minimumLevel: 12,
    bind: {
      type: 'Bound',
      location: 'Character',
      when: 'Equip'
    },
    damage: {
      dice: 'd4',
      numberOfDice: 1,
      diceMultiplier: 1.5,
      diceModifier: 5,
      type: ['Piercing', 'Evil', 'Magic'],
      bonus: 0
    },
    criticalProfile: {
      range: {
        minimum: 19,
        maximum: 20
      },
      multiplier: 2
    },
    type: 'Dagger',
    class: 'Piercing',
    handedness: 'Light',
    attackMod: 'STR',
    damageMod: 'STR',
    enhancements: ['+5 Enhancement Bonus', 'Green Steel'],
    durability: 90,
    hardness: 25,
    cost: {
      platinum: 5400,
      gold: 2
    },
    weight: 1.0,
    description:
      'A short simple weapon with a pointed blade used for stabbing.',
    material: 'Steel'
  }
]
