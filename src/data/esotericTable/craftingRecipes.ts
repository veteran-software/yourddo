import type { CraftingIngredient } from '../../types/crafting.ts'

const craftingRecipes: CraftingIngredient[] = [
  {
    name: 'Warp the Unholy',
    description:
      'This strange rite looks as if it could warp something particularly vile into something stronger and open it up to further potential.',
    effectsAdded: [
      {
        name: 'Leashed Power',
        description: 'This weapon now contains a deep and hidden power... Just waiting to be unleashed.'
      },
      {
        name: 'Warp Souls',
        description:
          "Your attacks and offensive spells apply a single stack of Soul Scar, which reduces your target's Will Saves, Armor Class, and Fortification by 1 per stack, max 10."
      }
    ],
    effectsRemoved: [
      {
        name: 'Taint of Evil',
        description:
          'Good aligned characters equipping this item suffer a temporary negative level until the item is removed.'
      }
    ],
    requirements: [
      {
        name: 'Taint of Evil Weapon',
        quantity: 1,
        craftedIn: 'Unholy Defiler of the Hidden Hand'
      },
      {
        name: 'Burning Planar Scrap',
        quantity: 20,
        foundIn: ['Fire Over Morgrave', 'Devil Assault (Epic)']
      },
      {
        name: 'Legendary Esoteric Relic',
        quantity: 20,
        foundIn: ['Vecna Unleashed Quests']
      }
    ]
  },
  {
    name: 'Warp the Seared',
    description:
      'This strange rite looks as if it could warp a demonic weapon into something stronger and open it up to further potential.',
    effectsAdded: [
      {
        name: 'Leashed Power',
        description: 'This weapon now contains a deep and hidden power... Just waiting to be unleashed.'
      },
      {
        name: 'Warp Souls',
        description:
          "Your attacks and offensive spells apply a single stack of Soul Scar, which reduces your target's Will Saves, Armor Class, and Fortification by 1 per stack, max 10."
      }
    ],
    effectsRemoved: [
      {
        name: 'Planar Searing',
        description:
          "This weapon harbors a burn unlike anything you've ever seen - As if otherworldly power has started to change it forever."
      }
    ],
    requirements: [
      {
        name: 'Planar Searing Weapon',
        quantity: 1,
        foundIn: ['Fire Over Morgrave']
      },
      {
        name: 'Burning Planar Scrap',
        quantity: 20,
        foundIn: ['Fire Over Morgrave', 'Devil Assault (Epic)']
      },
      {
        name: 'Legendary Esoteric Relic',
        quantity: 20,
        foundIn: ['Vecna Unleashed Quests']
      }
    ]
  }
]
