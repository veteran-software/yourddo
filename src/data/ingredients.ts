import type { Ingredient } from '../types/ingredients.ts'

export const ingredients: Ingredient[] = [
  {
    name: 'Accursed Card',
    description:
      'Double-click this card to open a window where you may combine many cards to create a Deck of Many Curses.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 10
    },
    bagMaxStack: 1000,
    inventoryMaxStack: 500,
    foundIn: [
      'Astral Ambush',
      'Epic Fables of the Feywild Saga',
      'Epic Mists of Ravenloft Saga',
      'Horde of the Illithid Controller',
      'Jester of Festivult',
      "Pilgrims' Peril",
      'Stolen Power'
    ]
  },
  {
    name: 'Adamantine Ore',
    description:
      'A dark, almost black metallic ore. Objects made form this ore are highly prized. This object can be used in crafting.',
    binding: {
      type: 'Unbound'
    },
    weight: 0.05,
    foundIn: ['A Relic of a Sovereign Past', "Ataraxia's Haven", 'Made to Order']
  },
  {
    name: 'Agate Shard',
    description: 'A brown shard of the Tear of Dhakaan.',
    binding: {
      type: 'Unbound'
    },
    weight: 0.01,
    foundIn: ['The Tear of Dhakaan']
  },
  {
    name: 'Amber Shard',
    description: 'A yellow shard of the Tear of Dhakaan.',
    binding: {
      type: 'Unbound'
    },
    weight: 0.01,
    foundIn: ['The Tear of Dhakaan']
  },
  {
    name: 'Ancient Dragon Relic',
    description:
      'Ancient dragon relics dating back to before the cataclysm. Perhaps someone in the Ruins of Gianthold will be interested in these.',
    binding: {
      type: 'Unbound'
    },
    foundIn: [
      'A Cry for Help (Heroic)',
      'Feast or Famine (Heroic)',
      'Foundation of Discord (Heroic)',
      'The Maze of Madness (Heroic)',
      'Trial by Fire (Heroic)',
      'A Cabal for One (Heroic)',
      'Gianthold Tor (Heroic)',
      'Madstone Crater (Heroic)',
      'The Crucible (Heroic)',
      'The Prison of the Planes (Heroic)',
      'Ruins of Gianthold (Heroic)'
    ]
  },
  {
    name: 'Ancient Elven Relic',
    description:
      'Ancient elven relics dating back to before the cataclysm. Perhaps someone in the Ruins of Gianthold will be interested in these.',
    binding: {
      type: 'Unbound'
    },
    foundIn: [
      'A Cry for Help (Heroic)',
      'Feast or Famine (Heroic)',
      'Foundation of Discord (Heroic)',
      'The Maze of Madness (Heroic)',
      'Trial by Fire (Heroic)',
      'A Cabal for One (Heroic)',
      'Gianthold Tor (Heroic)',
      'Madstone Crater (Heroic)',
      'The Crucible (Heroic)',
      'The Prison of the Planes (Heroic)',
      'Ruins of Gianthold (Heroic)'
    ]
  },
  {
    name: 'Ancient Giant Relic',
    description:
      'Ancient giant relics dating back to before the cataclysm. Perhaps someone in the Ruins of Gianthold will be interested in these.',
    binding: {
      type: 'Unbound'
    },
    foundIn: [
      'A Cry for Help (Heroic)',
      'Feast or Famine (Heroic)',
      'Foundation of Discord (Heroic)',
      'The Maze of Madness (Heroic)',
      'Trial by Fire (Heroic)',
      'A Cabal for One (Heroic)',
      'Gianthold Tor (Heroic)',
      'Madstone Crater (Heroic)',
      'The Crucible (Heroic)',
      'The Prison of the Planes (Heroic)',
      'Ruins of Gianthold (Heroic)'
    ]
  },
  {
    name: 'Antique Bronze Token',
    description:
      "This bronze token served as currency during the reign of Raiyum, the Wizard-King. The faint outline of a crowned head can be seen on one side, but its features have been worn smooth by time. These are wanted in large quantities by Masei Mkembe, as Masei's Imports in Zawabi's Refuge.",
    binding: {
      type: 'Unbound'
    },
    bagMaxStack: 1000,
    inventoryMaxStack: 10000,
    foundIn: [
      'Sands of Menechtarun (rare encounters)',
      'Sands of Menechtarun (treasure bags)',
      'Against the Demon Queen (Quest)',
      'An Offering of Blood',
      'Chains of Flame',
      'Desert Caravan',
      'Maraud the Mines',
      'Purge the Fallen Shrine',
      'Raid the Vulkoorim',
      'The Chamber of Kourush',
      'The Chamber of Rahmat',
      'The Chamber of Raiyum',
      "Zawabi's Revenge"
    ]
  },
  {
    name: 'Arcane Ingot',
    description: 'This magical metal is warm to the touch and can be shaped into whatever weapon you desire.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 100
    },
    foundIn: [
      'Caged Beast (Quest) (Heroic)',
      'Obstructing the Orcs (Heroic)',
      'The Bugbear Bandits (Heroic)',
      'The Hobgoblin Horde (Heroic)',
      'Total Chaos (Heroic)',
      'Treasure Hunt (Heroic)',
      'Violent Delights (Heroic)',
      'Watch Your Step (Heroic)',
      'The Borderlands (Heroic)'
    ]
  },
  {
    name: 'Aspect of Tar',
    image: 'dinosaurBoneNamedHornAugment',
    description:
      'Slotted Effect: Your attacks and offensive spells have a chance to reduce enemy Physical and Magical Resistance Rating and summon Tar oozes to your aid.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 500
    },
    foundIn: ['Skeletons in the Closet'],
    minimumLevel: 31,
    augmentType: 'Isle of Dread: Horn (Weapon)',
    enhancements: [
      {
        name: 'Legendary Ooze'
      }
    ]
  },
  {
    name: "Attunement's Gaze",
    type: 'Goggles',
    description: 'Gaze into the unknown.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Project Nemesis', 'Nemesis Rune Barter']
  },
  {
    name: 'Barrier Fragment',
    description: 'Fragments of a shattered barrier. Used at the Ritual Table to unseal power.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 100
    },
    foundIn: ['Threats Old and New (raid warded chest)']
  },
  {
    name: 'Bitterscrub Fungus',
    type: 'This item may be usable in an eldritch device.',
    description:
      'A cluster of light brown long-stemmed mushrooms with tiny caps that gives off a pungent moldy smell. This item is humming like the Altar of Fecundity.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 5,
      gold: 5
    },
    weight: 0.01,
    foundIn: ['Ritual Sacrifice', 'Running with the Devils']
  },
  {
    name: 'Black Apple',
    description:
      'These apples appear to have black, rotten skin on the outside, but taste powerfully sweet on the inside.',
    binding: {
      type: 'Unbound'
    },
    foundIn: ['Smashing Pumpkins', 'Grave Work', "The Kobolds' Newest Ringleader"]
  },
  {
    name: 'Black Dragon Scale',
    description: 'This is a large, strong, and pliable scale from a Black Dragon.',
    binding: {
      type: 'Unbound'
    },
    weight: 0.01,
    foundIn: ['Gianthold Tor (Heroic)', 'Mired in Kobolds']
  },
  {
    name: 'Black Dust of Vile Darkness',
    description: 'This dust radiates corruption and evil. What might it have been before it became dust?',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 100
    },
    foundIn: ['Taken in Hand (Heroic)']
  },
  {
    name: 'Black Pearl',
    description: 'This pearl is an opalescent dark color.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    foundIn: ['The Isle of Dread (Legendary)', 'Skeletons in the Closet', 'Draconic Raider’s Reward Box']
  },
  {
    name: "Black Sands' Desire",
    image: 'dinosaurBoneNamedHornAugment',
    description: 'Slotted Effect: Your attacks and offensive spells have a chance to significantly slow your enemies.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 500
    },
    foundIn: ['Skeletons in the Closet'],
    minimumLevel: 31,
    augmentType: 'Isle of Dread: Horn (Weapon)',
    enhancements: [
      {
        name: 'Legendary Salt'
      }
    ]
  },
  {
    name: 'Black Stone',
    description:
      'Magical black stones smuggled into Cormyr by the Zhentarim. The Zhentarim Mage, Whisper, has been working to attune the stones to strengthen ancient magical artifacts.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      gold: 1
    },
    weight: 0.01,
    foundIn: ['The Haunted Halls of Eveningstar']
  },
  {
    name: 'Bleak Alternator',
    description: 'This small piece of machinery can be used to create dreadful machinery in Lamordia.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 1
    },
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Bleak Conductor',
    description: 'This small piece of machinery can be used to create dreadful machinery in Lamordia.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 1
    },
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Bleak Insulator',
    description: 'This small piece of machinery can be used to create dreadful machinery in Lamordia.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 1
    },
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Bleak Resistor',
    description: 'This small piece of machinery can be used to create dreadful machinery in Lamordia.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 1
    },
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Bleak Transformer',
    image: 'bleakTransformer',
    description: 'This small piece of machinery can be used to create dreadful machinery in Lamordia.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 1
    },
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Bleak Wire',
    description: 'This small piece of machinery can be used to create dreadful machinery in Lamordia.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 1
    },
    foundIn: ['Chill of Ravenloft Expansion']
  },
  {
    name: 'Blighted Scarab',
    description: 'The desicated husk of this scarab radiates an sickly glow.',
    binding: {
      type: 'Unbound'
    },
    foundIn: ['Tomb of the Blighted']
  },
  {
    name: 'Chipmunk Funk',
    type: 'This item may be usable in an eldritch device.',
    description:
      'A ball of hair with small dried bits of something mixed in. This item is humming like the Altar of Fecundity.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 5,
      gold: 5
    },
    weight: 0.01,
    foundIn: ['Let Sleeping Dust Lie', 'The Coalescence Chamber']
  },
  {
    name: 'Chunk of Shavarath Dirt',
    description:
      "A chunk of dirt that was given to you so you could try out Valaireas's Combination in an eldritch device.",
    type: 'This item may be usable in an eldritch device.',
    foundIn: ['Meridia'],
    binding: {
      type: 'Bound',
      from: 'Acquisition',
      to: 'Character'
    },
    baseValue: {
      gold: 5
    },
    weight: 0.01
  },
  {
    name: "Citadel's Gaze",
    type: 'Helm',
    description:
      "Presented as a gift from the Boromar Clan to the Knight-Marshall of the Citadel, Sir Banarak Tithon, this helmet contains immense personal significance. It's a shame he doesn't wear it, as it's a uniquely beautiful piece.",
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Too Hot to Handle', 'Forge Rune Barter']
  },
  {
    name: 'Cloak of the Mountain',
    image: 'raidCloak',
    type: 'Cloak',
    description: 'This dark gray cloak seems to ripple, despite being carved of smooth gray stone.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Killing Time', 'Time Rune Barter']
  },
  {
    name: 'Coat of Van Richten',
    type: 'Medium Armor',
    description: "An old coat of Van Richten's. He lost it once in an encounter gone bad, it's found another home now.",
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['The Curse of Strahd', 'Rudolph van Richten (Barter NPC)', 'Strahd Rune Barter']
  },
  {
    name: 'Codex Rune',
    description: "An ephemeral reminder of what you've done, and what's been done to you.",
    type: 'This item may be put in a Legendary eldritch device.',
    foundIn: ['The Codex and the Shroud', 'Creeping Death', 'To Curse the Sky'],
    binding: {
      type: 'Bound',
      from: 'Acquisition',
      to: 'Account'
    },
    baseValue: {
      platinum: 100
    }
  },
  {
    name: 'Commendation of Valor',
    description: 'This is a token of favor earned for your valorous actions.',
    foundIn: ['Any Epic Quest', "Epic Otto's Irresistible Box"],
    binding: {
      type: 'Bound',
      from: 'Acquisition',
      to: 'Character'
    },
    baseValue: {
      gold: 1
    }
  },
  {
    name: 'Crystallized Spiderweb',
    description:
      'This spiderweb is frozen with subtle magic. It appears to be used for upgrading items found within the same adventure area.',
    foundIn: ['Web of Chaos Quests (Epic)'],
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    }
  },
  {
    name: 'Crystalline Gauntlets',
    type: 'Gloves',
    description: 'These are made of cut and polished gemstones, and hum with primal magics.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Too Hot to Handle', 'Forge Rune Barter']
  },
  {
    name: 'Depleted Shavarath Medium Energy Cell',
    description:
      'An empty vessel capable of storing energy. Empty cells can be charged by combining them with suitably powerful magic weapons.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 1000
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault'],
    notes:
      'To charge a Depleted Shavarath Medium Energy Cell, combine it on the Altar of Subjugation with a +6 to +15 weapon.\n' +
      "Note: The +X you're looking for is in the top-right corner of the item examine window—not in the weapon’s name."
  },
  {
    name: 'Depleted Shavarath High Energy Cell',
    description:
      'An empty vessel capable of storing a lot of energy. Empty cells can be charged by combining them with suitably powerful magic weapons.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 2000
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault'],
    notes:
      'To charge a Depleted Shavarath High Energy Cell, combine it on the Altar of Subjugation with a +8 to +15 weapon.\n' +
      "Note: The +X you're looking for is in the top-right corner of the item examine window—not in the weapon’s name."
  },
  {
    name: 'Desert Sand Crystal',
    description:
      'This small chunk of sand that has crystallized. It appears to be used for upgrading items found within the same adventure.',
    foundIn: ['Sands of Menechtarun Quests (Epic)'],
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    }
  },
  {
    name: 'Dethek Runestone',
    description:
      'Someone took this stone slab, covered faintly in Dwarf-inscribed enchantments, and attached a handle to the back, turning it into a shield.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 10804
    },
    weight: 0.1,
    foundIn: ['Fire on Thunder Peak']
  },
  {
    name: 'Dimensional Horn',
    image: 'dinosaurBoneNamedHornAugment',
    description: 'Slotted Effect: 5% Enhancement bonus to Dodge Bypass.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 500
    },
    foundIn: ['Skeletons in the Closet'],
    minimumLevel: 31,
    augmentType: 'Isle of Dread: Horn (Accessory)',
    enhancements: [
      {
        name: 'Dodge Bypass',
        modifier: '5%',
        bonus: 'Enhancement'
      }
    ]
  },
  {
    name: "Dumathoin's Bracers",
    image: 'raidBracers',
    type: 'Bracers',
    description:
      '"Hold the gates! No green-skin will step one foot into Thunderholme!" - Dumathoin Thunderstone, Captain of the Guard',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Temple of the Deathwyrm', 'Deathwyrm Rune Barter']
  },
  {
    name: 'Eberron Energy Cell',
    description: 'A small vessel with a charge of energy inside.',
    type: 'This item may be usable in an eldritch device.',
    foundIn: ['The Eldritch Chamber (Meridia)'],
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 990
    },
    weight: 0.01
  },
  {
    name: 'Empty Soul Vessel',
    description: 'A victorious reminder of your achievements. Perhaps these can be used for something...',
    foundIn: ['Fables of the Feywild (Legendary Quests)'],
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 100
    }
  },
  {
    name: 'Esoteric Relic',
    description:
      "This tiny, handheld relic doesn't seem to hold much value on its own, but would likely be appreciated by the Morgrave Reliquary.",
    foundIn: ['Vecna Unleashed (Any Chest)'],
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 100
    }
  },
  {
    name: 'Fossilized Amber',
    image: 'dinosaurBoneNamedHornAugment',
    description: 'Slotted Effect: 250 Unconsciousness Range. You heal 20 HP every minute from Positive Energy.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 500
    },
    foundIn: ['Skeletons in the Closet'],
    minimumLevel: 31,
    augmentType: 'Isle of Dread: Horn (Accessory)',
    enhancements: [
      {
        name: 'Unconsciousness Range',
        modifier: 250,
        bonus: 'Enhancement'
      },
      {
        name: 'Heal Over Time',
        modifier: 20,
        notes: 'per minute from Positive Energy'
      }
    ]
  },
  {
    name: 'Fossilized Ankylosaur Rib',
    image: 'dinosaurBone',
    type: 'Ingredient',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    description:
      'This fossilized dinosaur bone can be used to fashion rare and powerful equipment in the Isle of Dread.',
    foundIn: ['Isle of Dread Quests (Legendary)', 'The Isle of Dread (Wilderness) (Legendary)']
  },
  {
    name: 'Fossilized Pteradon Vertebra',
    image: 'dinosaurBone',
    type: 'Ingredient',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    description:
      'This fossilized dinosaur bone can be used to fashion rare and powerful equipment in the Isle of Dread.',
    foundIn: ['Isle of Dread Quests (Legendary)', 'The Isle of Dread (Wilderness) (Legendary)']
  },
  {
    name: 'Fossilized Raptor Claw',
    image: 'dinosaurBone',
    type: 'Ingredient',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    description:
      'This fossilized dinosaur bone can be used to fashion rare and powerful equipment in the Isle of Dread.',
    foundIn: ['Isle of Dread Quests (Legendary)', 'The Isle of Dread (Wilderness) (Legendary)']
  },
  {
    name: 'Fossilized Triceratops Horn',
    image: 'dinosaurBone',
    type: 'Ingredient',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    description:
      'This fossilized dinosaur bone can be used to fashion rare and powerful equipment in the Isle of Dread.',
    foundIn: ['Isle of Dread Quests (Legendary)', 'The Isle of Dread (Wilderness) (Legendary)']
  },
  {
    name: 'Fossilized Tyrannosaurus Tooth',
    image: 'dinosaurBone',
    type: 'Ingredient',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    description:
      'This fossilized dinosaur bone can be used to fashion rare and powerful equipment in the Isle of Dread.',
    foundIn: ['The Isle of Dread (Wilderness) (Legendary)']
  },
  {
    name: 'Fractured Sliver of Time',
    description:
      'This is a crushed fragment of what was an incredible artifact. It appears to be used for upgrading items found within the same adventures.',
    foundIn: ['Devil Assault (Epic)', 'The Chronoscope (Epic)'],
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    }
  },
  {
    name: 'Fragment of Extraplanar Alignment',
    image: 'dinosaurBoneNamedScaleAugment',
    description:
      'Slotted Effect: +23% Enhancement bonus to Alignment absorption, which includes Law, Chaos, Good, and Evil damage.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 500
    },
    foundIn: ['Skeletons in the Closet'],
    minimumLevel: 31,
    augmentType: 'Isle of Dread: Scale (Armor)',
    enhancements: [
      {
        name: 'Chaos Absorption',
        modifier: '23%',
        bonus: 'Enhancement'
      },
      {
        name: 'Evil Absorption',
        modifier: '23%',
        bonus: 'Enhancement'
      },
      {
        name: 'Good Absorption',
        modifier: '23%',
        bonus: 'Enhancement'
      },
      {
        name: 'Law Absorption',
        modifier: '23%',
        bonus: 'Enhancement'
      }
    ]
  },
  {
    name: 'Fragment of Extraplanar Shadow',
    image: 'dinosaurBoneNamedScaleAugment',
    description:
      'Slotted Effect: +3% Profane Doublestrike and Doubleshot, +15% Enhancement bonus to Melee Alacrity, +20% Enhancement bonus to Ranged Alacrity.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 500
    },
    foundIn: ['Skeletons in the Closet'],
    minimumLevel: 31,
    augmentType: 'Isle of Dread: Scale (Armor)',
    enhancements: [
      {
        name: 'Doublestrike Chance',
        modifier: '3%',
        bonus: 'Profane'
      },
      {
        name: 'Doubleshot Chance',
        modifier: '3%',
        bonus: 'Profane'
      },
      {
        name: 'Melee Alacrity',
        modifier: '15%',
        bonus: 'Enhancement'
      },
      {
        name: 'Ranged Alacrity',
        modifier: '20%',
        bonus: 'Enhancement'
      }
    ]
  },
  {
    name: 'Glistening Pebbles',
    type: 'This item may be usable in an eldritch device.',
    description:
      'A handful of glistening pond pebbles that never seem to dry off completely. These pebbles are humming like the Altar of Fecundity.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 5,
      gold: 5
    },
    weight: 0.01,
    foundIn: ['Rainbow in the Dark', 'Running with the Devils']
  },
  {
    name: 'Glowing Fen Mushroom',
    description:
      "This glowing mushroom doesn't look edible. It appears to be used for upgrading items found within the same adventure.",
    foundIn: ['The Red Fens (Quests)'],
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    }
  },
  {
    name: 'Gnoll Whittled Branch',
    description:
      "A small whittled branch that was given to you so you could try out Valaireas's Combination in an eldritch device.",
    type: 'This item may be usable in an eldritch device.',
    foundIn: ['Meridia'],
    binding: {
      type: 'Bound',
      from: 'Acquisition',
      to: 'Character'
    },
    baseValue: {
      gold: 5
    },
    weight: 0.01
  },
  {
    name: 'Green Briar Twigs',
    type: 'This item may be usable in an eldritch device.',
    description: 'Fresh green twigs with very small thorns. These Twigs are humming like the Altar of Fecundity.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 5,
      gold: 5
    },
    weight: 0.01,
    foundIn: ['Rainbow in the Dark', 'The Coalescence Chamber']
  },
  {
    name: 'Helm of the Final Watcher',
    type: 'Helm',
    description: 'Keep your eyes on the skies.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Project Nemesis', 'Nemesis Rune Barter']
  },
  {
    name: 'Guided Sight',
    type: 'Trinket',
    description: 'Dragonborn scouts often used these scopes to examine the road ahead for danger.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Riding the Storm Out', 'Dalwyneth (Barter NPC)', 'Draconic Raider’s Reward Box']
  },
  {
    name: "Kelas' Volatile Mixture",
    type: 'Orb',
    description: 'A small and simple inscription adorns the label... "Do Not Drink"',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Skeletons in the Closet', 'Dread Rune Barter']
  },
  {
    name: 'Lammanian Lily Petals',
    type: 'This item may be usable in an eldritch device.',
    description:
      'Soft, attractive flower petals that give off an interesting, not-unpleasant odor. This item is humming like the Altar of Fecundity.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 5,
      gold: 5
    },
    weight: 0.01,
    foundIn: ['Ritual Sacrifice', 'The Vale of Twilight (rare encounters)']
  },
  {
    name: 'Large Devil Scales',
    type: 'This item may be usable in an eldritch device.',
    description: 'A few reptilian looking devil scales. This item is humming like the Altar of Devastation.',
    binding: {
      type: 'Unbound'
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Large Glowing Arrowhead',
    type: 'This item may be usable in an eldritch device.',
    description:
      'A metal arrowhead that gives off a pale greenish light. This item is humming like the Altar of Devastation.',
    binding: {
      type: 'Unbound'
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Large Gnawed Bone',
    type: 'This item may be usable in an eldritch device.',
    description: 'A dry bone that has been gnawed clean. This item is humming like the Altar of Devastation.',
    binding: {
      type: 'Unbound'
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Large Length of Infernal Chain',
    type: 'This item may be usable in an eldritch device.',
    description: 'A length of dirty, barbed chain. This item is humming like the Altar of Devastation.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 25
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Large Twisted Shrapnel',
    type: 'This item may be usable in an eldritch device.',
    description: 'A sharp and twisted hunk of metal. This item is humming like the Altar of Devastation.',
    binding: {
      type: 'Unbound'
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Large Sulfurous Stone',
    type: 'This item may be usable in an eldritch device.',
    description:
      'A rough, crumbly piece of yellowish gray stone that smells of sulfur. This item is humming like the Altar of Subjugation.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 25
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Large Splintered Horn',
    type: 'This item may be usable in an eldritch device.',
    description: 'A splintered horn from some unknown creature. This item is resonating like the Altar of Fecundity.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Shroud']
  },
  {
    name: 'Legendary Esoteric Relic',
    description:
      "This tiny, handheld relic doesn't seem to hold much value on its own, but would likely be appreciated by the Morgrave Reliquary.",
    foundIn: ['Vecna Unleashed (Any Chest)'],
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 100
    }
  },
  {
    name: 'Legendary Large Devil Scales',
    image: 'lgsDevilScale',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description: 'A few reptilian looking devil scales. This item is humming like the Altar of Devastation.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Legendary Large Glowing Arrowhead',
    image: 'lgsGlowingArrowhead',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description:
      'A metal arrowhead that gives off a pale greenish light. This item is humming like the Altar of Devastation.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Legendary Large Gnawed Bone',
    image: 'lgsGnawedBone',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description: 'A dry bone that has been gnawed clean. This item is humming like the Altar of Devastation.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Legendary Large Length of Infernal Chain',
    image: 'lgsLengthOfInfernalChain',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description: 'A length of dirty, barbed chain. This item is humming like the Altar of Devastation.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Legendary Large Twisted Shrapnel',
    image: 'lgsTwistedShrapnel',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description: 'A sharp and twisted hunk of metal. This item is humming like the Altar of Devastation.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Legendary Large Sulfurous Stone',
    image: 'lgsSulfurousStone',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description:
      'A rough, crumbly piece of yellowish gray stone that smells of sulfur. This item is humming like the Altar of Devastation.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Legendary Mark of Bal Molesh',
    image: '',
    type: 'Cauldron of Sora Katra',
    description:
      'this token bears the military insignia of a Droaam Warlord: Bal Molesh, a powerful and insidious tiefling also knows as the Venom Lord.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    foundIn: []
  },
  {
    name: 'Legendary Mark of Rhesh Turakbar',
    image: '',
    type: 'Cauldron of Sora Katra',
    description:
      'this token bears the military insignia of a Droaam Warlord: Rhesh Turakbar, a minotaur who thirsts constantly for blood and warfare.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    foundIn: []
  },
  {
    name: 'Legendary Mark of Sheshka',
    image: '',
    type: 'Cauldron of Sora Katra',
    description:
      'this token bears the military insignia of a Droaam Warlord: Sheshka, a calm yet fearsome medusa whose kingdom predates the Droaam nation.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    foundIn: []
  },
  {
    name: 'Legendary Mark of Tzaryan Rrac',
    image: '',
    type: 'Cauldron of Sora Katra',
    description:
      'this token bears the military insignia of a Droaam Warlord: Tzaryan Rrac, an ogre mage whose appetite for destructive arcane power knows no bounds.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    foundIn: []
  },
  {
    name: 'Legendary Medium Devil Scales',
    image: 'lgsDevilScale',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description: 'A few reptilian looking devil scales. This item is humming like the Altar of Subjugation.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Legendary Medium Glowing Arrowhead',
    image: 'lgsGlowingArrowhead',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description:
      'A metal arrowhead that gives off a pale greenish light. This item is humming like the Altar of Subjugation.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Legendary Medium Gnawed Bone',
    image: 'lgsGnawedBone',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description: 'A dry bone that has been gnawed clean. This item is humming like the Altar of Subjugation.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Legendary Medium Length of Infernal Chain',
    image: 'lgsLengthOfInfernalChain',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description: 'A length of dirty, barbed chain. This item is humming like the Altar of Subjugation.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Legendary Medium Twisted Shrapnel',
    image: 'lgsTwistedShrapnel',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description: 'A sharp and twisted hunk of metal. This item is humming like the Altar of Subjugation.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Legendary Medium Sulfurous Stone',
    image: 'lgsSulfurousStone',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description:
      'A rough, crumbly piece of yellowish gray stone that smells of sulfur. This item is humming like the Altar of Subjugation.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: "Legendary Quartermaster's Chit",
    description:
      'These are worth quite a bit to the right person. Someone in Saltmarsh will likely give you a fair price.',
    foundIn: ['Saltmarsh (Legendary Quests)'],
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    }
  },
  {
    name: 'Legendary Small Devil Scales',
    image: 'lgsDevilScale',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description: 'A few reptilian looking devil scales. This item is humming like the Altar of Invasion.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Legendary Small Glowing Arrowhead',
    image: 'lgsGlowingArrowhead',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description:
      'A metal arrowhead that gives off a pale greenish light. This item is humming like the Altar of Invasion.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Legendary Small Gnawed Bone',
    image: 'lgsGnawedBone',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description: 'A dry bone that has been gnawed clean. This item is humming like the Altar of Invasion.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Legendary Small Length of Infernal Chain',
    image: 'lgsLengthOfInfernalChain',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description: 'A length of dirty, barbed chain. This item is humming like the Altar of Invasion.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Legendary Small Twisted Shrapnel',
    image: 'lgsTwistedShrapnel',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description: 'A sharp and twisted hunk of metal. This item is humming like the Altar of Invasion.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Legendary Small Sulfurous Stone',
    image: 'lgsSulfurousStone',
    type: 'This item may be may be put in a Legendary eldritch device.',
    description:
      'A rough, crumbly piece of yellowish gray stone that smells of sulfur. This item is humming like the Altar of Invasion.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 45
    },
    foundIn: ['The Codex and the Shroud']
  },
  {
    name: 'Locust Husk',
    type: 'This item may be usable in an eldritch device.',
    description:
      'A hollow, semi-translucent, locust shaped husk left behind after the insect molted. This item is humming like the Altar of Fecundity.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 5,
      gold: 5
    },
    weight: 0.01,
    foundIn: ['Let Sleeping Dust Lie', 'The Vale of Twilight (rare encounters)']
  },
  {
    name: 'Mail of the Mroranon',
    image: 'coatOfVanRichten',
    type: 'Medium Armor',
    description: 'This powerful armor is an ancient keepsake of the Mroranon Clan of the Ironroot Mountains.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Killing Time', 'Time Rune Barter', 'Draconic Raider’s Reward Box']
  },
  {
    name: 'Mantle of Escher',
    image: 'raidRobe',
    type: 'Robe',
    description: 'Once worn by Escher in life, this robe confers surprisingly strong magical properties',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['The Curse of Strahd', 'Rudolph van Richten (Barter NPC)', 'Strahd Rune Barter']
  },
  {
    name: 'Medal of House Deneith',
    description:
      'These battleworn medals have been dented and dinged beyond repair. It appears to be used for upgrading items found within the same adventure.',
    foundIn: ['Sentinels of Stormreach (Epic Quests)'],
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    }
  },
  {
    name: 'Medium Devil Scales',
    type: 'This item may be usable in an eldritch device.',
    description: 'A few reptilian looking devil scales. This item is humming like the Altar of Subjugation.',
    binding: {
      type: 'Unbound'
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Medium Glowing Arrowhead',
    type: 'This item may be usable in an eldritch device.',
    description:
      'A metal arrowhead that gives off a pale greenish light. This item is humming like the Altar of Subjugation.',
    binding: {
      type: 'Unbound'
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Medium Gnawed Bone',
    type: 'This item may be usable in an eldritch device.',
    description: 'A dry bone that has been gnawed clean. This item is humming like the Altar of Subjugation.',
    binding: {
      type: 'Unbound'
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Medium Length of Infernal Chain',
    type: 'This item may be usable in an eldritch device.',
    description: 'A length of dirty, barbed chain. This item is humming like the Altar of Subjugation.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 25
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Medium Splintered Horn',
    type: 'This item may be usable in an eldritch device.',
    description: 'A splintered horn from some unknown creature. This item is resonating like the Altar of Fecundity.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 25
    },
    foundIn: ['The Shroud']
  },
  {
    name: 'Medium Sulfurous Stone',
    type: 'This item may be usable in an eldritch device.',
    description:
      'A rough, crumbly piece of yellowish gray stone that smells of sulfur. This item is humming like the Altar of Subjugation.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 25
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Medium Twisted Shrapnel',
    type: 'This item may be usable in an eldritch device.',
    description: 'A sharp and twisted hunk of metal. This item is humming like the Altar of Subjugation.',
    binding: {
      type: 'Unbound'
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Iron Defender Rivet',
    type: 'This item may be usable in an eldritch device.',
    description: 'A sharp and twisted hunk of metal. This item is humming like the Altar of Subjugation.',
    binding: {
      type: 'Unbound'
    },
    weight: 0.1,
    foundIn: ['Sharn Chests', 'The Cogs Chests']
  },
  {
    name: 'Page Regalia: Exiled Tactica',
    image: 'raidCloakYellow',
    type: 'Cloak',
    description:
      'A cloak that manifested from an especially forbidden page from the University Library through unknown means. It now seeks purpose.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Fire Over Morgrave', 'Ceremony Rune Barter']
  },
  {
    name: 'Page Regalia: Unsanctioned Arcana',
    image: 'raidCloakYellow',
    type: 'Cloak',
    description:
      'A cloak that manifested from an especially forbidden page from the University Library through unknown means. It now seeks purpose.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Fire Over Morgrave', 'Ceremony Rune Barter', 'Draconic Raider’s Reward Box']
  },
  {
    name: 'Platemail of Strahd',
    type: 'Heavy Armor',
    description: 'An old painting in Castle Ravenloft depicts Strahd wearing this very set of armor.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['The Curse of Strahd', 'Rudolph van Richten (Barter NPC)', 'Strahd Rune Barter']
  },
  {
    name: 'Polished White Marble Stone',
    description:
      "A piece of polished white marble that was given to you so you could try out Valaireas's Combination in an eldritch device.",
    type: 'This item may be usable in an eldritch device.',
    foundIn: ['Meridia'],
    binding: {
      type: 'Bound',
      from: 'Acquisition',
      to: 'Character'
    },
    baseValue: {
      gold: 5
    },
    weight: 0.01
  },
  {
    name: "Quartermaster's Chit",
    description:
      'These are worth quite a bit to the right person. Someone in Saltmarsh will likely give you a fair price.',
    foundIn: ['Saltmarsh (Heroic Quests)'],
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    }
  },
  {
    name: 'Quori-Infused Core',
    type: 'Trinket',
    description:
      'This was taken from the Lord of Blades, and has clear signs of Quori influence. You should probably hold onto it, at least for a little while.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Lord of Blades (Legendary)', "Kenneth d'Cannith", 'Blades Rune Barter']
  },
  {
    name: 'Ring of Incredible Potential',
    description:
      "This ring's power has not been fully unleashed. When this ring is combined with 9 Shavarath War Trophies and an Imbued Shard of Great Power in an Alter of Subjugation, its full potential will be revealed.",
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 10020
    },
    foundIn: ['Tower of Despair']
  },
  {
    name: 'Saltmeadow Hay',
    description:
      'This is sheathe of fine-quality hay, the smell of the salty marsh air still lingering within. It appears to be used for upgrading items found within the same adventure.',
    foundIn: ['Saltmarsh (Quests)', 'Saltmarsh (Rare Encounters)'],
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    }
  },
  {
    name: 'Scrap of Patterned Cloth',
    description:
      'This is a scrap of fabric that must have been used for constructing costumes. It appears to be used for upgrading items within the same adventure.',
    foundIn: ['Phiarlan Carnival (Epic Quests)'],
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    }
  },
  {
    name: 'Shard of Great Power',
    description:
      'This dense shard of crystal radiates power. Crystals like this can absorb and combine the power from various sources like foci and essences. Once imbued, this shard may be able to be combined with a weapon or accessory, thereby transferring the power into that item.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Tower of Despair']
  },
  {
    name: 'Shard of Power',
    description: 'This shard of crystal emanates power.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    baseValue: {
      gold: 49500
    },
    inventoryMaxStack: 1,
    weight: 0.1,
    foundIn: ['The Shroud', 'Devil Assault']
  },
  {
    name: 'Shard of Supreme Power',
    description:
      'This weighty shard of crystal radiates immense power. Crystals like this can absorb and combine the power from various sources like foci and essences. Once imbued, this shard may be able to be combined with a weapon or accessory, thereby transferring the power into that item.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Devil Assault']
  },
  {
    name: 'Shavarath Low Energy Cell',
    description: 'A small vessel with a charge of energy inside. This item is humming like the Altar of Invasion.',
    type: 'This item may be usable in an eldritch device.',
    foundIn: ['The Shroud', 'Devil Assault', 'Amrath'],
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 1900
    },
    weight: 0.01
  },
  {
    name: 'Shavarath Stone of Battle',
    type: 'This item may be usable in an eldritch device.',
    description:
      'A polished red triangular stone with the quality of marble. This item is humming like the Altar of Fecundity.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 20
    },
    foundIn: ['Running with the Devils']
  },
  {
    name: 'Shavarath Stone of Foresight',
    type: 'This item may be usable in an eldritch device.',
    description:
      'A polished green triangular stone with the quality of marble. This item is humming like the Altar of Fecundity.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 20
    },
    foundIn: ['Rainbow in the Dark']
  },
  {
    name: 'Shavarath Stone of Might',
    type: 'This item may be usable in an eldritch device.',
    description:
      'A polished purple triangular stone with the quality of marble. This item is humming like the Altar of Fecundity.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 20
    },
    foundIn: ['Ritual Sacrifice']
  },
  {
    name: 'Shavarath Stone of Strategy',
    type: 'This item may be usable in an eldritch device.',
    description:
      'A polished yellow triangular stone with the quality of marble. This item is humming like the Altar of Fecundity.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 20
    },
    foundIn: ['Let Sleeping Dust Lie']
  },
  {
    name: 'Shavarath Stone of Victory',
    type: 'This item may be usable in an eldritch device.',
    description:
      'A polished blue triangular stone with the quality of marble. This item is humming like the Altar of Fecundity.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    baseValue: {
      platinum: 20
    },
    foundIn: ['The Coalescence Chamber']
  },
  {
    name: 'Shavarath Trophy of War',
    description: 'This item is found when a powerful denizen of Shavarath is defeated.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    weight: 0.1,
    foundIn: ['Tower of Despair']
  },
  {
    name: 'Small Devil Scales',
    type: 'This item may be usable in an eldritch device.',
    description: 'A few reptilian looking devil scales. This item is humming like the Altar of Invasion.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 15,
      gold: 5
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Small Glowing Arrowhead',
    description:
      'A metal arrowhead that gives off a pale greenish light. This item is humming like the Altar of Invasion.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 15,
      gold: 5
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Small Gnawed Bone',
    description: 'A dry bone that has been gnawed clean. This item is humming like the Altar of Invasion.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 15,
      gold: 5
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Small Length of Infernal Chain',
    type: 'This item may be usable in an eldritch device.',
    description: 'A length of dirty, barbed chain. This item is humming like the Altar of Invasion.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 15,
      gold: 5
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Small Sulfurous Stone',
    type: 'This item may be usable in an eldritch device.',
    description:
      'A rough, crumbly piece of yellowish gray stone that smells of sulfur. This item is humming like the Altar of Invasion.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 15,
      gold: 5
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Small Twisted Shrapnel',
    type: 'This item may be usable in an eldritch device.',
    description: 'A sharp and twisted hunk of metal. This item is humming like the Altar of Invasion.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 15,
      gold: 5
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Special Energy Cell',
    description:
      "A small vessel with a charge of energy inside that was given to you so you could try out Valaireas's Combination in an eldritch device.",
    type: 'This item may be usable in an eldritch device.',
    foundIn: ['Meridia'],
    binding: {
      type: 'Bound',
      from: 'Acquisition',
      to: 'Character'
    },
    baseValue: {
      platinum: 990
    },
    weight: 0.01
  },
  {
    name: 'Spider Spun Thread',
    description:
      "A strong silken thread that was given to you so you could try out Valaireas's Combination in an eldritch device.",
    type: 'This item may be usable in an eldritch device.',
    foundIn: ['Meridia'],
    binding: {
      type: 'Bound',
      from: 'Acquisition',
      to: 'Character'
    },
    baseValue: {
      gold: 5
    },
    weight: 0.01
  },
  {
    name: 'Staggershockers',
    type: 'Gloves',
    description: 'Aim before releasing.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Project Nemesis', 'Nemesis Rune Barter']
  },
  {
    name: 'Star Fragment',
    description:
      'This fragment of an unknown material glows like a star within your hands. It seems to be the key to unlocking ultimate power.',
    foundIn: ['Saltmarsh (Legendary Rare Encounters)', 'The Chronoscope (Legendary)'],
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    }
  },
  {
    name: 'Strange Tidings',
    image: 'raidRing',
    type: 'Ring',
    description: 'Those who bear this ring have a knack for finding information no one was ever meant to know.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Defiler of the Just', 'Melene (Barter NPC)']
  },
  {
    name: 'Tattered Scrolls of the Broken One',
    type: 'Bracers',
    description: 'Wrap these ancient scrolls around yourself to unlock incredible holy power.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Too Hot to Handle', 'Forge Rune Barter']
  },
  {
    name: "The Family's Blessing",
    type: 'Necklace',
    description: "You're an honorary part of the Family. Wear it with pride.",
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Project Nemesis', 'Nemesis Rune Barter']
  },
  {
    name: 'The Stablestone',
    type: 'Trinket',
    description: 'The more things change, the more they stay the same.',
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ['Hunt or Be Hunted', 'Maes Toben']
  },
  {
    name: 'Thread of Fate',
    description: 'A victorious reminder of your achievements. Perhaps these can be used for something...',
    foundIn: ['Level 30+ Raids'],
    binding: {
      type: 'Bound',
      from: 'Acquisition',
      to: 'Account'
    },
    baseValue: {
      gold: 5
    },
    weight: 0.01
  },
  {
    name: 'Tiny Khyber Dragonshard',
    description:
      'A translucent smoky crystal with colored veins of midnight blue and oily black, pulsing with the power of The Dragon Below. This is a material component for the Trap the Soul spell.',
    binding: {
      type: 'Unbound'
    },
    baseValue: {
      platinum: 100
    },
    weight: 0.01,
    foundIn: [
      'The Portable Hole (Gage Alzander)',
      'The Tower of the Twelve (Monnys Orien)',
      'Arcane Sanctum (Nerena) [Guild Airship Amenity]',
      'Collegium of the Twelve (Nerena) [Guild Airship Amenity]',
      "Amrath (Ver'quea)"
    ]
  },
  {
    name: 'Vault Key',
    description:
      'This key opens a lock that has been long forgotten. It appears to be used for upgrading items found within the same adventures',
    foundIn: ['The Vault of Night (Epic Quests)'],
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    }
  },
  {
    name: 'Vestments of Ravenloft',
    type: 'Light Armor',
    description: "Barovia calls those who have seen its mists, even after they've returned home.",
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
    },
    foundIn: ["Old Baba's Hut", 'Adrian Martikov']
  }
] as const
