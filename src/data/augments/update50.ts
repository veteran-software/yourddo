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
  //
  {
    name: 'Sapphire of Stunning +2',
    augmentType: 'Blue',
    minimumLevel: 1,
    image: 'blueAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Stunning DC',
        bonus: 'Enhancement',
        modifier: 2
      }
    ]
  },
  {
    name: 'Sapphire of Vertigo +2',
    augmentType: 'Blue',
    minimumLevel: 1,
    image: 'blueAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Trip DC',
        bonus: 'Enhancement',
        modifier: 2
      }
    ]
  },
  {
    name: 'Sapphire of Shatter +2',
    augmentType: 'Blue',
    minimumLevel: 1,
    image: 'blueAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Sunder DC',
        bonus: 'Enhancement',
        modifier: 2
      }
    ]
  },
  {
    name: 'Sapphire of Accuracy +2',
    augmentType: 'Blue',
    minimumLevel: 1,
    image: 'blueAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Attack',
        bonus: 'Competence',
        modifier: 2
      }
    ]
  },
  {
    name: 'Sapphire of Dodge 1%',
    augmentType: 'Blue',
    minimumLevel: 1,
    image: 'blueAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Dodge',
        bonus: 'Enhancement',
        modifier: '1%'
      }
    ]
  },
  {
    name: 'Sapphire of Healing Amplification +3',
    augmentType: 'Blue',
    minimumLevel: 1,
    image: 'blueAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Healing Amplification',
        bonus: 'Competence',
        modifier: 3
      }
    ]
  },
  {
    name: 'Sapphire of Negative Amplification +3',
    augmentType: 'Blue',
    minimumLevel: 1,
    image: 'blueAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Negative Amplification',
        bonus: 'Profane',
        modifier: 3
      }
    ]
  },
  {
    name: 'Sapphire of Repair Amplification +3',
    augmentType: 'Blue',
    minimumLevel: 1,
    image: 'blueAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Repair Amplification',
        bonus: 'Enhancement',
        modifier: 3
      }
    ]
  },
  {
    name: 'Topaz of Damage +1',
    augmentType: 'Yellow',
    minimumLevel: 1,
    image: 'yellowAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Damage',
        bonus: 'Competence',
        modifier: 1
      }
    ]
  },
  {
    name: 'Topaz of Spell Penetration +1',
    augmentType: 'Yellow',
    minimumLevel: 1,
    image: 'yellowAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Spell Penetration',
        bonus: 'Equipment',
        modifier: 1
      }
    ]
  },
  //
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
  },
  //
  {
    name: 'Topaz of Fire Resistance 40',
    augmentType: 'Yellow',
    minimumLevel: 28,
    image: 'yellowAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Fire Resistance',
        modifier: 40
      }
    ]
  },
  {
    name: 'Topaz of Sonic Resistance 40',
    augmentType: 'Yellow',
    minimumLevel: 28,
    image: 'yellowAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Sonic Resistance',
        modifier: 40
      }
    ]
  },
  {
    name: 'Topaz of Ranged Power +10',
    augmentType: 'Yellow',
    minimumLevel: 28,
    image: 'yellowAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Ranged Power',
        bonus: 'Enhancement',
        modifier: 10
      }
    ]
  },
  {
    name: 'Sapphire of Natural Armor +12',
    augmentType: 'Blue',
    minimumLevel: 28,
    foundIn: [],
    image: 'blueAugmentGreenBorder',
    effectsAdded: [
      {
        name: 'Armor Class',
        bonus: 'Natural Armor',
        modifier: 12
      }
    ]
  },
  {
    name: 'Sapphire of False Life +48',
    augmentType: 'Blue',
    minimumLevel: 28,
    foundIn: [],
    image: 'blueAugmentGreenBorder',
    effectsAdded: [
      {
        name: 'Maximum Hit Points',
        bonus: 'Enhancement',
        modifier: 48
      }
    ]
  },
  {
    name: 'Sapphire of Negative Amplification +50',
    augmentType: 'Blue',
    minimumLevel: 28,
    foundIn: [],
    image: 'blueAugmentGreenBorder',
    effectsAdded: [
      {
        name: 'Negative Amplification',
        bonus: 'Profane',
        modifier: 50
      }
    ]
  },
  {
    name: 'Ruby of Acid (8d6)',
    augmentType: 'Red',
    minimumLevel: 28,
    image: 'redAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Acid Damage',
        bonus: 'On-hit',
        modifier: '8d6'
      }
    ]
  },
  {
    name: 'Ruby of Corrosion 139',
    augmentType: 'Red',
    minimumLevel: 28,
    image: 'redAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Spell Power: Acid',
        bonus: 'Equipment',
        modifier: 139
      }
    ]
  },
  {
    name: 'Ruby of Radiance 139',
    augmentType: 'Red',
    minimumLevel: 28,
    image: 'redAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Spell Power: Light & Alignment',
        bonus: 'Equipment',
        modifier: 139
      }
    ]
  }
]
