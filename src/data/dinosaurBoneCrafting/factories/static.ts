import type { Binding } from '../../../types/core.ts'
import type { CraftingIngredient } from '../../../types/crafting.ts'
import type { TAugmentType } from '../../../types/ingredients.ts'

export const baseRequirements: Partial<CraftingIngredient>[] = [
  {
    name: 'Fossilized Raptor Claw'
  },
  {
    name: 'Fossilized Triceratops Horn'
  },
  {
    name: 'Fossilized Pteradon Vertebra'
  },
  {
    name: 'Fossilized Ankylosaur Rib'
  }
]

export const commonBinding: Binding = {
  type: 'Bound' as const,
  to: 'Account' as const,
  from: 'Acquisition' as const
}

export const createRequirements = (
  quantity: number,
  additionalItems: (typeof baseRequirements)[0][] = []
): Partial<CraftingIngredient>[] => {
  return [...baseRequirements, ...additionalItems].map((req: Partial<CraftingIngredient>) => ({
    ...req,
    quantity
  }))
}

export const createBaseItem = (name: string, augmentType: TAugmentType): Partial<CraftingIngredient> => ({
  name,
  minimumLevel: 31,
  quantity: 1,
  binding: commonBinding,
  augmentType,
  craftedIn: 'Sharpened Bone [Village of Tanaroa]'
})
