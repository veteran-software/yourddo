import type { AugmentItem } from '../../types/augmentItem.ts'

export const update48Augments: AugmentItem[] = [
  {
    name: 'Dismagicka',
    description:
      'Drag this augment into a slot to upgrade an item to provide an Improved Shattermantle effect. When an Improved Shattermantle weapon strikes a foe that has spell resistance, the value of that spell resistance is reduced by 6 for 9 seconds.  A foe can only have its SR reduced by one Shattermantle effect at a time. This augment can only go in an Orange Augment Slot.',
    minimumLevel: 28,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'orangeAugmentOrangeBorder',
    augmentType: 'Orange',
    effectsAdded: [
      {
        name: 'Improved Shattermantle',
        description:
          'Translucent, writhing energy and blue sparks can be seen raging within this weapon.  When a shattermantle weapon strikes a foe that has spell resistance, the value of that spell resistance is reduced by 6 for 9 seconds.  A foe can only have its SR reduced by one Shattermantle effect at a time.'
      }
    ],
    foundIn: ['The Dryad and the Demigod']
  },
  {
    name: 'Emerald of Bitter Wounds',
    description:
      'Drag this augment into a slot to upgrade an item to provide a Greater Boon of Undeath. Every time a character wearing a Greater Boon of Undeath item is struck in combat, an Inflict Moderate Wounds spell will be cast on the character. This augment can only go in a Green Augment Slot.',
    minimumLevel: 28,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'greenAugmentOrangeBorder',
    augmentType: 'Green',
    effectsAdded: [
      {
        name: 'Greater Boon of Undeath'
      }
    ],
    foundIn: ['The Dryad and the Demigod']
  },
  {
    name: 'Essence of Constellation, Broken and Reforged',
    description:
      'This citrene carries the soul of Constellation, in its whole yet broken form. Slotted Effect: Improved Destruction',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'orangeAugmentRedBorder',
    effectsAdded: [
      {
        name: 'Improved Destruction',
        description:
          'On Hit: Your target gains a stack of Armor Destruction. (-1 penalty to Armor Class, -1% of its Fortification. 20 Second Duration. Stacks up to 15 times.) This effect may trigger once every second.'
      }
    ],
    craftedIn: 'Soulforge (Hall of Heroes)'
  },
  {
    name: 'Essence of Dark Diversion',
    description: 'This topaz carries the soul of Dark Diversion. Slotted Effect: Occultation',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'yellowAugmentRedBorder',
    augmentType: 'Yellow',
    craftedIn: 'Soulforge (Hall of Heroes)',
    effectsAdded: [
      {
        name: 'Occulation'
      }
    ]
  },
  {
    name: 'Essence of The Masque',
    description: 'This sapphire carries the soul of The Masque. Slotted Effect: Soundproof',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'blueAugmentRedBorder',
    augmentType: 'Blue',
    craftedIn: 'Soulforge (Hall of Heroes)',
    effectsAdded: [
      {
        name: 'Soundproof'
      }
    ]
  },
  {
    name: 'Essence of Ultimatum',
    description: 'This emerald carries the soul of Ultimatum. Slotted Effect: Petrification Immunity',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'greenAugmentRedBorder',
    augmentType: 'Green',
    effectsAdded: [
      {
        name: 'Petrification Immunity'
      }
    ],
    craftedIn: 'Soulforge (Hall of Heroes)',
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
        name: 'Ultimatum',
        quantity: 1
      }
    ]
  },
  {
    name: 'Essence of the Champion of the Twins',
    description: "This sapphire carries the soul of the Champion of the Twins. Slotted Effect: Healer's Bounty",
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'blueAugmentRedBorder',
    augmentType: 'Blue',
    craftedIn: 'Soulforge (Hall of Heroes)',
    effectsAdded: [
      {
        name: "Healer's Bounty"
      }
    ]
  },
  {
    name: 'Essence of the Cloak of Strahd',
    description: 'This topaz carries the soul of the Cloak of Strahd. Slotted Effect: Invisibility Guard.',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'yellowAugmentRedBorder',
    augmentType: 'Yellow',
    craftedIn: 'Soulforge (Hall of Heroes)',
    effectsAdded: [
      {
        name: 'Invisibility Guard'
      }
    ]
  },
  {
    name: 'Essence of the Cobalt Guard',
    description: 'This amethyst carries the soul of the Cobalt Guard. Slotted Effect: Improved Quelling Strikes',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'purpleAugmentRedBorder',
    augmentType: 'Purple',
    effectsAdded: [
      {
        name: 'Improved Quelling Strikes',
        description:
          'On Vorpal Melee: applies a Quell effect to target enemy for six seconds, rendering them unable to cast divine spells. This has a 50% chance of preventing the target from casting all spells for three seconds (12 second cooldown). '
      }
    ],
    craftedIn: 'Soulforge (Hall of Heroes)'
  },
  {
    name: 'Essence of the Cracked Core',
    description: 'This topaz carries the soul of the Cracked Core. Slotted Effect: Alchemical Conservation',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'yellowAugmentRedBorder',
    augmentType: 'Yellow',
    craftedIn: 'Soulforge (Hall of Heroes)',
    effectsAdded: [
      {
        name: 'Alchemical Conservation'
      }
    ]
  },
  {
    name: 'Essence of the Dethek Runestone',
    description: 'This emerald carries the soul of the Dethek Runestone. Slotted Effect: Runic Revitalization',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'greenAugmentRedBorder',
    augmentType: 'Green',
    craftedIn: 'Soulforge (Hall of Heroes)',
    effectsAdded: [
      {
        name: 'Runic Revitalization'
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
        name: 'Dethek Runestone',
        quantity: 1
      }
    ]
  },
  {
    name: 'Essence of the Epic Litany of the Dead',
    description:
      'This diamond carries the soul of the Epic Litany of the Dead. Slotted Effect: Litany of the Dead Ability Bonus +2',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'colorlessAugmentRedBorder',
    augmentType: 'Colorless',
    craftedIn: 'Soulforge (Hall of Heroes)',
    effectsAdded: [
      {
        name: 'Litany of the Dead Ability Bonus +2'
      }
    ]
  },
  {
    name: 'Essence of the Nullscale Armor',
    description: 'This topaz carries the soul of the Nullscale Armor. Slotted Effect: Nullmagic Guard.',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'yellowAugmentRedBorder',
    augmentType: 'Yellow',
    effectsAdded: [
      {
        name: 'Nullmagic Guard',
        description: 'This is the delivery mutation of the Nullmagic Guard.'
      }
    ],
    craftedIn: 'Soulforge (Hall of Heroes)'
  },
  {
    name: 'Essence of the Spear of the Mournlands',
    description:
      'This citrene carries the soul of the Spear of the Mournlands. Slotted Effect: Touch of the Mournlands',
    minimumLevel: 30,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'orangeAugmentRedBorder',
    augmentType: 'Orange',
    effectsAdded: [
      {
        name: 'Touch of the Mournlands',
        description:
          'This staff, once wielded by the Lord of Blades himself, taints each wound with the power of the Mournlands. Prolonged exposure will make the target more and more difficult to heal and repair, cutting their Healing and Repair Amplification, and also interferes with their ability to use magic by occasionally Quelling enemies on a Vorpal strike.'
      }
    ],
    craftedIn: 'Soulforge (Hall of Heroes)'
  },
  {
    name: 'Feareater',
    description:
      'Drag this augment into a slot to upgrade an item to provide a Sovereign Nightmares effect. On Vorpal Hit: If your target has below 5,000 Hit Points, a burst of pure terror emanates from this weapon, snuffing out its life as if it were the subject of a Phantasmal Killer spell. If your target has above 5,000 Hit Points, they instead take significant Force damage. This augment can only go in a Purple Augment Slot.',
    minimumLevel: 28,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'purpleAugmentOrangeBorder',
    augmentType: 'Purple',
    effectsAdded: [
      {
        name: 'Nightmares',
        description:
          'On Vorpal Hit: If your target has below 500 Hit Points, a burst of pure terror emanates from this weapon, snuffing out its life as if it were the subject of a Phantasmal Killer spell. If your target has above 500 Hit Points, they instead take significant Force damage.'
      }
    ],
    foundIn: ['The Dryad and the Demigod']
  },
  {
    name: 'Lifetaker',
    description:
      'Drag this augment into a slot to upgrade an item to provide a dark and sinister power deep within. When the weapon is used, this power occasionally comes to the surface, attempting to instantly snuff out the life force of the enemy. This augment can only go in a Purple Augment Slot.',
    minimumLevel: 28,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'purpleAugmentBlueBorder',
    augmentType: 'Purple',
    effectsAdded: [
      {
        name: 'Slay Living',
        description:
          'This weapon stores a dark and sinister power deep within.  When the weapon is used, this power occasionally comes to the surface, attempting to instantly snuff out the life force of the enemy.'
      }
    ],
    foundIn: ['Witch Hunt']
  },
  {
    name: 'Ruby of Disintegration',
    description:
      'Drag this augment into a slot to upgrade a weapon with a dark, insidious power deep within.  Occasionally, this power lashes out violently at enemies and attempts to disintegrate them. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 28,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'redAugmentBlueBorder',
    augmentType: 'Red',
    effectsAdded: [
      {
        name: 'Disintegration',
        description:
          'This weapon has a dark, insidious power deep within.  Occasionally, this power lashes out violently at enemies and attempts to disintegrate them.'
      }
    ],
    foundIn: ['Wake Me Up Inside']
  },
  {
    name: 'Ruby of Fey Bane',
    description:
      'Drag this augment into a slot to upgrade a weapon with an additional 2d8 Bane damage to Fey creatures on each hit. This augment can go in a Red, Orange, or Purple Augment Slot.',
    minimumLevel: 6,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'redAugmentBlueBorder',
    augmentType: 'Red',
    effectsAdded: [
      {
        name: 'Feybane 12',
        description:
          'This weapon is attuned specifically to hunt those born of the Feywild, dealing an additional 12d10 bane damage vs. Fey.'
      }
    ],
    foundIn: ['Wake Me Up Inside']
  },
  {
    name: 'Sapphire of Greater Heroism',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +4 Morale Bonus to Attack Rolls, Saving Throws, and Skill Checks. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 28,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'blueAugmentBlueBorder',
    augmentType: 'Blue',
    effectsAdded: [
      {
        name: 'Greater Heroism'
      }
    ],
    foundIn: ['Immortality Lessons']
  },
  {
    name: 'Sapphire of Heroism',
    description:
      'Drag this augment into a slot to upgrade an item to provide a +2 Morale Bonus to Attack Rolls, Saving Throws, and Skill Checks. This augment can go in a Blue, Green, or Purple Augment Slot.',
    minimumLevel: 6,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'blueAugmentBlueBorder',
    augmentType: 'Blue',
    effectsAdded: [
      {
        name: 'Heroism'
      }
    ],
    foundIn: ['Immortality Lessons']
  },
  {
    name: 'Scourge of the Outsiders',
    description:
      'Drag this augment into a slot to upgrade an item to deal 4 to 24 Bane damage to Outsiders on hit. On Vorpal Hit: If an outsider struck by this weapon has fewer than 1000 Hit Points, it is instantly slain. If the outsider has above 1000 hit points, it takes 100 damage.. This augment can only go in an Orange Augment Slot.',
    minimumLevel: 28,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'orangeAugmentBlueBorder',
    augmentType: 'Orange',
    effectsAdded: [
      {
        name: 'Banishing',
        description:
          'On Hit: 4 to 24 Bane damage to Outsiders. \\nOn Vorpal Hit: If an outsider struck by this weapon has fewer than 1000 Hit Points, it is instantly slain. If the outsider has above 1000 hit points, it takes 100 damage.'
      }
    ],
    foundIn: ['The Thornwright']
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Alluring Elocution',
    description: 'Slotting this Augment in any Augment Slot will override its Set Bonus to the Alluring Elocution set.',
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
        name: 'Tattered Scrolls of the Broken One',
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Alluring Elocution',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Charisma',
            modifier: 3,
            bonus: 'Artifact'
          }
        ]
      }
    ]
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Arcane Barrier',
    description: 'Slotting this Augment in any Augment Slot will override its Set Bonus to the Arcane Barrier set.',
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
        name: 'Mantle of Escher',
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Arcane Barrier',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Magical Resistance Rating Cap',
            modifier: 30
          }
        ]
      }
    ]
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Arcane Guardian',
    description: 'Slotting this Augment in any Augment Slot will override its Set Bonus to the Arcane Guardian set.',
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
        name: "Citadel's Gaze",
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Arcane Guardian',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Magical Resistance Rating',
            modifier: 30,
            bonus: 'Artifact'
          }
        ]
      }
    ]
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Brutal Blows',
    description: 'Slotting this Augment in any Augment Slot will override its Set Bonus to the Brutal Blows set.',
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
        name: 'Mail of the Mroranon',
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Brutal Blows',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Strength',
            modifier: 3,
            bonus: 'Artifact'
          }
        ]
      }
    ]
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Cruel Cut',
    description: 'Slotting this Augment in any Augment Slot will override its Set Bonus to the Cruel Cut set.',
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
        name: "The Family's Blessing",
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Cruel Cut',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Damage vs Helpless',
            modifier: '15%',
            bonus: 'Artifact'
          }
        ]
      }
    ]
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Cunning Impact',
    description: 'Slotting this Augment in any Augment Slot will override its Set Bonus to the Cunning Impact set.',
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
        name: 'Strange Tidings',
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Cunning Impact',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Dexterity',
            modifier: 3,
            bonus: 'Artifact'
          }
        ]
      }
    ]
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Dusk Raider',
    description: 'Slotting this Augment in any Augment Slot will override its Set Bonus to the Dusk Raider set.',
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
        name: 'Coat of Van Richten',
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Dusk Raider',
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
          }
        ]
      }
    ]
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Esoterica',
    description: 'Slotting this Augment in any Augment Slot will override its Set Bonus to the Esoterica set.',
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
        name: 'Cloak of the Mountain',
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Esoterica',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Spell DCs',
            modifier: 3,
            bonus: 'Artifact'
          }
        ]
      }
    ]
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Paragon Guard',
    description: 'Slotting this Augment in any Augment Slot will override its Set Bonus to the Paragon Guard set.',
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
        name: 'Platemail of Strahd',
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Paragon Guard',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Armor Class',
            modifier: '15%',
            bonus: 'Artifact'
          }
        ]
      }
    ]
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Perfect Silence',
    description: 'Slotting this Augment in any Augment Slot will override its Set Bonus to the Perfect Silence set.',
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
        name: 'Vestments of Ravenloft',
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Perfect Silence',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Sneak Attack Dice',
            modifier: 3,
            bonus: 'Artifact'
          }
        ]
      }
    ]
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Piercing Mind',
    description: 'Slotting this Augment in any Augment Slot will override its Set Bonus to the Piercing Mind set.',
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
        name: 'Staggershockers',
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Piercing Mind',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Intelligence',
            modifier: 3,
            bonus: 'Artifact'
          }
        ]
      }
    ]
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Quickblade',
    description: 'Slotting this Augment in any Augment Slot will override its Set Bonus to the Quickblade set.',
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
        name: 'Guided Sight',
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Quickblade',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Doublestrike',
            modifier: '15%',
            bonus: 'Artifact'
          },
          {
            name: 'Doubleshot',
            modifier: '15%',
            bonus: 'Artifact'
          }
        ]
      }
    ]
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Touch of Power',
    description: 'Slotting this Augment in any Augment Slot will override its Set Bonus to the Touch of Power set.',
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
        name: "Attunement's Gaze",
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Touch of Power',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Universal Spell Power',
            modifier: 25,
            bonus: 'Artifact'
          }
        ]
      }
    ]
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Tough Shields',
    description: 'Slotting this Augment in any Augment Slot will override its Set Bonus to the Tough Shields set.',
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
        name: "Dumathoin's Bracers",
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Tough Shields',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Physical Resistance Rating',
            modifier: 30,
            bonus: 'Artifact'
          }
        ]
      }
    ]
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Truthful Blow',
    description: 'Slotting this Augment in any Augment Slot will override its Set Bonus to the Truthful Blow set.',
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
        name: 'Helm of the Final Watcher',
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Truthful Blow',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Fortification Bypass',
            modifier: '15%',
            bonus: 'Artifact'
          }
        ]
      }
    ]
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Visions of the Beyond',
    description:
      'Slotting this Augment in any Augment Slot will override its Set Bonus to the Visions of the Beyond set.',
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
        name: 'Crystalline Gauntlets',
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Visions of the Beyond',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Wisdom',
            modifier: 3,
            bonus: 'Artifact'
          }
        ]
      }
    ]
  },
  {
    image: 'cauldronOfCadenceAugment',
    augmentType: 'Colorless',
    minimumLevel: 30,
    craftedIn: 'Cauldron of Cadence',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    name: 'Set Augment: Wild Fortitude',
    description: 'Slotting this Augment in any Augment Slot will override its Set Bonus to the Wild Fortitude set.',
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
        name: 'Quori-Infused Core',
        quantity: 1
      }
    ],
    setBonus: [
      {
        name: 'Wild Fortitude',
        numPiecesEquipped: 3,
        enhancements: [
          {
            name: 'Constitution',
            modifier: 3,
            bonus: 'Artifact'
          }
        ]
      }
    ]
  },
  {
    name: "Storm's Bulwark",
    description:
      'Drag this augment into a slot to upgrade an item to provide a ward against the Knockdowns and Slows of an Air Elemental. This augment can only go in a Green Augment Slot.',
    minimumLevel: 28,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'greenAugmentBlueBorder',
    augmentType: 'Green',
    foundIn: ['The Knight Who Cried Windmill'],
    effectsAdded: [
      {
        name: 'Air Elemental Knockdown Ward'
      },
      {
        name: 'Air Elemental Slow Ward'
      }
    ]
  },
  {
    name: 'Topaz of Augmented Summoning',
    description:
      'Drag this augment into a slot to upgrade an item to grant the feat Augment Summoning. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 28,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'yellowAugmentBlueBorder',
    augmentType: 'Yellow',
    effectsAdded: [
      {
        name: 'Feat: Augment Summoning'
      }
    ],
    foundIn: ['The Feywild (Rare Encounters)']
  },
  {
    name: 'Topaz of Quick Movements',
    description:
      'Drag this augment into a slot to upgrade an item to grant the feat Quick Draw. This augment can go in a Yellow, Green, or Orange Augment Slot.',
    minimumLevel: 6,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    image: 'yellowAugmentBlueBorder',
    augmentType: 'Yellow',
    effectsAdded: [
      {
        name: 'Feat: Quick Draw'
      }
    ],
    foundIn: ['The Feywild (Rare Encounters)']
  },
  //
  {
    name: 'Sapphire of Stunning +4',
    augmentType: 'Blue',
    minimumLevel: 4,
    image: 'blueAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Stunning DC',
        bonus: 'Enhancement',
        modifier: 4
      }
    ]
  },
  {
    name: 'Sapphire of Vertigo +4',
    augmentType: 'Blue',
    minimumLevel: 4,
    image: 'blueAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Trip DC',
        bonus: 'Enhancement',
        modifier: 4
      }
    ]
  },
  {
    name: 'Sapphire of Shatter +4',
    augmentType: 'Blue',
    minimumLevel: 4,
    image: 'blueAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Sunder DC',
        bonus: 'Enhancement',
        modifier: 4
      }
    ]
  },
  {
    name: 'Sapphire of Accuracy +5',
    augmentType: 'Blue',
    minimumLevel: 4,
    image: 'blueAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Attack',
        bonus: 'Competence',
        modifier: 5
      }
    ]
  },
  {
    name: 'Sapphire of Dodge 3%',
    augmentType: 'Blue',
    minimumLevel: 4,
    image: 'blueAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Dodge',
        bonus: 'Enhancement',
        modifier: '3%'
      }
    ]
  },
  {
    name: 'Sapphire of Healing Amplification +11',
    augmentType: 'Blue',
    minimumLevel: 4,
    image: 'blueAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Healing Amplification',
        bonus: 'Competence',
        modifier: 11
      }
    ]
  },
  {
    name: 'Sapphire of Negative Amplification +11',
    augmentType: 'Blue',
    minimumLevel: 4,
    image: 'blueAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Negative Amplification',
        bonus: 'Profane',
        modifier: 11
      }
    ]
  },
  {
    name: 'Sapphire of Repair Amplification +11',
    augmentType: 'Blue',
    minimumLevel: 4,
    image: 'blueAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Repair Amplification',
        bonus: 'Enhancement',
        modifier: 11
      }
    ]
  },
  {
    name: 'Topaz of Damage +3',
    augmentType: 'Yellow',
    minimumLevel: 4,
    image: 'yellowAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Damage',
        bonus: 'Competence',
        modifier: 3
      }
    ]
  },
  {
    name: 'Topaz of Spell Penetration +2',
    augmentType: 'Yellow',
    minimumLevel: 4,
    image: 'yellowAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Spell Penetration',
        bonus: 'Equipment',
        modifier: 2
      }
    ]
  },
  //
  {
    name: 'Topaz of Cold Resistance 40',
    augmentType: 'Yellow',
    minimumLevel: 28,
    image: 'yellowAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Cold Resistance',
        modifier: 40
      }
    ]
  },
  {
    name: 'Topaz of Wizardry +261',
    augmentType: 'Yellow',
    minimumLevel: 28,
    image: 'yellowAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Maximum Spell Points',
        modifier: 261
      }
    ]
  },
  {
    name: 'Sapphire of Protection +10',
    augmentType: 'Blue',
    minimumLevel: 28,
    foundIn: [],
    image: 'blueAugmentGreenBorder',
    effectsAdded: [
      {
        name: 'Armor Class',
        bonus: 'Protection',
        modifier: 10
      }
    ]
  },
  {
    name: 'Sapphire of Stunning +14',
    augmentType: 'Blue',
    minimumLevel: 28,
    foundIn: [],
    image: 'blueAugmentGreenBorder',
    effectsAdded: [
      {
        name: 'Stun DC',
        bonus: 'Enhancement',
        modifier: 14
      }
    ]
  },
  {
    name: 'Sapphire of Accuracy +20',
    augmentType: 'Blue',
    minimumLevel: 28,
    foundIn: [],
    image: 'blueAugmentGreenBorder',
    effectsAdded: [
      {
        name: 'Attack',
        bonus: 'Competence',
        modifier: 14
      }
    ]
  },
  {
    name: 'Sapphire of Healing Amplification +50',
    augmentType: 'Blue',
    minimumLevel: 28,
    foundIn: [],
    image: 'blueAugmentGreenBorder',
    effectsAdded: [
      {
        name: 'Healing Amplification',
        bonus: 'Competence',
        modifier: 50
      }
    ]
  },
  {
    name: 'Ruby of Frost (8d6)',
    augmentType: 'Red',
    minimumLevel: 28,
    image: 'redAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Cold Damage',
        bonus: 'On-hit',
        modifier: '8d6'
      }
    ]
  },
  {
    name: 'Ruby of Glaciation 139',
    augmentType: 'Red',
    minimumLevel: 28,
    image: 'redAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Spell Power: Cold',
        bonus: 'Equipment',
        modifier: 139
      }
    ]
  },
  {
    name: 'Ruby of Resonance 139',
    augmentType: 'Red',
    minimumLevel: 28,
    image: 'redAugmentGreenBorder',
    foundIn: [],
    effectsAdded: [
      {
        name: 'Spell Power: Sonic',
        bonus: 'Equipment',
        modifier: 139
      }
    ]
  }
]
