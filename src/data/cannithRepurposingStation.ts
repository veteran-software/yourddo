import type { CraftingIngredient } from '../types/crafting.ts'

export const cannithRepurposingStation: CraftingIngredient[] = [
  {
    name: 'Awaken Set Bonus: Heart of Blades',
    quantity: 1,
    description: 'Takes a Lost Purpose item and gives it the Heart of Blades Set Bonus',
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: 'Heart of Blades',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Spell Power: Repair',
            bonus: 'Artifact',
            modifier: 10
          },
          {
            name: 'Spell Power: Rust',
            bonus: 'Artifact',
            modifier: 10
          },
          {
            name: 'Repair Amplification',
            modifier: 10,
            bonus: 'Artifact'
          },
          {
            name: 'Positive Amplification',
            modifier: 10,
            bonus: 'Artifact'
          },
          {
            name: 'Strikethrough Chance',
            modifier: '5%',
            bonus: 'Artifact'
          },
          {
            name: 'Melee Power',
            modifier: 5,
            bonus: 'Artifact'
          },
          {
            name: 'Ranged Power',
            modifier: 5,
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 10
      }
    ]
  },
  {
    name: "Awaken Set Bonus: Vol's Influence",
    quantity: 1,
    description: "Takes a Lost Purpose item and gives it the Vol's Influence Set Bonus",
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: "Vol's Influence",
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Spell Power: Universal',
            modifier: 20,
            bonus: 'Artifact'
          },
          {
            name: 'Spell Critical Chance',
            modifier: '2%',
            bonus: 'Artifact'
          },
          {
            name: 'Spell Critical Damage',
            modifier: '5%',
            bonus: 'Legendary'
          },
          {
            name: 'Spell DCs',
            modifier: 1,
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 10
      }
    ]
  },
  {
    name: "Awaken Set Bonus: The Fury's Rage",
    quantity: 1,
    description: "Takes a Lost Purpose item and gives it the The Fury's Rage Set Bonus",
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: "The Fury's Rage",
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Physical Resistance',
            modifier: 10,
            bonus: 'Artifact'
          },
          {
            name: 'Melee Threat Multiplier',
            modifier: '50%',
            bonus: 'Artifact'
          },
          {
            name: 'Helpless Damage Bonus',
            modifier: '5%',
            bonus: 'Artifact'
          },
          {
            name: 'Melee Power',
            modifier: 5,
            bonus: 'Artifact'
          },
          {
            name: 'Ranged Power',
            modifier: 5,
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 10
      }
    ]
  },
  {
    name: 'Awaken Set Bonus: Delight of the Devourer',
    quantity: 1,
    description: 'Takes a Lost Purpose item and gives it the Delight of the Devourer Set Bonus',
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: 'Delight of the Devourer',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Spell Power: Universal',
            modifier: 20,
            bonus: 'Artifact'
          },
          {
            name: 'Spell Critical Chance',
            modifier: '2%',
            bonus: 'Artifact'
          },
          {
            name: 'Spell Critical Damage',
            modifier: '5%',
            bonus: 'Legendary'
          },
          {
            name: 'Helpless Damage Bonus',
            modifier: '5%',
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 10
      }
    ]
  },
  {
    name: 'Awaken Set Bonus: Minion of the Mockery',
    quantity: 1,
    description: 'Takes a Lost Purpose item and gives it the Minion of the Mockery Set Bonus',
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: 'Minion of the Mockery',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Melee Power',
            modifier: 5,
            bonus: 'Artifact'
          },
          {
            name: 'Ranged Power',
            modifier: 5,
            bonus: 'Artifact'
          },
          {
            name: 'Assassinate DC',
            modifier: 1,
            bonus: 'Artifact'
          },
          {
            name: 'Dodge Chance',
            modifier: '3%',
            bonus: 'Artifact'
          },
          {
            name: 'Sneak Attack Bonus',
            modifier: 1,
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 10
      }
    ]
  },
  {
    name: "Awaken Set Bonus: The Keeper's Coffin",
    quantity: 1,
    description: "Takes a Lost Purpose item and gives it the The Keeper's Coffin Set Bonus",
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: "The Keeper's Coffin",
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Spell DC: Abjuration',
            bonus: 'Artifact',
            modifier: 1
          },
          {
            name: 'Spell DC: Conjuration',
            bonus: 'Artifact',
            modifier: 1
          },
          {
            name: 'Spell DC: Enchantment',
            bonus: 'Artifact',
            modifier: 1
          },
          {
            name: 'Spell DC: Evocation',
            bonus: 'Artifact',
            modifier: 1
          },
          {
            name: 'Spell DC: Illusion',
            bonus: 'Artifact',
            modifier: 1
          },
          {
            name: 'Spell DC: Necromancy',
            bonus: 'Artifact',
            modifier: 1
          },
          {
            name: 'Spell DC: Transmutation',
            bonus: 'Artifact',
            modifier: 1
          },
          {
            name: 'Spell Penetration (Level 9)',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Positive Amplification',
            modifier: 10,
            bonus: 'Artifact'
          },
          {
            name: 'Negative Amplification',
            modifier: 10,
            bonus: 'Artifact'
          },
          {
            name: 'Strength',
            modifier: 1,
            bonus: 'Artifact'
          },
          {
            name: 'Dexterity',
            modifier: 1,
            bonus: 'Artifact'
          },
          {
            name: 'Constitution',
            modifier: 1,
            bonus: 'Artifact'
          },
          {
            name: 'Intelligence',
            modifier: 1,
            bonus: 'Artifact'
          },
          {
            name: 'Wisdom',
            modifier: 1,
            bonus: 'Artifact'
          },
          {
            name: 'Charisma',
            modifier: 1,
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 10
      }
    ]
  },
  {
    name: "Awaken Set Bonus: The Shadow's Emptiness",
    quantity: 1,
    description: "Takes a Lost Purpose item and gives it the The Shadow's Emptiness Set Bonus",
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: "The Shadow's Emptiness",
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Doublestrike Chance',
            modifier: '5%',
            bonus: 'Artifact'
          },
          {
            name: 'Doubleshot Chance',
            modifier: '5%',
            bonus: 'Artifact'
          },
          {
            name: 'Imbue Dice',
            modifier: 1,
            bonus: 'Artifact'
          },
          {
            name: 'Spell Power: Universal',
            modifier: 20,
            bonus: 'Artifact'
          },
          {
            name: 'Magical Resistance',
            modifier: 10,
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 10
      }
    ]
  },
  {
    name: "Awaken Set Bonus: The Traveler's Guidance",
    quantity: 1,
    description: "Takes a Lost Purpose item and gives it the The Traveler's Guidance Set Bonus",
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: "The Traveler's Guidance",
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'All Saving Throws',
            modifier: 1,
            bonus: 'Artifact'
          },
          {
            name: 'Tactical Feat DC',
            modifier: 1,
            bonus: 'Artifact'
          },
          {
            name: 'Melee Power',
            modifier: 5,
            bonus: 'Artifact'
          },
          {
            name: 'Ranged Power',
            modifier: 5,
            bonus: 'Artifact'
          },
          {
            name: 'Helpless Damage Bonus',
            modifier: '5%',
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 10
      }
    ]
  },
  {
    name: 'Awaken Set Bonus: Armaments of the Archons',
    quantity: 1,
    description: 'Takes a Lost Purpose item and gives it the Armaments of the Archons Set Bonus',
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: 'Armaments of the Archons',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Physical Resistance',
            modifier: 10,
            bonus: 'Artifact'
          },
          {
            name: 'Magical Resistance',
            modifier: 10,
            bonus: 'Artifact'
          },
          {
            name: 'Armor Class',
            modifier: '5%',
            bonus: 'Artifact'
          },
          {
            name: 'Maximum Hit Points',
            modifier: '5%',
            bonus: 'Legendary'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 10
      }
    ]
  },
  {
    name: "Awaken Set Bonus: Devils' Infernal Dance",
    quantity: 1,
    description: "Takes a Lost Purpose item and gives it the Devils' Infernal Dance Set Bonus",
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: "Devils' Infernal Dance",
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Strength',
            modifier: 1,
            bonus: 'Artifact'
          },
          {
            name: 'Dexterity',
            modifier: 1,
            bonus: 'Artifact'
          },
          {
            name: 'Constitution',
            modifier: 1,
            bonus: 'Artifact'
          },
          {
            name: 'Intelligence',
            modifier: 1,
            bonus: 'Artifact'
          },
          {
            name: 'Wisdom',
            modifier: 1,
            bonus: 'Artifact'
          },
          {
            name: 'Charisma',
            modifier: 1,
            bonus: 'Artifact'
          },
          {
            name: 'Doublestrike Chance',
            modifier: '5%',
            bonus: 'Artifact'
          },
          {
            name: 'Doubleshot Chance',
            modifier: '5%',
            bonus: 'Artifact'
          },
          {
            name: 'Fortification Bypass Chance',
            modifier: '10%',
            bonus: 'Artifact'
          },
          {
            name: 'Melee Power',
            modifier: 5,
            bonus: 'Artifact'
          },
          {
            name: 'Ranged Power',
            modifier: 5,
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 10
      }
    ]
  },
  {
    name: 'Awaken Set Bonus: Forbidden Knowledge',
    quantity: 1,
    description: 'Takes a Lost Purpose item and gives it the Forbidden Knowledge Set Bonus',
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: 'Forbidden Knowledge',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Physical Resistance',
            modifier: 10,
            bonus: 'Profane'
          }
        ]
      },
      {
        name: 'Forbidden Knowledge',
        numPiecesEquipped: 4,
        enhancements: [
          {
            name: 'Strength',
            modifier: 1,
            bonus: 'Profane'
          },
          {
            name: 'Dexterity',
            modifier: 1,
            bonus: 'Profane'
          },
          {
            name: 'Constitution',
            modifier: 1,
            bonus: 'Profane'
          },
          {
            name: 'Intelligence',
            modifier: 1,
            bonus: 'Profane'
          },
          {
            name: 'Wisdom',
            modifier: 1,
            bonus: 'Profane'
          },
          {
            name: 'Charisma',
            modifier: 1,
            bonus: 'Profane'
          },
          {
            name: 'Attack Rolls',
            modifier: 1,
            bonus: 'Profane'
          },
          {
            name: 'Damage',
            modifier: 1,
            bonus: 'Profane'
          }
        ]
      },
      {
        name: 'Forbidden Knowledge',
        numPiecesEquipped: 5,
        enhancements: [
          {
            name: 'Melee Power',
            modifier: 5,
            bonus: 'Profane'
          },
          {
            name: 'Ranged Power',
            modifier: 5,
            bonus: 'Profane'
          },
          {
            name: 'Spell Power: Universal',
            modifier: 10,
            bonus: 'Profane'
          },
          {
            name: 'Spell DCs',
            modifier: 1,
            bonus: 'Profane'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 10
      }
    ]
  },
  {
    name: 'Awaken Set Bonus: Legendary Heart of Blades',
    quantity: 1,
    description: 'Takes a Lost Purpose item and gives it the Legendary Heart of Blades Set Bonus',
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: 'Legendary Heart of Blades',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Positive Healing Amplification',
            modifier: 30,
            bonus: 'Artifact'
          },
          {
            name: 'Repair Amplification',
            modifier: 30,
            bonus: 'Artifact'
          },
          {
            name: 'Spell Power: Repair',
            bonus: 'Artifact',
            modifier: 30
          },
          {
            name: 'Spell Power: Rust',
            bonus: 'Artifact',
            modifier: 30
          },
          {
            name: 'Strikethrough Chance',
            modifier: '15%',
            bonus: 'Artifact'
          },
          {
            name: 'Melee Power',
            modifier: 15,
            bonus: 'Artifact'
          },
          {
            name: 'Ranged Power',
            modifier: 15,
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 20
      }
    ]
  },
  {
    name: "Awaken Set Bonus: Legendary Vol's Influence",
    quantity: 1,
    description: "Takes a Lost Purpose item and gives it the Legendary Vol's Influence Set Bonus",
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: "Legendary Vol's Influence",
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Spell Power: Universal',
            modifier: 25,
            bonus: 'Artifact'
          },
          {
            name: 'Spell Critical Chance',
            modifier: '6%',
            bonus: 'Artifact'
          },
          {
            name: 'Spell Critical Damage',
            modifier: '15%',
            bonus: 'Legendary'
          },
          {
            name: 'Spell DCs',
            modifier: 3,
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 20
      }
    ]
  },
  {
    name: "Awaken Set Bonus: Legendary The Fury's Rage",
    quantity: 1,
    description: "Takes a Lost Purpose item and gives it the Legendary The Fury's Rage Set Bonus",
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: "Legendary The Fury's Rage",
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Physical Resistance',
            modifier: 30,
            bonus: 'Artifact'
          },
          {
            name: 'Melee Threat Multiplier',
            modifier: '100%',
            bonus: 'Artifact'
          },
          {
            name: 'Helpless Damage Bonus',
            modifier: '15%',
            bonus: 'Artifact'
          },
          {
            name: 'Melee Power',
            modifier: 15,
            bonus: 'Artifact'
          },
          {
            name: 'Ranged Power',
            modifier: 15,
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 20
      }
    ]
  },
  {
    name: 'Awaken Set Bonus: Legendary Delight of the Devourer',
    quantity: 1,
    description: 'Takes a Lost Purpose item and gives it the Legendary Delight of the Devourer Set Bonus',
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: 'Legendary Delight of the Devourer',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Spell Power: Universal',
            modifier: 25,
            bonus: 'Artifact'
          },
          {
            name: 'Spell Critical Chance',
            modifier: '6%',
            bonus: 'Artifact'
          },
          {
            name: 'Spell Critical Damage',
            modifier: '15%',
            bonus: 'Legendary'
          },
          {
            name: 'Helpless Damage Bonus',
            modifier: '15%',
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 20
      }
    ]
  },
  {
    name: 'Awaken Set Bonus: Legendary Minion of the Mockery',
    quantity: 1,
    description: 'Takes a Lost Purpose item and gives it the Legendary Minion of the Mockery Set Bonus',
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: 'Legendary Minion of the Mockery',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Melee Power',
            modifier: 15,
            bonus: 'Artifact'
          },
          {
            name: 'Ranged Power',
            modifier: 15,
            bonus: 'Artifact'
          },
          {
            name: 'Assassinate DC',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Dodge Chance',
            modifier: '10%',
            bonus: 'Artifact'
          },
          {
            name: 'Sneak Attack Bonus',
            modifier: 3,
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 20
      }
    ]
  },
  {
    name: "Awaken Set Bonus: Legendary The Keeper's Coffin",
    quantity: 1,
    description: "Takes a Lost Purpose item and gives it the Legendary The Keeper's Coffin Set Bonus",
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: "Legendary The Keeper's Coffin",
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Spell DCs',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Spell Penetration (Level 9)',
            modifier: 10,
            bonus: 'Artifact'
          },
          {
            name: 'Positive Amplification',
            modifier: 30,
            bonus: 'Artifact'
          },
          {
            name: 'Negative Amplification',
            modifier: 30,
            bonus: 'Artifact'
          },
          {
            name: 'Strength',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Dexterity',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Constitution',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Intelligence',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Wisdom',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Charisma',
            modifier: 3,
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 20
      }
    ]
  },
  {
    name: "Awaken Set Bonus: Legendary The Shadow's Emptiness",
    quantity: 1,
    description: "Takes a Lost Purpose item and gives it the Legendary The Shadow's Emptiness Set Bonus",
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: "Legendary The Shadow's Emptiness",
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Doublestrike Chance',
            modifier: '15%',
            bonus: 'Artifact'
          },
          {
            name: 'Doubleshot Chance',
            modifier: '15%',
            bonus: 'Artifact'
          },
          {
            name: 'Imbue Dice',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Spell Power: Universal',
            modifier: 25,
            bonus: 'Artifact'
          },
          {
            name: 'Magical Resistance',
            modifier: 30,
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 20
      }
    ]
  },
  {
    name: "Awaken Set Bonus: Legendary The Traveler's Guidance",
    quantity: 1,
    description: "Takes a Lost Purpose item and gives it the The Legendary Traveler's Guidance Set Bonus",
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: "Legendary The Traveler's Guidance",
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'All Saving Throws',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Tactical Feat DC',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Melee Power',
            modifier: 15,
            bonus: 'Artifact'
          },
          {
            name: 'Ranged Power',
            modifier: 15,
            bonus: 'Artifact'
          },
          {
            name: 'Helpless Damage Bonus',
            modifier: '15%',
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 20
      }
    ]
  },
  {
    name: 'Awaken Set Bonus: Legendary Armaments of the Archons',
    quantity: 1,
    description: 'Takes a Lost Purpose item and gives it the Legendary Armaments of the Archons Set Bonus',
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: 'Legendary Armaments of the Archons',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Physical Resistance',
            modifier: 30,
            bonus: 'Artifact'
          },
          {
            name: 'Magical Resistance',
            modifier: 30,
            bonus: 'Artifact'
          },
          {
            name: 'Armor Class',
            modifier: '15%',
            bonus: 'Artifact'
          },
          {
            name: 'Maximum Hit Points',
            modifier: '10%',
            bonus: 'Legendary'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 20
      }
    ]
  },
  {
    name: "Awaken Set Bonus: Legendary Devils' Infernal Dance",
    quantity: 1,
    description: "Takes a Lost Purpose item and gives it the Legendary Devils' Infernal Dance Set Bonus",
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: "Legendary Devils' Infernal Dance",
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Strength',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Dexterity',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Constitution',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Intelligence',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Wisdom',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Charisma',
            modifier: 3,
            bonus: 'Artifact'
          },
          {
            name: 'Doublestrike Chance',
            modifier: '15%',
            bonus: 'Artifact'
          },
          {
            name: 'Doubleshot Chance',
            modifier: '15%',
            bonus: 'Artifact'
          },
          {
            name: 'Fortification Bypass Chance',
            modifier: '30%',
            bonus: 'Artifact'
          },
          {
            name: 'Melee Power',
            modifier: 15,
            bonus: 'Artifact'
          },
          {
            name: 'Ranged Power',
            modifier: 15,
            bonus: 'Artifact'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 20
      }
    ]
  },
  {
    name: 'Awaken Set Bonus: Legendary Forbidden Knowledge',
    quantity: 1,
    description: 'Takes a Lost Purpose item and gives it the Legendary Forbidden Knowledge Set Bonus',
    effectsRemoved: [
      {
        name: 'Lost Purpose'
      }
    ],
    setBonus: [
      {
        name: 'Legendary Forbidden Knowledge',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Physical Resistance',
            modifier: 30,
            bonus: 'Profane'
          }
        ]
      },
      {
        name: 'Forbidden Knowledge',
        numPiecesEquipped: 4,
        enhancements: [
          {
            name: 'Strength',
            modifier: 3,
            bonus: 'Profane'
          },
          {
            name: 'Dexterity',
            modifier: 3,
            bonus: 'Profane'
          },
          {
            name: 'Constitution',
            modifier: 3,
            bonus: 'Profane'
          },
          {
            name: 'Intelligence',
            modifier: 3,
            bonus: 'Profane'
          },
          {
            name: 'Wisdom',
            modifier: 3,
            bonus: 'Profane'
          },
          {
            name: 'Charisma',
            modifier: 3,
            bonus: 'Profane'
          },
          {
            name: 'Attack Rolls',
            modifier: 4,
            bonus: 'Profane'
          },
          {
            name: 'Damage',
            modifier: 4,
            bonus: 'Profane'
          }
        ]
      },
      {
        name: 'Forbidden Knowledge',
        numPiecesEquipped: 5,
        enhancements: [
          {
            name: 'Melee Power',
            modifier: 15,
            bonus: 'Profane'
          },
          {
            name: 'Ranged Power',
            modifier: 15,
            bonus: 'Profane'
          },
          {
            name: 'Spell Power: Universal',
            modifier: 25,
            bonus: 'Profane'
          },
          {
            name: 'Spell DCs',
            modifier: 3,
            bonus: 'Profane'
          }
        ]
      }
    ],
    requirements: [
      {
        name: 'Compatible Item',
        quantity: 1
      },
      {
        name: 'Esoteric Relic',
        quantity: 20
      }
    ]
  }
]
