import type { CraftingIngredient } from '../../types/crafting.ts'

export const update75items: CraftingIngredient[] = [
  {
    name: "Agony's Eyes",
    type: 'Jewelry',
    subType: 'Eyes',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Soundproof'
      },
      {
        name: 'Skill: Listen',
        bonus: 'Competence',
        modifier: 10
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        yellow: null,
        sun: null
      }
    ],
    foundIn: ['Cold Snap (Heroic)']
  },
  {
    name: 'Arcane Contraption',
    type: 'Shield',
    subType: 'Orb',
    minimumLevel: 13,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Spell Power: Universal',
        bonus: 'Implement',
        modifier: 8
      },
      {
        name: '+4 Orb Bonus',
        bonus: 'Orb',
        modifier: 4
      },
      {
        name: 'Acid Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Bludgeoning Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Chaotic Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Cold Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Electric Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Evil Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Fire Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Force Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Good Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Lawful Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Light Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Negative Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Piercing Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Poison Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Positive Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Repair Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Rust Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Slashing Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Sonic Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Untyped Spell Power',
        bonus: 'Insight',
        modifier: 20
      },
      {
        name: 'Will Save',
        bonus: 'Resistance',
        modifier: 7
      }
    ],
    augments: [
      {
        lamordiaMelancholicWeapon: null,
        lamordiaDolorousWeapon: null,
        purple: null
      }
    ],
    foundIn: ['Special Delivery (Heroic)']
  },
  {
    name: "Baron Aubrecker's Family Amulet",
    type: 'Jewelry',
    subType: 'Neck',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Pact Dice',
        bonus: 'Enhancement',
        modifier: 1
      },
      {
        name: 'Spell DC: Abjuration',
        bonus: 'Equipment',
        modifier: 2
      },
      {
        name: 'Spell DC: Conjuration',
        bonus: 'Equipment',
        modifier: 2
      },
      {
        name: 'Spell DC: Enchantment',
        bonus: 'Equipment',
        modifier: 2
      },
      {
        name: 'Spell DC: Evocation',
        bonus: 'Equipment',
        modifier: 2
      },
      {
        name: 'Spell DC: Illusion',
        bonus: 'Equipment',
        modifier: 2
      },
      {
        name: 'Spell DC: Necromancy',
        bonus: 'Equipment',
        modifier: 2
      },
      {
        name: 'Spell DC: Transmutation',
        bonus: 'Equipment',
        modifier: 2
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        moon: null
      }
    ],
    foundIn: ['Ends and Means (Heroic)']
  },
  {
    name: "Baron Aubrecker's Monogrammed Belt",
    type: 'Clothing',
    subType: 'Waist',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Spell DC: Enchantment',
        bonus: 'Equipment',
        modifier: 2
      },
      {
        name: 'Saves vs Spells',
        bonus: 'Resistance',
        modifier: 4
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        moon: null
      }
    ],
    foundIn: ['The Proper Authorities (Heroic)']
  },
  {
    name: 'Beads of Winter',
    type: 'Jewelry',
    subType: 'Neck',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Spell DC: Evocation',
        bonus: 'Equipment',
        modifier: 2
      },
      {
        name: 'Skill: Spellcraft',
        bonus: 'Insight',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        moon: null
      }
    ],
    foundIn: ['A Light in the Attic (Heroic)']
  },
  {
    name: 'Black Dynamo',
    type: 'Jewelry',
    subType: 'Neck',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Constitution',
        bonus: 'Insight',
        modifier: 2
      },
      {
        name: 'Fortification Bypass Chance',
        bonus: 'Insight',
        modifier: '3%'
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        moon: null
      }
    ],
    foundIn: ['Zoo Creeper (Heroic)']
  },
  {
    name: "Bodysnatcher's Bracers",
    type: 'Jewelry',
    subType: 'Wrists',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Attack Rolls',
        bonus: 'Legendary',
        modifier: 1
      },
      {
        name: 'Unconscious Range',
        bonus: 'Enhancement',
        modifier: 65
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        moon: null
      }
    ],
    foundIn: ['Beneath the City Streets (Heroic)']
  },
  {
    name: 'Claws of the Coldlight Walker',
    type: 'Clothing',
    subType: 'Hands',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Improved Deception +10'
      },
      {
        name: 'Assassin Special Ability DC',
        bonus: 'Quality',
        modifier: 1
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        yellow: null,
        moon: null
      }
    ],
    foundIn: ['A Light in the Attic (Heroic)']
  },
  {
    name: "Climber's Remembrance",
    type: 'Jewelry',
    subType: 'Neck',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Spell DC: Abjuration',
        bonus: 'Insight',
        modifier: 1
      },
      {
        name: 'Spell DC: Conjuration',
        bonus: 'Insight',
        modifier: 1
      },
      {
        name: 'Spell DC: Enchantment',
        bonus: 'Insight',
        modifier: 1
      },
      {
        name: 'Spell DC: Evocation',
        bonus: 'Insight',
        modifier: 1
      },
      {
        name: 'Spell DC: Illusion',
        bonus: 'Insight',
        modifier: 1
      },
      {
        name: 'Spell DC: Necromancy',
        bonus: 'Insight',
        modifier: 1
      },
      {
        name: 'Spell DC: Transmutation',
        bonus: 'Insight',
        modifier: 1
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        lamordiaMiserableAccessory: null,
        blue: null,
        moon: null
      }
    ],
    foundIn: ['The Wish (Heroic)']
  },
  {
    name: 'Coldlight Runners',
    type: 'Clothing',
    subType: 'Feet',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Ranged Attack',
        bonus: 'Competence',
        modifier: 2
      },
      {
        name: 'Ranged Damage',
        bonus: 'Competence',
        modifier: 1
      },
      {
        name: 'Doubleshot Chance',
        bonus: 'Insight',
        modifier: '2%'
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        moon: null
      }
    ],
    foundIn: ['A Light in the Attic (Heroic)']
  },
  {
    name: 'Contraption Keyring',
    type: 'Jewelry',
    subType: 'Ring',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Movement Speed',
        bonus: 'Enhancement',
        modifier: '18%'
      },
      {
        name: 'Attack Speed',
        bonus: 'Enhancement',
        modifier: '6%'
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        lamordiaMiserableAccessory: null,
        blue: null
      }
    ],
    foundIn: ['Locked Away (Part One) (Heroic)']
  },
  {
    name: "Dreadmonger Gang's Signet",
    type: 'Jewelry',
    subType: 'Ring',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Action Boost',
        modifier: 1
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        lamordiaMiserableAccessory: null,
        blue: null
      }
    ],
    foundIn: ['Beneath the City Streets (Heroic)']
  },
  {
    name: "Death's Anchor",
    type: 'Shield',
    subType: 'Orb',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Spell Power: Universal',
        bonus: 'Implement',
        modifier: 8
      },
      {
        name: '+4 Orb Bonus',
        bonus: 'Orb',
        modifier: 4
      },
      {
        name: 'Negative Spell Power',
        bonus: 'Quality',
        modifier: 17
      },
      {
        name: 'Poison Spell Power',
        bonus: 'Quality',
        modifier: 17
      },
      {
        name: 'Spell DC: Necromancy',
        bonus: 'Equipment',
        modifier: 2
      }
    ],
    augments: [
      {
        lamordiaMelancholicWeapon: null,
        lamordiaDolorousWeapon: null,
        purple: null
      }
    ],
    foundIn: ['Special Delivery (Heroic)']
  },
  {
    name: 'Downcast Armor',
    type: 'Armor',
    subType: 'Heavy Armor',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Armor Class',
        bonus: 'Enhancement',
        modifier: 4
      },
      {
        name: 'Acid Resistance',
        bonus: 'Competence',
        modifier: 5
      },
      {
        name: 'Cold Resistance',
        bonus: 'Competence',
        modifier: 5
      },
      {
        name: 'Fire Resistance',
        bonus: 'Competence',
        modifier: 5
      },
      {
        name: 'Electric Resistance',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicArmor: null,
        lamordiaDolorousArmor: null,
        lamordiaMiserableAccessory: null,
        lamordiaWoefulAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['The Proper Authorities (Heroic)']
  },
  {
    name: 'Downcast Bowler',
    type: 'Clothing',
    subType: 'Head',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Cold Absorption',
        bonus: 'Insight',
        modifier: '4%'
      },
      {
        name: 'Physical Resistance',
        bonus: 'Insight',
        modifier: 3
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Ends and Means (Heroic)']
  },
  {
    name: 'Downcast Cap',
    type: 'Clothing',
    subType: 'Head',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Acid Absorption',
        bonus: 'Insight',
        modifier: '4%'
      },
      {
        name: 'Physical Resistance',
        bonus: 'Insight',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['A Miner Sacrifice (Heroic)']
  },
  {
    name: 'Downcast Cowl',
    type: 'Clothing',
    subType: 'Head',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Sonic Absorption',
        bonus: 'Insight',
        modifier: '4%'
      },
      {
        name: 'Physical Resistance',
        bonus: 'Insight',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Snowfall and Sunlight (Heroic)']
  },
  {
    name: 'Downcast Docent',
    type: 'Armor',
    subType: 'Docent',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Armor Class',
        bonus: 'Enhancement',
        modifier: 4
      },
      {
        name: 'Acid Resistance',
        bonus: 'Competence',
        modifier: 5
      },
      {
        name: 'Cold Resistance',
        bonus: 'Competence',
        modifier: 5
      },
      {
        name: 'Fire Resistance',
        bonus: 'Competence',
        modifier: 5
      },
      {
        name: 'Electric Resistance',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicArmor: null,
        lamordiaDolorousArmor: null,
        lamordiaMiserableAccessory: null,
        lamordiaWoefulAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Ends and Means (Heroic)']
  },
  {
    name: 'Downcast Elegant Cloak',
    type: 'Clothing',
    subType: 'Back',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Acid Absorption',
        bonus: 'Quality',
        modifier: '2%'
      },
      {
        name: 'Magical Resistance',
        bonus: 'Insight',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['The Body Snatchers (Heroic)']
  },
  {
    name: 'Downcast Gambeson',
    type: 'Armor',
    subType: 'Medium Armor',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Armor Class',
        bonus: 'Enhancement',
        modifier: 4
      },
      {
        name: 'Acid Resistance',
        bonus: 'Competence',
        modifier: 5
      },
      {
        name: 'Cold Resistance',
        bonus: 'Competence',
        modifier: 5
      },
      {
        name: 'Fire Resistance',
        bonus: 'Competence',
        modifier: 5
      },
      {
        name: 'Electric Resistance',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicArmor: null,
        lamordiaDolorousArmor: null,
        lamordiaMiserableAccessory: null,
        lamordiaWoefulAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Special Delivery (Heroic)']
  },
  {
    name: 'Downcast Heavy Cloak',
    type: 'Clothing',
    subType: 'Back',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Fire Absorption',
        bonus: 'Quality',
        modifier: '2%'
      },
      {
        name: 'Magical Resistance',
        bonus: 'Insight',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Special Delivery (Heroic)']
  },
  {
    name: 'Downcast Helm',
    type: 'Clothing',
    subType: 'Head',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Fire Absorption',
        bonus: 'Insight',
        modifier: '4%'
      },
      {
        name: 'Physical Resistance',
        bonus: 'Insight',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Cold Snap (Heroic)']
  },
  {
    name: 'Downcast Mystic Cloak',
    type: 'Clothing',
    subType: 'Back',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Sonic Absorption',
        bonus: 'Quality',
        modifier: '2%'
      },
      {
        name: 'Magical Resistance',
        bonus: 'Insight',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['The Wish (Heroic)']
  },
  {
    name: 'Downcast Nimble Cloak',
    type: 'Clothing',
    subType: 'Back',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Electric Absorption',
        bonus: 'Quality',
        modifier: '2%'
      },
      {
        name: 'Magical Resistance',
        bonus: 'Insight',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['The Proper Authorities (Heroic)']
  },
  {
    name: 'Downcast Robe',
    type: 'Armor',
    subType: 'Robe',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Armor Class',
        bonus: 'Enhancement',
        modifier: 4
      },
      {
        name: 'Universal Spell Lore',
        bonus: 'Exceptional',
        modifier: '3%'
      }
    ],
    augments: [
      {
        lamordiaMelancholicArmor: null,
        lamordiaDolorousArmor: null,
        lamordiaMiserableAccessory: null,
        lamordiaWoefulAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['A Miner Sacrifice (Heroic)']
  },
  {
    name: 'Downcast Stoic Cloak',
    type: 'Clothing',
    subType: 'Back',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Cold Absorption',
        bonus: 'Quality',
        modifier: '2%'
      },
      {
        name: 'Magical Resistance',
        bonus: 'Insight',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Beneath the City Streets (Heroic)']
  }
]
