import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { meleeWeapons, rangedWeapons, throwingWeapons } from '../../basics/weapons.ts'
import { findSetBonus } from '../../setBonuses.ts'

export const attunedBoneWeaponFactory = (
  name: string,
  itemType: string,
  extraEffects?: Enhancement
): CraftingIngredient => ({
  name: `Attuned Bone ${name}`,
  description: 'Fashioned of intricately carved bones of long-forgotten Dinosaurs.',
  type: itemType,
  quantity: 1,
  binding: {
    type: 'Bound',
    to: 'Character',
    from: 'Acquisition'
  },
  foundIn: ['Skeletons in the Closet'],
  effectsAdded: extraEffects
    ? [
        {
          name: '+15 Enhancement Bonus',
          modifier: 15,
          bonus: 'Enhancement'
        },
        extraEffects
      ]
    : [
        {
          name: '+15 Enhancement Bonus',
          modifier: 15,
          bonus: 'Enhancement'
        }
      ],
  augments: [
    {
      isleOfDreadScaleWeapon: null,
      isleOfDreadFangWeapon: null,
      isleOfDreadClawWeapon: null,
      isleOfDreadHornWeapon: null,
      orange: null,
      purple: null
    }
  ],
  setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
})

export const attunedBoneWeapons: Record<string, CraftingIngredient[]> = {
  Melee: [...meleeWeapons.map((name: string) => attunedBoneWeaponFactory(name, 'Melee'))],
  Ranged: [...rangedWeapons.map((name: string) => attunedBoneWeaponFactory(name, 'Ranged'))],
  Throwing: [
    ...throwingWeapons.map((name: string) => attunedBoneWeaponFactory(name, 'Throwing', { name: 'Returning' }))
  ]
} as const
