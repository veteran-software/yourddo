import type { AugmentItem } from '../../types/augmentItem.ts'

export const update53Augments: AugmentItem[] = [
  {
    image: '',
    augmentType: 'Yellow',
    minimumLevel: 28,
    name: 'Crystallized Drop of Tea',
    foundIn: ['Through the Tulgey Wood'],
    effectsAdded: [
      {
        name: 'Empowered Spell Cost: -4'
      },
      {
        name: 'Spell Power: Universal',
        bonus: 'On-damage : 3 sec',
        modifier: 8
      }
    ]
  },
  {
    image: '',
    augmentType: 'Blue',
    minimumLevel: 28,
    name: 'Crystallized Unicorn Tear',
    foundIn: ['One Dame Thing After Another'],
    effectsAdded: [
      {
        name: 'Temporary Hit Points: 150',
        bonus: 'On-hit : 5% Chance'
      }
    ]
  },
  {
    image: 'greenAugmentOrangeBorder',
    augmentType: 'Green',
    minimumLevel: 28,
    name: 'Emerald of Arcane Empowerment',
    foundIn: ['Hunt or Be Hunted'],
    effectsAdded: [
      {
        name: 'Imbue Dice',
        bonus: 'Enhancement',
        modifier: 1
      }
    ]
  },
  {
    name: "Essence of Pomurua's Memento",
    image: 'greenAugmentRedBorder',
    augmentType: 'Green',
    minimumLevel: 30,
    craftedIn: 'Soulforge (Hall of Heroes)',
    effectsAdded: [
      {
        name: 'Spell Critical Chance',
        bonus: 'Insight',
        modifier: '3%'
      }
    ],
    requirements: [
      {
        name: 'Thread of Fate',
        quantity: 50
      },
      {
        name: 'Empty Soul Vessel',
        quantity: 1
      },
      {
        name: "Pomura's Memento",
        quantity: 1
      }
    ]
  }
]
