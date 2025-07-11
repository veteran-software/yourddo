import type { SetBonus } from '../types/crafting.ts'

const setBonuses: SetBonus[] = [
  {
    name: "The Legendary Dread Isle's Curse",
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
        name: 'Universal Spellpower',
        modifier: 25,
        bonus: 'Profane'
      },
      {
        name: 'Physical Resistance Rating',
        modifier: 30,
        bonus: 'Profane'
      },
      {
        name: 'Spell DCs',
        modifier: 2,
        bonus: 'Profane'
      },
      {
        name: 'Ability Scores',
        modifier: 2,
        bonus: 'Profane'
      },
      {
        name: 'Attack',
        modifier: 3,
        bonus: 'Profane'
      },
      {
        name: 'Damage',
        modifier: 3,
        bonus: 'Profane'
      }
    ]
  },
  {
    name: 'Dread Stalker',
    numPiecesEquipped: 3,
    enhancements: [
      {
        name: 'Sneak Attack Dice',
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
        name: 'Doublestrike',
        modifier: '15%',
        bonus: 'Artifact'
      },
      {
        name: 'Doubleshot',
        modifier: '15%',
        bonus: 'Artifact'
      },
      {
        name: 'Damage vs Helpless',
        modifier: '15%',
        bonus: 'Artifact'
      }
    ]
  },
  {
    name: 'Defender Of Tanaroa',
    numPiecesEquipped: 3,
    enhancements: [
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
        name: 'Repair Amplification',
        modifier: 30,
        bonus: 'Artifact'
      },
      {
        name: 'Universal Spell Critical Chance',
        modifier: '6%',
        bonus: 'Artifact'
      },
      {
        name: 'Universal Spellpower',
        modifier: 25,
        bonus: 'Artifact'
      },
      {
        name: 'Magical Resistance Rating',
        modifier: 30,
        bonus: 'Artifact'
      }
    ]
  },
  {
    name: 'Echoes Of The Walking Ancestors',
    numPiecesEquipped: 3,
    enhancements: [
      {
        name: 'Imbue Dice',
        modifier: 3,
        bonus: 'Artifact'
      },
      {
        name: 'Spell DCs',
        modifier: 3,
        bonus: 'Artifact'
      },
      {
        name: 'Tactical DCs',
        modifier: 3,
        bonus: 'Artifact'
      },
      {
        name: 'Assassinate DC',
        modifier: 3,
        bonus: 'Artifact'
      },
      {
        name: 'Ability Scores',
        modifier: 3,
        bonus: 'Artifact'
      }
    ]
  },
  {
    name: 'Devastation of the Firemouth',
    numPiecesEquipped: 3,
    enhancements: [
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
        name: 'Repair Amplification',
        modifier: 30,
        bonus: 'Artifact'
      },
      {
        name: 'Physical Resistance Rating',
        modifier: 30,
        bonus: 'Artifact'
      },
      {
        name: 'Armor Class',
        modifier: '15%',
        bonus: 'Artifact'
      },
      {
        name: 'Threat Generation',
        modifier: '100%',
        bonus: 'Artifact'
      }
    ]
  },
  {
    name: 'Deacon of the Auricular',
    numPiecesEquipped: 3,
    enhancements: [
      {
        name: 'Universal Spell Critical Chance',
        modifier: '6%',
        bonus: 'Artifact'
      },
      {
        name: 'Universal Spellpower',
        modifier: 25,
        bonus: 'Artifact'
      },
      {
        name: 'Spell Critical Damage',
        modifier: '15%',
        bonus: 'Legendary'
      },
      {
        name: 'Magical Resistance Rating Cap',
        modifier: 30,
        bonus: 'Artifact'
      }
    ]
  },
  {
    name: "The Legendary Dread Isle's Curse",
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
        name: 'Universal Spellpower',
        modifier: 25,
        bonus: 'Profane'
      },
      {
        name: 'Physical Resistance Rating',
        modifier: 30,
        bonus: 'Profane'
      },
      {
        name: 'Spell DCs',
        modifier: 2,
        bonus: 'Profane'
      },
      {
        name: 'Ability Scores',
        modifier: 2,
        bonus: 'Profane'
      },
      {
        name: 'To-Hit Chance',
        modifier: 3,
        bonus: 'Profane'
      },
      {
        name: 'Damage',
        modifier: 3,
        bonus: 'Profane'
      }
    ]
  }
]

export const findSetBonus = (name: string): SetBonus =>
  setBonuses.find((setBonus) => setBonus.name === name) ?? { name: 'Unknown Set Bonus' }
