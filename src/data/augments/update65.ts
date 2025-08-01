import type { AugmentItem } from '../../types/augmentItem'

export const update65Augments: AugmentItem[] = [
  {
    name: 'Set Augment: Bold Tactician',
    minimumLevel: 30,
    augmentType: 'Colorless',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: '',
    craftedIn: 'Cauldron of Cadence',
    setBonus: [
      {
        name: 'Bold Tactician',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Tactical DCs',
            bonus: 'Artifact',
            modifier: 3
          }
        ]
      }
    ]
  },
  {
    name: 'Set Augment: Imbued Infusion',
    minimumLevel: 30,
    augmentType: 'Colorless',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: '',
    craftedIn: 'Cauldron of Cadence',
    setBonus: [
      {
        name: 'Imbued Infusion',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Imbue Dice',
            bonus: 'Artifact',
            modifier: 3
          }
        ]
      }
    ]
  },
  {
    name: 'Set Augment: Legendary Bulwark',
    minimumLevel: 30,
    augmentType: 'Colorless',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: '',
    craftedIn: 'Cauldron of Cadence',
    setBonus: [
      {
        name: 'Legendary Bulwark',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Maximum Hit Points',
            bonus: 'Legendary',
            modifier: '10%'
          }
        ]
      }
    ]
  },
  {
    name: 'Set Augment: Subtle Blade',
    minimumLevel: 30,
    augmentType: 'Colorless',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: '',
    craftedIn: 'Cauldron of Cadence',
    setBonus: [
      {
        name: 'Subtle Blade',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Assassinate DCs',
            bonus: 'Artifact',
            modifier: 3
          }
        ]
      }
    ]
  }
]
