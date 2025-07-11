import type { CraftingIngredient } from '../../../types/crafting.ts'
import { armorList, clothingList, jewelryList, shieldList } from '../../basics/armor.ts'
import { meleeWeapons, rangedWeapons, throwingWeapons } from '../../basics/weapons.ts'
import { findSetBonus } from '../../setBonuses.ts'

export const namedItems: CraftingIngredient[] = [
  {
    name: "Legendary Admiral's Cummerbund",
    ingredientType: 'Belt',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Parrying',
        modifier: 6,
        bonus: 'Insight'
      },
      {
        name: 'Lawful Absorption',
        modifier: '23%',
        bonus: 'Enhancement'
      },
      {
        name: 'Chaotic Absorption',
        modifier: '23%',
        bonus: 'Enhancement'
      }
    ],
    augments: [
      {
        isleOfDreadClawAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's  Curse")],
    foundIn: ['The Trouble with Tar Pits (Legendary)']
  },
  {
    name: "Legendary Admiral's Gloves",
    ingredientType: 'Gloves',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    effectsAdded: [
      {
        name: 'Illusion Focus',
        modifier: 6,
        bonus: 'Equipment'
      },
      {
        name: 'Wizardry',
        modifier: 286,
        bonus: 'Enhancement'
      },
      {
        name: 'Will Save',
        modifier: 12,
        bonus: 'Resistance'
      }
    ],
    augments: [
      {
        isleOfDreadScaleAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's  Curse")],
    foundIn: ['The Isle of Dread (Legendary) (rare chests)']
  },
  {
    name: "Legendary Admiral's Gumshoes",
    ingredientType: 'Boots',
    minimumLevel: 31,
    foundIn: ['Captive of the Hidden God (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Speed +30%',
        bonus: 'Enhancement',
        description: '+30% Enhancement bonus to Movement speed and +15% bonus to Attack speed.',
        type: 'Prefix'
      },
      {
        name: 'Seeker +14',
        bonus: 'Enhancement',
        description: '+14 Enhancement bonus to confirm critical hits, and damage (before multiplier) on critical hits.',
        type: 'Suffix'
      },
      {
        name: 'Deception +11',
        bonus: 'Enhancement',
        description:
          '+11 Enhancement bonus to hit and +17 Enhancement bonus to damage to attacks that qualify as Sneak Attacks.',
        type: 'Suffix'
      }
    ],
    augments: [
      {
        isleOfDreadScaleAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's  Curse")]
  },
  {
    name: 'Legendary Beachcombers',
    ingredientType: 'Boots',
    minimumLevel: 31,
    foundIn: ['Whispers of Return (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Speed +30%',
        bonus: 'Enhancement',
        description: '+30% Enhancement bonus to Movement speed and +15% bonus to Attack speed.',
        type: 'Prefix'
      },
      {
        name: 'Dodge +14%',
        bonus: 'Enhancement',
        description: '+14% Enhancement bonus to Dodge.',
        type: 'Suffix'
      },
      {
        name: 'Reflex Save +12',
        bonus: 'Resistance',
        description: '+12 Resistance bonus to Reflex saves.',
        type: 'Suffix'
      }
    ],
    augments: [
      {
        isleOfDreadScaleAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's  Curse")]
  },
  {
    name: 'Legendary Belt of the Black Sands',
    ingredientType: 'Belt',
    minimumLevel: 31,
    foundIn: ['The Isle of Dread (Heroic), Any Rare Chest'],
    effectsAdded: [
      {
        name: 'Constitution +14',
        bonus: 'Enhancement',
        description: 'Passive: +14 Enhancement bonus to Constitution.',
        type: 'Prefix'
      },
      {
        name: 'Invisibility Guard',
        bonus: 'Special',
        description:
          'Chance to grant temporary invisibility when hit; persists through attacks or damage for 10 seconds.',
        type: 'Suffix'
      },
      {
        name: 'Ghostly',
        bonus: 'Special',
        description:
          'Partially incorporeal: melee and missile attacks bypass incorporeal miss chance; enemies have 10% chance to miss; +5 Enhancement bonus to Hide and Move Silently.',
        type: 'Suffix'
      }
    ],
    augments: [
      {
        isleOfDreadClawAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's  Curse")]
  },
  {
    name: 'Legendary Birchlore Gauntlets',
    ingredientType: 'Bracers',
    minimumLevel: 31,
    foundIn: ['Spiders and Flies (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Healing Lore +22%',
        bonus: 'Equipment',
        description: 'Passive: Your Healing spells gain a +22% Equipment bonus to their chance to Critical Hit.',
        type: 'Prefix'
      },
      {
        name: 'Devotion +149',
        bonus: 'Equipment',
        description: 'Passive: +149 Equipment bonus to Positive Spell Power.',
        type: 'Suffix'
      },
      {
        name: 'Vitality +47',
        bonus: 'Enhancement',
        description: 'Passive: +47 Vitality bonus to Hit Points.',
        type: 'Suffix'
      }
    ],
    augments: [
      {
        isleOfDreadScaleAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Greenpine Gauntlets',
    ingredientType: 'Gloves',
    minimumLevel: 31,
    foundIn: ['The Curse and the Captive Crustacean (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Natural Armor +14',
        bonus: 'Armor',
        description: 'Passive: +14 Natural Armor bonus to Armor Class.',
        type: 'Prefix'
      },
      {
        name: 'Shield Bonus +14',
        bonus: 'Shield',
        description:
          'While this item is equipped, you are partially protected by a field of magical force which can deflect enemy attacks. This item provides a +14 Shield bonus to Armor Class. It does not shack with an equipped shield.',
        type: 'Suffix'
      },
      {
        name: 'Fortitude Save +12',
        bonus: 'Resistance',
        description: 'This item gives a +12 Resistance bonus to your Fortitude saves.',
        type: 'Suffix'
      }
    ],
    augments: [
      {
        isleOfDreadScaleAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Magma Waders',
    ingredientType: 'Boots',
    minimumLevel: 31,
    foundIn: ['The Trouble with Tar Pits (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Speed +30%',
        bonus: 'Enhancement',
        description: '+30% Enhancement bonus to Movement speed and +15% bonus to Attack speed.',
        type: 'Prefix'
      },
      {
        name: 'Fire Absorption +36%',
        bonus: 'Enhancement',
        description: '36% Enhancement Bonus to fire absorption.',
        type: 'Suffix'
      },
      {
        name: 'Fire Resistance +53',
        bonus: 'Enhancement',
        description: '+53 Enhancement bonus to Resist Fire.',
        type: 'Suffix'
      }
    ],
    augments: [
      {
        isleOfDreadScaleAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Seaweed-woven Belt',
    ingredientType: 'Belt',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 12401
    },
    weight: 0.1,
    description: 'Seaweed, when dried and woven together, can form a relatively strong canvas.',
    foundIn: ['Whispers of Return (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Spell Resistance +40',
        bonus: 'Enhancement',
        description: '+40 Enhancement bonus to Spell Resistance.',
        type: 'Prefix'
      },
      {
        name: 'Spell Saves +11',
        bonus: 'Resistance',
        description: '+11 Resistance bonus to your saves versus spells.',
        type: 'Prefix'
      },
      {
        name: 'Potency +103',
        bonus: 'Equipment',
        description: 'Passive: +103 Equipment Bonus to All Types of Spell Power.',
        type: 'Prefix'
      }
    ],
    augments: [
      {
        isleOfDreadClawAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: "Legendary Admiral's Wristwatch",
    ingredientType: 'Bracers',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: { platinum: 12401 },
    weight: 0.1,
    description:
      "This bracer features a small watch and an intricate compass sewn into the lining. It's perfect for finding your way in the storms.",
    foundIn: ["Plundering Pirates' Point (Legendary) – End Chest"],
    effectsAdded: [
      {
        name: 'Armor-Piercing +21%',
        bonus: 'Enhancement',
        description: '+21% Enhancement bonus to bypass enemy fortification.',
        type: 'Prefix'
      },
      {
        name: 'Accuracy +21',
        bonus: 'Competence',
        description: '+21 Competence bonus to your attack rolls.',
        type: 'Prefix'
      },
      {
        name: 'Deadly +11',
        bonus: 'Competence',
        description: '+11 Competence bonus to weapon damage.',
        type: 'Suffix'
      }
    ],
    augments: [
      {
        isleOfDreadScaleAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Bronzed Bracers',
    ingredientType: 'Bracers',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: { platinum: 12401 },
    weight: 0.1,
    description: 'Heavy bronze makes a mighty defensive tool.',
    foundIn: ['Fall of the Forbidden Temple (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Protection +11',
        bonus: 'Shield',
        description: 'This item protects its wearer by granting a +11 deflection bonus to AC.',
        type: 'Prefix'
      },
      {
        name: 'Repair Lore +22%',
        bonus: 'Equipment',
        description:
          'Passive: Your Repair and Rust spells gain a +22% Equipment bonus to their chance to Critical Hit.',
        type: 'Prefix'
      },
      {
        name: 'Reconstruction +149',
        bonus: 'Equipment',
        description: 'Passive: +149 Equipment bonus to Repair Spell Power.',
        type: 'Suffix'
      }
    ],
    augments: [
      {
        isleOfDreadScaleAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Kopru Bracers',
    ingredientType: 'Bracers',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: { platinum: 12401 },
    weight: 0.1,
    description: 'Kopru are capricious, evil creatures. Treat this item with care.',
    foundIn: ['Bullywugs and Booby Traps (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Necromancy Focus',
        modifier: 6,
        bonus: 'Equipment',
        description: 'Passive: +6 Equipment bonus to DC of Necromancy spells.',
        type: 'Prefix'
      },
      {
        name: 'Illusion Focus',
        modifier: 6,
        bonus: 'Equipment',
        description: 'Passive: +6 Equipment bonus to DC of Illusion spells.',
        type: 'Prefix'
      },
      {
        name: 'Profane Lifeforce',
        modifier: 47,
        bonus: 'Profane',
        description: '+47 Profane bonus to Hit Points.',
        type: 'Suffix'
      }
    ],
    augments: [
      {
        isleOfDreadScaleAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Pendant of the Earth',
    ingredientType: 'Necklace',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: { platinum: 12401 },
    weight: 0.1,
    description: 'This weighty necklace carries energy from the earth.',
    foundIn: ['Wild Thing (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Insightful Corrosion',
        modifier: 74,
        bonus: 'Insight',
        description: 'Passive: +74 Insight bonus to Acid Spell Power.',
        type: 'Prefix'
      },
      {
        name: 'Insightful Impulse',
        modifier: 74,
        bonus: 'Insight',
        description: 'Passive: +74 Insight bonus to Force, Physical, and Untyped Spells Spell Power.',
        type: 'Prefix'
      },
      {
        name: 'Insightful Combustion',
        modifier: 74,
        bonus: 'Insight',
        description: 'Passive: +74 Insight bonus to Fire Spell Power.',
        type: 'Prefix'
      }
    ],
    augments: [
      {
        isleOfDreadFangAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Pendant of the Sea',
    ingredientType: 'Necklace',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: { platinum: 12401 },
    weight: 0.1,
    description: 'This weighty necklace carries energy from the ocean.',
    foundIn: ['All Hail the King (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Insightful Resonance +74',
        modifier: 74,
        bonus: 'Insight',
        description: 'Passive: +74 Insight bonus to Sonic Spell Power.',
        type: 'Prefix'
      },
      {
        name: 'Insightful Glaciation +74',
        modifier: 74,
        bonus: 'Insight',
        description: 'Passive: +74 Insight bonus to Cold Spell Power.',
        type: 'Prefix'
      },
      {
        name: 'Insightful Magnetism +74',
        modifier: 74,
        bonus: 'Insight',
        description: 'Passive: +74 Insight bonus to Electric Spell Power.',
        type: 'Prefix'
      }
    ],
    augments: [
      {
        isleOfDreadFangAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Pendant of the Sky',
    ingredientType: 'Necklace',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: { platinum: 12401 },
    weight: 0.1,
    description: 'This weighty necklace carries energy from the sky.',
    foundIn: ['The Stone Crypt Chronicle (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Insightful Devotion +74',
        modifier: 74,
        bonus: 'Insight',
        description: 'Passive: +74 Insight bonus to Positive Spell Power.',
        type: 'Prefix'
      },
      {
        name: 'Insightful Radiance +74',
        modifier: 74,
        bonus: 'Insight',
        description: 'Passive: +74 Insight bonus to Light and Alignment Spell Power.',
        type: 'Prefix'
      },
      {
        name: 'Insightful Nullification +74',
        modifier: 74,
        bonus: 'Insight',
        description: 'Passive: +74 Insight bonus to Negative Energy and Poison Spell Power.',
        type: 'Prefix'
      }
    ],
    augments: [
      {
        isleOfDreadFangAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Red Raptor Feather',
    ingredientType: 'Trinket',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: { platinum: 12420 },
    weight: 0.1,
    description: 'A red plumed feather from a raptor of the Isle of Dread.',
    foundIn: ['Captive of the Hidden God (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Insightful Deception +5',
        modifier: 5,
        bonus: 'Insight',
        description: '+5 Insight bonus to hit and +8 Insight bonus to damage to attacks that qualify as Sneak Attacks.',
        type: 'Prefix'
      },
      {
        name: 'Quality Assassinate +3',
        modifier: 3,
        bonus: 'Quality',
        description: "This effect gives a +3 quality bonus to the DC to resist the character's Assassinate attempts.",
        type: 'Prefix'
      },
      {
        name: 'Lesser Displacement',
        bonus: 'Special',
        description:
          'Equipping this item causes the light to distort around you. Attacks from enemies have a 25% chance to miss due to concealment.',
        type: 'Suffix'
      }
    ],
    augments: [
      {
        isleOfDreadFangAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Signet Ring of the Earth',
    ingredientType: 'Ring',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: { platinum: 12401 },
    weight: 0.1,
    description: 'This weighty ring carries energy from the earth.',
    foundIn: ['Spiders and Flies (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Corrosion +149',
        modifier: 149,
        bonus: 'Equipment',
        description: 'Passive: +149 Equipment bonus to Acid Spell Power.',
        type: 'Prefix'
      },
      {
        name: 'Impulse +149',
        modifier: 149,
        bonus: 'Equipment',
        description: 'Passive: +149 Equipment bonus to Force, Physical, and Untyped Spells Spell Power.',
        type: 'Prefix'
      },
      {
        name: 'Combustion +149',
        modifier: 149,
        bonus: 'Equipment',
        description: 'Passive: +149 Equipment bonus to Fire Spell Power.',
        type: 'Prefix'
      }
    ],
    augments: [
      {
        isleOfDreadClawAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Signet Ring of the Sea',
    ingredientType: 'Ring',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: { platinum: 12401 },
    weight: 0.1,
    description: 'This weighty ring carries energy from the ocean.',
    foundIn: ["Plundering Pirates' Point (Legendary) – End Chest"],
    effectsAdded: [
      {
        name: 'Resonance +149',
        modifier: 149,
        bonus: 'Equipment',
        description: 'Passive: +149 Equipment bonus to Sonic Spell Power.',
        type: 'Prefix'
      },
      {
        name: 'Glaciation +149',
        modifier: 149,
        bonus: 'Equipment',
        description: 'Passive: +149 Equipment bonus to Cold Spell Power.',
        type: 'Prefix'
      },
      {
        name: 'Magnetism +149',
        modifier: 149,
        bonus: 'Equipment',
        description: 'Passive: +149 Equipment bonus to Electric Spell Power.',
        type: 'Prefix'
      }
    ],
    augments: [
      {
        isleOfDreadClawAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Signet Ring of the Sky',
    ingredientType: 'Ring',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: { platinum: 12401 },
    weight: 0.1,
    description: 'This weighty ring carries energy from the sky.',
    foundIn: ['The Curse and the Captive Crustacean (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Devotion +149',
        modifier: 149,
        bonus: 'Equipment',
        description: 'Passive: +149 Equipment bonus to Positive Spell Power.',
        type: 'Prefix'
      },
      {
        name: 'Radiance +149',
        modifier: 149,
        bonus: 'Equipment',
        description: 'Passive: +149 Equipment bonus to Light and Alignment Spell Power.',
        type: 'Prefix'
      },
      {
        name: 'Nullification +149',
        modifier: 149,
        bonus: 'Equipment',
        description: 'Passive: +149 Equipment bonus to Negative Energy and Poison Spell Power.',
        type: 'Prefix'
      }
    ],
    augments: [
      {
        isleOfDreadClawAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: "Legendary Bottle o' Rum",
    ingredientType: 'Dagger',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 12400,
      gold: 2
    },
    weight: 1.0,
    description: 'This broken glass bottle carries quite the sharp edge.',
    foundIn: ['Captive of the Hidden God (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Enhancement Bonus',
        modifier: 15,
        bonus: 'Enhancement',
        description:
          'Weapons and Shields: +15 Enhancement Bonus Attack and Damage rolls. Armor and Shields: +15 enhancement bonus to Armor Class.',
        type: 'Prefix'
      },
      {
        name: 'Sovereign Vorpal',
        type: 'Prefix',
        description:
          'Passive: +0.5[W] damage dice.\nOn Vorpal Hit: If your target has fewer than 3000 Hit Points, they are Instantly Slain. If your target has above 3000 Hit Points, they take 300 damage.'
      },
      {
        name: 'Bleeding',
        modifier: 6,
        bonus: 'Special',
        description:
          'This weapon is cruelly sharp and will do an additional 6d8 damage to targets that are vulnerable to bleeding.',
        type: 'Suffix'
      },
      {
        name: 'Tendon Slice',
        modifier: 11,
        bonus: 'Special',
        description: "On Hit: 6% chance to slow target's movement by 50% for 11 seconds.",
        type: 'Suffix'
      }
    ],
    augments: [
      {
        isleOfDreadScaleAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: "Legendary Captain's Spyglass",
    ingredientType: 'Club',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: { platinum: 12400 },
    weight: 3.0,
    description: 'Looking through the lenses of this Spyglass fills you with quite the sense of intrigue.',
    foundIn: [
      'All Hail the King (Legendary) – Any Chest',
      'Bullywugs and Booby Traps (Legendary) – Any Chest',
      'Captive of the Hidden God (Legendary) – Any Chest',
      'Fall of the Forbidden Temple (Legendary) – Any Chest',
      "Plundering Pirates' Point (Legendary) – Any Chest",
      'Skeletons in the Closet (Legendary) – Any Chest',
      'Spiders and Flies (Legendary) – Any Chest',
      'The Curse and the Captive Crustacean (Legendary) – Any Chest',
      'The Stone Crypt Chronicle (Legendary) – Any Chest',
      'The Trouble with Tar Pits (Legendary) – Any Chest',
      'Trials of the Triceratops (Legendary) – Any Chest',
      'Whispers of Return (Legendary) – Any Chest',
      'Wild Thing (Legendary) – Any Chest',
      'The Isle of Dread (Legendary) – Any Rare Chest'
    ],
    effectsAdded: [
      {
        name: 'Spellcasting Implement',
        modifier: 31,
        bonus: 'Implement',
        description: 'Passive: +31 Implement bonus to Universal Spell Power.',
        type: 'Prefix'
      },
      {
        name: 'Enhancement Bonus',
        modifier: 15,
        bonus: 'Enhancement',
        description:
          'Weapons and Shields: +15 Enhancement Bonus Attack and Damage rolls. Armor and Shields: +15 enhancement bonus to Armor Class.',
        type: 'Prefix'
      },
      {
        name: 'Spell Focus Mastery',
        modifier: 5,
        bonus: 'Equipment',
        description: 'Passive: +5 Equipment bonus to DC of all spells.',
        type: 'Prefix'
      },
      {
        name: 'Potency',
        modifier: 103,
        bonus: 'Equipment',
        description:
          'Passive: +103 Equipment Bonus to All Types of Spell Power. (Universal Spell Power is a different statistic.)',
        type: 'Prefix'
      },
      {
        name: 'Spot',
        modifier: 21,
        bonus: 'Competence',
        description: '+21 Competence bonus to Spot.',
        type: 'Suffix'
      },
      {
        name: 'Good Luck',
        modifier: 4,
        bonus: 'Luck',
        description: 'This item gives a +4 Luck bonus to all saves and skill checks.',
        type: 'Suffix'
      },
      {
        name: 'Silver, Alchemical',
        bonus: 'Alchemical',
        description:
          'A complex process involving metallurgy and alchemy can bond silver to a weapon made of steel so that it bypasses the protective damage reduction of creatures such as lycanthropes and vampires.'
      }
    ],
    augments: [
      {
        isleOfDreadScaleAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: "Legendary Commodore Alaina's Cutlass",
    ingredientType: 'Scimitar',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: { platinum: 12402 },
    weight: 4.0,
    description: 'This beautiful cutlass cuts through anything as if it were air.',
    foundIn: ["Plundering Pirates' Point (Legendary) – End Chest"],
    effectsAdded: [
      {
        name: 'Enhancement Bonus',
        modifier: 15,
        bonus: 'Enhancement',
        description:
          'Weapons and Shields: +15 Enhancement Bonus Attack and Damage rolls. Armor and Shields: +15 enhancement bonus to Armor Class.',
        type: 'Prefix'
      },
      {
        name: 'Axiomatic Burst',
        modifier: 6,
        description:
          'This weapon is an implement of law, dealing 6d6 Law damage on a successful hit, and an additional 15d6 Law damage on a critical hit. This effect makes the weapon lawfully aligned. Chaotic characters wielding this weapon will suffer one negative level.',
        type: 'Prefix'
      },
      {
        name: 'Shocking Blast',
        modifier: 6,
        description:
          'This weapon is sheathed in Electricity, dealing 6d6 Electricity damage a successful hit, and an additional 6d6 Electricity damage on a critical hit.',
        type: 'Prefix'
      },
      {
        name: 'Riposte VI',
        description:
          'When missed by an attack: Deals 6d4 damage to your attacker. Passive: +3 Insight Bonus to Armor Class, +3 Insight bonus to Fortitude, Reflex, and Will Saving Throws.',
        type: 'Prefix'
      },
      {
        name: 'Dodge',
        modifier: '14%',
        bonus: 'Enhancement',
        description: 'Passive: +14% bonus to Dodge.',
        type: 'Suffix'
      }
    ],
    augments: [
      {
        isleOfDreadScaleWeapon: null,
        red: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Fimbric, Lost Longsword',
    ingredientType: 'Longsword',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 12403,
      gold: 5
    },
    weight: 4.0,
    description: "This sword's name is spelled in Dwarvish Runes carefully etched into its silver blade.",
    foundIn: ['Bullywugs and Booby Traps (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Enhancement Bonus',
        modifier: 15,
        bonus: 'Enhancement',
        description:
          'Weapons and Shields: +15 Enhancement Bonus Attack and Damage rolls. Armor and Shields: +15 enhancement bonus to Armor Class.',
        type: 'Prefix'
      },
      {
        name: 'Axiomatic Burst',
        modifier: 6,
        description:
          'This weapon is an implement of law, dealing 6d6 Law damage on a successful hit, and an additional 6d6 Law damage on a critical hit. This effect makes the weapon lawfully aligned. Chaotic characters wielding this weapon will suffer one negative level.',
        type: 'Prefix'
      },
      {
        name: 'Holy',
        modifier: 6,
        bonus: 'Divine',
        description:
          'This weapon is wielded by the pure to smite the wicked, dealing an additional 6d6 good damage on each hit. This effect makes this weapon good aligned. Evil characters wielding this weapon will suffer one negative level.',
        type: 'Prefix'
      },
      {
        name: 'Ghost Touch',
        bonus: 'Special',
        description:
          "An incorporeal creature's 50% chance to avoid damage does not apply to attacks with ghost touch weapons.",
        type: 'Prefix'
      },
      {
        name: 'Silver, Alchemical',
        bonus: 'Alchemical',
        description:
          'A complex process involving metallurgy and alchemy can bond silver to a weapon made of steel so that it bypasses the protective damage reduction of creatures such as lycanthropes and vampires.',
        type: '--Crafting'
      }
    ],
    spell: {
      name: 'Feather Fall',
      description: 'Causes an ally to fall slowly, although faster than feathers typically do.',
      casterLevel: 10,
      charges: 3,
      rechargePerDay: 3,
      target: ['Friend', 'Self'],
      duration: '30 Seconds + 6 Seconds per Caster Level',
      school: 'Transmutation'
    },
    augments: [
      {
        isleOfDreadScaleWeapon: null,
        red: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: "Legendary Ol' Reliable",
    ingredientType: 'Warhammer',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 12401,
      gold: 2
    },
    weight: 5.0,
    description: 'This hefty wooden hammer is everything you need to repair and maintain a seaworthy vessel.',
    foundIn: ['The Curse and the Captive Crustacean (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Enhancement Bonus',
        modifier: 15,
        bonus: 'Enhancement',
        description:
          'Weapons and Shields: +15 Enhancement Bonus Attack and Damage rolls. Armor and Shields: +15 enhancement bonus to Armor Class.',
        type: 'Prefix'
      },
      {
        name: 'Force Blast',
        modifier: 6,
        description:
          'This weapon is sheathed in Force, dealing 6d6 Force damage on a successful hit, and an additional 6d6 Force damage on a critical hit.',
        type: 'Prefix'
      },
      {
        name: 'Aligned',
        bonus: 'Special',
        description:
          'This weapon transmutes into a form that is able to bypass any alignment based Damage Reduction. (Chaotic, Good, Evil, Lawful)',
        type: 'Prefix'
      },
      {
        name: 'Melee Alacrity',
        modifier: '15%',
        description: 'The wielder of this item gains a 15% Enhancement bonus to melee attack speed.',
        type: 'Prefix'
      },
      {
        name: 'Human Bane',
        modifier: 6,
        description: 'This weapon deals 6d10 Bane damage against Humans.',
        type: 'Prefix'
      }
    ],
    augments: [
      {
        isleOfDreadScaleWeapon: null,
        red: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Rope and Pulley',
    ingredientType: 'Heavy Mace',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 12401,
      gold: 2
    },
    weight: 8.0,
    description: 'An old sailor\'s creed, "A ship\'s only as good as its weakest link," applies doubly so in a storm.',
    foundIn: ['Whispers of Return (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Enhancement Bonus',
        modifier: 15,
        bonus: 'Enhancement',
        description:
          'Weapons and Shields: +15 Enhancement Bonus Attack and Damage rolls. Armor and Shields: +15 enhancement bonus to Armor Class.',
        type: 'Prefix'
      },
      {
        name: 'Icy Blast',
        modifier: 6,
        description:
          'This weapon is sheathed in Cold, dealing 6d6 Cold damage on a successful hit and an additional 6d6 Cold damage on a critical hit.',
        type: 'Prefix'
      },
      {
        name: 'Frostbite',
        description:
          'On hit: applies stacks of Vulnerable (1% more damage per stack). On Vorpal: applies stacks of Lethargy (-1 to Saves, 5% slower speed).',
        type: 'Suffix'
      },
      {
        name: 'Legendary Slowburst',
        description: 'On critical hit: slows the target for 30 seconds (Will DC 100 negates).',
        type: 'Prefix'
      }
    ],
    augments: [
      {
        isleOfDreadScaleWeapon: null,
        red: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Shipbreaker',
    ingredientType: 'Maul',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 12401,
      gold: 2
    },
    weight: 10.0,
    description:
      'A mallet destined to repair a ship – or to destroy one. Its acidic and flaming enchantments are excellent against sturdy constructs.',
    foundIn: ['Fall of the Forbidden Temple (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Enhancement Bonus',
        modifier: 15,
        bonus: 'Enhancement',
        description:
          'Weapons and Shields: +15 Enhancement Bonus Attack and Damage rolls. Armor and Shields: +15 enhancement bonus to Armor Class.',
        type: 'Prefix'
      },
      {
        name: 'Construct Bane',
        modifier: 6,
        description: 'Deals 6d10 Bane damage against Constructs.',
        type: 'Prefix'
      },
      {
        name: 'Fiery',
        modifier: 6,
        description: 'This weapon deals an additional 6d6 Fire damage on each hit.',
        type: 'Prefix'
      },
      {
        name: 'Acidic',
        modifier: 6,
        description: 'This weapon deals an additional 6d6 Acid damage on each hit.',
        type: 'Prefix'
      }
    ],
    augments: [
      {
        isleOfDreadScaleWeapon: null,
        red: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Spearfisher',
    ingredientType: 'Quarterstaff',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 12400,
      copper: 2
    },
    weight: 4.0,
    description: 'This fishing spear makes for a fine weapon – or, in a pinch, a quick way to secure some lunch.',
    foundIn: ['Wild Thing (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Enhancement Bonus',
        modifier: 15,
        bonus: 'Enhancement',
        description:
          'Weapons and Shields: +15 Enhancement Bonus Attack and Damage rolls. Armor and Shields: +15 enhancement bonus to Armor Class.',
        type: 'Prefix'
      },
      {
        name: 'Animal Bane',
        modifier: 6,
        description: 'Deals 6d10 Bane damage against Animals.',
        type: 'Prefix'
      },
      {
        name: 'Tidal',
        modifier: 6,
        description:
          'This weapon deals an additional 6d6 points of water damage on a successful hit (double vs. Fire creatures).',
        type: 'Prefix'
      },
      {
        name: 'Cold Vulnerability',
        description: 'On hit: applies stacks of Cold Vulnerable (1% more damage per stack).',
        type: 'Suffix'
      },
      {
        name: 'Underwater Action',
        modifier: 21,
        bonus: 'Competence',
        description: '+21 Competence bonus to Swim and the ability to breathe underwater.',
        type: 'Suffix'
      }
    ],
    augments: [
      {
        isleOfDreadScaleWeapon: null,
        red: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Twinchopper',
    ingredientType: 'Greataxe',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: { platinum: 12402 },
    weight: 12,
    description: 'A greataxe worthy of your good name.',
    foundIn: ['Trials of the Triceratops (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Enhancement Bonus',
        modifier: 15,
        bonus: 'Enhancement',
        description:
          'Weapons and Shields: +15 Enhancement Bonus Attack and Damage rolls. Armor and Shields: +15 enhancement bonus to Armor Class.',
        type: 'Prefix'
      },
      {
        name: 'Sovereign Vorpal',
        type: 'Prefix',
        description:
          'Passive: +0.5[W] damage dice. On Vorpal Hit: If your target has fewer than 3000 Hit Points, they are Instantly Slain. If your target has above 3000 Hit Points, they take 300 damage.'
      }
    ],
    augments: [
      {
        isleOfDreadScaleWeapon: null,
        red: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Blue Raptor Feather',
    ingredientType: 'Trinket',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: { platinum: 12420 },
    weight: 0.1,
    description: 'A blue plumed feather from a raptor of the Isle of Dread.',
    foundIn: ['Trials of the Triceratops (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Sheltering',
        modifier: 35,
        bonus: 'Enhancement',
        description: '+35 Enhancement bonus to Physical and Magical Resistance Ratings.',
        type: 'Prefix'
      },
      {
        name: 'Resistance',
        modifier: 11,
        bonus: 'Resistance',
        description: 'Passive: +11 Resistance bonus to Fortitude, Reflex, and Will Saving Throws.',
        type: 'Prefix'
      },
      {
        name: 'Good Luck',
        modifier: 3,
        bonus: 'Luck',
        description: 'This item gives a +3 Luck bonus to all saves and skill checks.',
        type: 'Suffix'
      }
    ],
    augments: [
      {
        isleOfDreadFangAccessory: null,
        green: null,
        colorless: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'The Legendary Compass Rose',
    ingredientType: 'Shuriken',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 12400,
      silver: 2
    },
    weight: 0.5,
    description: 'This centerpoint of a great compass makes a great improvised weapon.',
    foundIn: ['The Stone Crypt Chronicle (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Enhancement Bonus',
        modifier: 15,
        bonus: 'Enhancement',
        description:
          'Weapons and Shields: +15 Enhancement Bonus Attack and Damage rolls. Armor and Shields: +15 enhancement bonus to Armor Class.',
        type: 'Prefix'
      },
      {
        name: 'Bleeding',
        modifier: 6,
        bonus: 'Special',
        description:
          'This weapon is cruelly sharp and will do an additional 6d8 damage to targets that are vulnerable to bleeding.',
        type: 'Suffix'
      },
      {
        name: 'Metalline',
        type: 'Prefix',
        description:
          'This weapon transmutes into a form that is able to bypass any metal based Damage Reduction. (Adamantine, Alchemical Silver, Byeshk, Cold Iron, or Mithril)'
      },
      {
        name: 'Spiked',
        type: 'Suffix',
        description:
          'This weapon is studded with vicious spikes, causing to to deal piercing damage in addition to its normal damage types.'
      }
    ],
    augments: [
      {
        isleOfDreadScaleWeapon: null,
        red: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Masthead',
    ingredientType: 'Great Crossbow',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: { platinum: 12410 },
    weight: 12,
    description:
      'This Great Crossbow was fashioned out of the ropes, sails, and pulleys from a crashed and sunken ship.',
    foundIn: ['All Hail the King (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Enhancement Bonus',
        modifier: 15,
        bonus: 'Enhancement',
        description:
          'Weapons and Shields: +15 Enhancement Bonus Attack and Damage rolls. Armor and Shields: +15 enhancement bonus to Armor Class.',
        type: 'Prefix'
      },
      {
        name: 'Legendary Cursespewing',
        type: 'Prefix',
        description:
          'On a natural 20 attack, this weapon lashes out with a vengeful curse that confers a -4 morale penalty on attack rolls, damage rolls, saving throws, and skill checks. This agonizing curse also causes the victim to take 6d6 damage every two seconds for a duration of twelve seconds. Additional vorpal strikes while this curse is active will extend the duration by another 12 seconds.'
      },
      {
        name: 'Aligned',
        type: 'Prefix',
        description:
          'This weapon transmutes into a form that is able to bypass any alignment based Damage Reduction. (Chaotic, Good, Evil, Lawful)'
      },
      {
        name: 'Ghost Touch',
        bonus: 'Special',
        description:
          "An incorporeal creature's 50% chance to avoid damage does not apply to attacks with ghost touch weapons.",
        type: 'Prefix'
      }
    ],
    augments: [
      {
        isleOfDreadScaleWeapon: null,
        red: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Firesplitter',
    ingredientType: 'Hand Axe',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 12400,
      gold: 6
    },
    weight: 3,
    description: 'Originally meant to cut firewood, this axe now burns with its own inner heat.',
    foundIn: ['The Trouble with Tar Pits (Legendary) – End Chest'],
    effectsAdded: [
      {
        name: 'Enhancement Bonus',
        modifier: 15,
        bonus: 'Enhancement',
        description:
          'Weapons and Shields: +15 Enhancement Bonus Attack and Damage rolls. Armor and Shields: +15 enhancement bonus to Armor Class.',
        type: 'Prefix'
      },
      {
        name: 'Flaming Blast',
        modifier: 6,
        type: 'Prefix',
        description:
          'This weapon is sheathed in Fire, dealing 6d6 Fire damage a successful hit, and an additional 6d6 Fire damage on a critical hit.'
      },
      {
        name: 'Incineration',
        type: 'Suffix',
        description:
          'This weapon stores the power of a raging inferno deep within. Occasionally, this destructive power comes to the surface, devastating enemies with massive fire damage.'
      },
      {
        name: 'Fire Absorption',
        modifier: '36%',
        bonus: 'Enhancement',
        description: '36% Enhancement Bonus to fire absorption.',
        type: 'Suffix'
      }
    ],
    augments: [
      {
        isleOfDreadScaleWeapon: null,
        red: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  },
  {
    name: 'Legendary Naildriver',
    ingredientType: 'Heavy Pick',
    minimumLevel: 31,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 12400,
      gold: 8
    },
    weight: 6,
    description: 'When all you have is a nail, everything looks like a hammer.',
    foundIn: ['The Isle of Dread (Legendary) – Any Rare Chest'],
    effectsAdded: [
      {
        name: 'Enhancement Bonus',
        modifier: 15,
        bonus: 'Enhancement',
        description:
          'Weapons and Shields: +15 Enhancement Bonus Attack and Damage rolls. Armor and Shields: +15 enhancement bonus to Armor Class.',
        type: 'Prefix'
      },
      {
        name: 'Keen',
        type: 'Prefix',
        description:
          'Passive: base critical threat range of this weapon is doubled. This does not stack with the Improved Critical Feat. Vorpal strikes by this weapon also bypass all Fortification.'
      },
      {
        name: 'Stabbing',
        modifier: 15,
        type: 'Suffix',
        description:
          'The edges of this weapon are serrated, dealing an additional 15d6 piercing damage on each critical hit.'
      },
      {
        name: 'Anarchic',
        modifier: 6,
        type: 'Prefix',
        description:
          'This weapon is chaotic and wielded by those who embrace chaos, dealing an additional 6d6 chaos damage on each hit. This effect makes the weapon chaotically aligned. Lawful characters wielding this weapon will suffer one negative level.'
      }
    ],
    augments: [
      {
        isleOfDreadScaleWeapon: null,
        red: null
      }
    ],
    setBonus: [findSetBonus("The Legendary Dread Isle's Curse")]
  }
]

export const namedItemFactory = (): Record<string, CraftingIngredient[]> => {
  const result: Record<string, CraftingIngredient[]> = {}

  const add = (category: string, item: CraftingIngredient) => {
    result[category] ??= []
    result[category].push(item)
  }

  for (const item of namedItems) {
    const type = item.ingredientType
    if (!type) {
      add('Unknown', item)
      continue
    }

    if (armorList.includes(type)) add('Armor', item)
    else if (shieldList.includes(type)) add('Shield', item)
    else if (clothingList.includes(type)) add('Clothing', item)
    else if (jewelryList.includes(type)) add('Jewelry', item)
    else if (meleeWeapons.includes(type)) add('Melee Weapon', item)
    else if (rangedWeapons.includes(type)) add('Ranged Weapon', item)
    else if (throwingWeapons.includes(type)) add('Throwing Weapon', item)
    else add('Unknown', item)
  }

  return result
}
