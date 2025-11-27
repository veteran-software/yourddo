const cannithCrafting = [
  {
    name: 'False Life',
    enchantments: [
      {
        name: 'Enhancement bonus to Maximum Hit Points',
        statModified: 'Maximum Hit Points',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 15
        },
        {
          name: 'Vial of Pure Water',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 30
        },
        {
          name: 'Vial of Pure Water',
          qty: 10
        },
        {
          name: 'Pale Creeper',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of False Life ',
    prefix: null,
    suffix: ['Necklace', 'Armor', 'Rings', 'Belt', 'Shield', 'Trinket', 'Runearm'],
    extra: null,
    group: 'Hit Points',
    minLevelIncrease: null,
    stat: [
      4, 7, 8, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48, 50,
      51, 53, 54, 56, 57
    ]
  },
  {
    name: 'Wizardry',
    enchantments: [
      {
        name: 'Enhancement bonus to Maximum Spell Points',
        statModified: 'Maximum Spell POints',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Icon of Khyber',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Invigorating ',
    suffixTitle: ' of Wizardry ',
    prefix: ['Helm', 'Rings', 'Gloves', 'Trinket'],
    suffix: ['Shield', 'Trinket'],
    extra: null,
    group: 'Spell Points',
    minLevelIncrease: null,
    stat: [
      19, 33, 41, 60, 71, 79, 88, 96, 104, 112, 121, 129, 137, 145, 154, 162, 170, 178, 187, 195, 203, 211, 220, 228,
      236, 244, 253, 261, 269, 277, 286, 294, 302, 310
    ]
  },
  {
    name: 'Poison Ward',
    enchantments: [
      {
        name: 'Grants Immunity to Natural poisons.',
        statModified: 'Natural Poison immunity',
        bonusType: 'Resistance'
      },
      {
        name: 'Enhancement bonus to Saving Throws against Magical Poisons',
        statModified: 'Fortitude Save (Poison)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Vial of Contagion',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Robust ',
    suffixTitle: null,
    prefix: 'Necklace, Bracers, Cloak, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Save',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12]
  },
  {
    name: 'Disease Ward',
    enchantments: [
      {
        name: 'Grants Immunity to Natural Diseases.',
        statModified: 'Natural Disease immunity',
        bonusType: 'Resistance'
      },
      {
        name: 'Enhancement bonus to Saving Throws against Magical Diseases',
        statModified: 'Fortitude Save (Disease)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 15
        },
        {
          name: 'Khyber Prayer Pamphlet',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 30
        },
        {
          name: 'Khyber Prayer Pamphlet',
          qty: 10
        },
        {
          name: 'Icon of Khyber',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Resilient ',
    suffixTitle: null,
    prefix: 'Necklace, Bracers, Cloak, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Save',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12]
  },
  {
    name: 'Will Save',
    enchantments: [
      {
        name: 'Resistance bonus to Will Saves',
        statModified: 'Will Save',
        bonusType: 'Resistance'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 15
        },
        {
          name: 'Vial of Pure Water',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 30
        },
        {
          name: 'Vial of Pure Water',
          qty: 10
        },
        {
          name: 'Pale Creeper',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Disciplined ',
    suffixTitle: null,
    prefix: 'Bracers, Cloak, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Save',
    minLevelIncrease: null,
    stat: [1, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12]
  },
  {
    name: 'Reflex Save',
    enchantments: [
      {
        name: 'Resistance bonus to Reflex Saves',
        statModified: 'Reflex Save',
        bonusType: 'Resistance'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Tome: Prophecies of Khyber',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Agile ',
    suffixTitle: null,
    prefix: 'Bracers, Cloak, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Save',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12]
  },
  {
    name: 'Fortitude Save',
    enchantments: [
      {
        name: 'Resistance bonus to Fortitude Saves',
        statModified: 'Fortitude Save',
        bonusType: 'Resistance'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 15
        },
        {
          name: 'Deadly Feverblanch',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 30
        },
        {
          name: 'Deadly Feverblanch',
          qty: 10
        },
        {
          name: 'Tome: Prophecies of Khyber',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Stalwart ',
    suffixTitle: null,
    prefix: 'Bracers, Cloak, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Save',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12]
  },
  {
    name: 'Fire Resistance',
    enchantments: [
      {
        name: 'Enhancement bonus to Resist Fire',
        statModified: 'Fire Resistance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Vial of Contagion',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Charred ',
    suffixTitle: ' of Fire Resistance',
    prefix: 'Cloak, Trinket',
    suffix: 'Rings, Armor, Shield, Trinket',
    extra: 'Helm',
    group: 'Resist',
    minLevelIncrease: null,
    stat: [
      4, 7, 8, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48, 50,
      51, 53, 54, 56, 57
    ]
  },
  {
    name: 'Cold Resistance',
    enchantments: [
      {
        name: 'Enhancement bonus to Resist Cold',
        statModified: 'Cold Resistance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Icon of Khyber',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Frigid ',
    suffixTitle: ' of Cold Resistance ',
    prefix: 'Cloak, Trinket',
    suffix: 'Rings, Armor, Shield, Trinket',
    extra: 'Helm',
    group: 'Resist',
    minLevelIncrease: null,
    stat: [
      4, 7, 8, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48, 50,
      51, 53, 54, 56, 57
    ]
  },
  {
    name: 'Acid Resistance',
    enchantments: [
      {
        name: 'Enhancement bonus to Resist Acid',
        statModified: 'Acid Resistance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Tome: Prophecies of Khyber',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Alkalescent ',
    suffixTitle: ' of Acid Resistance ',
    prefix: ['Cloak', 'Trinket'],
    suffix: ['Rings', 'Armor', 'Shield', 'Trinket'],
    extra: ['Helm'],
    group: 'Resist',
    minLevelIncrease: null,
    stat: [
      4, 7, 8, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48, 50,
      51, 53, 54, 56, 57
    ]
  },
  {
    name: 'Electric Resistance',
    enchantments: [
      {
        name: 'Enhancement bonus to Resist Electric',
        statModified: 'Electric Resistance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Pale Creeper',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Grounded ',
    suffixTitle: ' of Electric Resistance ',
    prefix: 'Cloak, Trinket',
    suffix: 'Rings, Armor, Shield, Trinket',
    extra: 'Helm',
    group: 'Resist',
    minLevelIncrease: null,
    stat: [
      4, 7, 8, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48, 50,
      51, 53, 54, 56, 57
    ]
  },
  {
    name: 'Sonic Resistance',
    enchantments: [
      {
        name: 'Enhancement bonus to Resist Sonic',
        statModified: 'Sonic Resistance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Vial of Contagion',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Muffled ',
    suffixTitle: ' of Sonic Resistance ',
    prefix: 'Cloak, Trinket',
    suffix: 'Rings, Armor, Shield, Trinket',
    extra: 'Helm',
    group: 'Resist',
    minLevelIncrease: null,
    stat: [
      4, 7, 8, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48, 50,
      51, 53, 54, 56, 57
    ]
  },
  {
    name: 'Light Resistance',
    enchantments: [
      {
        name: 'Enhancement bonus to Resist Light',
        statModified: 'Light Resistance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Icon of Khyber',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Murky ',
    suffixTitle: ' of Light Resistance ',
    prefix: 'Cloak, Trinket',
    suffix: 'Rings, Armor, Shield, Trinket',
    extra: 'Helm',
    group: 'Resist',
    minLevelIncrease: null,
    stat: [
      4, 7, 8, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48, 50,
      51, 53, 54, 56, 57
    ]
  },
  {
    name: 'Negative Resistance',
    enchantments: [
      {
        name: 'Enhancement bonus to Resist Negative',
        statModified: 'Negative Resistance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Tome: Prophecies of Khyber',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Favorable ',
    suffixTitle: ' of Negative Resistance ',
    prefix: 'Cloak, Trinket',
    suffix: 'Rings, Armor, Shield, Trinket',
    extra: 'Helm',
    group: 'Resist',
    minLevelIncrease: null,
    stat: [
      4, 7, 8, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48, 50,
      51, 53, 54, 56, 57
    ]
  },
  {
    name: 'Poison Resistance',
    enchantments: [
      {
        name: 'Enhancement bonus to Resist Poison',
        statModified: 'Poison Resistance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Pale Creeper',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Poison Resistance ',
    prefix: 'Cloak, Trinket',
    suffix: 'Rings, Armor, Shield, Trinket',
    extra: 'Helm',
    group: 'Resist',
    minLevelIncrease: null,
    stat: [
      4, 7, 8, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48, 50,
      51, 53, 54, 56, 57
    ]
  },
  {
    name: 'Balance',
    enchantments: [
      {
        name: 'Competence bonus to Balance',
        statModified: 'Balance',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Vial of Contagion',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Sturdy ',
    suffixTitle: ' of Balance ',
    prefix: 'Rings, Cloak, Boots, Trinket, Runearm',
    suffix: 'Belt, Trinket',
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Bluff',
    enchantments: [
      {
        name: 'Competence bonus to Bluff',
        statModified: 'Bluff',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 15
        },
        {
          name: 'Deadly Feverblanch',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 30
        },
        {
          name: 'Deadly Feverblanch',
          qty: 10
        },
        {
          name: 'Icon of Khyber',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Feigned ',
    suffixTitle: ' of Bluff ',
    prefix: 'Gloves, Trinket, Runearm',
    suffix: 'Necklace, Rings, Trinket',
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Concentration',
    enchantments: [
      {
        name: 'Competence bonus to Concentration',
        statModified: 'Concentration',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 15
        },
        {
          name: 'Vial of Pure Water',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 30
        },
        {
          name: 'Vial of Pure Water',
          qty: 10
        },
        {
          name: 'Pale Creeper',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Focused ',
    suffixTitle: null,
    prefix: 'Helm, Goggles, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Diplomacy',
    enchantments: [
      {
        name: 'Competence bonus to Diplomacy',
        statModified: 'Diplomacy',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 15
        },
        {
          name: 'Deadly Feverblanch',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 30
        },
        {
          name: 'Deadly Feverblanch',
          qty: 10
        },
        {
          name: 'Tome: Prophecies of Khyber',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Gracious ',
    suffixTitle: ' of Diplomacy ',
    prefix: 'Rings, Belt, Trinket, Runearm',
    suffix: 'Helm, Cloak, Trinket',
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Disable Device',
    enchantments: [
      {
        name: 'Competence bonus to Disable Device',
        statModified: 'Disable Device',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 15
        },
        {
          name: 'Vial of Pure Water',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 30
        },
        {
          name: 'Vial of Pure Water',
          qty: 10
        },
        {
          name: 'Vial of Contagion',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Tactful ',
    suffixTitle: null,
    prefix: 'Goggles, Gloves, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Haggle',
    enchantments: [
      {
        name: 'Competence bonus to Haggle',
        statModified: 'Haggle',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 15
        },
        {
          name: 'Deadly Feverblanch',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 30
        },
        {
          name: 'Deadly Feverblanch',
          qty: 10
        },
        {
          name: 'Icon of Khyber',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Bartered ',
    suffixTitle: null,
    prefix: 'Helm, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Heal',
    enchantments: [
      {
        name: 'Competence bonus to Heal',
        statModified: 'Heal',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Amber Vial',
          qty: 15
        },
        {
          name: 'Khyber Prayer Pamphlet',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Amber Vial',
          qty: 30
        },
        {
          name: 'Khyber Prayer Pamphlet',
          qty: 10
        },
        {
          name: 'Pale Creeper',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Soothing ',
    suffixTitle: ' of Heal ',
    prefix: 'Necklace, Trinket, Runearm',
    suffix: 'Gloves, Trinket',
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Hide',
    enchantments: [
      {
        name: 'Competence bonus to Hide',
        statModified: 'Hide',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 15
        },
        {
          name: 'Deadly Feverblanch',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 30
        },
        {
          name: 'Deadly Feverblanch',
          qty: 10
        },
        {
          name: 'Tome: Prophecies of Khyber',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Covert ',
    suffixTitle: null,
    prefix: 'Rings, Cloak, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Intimidate',
    enchantments: [
      {
        name: 'Competence bonus to Intimidate',
        statModified: 'Intimidate',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 15
        },
        {
          name: 'Deadly Feverblanch',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 30
        },
        {
          name: 'Deadly Feverblanch',
          qty: 10
        },
        {
          name: 'Vial of Contagion',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Daunting ',
    suffixTitle: 'of Intimidate ',
    prefix: 'Helm, Trinket, Runearm',
    suffix: 'Bracers, Cloak, Gloves, Armor, Shield, Trinket',
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Jump',
    enchantments: [
      {
        name: 'Competence bonus to Jump',
        statModified: 'Jump',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Icon of Khyber',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Jump ',
    prefix: null,
    suffix: 'Belt, Boots, Trinket',
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Listen',
    enchantments: [
      {
        name: 'Competence bonus to Listen',
        statModified: 'Listen',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Amber Vial',
          qty: 15
        },
        {
          name: 'Khyber Prayer Pamphlet',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Amber Vial',
          qty: 30
        },
        {
          name: 'Khyber Prayer Pamphlet',
          qty: 10
        },
        {
          name: 'Pale Creeper',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Harkening ',
    suffixTitle: null,
    prefix: 'Helm, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Move Silently',
    enchantments: [
      {
        name: 'Competence bonus to Move Silently',
        statModified: 'Move Silently',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Tome: Prophecies of Khyber',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Sneaking ',
    suffixTitle: ' of Move Silently ',
    prefix: 'Belt, Boots, Trinket, Runearm',
    suffix: 'Bracers, Armor, Shield, Trinket',
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Open Lock',
    enchantments: [
      {
        name: 'Competence bonus to Open Lock',
        statModified: 'Open Lock',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 15
        },
        {
          name: 'Vial of Pure Water',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 30
        },
        {
          name: 'Vial of Pure Water',
          qty: 10
        },
        {
          name: 'Vial of Contagion',
          qty: 2
        }
      ]
    },
    prefixTitle: "Burglar's ",
    suffixTitle: ' of Open Lock ',
    prefix: 'Gloves, Trinket, Runearm',
    suffix: 'Rings, Goggles, Trinket',
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Perform',
    enchantments: [
      {
        name: 'Competence bonus to Perform',
        statModified: 'Perform',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 15
        },
        {
          name: 'Vial of Pure Water',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 30
        },
        {
          name: 'Vial of Pure Water',
          qty: 10
        },
        {
          name: 'Icon of Khyber',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Delightful ',
    suffixTitle: null,
    prefix: 'Rings, Gloves, Trinket, Runearm',
    suffix: null,
    extra: 'Bracers, Trinket',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Repair',
    enchantments: [
      {
        name: 'Competence bonus to Repair',
        statModified: 'Repair',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 15
        },
        {
          name: 'Vial of Pure Water',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 30
        },
        {
          name: 'Vial of Pure Water',
          qty: 10
        },
        {
          name: 'Pale Creeper',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Refurbished ',
    suffixTitle: ' of Repair ',
    prefix: 'Necklace, Trinket, Runearm',
    suffix: 'Gloves, Trinket',
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Search',
    enchantments: [
      {
        name: 'Competence bonus to Search',
        statModified: 'Search',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Amber Vial',
          qty: 15
        },
        {
          name: 'Khyber Prayer Pamphlet',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Amber Vial',
          qty: 30
        },
        {
          name: 'Khyber Prayer Pamphlet',
          qty: 10
        },
        {
          name: 'Tome: Prophecies of Khyber',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Inspected ',
    suffixTitle: ' of Search ',
    prefix: 'Goggles, Trinket, Runearm',
    suffix: 'Necklace, Helm, Trinket',
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Spot',
    enchantments: [
      {
        name: 'Competence bonus to Spot',
        statModified: 'Spot',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Amber Vial',
          qty: 15
        },
        {
          name: 'Khyber Prayer Pamphlet',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Amber Vial',
          qty: 30
        },
        {
          name: 'Khyber Prayer Pamphlet',
          qty: 10
        },
        {
          name: 'Vial of Contagion',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Spot ',
    prefix: null,
    suffix: 'Necklace, Helm, Goggles, Trinket',
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Swim',
    enchantments: [
      {
        name: 'Competence bonus to Swim',
        statModified: 'Swim',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Icon of Khyber',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Swim ',
    prefix: null,
    suffix: 'Rings, Belt, Boots, Trinket',
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Tumble',
    enchantments: [
      {
        name: 'Competence bonus to Tumble',
        statModified: 'Tumble',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Pale Creeper',
          qty: 2
        }
      ]
    },
    prefixTitle: "Acrobat's ",
    suffixTitle: ' of Tumble ',
    prefix: 'Necklace, Boots, Trinket, Runearm',
    suffix: 'Rings, Bracers, Belt, Trinket',
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Spellsight',
    enchantments: [
      {
        name: 'Competence bonus to Spellsight',
        statModified: 'Spellsight',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Amber Vial',
          qty: 15
        },
        {
          name: 'Khyber Prayer Pamphlet',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Amber Vial',
          qty: 30
        },
        {
          name: 'Khyber Prayer Pamphlet',
          qty: 10
        },
        {
          name: 'Icon of Khyber',
          qty: 2
        }
      ]
    },
    prefixTitle: "Visionary's ",
    suffixTitle: ' of Spellsight ',
    prefix: 'Boots, Trinket, Runearm',
    suffix: 'Cloak, Helm, Necklace, Bracers, Trinket',
    extra: null,
    group: 'Skill',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20,
      20, 21, 21, 22
    ]
  },
  {
    name: 'Fortification',
    enchantments: [
      {
        name: 'Enhancement bonus to the reduced chance of taking Critical Hit damage on a Critical Hit',
        statModified: 'Fortification',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 30
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Pale Creeper',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Reinforced ',
    suffixTitle: ' of Fortification ',
    prefix: ['Helm', 'Armor', 'Trinket', 'Shield'],
    suffix: ['Bracers', 'Trinket'],
    extra: null,
    group: 'Defense',
    minLevelIncrease: null,
    stat: [
      38, 43, 47, 55, 59, 63, 66, 70, 73, 77, 80, 84, 87, 90, 94, 97, 101, 104, 108, 111, 115, 118, 122, 125, 128, 132,
      135, 139, 142, 146, 149, 153, 156, 159
    ]
  },
  {
    name: 'Incite',
    enchantments: [
      {
        name: 'Enhancement bonus to Increased Threat Generation from Melee Damage',
        statModified: 'Threat Generation (Melee)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Amber Vial',
          qty: 15
        },
        {
          name: 'Khyber Prayer Pamphlet',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Amber Vial',
          qty: 30
        },
        {
          name: 'Khyber Prayer Pamphlet',
          qty: 10
        },
        {
          name: 'Icon of Khyber',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Enraging ',
    suffixTitle: ' of Incite ',
    prefix: ['Helm', 'Trinket'],
    suffix: ['Weapon (Melee)', 'Weapon (Ranged)', 'Shield'],
    extra: null,
    group: 'Threat Gen',
    minLevelIncrease: null,
    stat: [
      7, 9, 10, 12, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 38, 39, 40,
      41, 42, 43, 44, 45
    ]
  },
  {
    name: 'Diversion',
    enchantments: [
      {
        name: 'Enhancement bonus to Decreased Threat Generation from Melee Damage',
        statModified: 'Threat Reduction (Melee)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 15
        },
        {
          name: 'Deadly Feverblanch',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 30
        },
        {
          name: 'Deadly Feverblanch',
          qty: 10
        },
        {
          name: 'Vial of Contagion',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Serene ',
    suffixTitle: ' of Diversion ',
    prefix: ['Cloak', 'Trinket'],
    suffix: ['Boots', 'Weapon (Melee)', 'Weapon (Ranged)', 'Trinket'],
    extra: null,
    group: 'Threat Gen',
    minLevelIncrease: null,
    stat: [
      2, 3, 4, 5, 6, 6, 7, 8, 8, 9, 9, 10, 11, 11, 12, 12, 13, 14, 14, 15, 15, 16, 17, 17, 18, 18, 19, 20, 20, 21, 21,
      22, 23, 23
    ]
  },
  {
    name: 'Acid Absorption',
    enchantments: [
      {
        name: '% Enhancement bonus to Acid absorption',
        statModified: 'Elemental Absorption (Acid)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 15
        },
        {
          name: 'Signet of the Devourer',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 30
        },
        {
          name: 'Signet of the Devourer',
          qty: 10
        },
        {
          name: 'Lush Cryptmoss',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Alkaline ',
    suffixTitle: ' of Acid Absorption ',
    prefix: 'Rings, Armor, Shield, Trinket, Runearm',
    suffix: 'Cloak, Trinket',
    extra: null,
    group: 'Absorption',
    minLevelIncrease: null,
    stat: [
      11, 13, 13, 15, 16, 17, 18, 18, 19, 20, 21, 21, 22, 23, 24, 24, 25, 26, 27, 27, 28, 29, 30, 30, 31, 32, 33, 33,
      34, 35, 36, 36, 37, 38
    ]
  },
  {
    name: 'Cold Absorption',
    enchantments: [
      {
        name: '% Enhancement bonus to Cold absorption',
        statModified: 'Elemental Absorption (Cold)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 15
        },
        {
          name: 'Mark of the Keeper',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 30
        },
        {
          name: 'Mark of the Keeper',
          qty: 10
        },
        {
          name: 'Cryptmoss Queen',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Chilled ',
    suffixTitle: ' of Cold Absorption ',
    prefix: 'Rings, Armor, Shield, Trinket, Runearm',
    suffix: 'Cloak, Trinket',
    extra: null,
    group: 'Absorption',
    minLevelIncrease: null,
    stat: [
      11, 13, 13, 15, 16, 17, 18, 18, 19, 20, 21, 21, 22, 23, 24, 24, 25, 26, 27, 27, 28, 29, 30, 30, 31, 32, 33, 33,
      34, 35, 36, 36, 37, 38
    ]
  },
  {
    name: 'Electricity Absorption',
    enchantments: [
      {
        name: '% Enhancement bonus to Electric absorption',
        statModified: 'Elemental Absorption (Electric)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 15
        },
        {
          name: 'Research Diary',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 30
        },
        {
          name: 'Research Diary',
          qty: 10
        },
        {
          name: 'Shamanic Totem',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Insulated ',
    suffixTitle: ' of Electricity Absorption ',
    prefix: 'Rings, Armor, Shield, Trinket, Runearm',
    suffix: 'Cloak, Trinket',
    extra: null,
    group: 'Absorption',
    minLevelIncrease: null,
    stat: [
      11, 13, 13, 15, 16, 17, 18, 18, 19, 20, 21, 21, 22, 23, 24, 24, 25, 26, 27, 27, 28, 29, 30, 30, 31, 32, 33, 33,
      34, 35, 36, 36, 37, 38
    ]
  },
  {
    name: 'Fire Absorption',
    enchantments: [
      {
        name: '% Enhancement bonus to Fire absorption',
        statModified: 'Elemental Absorption (Fire)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 15
        },
        {
          name: 'Powdered Blood',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 30
        },
        {
          name: 'Powdered Blood',
          qty: 10
        },
        {
          name: 'Necromantic Gem',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Blazing ',
    suffixTitle: ' of Fire Absorption ',
    prefix: 'Rings, Armor, Shield, Trinket, Runearm',
    suffix: 'Cloak, Trinket',
    extra: null,
    group: 'Absorption',
    minLevelIncrease: null,
    stat: [
      11, 13, 13, 15, 16, 17, 18, 18, 19, 20, 21, 21, 22, 23, 24, 24, 25, 26, 27, 27, 28, 29, 30, 30, 31, 32, 33, 33,
      34, 35, 36, 36, 37, 38
    ]
  },
  {
    name: 'Sonic Absorption',
    enchantments: [
      {
        name: '% Enhancement bonus to Sonic absorption',
        statModified: 'Elemental Absorption (Sonic)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 15
        },
        {
          name: 'Sparkling Dust',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 30
        },
        {
          name: 'Sparkling Dust',
          qty: 10
        },
        {
          name: 'Intact Fingerbone',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Damping ',
    suffixTitle: ' of Sonic Absorption ',
    prefix: 'Rings, Armor, Shield, Trinket, Runearm',
    suffix: 'Cloak, Trinket',
    extra: null,
    group: 'Absorption',
    minLevelIncrease: null,
    stat: [
      11, 13, 13, 15, 16, 17, 18, 18, 19, 20, 21, 21, 22, 23, 24, 24, 25, 26, 27, 27, 28, 29, 30, 30, 31, 32, 33, 33,
      34, 35, 36, 36, 37, 38
    ]
  },
  {
    name: 'Enchantment Resistance',
    enchantments: [
      {
        name: 'Resistance bonus saves versus Enchantments',
        statModified: 'Spell Saves (Enchantment)',
        bonusType: 'Resistance'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Phoenix Tavern Purchase Order',
          qty: 15
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Phoenix Tavern Purchase Order',
          qty: 30
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 10
        },
        {
          name: 'Cryptmoss Queen',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Disenchanted ',
    suffixTitle: null,
    prefix: 'Necklace, Bracers, Cloak, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Save',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12]
  },
  {
    name: 'Illusion Resistance',
    enchantments: [
      {
        name: 'Resistance bonus saves versus Illusions',
        statModified: 'Spell Saves (Illusion)',
        bonusType: 'Resistance'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 15
        },
        {
          name: 'Cryptmoss Worm',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 30
        },
        {
          name: 'Cryptmoss Worm',
          qty: 10
        },
        {
          name: 'Shamanic Totem',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Lucid ',
    suffixTitle: null,
    prefix: 'Necklace, Bracers, Cloak, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Save',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12]
  },
  {
    name: 'Parrying',
    enchantments: [
      {
        name: 'Insight bonus to Armor Class and Saving Throws',
        statModified: ['Armor Class', 'Fortitude Save', 'Reflex Save', 'Will Save'],
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 15
        },
        {
          name: 'Sparkling Dust',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 30
        },
        {
          name: 'Sparkling Dust',
          qty: 10
        },
        {
          name: 'Necromantic Gem',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Parrying ',
    prefix: null,
    suffix: 'Helm, Belt, Boots, Trinket',
    extra: 'Armor, Shield, Bracers',
    group: 'Save',
    minLevelIncrease: null,
    stat: [0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7]
  },
  {
    name: 'Dodge Bonus',
    enchantments: [
      {
        name: '% Enhancement bonus to Dodge',
        statModified: 'Dodge',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 15
        },
        {
          name: 'Cryptmoss Worm',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 30
        },
        {
          name: 'Cryptmoss Worm',
          qty: 10
        },
        {
          name: 'Intact Fingerbone',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Evasive ',
    suffixTitle: ' of Dodge Bonus ',
    prefix: 'Belt, Boots, Trinket',
    suffix: 'Bracers, Cloak, Trinket',
    extra: null,
    group: 'Defense',
    minLevelIncrease: null,
    stat: [
      1, 2, 2, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 14, 14, 14, 15
    ]
  },
  {
    name: 'Spell Resistance',
    enchantments: [
      {
        name: 'Enhancement bonus to Spell Resistance',
        statModified: 'Spell Resistance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 15
        },
        {
          name: 'Deadly Feverblanch',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Page Torn from a Research Notebook',
          qty: 30
        },
        {
          name: 'Deadly Feverblanch',
          qty: 10
        },
        {
          name: 'Tome: Prophecies of Khyber',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: 'Rings, Cloak, Belt, Armor, Shield, Trinket',
    suffix: null,
    extra: null,
    group: 'Defense',
    minLevelIncrease: null,
    stat: [
      4, 6, 7, 10, 12, 13, 15, 16, 17, 19, 20, 21, 23, 24, 25, 27, 28, 29, 31, 32, 33, 35, 36, 37, 39, 40, 41, 43, 44,
      45, 47, 48, 49, 51
    ]
  },
  {
    name: 'Sheltering',
    enchantments: [
      {
        name: 'Enhancement bonus to Physical and Magical Resistance Rating',
        statModified: ['Physical Resistance Rating', 'Magical Resistance Rating'],
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 15
        },
        {
          name: 'Cryptmoss',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 30
        },
        {
          name: 'Cryptmoss',
          qty: 10
        },
        {
          name: "Tome: Myths of Old Xen'drik",
          qty: 2
        }
      ]
    },
    prefixTitle: 'Defensive ',
    suffixTitle: ' of Physical and Magical Resistance ',
    prefix: 'Helm, Trinket',
    suffix: 'Shield, Necklace, Rings, Boots, Trinket',
    extra: 'Bracers',
    group: 'Defense',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
      35, 36, 37, 38
    ]
  },
  {
    name: 'Accuracy',
    enchantments: [
      {
        name: 'Competence bonus to Attack Rolls',
        statModified: 'Attack Rolls',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 15
        },
        {
          name: 'Signet of the Devourer',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 30
        },
        {
          name: 'Signet of the Devourer',
          qty: 10
        },
        {
          name: 'Luminescent Dust',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Accuracy ',
    prefix: null,
    suffix: 'Helm, Goggles, Trinket',
    extra: null,
    group: 'Offense',
    minLevelIncrease: null,
    stat: [
      2, 3, 4, 5, 6, 6, 7, 8, 8, 9, 9, 10, 11, 11, 12, 12, 13, 14, 14, 15, 15, 16, 17, 17, 18, 18, 19, 20, 20, 21, 21,
      22, 23, 23
    ]
  },
  {
    name: 'Deadly',
    enchantments: [
      {
        name: 'Competence bonus to Weapon Damage (+[W])',
        statModified: 'Weapon Damage',
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 15
        },
        {
          name: 'Mark of the Keeper',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 30
        },
        {
          name: 'Mark of the Keeper',
          qty: 10
        },
        {
          name: 'Intact Fingerbone',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Deadly ',
    prefix: null,
    suffix: 'Gloves, Goggles, Weapon (Melee), Weapon (Ranged), Trinket',
    extra: null,
    group: 'Offense',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12]
  },
  {
    name: 'Seeker',
    enchantments: [
      {
        name: 'Enhancement bonus to Confirm Critical Hits &amp; Critical Hit Damage',
        statModified: ['Confirm Critical Hits', 'Critical Hit Damage'],
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 15
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 30
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 10
        },
        {
          name: 'Shamanic Totem',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Deft ',
    suffixTitle: null,
    prefix: 'Goggles, Boots, Weapon (Melee), Weapon (Ranged), Trinket',
    suffix: null,
    extra: null,
    group: 'Offense',
    minLevelIncrease: null,
    stat: [
      1, 2, 2, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 14, 14, 14, 15
    ]
  },
  {
    name: 'Shield Bashing',
    enchantments: [
      {
        name: 'Enhancement bonus to Increased chance of Secondary Shield Bash',
        statModified: 'Secondary Shield Bash Chance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Phoenix Tavern Purchase Order',
          qty: 15
        },
        {
          name: 'Cryptmoss',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Phoenix Tavern Purchase Order',
          qty: 30
        },
        {
          name: 'Cryptmoss',
          qty: 10
        },
        {
          name: 'Cryptmoss Queen',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Bashing ',
    prefix: null,
    suffix: 'Gloves, Shield, Trinket',
    extra: null,
    group: 'Offense',
    minLevelIncrease: null,
    stat: [
      2, 3, 4, 5, 6, 6, 7, 8, 8, 9, 9, 10, 11, 11, 12, 12, 13, 14, 14, 15, 15, 16, 17, 17, 18, 18, 19, 20, 20, 21, 21,
      22, 23, 23
    ]
  },
  {
    name: 'Armor-Piercing',
    enchantments: [
      {
        name: 'Enhancement bonus to Bypass enemy Fortification',
        statModified: 'Fortification Bypass',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 15
        },
        {
          name: 'Cryptmoss Worm',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 30
        },
        {
          name: 'Cryptmoss Worm',
          qty: 10
        },
        {
          name: 'Lush Cryptmoss',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Armor-Piercing ',
    prefix: 'Weapon (Melee), Weapon (Ranged), Shield',
    suffix: 'Gloves, Trinket',
    extra: null,
    group: 'Offense',
    minLevelIncrease: null,
    stat: [
      2, 3, 4, 5, 6, 6, 7, 8, 8, 9, 9, 10, 11, 11, 12, 12, 13, 14, 14, 15, 15, 16, 17, 17, 18, 18, 19, 20, 20, 21, 21,
      22, 23, 23
    ]
  },
  {
    name: 'Spell Penetration',
    enchantments: [
      {
        name: 'Equipment bonus to Penetrate Spell Resistance',
        statModified: ' Penetrate Spell Resistance',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 15
        },
        {
          name: 'Signet of the Devourer',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 30
        },
        {
          name: 'Signet of the Devourer',
          qty: 10
        },
        {
          name: "Tome: Myths of Old Xen'drik",
          qty: 2
        }
      ]
    },
    prefixTitle: 'Invasive ',
    suffixTitle: ' of Spell Penetration ',
    prefix: 'Gloves, Trinket, Runearm',
    suffix: 'Goggles, Trinket',
    extra: null,
    group: 'Spellcasting',
    minLevelIncrease: null,
    stat: [1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6]
  },
  {
    name: 'Evocation Focus',
    enchantments: [
      {
        name: 'Equipment bonus to DC of Evocation Spells',
        statModified: 'Evocation DC',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 15
        },
        {
          name: 'Cryptmoss Worm',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 30
        },
        {
          name: 'Cryptmoss Worm',
          qty: 10
        },
        {
          name: 'Tome: Stormreach Imports and Exports, 827YK',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Blasting ',
    suffixTitle: null,
    prefix: 'Necklace, Goggles, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Spell DC',
    minLevelIncrease: null,
    stat: [1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6]
  },
  {
    name: 'Illusion Focus',
    enchantments: [
      {
        name: 'Equipment bonus to DC of Illusion Spells',
        statModified: 'Illusion DC',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 15
        },
        {
          name: 'Cryptmoss',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 30
        },
        {
          name: 'Cryptmoss',
          qty: 10
        },
        {
          name: 'Lush Cryptmoss',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Deceiving ',
    suffixTitle: null,
    prefix: 'Necklace, Goggles, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Spell DC',
    minLevelIncrease: null,
    stat: [1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6]
  },
  {
    name: 'Necromancy Focus',
    enchantments: [
      {
        name: 'Equipment bonus to DC of Necromancy Spells',
        statModified: 'Necromancy DC',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 15
        },
        {
          name: 'Sparkling Dust',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 30
        },
        {
          name: 'Sparkling Dust',
          qty: 10
        },
        {
          name: 'Cryptmoss Queen',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Reanimating ',
    suffixTitle: null,
    prefix: 'Necklace, Goggles, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Spell DC',
    minLevelIncrease: null,
    stat: [1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6]
  },
  {
    name: 'Abjuration Focus',
    enchantments: [
      {
        name: 'Equipment bonus to DC of Abjuration Spells',
        statModified: 'Abjuration DC',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 15
        },
        {
          name: 'Powdered Blood',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 30
        },
        {
          name: 'Powdered Blood',
          qty: 10
        },
        {
          name: 'Shamanic Totem',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Nullified ',
    suffixTitle: null,
    prefix: 'Necklace, Goggles, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Spell DC',
    minLevelIncrease: null,
    stat: [1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6]
  },
  {
    name: 'Enchantment Focus',
    enchantments: [
      {
        name: 'Equipment bonus to DC of Enchantment Spells',
        statModified: 'Enchantment DC',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Phoenix Tavern Purchase Order',
          qty: 15
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Phoenix Tavern Purchase Order',
          qty: 30
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 10
        },
        {
          name: 'Necromantic Gem',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Charming ',
    suffixTitle: null,
    prefix: 'Necklace, Goggles, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Spell DC',
    minLevelIncrease: null,
    stat: [1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6]
  },
  {
    name: 'Transmutation Focus',
    enchantments: [
      {
        name: 'Equipment bonus to DC of Transmutation Spells',
        statModified: 'Transmutation DC',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 15
        },
        {
          name: 'Research Diary',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 30
        },
        {
          name: 'Research Diary',
          qty: 10
        },
        {
          name: 'Intact Fingerbone',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Metamorphic ',
    suffixTitle: null,
    prefix: 'Necklace, Goggles, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Spell DC',
    minLevelIncrease: null,
    stat: [1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6]
  },
  {
    name: 'Conjuration Focus',
    enchantments: [
      {
        name: 'Equipment bonus to DC of Conjuration Spells',
        statModified: 'Conjuration DC',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 15
        },
        {
          name: 'Mark of the Keeper',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 30
        },
        {
          name: 'Mark of the Keeper',
          qty: 10
        },
        {
          name: 'Luminescent Dust',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Summoning ',
    suffixTitle: null,
    prefix: 'Necklace, Goggles, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Spell DC',
    minLevelIncrease: null,
    stat: [1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6]
  },
  {
    name: 'Vertigo',
    enchantments: [
      {
        name: "Enhancement bonus to DC of character's Trip and Improved Trip attampts",
        statModified: ['Trip', 'Improved Trip'],
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 15
        },
        {
          name: 'Cryptmoss',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 30
        },
        {
          name: 'Cryptmoss',
          qty: 10
        },
        {
          name: 'Luminescent Dust',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Dizzying ',
    suffixTitle: ' of Vertigo ',
    prefix: 'Gloves, Trinket',
    suffix: 'Belt, Weapon (Melee), Trinket',
    extra: null,
    group: 'Tactical',
    minLevelIncrease: null,
    stat: [
      1, 2, 3, 4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 9, 9, 9, 10, 10, 11, 11, 12, 12, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16,
      17
    ]
  },
  {
    name: 'Stunning',
    enchantments: [
      {
        name: "Enhancement bonus to DC of character's Stunning Blow and Stunning Fist attempts",
        statModified: ['Stunning Blow', 'Stunning Fist'],
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 15
        },
        {
          name: 'Cryptmoss Worm',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 30
        },
        {
          name: 'Cryptmoss Worm',
          qty: 10
        },
        {
          name: 'Intact Fingerbone',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Dazed ',
    suffixTitle: ' of Stunning ',
    prefix: 'Gloves, Trinket',
    suffix: 'Helm, Belt, Weapon (Melee), Trinket',
    extra: null,
    group: 'Tactical',
    minLevelIncrease: null,
    stat: [
      1, 2, 3, 4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 9, 9, 9, 10, 10, 11, 11, 12, 12, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16,
      17
    ]
  },
  {
    name: 'Shatter',
    enchantments: [
      {
        name: "Enhancement bonus to DC of character's Sunder attempts",
        statModified: 'Sunder',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 15
        },
        {
          name: 'Powdered Blood',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 30
        },
        {
          name: 'Powdered Blood',
          qty: 10
        },
        {
          name: 'Necromantic Gem',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Destructive ',
    suffixTitle: ' of Shatter ',
    prefix: 'Gloves, Trinket',
    suffix: 'Belt, Weapon (Melee), Trinket',
    extra: null,
    group: 'Tactical',
    minLevelIncrease: null,
    stat: [
      1, 2, 3, 4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 9, 9, 9, 10, 10, 11, 11, 12, 12, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16,
      17
    ]
  },
  {
    name: 'Tendon Slice',
    enchantments: [
      {
        name: "On Hit: 6% chance to sloe target's movement by 50% for a short period of time",
        statModified: 'Slow Target Chance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 15
        },
        {
          name: 'Sparkling Dust',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 30
        },
        {
          name: 'Sparkling Dust',
          qty: 10
        },
        {
          name: 'Shamanic Totem',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Tendon Slice ',
    prefix: null,
    suffix: 'Gloves, Weapon (Melee), Weapon (Ranged), Trinket',
    extra: 'Goggles',
    group: 'Tactical',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12]
  },
  {
    name: 'Repair Amplification',
    enchantments: [
      {
        name: 'Enhancement bonus to Repair Amplification',
        statModified: 'Repair Amplification',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 15
        },
        {
          name: 'Signet of the Devourer',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 30
        },
        {
          name: 'Signet of the Devourer',
          qty: 10
        },
        {
          name: 'Shamanic Totem',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Repair Amplification ',
    prefix: null,
    suffix: 'Armor, Gloves, Trinket',
    extra: null,
    group: 'Healing Amplification',
    minLevelIncrease: null,
    stat: [
      4, 7, 8, 12, 14, 16, 17, 19, 21, 22, 24, 25, 27, 29, 30, 32, 33, 35, 37, 38, 40, 41, 43, 45, 46, 48, 49, 51, 53,
      54, 56, 57, 59, 61
    ]
  },
  {
    name: 'Healing Amplification',
    enchantments: [
      {
        name: 'Enhancement bonus to Healing Amplification',
        statModified: 'Healing Amplification',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 15
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 30
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 10
        },
        {
          name: 'Cryptmoss Queen',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Healing Amplification ',
    prefix: null,
    suffix: 'Armor, Gloves, Trinket',
    extra: null,
    group: 'Healing Amplification',
    minLevelIncrease: null,
    stat: [
      4, 7, 8, 12, 14, 16, 17, 19, 21, 22, 24, 25, 27, 29, 30, 32, 33, 35, 37, 38, 40, 41, 43, 45, 46, 48, 49, 51, 53,
      54, 56, 57, 59, 61
    ]
  },
  {
    name: 'Negative Amplification',
    enchantments: [
      {
        name: 'Profane bonus to your vulnerability to Negative spells and effects',
        statModified: 'Negative Energy Amplification',
        bonusType: 'Profane'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 15
        },
        {
          name: 'Cryptmoss',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 30
        },
        {
          name: 'Cryptmoss',
          qty: 10
        },
        {
          name: 'Intact Fingerbone',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Negative Healing Amplification ',
    prefix: null,
    suffix: 'Armor, Gloves, Trinket',
    extra: null,
    group: 'Healing Amplification',
    minLevelIncrease: null,
    stat: [
      4, 7, 8, 12, 14, 16, 17, 19, 21, 22, 24, 25, 27, 29, 30, 32, 33, 35, 37, 38, 40, 41, 43, 45, 46, 48, 49, 51, 53,
      54, 56, 57, 59, 61
    ]
  },
  {
    name: 'Corrosion',
    enchantments: [
      {
        name: 'Passive: Equipment bonus to Acid Spell Power',
        statModified: 'Acid Spell Power',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 15
        },
        {
          name: 'Mark of the Keeper',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 30
        },
        {
          name: 'Mark of the Keeper',
          qty: 10
        },
        {
          name: 'Luminescent Dust',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Corrosive ',
    suffixTitle: ' of Corrosion ',
    prefix: 'Gloves, Armor, Shield, Weapon (Melee), Weapon (Ranged), Trinket',
    suffix: 'Necklace, Rings, Trinket, Runearm',
    extra: null,
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      38, 43, 47, 55, 59, 63, 66, 70, 73, 77, 80, 84, 87, 90, 94, 97, 101, 104, 108, 111, 115, 118, 122, 125, 128, 132,
      135, 139, 142, 146, 149, 153, 156, 159
    ]
  },
  {
    name: 'Glaciation',
    enchantments: [
      {
        name: 'Passive: Equipment bonus to Cold Spell Power',
        statModified: 'Cold Spell Power',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 15
        },
        {
          name: 'Research Diary',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 30
        },
        {
          name: 'Research Diary',
          qty: 10
        },
        {
          name: 'Intact Fingerbone',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Glaciated ',
    suffixTitle: ' of Glaciation ',
    prefix: 'Gloves, Armor, Shield, Weapon (Melee), Weapon (Ranged), Trinket',
    suffix: 'Necklace, Rings, Trinket, Runearm',
    extra: null,
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      38, 43, 47, 55, 59, 63, 66, 70, 73, 77, 80, 84, 87, 90, 94, 97, 101, 104, 108, 111, 115, 118, 122, 125, 128, 132,
      135, 139, 142, 146, 149, 153, 156, 159
    ]
  },
  {
    name: 'Magnetism',
    enchantments: [
      {
        name: 'Passive: Equipment bonus to Electric Spell Power',
        statModified: 'Electric Spell Power',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 15
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 30
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 10
        },
        {
          name: 'Necromantic Gem',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Magnetic ',
    suffixTitle: ' of Magnetism ',
    prefix: 'Gloves, Armor, Shield, Weapon (Melee), Weapon (Ranged), Trinket',
    suffix: 'Necklace, Rings, Trinket, Runearm',
    extra: null,
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      38, 43, 47, 55, 59, 63, 66, 70, 73, 77, 80, 84, 87, 90, 94, 97, 101, 104, 108, 111, 115, 118, 122, 125, 128, 132,
      135, 139, 142, 146, 149, 153, 156, 159
    ]
  },
  {
    name: 'Combustion',
    enchantments: [
      {
        name: 'Passive: Equipment bonus to Fire Spell Power',
        statModified: 'Fire Spell Power',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Phoenix Tavern Purchase Order',
          qty: 15
        },
        {
          name: 'Powdered Blood',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Phoenix Tavern Purchase Order',
          qty: 30
        },
        {
          name: 'Powdered Blood',
          qty: 10
        },
        {
          name: 'Shamanic Totem',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Combustive ',
    suffixTitle: ' of Combustion ',
    prefix: 'Gloves, Armor, Shield, Weapon (Melee), Weapon (Ranged), Trinket',
    suffix: 'Necklace, Rings, Trinket, Runearm',
    extra: null,
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      38, 43, 47, 55, 59, 63, 66, 70, 73, 77, 80, 84, 87, 90, 94, 97, 101, 104, 108, 111, 115, 118, 122, 125, 128, 132,
      135, 139, 142, 146, 149, 153, 156, 159
    ]
  },
  {
    name: 'Resonance',
    enchantments: [
      {
        name: 'Passive: Equipment bonus to Sonic Spell Power',
        statModified: 'Sonic Spell Power',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 15
        },
        {
          name: 'Sparkling Dust',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 30
        },
        {
          name: 'Sparkling Dust',
          qty: 10
        },
        {
          name: 'Cryptmoss Queen',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Resonating ',
    suffixTitle: ' of Resonance ',
    prefix: 'Gloves, Armor, Shield, Weapon (Melee), Weapon (Ranged), Trinket',
    suffix: 'Necklace, Rings, Trinket, Runearm',
    extra: null,
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      38, 43, 47, 55, 59, 63, 66, 70, 73, 77, 80, 84, 87, 90, 94, 97, 101, 104, 108, 111, 115, 118, 122, 125, 128, 132,
      135, 139, 142, 146, 149, 153, 156, 159
    ]
  },
  {
    name: 'Impulse',
    enchantments: [
      {
        name: 'Passive: Equipment bonus to Force Spell Power',
        statModified: 'Force Spell Power',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 15
        },
        {
          name: 'Cryptmoss',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 30
        },
        {
          name: 'Cryptmoss',
          qty: 10
        },
        {
          name: 'Lush Cryptmoss',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Impulsive ',
    suffixTitle: ' of Impulse ',
    prefix: 'Gloves, Armor, Shield, Weapon (Melee), Weapon (Ranged), Trinket',
    suffix: 'Necklace, Rings, Trinket, Runearm',
    extra: null,
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      38, 43, 47, 55, 59, 63, 66, 70, 73, 77, 80, 84, 87, 90, 94, 97, 101, 104, 108, 111, 115, 118, 122, 125, 128, 132,
      135, 139, 142, 146, 149, 153, 156, 159
    ]
  },
  {
    name: 'Radiance',
    enchantments: [
      {
        name: 'Passive: Equipment bonus to Light Spell Power',
        statModified: 'Light Spell Power',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 15
        },
        {
          name: 'Cryptmoss Worm',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 30
        },
        {
          name: 'Cryptmoss Worm',
          qty: 10
        },
        {
          name: 'Tome: Stormreach Imports and Exports, 827YK',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Radiant ',
    suffixTitle: ' of Radiance ',
    prefix: 'Gloves, Armor, Shield, Weapon (Melee), Weapon (Ranged), Trinket',
    suffix: 'Necklace, Rings, Trinket, Runearm',
    extra: null,
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      38, 43, 47, 55, 59, 63, 66, 70, 73, 77, 80, 84, 87, 90, 94, 97, 101, 104, 108, 111, 115, 118, 122, 125, 128, 132,
      135, 139, 142, 146, 149, 153, 156, 159
    ]
  },
  {
    name: 'Devotion',
    enchantments: [
      {
        name: 'Passive: Equipment bonus to Positive Spell Power',
        statModified: 'Positive Spell Power',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 15
        },
        {
          name: 'Signet of the Devourer',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 30
        },
        {
          name: 'Signet of the Devourer',
          qty: 10
        },
        {
          name: "Tome: Myths of Old Xen'drik",
          qty: 2
        }
      ]
    },
    prefixTitle: 'Devoted ',
    suffixTitle: ' of Devotion ',
    prefix: 'Gloves, Armor, Shield, Weapon (Melee), Weapon (Ranged), Trinket',
    suffix: 'Necklace, Rings, Trinket, Runearm',
    extra: null,
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      38, 43, 47, 55, 59, 63, 66, 70, 73, 77, 80, 84, 87, 90, 94, 97, 101, 104, 108, 111, 115, 118, 122, 125, 128, 132,
      135, 139, 142, 146, 149, 153, 156, 159
    ]
  },
  {
    name: 'Nullification',
    enchantments: [
      {
        name: 'Passive: Equipment bonus to Negative Spell Power',
        statModified: 'Negative Spell Power',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 15
        },
        {
          name: 'Sparkling Dust',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 30
        },
        {
          name: 'Sparkling Dust',
          qty: 10
        },
        {
          name: 'Shamanic Totem',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Nullified ',
    suffixTitle: ' of Nullification ',
    prefix: 'Gloves, Armor, Shield, Weapon (Melee), Weapon (Ranged), Trinket',
    suffix: 'Necklace, Rings, Trinket, Runearm',
    extra: null,
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      38, 43, 47, 55, 59, 63, 66, 70, 73, 77, 80, 84, 87, 90, 94, 97, 101, 104, 108, 111, 115, 118, 122, 125, 128, 132,
      135, 139, 142, 146, 149, 153, 156, 159
    ]
  },
  {
    name: 'Reconstruction',
    enchantments: [
      {
        name: 'Passive: Equipment bonus to Repair &amp; Rust Spell Power',
        statModified: 'Repair &amp; Rust Spell Power',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 15
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 30
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 10
        },
        {
          name: 'Luminescent Dust',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Reconstructed ',
    suffixTitle: ' of Reconstruction ',
    prefix: 'Gloves, Armor, Shield, Weapon (Melee), Weapon (Ranged), Trinket',
    suffix: 'Necklace, Rings, Trinket, Runearm',
    extra: null,
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      38, 43, 47, 55, 59, 63, 66, 70, 73, 77, 80, 84, 87, 90, 94, 97, 101, 104, 108, 111, 115, 118, 122, 125, 128, 132,
      135, 139, 142, 146, 149, 153, 156, 159
    ]
  },
  {
    name: 'Bludgeon Effect',
    enchantments: [
      {
        name: 'Bludgeon damage',
        statModified: 'Weapon Damage (Bludgeon)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 15
        },
        {
          name: 'Cryptmoss Worm',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 30
        },
        {
          name: 'Cryptmoss Worm',
          qty: 10
        },
        {
          name: 'Luminescent Dust',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Bludgeoning ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Damage',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Piercing Effect',
    enchantments: [
      {
        name: 'Piercing damage',
        statModified: 'Weapon Damage (Piercing)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 15
        },
        {
          name: 'Cryptmoss',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 30
        },
        {
          name: 'Cryptmoss',
          qty: 10
        },
        {
          name: 'Intact Fingerbone',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Piercing ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Damage',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Slashing Effect',
    enchantments: [
      {
        name: 'Slashing damage',
        statModified: 'Weapon Damage (Slashing)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 15
        },
        {
          name: 'Sparkling Dust',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 30
        },
        {
          name: 'Sparkling Dust',
          qty: 10
        },
        {
          name: 'Necromantic Gem',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slashing ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Damage',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Acid Effect',
    enchantments: [
      {
        name: 'Acid damage',
        statModified: 'Weapon Damage (Acid)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Phoenix Tavern Purchase Order',
          qty: 15
        },
        {
          name: 'Powdered Blood',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Phoenix Tavern Purchase Order',
          qty: 30
        },
        {
          name: 'Powdered Blood',
          qty: 10
        },
        {
          name: 'Shamanic Totem',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Biting ',
    suffixTitle: null,
    prefix: 'Weapon (Melee), Weapon (Ranged)',
    suffix: null,
    extra: null,
    group: 'Damage',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Cold Effect',
    enchantments: [
      {
        name: 'Cold damage',
        statModified: 'Weapon Damage (Cold)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 15
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 30
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 10
        },
        {
          name: 'Cryptmoss Queen',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Chilled ',
    suffixTitle: null,
    prefix: 'Weapon (Melee), Weapon (Ranged)',
    suffix: null,
    extra: null,
    group: 'Damage',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Electric Effect',
    enchantments: [
      {
        name: 'Electric damage',
        statModified: 'Weapon Damage (Electric)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 15
        },
        {
          name: 'Research Diary',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 30
        },
        {
          name: 'Research Diary',
          qty: 10
        },
        {
          name: 'Lush Cryptmoss',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Shocking ',
    suffixTitle: null,
    prefix: 'Weapon (Melee), Weapon (Ranged)',
    suffix: null,
    extra: null,
    group: 'Damage',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Fire Effect',
    enchantments: [
      {
        name: 'Fire damage',
        statModified: 'Weapon Damage (Fire)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 15
        },
        {
          name: 'Mark of the Keeper',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 30
        },
        {
          name: 'Mark of the Keeper',
          qty: 10
        },
        {
          name: 'Tome: Stormreach Imports and Exports, 827YK',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Smoldering ',
    suffixTitle: null,
    prefix: 'Weapon (Melee), Weapon (Ranged)',
    suffix: null,
    extra: null,
    group: 'Damage',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Sonic Effect',
    enchantments: [
      {
        name: 'Sonic damage',
        statModified: 'Weapon Damage (Sonic)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 15
        },
        {
          name: 'Signet of the Devourer',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 30
        },
        {
          name: 'Signet of the Devourer',
          qty: 10
        },
        {
          name: "Tome: Myths of Old Xen'drik",
          qty: 2
        }
      ]
    },
    prefixTitle: 'Echoing ',
    suffixTitle: null,
    prefix: 'Weapon (Melee), Weapon (Ranged)',
    suffix: null,
    extra: null,
    group: 'Damage',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Light Effect',
    enchantments: [
      {
        name: 'Light damage',
        statModified: 'Weapon Damage (Light)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 15
        },
        {
          name: 'Mark of the Keeper',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 30
        },
        {
          name: 'Mark of the Keeper',
          qty: 10
        },
        {
          name: 'Cryptmoss Queen',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Blinding ',
    suffixTitle: null,
    prefix: 'Weapon (Melee), Weapon (Ranged)',
    suffix: null,
    extra: null,
    group: 'Damage',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Force Effect',
    enchantments: [
      {
        name: 'Force damage',
        statModified: 'Weapon Damage (Force)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 15
        },
        {
          name: 'Research Diary',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 30
        },
        {
          name: 'Research Diary',
          qty: 10
        },
        {
          name: 'Lush Cryptmoss',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Smashing ',
    suffixTitle: null,
    prefix: 'Weapon (Melee), Weapon (Ranged)',
    suffix: null,
    extra: null,
    group: 'Damage',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Negative Effect',
    enchantments: [
      {
        name: 'Negative Energy damage',
        statModified: 'Weapon Damage (Negative)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 15
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 30
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 10
        },
        {
          name: 'Tome: Stormreach Imports and Exports, 827YK',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Negating ',
    suffixTitle: null,
    prefix: 'Weapon (Melee), Weapon (Ranged)',
    suffix: null,
    extra: null,
    group: 'Damage',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Poison Effect',
    enchantments: [
      {
        name: 'Poison damage',
        statModified: 'Weapon Damage (Poison)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 15
        },
        {
          name: 'Powdered Blood',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 30
        },
        {
          name: 'Powdered Blood',
          qty: 10
        },
        {
          name: "Tome: Myths of Old Xen'drik",
          qty: 2
        }
      ]
    },
    prefixTitle: 'Venomous ',
    suffixTitle: null,
    prefix: 'Weapon (Melee), Weapon (Ranged)',
    suffix: null,
    extra: null,
    group: 'Damage',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Shield Spikes',
    enchantments: [
      {
        name: 'Piercing damage',
        statModified: 'Weapon Damage (Piercing)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 15
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 30
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 10
        },
        {
          name: 'Shamanic Totem',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Shield Spikes ',
    prefix: null,
    suffix: 'Shield',
    extra: null,
    group: 'Offense',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Bashing',
    enchantments: [
      {
        name: 'Bludgeon damage when using Shield Bash',
        statModified: 'Shield Bash Damage',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 15
        },
        {
          name: 'Sparkling Dust',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 30
        },
        {
          name: 'Sparkling Dust',
          qty: 10
        },
        {
          name: 'Luminescent Dust',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Bashing ',
    prefix: null,
    suffix: 'Shield',
    extra: null,
    group: 'Offense',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Aberration Bane',
    enchantments: [
      {
        name: 'Bane damage versus Aberrations',
        statModified: 'Weapon Bane Damage (Aberration)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 15
        },
        {
          name: 'Soul Gem: Aberration',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Aberration',
          qty: 1
        },
        {
          name: "Tome: Myths of Old Xen'drik",
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Animal Bane',
    enchantments: [
      {
        name: 'Bane damage versus Animals',
        statModified: 'Weapon Bane Damage (Animal)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 15
        },
        {
          name: 'Soul Gem: Animal',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Animal',
          qty: 1
        },
        {
          name: 'Tome: Stormreach Imports and Exports, 827YK',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Construct Bane',
    enchantments: [
      {
        name: 'Bane damage versus Constructs',
        statModified: 'Weapon Bane Damage (Construct)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 15
        },
        {
          name: 'Soul Gem: Living Construct',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Living Construct',
          qty: 1
        },
        {
          name: 'Lush Cryptmoss',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Dragon Bane',
    enchantments: [
      {
        name: 'Bane damage versus Dragons',
        statModified: 'Weapon Bane Damage (Dragon)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 15
        },
        {
          name: 'Cryptmoss',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Dragon',
          qty: 1
        },
        {
          name: 'Cryptmoss Queen',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Elemental Bane',
    enchantments: [
      {
        name: 'Bane damage versus Elementals',
        statModified: 'Weapon Bane Damage (Elemental)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Phoenix Tavern Purchase Order',
          qty: 15
        },
        {
          name: "'Wavecrasher' Cargo Manifest",
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Phoenix Tavern Purchase Order',
          qty: 30
        },
        {
          name: 'Shamanic Totem',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Giant Bane',
    enchantments: [
      {
        name: 'Bane damage versus Giants',
        statModified: 'Weapon Bane Damage (Giant)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 15
        },
        {
          name: 'Soul Gem: Giant',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Giant',
          qty: 1
        },
        {
          name: 'Necromantic Gem',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Dwarf Bane',
    enchantments: [
      {
        name: 'Bane damage versus Dwarves',
        statModified: 'Weapon Bane Damage (Dwarf)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 15
        },
        {
          name: 'Soul Gem: Dwarf',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Dwarf',
          qty: 1
        },
        {
          name: 'Luminescent Dust',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Elf Bane',
    enchantments: [
      {
        name: 'Bane damage versus Elves',
        statModified: 'Weapon Bane Damage (Elf)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 15
        },
        {
          name: 'Soul Gem: Elf',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Elf',
          qty: 1
        },
        {
          name: "Tome: Myths of Old Xen'drik",
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Goblinoid Bane',
    enchantments: [
      {
        name: 'Bane damage versus Goblinoids',
        statModified: 'Weapon Bane Damage (Goblinoid)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 15
        },
        {
          name: 'Soul Gem: Goblinoid',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Goblinoid',
          qty: 1
        },
        {
          name: 'Tome: Stormreach Imports and Exports, 827YK',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Gnoll Bane',
    enchantments: [
      {
        name: 'Bane damage versus Gnolls',
        statModified: 'Weapon Bane Damage (Gnoll)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 15
        },
        {
          name: 'Soul Gem: Gnoll',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Gnoll',
          qty: 1
        },
        {
          name: 'Lush Cryptmoss',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Halfling Bane',
    enchantments: [
      {
        name: 'Bane damage versus Halflings',
        statModified: 'Weapon Bane Damage (Halfling)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 15
        },
        {
          name: 'Soul Gem: Halfling',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Halfling',
          qty: 1
        },
        {
          name: 'Cryptmoss Queen',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Human Bane',
    enchantments: [
      {
        name: 'Bane damage versus Humans',
        statModified: 'Weapon Bane Damage (Human)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Phoenix Tavern Purchase Order',
          qty: 15
        },
        {
          name: 'Soul Gem: Human',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Phoenix Tavern Purchase Order',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Human',
          qty: 1
        },
        {
          name: 'Shamanic Totem',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Orc Bane',
    enchantments: [
      {
        name: 'Bane damage versus Orcs',
        statModified: 'Weapon Bane Damage (Orc)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 15
        },
        {
          name: 'Soul Gem: Orc',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Orc',
          qty: 1
        },
        {
          name: 'Necromantic Gem',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Reptilian Bane',
    enchantments: [
      {
        name: 'Bane damage versus Reptilians',
        statModified: 'Weapon Bane Damage (Reptilian)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 15
        },
        {
          name: 'Soul Gem: Reptilian Humanoid',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Reptilian Humanoid',
          qty: 1
        },
        {
          name: 'Intact Fingerbone',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Monstrous Humanoid Bane',
    enchantments: [
      {
        name: 'Bane damage versus Monstrous Humanoids',
        statModified: 'Weapon Bane Damage (Monstrous Humanoids)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 15
        },
        {
          name: 'Soul Gem: Monstrous Humanoid',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Cryptmoss Worm Larva',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Monstrous Humanoid',
          qty: 1
        },
        {
          name: "Tome: Myths of Old Xen'drik",
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Ooze Bane',
    enchantments: [
      {
        name: 'Bane damage versus Oozes',
        statModified: 'Weapon Bane Damage (Ooze)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 15
        },
        {
          name: 'Soul Gem: Ooze',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Withered Cryptmoss',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Ooze',
          qty: 1
        },
        {
          name: 'Tome: Stormreach Imports and Exports, 827YK',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Chaotic Outsider Bane',
    enchantments: [
      {
        name: 'Bane damage versus Chaotic Outsiders',
        statModified: 'Weapon Bane Damage (Chaotic Outsider)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 15
        },
        {
          name: 'Soul Gem: Essence of the Destroyer',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Funerary Token',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Essence of the Destroyer',
          qty: 1
        },
        {
          name: 'Lush Cryptmoss',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Evil Outsider Bane',
    enchantments: [
      {
        name: 'Bane damage versus Evil Outsiders',
        statModified: 'Weapon Bane Damage (Evil Outsider)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 15
        },
        {
          name: 'Soul Gem: Essence of the Dominator',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Blade of the Dark Six',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Essence of the Dominator',
          qty: 1
        },
        {
          name: 'Cryptmoss Queen',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Lawful Outsider Bane',
    enchantments: [
      {
        name: 'Bane damage versus Lawful Outsiders',
        statModified: 'Weapon Bane Damage (Lawful Outsider)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Phoenix Tavern Purchase Order',
          qty: 15
        },
        {
          name: 'Soul Gem: Essence of the Crusader',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Phoenix Tavern Purchase Order',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Essence of the Crusader',
          qty: 1
        },
        {
          name: 'Shamanic Totem',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Plant Bane',
    enchantments: [
      {
        name: 'Bane damage versus Plants',
        statModified: 'Weapon Bane Damage (Plant)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 15
        },
        {
          name: 'Soul Gem: Plant',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Plant',
          qty: 1
        },
        {
          name: 'Necromantic Gem',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Undead Bane',
    enchantments: [
      {
        name: 'Bane damage versus Undead',
        statModified: 'Weapon Bane Damage (Undead)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 15
        },
        {
          name: 'Soul Gem: Undead',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Glittering Dust',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Undead',
          qty: 1
        },
        {
          name: 'Intact Fingerbone',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Vermin Bane',
    enchantments: [
      {
        name: 'Bane damage versus Vermin',
        statModified: 'Weapon Bane Damage (Vermin)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 15
        },
        {
          name: 'Soul Gem: Vermin',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 30
        },
        {
          name: 'Soul Gem: Strong Vermin',
          qty: 1
        },
        {
          name: 'Luminescent Dust',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Unnatural Bane',
    enchantments: [
      {
        name: 'Bane damage versus Aberrations, Monstrous Humanoids, and Undead',
        statModified: [
          'Weapon Bane Damage (Aberration)',
          'Weapon Bane Damage (Monstrous Humanoid)',
          'Weapon Bane Damage (Undead)'
        ],
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 15
        },
        {
          name: 'Mark of the Keeper',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Caravan Logbook',
          qty: 30
        },
        {
          name: 'Cryptmoss Queen',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Incorporeal Bane',
    enchantments: [
      {
        name: 'Bane damage versus Incorporeals',
        statModified: 'Weapon Bane Damage (Incorporeal)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 50,
      essence: 50,
      purified: null,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 15
        },
        {
          name: 'Mark of the Keeper',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 200,
      essence: 400,
      purified: 2,
      collectible: [
        {
          name: 'Skull Fragment',
          qty: 30
        },
        {
          name: 'Shamanic Totem',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Slaying ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Bane',
    minLevelIncrease: null,
    stat: [
      '1d10',
      '1d10',
      '1d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '2d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '3d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '4d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '5d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '6d10',
      '7d10',
      '7d10'
    ]
  },
  {
    name: 'Charisma',
    enchantments: [
      {
        name: 'Enhancement bonus to Charisma',
        statModified: 'Charisma',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Romantic Sonnet',
          qty: 15
        },
        {
          name: 'Charred Soarwood',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Romantic Sonnet',
          qty: 30
        },
        {
          name: 'Charred Soarwood',
          qty: 10
        },
        {
          name: 'Elemental Ingot',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Alluring ',
    suffixTitle: ' of Charisma',
    prefix: 'Cloak, Ring, Trinket',
    suffix: 'Necklace, Trinket',
    extra: null,
    group: 'Ability',
    minLevelIncrease: null,
    stat: [
      1, 2, 2, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 14, 14, 14, 15
    ]
  },
  {
    name: 'Constitution',
    enchantments: [
      {
        name: 'Enhancement bonus to Constitution',
        statModified: 'Constitution',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Runic Parchment',
          qty: 15
        },
        {
          name: 'Glass Phial',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Runic Parchment',
          qty: 30
        },
        {
          name: 'Glass Phial',
          qty: 10
        },
        {
          name: 'Executioner Beetle',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Hardy ',
    suffixTitle: null,
    prefix: 'Armor, Rings, Trinket, Necklace, Belt',
    suffix: 'Bracers, Trinket',
    extra: null,
    group: 'Ability',
    minLevelIncrease: null,
    stat: [
      1, 2, 2, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 14, 14, 14, 15
    ]
  },
  {
    name: 'Dexterity',
    enchantments: [
      {
        name: 'Enhancement bonus to Dexterity',
        statModified: 'Dexterity',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Sour Darkcap',
          qty: 15
        },
        {
          name: 'Polished Ore',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Sour Darkcap',
          qty: 30
        },
        {
          name: 'Polished Ore',
          qty: 10
        },
        {
          name: 'Flowering Hellscap',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Nimble ',
    suffixTitle: ' of Dexterity ',
    prefix: 'Gloves, Boots, Trinket',
    suffix: 'Rings, Trinket',
    extra: null,
    group: 'Ability',
    minLevelIncrease: null,
    stat: [
      1, 2, 2, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 14, 14, 14, 15
    ]
  },
  {
    name: 'Intelligence',
    enchantments: [
      {
        name: 'Enhancement bonus to Intelligence',
        statModified: 'Intelligence',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Ceramic Bowl',
          qty: 15
        },
        {
          name: 'House-Sealed Letter',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Ceramic Bowl',
          qty: 30
        },
        {
          name: 'House-Sealed Letter',
          qty: 10
        },
        {
          name: 'Stellar Orb',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Astute ',
    suffixTitle: ' of Intelligence ',
    prefix: 'Helm, Goggles, Cloak, Trinket',
    suffix: 'Trinket',
    extra: null,
    group: 'Ability',
    minLevelIncrease: null,
    stat: [
      1, 2, 2, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 14, 14, 14, 15
    ]
  },
  {
    name: 'Strength',
    enchantments: [
      {
        name: 'Enhancement bonus to Strength',
        statModified: 'Strength',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Bruised Spore Pod',
          qty: 15
        },
        {
          name: 'Amulet of the Six',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Bruised Spore Pod',
          qty: 30
        },
        {
          name: 'Amulet of the Six',
          qty: 10
        },
        {
          name: 'Tome: Codes of the Aurum',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Mighty ',
    suffixTitle: ' of Strength ',
    prefix: 'Bracers, Trinket, Gloves',
    suffix: 'Trinket, Belt, Boots',
    extra: null,
    group: 'Ability',
    minLevelIncrease: null,
    stat: [
      1, 2, 2, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 14, 14, 14, 15
    ]
  },
  {
    name: 'Wisdom',
    enchantments: [
      {
        name: 'Enhancement bonus to Wisdom',
        statModified: 'Wisdom',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Singed Soarwood',
          qty: 15
        },
        {
          name: 'Silver Flame Hymnal',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Singed Soarwood',
          qty: 30
        },
        {
          name: 'Silver Flame Hymnal',
          qty: 10
        },
        {
          name: 'Lightning-Split Soarwood',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Prudent ',
    suffixTitle: ' of Wisdom ',
    prefix: 'Helm, Goggles, Cloak, Trinket',
    suffix: 'Trinket',
    extra: null,
    group: 'Ability',
    minLevelIncrease: null,
    stat: [
      1, 2, 2, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 14, 14, 14, 15
    ]
  },
  {
    name: 'Resistance',
    enchantments: [
      {
        name: 'Resistance bonus to Saves',
        statModified: ['Will Save', 'Reflex Save', 'Fortitude Save'],
        bonusType: 'Resistance'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Romantic Sonnet',
          qty: 15
        },
        {
          name: 'Fragrant Drowshood',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Romantic Sonnet',
          qty: 30
        },
        {
          name: 'Fragrant Drowshood',
          qty: 10
        },
        {
          name: 'Lightning-Split Soarwood',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Staunch ',
    suffixTitle: ' of Resistance ',
    prefix: 'Bracers, Trinket',
    suffix: 'Gloves, Helm, Trinket',
    extra: null,
    group: 'Save',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12]
  },
  {
    name: 'Doublestrike',
    enchantments: [
      {
        name: 'Enhancement bonus to Doublestrike chance',
        statModified: 'Doublestrike',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Small Planar Crystal',
          qty: 15
        },
        {
          name: 'Scholarly Notes',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Small Planar Crystal',
          qty: 30
        },
        {
          name: 'Scholarly Notes',
          qty: 10
        },
        {
          name: 'Elemental Ingot',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Hasty ',
    suffixTitle: ' of Doublestrike ',
    prefix: 'Belt, Gloves, Trinket',
    suffix: 'Weapon (Melee)',
    extra: null,
    group: 'Offense',
    minLevelIncrease: null,
    stat: [
      2, 2, 3, 4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 9, 9, 9, 10, 10, 11, 11, 12, 12, 12, 13, 13, 14, 14, 15, 15, 15, 16, 16,
      17
    ]
  },
  {
    name: 'Doubleshot',
    enchantments: [
      {
        name: 'Enhancement bonus to Doubleshot chance',
        statModified: 'Doubleshot',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Lodestone',
          qty: 15
        },
        {
          name: 'Headsman Beetle',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Lodestone',
          qty: 30
        },
        {
          name: 'Headsman Beetle',
          qty: 10
        },
        {
          name: 'Flowering Hellscap',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Hasty ',
    suffixTitle: ' of Doubleshot ',
    prefix: 'Belt, Gloves, Trinket',
    suffix: 'Weapon (Ranged)',
    extra: null,
    group: 'Offense',
    minLevelIncrease: null,
    stat: [1, 1, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9]
  },
  {
    name: 'Spell Focus Mastery',
    enchantments: [
      {
        name: 'Equipment bonus to DC of all Spells',
        statModified: 'Spell DC',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Bruised Spore Pod',
          qty: 15
        },
        {
          name: 'Amulet of the Six',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 275,
      essence: 550,
      purified: 2,
      collectible: [
        {
          name: 'Bruised Spore Pod',
          qty: 30
        },
        {
          name: 'Amulet of the Six',
          qty: 10
        },
        {
          name: 'Planar Talisman',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Spell Focus ',
    prefix: null,
    suffix: 'Helm, Trinket',
    extra: null,
    group: 'Spell DC',
    minLevelIncrease: null,
    stat: [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5]
  },
  {
    name: 'Assassinate',
    enchantments: [
      {
        name: "Enhancement bonus to character's Assassinate attempts",
        statModified: 'Assassinate',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Small Planar Crystal',
          qty: 15
        },
        {
          name: 'Planar Spoor',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Small Planar Crystal',
          qty: 30
        },
        {
          name: 'Planar Spoor',
          qty: 10
        },
        {
          name: 'Crystal Decanter',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Murderous ',
    suffixTitle: ' of Assassinate ',
    prefix: 'Gloves, Trinket',
    suffix: 'Rings, Trinket, Weapon (Melee), Weapon (Ranged)',
    extra: 'Belt, Goggles',
    group: 'Tactical',
    minLevelIncrease: null,
    stat: [1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 7, 7]
  },
  {
    name: 'Combat Mastery',
    enchantments: [
      {
        name: "Enhancement bonus to character's Trip, Improved Trip, Sunder, Improved Sunder, Stunning Blow, and Stunning Fist attempts",
        statModified: ['Trip', 'Improved Trip', 'Sunder', 'Improved Sunder', 'Stunning Blow', 'Stunning Fist'],
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Singed Soarwood',
          qty: 15
        },
        {
          name: 'Moonstone',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Singed Soarwood',
          qty: 30
        },
        {
          name: 'Moonstone',
          qty: 10
        },
        {
          name: 'Elemental Ingot',
          qty: 2
        }
      ]
    },
    prefixTitle: "Warrior's ",
    suffixTitle: ' of Combat Mastery ',
    prefix: 'Boots, Trinket, Armor, Shield',
    suffix: 'Trinket',
    extra: null,
    group: 'Tactical',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12]
  },
  {
    name: 'Strength Damaging Effect',
    enchantments: [
      {
        name: 'On Critical Hit: Deal extra Strength damage to your target',
        statModified: 'Strength Damage Chance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Singed Soarwood',
          qty: 15
        },
        {
          name: 'Scholarly Notes',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Singed Soarwood',
          qty: 30
        },
        {
          name: 'Scholarly Notes',
          qty: 10
        },
        {
          name: 'Tome: Codes of the Aurum',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Weapon (Melee), Weapon (Ranged)',
    group: 'Stat damage',
    minLevelIncrease: null,
    stat: [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4]
  },
  {
    name: 'Dexterity Damaging Effect',
    enchantments: [
      {
        name: 'On Critical Hit: Deal extra Dexterity damage to your target',
        statModified: 'Dexterity Damage Chance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Lodestone',
          qty: 15
        },
        {
          name: 'Intact Spore Pod',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Lodestone',
          qty: 30
        },
        {
          name: 'Intact Spore Pod',
          qty: 10
        },
        {
          name: 'Flowering Spore Pod',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Weapon (Melee), Weapon (Ranged)',
    group: 'Stat damage',
    minLevelIncrease: null,
    stat: [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4]
  },
  {
    name: 'Constitution Damaging Effect',
    enchantments: [
      {
        name: 'On Critical Hit: Deal extra Constitution damage to your target',
        statModified: 'Constitution Damage Chance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Amulet of the Lost Empire',
          qty: 15
        },
        {
          name: 'Fragrant Drowshood',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Amulet of the Lost Empire',
          qty: 30
        },
        {
          name: 'Fragrant Drowshood',
          qty: 10
        },
        {
          name: 'Flowering Hellscap',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Weapon (Melee), Weapon (Ranged)',
    group: 'Stat damage',
    minLevelIncrease: null,
    stat: [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4]
  },
  {
    name: 'Intelligence Damaging Effect',
    enchantments: [
      {
        name: 'On Critical Hit: Deal extra Intelligence damage to your target',
        statModified: 'Intelligence Damage Chance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 15
        },
        {
          name: 'Headsman Beetle',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 30
        },
        {
          name: 'Headsman Beetle',
          qty: 10
        },
        {
          name: 'Executioner Beetle',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Weapon (Melee), Weapon (Ranged)',
    group: 'Stat damage',
    minLevelIncrease: null,
    stat: [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4]
  },
  {
    name: 'Wisdom Damaging Effect',
    enchantments: [
      {
        name: 'On Critical Hit: Deal extra Wisdom damage to your target',
        statModified: 'Wisdom Damage Chance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Small Planar Crystal',
          qty: 15
        },
        {
          name: 'Amulet of the Six',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Small Planar Crystal',
          qty: 30
        },
        {
          name: 'Amulet of the Six',
          qty: 10
        },
        {
          name: 'Amulet of the Archbishop',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Weapon (Melee), Weapon (Ranged)',
    group: 'Stat damage',
    minLevelIncrease: null,
    stat: [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4]
  },
  {
    name: 'Charisma Damaging Effect',
    enchantments: [
      {
        name: 'On Critical Hit: Deal extra Charisma damage to your target',
        statModified: 'Charisma Damage Chance',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Bruised Spore Pod',
          qty: 15
        },
        {
          name: 'Polished Ore',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Bruised Spore Pod',
          qty: 30
        },
        {
          name: 'Polished Ore',
          qty: 10
        },
        {
          name: 'Elemental Ingot',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Weapon (Melee), Weapon (Ranged)',
    group: 'Stat damage',
    minLevelIncrease: null,
    stat: [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4]
  },
  {
    name: 'Potency',
    enchantments: [
      {
        name: 'Passive: Equipment bonus to each Spell Power',
        statModified: 'Universal Spell Power',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Sour Darkcap',
          qty: 15
        },
        {
          name: 'Planar Spoor',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Sour Darkcap',
          qty: 30
        },
        {
          name: 'Planar Spoor',
          qty: 10
        },
        {
          name: 'Tome: Lost Songs of Cyre',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Potency ',
    prefix: null,
    suffix: 'Gloves, Trinket',
    extra: null,
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      16, 20, 23, 29, 33, 36, 38, 41, 44, 46, 49, 52, 55, 57, 60, 63, 65, 68, 71, 73, 76, 79, 82, 84, 87, 90, 92, 95,
      98, 100, 103, 106, 109, 111
    ]
  },
  {
    name: 'Good Effect',
    enchantments: [
      {
        name: 'Good damage',
        statModified: 'Weapon Damage (Good)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Lodestone',
          qty: 15
        },
        {
          name: 'Glass Phial',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Lodestone',
          qty: 30
        },
        {
          name: 'Glass Phial',
          qty: 10
        },
        {
          name: 'Stellar Orb',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: 'Weapon (Melee), Weapon (Ranged)',
    suffix: null,
    extra: null,
    group: 'Damage',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Evil Effect',
    enchantments: [
      {
        name: 'Evil damage',
        statModified: 'Weapon Damage (Evil)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Amulet of the Lost Empire',
          qty: 15
        },
        {
          name: 'Charred Soarwood',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Amulet of the Lost Empire',
          qty: 30
        },
        {
          name: 'Charred Soarwood',
          qty: 10
        },
        {
          name: 'Lightning-Split Soarwood',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: 'Weapon (Melee), Weapon (Ranged)',
    suffix: null,
    extra: null,
    group: 'Damage',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Law Effect',
    enchantments: [
      {
        name: 'Law damage',
        statModified: 'Weapon Damage (Law)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 15
        },
        {
          name: 'Moonstone',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 30
        },
        {
          name: 'Moonstone',
          qty: 10
        },
        {
          name: 'Crystal Decanter',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: 'Weapon (Melee), Weapon (Ranged)',
    suffix: null,
    extra: null,
    group: 'Damage',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Chaos Effect',
    enchantments: [
      {
        name: 'Chaos damage',
        statModified: 'Weapon Damage (Chaos)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Small Planar Crystal',
          qty: 15
        },
        {
          name: 'Silver Flame Hymnal',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Small Planar Crystal',
          qty: 30
        },
        {
          name: 'Silver Flame Hymnal',
          qty: 10
        },
        {
          name: 'Elemental Ingot',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: 'Weapon (Melee), Weapon (Ranged)',
    suffix: null,
    extra: null,
    group: 'Damage',
    minLevelIncrease: null,
    stat: [
      '1d6',
      '1d6',
      '1d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '2d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '3d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '4d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '5d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '6d6',
      '7d6',
      '7d6'
    ]
  },
  {
    name: 'Acid Lore',
    enchantments: [
      {
        name: 'Equipment bonus to Acid Spells chance to Critical Hit',
        statModified: 'Spell Critical Chance (Acid)',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Duskbrood Trumpeter',
          qty: 15
        },
        {
          name: 'Polished Ore',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Duskbrood Trumpeter',
          qty: 30
        },
        {
          name: 'Polished Ore',
          qty: 10
        },
        {
          name: 'Tome: History of The Houses',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Dire Corrosive ',
    suffixTitle: ' of Acid Lore ',
    prefix: 'Rings, Trinket, Runearm',
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Spell Critical Chance',
    minLevelIncrease: null,
    stat: [
      6, 6, 7, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21,
      22, 22, 23, 23
    ]
  },
  {
    name: 'Cold Lore',
    enchantments: [
      {
        name: 'Equipment bonus to Cold Spells chance to Critical Hit',
        statModified: 'Spell Critical Chance (Cold)',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Lodestone',
          qty: 15
        },
        {
          name: 'Charred Soarwood',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Lodestone',
          qty: 30
        },
        {
          name: 'Charred Soarwood',
          qty: 10
        },
        {
          name: 'Tome: Lost Songs of Cyre',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Dire Glaciated ',
    suffixTitle: ' of Cold Lore ',
    prefix: 'Rings, Trinket, Runearm',
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Spell Critical Chance',
    minLevelIncrease: null,
    stat: [
      6, 6, 7, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21,
      22, 22, 23, 23
    ]
  },
  {
    name: 'Electricity Lore',
    enchantments: [
      {
        name: 'Equipment bonus to Electric Spells chance to Critical Hit',
        statModified: 'Spell Critical Chance (Electric)',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Small Planar Crystal',
          qty: 15
        },
        {
          name: 'Silver Flame Hymnal',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Small Planar Crystal',
          qty: 30
        },
        {
          name: 'Silver Flame Hymnal',
          qty: 10
        },
        {
          name: 'Tome: Codes of the Aurum',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Dire Magnetic ',
    suffixTitle: ' of Lightning Lore ',
    prefix: 'Rings, Trinket, Runearm',
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Spell Critical Chance',
    minLevelIncrease: null,
    stat: [
      6, 6, 7, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21,
      22, 22, 23, 23
    ]
  },
  {
    name: 'Fire Lore',
    enchantments: [
      {
        name: 'Equipment bonus to Fire Spells chance to Critical Hit',
        statModified: 'Spell Critical Chance (Fire)',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Sour Darkcap',
          qty: 15
        },
        {
          name: 'Fragrant Drowshood',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Sour Darkcap',
          qty: 30
        },
        {
          name: 'Fragrant Drowshood',
          qty: 10
        },
        {
          name: 'Flowering Spore Pod',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Dire Combustive ',
    suffixTitle: ' of Fire Lore ',
    prefix: 'Rings, Trinket, Runearm',
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Spell Critical Chance',
    minLevelIncrease: null,
    stat: [
      6, 6, 7, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21,
      22, 22, 23, 23
    ]
  },
  {
    name: 'Force Lore',
    enchantments: [
      {
        name: 'Equipment bonus to Force Spells chance to Critical Hit',
        statModified: 'Spell Critical Chance (Force)',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Romantic Sonnet',
          qty: 15
        },
        {
          name: 'Planar Spoor',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Romantic Sonnet',
          qty: 30
        },
        {
          name: 'Planar Spoor',
          qty: 10
        },
        {
          name: 'Flowering Hellscap',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Dire Impulsive ',
    suffixTitle: ' of Kinetic Lore ',
    prefix: 'Rings, Trinket, Runearm',
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Spell Critical Chance',
    minLevelIncrease: null,
    stat: [
      6, 6, 7, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21,
      22, 22, 23, 23
    ]
  },
  {
    name: 'Light Lore',
    enchantments: [
      {
        name: 'Equipment bonus to Light Spells chance to Critical Hit',
        statModified: 'Spell Critical Chance (Light)',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Singed Soarwood',
          qty: 15
        },
        {
          name: 'Moonstone',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Singed Soarwood',
          qty: 30
        },
        {
          name: 'Moonstone',
          qty: 10
        },
        {
          name: 'Executioner Beetle',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Dire Radiant ',
    suffixTitle: ' of Radiance Lore ',
    prefix: 'Rings, Trinket, Runearm',
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Spell Critical Chance',
    minLevelIncrease: null,
    stat: [
      6, 6, 7, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21,
      22, 22, 23, 23
    ]
  },
  {
    name: 'Negative Lore',
    enchantments: [
      {
        name: 'Equipment bonus to Negative Spells chance to Critical Hit',
        statModified: 'Spell Critical Chance (Negative)',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 15
        },
        {
          name: 'Scholarly Notes',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 30
        },
        {
          name: 'Scholarly Notes',
          qty: 10
        },
        {
          name: 'Amulet of the Archbishop',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Dire Nullified ',
    suffixTitle: ' of Void Lore ',
    prefix: 'Rings, Trinket, Runearm',
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Spell Critical Chance',
    minLevelIncrease: null,
    stat: [
      6, 6, 7, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21,
      22, 22, 23, 23
    ]
  },
  {
    name: 'Positive Lore',
    enchantments: [
      {
        name: 'Equipment bonus to Positive Spells chance to Critical Hit',
        statModified: 'Spell Critical Chance (Positive)',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Runic Parchment',
          qty: 15
        },
        {
          name: 'Headsman Beetle',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Runic Parchment',
          qty: 30
        },
        {
          name: 'Headsman Beetle',
          qty: 10
        },
        {
          name: 'Elemental Ingot',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Dire Devoted ',
    suffixTitle: ' of Healing Lore ',
    prefix: 'Rings, Trinket, Runearm',
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Spell Critical Chance',
    minLevelIncrease: null,
    stat: [
      6, 6, 7, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21,
      22, 22, 23, 23
    ]
  },
  {
    name: 'Repair Lore',
    enchantments: [
      {
        name: 'Equipment bonus to Repair &amp; Rust Spells chance to Critical Hit',
        statModified: 'Spell Critical Chance (Repair &amp; Rust)',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Bruised Spore Pod',
          qty: 15
        },
        {
          name: 'Amulet of the Six',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Bruised Spore Pod',
          qty: 30
        },
        {
          name: 'Amulet of the Six',
          qty: 10
        },
        {
          name: 'Amulet of the Archbishop',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Dire Reconstructed ',
    suffixTitle: ' of Repair lore ',
    prefix: 'Rings, Trinket, Runearm',
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Spell Critical Chance',
    minLevelIncrease: null,
    stat: [
      6, 6, 7, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21,
      22, 22, 23, 23
    ]
  },
  {
    name: 'Sonic Lore',
    enchantments: [
      {
        name: 'Equipment bonus to Sonic Spells chance to Critical Hit',
        statModified: 'Spell Critical Chance (Sonic)',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Amulet of the Lost Empire',
          qty: 15
        },
        {
          name: 'House-Sealed Letter',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Amulet of the Lost Empire',
          qty: 30
        },
        {
          name: 'House-Sealed Letter',
          qty: 10
        },
        {
          name: 'Crystal Decanter',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Dire Resonating ',
    suffixTitle: ' of Sonic Lore ',
    prefix: 'Rings, Trinket, Runearm',
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Spell Critical Chance',
    minLevelIncrease: null,
    stat: [
      6, 6, 7, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21,
      22, 22, 23, 23
    ]
  },
  {
    name: 'Spell Saves',
    enchantments: [
      {
        name: 'Resistance bonus saves versus Spells',
        statModified: 'Spell Saves',
        bonusType: 'Resistance'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Amulet of the Lost Empire',
          qty: 15
        },
        {
          name: 'Intact Spore Pod',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Amulet of the Lost Empire',
          qty: 30
        },
        {
          name: 'Intact Spore Pod',
          qty: 10
        },
        {
          name: 'Stellar Orb',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Realistic ',
    suffixTitle: null,
    prefix: 'Bracers, Cloak, Necklace, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Save',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12]
  },
  {
    name: 'Ranged Alacrity',
    enchantments: [
      {
        name: 'Enhancement bonus to Ranged Attack Speed',
        statModified: 'Ranged Attack Speed',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Bruised Spore Pod',
          qty: 15
        },
        {
          name: 'Amulet of the Six',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: null,
      collectible: [
        {
          name: 'Bruised Spore Pod',
          qty: 2
        },
        {
          name: 'Amulet of the Six',
          qty: 10
        }
      ]
    },
    prefixTitle: 'Rapid ',
    suffixTitle: ' of Alacrity ',
    prefix: 'Gloves, Trinket, Weapon (Ranged), Runearm',
    suffix: 'Goggles, Trinket',
    extra: null,
    group: 'Offense',
    minLevelIncrease: null,
    stat: [
      1, 2, 2, 4, 4, 5, 5, 6, 6, 7, 8, 9, 9, 10, 11, 12, 12, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
      15, 15
    ]
  },
  {
    name: 'Melee Alacrity',
    enchantments: [
      {
        name: 'Enhancement bonus to Melee Attack Speed',
        statModified: 'Melee Attack Speed',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Sour Darkcap',
          qty: 15
        },
        {
          name: 'Fragrant Drowshood',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: null,
      collectible: [
        {
          name: 'Sour Darkcap',
          qty: 1
        },
        {
          name: 'Fragrant Drowshood',
          qty: 10
        }
      ]
    },
    prefixTitle: 'Rapid ',
    suffixTitle: ' of Alacrity ',
    prefix: 'Gloves, Trinket, Weapon (Melee), Runearm',
    suffix: 'Goggles, Trinket',
    extra: null,
    group: 'Offense',
    minLevelIncrease: null,
    stat: [
      1, 2, 2, 4, 4, 5, 5, 6, 6, 7, 8, 9, 9, 10, 11, 12, 12, 13, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
      15, 15
    ]
  },
  {
    name: 'Striding',
    enchantments: [
      {
        name: 'Enhancement bonus to Movement Speed',
        statModified: 'Movement Speed',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 100,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Lodestone',
          qty: 15
        },
        {
          name: 'Silver Flame Hymnal',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: null,
      collectible: [
        {
          name: 'Lodestone',
          qty: 2
        },
        {
          name: 'Silver Flame Hymnal',
          qty: 10
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: 'Boots, Rings, Trinket',
    suffix: null,
    extra: null,
    group: 'Movement Speed',
    minLevelIncrease: null,
    stat: [
      3, 4, 5, 8, 9, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 24, 25, 27, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
      30, 30, 30, 30
    ]
  },
  {
    name: 'Spell Lore',
    enchantments: [
      {
        name: 'Equipment bonus to all Spells chance to Critical Hit',
        statModified: 'Spell Critical Chance',
        bonusType: 'Equipment'
      }
    ],
    bound: {
      level: 150,
      essence: 150,
      purified: null,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 15
        },
        {
          name: 'Academic Treatise',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 300,
      essence: 600,
      purified: 2,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 30
        },
        {
          name: 'Academic Treatise',
          qty: 10
        },
        {
          name: 'Scarlet Cryptmoss',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Spell Lore ',
    prefix: null,
    suffix: 'Gloves, Trinket',
    extra: null,
    group: 'Spell Critical Chance',
    minLevelIncrease: null,
    stat: [
      1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13
    ]
  },
  {
    name: 'Keen',
    enchantments: [
      {
        name: 'Increase Critical Threat Range of Weapon',
        statModified: 'Weapon Critical Range',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Singed Soarwood',
          qty: 15
        },
        {
          name: 'Scholarly Notes',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Singed Soarwood',
          qty: 30
        },
        {
          name: 'Scholarly Notes',
          qty: 10
        },
        {
          name: 'Tome: Codes of the Aurum',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Keen ',
    suffixTitle: null,
    prefix: null,
    suffix: 'Weapon',
    extra: null,
    group: 'Static',
    minLevelIncrease: '?',
    stat: ['Verify']
  },
  {
    name: 'Vampirism',
    enchantments: [
      {
        name: 'On Hit: 1d2 Hit Points recovered',
        statModified: 'Hit Point Recovery',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Lodestone',
          qty: 15
        },
        {
          name: 'Intact Spore Pod',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Lodestone',
          qty: 30
        },
        {
          name: 'Intact Spore Pod',
          qty: 10
        },
        {
          name: 'Flowering Spore Pod',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Weapon (Melee), Weapon (Ranged)',
    group: 'Hit Points',
    minLevelIncrease: null,
    stat: [
      '1d2',
      '1d2',
      '1d2',
      '1d2',
      '1d2',
      '1d2',
      '1d2',
      '1d2',
      '1d2',
      '1d2',
      '1d2',
      '1d2',
      '2d2',
      '2d2',
      '2d2',
      '2d2',
      '2d2',
      '2d2',
      '2d2',
      '2d2',
      '2d2',
      '2d2',
      '2d2',
      '2d2',
      '2d2',
      '2d2',
      '2d2',
      '2d2',
      '2d2',
      '3d2',
      '3d2',
      '3d2',
      '3d2',
      '3d2'
    ]
  },
  {
    name: 'Vitality',
    enchantments: [
      {
        name: 'Vitality bonus to Maximum Hit Points',
        statModified: 'Maximum Hit Points',
        bonusType: 'Vitality'
      }
    ],
    bound: {
      level: 250,
      essence: 100,
      purified: null,
      collectible: [
        {
          name: 'Amulet of the Lost Empire',
          qty: 15
        },
        {
          name: 'Fragrant Drowshood',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 250,
      essence: 500,
      purified: 2,
      collectible: [
        {
          name: 'Amulet of the Lost Empire',
          qty: 30
        },
        {
          name: 'Fragrant Drowshood',
          qty: 10
        },
        {
          name: 'Flowering Hellscap',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: 'Armor',
    suffix: null,
    extra: null,
    group: 'Hit Points',
    minLevelIncrease: null,
    stat: [
      4, 6, 7, 10, 12, 13, 15, 16, 17, 19, 20, 21, 23, 24, 25, 27, 28, 29, 31, 32, 33, 35, 36, 37, 39, 40, 41, 43, 44,
      45, 47, 48, 49, 51
    ]
  },
  {
    name: 'Insightful Wizardry',
    enchantments: [
      {
        name: 'Insight bonus to Maximum Spell Points',
        statModified: 'Maximum Spell Points',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Ruddy Fungus',
          qty: 15
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Ruddy Fungus',
          qty: 30
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 10
        },
        {
          name: 'Oceanic Sphere',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Wizardry ',
    prefix: null,
    suffix: 'Necklace',
    extra: null,
    group: 'Spell Points',
    minLevelIncrease: null,
    stat: [
      9, 16, 20, 30, 35, 39, 44, 48, 52, 56, 60, 64, 68, 72, 77, 81, 85, 89, 93, 97, 101, 105, 110, 114, 118, 122, 126,
      130, 134, 138, 143, 147, 151, 155
    ]
  },
  {
    name: 'Insightful Poison Ward',
    enchantments: [
      {
        name: 'Grants Immunity to Natural poisons.',
        statModified: 'Natural Poison immunity',
        bonusType: 'Resistance'
      },
      {
        name: 'Insight bonus to Saving Throws against Magical Poisons',
        statModified: 'Fortitude Save (Poison)',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 15
        },
        {
          name: 'Academic Treatise',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 30
        },
        {
          name: 'Academic Treatise',
          qty: 10
        },
        {
          name: "Tome: Alchemist's Chapbook",
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Necklace, Rings, Trinket',
    group: 'Save',
    minLevelIncrease: null,
    stat: [0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5]
  },
  {
    name: 'Insightful Disease Ward',
    enchantments: [
      {
        name: 'Grants Immunity to Natural Diseases.',
        statModified: 'Natural Disease immunity',
        bonusType: 'Resistance'
      },
      {
        name: 'Insight bonus to Saving Throws against Magical Diseases',
        statModified: 'Fortitude Save (Disease)',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Chipped Bone Talisman',
          qty: 15
        },
        {
          name: 'Bloodfeast Fungus',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Chipped Bone Talisman',
          qty: 30
        },
        {
          name: 'Bloodfeast Fungus',
          qty: 10
        },
        {
          name: 'Sanguine Moth',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Necklace, Rings, Trinket',
    group: 'Save',
    minLevelIncrease: null,
    stat: [0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5]
  },
  {
    name: 'Natural Armor',
    enchantments: [
      {
        name: 'Natural Armor bonus to Armor Class',
        statModified: 'Armor Class',
        bonusType: 'Natural Armor'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: null,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 15
        },
        {
          name: 'Academic Treatise',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 2,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 30
        },
        {
          name: 'Academic Treatise',
          qty: 10
        },
        {
          name: 'Oceanic Sphere',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Natural Armor Bonus ',
    prefix: null,
    suffix: 'Belt, Cloak, Necklace, Trinket, Runearm',
    extra: null,
    group: 'Defense',
    minLevelIncrease: null,
    stat: [
      1, 2, 2, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 14, 14, 14, 15
    ]
  },
  {
    name: 'Insightful Fire Resistance',
    enchantments: [
      {
        name: 'Insight bonus to Resist Fire',
        statModified: 'Fire Resistance',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 15
        },
        {
          name: 'Silver Bowl',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 30
        },
        {
          name: 'Silver Bowl',
          qty: 10
        },
        {
          name: 'Glowmoss Clump',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Charred ',
    suffixTitle: ' of Fire Resistance',
    prefix: 'Bracers',
    suffix: 'Cloak',
    extra: 'Trinket, Armor, Shield',
    group: 'Resist',
    minLevelIncrease: null,
    stat: [
      1, 2, 4, 5, 6, 6, 7, 8, 9, 10, 11, 11, 12, 13, 14, 14, 15, 16, 17, 17, 18, 19, 20, 20, 21, 22, 23, 23, 24, 25, 26,
      27, 27, 28
    ]
  },
  {
    name: 'Insightful Cold Resistance',
    enchantments: [
      {
        name: 'Insight bonus to Resist Cold',
        statModified: 'Cold Resistance',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Ruddy Fungus',
          qty: 15
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Ruddy Fungus',
          qty: 30
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 10
        },
        {
          name: 'Oceanic Sphere',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Frigid ',
    suffixTitle: ' of Cold Resistance ',
    prefix: 'Bracers',
    suffix: 'Cloak',
    extra: 'Trinket, Armor, Shield',
    group: 'Resist',
    minLevelIncrease: null,
    stat: [
      1, 2, 4, 5, 6, 6, 7, 8, 9, 10, 11, 11, 12, 13, 14, 14, 15, 16, 17, 17, 18, 19, 20, 20, 21, 22, 23, 23, 24, 25, 26,
      27, 27, 28
    ]
  },
  {
    name: 'Insightful Acid Resistance',
    enchantments: [
      {
        name: 'Insight bonus to Resist Acid',
        statModified: 'Acid Resistance',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 15
        },
        {
          name: 'Academic Treatise',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 30
        },
        {
          name: 'Academic Treatise',
          qty: 10
        },
        {
          name: 'Ritual Athame',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Alkalescent ',
    suffixTitle: ' of Acid Resistance ',
    prefix: 'Bracers',
    suffix: 'Cloak',
    extra: 'Trinket, Armor, Shield',
    group: 'Resist',
    minLevelIncrease: null,
    stat: [
      1, 2, 4, 5, 6, 6, 7, 8, 9, 10, 11, 11, 12, 13, 14, 14, 15, 16, 17, 17, 18, 19, 20, 20, 21, 22, 23, 23, 24, 25, 26,
      27, 27, 28
    ]
  },
  {
    name: 'Insightful Electric Resistance',
    enchantments: [
      {
        name: 'Insight bonus to Resist Electric',
        statModified: 'Electric Resistance',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Chipped Bone Talisman',
          qty: 15
        },
        {
          name: 'Bloodfeast Fungus',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Chipped Bone Talisman',
          qty: 30
        },
        {
          name: 'Bloodfeast Fungus',
          qty: 10
        },
        {
          name: 'Tear of Vulkoor',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Grounded ',
    suffixTitle: ' of Electric Resistance ',
    prefix: 'Bracers',
    suffix: 'Cloak',
    extra: 'Trinket, Armor, Shield',
    group: 'Resist',
    minLevelIncrease: null,
    stat: [
      1, 2, 4, 5, 6, 6, 7, 8, 9, 10, 11, 11, 12, 13, 14, 14, 15, 16, 17, 17, 18, 19, 20, 20, 21, 22, 23, 23, 24, 25, 26,
      27, 27, 28
    ]
  },
  {
    name: 'Insightful Sonic Resistance',
    enchantments: [
      {
        name: 'Insight bonus to Resist Sonic',
        statModified: 'Sonic Resistance',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 15
        },
        {
          name: 'Bloodfeast Fungus',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 30
        },
        {
          name: 'Bloodfeast Fungus',
          qty: 10
        },
        {
          name: 'Sanguine Moth',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Muffled ',
    suffixTitle: ' of Sonic Resistance ',
    prefix: 'Bracers',
    suffix: 'Cloak',
    extra: 'Trinket, Armor, Shield',
    group: 'Resist',
    minLevelIncrease: null,
    stat: [
      1, 2, 4, 5, 6, 6, 7, 8, 9, 10, 11, 11, 12, 13, 14, 14, 15, 16, 17, 17, 18, 19, 20, 20, 21, 22, 23, 23, 24, 25, 26,
      27, 27, 28
    ]
  },
  {
    name: 'Insightful Light Resistance',
    enchantments: [
      {
        name: 'Insight bonus to Resist Light',
        statModified: 'Light Resistance',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Ruddy Fungus',
          qty: 15
        },
        {
          name: 'Silver Bowl',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Ruddy Fungus',
          qty: 30
        },
        {
          name: 'Silver Bowl',
          qty: 10
        },
        {
          name: "Tome: Alchemist's Chapbook",
          qty: 5
        }
      ]
    },
    prefixTitle: 'Murky ',
    suffixTitle: ' of Light Resistance ',
    prefix: 'Bracers',
    suffix: 'Cloak',
    extra: 'Trinket, Armor, Shield',
    group: 'Resist',
    minLevelIncrease: null,
    stat: [
      1, 2, 4, 5, 6, 6, 7, 8, 9, 10, 11, 11, 12, 13, 14, 14, 15, 16, 17, 17, 18, 19, 20, 20, 21, 22, 23, 23, 24, 25, 26,
      27, 27, 28
    ]
  },
  {
    name: 'Insightful Negative Resistance',
    enchantments: [
      {
        name: 'Insight bonus to Resist Negative',
        statModified: 'Negative Resistance',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 15
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 30
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 10
        },
        {
          name: 'Sanguine Moth',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Favorable ',
    suffixTitle: ' of Negative Resistance ',
    prefix: 'Bracers',
    suffix: 'Cloak',
    extra: 'Trinket, Armor, Shield',
    group: 'Resist',
    minLevelIncrease: null,
    stat: [
      1, 2, 4, 5, 6, 6, 7, 8, 9, 10, 11, 11, 12, 13, 14, 14, 15, 16, 17, 17, 18, 19, 20, 20, 21, 22, 23, 23, 24, 25, 26,
      27, 27, 28
    ]
  },
  {
    name: 'Insightful Poison Resistance',
    enchantments: [
      {
        name: 'Insight bonus to Resist Poison',
        statModified: 'Poison Resistance',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Chipped Bone Talisman',
          qty: 15
        },
        {
          name: 'Academic Treatise',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Chipped Bone Talisman',
          qty: 30
        },
        {
          name: 'Academic Treatise',
          qty: 10
        },
        {
          name: "Tome: Alchemist's Chapbook",
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Poison Resistance ',
    prefix: 'Bracers',
    suffix: 'Cloak',
    extra: 'Trinket, Armor, Shield',
    group: 'Resist',
    minLevelIncrease: null,
    stat: [
      1, 2, 4, 5, 6, 6, 7, 8, 9, 10, 11, 11, 12, 13, 14, 14, 15, 16, 17, 17, 18, 19, 20, 20, 21, 22, 23, 23, 24, 25, 26,
      27, 27, 28
    ]
  },
  {
    name: 'Insightful Balance',
    enchantments: [
      {
        name: 'Insight bonus to Balance',
        statModified: 'Balance',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 15
        },
        {
          name: 'Silver Bowl',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 30
        },
        {
          name: 'Silver Bowl',
          qty: 10
        },
        {
          name: 'Glowmoss Clump',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Balance ',
    prefix: null,
    suffix: 'Boots, Rings',
    extra: 'Belt, Cloak, Trinket, Armor, Shield, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Bluff',
    enchantments: [
      {
        name: 'Insight bonus to Bluff',
        statModified: 'Bluff',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Ruddy Fungus',
          qty: 15
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Ruddy Fungus',
          qty: 30
        },
        {
          name: ' Ivory Scorpion Icon',
          qty: 10
        },
        {
          name: 'Oceanic Sphere',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Gloves, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Concentration',
    enchantments: [
      {
        name: 'Insight bonus to Concentration',
        statModified: 'Concentration',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 15
        },
        {
          name: 'Academic Treatise',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 30
        },
        {
          name: 'Academic Treatise',
          qty: 10
        },
        {
          name: 'Ritual Athame',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Concentration ',
    prefix: null,
    suffix: 'Goggles',
    extra: 'Helm, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Diplomacy',
    enchantments: [
      {
        name: 'Insight bonus to Diplomacy',
        statModified: 'Diplomacy',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Chipped Bone Talisman',
          qty: 15
        },
        {
          name: 'Bloodfeast Fungus',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Chipped Bone Talisman',
          qty: 30
        },
        {
          name: 'Swaying Mushroom Spore Pod',
          qty: 10
        },
        {
          name: 'Tear of Vulkoor',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Rings, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Disable Device',
    enchantments: [
      {
        name: 'Insight bonus to Disable Device',
        statModified: 'Disable Device',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 15
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 30
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 10
        },
        {
          name: 'Sanguine Moth',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Disable Device ',
    prefix: null,
    suffix: 'Gloves',
    extra: 'Goggles, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Haggle',
    enchantments: [
      {
        name: 'Insight bonus to Haggle',
        statModified: 'Haggle',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Ruddy Fungus',
          qty: 15
        },
        {
          name: 'Academic Treatise',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Swaying Mushroom Cluster',
          qty: 30
        },
        {
          name: 'Academic Treatise',
          qty: 10
        },
        {
          name: "Tome: Alchemist's Chapbook",
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Helm, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Heal',
    enchantments: [
      {
        name: 'Insight bonus to Heal',
        statModified: 'Heal',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 15
        },
        {
          name: 'Bloodfeast Fungus',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 30
        },
        {
          name: 'Bloodfeast Fungus',
          qty: 10
        },
        {
          name: 'Glowmoss Clump',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Necklace, Rings, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Hide',
    enchantments: [
      {
        name: 'Insight bonus to Hide',
        statModified: 'Hide',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Chipped Bone Talisman',
          qty: 15
        },
        {
          name: 'Silver Bowl',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Chipped Bone Talisman',
          qty: 30
        },
        {
          name: 'Silver Bowl',
          qty: 10
        },
        {
          name: 'Oceanic Sphere',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Cloak, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Intimidate',
    enchantments: [
      {
        name: 'Insight bonus to Intimidate',
        statModified: 'Intimidate',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 15
        },
        {
          name: 'Academic Treatise',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 30
        },
        {
          name: 'Academic Treatise',
          qty: 10
        },
        {
          name: 'Ritual Athame',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Intimidate ',
    prefix: null,
    suffix: 'Helm, Necklace',
    extra: 'Bracers, Trinket, Armor, Shield, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Jump',
    enchantments: [
      {
        name: 'Insight bonus to Jump',
        statModified: 'Jump',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Ruddy Fungus',
          qty: 15
        },
        {
          name: 'Bloodfeast Fungus',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Ruddy Fungus',
          qty: 30
        },
        {
          name: 'Swaying Mushroom Spore Pod',
          qty: 10
        },
        {
          name: 'Tear of Vulkoor',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Boots, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Listen',
    enchantments: [
      {
        name: 'Insight bonus to Listen',
        statModified: 'Listen',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 15
        },
        {
          name: 'Silver Bowl',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 30
        },
        {
          name: 'Silver Bowl',
          qty: 10
        },
        {
          name: 'Sanguine Moth',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Helm, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Move Silently',
    enchantments: [
      {
        name: 'Insight bonus to Move Silently',
        statModified: 'Move Silently',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Chipped Bone Talisman',
          qty: 15
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Chipped Bone Talisman',
          qty: 30
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 10
        },
        {
          name: "Tome: Alchemist's Chapbook",
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Belt, Boots, Trinket, Armor, Shield, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Open Lock',
    enchantments: [
      {
        name: 'Insight bonus to Open Lock',
        statModified: 'Open Lock',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 15
        },
        {
          name: 'Bloodfeast Fungus',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 30
        },
        {
          name: 'Bloodfeast Fungus',
          qty: 10
        },
        {
          name: 'Glowmoss Clump',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Gloves, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Perform',
    enchantments: [
      {
        name: 'Insight bonus to Perform',
        statModified: 'Perform',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Ruddy Fungus',
          qty: 15
        },
        {
          name: 'Silver Bowl',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Swaying Mushroom Cluster',
          qty: 30
        },
        {
          name: 'Silver Bowl',
          qty: 10
        },
        {
          name: 'Oceanic Sphere',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Gloves, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Repair',
    enchantments: [
      {
        name: 'Insight bonus to Repair',
        statModified: 'Repair',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 15
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 10
        },
        {
          name: 'Ritual Athame',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Gloves, Necklace, Rings, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Search',
    enchantments: [
      {
        name: 'Insight bonus to Search',
        statModified: 'Search',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Chipped Bone Talisman',
          qty: 15
        },
        {
          name: 'Academic Treatise',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Chipped Bone Talisman',
          qty: 30
        },
        {
          name: 'Academic Treatise',
          qty: 10
        },
        {
          name: 'Tear of Vulkoor',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Goggles, Helm, Necklace, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Spot',
    enchantments: [
      {
        name: 'Insight bonus to Spot',
        statModified: 'Spot',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 15
        },
        {
          name: 'Silver Bowl',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 30
        },
        {
          name: 'Silver Bowl',
          qty: 10
        },
        {
          name: 'Sanguine Moth',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Goggles, Helm, Necklace, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Swim',
    enchantments: [
      {
        name: 'Insight bonus to Swim',
        statModified: 'Swim',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Ruddy Fungus',
          qty: 15
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Ruddy Fungus',
          qty: 30
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 10
        },
        {
          name: "Tome: Alchemist's Chapbook",
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Belt, Boots, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Tumble',
    enchantments: [
      {
        name: 'Insight bonus to Tumble',
        statModified: 'Tumble',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 15
        },
        {
          name: 'Academic Treatise',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 30
        },
        {
          name: 'Academic Treatise',
          qty: 10
        },
        {
          name: 'Glowmoss Clump',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Belt, Boots, Necklace, Rings, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Spellsight',
    enchantments: [
      {
        name: 'Insight bonus to Spellsight',
        statModified: 'Spellsight',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 15
        },
        {
          name: 'Silver Bowl',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Cryptic Message',
          qty: 30
        },
        {
          name: 'Vial of Heavy Water',
          qty: 10
        },
        {
          name: 'Ritual Athame',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Boots, Bracers, Helm, Trinket, Runearm',
    group: 'Skill',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 11]
  },
  {
    name: 'Insightful Fortification',
    enchantments: [
      {
        name: 'Insight bonus to the reduced chance of taking Critical Hit damage on a Critical Hit',
        statModified: 'Fortification',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Ruddy Fungus',
          qty: 15
        },
        {
          name: 'Silver Bowl',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Ruddy Fungus',
          qty: 30
        },
        {
          name: 'Silver Bowl',
          qty: 10
        },
        {
          name: 'Tear of Vulkoor',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Boots, Bracers, Helm, Trinket',
    group: 'Defense',
    minLevelIncrease: null,
    stat: [
      19, 21, 23, 27, 29, 31, 33, 35, 36, 38, 40, 42, 43, 45, 47, 48, 50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69,
      71, 73, 74, 76, 78, 79
    ]
  },
  {
    name: 'Insightful Incite',
    enchantments: [
      {
        name: 'Insight bonus to Increased Threat Generation from Melee Damage',
        statModified: 'Threat Generation (Melee)',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 15
        },
        {
          name: 'Silver Bowl',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Blessed Candle',
          qty: 30
        },
        {
          name: 'Silver Bowl',
          qty: 10
        },
        {
          name: "Tome: Alchemist's Chapbook",
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Gloves, Helm, Trinket',
    group: 'Threat Gen',
    minLevelIncrease: null,
    stat: [
      1, 2, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 9, 9, 10, 10, 10, 11, 12, 12, 13, 13, 14, 14, 15, 16, 16, 17, 17, 18, 18, 19,
      19, 20
    ]
  },
  {
    name: 'Insightful Diversion',
    enchantments: [
      {
        name: 'Insight bonus to Decreased Threat Generation from Melee Damage',
        statModified: 'Threat Reduction (Melee)',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 175,
      essence: 175,
      purified: 5,
      collectible: [
        {
          name: 'Chipped Bone Talisman',
          qty: 15
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 325,
      essence: 650,
      purified: 10,
      collectible: [
        {
          name: 'Chipped Bone Talisman',
          qty: 30
        },
        {
          name: 'Ivory Scorpion Icon',
          qty: 10
        },
        {
          name: 'Sanguine Moth',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Serene ',
    suffixTitle: ' of Diversion ',
    prefix: 'Belt',
    suffix: 'Boots',
    extra: 'Cloak, Trinket',
    group: 'Threat Gen',
    minLevelIncrease: null,
    stat: [0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11]
  },
  {
    name: 'Insightful Enchantment Resistance',
    enchantments: [
      {
        name: 'Insight bonus to Saves against Enchantments',
        statModified: 'Spell Saves (Enchantment)',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 15
        },
        {
          name: 'Fractured Femur',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 30
        },
        {
          name: 'Fractured Femur',
          qty: 10
        },
        {
          name: 'Encoded Communique',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Necklace, Rings, Trinket',
    group: 'Save',
    minLevelIncrease: null,
    stat: [0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5]
  },
  {
    name: 'Insightful Illusion Resistance',
    enchantments: [
      {
        name: 'Insight bonus to Saves against Illusions',
        statModified: 'Spell Saves (Illusion)',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 15
        },
        {
          name: 'Glowmoss Spores',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 30
        },
        {
          name: 'Glowmoss Spores',
          qty: 10
        },
        {
          name: 'Prismatic Dust',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Necklace, Rings, Trinket',
    group: 'Save',
    minLevelIncrease: null,
    stat: [0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5]
  },
  {
    name: 'Protection',
    enchantments: [
      {
        name: 'Deflection bonus to Armor Class',
        statModified: 'Armor Class',
        bonusType: 'Deflection'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: null,
      collectible: [
        {
          name: 'Mortar and Pestle',
          qty: 15
        },
        {
          name: 'Glowmoss Spores',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 2,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Glowmoss Spores',
          qty: 10
        },
        {
          name: 'Scarlet Cryptmoss',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Ricocheting ',
    suffixTitle: ' of Protection ',
    prefix: 'Bracers, Trinket',
    suffix: 'Rings, Trinket',
    extra: null,
    group: 'Defense',
    minLevelIncrease: null,
    stat: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12]
  },
  {
    name: 'Insightful Dodge Bonus',
    enchantments: [
      {
        name: '% Insight bonus to Dodge',
        statModified: 'Dodge',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Zygomycota Fungus',
          qty: 15
        },
        {
          name: 'Stone Fetish',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 30
        },
        {
          name: 'Stone Fetish',
          qty: 10
        },
        {
          name: 'Prismatic Dust',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Belt, Boots, Trinket',
    group: 'Defense',
    minLevelIncrease: null,
    stat: [0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7]
  },
  {
    name: 'Insightful Spell Resistance',
    enchantments: [
      {
        name: 'Insight bonus to Spell Resistance',
        statModified: 'Spell Resistance',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 15
        },
        {
          name: 'Blister Beetle',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 30
        },
        {
          name: 'Blister Beetle',
          qty: 10
        },
        {
          name: 'Encoded Communique',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: 'Bracers, Necklace',
    suffix: 'Belt',
    extra: 'Cloak, Trinket',
    group: 'Defense',
    minLevelIncrease: null,
    stat: [
      0, 2, 3, 5, 6, 6, 7, 8, 8, 9, 9, 10, 11, 11, 12, 12, 13, 14, 15, 15, 16, 17, 17, 18, 19, 19, 20, 21, 21, 22, 23,
      23, 24, 25
    ]
  },
  {
    name: 'Insightful Accuracy',
    enchantments: [
      {
        name: 'Insight bonus to Attack Rolls',
        statModified: 'Attack Rolls',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: null,
      collectible: [
        {
          name: 'Mortar and Pestle',
          qty: 15
        },
        {
          name: 'Fractured Femur',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Fractured Femur',
          qty: 10
        },
        {
          name: 'Planar Talisman',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Gloves, Trinket',
    group: 'Offense',
    minLevelIncrease: null,
    stat: [0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11]
  },
  {
    name: 'Insightful Deadly',
    enchantments: [
      {
        name: 'Insight bonus to Weapon Damage (+[W])',
        statModified: 'Attack Rolls',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: null,
      collectible: [
        {
          name: 'Mortar and Pestle',
          qty: 15
        },
        {
          name: 'Stone Fetish',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Stone Fetish',
          qty: 10
        },
        {
          name: 'Scarlet Cryptmoss',
          qty: 5
        }
      ]
    },
    prefix: null,
    suffix: null,
    extra: 'Shield, Weapon (Melee), Weapon (Ranged), Trinket',
    group: 'Offense',
    minLevelIncrease: null,
    stat: [0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5]
  },
  {
    name: 'Insightful Seeker',
    enchantments: [
      {
        name: 'Insight bonus to Confirm Critical Hits &amp; Critical Hit Damage',
        statModified: ['Confirm Critical Hits', 'Critical Hit Damage'],
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 15
        },
        {
          name: 'Blister Beetle',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Swaying Mushroom Cluster',
          qty: 30
        },
        {
          name: 'Blister Beetle',
          qty: 10
        },
        {
          name: 'Prismatic Dust',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Boots, Goggles, Trinket, Weapon (Melee), Weapon (Ranged)',
    group: 'Offense',
    minLevelIncrease: null,
    stat: [0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7]
  },
  {
    name: 'Insightful Spell Penetration',
    enchantments: [
      {
        name: 'Insight bonus to Penetrate Spell Resistance',
        statModified: ' Penetrate Spell Resistance',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Mortar and Pestle',
          qty: 15
        },
        {
          name: 'Blister Beetle',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Blister Beetle',
          qty: 10
        },
        {
          name: 'Encoded Communique',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Gloves, Goggles, Trinket, Runearm',
    group: 'Spellcasting',
    minLevelIncrease: null,
    stat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
  },
  {
    name: 'Insightful Evocation Focus',
    enchantments: [
      {
        name: 'Insight bonus to DC of Evocation Spells',
        statModified: 'Evocation DC',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 15
        },
        {
          name: 'Fractured Femur',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 30
        },
        {
          name: 'Fractured Femur',
          qty: 10
        },
        {
          name: 'Encoded Communique',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Evocation ',
    prefix: null,
    suffix: 'Goggles, Runearm',
    extra: null,
    group: 'Spell DC',
    minLevelIncrease: null,
    stat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
  },
  {
    name: 'Insightful Illusion Focus',
    enchantments: [
      {
        name: 'Insight bonus to DC of Illusion Spells',
        statModified: 'Illusion DC',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 15
        },
        {
          name: 'Glowmoss Spores',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 30
        },
        {
          name: 'Glowmoss Spores',
          qty: 10
        },
        {
          name: 'Prismatic Dust',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Illusion ',
    prefix: null,
    suffix: 'Goggles, Runearm',
    extra: null,
    group: 'Spell DC',
    minLevelIncrease: null,
    stat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
  },
  {
    name: 'Insightful Necromancy Focus',
    enchantments: [
      {
        name: 'Insight bonus to DC of Necromancy Spells',
        statModified: 'Necromancy DC',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Mortar and Pestle',
          qty: 15
        },
        {
          name: 'Blister Beetle',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Blister Beetle',
          qty: 10
        },
        {
          name: 'Scarlet Cryptmoss',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Necromancy ',
    prefix: null,
    suffix: 'Goggles, Runearm',
    extra: null,
    group: 'Spell DC',
    minLevelIncrease: null,
    stat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
  },
  {
    name: 'Insightful Abjuration Focus',
    enchantments: [
      {
        name: 'Insight bonus to DC of Abjuration Spells',
        statModified: 'Abjuration DC',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Mortar and Pestle',
          qty: 15
        },
        {
          name: 'Warehouse Ledger',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Warehouse Ledger',
          qty: 10
        },
        {
          name: 'Planar Talisman',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Abjuration ',
    prefix: null,
    suffix: 'Goggles, Runearm',
    extra: null,
    group: 'Spell DC',
    minLevelIncrease: null,
    stat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
  },
  {
    name: 'Insightful Enchantment Focus',
    enchantments: [
      {
        name: 'Insight bonus to DC of Enchantment Spells',
        statModified: 'Enchantment DC',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 15
        },
        {
          name: 'Stone Fetish',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Swaying Mushroom Cluster',
          qty: 30
        },
        {
          name: 'Stone Fetish',
          qty: 10
        },
        {
          name: 'Encoded Communique',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Enchantment ',
    prefix: null,
    suffix: 'Goggles, Runearm',
    extra: null,
    group: 'Spell DC',
    minLevelIncrease: null,
    stat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
  },
  {
    name: 'Insightful Transmutation Focus',
    enchantments: [
      {
        name: 'Insight bonus to DC of Transmutation Spells',
        statModified: 'Transmutation DC',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Zygomycota Fungus',
          qty: 15
        },
        {
          name: 'Glowmoss Spores',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 30
        },
        {
          name: 'Glowmoss Spores',
          qty: 10
        },
        {
          name: 'Prismatic Dust',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Transmutation ',
    prefix: null,
    suffix: 'Goggles, Runearm',
    extra: null,
    group: 'Spell DC',
    minLevelIncrease: null,
    stat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
  },
  {
    name: 'Insightful Conjuration Focus',
    enchantments: [
      {
        name: 'Insight bonus to DC of Conjuration Spells',
        statModified: 'Conjuration DC',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Mortar and Pestle',
          qty: 15
        },
        {
          name: 'Fractured Femur',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Fractured Femur',
          qty: 10
        },
        {
          name: 'Scarlet Cryptmoss',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Conjuration ',
    prefix: null,
    suffix: 'Goggles, Runearm',
    extra: null,
    group: 'Spell DC',
    minLevelIncrease: null,
    stat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
  },
  {
    name: 'Insightful Vertigo',
    enchantments: [
      {
        name: "Insight bonus to DC of character's Trip and Improved Trip attampts",
        statModified: ['Trip', 'Improved Trip'],
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Mortar and Pestle',
          qty: 15
        },
        {
          name: 'Glowmoss Spores',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 2,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Glowmoss Spores',
          qty: 10
        },
        {
          name: 'Planar Talisman',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Gloves, Trinket, Weapon (Melee)',
    group: 'Tactical',
    minLevelIncrease: null,
    stat: [0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 8]
  },
  {
    name: 'Insightful Stunning',
    enchantments: [
      {
        name: "Insight bonus to DC of character's Stunning Blow and Stunning Fist attempts",
        statModified: ['Stunning Blow', 'Stunning Fist'],
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Mortar and Pestle',
          qty: 15
        },
        {
          name: 'Warehouse Ledger',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 2,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Warehouse Ledger',
          qty: 10
        },
        {
          name: 'Scarlet Cryptmoss',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Gloves, Trinket, Weapon (Melee)',
    group: 'Tactical',
    minLevelIncrease: null,
    stat: [0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 8]
  },
  {
    name: 'Insightful Shatter',
    enchantments: [
      {
        name: "Insight bonus to DC of character's Sunder attempts",
        statModified: 'Sunder',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 15
        },
        {
          name: 'Blister Beetle',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 2,
      collectible: [
        {
          name: 'Swaying Mushroom Cluster',
          qty: 30
        },
        {
          name: 'Blister Beetle',
          qty: 10
        },
        {
          name: 'Prismatic Dust',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Gloves, Trinket, Weapon (Melee)',
    group: 'Tactical',
    minLevelIncrease: null,
    stat: [0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 8]
  },
  {
    name: 'Insightful Tendon Slice',
    enchantments: [
      {
        name: "On Hit: 6% chance to sloe target's movement by 50% for a short period of time",
        statModified: 'Slow Target Chance',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Zygomycota Fungus',
          qty: 15
        },
        {
          name: 'Stone Fetish',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 2,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 30
        },
        {
          name: 'Stone Fetish',
          qty: 10
        },
        {
          name: 'Encoded Communique',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Gloves, Trinket, Weapon (Melee), Weapon (Ranged)',
    group: 'Tactical',
    minLevelIncrease: null,
    stat: [0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5]
  },
  {
    name: 'Insightful Corrosion',
    enchantments: [
      {
        name: 'Passive: Insight bonus to Acid Spell Power',
        statModified: 'Acid Spell Power',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 15
        },
        {
          name: 'Fractured Femur',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 30
        },
        {
          name: 'Fractured Femur',
          qty: 10
        },
        {
          name: 'Planar Talisman',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Corrosion ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: 'Gloves, Trinket, Runearm',
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      19, 21, 23, 27, 29, 31, 33, 35, 36, 38, 40, 42, 43, 45, 47, 48, 50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69,
      71, 73, 74, 76, 78, 79
    ]
  },
  {
    name: 'Insightful Glaciation',
    enchantments: [
      {
        name: 'Passive: Insight bonus to Cold Spell Power',
        statModified: 'Cold Spell Power',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 15
        },
        {
          name: 'Glowmoss Spores',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 30
        },
        {
          name: 'Glowmoss Spores',
          qty: 10
        },
        {
          name: 'Encoded Communique',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Glaciation ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: 'Gloves, Trinket, Runearm',
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      19, 21, 23, 27, 29, 31, 33, 35, 36, 38, 40, 42, 43, 45, 47, 48, 50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69,
      71, 73, 74, 76, 78, 79
    ]
  },
  {
    name: 'Insightful Magnetism',
    enchantments: [
      {
        name: 'Passive: Insight bonus to Electric Spell Power',
        statModified: 'Electric Spell Power',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Mortar and Pestle',
          qty: 15
        },
        {
          name: 'Blister Beetle',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Blister Beetle',
          qty: 10
        },
        {
          name: 'Prismatic Dust',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Magnetism ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: 'Gloves, Trinket, Runearm',
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      19, 21, 23, 27, 29, 31, 33, 35, 36, 38, 40, 42, 43, 45, 47, 48, 50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69,
      71, 73, 74, 76, 78, 79
    ]
  },
  {
    name: 'Insightful Combustion',
    enchantments: [
      {
        name: 'Passive: Insight bonus to Fire Spell Power',
        statModified: 'Fire Spell Power',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Mortar and Pestle',
          qty: 15
        },
        {
          name: 'Warehouse Ledger',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Warehouse Ledger',
          qty: 10
        },
        {
          name: 'Scarlet Cryptmoss',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Combustion ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: 'Gloves, Trinket, Runearm',
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      19, 21, 23, 27, 29, 31, 33, 35, 36, 38, 40, 42, 43, 45, 47, 48, 50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69,
      71, 73, 74, 76, 78, 79
    ]
  },
  {
    name: 'Insightful Resonance',
    enchantments: [
      {
        name: 'Passive: Insight bonus to Sonic Spell Power',
        statModified: 'Sonic Spell Power',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 15
        },
        {
          name: 'Stone Fetish',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Swaying Mushroom Cluster',
          qty: 30
        },
        {
          name: 'Stone Fetish',
          qty: 10
        },
        {
          name: 'Planar Talisman',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Resonance ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: 'Gloves, Trinket, Runearm',
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      19, 21, 23, 27, 29, 31, 33, 35, 36, 38, 40, 42, 43, 45, 47, 48, 50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69,
      71, 73, 74, 76, 78, 79
    ]
  },
  {
    name: 'Insightful Impulse',
    enchantments: [
      {
        name: 'Passive: Insight bonus to Force Spell Power',
        statModified: 'Force Spell Power',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Zygomycota Fungus',
          qty: 15
        },
        {
          name: 'Fractured Femur',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 30
        },
        {
          name: 'Fractured Femur',
          qty: 10
        },
        {
          name: 'Encoded Communique',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Impulse ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: 'Gloves, Trinket, Runearm',
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      19, 21, 23, 27, 29, 31, 33, 35, 36, 38, 40, 42, 43, 45, 47, 48, 50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69,
      71, 73, 74, 76, 78, 79
    ]
  },
  {
    name: 'Insightful Radiance',
    enchantments: [
      {
        name: 'Passive: Insight bonus to Light Spell Power',
        statModified: 'Light Spell Power',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 15
        },
        {
          name: 'Glowmoss Spores',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 30
        },
        {
          name: 'Glowmoss Spores',
          qty: 10
        },
        {
          name: 'Prismatic Dust',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Radiance ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: 'Gloves, Trinket, Runearm',
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      19, 21, 23, 27, 29, 31, 33, 35, 36, 38, 40, 42, 43, 45, 47, 48, 50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69,
      71, 73, 74, 76, 78, 79
    ]
  },
  {
    name: 'Insightful Devotion',
    enchantments: [
      {
        name: 'Passive: Insight bonus to Positive Spell Power',
        statModified: 'Positive Spell Power',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Mortar and Pestle',
          qty: 15
        },
        {
          name: 'Blister Beetle',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Blister Beetle',
          qty: 10
        },
        {
          name: 'Scarlet Cryptmoss',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Devotion ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: 'Gloves, Trinket, Runearm',
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      19, 21, 23, 27, 29, 31, 33, 35, 36, 38, 40, 42, 43, 45, 47, 48, 50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69,
      71, 73, 74, 76, 78, 79
    ]
  },
  {
    name: 'Insightful Nullification',
    enchantments: [
      {
        name: 'Passive: Insight bonus to Negative Spell Power',
        statModified: 'Negative Spell Power',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 15
        },
        {
          name: 'Warehouse Ledger',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Swaying Mushroom Cluster',
          qty: 30
        },
        {
          name: 'Warehouse Ledger',
          qty: 10
        },
        {
          name: 'Planar Talisman',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Nullification ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: 'Gloves, Trinket, Runearm',
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      19, 21, 23, 27, 29, 31, 33, 35, 36, 38, 40, 42, 43, 45, 47, 48, 50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69,
      71, 73, 74, 76, 78, 79
    ]
  },
  {
    name: 'Insightful Reconstruction',
    enchantments: [
      {
        name: 'Passive: Insight bonus to Repair &amp; Rust Spell Power',
        statModified: 'Repair &amp; Rust Spell Power',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 225,
      essence: 225,
      purified: 5,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 15
        },
        {
          name: 'Stone Fetish',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 375,
      essence: 750,
      purified: 10,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 30
        },
        {
          name: 'Stone Fetish',
          qty: 10
        },
        {
          name: 'Encoded Communique',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Reconstruction ',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: 'Gloves, Trinket, Runearm',
    group: 'Spell Power',
    minLevelIncrease: null,
    stat: [
      19, 21, 23, 27, 29, 31, 33, 35, 36, 38, 40, 42, 43, 45, 47, 48, 50, 52, 54, 55, 57, 59, 61, 62, 64, 66, 67, 69,
      71, 73, 74, 76, 78, 79
    ]
  },
  {
    name: 'Aligned',
    enchantments: [
      {
        name: 'Bypass Alignment based Damage Reduction',
        statModified: [
          'Damage Reduction Bypass (Chaotic)',
          'Damage Reduction Bypass (Good)',
          'Damage Reduction Bypass (Evil)',
          'Damage Reduction Bypass (Lawful)'
        ],
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 15
        },
        {
          name: 'Glowmoss Spores',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 30
        },
        {
          name: 'Glowmoss Spores',
          qty: 10
        },
        {
          name: 'Encoded Communique',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Aligned Transmutation',
    prefix: null,
    suffix: 'Weapon (Melee), Weapon (Ranged)',
    extra: null,
    group: 'Static',
    minLevelIncrease: 6,
    stat: ['Bypass Alignment based Damage Reduction (Chaotic/Good/Evil/Lawful)']
  },
  {
    name: 'Blindness Immunity',
    enchantments: [
      {
        name: 'Immunity to Blindness Effects',
        statModified: 'Blindness Immunity',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 15
        },
        {
          name: 'Warehouse Ledger',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 30
        },
        {
          name: 'Warehouse Ledger',
          qty: 10
        },
        {
          name: 'Encoded Communique',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Blindness Ward ',
    suffixTitle: null,
    prefix: 'Goggles, Rings, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Static',
    minLevelIncrease: 4,
    stat: ['Immunity to Blindness Effects']
  },
  {
    name: 'Deathblock',
    enchantments: [
      {
        name: 'Immunity to Death Spells and Magical Death Effects',
        statModified: 'Deathblock',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Amber Vial',
          qty: 15
        },
        {
          name: 'Vial of Pure Water',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Amber Vial',
          qty: 2
        },
        {
          name: 'Vial of Pure Water',
          qty: 10
        },
        {
          name: 'Pale Creeper',
          qty: 2
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Deathblock',
    prefix: null,
    suffix: 'Armor, Shield, Belt',
    extra: null,
    group: 'Static',
    minLevelIncrease: 6,
    stat: ['Immunity to Death Spells and Magical Death Effects']
  },
  {
    name: 'Efficient Metamagic - Empower II',
    enchantments: [
      {
        name: 'Reduce Empower Metamagic cost by 2 SP',
        statModified: 'Metamagic Cost (Empower)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 15
        },
        {
          name: 'Mark of the Yugoloth',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Swaying Mushroom Cluster',
          qty: 30
        },
        {
          name: 'Blister Beetle',
          qty: 10
        },
        {
          name: 'Scarlet Cryptmoss',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Trinket, Runearm',
    group: 'Static',
    minLevelIncrease: null,
    stat: ['Reduce Spell Point cost of using Empower by 2 SP']
  },
  {
    name: 'Efficient Metamagic: Enlarge I',
    enchantments: [
      {
        name: 'Reduce Enlarge Metamagic cost by 1 SP',
        statModified: 'Metamagic Cost (Enlarge)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 15
        },
        {
          name: 'Mark of the Yugoloth',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 30
        },
        {
          name: 'Blister Beetle',
          qty: 10
        },
        {
          name: 'Scarlet Cryptmoss',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Trinket, Runearm',
    group: 'Static',
    minLevelIncrease: null,
    stat: ['Reduce Spell Point cost of using Enlarge by 1 SP']
  },
  {
    name: 'Efficient Metamagic: Extend I',
    enchantments: [
      {
        name: 'Reduce Extend Metamagic cost by 1 SP',
        statModified: 'Metamagic Cost (Extend)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 15
        },
        {
          name: 'Mark of the Yugoloth',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 30
        },
        {
          name: 'Fractured Femur',
          qty: 10
        },
        {
          name: 'Encoded Communique',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Trinket, Runearm',
    group: 'Static',
    minLevelIncrease: null,
    stat: ['Reduce Spell Point cost of using Extend by 1 SP']
  },
  {
    name: 'Efficient Metamagic: Empower Healing I',
    enchantments: [
      {
        name: 'Reduce Empower Healing Metamagic cost by 1 SP',
        statModified: 'Metamagic Cost (Empower Healing)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Zygomycota Fungus',
          qty: 15
        },
        {
          name: 'Mark of the Yugoloth',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 30
        },
        {
          name: 'Warehouse Ledger',
          qty: 10
        },
        {
          name: 'Planar Talisman',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Trinket, Runearm',
    group: 'Static',
    minLevelIncrease: null,
    stat: ['Reduce Spell Point cost of using Empower Healing by 1 SP']
  },
  {
    name: 'Efficient Metamagic: Maximize I',
    enchantments: [
      {
        name: 'Reduce Maximize Healing Metamagic cost by 1 SP',
        statModified: 'Metamagic Cost (Maximize)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 15
        },
        {
          name: 'Mark of the Yugoloth',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Swaying Mushroom Cluster',
          qty: 30
        },
        {
          name: 'Blister Beetle',
          qty: 10
        },
        {
          name: 'Planar Talisman',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Trinket, Runearm',
    group: 'Static',
    minLevelIncrease: null,
    stat: ['Reduce Spell Point cost of using Maximize by 1 SP']
  },
  {
    name: 'Eternal Faith',
    enchantments: [
      {
        name: 'Turn Undead level &amp; maximum Hit Die increased by 2, total Hit Die increase of 4',
        statModified: 'Turn Undead Hit Die',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Mortar and Pestle',
          qty: 15
        },
        {
          name: 'Mark of the Silver Flame',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Glowmoss Spores',
          qty: 10
        },
        {
          name: 'Prismatic Dust',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Eternal Faith',
    prefix: null,
    suffix: 'Helm, Necklace, Ring, Trinket, Armor, Weapon, Shield, Runearm',
    extra: null,
    group: 'Static',
    minLevelIncrease: 8,
    stat: ['Turn Undead level &amp; maximum Hit Die increased by 2, total Hit Die increase of 4']
  },
  {
    name: 'Everbright',
    enchantments: [
      {
        name: 'Weapon never takes damage from Ooze or Rust',
        statModified: ['Weapon Damage Negation (Ooze)', 'Weapon Damage Negation (Rust)'],
        bonusType: 'Enhancement'
      },
      {
        name: 'Blinding Flash (3/Rest)',
        statModified: 'Spell Like Ability',
        bonusType: 'Clickie'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Mortar and Pestle',
          qty: 15
        },
        {
          name: 'Blister Beetle',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Blister Beetle',
          qty: 10
        },
        {
          name: 'Prismatic Dust',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Everbright',
    prefix: null,
    suffix: 'Weapon',
    extra: null,
    group: 'Static',
    minLevelIncrease: 4,
    stat: ['Weapon never takes damage from Ooze or Rust']
  },
  {
    name: 'Fearsome',
    enchantments: [
      {
        name: 'On Being Hit: Chance to cast Fear on the attacking enemy',
        statModified: 'Guard Damage (Fear)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 15
        },
        {
          name: 'Warehouse Ledger',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Swaying Mushroom Cluster',
          qty: 30
        },
        {
          name: 'Warehouse Ledger',
          qty: 10
        },
        {
          name: 'Scarlet Cryptmoss',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Fearsome ',
    suffixTitle: null,
    prefix: 'Armor',
    suffix: null,
    extra: null,
    group: 'Static',
    minLevelIncrease: 6,
    stat: ['On Being Hit: Chance to cast Fear on the attacking enemy']
  },
  {
    name: 'Feather Fall',
    enchantments: [
      {
        name: 'Causes your character to fall slowly',
        statModified: 'Feather Fall',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 15
        },
        {
          name: 'Khyber Prayer Pamphlet',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'String of Prayer Beads',
          qty: 3
        },
        {
          name: 'Khyber Prayer Pamphlet',
          qty: 10
        },
        {
          name: 'Icon of Khyber',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Feather Falling ',
    suffixTitle: null,
    prefix: 'Boots, Cloak, Ring, Trinket',
    suffix: null,
    extra: null,
    group: 'Static',
    minLevelIncrease: 2,
    stat: ['Causes your character to fall slowly']
  },
  {
    name: 'Ghost Touch',
    enchantments: [
      {
        name: 'Bypass Incorporeal creatures 50% chance to avoid damage',
        statModified: 'Ghost Touch',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 15
        },
        {
          name: 'Stone Fetish',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Swaying Mushroom Cluster',
          qty: 30
        },
        {
          name: 'Stone Fetish',
          qty: 10
        },
        {
          name: 'Planar Talisman',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Ghost Touch ',
    suffixTitle: null,
    prefix: 'Weapon',
    suffix: null,
    extra: null,
    group: 'Static',
    minLevelIncrease: 2,
    stat: ['Bypass Incorporeal creatures 50% chance to avoid damage']
  },
  {
    name: 'Invulnerability',
    enchantments: [
      {
        name: 'Grants DR 5/Magic to the wearer',
        statModified: 'Damage Reduction',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Zygomycota Fungus',
          qty: 15
        },
        {
          name: 'Fractured Femur',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 30
        },
        {
          name: 'Fractured Femur',
          qty: 10
        },
        {
          name: 'Encoded Communique',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Invulnerability',
    prefix: null,
    suffix: 'Armor',
    extra: null,
    group: 'Static',
    minLevelIncrease: 6,
    stat: ['Grants DR 5/Magic to the wearer']
  },
  {
    name: 'Lesser Arcane Spell Dexterity',
    enchantments: [
      {
        name: 'Reduce Arcane Spell Failure by 5%',
        statModified: 'Arcane Spell Failure',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 15
        },
        {
          name: 'Stone Fetish',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 30
        },
        {
          name: 'Stone Fetish',
          qty: 10
        },
        {
          name: 'Encoded Communique',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Casting Dexterity ',
    suffixTitle: null,
    prefix: 'Gloves, Trinket, Armor, Runearm',
    suffix: null,
    extra: null,
    group: 'Static',
    minLevelIncrease: 4,
    stat: ['Reduce Arcane Spell Failure by 5%']
  },
  {
    name: 'Metalline',
    enchantments: [
      {
        name: 'Bypass metal based Damage Reduction (Adamantine, Alchemical Silver, Byeshk, Cold Iron, Mithril)',
        statModified: [
          'Damage Reduction Bypass (Adamantine)',
          'Damage Reduction Bypass (Alchemical Silver)',
          'Damage Reduction Bypass (Byeshk)',
          'Damage Reduction Bypass (Cold Iron)',
          'Damage Reduction Bypass (Mithril)'
        ],
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 15
        },
        {
          name: 'Fractured Femur',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 30
        },
        {
          name: 'Fractured Femur',
          qty: 10
        },
        {
          name: 'Planar Talisman',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Metalline ',
    suffixTitle: null,
    prefix: 'Weapon',
    suffix: null,
    extra: null,
    group: 'Static',
    minLevelIncrease: 6,
    stat: ['Bypass metal based Damage Reduction (Adamantine, Alchemical Silver, Byeshk, Cold Iron, Mithril)']
  },
  {
    name: 'Persuasion',
    enchantments: [
      {
        name: '+3 Competence bonus to all Charisma based skills',
        statModified: ['Bluff', 'Diplomacy', 'Haggle', 'Intimidate', 'Perform', 'Use Magic Device'],
        bonusType: 'Competence'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 15
        },
        {
          name: 'Mark of the Yugoloth',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 30
        },
        {
          name: 'Blister Beetle',
          qty: 10
        },
        {
          name: 'Prismatic Dust',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Persuasion ',
    suffixTitle: null,
    prefix: 'Goggles, Helm, Ring, Trinket, Runearm',
    suffix: null,
    extra: null,
    group: 'Static',
    minLevelIncrease: 4,
    stat: ['+3 Competence Bonus to all Charisma based skills (including Use Magic Device)']
  },
  {
    name: 'Regeneration',
    enchantments: [
      {
        name: 'Regenerate 1 Hit Point per minute using positive energy',
        statModified: 'Hit Point Regeneration',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 15
        },
        {
          name: 'Glowmoss Spores',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Swaying Mushroom Cluster',
          qty: 30
        },
        {
          name: 'Glowmoss Spores',
          qty: 10
        },
        {
          name: 'Encoded Communique',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Regeneration',
    prefix: null,
    suffix: 'Ring, Trinket',
    extra: null,
    group: 'Static',
    minLevelIncrease: 6,
    stat: ['Regenerate 1 Hit Point per minute using positive energy']
  },
  {
    name: 'Sacred',
    enchantments: [
      {
        name: 'Increase effective Turn Undead level by 2',
        statModified: 'Turn Undead Level',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Zygomycota Fungus',
          qty: 15
        },
        {
          name: 'Mark of the Silver Flame',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 30
        },
        {
          name: 'Fractured Femur',
          qty: 10
        },
        {
          name: 'Encoded Communique',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Sacred ',
    suffixTitle: null,
    prefix: 'Helm, Necklace, Ring, Trinket, Armor, Weapon, Shield',
    suffix: null,
    extra: null,
    group: 'Static',
    minLevelIncrease: 2,
    stat: ['Increase effective Turn Undead level by 2']
  },
  {
    name: 'Silver Flame',
    enchantments: [
      {
        name: 'Increase total Hit Die of Turn Undead by 6',
        statModified: 'Turn Undead Hit Die',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 15
        },
        {
          name: 'Mark of the Silver Flame',
          qty: 1
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Smoldering Ember',
          qty: 30
        },
        {
          name: 'Stone Fetish',
          qty: 10
        },
        {
          name: 'Planar Talisman',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Silver Flame ',
    suffixTitle: null,
    prefix: 'Gloves, Trinket, Weapon, Runearm',
    suffix: null,
    extra: null,
    group: 'Static',
    minLevelIncrease: 6,
    stat: ['Increase total Hit Die of Turn Undead by 6']
  },
  {
    name: 'Songblade',
    enchantments: [
      {
        name: '+2 Enhancement Bonus to the Perform skill',
        statModified: 'Perform',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Mortar and Pestle',
          qty: 15
        },
        {
          name: 'Fractured Femur',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Fractured Femur',
          qty: 10
        },
        {
          name: 'Planar Talisman',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Songblade ',
    suffixTitle: null,
    prefix: 'Weapon, Shield',
    suffix: null,
    extra: null,
    group: 'Static',
    minLevelIncrease: 2,
    stat: ['+2 Enhancement Bonus to the Perform skill']
  },
  {
    name: 'True Seeing',
    enchantments: [
      {
        name: 'Gain the benefit of the True Seeing spell',
        statModified: 'True Seeing',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 15
        },
        {
          name: 'Warehouse Ledger',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 30
        },
        {
          name: 'Stone Fetish',
          qty: 10
        },
        {
          name: 'Planar Talisman',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: 'Goggles, Trinket',
    extra: null,
    group: 'Static',
    minLevelIncrease: 14,
    stat: ['Gain the benefit of the True Seeing spell']
  },
  {
    name: 'Twilight',
    enchantments: [
      {
        name: 'Reduces Arcane Spell Failure by 10%',
        statModified: 'Arcane Spell Failure',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Slime Mold',
          qty: 15
        },
        {
          name: 'Warehouse Ledger',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Swaying Mushroom Cluster',
          qty: 30
        },
        {
          name: 'Warehouse Ledger',
          qty: 10
        },
        {
          name: 'Planar Talisman',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Twilight ',
    suffixTitle: null,
    prefix: 'Armor',
    suffix: null,
    extra: null,
    group: 'Static',
    minLevelIncrease: 6,
    stat: ['Reduces Arcane Spell Failure by 10%']
  },
  {
    name: 'Unbalancing',
    enchantments: [
      {
        name: 'On Hit: Chance to inflict a -2 penalty to enemy Armor Class',
        statModified: 'Target Armor Class Reduction',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Mortar and Pestle',
          qty: 15
        },
        {
          name: 'Blister Beetle',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Ritual Candle',
          qty: 30
        },
        {
          name: 'Blister Beetle',
          qty: 10
        },
        {
          name: 'Scarlet Cryptmoss',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Unbalancing ',
    suffixTitle: null,
    prefix: 'Weapon',
    suffix: null,
    extra: null,
    group: 'Static',
    minLevelIncrease: 2,
    stat: ['On Hit: Chance to inflict a -2 penalty to enemy Armor Class']
  },
  {
    name: 'Underwater Action',
    enchantments: [
      {
        name: 'You are able to breate underwater',
        statModified: 'Underwater Action',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 1,
      essence: 10,
      purified: null,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 15
        },
        {
          name: 'Small Wooden Idol',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 150,
      essence: 300,
      purified: 2,
      collectible: [
        {
          name: 'Sweet Whitecap',
          qty: 3
        },
        {
          name: 'Small Wooden Idol',
          qty: 10
        },
        {
          name: 'Vial of Contagion',
          qty: 2
        }
      ]
    },
    prefixTitle: 'Underwater Action ',
    suffixTitle: null,
    prefix: 'Goggles, Helm, Ring, Trinket',
    suffix: null,
    extra: null,
    group: 'Static',
    minLevelIncrease: 6,
    stat: ['You are able to breathe underwater']
  },
  {
    name: 'Vengeful',
    enchantments: [
      {
        name: 'On Being Hit: 10% Chance to cast the Rage spell on the wearer',
        statModified: 'Spell Cast Chance (Rage)',
        bonusType: 'Enhancement'
      }
    ],
    bound: {
      level: 250,
      essence: 250,
      purified: null,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 15
        },
        {
          name: 'Glowmoss Spores',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 400,
      essence: 800,
      purified: 10,
      collectible: [
        {
          name: 'Mystical Formula',
          qty: 30
        },
        {
          name: 'Glowmoss Spores',
          qty: 10
        },
        {
          name: 'Prismatic Dust',
          qty: 5
        }
      ]
    },
    prefixTitle: 'Vengeful ',
    suffixTitle: null,
    prefix: 'Weapon',
    suffix: null,
    extra: null,
    group: 'Static',
    minLevelIncrease: 2,
    stat: ['On Being Hit: 10% Chance to cast the Rage spell on the wearer']
  },
  {
    name: 'Insightful Strength',
    enchantments: [
      {
        name: 'Insight bonus to Strength',
        statModified: 'Strength',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 275,
      essence: 275,
      purified: 5,
      collectible: [
        {
          name: 'Crypt Moth',
          qty: 15
        },
        {
          name: 'Ornate Charm',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 425,
      essence: 850,
      purified: 10,
      collectible: [
        {
          name: 'Crypt Moth',
          qty: 30
        },
        {
          name: 'Ornate Charm',
          qty: 10
        },
        {
          name: 'Token of the Spider',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Belt, Bracers, Gloves, Trinket',
    group: 'Ability',
    minLevelIncrease: null,
    stat: [0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7]
  },
  {
    name: 'Insightful Dexterity',
    enchantments: [
      {
        name: 'Insight bonus to Dexterity',
        statModified: 'Dexterity',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 275,
      essence: 275,
      purified: 5,
      collectible: [
        {
          name: 'Crypt Moth',
          qty: 15
        },
        {
          name: 'Pouch of Bone Fragments',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 425,
      essence: 850,
      purified: 10,
      collectible: [
        {
          name: 'Crypt Moth',
          qty: 30
        },
        {
          name: 'Pouch of Bone Fragments',
          qty: 10
        },
        {
          name: 'Shimmering Spore Pod',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Boots, Gloves, Rings, Trinket',
    group: 'Ability',
    minLevelIncrease: null,
    stat: [0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7]
  },
  {
    name: 'Insightful Constitution',
    enchantments: [
      {
        name: 'Insight bonus to Constitution',
        statModified: 'Constitution',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 275,
      essence: 275,
      purified: 5,
      collectible: [
        {
          name: 'Ancient Text',
          qty: 15
        },
        {
          name: 'Hairy Trumpet Mushroom',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 425,
      essence: 850,
      purified: 10,
      collectible: [
        {
          name: 'Ancient Text',
          qty: 30
        },
        {
          name: 'Hairy Trumpet Mushroom',
          qty: 10
        },
        {
          name: "Vial of Dragon's Blood Ink",
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Belt, Necklace, Rings, Trinket',
    group: 'Ability',
    minLevelIncrease: null,
    stat: [0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7]
  },
  {
    name: 'Insightful Charisma',
    enchantments: [
      {
        name: 'Insight bonus to Charisma',
        statModified: 'Charisma',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 275,
      essence: 275,
      purified: 5,
      collectible: [
        {
          name: 'Ancient Text',
          qty: 15
        },
        {
          name: 'Ornate Charm',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 425,
      essence: 850,
      purified: 10,
      collectible: [
        {
          name: 'Ancient Text',
          qty: 30
        },
        {
          name: 'Ornate Charm',
          qty: 10
        },
        {
          name: 'Adventuring Oratorio',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Cloak, Necklace, Rings, Trinket',
    group: 'Ability',
    minLevelIncrease: null,
    stat: [0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7]
  },
  {
    name: 'Insightful Intelligence',
    bound: {
      level: 275,
      essence: 275,
      purified: 5,
      collectible: [
        {
          name: 'Brass Censer',
          qty: 15
        },
        {
          name: 'Archaic Logbook',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 425,
      essence: 850,
      purified: 10,
      collectible: [
        {
          name: 'Brass Censer',
          qty: 30
        },
        {
          name: 'Archaic Logbook',
          qty: 10
        },
        {
          name: 'Shimmering Spore Pod',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Cloak, Goggles, Helm, Trinket',
    group: 'Ability',
    minLevelIncrease: null,
    stat: [0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7]
  },
  {
    name: 'Insightful Wisdom',
    enchantments: [
      {
        name: 'Insight bonus to Wisdom',
        statModified: 'Wisdom',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 275,
      essence: 275,
      purified: 5,
      collectible: [
        {
          name: 'Brass Censer',
          qty: 15
        },
        {
          name: 'Hairy Trumpet Mushroom',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 425,
      essence: 850,
      purified: 10,
      collectible: [
        {
          name: 'Brass Censer',
          qty: 30
        },
        {
          name: 'Hairy Trumpet Mushroom',
          qty: 10
        },
        {
          name: "Vial of Dragon's Blood Ink",
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Cloak, Goggles, Helm, Trinket',
    group: 'Ability',
    minLevelIncrease: null,
    stat: [0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7]
  },
  {
    name: 'Insightful Physical Sheltering',
    enchantments: [
      {
        name: 'Insight bonus to Physical Resistance Rating',
        statModified: 'Physical Resistance Rating',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 275,
      essence: 275,
      purified: 5,
      collectible: [
        {
          name: 'Crypt Moth',
          qty: 15
        },
        {
          name: 'Ornate Charm',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 425,
      essence: 850,
      purified: 10,
      collectible: [
        {
          name: 'Crypt Moth',
          qty: 30
        },
        {
          name: 'Ornate Charm',
          qty: 10
        },
        {
          name: 'Shimmering Spore Pod',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Physical Resistance ',
    prefix: null,
    suffix: 'Bracers',
    extra: 'Cloak, Helm, Necklace, Rings, Trinket',
    group: 'Defense',
    minLevelIncrease: null,
    stat: [
      1, 1, 2, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17,
      18, 18
    ]
  },
  {
    name: 'Insightful Magical Sheltering',
    enchantments: [
      {
        name: 'Insight bonus to Magical Resistance Rating',
        statModified: 'Magical Resistance Rating',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 275,
      essence: 275,
      purified: 5,
      collectible: [
        {
          name: 'Brass Censer',
          qty: 15
        },
        {
          name: 'Archaic Logbook',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 425,
      essence: 850,
      purified: 10,
      collectible: [
        {
          name: 'Brass Censer',
          qty: 30
        },
        {
          name: 'Archaic Logbook',
          qty: 10
        },
        {
          name: 'Token of the Spider',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Magical Resistance ',
    prefix: null,
    suffix: 'Bracers',
    extra: 'Cloak, Helm, Necklace, Rings, Trinket',
    group: 'Defense',
    minLevelIncrease: null,
    stat: [
      1, 1, 2, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17,
      18, 18
    ]
  },
  {
    name: 'Insightful Assassinate',
    enchantments: [
      {
        name: "Insight bonus to character's Assassinate attempts",
        statModified: 'Assassinate',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 275,
      essence: 275,
      purified: 5,
      collectible: [
        {
          name: 'Brass Censer',
          qty: 15
        },
        {
          name: 'Pouch of Bone Fragments',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 425,
      essence: 850,
      purified: 2,
      collectible: [
        {
          name: 'Brass Censer',
          qty: 30
        },
        {
          name: 'Pouch of Bone Fragments',
          qty: 10
        },
        {
          name: "Vial of Dragon's Blood Ink",
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Assassinate ',
    prefix: null,
    suffix: 'Gloves',
    extra: 'Trinket, Weapon (Melee), Weapon (Ranged)',
    group: 'Tactical',
    minLevelIncrease: null,
    stat: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3]
  },
  {
    name: 'Insightful Combat Mastery',
    enchantments: [
      {
        name: "Insight bonus to character's Trip, Improved Trip, Sunder, Improved Sunder, Stunning Blow, and Stunning Fist attempts",
        statModified: ['Trip', 'Improved Trip', 'Sunder', 'Improved Sunder', 'Stunning Blow', 'Stunning Fist'],
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 275,
      essence: 275,
      purified: 5,
      collectible: [
        {
          name: 'Flint Knife',
          qty: 15
        },
        {
          name: 'Ornate Charm',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 425,
      essence: 850,
      purified: 10,
      collectible: [
        {
          name: 'Flint Knife',
          qty: 30
        },
        {
          name: 'Ornate Charm',
          qty: 10
        },
        {
          name: 'Adventuring Oratorio',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: ' of Combat Mastery ',
    prefix: null,
    suffix: 'Gloves, Armor, Shield',
    extra: 'Boots, Trinket',
    group: 'Tactical',
    minLevelIncrease: null,
    stat: [1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6]
  },
  {
    name: 'Insightful Spell Saves',
    enchantments: [
      {
        name: 'Insight bonus to Saves against Spells',
        statModified: 'Spell Saves',
        bonusType: 'Insight'
      }
    ],
    bound: {
      level: 275,
      essence: 275,
      purified: 5,
      collectible: [
        {
          name: 'Flint Knife',
          qty: 15
        },
        {
          name: 'Pouch of Bone Fragments',
          qty: 5
        }
      ]
    },
    unbound: {
      level: 425,
      essence: 850,
      purified: 10,
      collectible: [
        {
          name: 'Flint Knife',
          qty: 30
        },
        {
          name: 'Pouch of Bone Fragments',
          qty: 10
        },
        {
          name: 'Adventuring Oratorio',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: null,
    suffix: null,
    extra: 'Necklace, Rings, Trinket',
    group: 'Save',
    minLevelIncrease: null,
    stat: [0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5]
  },
  {
    name: "Initiate's (Spell Pen & Max SP)",
    enchantments: [
      {
        name: 'Spell Penetration',
        statModified: 'Spell Penetration'
      },
      {
        name: 'Maximum Spell Points',
        statModified: 'Maximum Spell Points'
      }
    ],
    bound: null,
    unbound: {
      level: 400,
      essence: 800,
      purified: 15,
      collectible: [
        {
          name: 'Mystical Bottle',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: ['Gloves'],
    suffix: null,
    extra: null,
    group: 'Save',
    minLevelIncrease: null,
    stat: []
  },
  {
    name: 'Warded (Curse Resist & Prot from Evil)',
    enchantments: [
      {
        name: 'Curse Resistance',
        statModified: 'Curse Resistance'
      },
      {
        name: 'Protection from Evil',
        statModified: 'Protection from Evil'
      }
    ],
    bound: null,
    unbound: {
      level: 400,
      essence: 800,
      purified: 15,
      collectible: [
        {
          name: 'Mystical Vessel',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: ['Ring'],
    suffix: null,
    extra: null,
    group: 'Save',
    minLevelIncrease: null,
    stat: []
  },
  {
    name: 'Sabotaging (Seeker & Deception)',
    enchantments: [
      {
        name: 'Seeker',
        statModified: 'Seeker'
      },
      {
        name: 'Deception',
        statModified: 'Deception'
      }
    ],
    bound: null,
    unbound: {
      level: 400,
      essence: 800,
      purified: 15,
      collectible: [
        {
          name: 'Mystical Urn',
          qty: 5
        }
      ]
    },
    prefixTitle: null,
    suffixTitle: null,
    prefix: ['Goggles'],
    suffix: null,
    extra: null,
    group: 'Save',
    minLevelIncrease: null,
    stat: []
  }
]
