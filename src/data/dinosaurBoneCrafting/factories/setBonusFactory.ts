import type { CraftingIngredient, SetBonus } from '../../../types/crafting.ts'
import { findSetBonus } from '../../setBonuses.ts'
import { commonBinding } from './static.ts'

export const createSetBonus = (setBonusData: SetBonus): CraftingIngredient => ({
  name: `Set Bonus: ${setBonusData.name}`,
  image: 'dinosaurBoneSetBonusAugment',
  minimumLevel: 31,
  quantity: 1,
  binding: commonBinding,
  augmentType: 'Isle of Dread: Set Bonus',
  setBonus: [setBonusData],
  craftedIn: 'Sharpened Bone [Village of Tanaroa]',
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

// Set bonus data
export const setBonuses: SetBonus[] = [
  findSetBonus('Dread Stalker'),
  findSetBonus('Defender Of Tanaroa'),
  findSetBonus('Echoes Of The Walking Ancestors'),
  findSetBonus('Devastation of the Firemouth'),
  findSetBonus('Deacon of the Auricular'),
  findSetBonus("The Legendary Dread Isle's Curse")
]
