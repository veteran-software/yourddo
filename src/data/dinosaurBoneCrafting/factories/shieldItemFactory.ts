import type { CraftingIngredient } from '../../../types/crafting.ts'
import { shieldList } from '../../basics/armor.ts'
import { findSetBonus } from '../../setBonuses.ts'

const shieldItemFactory = (name: string, itemType: string): CraftingIngredient => ({
  name: `Dinosaur Bone ${name}`,
  description: 'This shield is expertly crafted of impossibly strong Dinosaur Bone.',
  type: itemType,
  quantity: 1,
  binding: {
    type: 'Bound',
    to: 'Account',
    from: 'Acquisition'
  },
  effectsAdded: [
    name === 'Orb'
      ? {
          name: '+15 Orb Bonus',
          modifier: 15,
          bonus: 'Enhancement'
        }
      : {
          name: '+15 Enhancement Bonus',
          modifier: 15,
          bonus: 'Enhancement'
        }
  ],
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
})

export const dinosaurBoneShieldItems: Record<string, CraftingIngredient[]> = {
  Shields: [...shieldList.map((name: string) => shieldItemFactory(name, name))]
}
