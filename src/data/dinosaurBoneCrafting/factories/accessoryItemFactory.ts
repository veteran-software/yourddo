import type { CraftingIngredient } from '../../../types/crafting.ts'
import { clothingList, jewelryList } from '../../basics/armor.ts'
import { findSetBonus } from '../../setBonuses.ts'

const clothingItemFactory = (name: string, itemType: string): CraftingIngredient => ({
  name: `Dinosaur Bone ${name}`,
  description: 'Fashioned of intricately carved bones of long-forgotten Dinosaurs.',
  type: itemType,
  quantity: 1,
  binding: {
    type: 'Bound',
    to: 'Account',
    from: 'Acquisition'
  },
  augments: [
    {
      isleOfDreadScaleAccessory: null,
      isleOfDreadFangAccessory: null,
      isleOfDreadClawAccessory: null,
      isleOfDreadHornAccessory: null,
      isleOfDreadSetBonus: null,
      green: null,
      yellow: null
    }
  ],
  foundIn: ['Skeletons in the Closet', 'Dread Rune Barter']
})

const jewelryItemFactory = (name: string, itemType: string): CraftingIngredient => {
  return {
    ...clothingItemFactory(name, itemType),
    augments: [
      {
        isleOfDreadScaleAccessory: null,
        isleOfDreadFangAccessory: null,
        isleOfDreadClawAccessory: null,
        isleOfDreadHornAccessory: null,
        blue: null,
        green: null,
        yellow: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")],
    foundIn: ['Isle of Dread Legendary Quests', 'Legendary Isle of Dread Saga', 'The Isle of Dread (rare encounters)']
  }
}

export const dinosaurBoneAccessoryItems: Record<string, (CraftingIngredient | undefined)[]> = {
  Clothing: [...clothingList.map((name: string, idx: number) => clothingItemFactory(name, clothingList[idx]))],
  Jewelry: [
    ...jewelryList
      .map((name: string, idx: number) => {
        if (name === 'Goggles' || name === 'Trinket') return

        return jewelryItemFactory(name, jewelryList[idx])
      })
      .filter((item): item is CraftingIngredient => item !== undefined)
  ]
} as const
