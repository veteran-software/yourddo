import type { CraftingIngredient } from '../../types/crafting.ts'

const HChillOfRavenloftLoot: CraftingIngredient[] = [
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
        name: 'Universal Spell Power',
        bonus: 'Implement',
        modifier: 13
      },
      {
        name: '+4 Orb Bonus',
        bonus: 'Orb',
        modifier: 4
      },
      {
        name: 'Spell Power (each)',
        bonus: 'Insight',
        modifier: 27,
        notes: 'This is not Universal Spell Power. It applies individually to each spell power.'
      },
      {
        name: 'Will Save',
        bonus: 'Resistance',
        modifier: 7
      }
    ],
    augments: [
      {
        purple: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Death's Anchor",
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
        name: 'Universal Spell Power',
        bonus: 'Implement',
        modifier: 13
      },
      {
        name: '+4 Orb Bonus',
        bonus: 'Orb',
        modifier: 4
      },
      {
        name: 'Negative and Poison Spell Power',
        bonus: 'Quality',
        modifier: 21
      },
      {
        name: 'Spell DC: Necromancy',
        bonus: 'Equipment',
        modifier: 3
      }
    ],
    augments: [
      {
        purple: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Flickering Divinity',
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
        name: 'Universal Spell Power',
        bonus: 'Implement',
        modifier: 13
      },
      {
        name: '+4 Orb Bonus',
        bonus: 'Orb',
        modifier: 4
      },
      {
        name: 'Light and Alignment Spell Power',
        bonus: 'Quality',
        modifier: 21
      },
      {
        name: 'Spell Penetration',
        bonus: 'Equipment',
        modifier: 5
      }
    ],
    augments: [
      {
        purple: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Frostforged Buckler',
    type: 'Shield',
    subType: 'Buckler',
    minimumLevel: 13,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Armor Class',
        bonus: 'Enhancement',
        modifier: 5
      },
      {
        name: 'Physical Resistance Rating',
        bonus: 'Insight',
        modifier: 8
      }
    ],
    augments: [
      {
        red: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Frostforged Large Shield',
    type: 'Shield',
    subType: 'Large Shield',
    minimumLevel: 13,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Armor Class',
        bonus: 'Enhancement',
        modifier: 5
      },
      {
        name: 'Physical Resistance Rating',
        bonus: 'Insight',
        modifier: 8
      }
    ],
    augments: [
      {
        red: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Frostforged Small Shield',
    type: 'Shield',
    subType: 'Small Shield',
    minimumLevel: 13,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Armor Class',
        bonus: 'Enhancement',
        modifier: 5
      },
      {
        name: 'Physical Resistance Rating',
        bonus: 'Insight',
        modifier: 8
      }
    ],
    augments: [
      {
        red: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Frostforged Tower Shield',
    type: 'Shield',
    subType: 'Tower Shield',
    minimumLevel: 13,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Armor Class',
        bonus: 'Enhancement',
        modifier: 5
      },
      {
        name: 'Physical Resistance Rating',
        bonus: 'Insight',
        modifier: 8
      },
      {
        name: 'Threat Increase: Melee',
        bonus: 'Quality',
        modifier: '13%'
      }
    ],
    augments: [
      {
        red: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Frostwell',
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
        name: 'Universal Spell Power',
        bonus: 'Implement',
        modifier: 13
      },
      {
        name: '+4 Orb Bonus',
        bonus: 'Orb',
        modifier: 4
      },
      {
        name: 'Cold Spell Power',
        bonus: 'Quality',
        modifier: 21
      },
      {
        name: 'Spell Penetration',
        bonus: 'Equipment',
        modifier: 5
      }
    ],
    augments: [
      {
        purple: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'TBD',
    type: 'Shield',
    subType: 'Buckler',
    minimumLevel: 13,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Armor Class',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    augments: [
      {
        red: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'TBD',
    type: 'Shield',
    subType: 'Large Shield',
    minimumLevel: 13,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Armor Class',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    augments: [
      {
        red: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'TBD',
    type: 'Shield',
    subType: 'Small Shield',
    minimumLevel: 13,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Armor Class',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    augments: [
      {
        red: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'TBD',
    type: 'Shield',
    subType: 'Tower Shield',
    minimumLevel: 13,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Armor Class',
        bonus: 'Enhancement',
        modifier: 5
      }
    ],
    augments: [
      {
        red: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Baron Aubrecker's Monogrammed Gloves",
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
        name: 'Spell DC: Transmutation',
        bonus: 'Equipment',
        modifier: 2
      },
      {
        name: 'Saves vs Spells',
        bonus: 'Insight',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Buckle of Secrets',
    type: 'Clothing',
    subType: 'Waist',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        lamordiaMiserableAccessory: null,
        blue: null,
        moon: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Assassinate DCs',
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
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Doubleshot',
        bonus: 'Enhancement',
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
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Physical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Physical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Physical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Magical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Magical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Physical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Magical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Magical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Magical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Downcast Top Hat',
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
        name: 'Electric Absorption',
        bonus: 'Insight',
        modifier: '4%'
      },
      {
        name: 'Physical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Elsie's Grasp",
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
        name: 'Magical Resistance Rating',
        bonus: 'Quality',
        modifier: 1,
        notes: '+1 per Religious Lore Feat'
      },
      {
        name: 'Unconscious Range',
        bonus: 'Enhancement',
        modifier: 128
      },
      {
        name: 'Positive Healing',
        bonus: 'per 10 sec',
        modifier: 16
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Experimental Rocket Boots',
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
        name: 'Jet Propulsion'
      },
      {
        name: 'Jump',
        bonus: 'Competence',
        modifier: 10
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Gloves of the Graverobber',
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
        name: 'Movement Speed',
        bonus: 'Enhancement',
        modifier: '18%'
      },
      {
        name: 'Attack Speed',
        bonus: 'Enhancement',
        modifier: '6%'
      },
      {
        name: 'Sneak Attack',
        bonus: 'Enhancement',
        modifier: 3
      },
      {
        name: 'Sneak Attack Damage',
        bonus: 'Enhancement',
        modifier: 5
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravedigger's Greaves",
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
        name: 'Fortitude Save',
        bonus: 'Quality',
        modifier: 1
      },
      {
        name: 'Fortification',
        bonus: 'Insight',
        modifier: '35%'
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravedigger's Bowler",
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
        name: 'Cold Resistance',
        bonus: 'Enhancement',
        modifier: 18
      },
      {
        name: 'Physical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravedigger's Cap",
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
        name: 'Acid Resistance',
        bonus: 'Enhancement',
        modifier: 18
      },
      {
        name: 'Physical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravedigger's Cowl",
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
        name: 'Sonic Resistance',
        bonus: 'Enhancement',
        modifier: 18
      },
      {
        name: 'Physical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravedigger's Elegant Cloak",
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
        name: 'Acid Resistance',
        bonus: 'Insight',
        modifier: 8
      },
      {
        name: 'Magical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravedigger's Heavy Cloak",
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
        name: 'Fire Resistance',
        bonus: 'Insight',
        modifier: 8
      },
      {
        name: 'Magical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravedigger's Helm",
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
        name: 'Fire Resistance',
        bonus: 'Enhancement',
        modifier: 18
      },
      {
        name: 'Physical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravedigger's Mystic Cloak",
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
        name: 'Sonic Resistance',
        bonus: 'Insight',
        modifier: 8
      },
      {
        name: 'Magical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravedigger's Nimble Cloak",
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
        name: 'Electric Resistance',
        bonus: 'Insight',
        modifier: 8
      },
      {
        name: 'Magical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravedigger's Stoic Cloak",
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
        name: 'Cold Resistance',
        bonus: 'Insight',
        modifier: 8
      },
      {
        name: 'Magical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravedigger's Top Hat",
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
        name: 'Electric Resistance',
        bonus: 'Enhancement',
        modifier: 18
      },
      {
        name: 'Physical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Grick-skin Gauntlets',
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
        name: 'Reflex Save',
        bonus: 'Resistance',
        modifier: 5
      },
      {
        name: 'Magical Resistance Rating',
        bonus: 'Quality',
        modifier: 5
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Hooves of the Nightmare',
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
        name: 'Negative Healing Amplification',
        bonus: 'Profane',
        modifier: 19
      },
      {
        name: 'Negative and Poison Spell Power',
        bonus: 'Quality',
        modifier: 17
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Icewalkers',
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
        name: 'Enhanced Ki +1'
      },
      {
        name: 'Reinforced Fists'
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Lamordian Bowler',
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
        name: 'Intelligence',
        bonus: 'Insight',
        modifier: 2
      },
      {
        name: 'Physical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Lamordian Cap',
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
        name: 'Dexterity',
        bonus: 'Insight',
        modifier: 2
      },
      {
        name: 'Physical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Lamordian Cowl',
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
        name: 'Charisma',
        bonus: 'Insight',
        modifier: 2
      },
      {
        name: 'Physical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Lamordian Elegant Cloak',
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
        name: 'Dexterity',
        bonus: 'Insight',
        modifier: 2
      },
      {
        name: 'Magical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Lamordian Heavy Cloak',
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
        name: 'Strength',
        bonus: 'Insight',
        modifier: 2
      },
      {
        name: 'Magical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Lamordian Helm',
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
        name: 'Strength',
        bonus: 'Insight',
        modifier: 2
      },
      {
        name: 'Physical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Lamordian Mystic Cloak',
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
        name: 'Charisma',
        bonus: 'Insight',
        modifier: 2
      },
      {
        name: 'Magical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Lamordian Nimble Cloak',
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
        name: 'Wisdom',
        bonus: 'Insight',
        modifier: 2
      },
      {
        name: 'Magical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Lamordian Stoic Cloak',
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
        name: 'Intelligence',
        bonus: 'Insight',
        modifier: 2
      },
      {
        name: 'Magical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Lamordian Top Hat',
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
        name: 'Wisdom',
        bonus: 'Insight',
        modifier: 2
      },
      {
        name: 'Physical Resistance Rating',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Miner's Steel Boots",
    type: 'Clothing',
    subType: 'Belt', // Probably not right
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Trip',
        bonus: 'Profane',
        modifier: 1
      },
      {
        name: 'Improved Trip',
        bonus: 'Profane',
        modifier: 1
      },
      {
        name: 'Sunder',
        bonus: 'Profane',
        modifier: 1
      },
      {
        name: 'Improved Sunder',
        bonus: 'Profane',
        modifier: 1
      },
      {
        name: 'Stunning Blow',
        bonus: 'Profane',
        modifier: 1
      },
      {
        name: 'Stunning Fist',
        bonus: 'Profane',
        modifier: 1
      },
      {
        name: 'Fortification Bypass',
        bonus: 'Enhancement',
        modifier: '8%'
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Tangle of Wires',
    type: 'Clothing',
    subType: 'Belt',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Repair Amplification',
        bonus: 'Enhancement',
        modifier: 19
      },
      {
        name: 'Repair and Rust Spell Power',
        bonus: 'Quality',
        modifier: 17
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "The Baron's Bandolier",
    type: 'Clothing',
    subType: 'Belt',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        moon: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
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
        name: 'Listen',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Auspicious Bracers',
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
        name: 'Spell DC: Illusion',
        bonus: 'Equipment',
        modifier: 2
      },
      {
        name: 'Spellcraft',
        bonus: 'Competence',
        modifier: 10
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
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Use Magic Device',
        bonus: 'Competence',
        modifier: 1
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
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Spellcraft',
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
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Fortification Bypass',
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
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Attack',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Frost Worm Tooth Ring',
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
        name: 'Will Save',
        bonus: 'Resistance',
        modifier: 5
      },
      {
        name: 'Proof Against Poison',
        bonus: 'Enhancement',
        modifier: 4
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Ghastly Guards',
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
        name: 'Feat: Wind Through the Trees'
      },
      {
        name: 'Immunity: Fear'
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Heartshard',
    type: 'Jewelry',
    subType: 'Trinket',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        lamordiaMiserableAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Ludendorf Class Ring',
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
        name: 'Doublestrike',
        bonus: 'Enhancement',
        modifier: '6%'
      },
      {
        name: 'Tendon Slice 4'
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Mark of the Dark Powers',
    type: 'Jewelry',
    subType: 'Trinket',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Magical Resistance Rating',
        bonus: 'Quality',
        modifier: 2
      },
      {
        name: 'Maximum Hit Points',
        bonus: 'Profane',
        modifier: 16
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Mining Sights',
    type: 'Jewelry',
    subType: 'Eyes',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        yellow: null,
        sun: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Scientist's Specs",
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
        name: 'Spell Power (each)',
        bonus: 'Quality',
        modifier: 9
      },
      {
        name: 'True Seeing'
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Socket Band',
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
        name: 'Spell Cost Reduction',
        bonus: 'Enhancement',
        modifier: '5%'
      },
      {
        name: 'Threat Decrease: Spells',
        bonus: 'Enhancement',
        modifier: '8%'
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        yellow: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Socket Chain',
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
        name: 'Maximum Spell Points',
        bonus: 'Insight',
        modifier: 48
      },
      {
        name: 'Maximum Spell Points',
        bonus: 'Enhancement',
        modifier: 96
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Souvenir Coin',
    type: 'Jewelry',
    subType: 'Trinket',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Surreptitious Shackles',
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
        name: 'Will Save',
        bonus: 'Quality',
        modifier: 1
      },
      {
        name: 'Fortitude Save',
        bonus: 'Resistance',
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Tiny Brain in a Tiny Jar',
    type: 'Jewelry',
    subType: 'Trinket',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Dodge',
        bonus: 'Enhancement',
        modifier: '5%'
      },
      {
        name: 'Disable Device',
        bonus: 'Exceptional',
        modifier: 2
      },
      {
        name: 'Repair',
        bonus: 'Exceptional',
        modifier: 2
      },
      {
        name: 'Search',
        bonus: 'Exceptional',
        modifier: 2
      },
      {
        name: 'Spellcraft',
        bonus: 'Exceptional',
        modifier: 2
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Viktra's Experiment",
    type: 'Jewelry',
    subType: 'Eyes',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        yellow: null,
        sun: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Unbridled Power',
    type: 'Weapon',
    subType: 'Rune Arm',
    minimumLevel: 18,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Maximum Charge Tier V'
      },
      {
        name: 'Electric Spell Power',
        bonus: 'Insight',
        modifier: 52
      },
      {
        name: 'Lighting Lore',
        bonus: 'Equipment',
        modifier: '15%'
      },
      {
        name: 'Rune Arm Imbue: Electrical IV'
      }
    ],
    augments: [
      {
        lamordiaMelancholicWeapon: null,
        lamordiaDolorousWeapon: null,
        green: null
      }
    ],
    setBonus: [
      {
        name: 'Forbidden Knowledge',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Physical Resistance Rating',
            bonus: 'Profane',
            modifier: 10
          }
        ]
      },
      {
        name: 'Forbidden Knowledge',
        numPiecesEquipped: 4,
        enhancements: [
          {
            name: 'Ability Scores',
            bonus: 'Profane',
            modifier: 1
          },
          {
            name: 'Attack',
            bonus: 'Profane',
            modifier: 1
          },
          {
            name: 'Damage',
            bonus: 'Profane',
            modifier: 1
          }
        ]
      },
      {
        name: 'Forbidden Knowledge',
        numPiecesEquipped: 5,
        enhancements: [
          {
            name: 'Melee Power',
            bonus: 'Profane',
            modifier: 5
          },
          {
            name: 'Ranged Power',
            bonus: 'Profane',
            modifier: 5
          },
          {
            name: 'Universal Spell Power',
            bonus: 'Profane',
            modifier: 10
          },
          {
            name: 'Spell DCs',
            bonus: 'Profane',
            modifier: 1
          }
        ]
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  // Armors
  {
    name: "Gatekeeper's Armor",
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
        name: 'Armor Class',
        bonus: 'Natural Armor',
        modifier: 5
      },
      {
        name: 'Good Luck',
        description: 'This item gives a +2 Luck bonus to all saves and skill checks',
        bonus: 'Luck',
        modifier: 2
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gatekeeper's Brawler Garb",
    type: 'Armor',
    subType: 'Outfit',
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
        name: 'Armor Class',
        bonus: 'Natural Armor',
        modifier: 5
      },
      {
        name: 'Good Luck',
        description: 'This item gives a +2 Luck bonus to all saves and skill checks',
        bonus: 'Luck',
        modifier: 2
      }
    ],
    augments: [
      {
        lamordiaMelancholicArmor: null,
        lamordiaDolorousArmor: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gatekeeper's Docent",
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
        name: 'Armor Class',
        bonus: 'Natural Armor',
        modifier: 5
      },
      {
        name: 'Good Luck',
        description: 'This item gives a +2 Luck bonus to all saves and skill checks',
        bonus: 'Luck',
        modifier: 2
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gatekeeper's Gambeson",
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
        name: 'Armor Class',
        bonus: 'Natural Armor',
        modifier: 5
      },
      {
        name: 'Good Luck',
        description: 'This item gives a +2 Luck bonus to all saves and skill checks',
        bonus: 'Luck',
        modifier: 2
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gatekeeper's Robe",
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
        name: 'Armor Class',
        bonus: 'Natural Armor',
        modifier: 5
      },
      {
        name: 'Good Luck',
        description: 'This item gives a +2 Luck bonus to all saves and skill checks',
        bonus: 'Luck',
        modifier: 2
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gatekeeper's Vest",
    type: 'Armor',
    subType: 'Light Armor',
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
        name: 'Armor Class',
        bonus: 'Natural Armor',
        modifier: 5
      },
      {
        name: 'Good Luck',
        description: 'This item gives a +2 Luck bonus to all saves and skill checks',
        bonus: 'Luck',
        modifier: 2
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Lamordian Armor',
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
        name: 'Ghostly'
      },
      {
        name: 'Fortification',
        bonus: 'Enhancement',
        modifier: '70%'
      }
    ],
    augments: [
      {
        lamordiaMelancholicArmor: null,
        lamordiaDolorousArmor: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Lamordian Brawler Garb',
    type: 'Armor',
    subType: 'Outfit',
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
        name: 'Ghostly'
      },
      {
        name: 'Fortification',
        bonus: 'Enhancement',
        modifier: '70%'
      }
    ],
    augments: [
      {
        lamordiaMelancholicArmor: null,
        lamordiaDolorousArmor: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Lamordian Docent',
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
        name: 'Ghostly'
      },
      {
        name: 'Fortification',
        bonus: 'Enhancement',
        modifier: '70%'
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Lamordian Gambeson',
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
        name: 'Ghostly'
      },
      {
        name: 'Fortification',
        bonus: 'Enhancement',
        modifier: '70%'
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Lamordian Robe',
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
        name: 'Ghostly'
      },
      {
        name: 'Fortification',
        bonus: 'Enhancement',
        modifier: '70%'
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Lamordian Vest',
    type: 'Armor',
    subType: 'Light Armor',
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
        name: 'Ghostly'
      },
      {
        name: 'Fortification',
        bonus: 'Enhancement',
        modifier: '70%'
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  // Rare Items
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
        name: 'Elemental Resistance',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicArmor: null,
        lamordiaDolorousArmor: null,
        lamordiaMiserableAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Downcast Brawler Garb',
    type: 'Armor',
    subType: 'Outfit',
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
        name: 'Elemental Resistance',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicArmor: null,
        lamordiaDolorousArmor: null,
        lamordiaMiserableAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Elemental Resistance',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicArmor: null,
        lamordiaDolorousArmor: null,
        lamordiaMiserableAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Elemental Resistance',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicArmor: null,
        lamordiaDolorousArmor: null,
        lamordiaMiserableAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
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
        name: 'Elemental Resistance',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicArmor: null,
        lamordiaDolorousArmor: null,
        lamordiaMiserableAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Downcast Vest',
    type: 'Armor',
    subType: 'Light Armor',
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
        name: 'Elemental Resistance',
        bonus: 'Competence',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicArmor: null,
        lamordiaDolorousArmor: null,
        lamordiaMiserableAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
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
    effectsAdded: [],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        lamordiaMiserableAccessory: null,
        blue: null,
        moon: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
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
    effectsAdded: [],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        lamordiaMiserableAccessory: null,
        blue: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
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
    effectsAdded: [],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        lamordiaMiserableAccessory: null,
        blue: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Goggles of the Frozen Night',
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
        name: 'Cold Absorption',
        bonus: 'Enhancement',
        modifier: '18%'
      }
    ],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        lamordiaMiserableAccessory: null,
        yellow: null,
        sun: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Golden Souvenir Coin',
    type: 'Jewelry',
    subType: 'Trinket',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        lamordiaMiserableAccessory: null,
        blue: null,
        sun: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Wintry Wrappings',
    type: 'Jewelry',
    subType: 'Wrists',
    minimumLevel: 8,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [],
    augments: [
      {
        lamordiaMelancholicAccessory: null,
        lamordiaDolorousAccessory: null,
        lamordiaMiserableAccessory: null,
        blue: null,
        moon: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Frozen Contraption',
    type: 'Weapon',
    subType: 'Rune Arm',
    minimumLevel: 18,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Maximum Charge Tier V'
      },
      {
        name: 'Cold Spell Power',
        bonus: 'Insight',
        modifier: 52
      },
      {
        name: 'Cold Lore',
        bonus: 'Equipment',
        modifier: '15%'
      },
      {
        name: 'Rune Arm Imbue: Cold IV'
      }
    ],
    augments: [
      {
        lamordiaMelancholicWeapon: null,
        lamordiaDolorousWeapon: null,
        lamordiaMelancholicArmor: null,
        green: null
      }
    ],
    setBonus: [
      {
        name: 'Forbidden Knowledge',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Physical Resistance Rating',
            bonus: 'Profane',
            modifier: 10
          }
        ]
      },
      {
        name: 'Forbidden Knowledge',
        numPiecesEquipped: 4,
        enhancements: [
          {
            name: 'Ability Scores',
            bonus: 'Profane',
            modifier: 1
          },
          {
            name: 'Attack',
            bonus: 'Profane',
            modifier: 1
          },
          {
            name: 'Damage',
            bonus: 'Profane',
            modifier: 1
          }
        ]
      },
      {
        name: 'Forbidden Knowledge',
        numPiecesEquipped: 5,
        enhancements: [
          {
            name: 'Melee Power',
            bonus: 'Profane',
            modifier: 5
          },
          {
            name: 'Ranged Power',
            bonus: 'Profane',
            modifier: 5
          },
          {
            name: 'Universal Spell Power',
            bonus: 'Profane',
            modifier: 10
          },
          {
            name: 'Spell DCs',
            bonus: 'Profane',
            modifier: 1
          }
        ]
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  }
]

export const lootHeroicViktraniumItems: Record<string, CraftingIngredient[]> = {
  Armor: [
    ...HChillOfRavenloftLoot.filter((item: CraftingIngredient) => item.type === 'Armor').sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  ],
  Weapons: [
    ...HChillOfRavenloftLoot.filter((item: CraftingIngredient) => item.type === 'Weapon').sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  ],
  Shields: [
    ...HChillOfRavenloftLoot.filter((item: CraftingIngredient) => item.type === 'Shield').sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  ],
  Clothing: [
    ...HChillOfRavenloftLoot.filter((item: CraftingIngredient) => item.type === 'Clothing').sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  ],
  Jewelry: [
    ...HChillOfRavenloftLoot.filter((item: CraftingIngredient) => item.type === 'Jewelry').sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  ]
} as const
