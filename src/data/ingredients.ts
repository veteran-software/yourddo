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
    foundIn: [
      'A Relic of a Sovereign Past',
      "Ataraxia's Haven",
      'Made to Order'
    ]
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
    description:
      'This magical metal is warm to the touch and can be shaped into whatever weapon you desire.',
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
    name: 'Barrier Fragment',
    description:
      'Fragments of a shattered barrier. Used at the Ritual Table to unseal power.',
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
    foundIn: [
      'Smashing Pumpkins',
      'Grave Work',
      "The Kobolds' Newest Ringleader"
    ]
  },
  {
    name: 'Black Dragon Scale',
    description:
      'This is a large, strong, and pliable scale from a Black Dragon.',
    binding: {
      type: 'Unbound'
    },
    weight: 0.01,
    foundIn: ['Gianthold Tor (Heroic)', 'Mired in Kobolds']
  },
  {
    name: 'Black Dust of Vile Darkness',
    description:
      'This dust radiates corruption and evil. What might it have been before it became dust?',
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
    foundIn: [
      'The Isle of Dread (Legendary)',
      'Skeletons in the Closet',
      'Draconic Raider’s Reward Box'
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
    name: 'Eberron Energy Cell',
    description: 'A small vessel with a charge of energy inside.',
    type: 'This item may be usable in an eldritch device.',
    foundIn: ['The Eldritch Chamber (Meridia)'],
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
    description:
      'Fresh green twigs with very small thorns. These Twigs are humming like the Altar of Fecundity.',
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
    name: 'Medium Devil Scales',
    type: 'This item may be usable in an eldritch device.',
    description:
      'A few reptilian looking devil scales. This item is humming like the Altar of Subjugation.',
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
    description:
      'A dry bone that has been gnawed clean. This item is humming like the Altar of Subjugation.',
    binding: {
      type: 'Unbound'
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
  },
  {
    name: 'Medium Length of Infernal Chain',
    type: 'This item may be usable in an eldritch device.',
    description:
      'A length of dirty, barbed chain. This item is humming like the Altar of Subjugation.',
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
    description:
      'A sharp and twisted hunk of metal. This item is humming like the Altar of Subjugation.',
    binding: {
      type: 'Unbound'
    },
    weight: 0.1,
    foundIn: ['The Shroud', 'Amrath', 'Devil Assault']
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
    description:
      'This item is found when a powerful denizen of Shavarath is defeated.',
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    weight: 0.1,
    foundIn: ['Tower of Despair']
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
  }
] as const

export type IngredientName = (typeof ingredients)[number]['name']
