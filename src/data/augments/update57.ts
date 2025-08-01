import type { AugmentItem } from '../../types/augmentItem.ts'

export const update57Augments: AugmentItem[] = [
  {
    image: '',
    augmentType: 'Red',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'The Eye of Daanvi',
    foundIn: ['Order in the Court!'],
    effectsAdded: [
      {
        name: 'Weapon Alignment: Lawful'
      },
      {
        name: 'Law Damage vs non-Lawful Enemies',
        bonus: 'On-hit',
        modifier: '10d6'
      }
    ]
  },
  {
    image: '',
    augmentType: 'Red',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'The Eye of Dolurrh',
    foundIn: ['The Hand and the Eyes'],
    effectsAdded: [
      {
        name: 'Weapon: Ghost Touch'
      },
      {
        name: 'Law Damage',
        bonus: 'On-hit',
        modifier: '10d6'
      }
    ]
  },
  {
    image: '',
    augmentType: 'Red',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'The Eye of Lamannia',
    foundIn: ['Growing Pains'],
    effectsAdded: [
      {
        name: 'Weapon: Implement'
      },
      {
        name: 'Positive Spell Power',
        bonus: 'Equipment',
        modifier: 146
      },
      {
        name: 'Force Spell Power',
        bonus: 'Equipment',
        modifier: 146
      }
    ]
  },
  {
    image: '',
    augmentType: 'Red',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'The Eye of Mabar',
    foundIn: ['Army of Eternal Night'],
    effectsAdded: [
      {
        name: 'Weapon: Evil Alignment'
      },
      {
        name: 'Vampirism',
        bonus: 'On-hit',
        modifier: '5d2'
      }
    ]
  },
  {
    image: '',
    augmentType: 'Red',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'The Eye of Shavarath',
    foundIn: ['Three Paths to Battle'],
    effectsAdded: [
      {
        name: 'Immunity: Fear'
      },
      {
        name: 'On Critical Hit: Enemy Shaken'
      }
    ]
  }
]
