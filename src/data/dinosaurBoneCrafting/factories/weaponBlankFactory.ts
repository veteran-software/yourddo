import type { Enhancement } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import { meleeWeapons, rangedWeapons, throwingWeapons } from '../../basics/weapons.ts'

export const baseDinosaurBoneWeapon = (
  name: string,
  itemType: string,
  extraEffects?: Enhancement
): CraftingIngredient => ({
  name: `Dinosaur Bone ${name}`,
  description: 'Fashioned of intricately carved bones of long-forgotten Dinosaurs.',
  type: itemType,
  quantity: 1,
  binding: {
    type: 'Bound',
    to: 'Account',
    from: 'Acquisition'
  },
  craftedIn: 'Sharpened Bone [Village of Tanaroa]',
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
  requirements: [
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

export const craftedDinosaurBoneWeapons: Record<string, CraftingIngredient[]> = {
  Melee: [...meleeWeapons.map((name: string) => baseDinosaurBoneWeapon(name, 'Melee'))],
  Ranged: [...rangedWeapons.map((name: string) => baseDinosaurBoneWeapon(name, 'Ranged'))],
  Throwing: [...throwingWeapons.map((name: string) => baseDinosaurBoneWeapon(name, 'Throwing', { name: 'Returning' }))]
} as const
