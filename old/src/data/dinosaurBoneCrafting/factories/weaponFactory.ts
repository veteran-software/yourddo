import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { findSetBonus } from '../../setBonuses.ts'
import { createBaseItem, createRequirements } from './static.ts'

export const createScale = (prefix: string, materialType: string, effectDesc: string): CraftingIngredient =>
  ({
    ...createBaseItem(`${prefix}scale`, 'Isle of Dread: Scale (Weapon)'),
    effectsAdded: [{ name: `Material Type: ${materialType}` }, { name: effectDesc }],
    requirements: createRequirements(25)
  }) as CraftingIngredient

// Fang item factory
export const createFang = (prefix: string, alignment: string, effect: string): CraftingIngredient =>
  ({
    ...createBaseItem(`${prefix}fang`, 'Isle of Dread: Fang (Weapon)'),
    effectsAdded: [{ name: `Alignment Bypass: ${alignment}` }, { name: effect }],
    requirements: createRequirements(50)
  }) as CraftingIngredient

// Claw item factory
export const createClaw = (prefix: string, stat: string): CraftingIngredient =>
  ({
    ...createBaseItem(`${prefix}claw`, 'Isle of Dread: Claw (Weapon)'),
    effectsAdded: [
      {
        name: `${stat} +2`,
        modifier: 2,
        bonus: 'Exceptional'
      }
    ],
    requirements: createRequirements(25, [
      {
        name: 'Fossilized Tyrannosaurus Tooth',
        quantity: 100,
        requirements: []
      }
    ])
  }) as CraftingIngredient

// Horn item factory
export const createHorn = (prefix: string, effects: Enhancement[]): CraftingIngredient =>
  ({
    ...createBaseItem(`${prefix}horn`, 'Isle of Dread: Horn (Weapon)'),
    effectsAdded: effects.map((effect) => ({
      name: effect.name,
      modifier: effect.modifier
    })),
    requirements: createRequirements(50, [
      {
        name: 'Black Pearl',
        quantity: 50,
        requirements: []
      }
    ])
  }) as CraftingIngredient

export const createIridiscentClaw = (element: string): CraftingIngredient =>
  ({
    ...createBaseItem(`Iridiscent Claw: ${element}`, 'Isle of Dread: Claw (Weapon)'),
    image: 'iridiscentClaw',
    effectsAdded: [
      {
        name: `${element} Spellpower`,
        modifier: 149,
        bonus: 'Equipment'
      }
    ],
    requirements: createRequirements(25, [
      {
        name: 'Fossilized Tyrannosaurus Tooth',
        quantity: 100
      }
    ])
  }) as CraftingIngredient

export const dinosaurRunearm: CraftingIngredient = {
  name: 'Dinosaur Bone Runearm',
  description: 'This Runearm is a blend of dinosaur bone and magical technology.',
  type: 'Rune Arm',
  quantity: 1,
  binding: {
    type: 'Bound',
    to: 'Account',
    from: 'Acquisition'
  },
  effectsAdded: [
    {
      name: 'Maximum Charge Tier: V'
    },
    {
      name: 'Rune Arm Imbue: Evil Shot VI'
    }
  ],
  runeArmBlast: {
    name: 'Corrupted Fire Blast',
    target: ['Directional', 'Foe', 'Breakable'],
    duration: 'Instantaneous',
    school: 'Evocation'
  },
  augments: [
    {
      isleOfDreadScaleWeapon: null,
      isleOfDreadFangWeapon: null,
      isleOfDreadScaleArmor: null,
      isleOfDreadFangArmor: null,
      orange: null,
      purple: null
    }
  ],
  setBonus: [findSetBonus("The Legendary Dread Isle's Curse")],
  foundIn: ['Skeletons in the Closet', 'Dread Rune Barter']
}
