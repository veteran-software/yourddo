import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { commonBinding } from './static.ts'

export const createArmorScale = (name: string, effects: Enhancement[]): CraftingIngredient => ({
  name: `${name}scale`,
  minimumLevel: 31,
  quantity: 1,
  binding: commonBinding,
  augmentType: 'Isle of Dread: Scale (Armor)',
  craftedIn: 'Sharpened Bone [Village of Tanaroa]',
  effectsAdded: effects,
  requirements: [
    {
      name: 'Fossilized Tyrannosaurus Tooth',
      quantity: 100
    },
    {
      name: 'Fossilized Raptor Claw',
      quantity: 25
    },
    {
      name: 'Fossilized Triceratops Horn',
      quantity: 25
    },
    {
      name: 'Fossilized Pteradon Vertebra',
      quantity: 25
    },
    {
      name: 'Fossilized Ankylosaur Rib',
      quantity: 25
    }
  ]
})

// Factory function for armor fangs
export const createArmorFang = (name: string, effects: Enhancement[]): CraftingIngredient => ({
  name: `${name}fang`,
  minimumLevel: 31,
  quantity: 1,
  binding: commonBinding,
  augmentType: 'Isle of Dread: Fang (Armor)',
  craftedIn: 'Sharpened Bone [Village of Tanaroa]',
  effectsAdded: effects,
  requirements: [
    {
      name: 'Black Pearl',
      quantity: 50
    },
    {
      name: 'Fossilized Raptor Claw',
      quantity: 50
    },
    {
      name: 'Fossilized Triceratops Horn',
      quantity: 50
    },
    {
      name: 'Fossilized Pteradon Vertebra',
      quantity: 50
    },
    {
      name: 'Fossilized Ankylosaur Rib',
      quantity: 50
    }
  ]
})

// Armor items data
export const armorItems = [
  {
    type: 'scale',
    name: 'Gold',
    effects: [
      {
        name: 'Fortification +150%',
        modifier: '150%',
        bonus: 'Enhancement'
      }
    ]
  },
  {
    type: 'scale',
    name: 'Silver',
    effects: [
      {
        name: 'Healing Amplification +56',
        modifier: 56,
        bonus: 'Competence'
      },
      {
        name: 'Repair Amplification +56',
        modifier: 56,
        bonus: 'Enhancement'
      },
      {
        name: 'Negative Amplification +56',
        modifier: 56,
        bonus: 'Profane'
      }
    ]
  },
  {
    type: 'scale',
    name: 'Bronze',
    effects: [{ name: 'Deathblock' }, { name: 'Ghostly' }]
  },
  {
    type: 'scale',
    name: 'Void',
    effects: [
      {
        name: 'Universal Spell Lore +5%',
        modifier: '5%',
        bonus: 'Exceptional'
      }
    ]
  },
  {
    type: 'fang',
    name: 'Gold',
    effects: [
      {
        name: 'Sneak Attack Dice +2d6',
        modifier: '2d6',
        bonus: 'Profane'
      }
    ]
  },
  {
    type: 'fang',
    name: 'Silver',
    effects: [
      {
        name: 'Spell DCs +2',
        modifier: 2,
        bonus: 'Profane'
      },
      {
        name: 'Tactical DCs +2',
        modifier: 2,
        bonus: 'Profane'
      },
      {
        name: 'Assassinate +2',
        modifier: 2,
        bonus: 'Profane'
      }
    ]
  },
  {
    type: 'fang',
    name: 'Void',
    effects: [
      {
        name: 'Universal Spell Power +15',
        modifier: 15,
        bonus: 'Exceptional'
      }
    ]
  }
]
