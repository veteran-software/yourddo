import type { AugmentItem } from '../../types/augmentItem.ts'

export const update50Augments: AugmentItem[] = [
  {
    name: 'Citrene of Greater Dragonmarks',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    minimumLevel: 28,
    image: 'orangeAugmentBlueBorder',
    augmentType: 'Orange',
    foundIn: ['The Final Enemy'],
    effectsAdded: [
      {
        name: 'Greater Dragonmark Charges',
        bonus: 'Enhancement',
        modifier: 1
      }
    ]
  },
  {
    name: 'Clearwater Diamond',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    minimumLevel: 1,
    image: 'colorlessAugmentBlueBorder',
    augmentType: 'Colorless',
    foundIn: ['Under the Cover of Darkness'],
    effectsAdded: [
      {
        name: 'Positive Healing',
        bonus: 'per minute',
        modifier: 1
      }
    ]
  },
  {
    name: 'Diamond of the Magi',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    minimumLevel: 1,
    image: 'colorlessAugmentBlueBorder',
    augmentType: 'Colorless',
    foundIn: ['Under the Cover of Darkness'],
    effectsAdded: [
      {
        name: 'Maximum Spell Points',
        bonus: 'Insight',
        modifier: 100
      }
    ]
  },
  {
    name: 'Emerald of Greater Rage',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    minimumLevel: 28,
    image: 'greenAugmentBlueBorder',
    augmentType: 'Green',
    foundIn: ['Swim at Your Own Risk'],
    effectsAdded: [
      {
        name: 'Rage Charges',
        bonus: 'Enhancement',
        modifier: 3
      }
    ]
  },
  {
    name: 'Emerald of Greater Smiting',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    minimumLevel: 28,
    image: 'greenAugmentBlueBorder',
    augmentType: 'Green',
    foundIn: ['Danger at Dunwater'],
    effectsAdded: [
      {
        name: 'Smite Evil Charges',
        bonus: 'Enhancement',
        modifier: 3
      }
    ]
  },
  {
    name: 'Sapphire of Good Luck +1',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    minimumLevel: 4,
    image: 'blueAugmentBlueBorder',
    augmentType: 'Blue',
    foundIn: ['The Haunting of Saltmarsh'],
    effectsAdded: [
      {
        name: 'Good Luck',
        bonus: 'Luck',
        modifier: 1
      }
    ]
  },
  {
    name: 'Sapphire of Good Luck +3',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    minimumLevel: 28,
    image: 'blueAugmentBlueBorder',
    augmentType: 'Blue',
    foundIn: ['The Haunting of Saltmarsh'],
    effectsAdded: [
      {
        name: 'Good Luck',
        bonus: 'Luck',
        modifier: 3
      }
    ]
  },
  {
    name: 'Topaz of Lesser Dragonmarks',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    minimumLevel: 4,
    image: 'yellowAugmentBlueBorder',
    augmentType: 'Yellow',
    foundIn: ['The Final Enemy'],
    effectsAdded: [
      {
        name: 'Lesser Dragonmark Charges',
        bonus: 'Enhancement',
        modifier: 1
      }
    ]
  },
  {
    name: 'Topaz of Minor Rage',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    minimumLevel: 4,
    image: 'yellowAugmentBlueBorder',
    augmentType: 'Yellow',
    foundIn: ['Swim at Your Own Risk'],
    effectsAdded: [
      {
        name: 'Rage Charges',
        bonus: 'Enhancement',
        modifier: 1
      }
    ]
  },
  {
    name: 'Topaz of Minor Smiting',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    minimumLevel: 4,
    image: 'yellowAugmentBlueBorder',
    augmentType: 'Yellow',
    foundIn: ['Danger at Dunwater'],
    effectsAdded: [
      {
        name: 'Smite Evil Charges',
        bonus: 'Enhancement',
        modifier: 1
      }
    ]
  }
]
