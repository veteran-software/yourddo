import type { CraftingIngredient } from '../../types/crafting'

export const update72DenOfVipersItems: CraftingIngredient[] = [
  {
    name: 'Acera, the Dissolution of All',
    type: 'Weapon',
    subType: 'Great Sword',
    minimumLevel: 33,
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Attack',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Damage Roll',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Lingering Acidic Burn',
        description: 'Your attacks and offensive spells have a high chance to deal very strong Acid damage over time.'
      },
      {
        name: 'Legendary Acid Torrent'
      },
      {
        name: 'Acid Blast 7'
      },
      {
        name: 'Sealed in Mist',
        description:
          'This weapon has its true power obscured by mist. It can have its power unsealed at the Augmentation Altar, adding one effect. Attempting to add another will remove the original.'
      }
    ],
    augments: [
      {
        orange: null,
        purple: null
      }
    ],
    foundIn: ['Den of Vipers']
  },
  {
    name: 'Acrida, the Caustic Arbalest',
    type: 'Weapon',
    subType: 'Great Crossbow',
    minimumLevel: 33,
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Attack',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Damage Roll',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Meltscale',
        description: 'Adds Crystal and Byeshk material type. On hit: 15d6 Acid Damage.'
      },
      {
        name: 'Lingering Acidic Burn',
        description: 'Your attacks and offensive spells have a high chance to deal very strong Acid damage over time.'
      },
      {
        name: 'Soverign Vorpal'
      },
      {
        name: 'Sealed in Mist',
        description:
          'This weapon has its true power obscured by mist. It can have its power unsealed at the Augmentation Altar, adding one effect. Attempting to add another will remove the original.'
      }
    ],
    augments: [
      {
        orange: null,
        purple: null
      }
    ],
    foundIn: ['Den of Vipers']
  },
  {
    name: 'Amplin, the Channeling Bolt',
    type: 'Weapon',
    subType: 'Quarterstaff',
    minimumLevel: 33,
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Universal Spell Power',
        bonus: 'Implement',
        modifier: 33
      },
      {
        name: 'Attack',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Damage Roll',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Lighting Lash',
        description:
          'Your attacks and offensive spells have a high change to deal very strong Electric damage over time.'
      },
      {
        name: 'Electric Lore',
        bonus: 'Equipment',
        modifier: '24%'
      },
      {
        name: 'Spell DCs (all)',
        bonus: 'Quality',
        modifier: 2
      },
      {
        name: 'Sealed in Mist',
        description:
          'This weapon has its true power obscured by mist. It can have its power unsealed at the Augmentation Altar, adding one effect. Attempting to add another will remove the original.'
      },
      {
        name: 'Spell DCs (all)',
        bonus: 'Exceptional',
        modifier: 2
      }
    ],
    augments: [
      {
        orange: null,
        purple: null
      }
    ],
    foundIn: ['Den of Vipers']
  },
  {
    name: 'Arctica, the Mystic Cold',
    type: 'Weapon',
    subType: 'Great Axe',
    minimumLevel: 33,
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Universal Spell Power',
        bonus: 'Implement',
        modifier: 33
      },
      {
        name: 'Attack',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Damage Roll',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Bitter Frostbite',
        description:
          'This item sends an icy chill through your opponents. Your attacks and offensive spells have a high change to deal very strong Cold damage over time.'
      },
      {
        name: 'Cold Lore',
        bonus: 'Equipment',
        modifier: '24%'
      },
      {
        name: 'Spell DCs (all)',
        bonus: 'Quality',
        modifier: 2
      },
      {
        name: 'Sealed in Mist',
        description:
          'This weapon has its true power obscured by mist. It can have its power unsealed at the Augmentation Altar, adding one effect. Attempting to add another will remove the original.'
      },
      {
        name: 'Spell DCs (all)',
        bonus: 'Exceptional',
        modifier: 2
      }
    ],
    augments: [
      {
        orange: null,
        purple: null
      }
    ],
    foundIn: ['Den of Vipers']
  },
  {
    name: 'Audion, the Shattering Way',
    type: 'Weapon',
    subType: 'Warhammer',
    minimumLevel: 33,
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Attack',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Damage Roll',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Blunt Trauma',
        description: 'When rolling a 19 or 20 on a melee attack, your critical multiplier is increased by +1.'
      },
      {
        name: 'Felling the Oak',
        description:
          'On a natural 20 that is confirmed as a critical hit, this weapon will trip your opponent, forcing them to fall prone. There is no save against this effect.'
      },
      {
        name: 'Sealed in Mist',
        description:
          'This weapon has its true power obscured by mist. It can have its power unsealed at the Augmentation Altar, adding one effect. Attempting to add another will remove the original.'
      }
    ],
    augments: [
      {
        orange: null,
        purple: null
      }
    ],
    foundIn: ['Den of Vipers']
  },
  {
    name: 'Caustica, the Volley of Pain',
    type: 'Weapon',
    subType: 'Great Crossbow',
    minimumLevel: 33,
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Attack',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Damage Roll',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Lingering Acidic Burn',
        description: 'Your attacks and offensive spells have a high chance to deal very strong Acid damage over time.'
      },
      {
        name: 'Acid Lore',
        bonus: 'Equipment',
        modifier: '24%'
      },
      {
        name: 'Spell DCs (all)',
        bonus: 'Quality',
        modifier: 2
      },
      {
        name: 'Sealed in Mist',
        description:
          'This weapon has its true power obscured by mist. It can have its power unsealed at the Augmentation Altar, adding one effect. Attempting to add another will remove the original.'
      },
      {
        name: 'Spell DCs (all)',
        bonus: 'Exceptional',
        modifier: 2
      }
    ],
    augments: [
      {
        orange: null,
        purple: null
      }
    ],
    foundIn: ['Den of Vipers']
  },
  {
    name: 'Clank, the Echo of Despair',
    type: 'Weapon',
    subType: 'Battle Axe',
    minimumLevel: 33,
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Universal Spell Power',
        bonus: 'Implement',
        modifier: 33
      },
      {
        name: 'Attack',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Damage Roll',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Rupturing Echo',
        description: 'Your attacks and offensive spells have a high change to deal very strong Sonic damage over time.'
      },
      {
        name: 'Sonic Lore',
        bonus: 'Equipment',
        modifier: '24%'
      },
      {
        name: 'Spell DCs (all)',
        bonus: 'Quality',
        modifier: 2
      },
      {
        name: 'Sealed in Mist',
        description:
          'This weapon has its true power obscured by mist. It can have its power unsealed at the Augmentation Altar, adding one effect. Attempting to add another will remove the original.'
      }
    ],
    augments: [
      {
        orange: null,
        purple: null
      }
    ],
    foundIn: ['Den of Vipers']
  },
  {
    name: 'Clatter, the Blunted Edge',
    type: 'Weapon',
    subType: 'Battle Axe',
    minimumLevel: 33,
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Attack',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Damage Roll',
        bonus: 'Enhancement',
        modifier: 15
      },
      {
        name: 'Rupturing Echo',
        description: 'Your attacks and offensive spells have a high change to deal very strong Sonic damage over time.'
      },
      {
        name: 'Blunt Trauma',
        description: 'When rolling a 19 or 20 on a melee attack, your critical multiplier is increased by +1.'
      },
      {
        name: 'Guardbreaking',
        description:
          "This item enables you to break an enemy's guard in between your melee attacks. On critical hits with your melee weapons, enemies will become dazed as a result."
      },
      {
        name: 'Sealed in Mist',
        description:
          'This weapon has its true power obscured by mist. It can have its power unsealed at the Augmentation Altar, adding one effect. Attempting to add another will remove the original.'
      }
    ],
    augments: [
      {
        orange: null,
        purple: null
      }
    ],
    foundIn: ['Den of Vipers']
  }
]
