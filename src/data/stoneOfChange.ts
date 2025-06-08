import type { CraftingIngredient } from '../types/crafting.ts'

export const stoneOfChange: CraftingIngredient[] = [
  {
    name: 'Average Khyber Dragonshard',
    description:
      'A translucent smoky crystal with colored veins of midnight blue and oily black, pulsing with the power of The Dragon Below. This is a material component for the Trap the Soul spell.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 1000
    },
    weight: 0.04,
    craftedIn: 'Stone of Change',
    quantity: 4,
    requirements: [
      {
        name: 'Small Khyber Dragonshard',
        quantity: 10
      }
    ]
  },
  {
    name: 'Small Khyber Dragonshard',
    description:
      'A translucent smoky crystal with colored veins of midnight blue and oily black, pulsing with the power of The Dragon Below. This is a material component for the Trap the Soul spell.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 500
    },
    weight: 0.02,
    craftedIn: 'Stone of Change',
    quantity: 20,
    requirements: [
      {
        name: 'Tiny Khyber Dragonshard',
        quantity: 100
      }
    ]
  }
]
