import type { AugmentItem } from '../../types/augmentItem.ts'

export const update63Augments: AugmentItem[] = [
  {
    image: '',
    augmentType: 'Purple',
    minimumLevel: 32,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Facet of Coalesced Impacts',
    effectsAdded: [
      {
        name: 'Unarmed Damage',
        modifier: 1
      }
    ]
  },
  {
    name: 'Facet of Condensed Power',
    image: 'greenAugmentBlueBorder',
    augmentType: 'Green',
    minimumLevel: 32,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Spell Point Cost Reduction',
        bonus: 'Enhancement',
        modifier: '-10%'
      }
    ]
  },
  {
    image: '',
    augmentType: 'Orange',
    minimumLevel: 32,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Facet of Psionic Intrusion',
    effectsAdded: [
      {
        name: 'Weapon: Implement'
      },
      {
        name: 'Spell Power: Force',
        bonus: 'Equipment',
        modifier: 153
      },
      {
        name: 'Spell Power: Bludgeoning',
        bonus: 'Equipment',
        modifier: 153
      },
      {
        name: 'Spell Power: Piercing',
        bonus: 'Equipment',
        modifier: 153
      },
      {
        name: 'Spell Power: Slashing',
        bonus: 'Equipment',
        modifier: 153
      },
      {
        name: 'Spell Power: Untyped',
        bonus: 'Equipment',
        modifier: 153
      },
      {
        name: 'Immunity to Mind Altering Enchantments',
        notes: 'Essentially Protection from Evil spell'
      }
    ]
  },
  {
    image: '',
    augmentType: 'Colorless',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Globe of Cursed Blood',
    effectsAdded: [
      {
        name: 'Ability Scores (all)',
        bonus: 'Enhancement',
        modifier: 8
      }
    ]
  }
]
