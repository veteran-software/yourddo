import type { Trinket } from '../types/item.ts'

export const trinkets: Trinket[] = [
  {
    name: 'Shard of Great Power',
    equipsTo: 'Trinket',
    minimumLevel: 13,
    binding: {
      type: 'Bound',
      location: 'Character',
      when: 'Acquisition'
    },
    description:
      'This dense shard of crystal radiates power. Crystals like this can absorb and combine the power from various sources like foci and essences. Once imbued, this shard may be able to be combined with a weapon or accessory, thereby transferring the power into that item.',
    durability: 80,
    material: 'Gem',
    hardness: 27,
    baseValue: {
      gold: 52000
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Tower of Despair']
  }
]
