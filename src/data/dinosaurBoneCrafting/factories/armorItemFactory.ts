import type { CraftingIngredient } from '../../../types/crafting.ts'
import { armorList } from '../../basics/armor.ts'

const armorItemFactory = (name: string, itemType: string): CraftingIngredient => {
  let dinosaurWhat = `Dinosaur Bone ${name}`

  switch (itemType) {
    case 'Heavy Armor':
      dinosaurWhat = 'Dinosaur Plate Armor'
      break
    case 'Medium Armor':
      dinosaurWhat = 'Dinosaur Scale Plate'
      break
  }

  return {
    name: dinosaurWhat,
    description: 'This armor is expertly crafted of impossibly strong Dinosaur Bone.',
    type: itemType,
    quantity: 1,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: '+15 Enhancement Bonus',
        modifier: 15,
        bonus: 'Enhancement'
      }
    ],
    augments: [
      {
        isleOfDreadScaleArmor: null,
        isleOfDreadFangArmor: null,
        isleOfDreadClawAccessory: null,
        isleOfDreadHornAccessory: null,
        isleOfDreadSetBonus: null,
        green: null,
        blue: null
      }
    ],
    foundIn: ['Skeletons in the Closet', 'Dread Rune Barter']
  }
}

const armorNamesToTypes = ['Docent', 'Plate', 'Mail', 'Armor', 'Outfit', 'Robe'] as const

export const dinosaurBoneArmorItems: Record<string, CraftingIngredient[]> = {
  Armor: [...armorList.map((name: string, idx: number) => armorItemFactory(armorNamesToTypes[idx], name))]
}
