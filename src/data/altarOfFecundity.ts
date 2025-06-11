import type { CraftingIngredient } from '../types/crafting.ts'

export const altarOfFecundity: CraftingIngredient[] = [
  {
    name: "Valairea's Combination",
    binding: {
      type: 'Bound',
      location: 'Character',
      when: 'Acquisition'
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    description:
      'This glowing orb is powered with the ancient eldritch magic of the giants. Valairea will be quite interested to see it.',
    requirements: [
      'Chunk of Shavarath Dirt',
      'Gnoll Whittled Branch',
      'Polished White Marble Stone',
      'Spider Spun Thread',
      'Special Energy Cell'
    ],
    quantity: 1
  },
  {
    name: 'Shavarath Signet Stone',
    binding: {
      type: 'Bound',
      location: 'Character',
      when: 'Acquisition'
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    description:
      'A heavy, polished triangular stone with numerous fine carvings on the surface. This item is humming like the Altar of Fecundity.',
    quantity: 1,
    requirements: [
      'Shavarath Stone of Victory',
      'Shavarath Stone of Strategy',
      'Shavarath Stone of Foresight',
      'Shavarath Stone of Battle',
      'Shavarath Stone of Might'
    ]
  },
  {
    name: 'Ore of Travail',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    binding: {
      type: 'Unbound'
    },
    description:
      'An extremely dense piece of unrefined metallic ore. This item is humming like the Altar of Fecundity.',
    quantity: 1,
    requirements: [
      'Glistening Pebbles',
      'Green Briar Twigs',
      'Locust Husk',
      'Chipmunk Funk',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Filaments of Toil',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    binding: {
      type: 'Unbound'
    },
    description:
      'Several iridescent strands of sturdy fiber. This item is humming like the Altar of Fecundity.',
    quantity: 1,
    requirements: [
      'Glistening Pebbles',
      'Green Briar Twigs',
      'Locust Husk',
      'Lammanian Lily Petals',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Yellow Taper',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    binding: {
      type: 'Unbound'
    },
    description:
      'A tall, thin yellow candle. This item is humming like the Altar of Fecundity.',
    quantity: 1,
    requirements: [
      'Glistening Pebbles',
      'Green Briar Twigs',
      'Locust Husk',
      'Bitterscrub Fungus',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Red Taper',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    binding: {
      type: 'Unbound'
    },
    description:
      'A tall, thin red candle. This item is humming like the Altar of Fecundity.',
    quantity: 1,
    requirements: [
      'Glistening Pebbles',
      'Green Briar Twigs',
      'Chipmunk Funk',
      'Lammanian Lily Petals',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Blue Taper',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    binding: {
      type: 'Unbound'
    },
    description:
      'A tall, thin blue candle. This item is humming like the Altar of Fecundity.',
    quantity: 1,
    requirements: [
      'Glistening Pebbles',
      'Green Briar Twigs',
      'Chipmunk Funk',
      'Bitterscrub Fungus',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Taper',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    binding: {
      type: 'Unbound'
    },
    description:
      'A tall, thin green candle. This item is humming like the Altar of Fecundity.',
    quantity: 1,
    requirements: [
      'Glistening Pebbles',
      'Green Briar Twigs',
      'Lammanian Lily Petals',
      'Bitterscrub Fungus',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Violet Taper',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    binding: {
      type: 'Unbound'
    },
    description:
      'A tall, thin violet candle. This item is humming like the Altar of Fecundity.',
    quantity: 1,
    requirements: [
      'Glistening Pebbles',
      'Locust Husk',
      'Chipmunk Funk',
      'Lammanian Lily Petals',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Wondrous Jewel',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    binding: {
      type: 'Unbound'
    },
    description:
      'An extremely sparkly, faceted jewel. This item is humming like the Altar of Fecundity.',
    quantity: 1,
    requirements: [
      'Glistening Pebbles',
      'Locust Husk',
      'Chipmunk Funk',
      'Bitterscrub Fungus',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Wondrous Balm',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    binding: {
      type: 'Unbound'
    },
    description:
      'A small, wide container of musky smelling balm. This item is humming like the Altar of Fecundity.',
    quantity: 1,
    requirements: [
      'Glistening Pebbles',
      'Locust Husk',
      'Lammanian Lily Petals',
      'Bitterscrub Fungus',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Wondrous Scarab',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    binding: {
      type: 'Unbound'
    },
    description:
      'A finely crafted sculpture of a scarab beetle. This item is humming like the Altar of Fecundity.',
    quantity: 1,
    requirements: [
      'Glistening Pebbles',
      'Chipmunk Funk',
      'Lammanian Lily Petals',
      'Bitterscrub Fungus',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Wondrous Oil',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    binding: {
      type: 'Unbound'
    },
    description:
      'A small, narrow bottle of dark oil with a spicy smell. This item is humming like the Altar of Fecundity.',
    quantity: 1,
    requirements: [
      'Green Briar Twigs',
      'Locust Husk',
      'Chipmunk Funk',
      'Lammanian Lily Petals',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Wondrous Jewel',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    binding: {
      type: 'Unbound'
    },
    description:
      'An extremely sparkly, faceted jewel. This item is humming like the Altar of Fecundity.',
    quantity: 1,
    requirements: [
      'Green Briar Twigs',
      'Locust Husk',
      'Chipmunk Funk',
      'Bitterscrub Fungus',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Wondrous Balm',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    binding: {
      type: 'Unbound'
    },
    description:
      'A small, wide container of musky smelling balm. This item is humming like the Altar of Fecundity.',
    quantity: 1,
    requirements: [
      'Green Briar Twigs',
      'Locust Husk',
      'Lammanian Lily Petals',
      'Bitterscrub Fungus',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Wondrous Scarab',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    binding: {
      type: 'Unbound'
    },
    description:
      'A finely crafted sculpture of a scarab beetle. This item is humming like the Altar of Fecundity.',
    quantity: 1,
    requirements: [
      'Green Briar Twigs',
      'Chipmunk Funk',
      'Lammanian Lily Petals',
      'Bitterscrub Fungus',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Wondrous Oil',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
    craftedIn: 'Eldritch Altar of Fecundity',
    binding: {
      type: 'Unbound'
    },
    description:
      'A small, narrow bottle of dark oil with a spicy smell. This item is humming like the Altar of Fecundity.',
    quantity: 1,
    requirements: [
      'Locust Husk',
      'Chipmunk Funk',
      'Lammanian Lily Petals',
      'Bitterscrub Fungus',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Dagger',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Blue Taper',
      'Wondrous Balm',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Hand Axe',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Yellow Taper',
      'Wondrous Balm',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Kama',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Yellow Taper',
      'Wondrous Scarab',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Kukri',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Yellow Taper',
      'Wondrous Oil',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Light Mace',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Red Taper',
      'Wondrous Jewel',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Light Pick',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Red Taper',
      'Wondrous Balm',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Shortsword',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Yellow Taper',
      'Wondrous Jewel',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Sickle',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Blue Taper',
      'Wondrous Balm',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Rapier',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Red Taper',
      'Wondrous Balm',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Battle Axe',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Yellow Taper',
      'Wondrous Jewel',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Heavy Mace',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Red Taper',
      'Wondrous Scarab',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Heavy Pick',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Red Taper',
      'Wondrous Jewel',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Khopesh',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Blue Taper',
      'Wondrous Oil',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Longsword',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Red Taper',
      'Wondrous Scarab',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Morningstar',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Yellow Taper',
      'Wondrous Balm',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Scimitar',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Blue Taper',
      'Wondrous Jewel',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Sceptre',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Blue Taper',
      'Wondrous Jewel',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Warhammer',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Red Taper',
      'Wondrous Oil',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Handwraps',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Yellow Taper',
      'Wondrous Oil',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Dwarven Waraxe',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Yellow Taper',
      'Wondrous Balm',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Bastard Sword',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Yellow Taper',
      'Wondrous Jewel',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Falchion',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Yellow Taper',
      'Wondrous Scarab',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Greataxe',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Yellow Taper',
      'Wondrous Oil',
      'Medium Splintered Horn'
    ]
  }
] as const
