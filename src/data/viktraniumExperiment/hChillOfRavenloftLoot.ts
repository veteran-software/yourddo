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
        name: 'Spell Power: Universal',
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
        name: 'Spell Penetration (Level 9)',
        bonus: 'Equipment',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicWeapon: null,
        lamordiaDolorousWeapon: null,
        purple: null
      }
    ],
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Frostforged Buckler',
    type: 'Shield',
    subType: 'Buckler',
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
        modifier: 5
      },
      {
        name: 'Guardbreaking'
      },
      {
        name: 'Physical Resistance',
        bonus: 'Insight',
        modifier: 8
      }
    ],
    augments: [
      {
        lamordiaMelancholicWeapon: null,
        lamordiaDolorousWeapon: null,
        red: null
      }
    ],
    foundIn: ['The Body Snatchers (Heroic)']
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
        name: 'Physical Resistance',
        bonus: 'Insight',
        modifier: 8
      }
    ],
    augments: [
      {
        lamordiaMelancholicWeapon: null,
        lamordiaDolorousWeapon: null,
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
        name: 'Physical Resistance',
        bonus: 'Insight',
        modifier: 8
      }
    ],
    augments: [
      {
        lamordiaMelancholicWeapon: null,
        lamordiaDolorousWeapon: null,
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
        name: 'Physical Resistance',
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
        lamordiaMelancholicWeapon: null,
        lamordiaDolorousWeapon: null,
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
        name: 'Spell Power: Universal',
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
        name: 'Spell Penetration (Level 9)',
        bonus: 'Equipment',
        modifier: 5
      }
    ],
    augments: [
      {
        lamordiaMelancholicWeapon: null,
        lamordiaDolorousWeapon: null,
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
        lamordiaMelancholicWeapon: null,
        lamordiaDolorousWeapon: null,
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
        lamordiaMelancholicWeapon: null,
        lamordiaDolorousWeapon: null,
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
        lamordiaMelancholicWeapon: null,
        lamordiaDolorousWeapon: null,
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
        lamordiaMelancholicWeapon: null,
        lamordiaDolorousWeapon: null,
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
    foundIn: ['The Proper Authorities (Heroic)']
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
    effectsAdded: [
      {
        name: 'Efficient Metamagic - Empower I'
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
        name: 'Magical Resistance',
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
        name: 'Sneak Attack Accuracy',
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
    foundIn: ['The Body Snatchers (Heroic)']
  },
  {
    name: "Gravekeeper's Greaves",
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
    foundIn: ['The Body Snatchers (Heroic)']
  },
  {
    name: "Gravekeeper's Bowler",
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravekeeper's Cap",
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravekeeper's Cowl",
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravekeeper's Elegant Cloak",
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
        name: 'Spell Power (each)',
        bonus: 'Insight',
        modifier: 20
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravekeeper's Heavy Cloak",
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
        name: 'Maximum Hit Points',
        bonus: 'Profane',
        modifier: 16
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravekeeper's Helm",
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravekeeper's Mystic Cloak",
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
        name: 'Spell DC: Abjuration',
        bonus: 'Quality',
        modifier: 1
      },
      {
        name: 'Spell DC: Conjuration',
        bonus: 'Quality',
        modifier: 1
      },
      {
        name: 'Spell DC: Enchantment',
        bonus: 'Quality',
        modifier: 1
      },
      {
        name: 'Spell DC: Evocation',
        bonus: 'Quality',
        modifier: 1
      },
      {
        name: 'Spell DC: Illusion',
        bonus: 'Quality',
        modifier: 1
      },
      {
        name: 'Spell DC: Necromancy',
        bonus: 'Quality',
        modifier: 1
      },
      {
        name: 'Spell DC: Transmutation',
        bonus: 'Quality',
        modifier: 1
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravekeeper's Nimble Cloak",
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
        name: 'Weapon Damage',
        bonus: 'Quality',
        modifier: 1
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravekeeper's Stoic Cloak",
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
        name: 'Combat Mastery +2',
        bonus: 'Insight',
        modifier: 2
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: "Gravekeeper's Top Hat",
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
        name: 'Magical Resistance',
        bonus: 'Quality',
        modifier: 2
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
    foundIn: ['The Body Snatchers (Heroic)']
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
    foundIn: ['Special Delivery (Heroic)']
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
        name: 'Fortification Bypass Chance',
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
    effectsAdded: [
      {
        name: 'Blood Rage'
      },
      {
        name: 'Maximum Hit Points',
        bonus: 'Enhancement',
        modifier: 18
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
        name: 'Skill: Spellcraft',
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
    effectsAdded: [
      {
        name: 'Maximum Hit Points',
        bonus: 'Vitality',
        modifier: 16
      }
    ],
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
        name: 'Doublestrike Chance',
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
        name: 'Magical Resistance',
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
    effectsAdded: [
      {
        name: 'Attack Rolls',
        bonus: 'Legendary',
        modifier: 1
      },
      {
        name: 'Physical Resistance',
        bonus: 'Quality',
        modifier: 2
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
    effectsAdded: [
      {
        name: 'Confirmed Critical',
        bonus: 'Insight',
        modifier: 3
      },
      {
        name: 'Critical Damage',
        bonus: 'Insight',
        modifier: 3
      },
      {
        name: 'Skill: Bluff',
        bonus: 'Exceptional',
        modifier: 5
      },
      {
        name: 'Skill: Diplomacy',
        bonus: 'Exceptional',
        modifier: 5
      },
      {
        name: 'Skill: Haggle',
        bonus: 'Exceptional',
        modifier: 5
      },
      {
        name: 'Skill: Intimidate',
        bonus: 'Exceptional',
        modifier: 5
      },
      {
        name: 'Skill: Perform',
        bonus: 'Exceptional',
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
        name: 'Dodge Chance',
        bonus: 'Enhancement',
        modifier: '5%'
      },
      {
        name: 'Skill: Disable Device',
        bonus: 'Exceptional',
        modifier: 2
      },
      {
        name: 'Skill: Repair',
        bonus: 'Exceptional',
        modifier: 2
      },
      {
        name: 'Skill: Search',
        bonus: 'Exceptional',
        modifier: 2
      },
      {
        name: 'Skill: Spellcraft',
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
    foundIn: ['Special Delivery (Heroic)']
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
    effectsAdded: [
      {
        name: 'Spell DC: Conjuration',
        bonus: 'Equipment',
        modifier: 2
      },
      {
        name: 'Spell Penetration (Level 9)',
        bonus: 'Equipment',
        modifier: 3
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
    name: 'Unbridled Power',
    type: 'Weapon',
    subType: 'Rune Arm',
    minimumLevel: 8,
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
        modifier: 35
      },
      {
        name: 'Lighting Lore',
        bonus: 'Equipment',
        modifier: '10%'
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
    foundIn: ['The Body Snatchers (Heroic)']
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
    effectsAdded: [
      {
        name: 'Confirm Critical',
        bonus: 'Insight',
        modifier: 3
      },
      {
        name: 'Critical Damage',
        bonus: 'Insight',
        modifier: 3
      }
    ],
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
    effectsAdded: [
      {
        name: 'Resist Cold',
        bonus: 'Enhancement',
        modifier: 18
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
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Frozen Contraption',
    type: 'Weapon',
    subType: 'Rune Arm',
    minimumLevel: 8,
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
        modifier: 35
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
