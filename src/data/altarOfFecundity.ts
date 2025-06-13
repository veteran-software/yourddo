import type { CraftingIngredient } from '../types/crafting.ts'

export const altarOfFecundity: CraftingIngredient[] = [
  {
    name: "Valairea's Combination",
    binding: {
      type: 'Bound',
      to: 'Character',
      from: 'Acquisition'
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
      to: 'Character',
      from: 'Acquisition'
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
      'Large Splintered Horn'
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
      'Large Splintered Horn'
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
      'Large Splintered Horn'
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
      'Large Splintered Horn'
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
      'Large Splintered Horn'
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
      'Large Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Greatsword',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Red Taper',
      'Wondrous Balm',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Maul',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Red Taper',
      'Wondrous Jewel',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Quarterstaff',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Red Taper',
      'Wondrous Oil',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Shuriken',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Red Taper',
      'Wondrous Scarab',
      'Large Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Throwing Axe',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Red Taper',
      'Wondrous Oil',
      'Large Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Throwing Dagger',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Blue Taper',
      'Wondrous Scarab',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Throwing Hammer',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Blue Taper',
      'Wondrous Scarab',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Shortbow',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Blue Taper',
      'Wondrous Oil',
      'Large Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Longbow',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Yellow Taper',
      'Wondrous Scarab',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Light Crossbow',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Blue Taper',
      'Wondrous Oil',
      'Medium Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Heavy Crossbow',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Blue Taper',
      'Wondrous Jewel',
      'Large Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Great Crossbow',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Yellow Taper',
      'Wondrous Oil',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Repeating Light Crossbow',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Blue Taper',
      'Wondrous Scarab',
      'Large Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Repeating Heavy Crossbow',
    ingredientType: 'Green Steel Weapon',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Ore of Travail',
      'Blue Taper',
      'Wondrous Balm',
      'Large Splintered Horn'
    ]
  },
  {
    name: 'Green Steel Weave Boots',
    ingredientType: 'Green Steel Accessory',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Filaments of Toil',
      'Green Taper',
      'Wondrous Jewel',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Weave Gloves',
    ingredientType: 'Green Steel Accessory',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Filaments of Toil',
      'Green Taper',
      'Wondrous Balm',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Belt',
    ingredientType: 'Green Steel Accessory',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Filaments of Toil',
      'Green Taper',
      'Wondrous Scarab',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Weave Cloak',
    ingredientType: 'Green Steel Accessory',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Filaments of Toil',
      'Green Taper',
      'Wondrous Oil',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Helm',
    ingredientType: 'Green Steel Accessory',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Filaments of Toil',
      'Violet Taper',
      'Wondrous Jewel',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Necklace',
    ingredientType: 'Green Steel Accessory',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Filaments of Toil',
      'Violet Taper',
      'Wondrous Balm',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Bracers',
    ingredientType: 'Green Steel Accessory',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Filaments of Toil',
      'Violet Taper',
      'Wondrous Scarab',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Green Steel Goggles',
    ingredientType: 'Green Steel Accessory',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      'Shavarath Signet Stone',
      'Filaments of Toil',
      'Violet Taper',
      'Wondrous Oil',
      'Eberron Energy Cell'
    ]
  },
  {
    name: 'Legendary Green Steel Shortsword',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Morningstar',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Longbow',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Great Crossbow',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Maul',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Greatsword',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Longsword',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Warhammer',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Sceptre',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Dagger',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Throwing Hammer',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Khopesh',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Weave Boots',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Weave Gloves',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Belt',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Weave Cloak',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Helm',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Necklace',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Bracers',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Goggles',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Bastard Sword',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Hand Axe',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Kama',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Kukri',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Light Mace',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Light Pick',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Heavy Mace',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Quarterstaff',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Scimitar',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Sickle',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Throwing Dagger',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Light Crossbow',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Battle Axe',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Dwarven Waraxe',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Falchion',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Greataxe',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Heavy Pick',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Rapier',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Shuriken',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Throwing Axe',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Heavy Crossbow',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Repeating Heavy Crossbow',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Repeating Light Crossbow',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Shortbow',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Greatclub',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Light Hammer',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Dart',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Handwraps',
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Codex Rune',
        quantity: 100
      },
      {
        name: 'Commendation of Valor',
        quantity: 100
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Flame Arrow (Arrows)',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      'Creates 50 flaming arrows within your inventory. This spell requires and consumes 1 normal or masterwork arrow. Flaming arrows do an extra 1 to 6 points of fire damage on a successful hit. Conjured ammunition vanishes if you log out.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Inferior Focus of Fire',
        quantity: 3
      },
      {
        name: 'Legendary Focus of Fire',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Cloudy Gem of Opposition',
        quantity: 1
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Nightshield',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      'Grants a resistance bonus to saves and protection from magic missiles.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Inferior Focus of Positive Energy',
        quantity: 2
      },
      {
        name: 'Legendary Inferior Focus of Negative Energy',
        quantity: 2
      },
      {
        name: 'Legendary Diluted Ethereal Essence',
        quantity: 2
      },
      {
        name: 'Legendary Diluted Material Essence',
        quantity: 1
      },
      {
        name: 'Legendary Cloudy Gem of Opposition',
        quantity: 3
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Haste',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      'Quickens allies, causing them to attack 15% faster than normal. In addition the recipient gains a +1 enhancement bonus to attack rolls, a +1 bonus to Reflex Saving Throws, and +1% Dodge.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Inferior Focus of Air',
        quantity: 3
      },
      {
        name: 'Legendary Inferior Focus of Fire',
        quantity: 3
      },
      {
        name: 'Legendary Diluted Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Diluted Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Cloudy Gem of Dominion',
        quantity: 1
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Displacement',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      "The caster's appearance becomes extremely blurred, giving enemies a 50% miss chance when attacking.",
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Diluted Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Pure Ethereal Essence',
        quantity: 1
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 3
      },
      {
        name: 'Legendary Cloudy Flawless Gem of Dominion',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Dark Discorporation',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      'You turn into a swarm of batlike shadows. In this form, you gain Invisibility, 25% Incorporeality, and damage from all sources (except for Untyped/Bane damage) is reduced by 50%. Attacking enemies or interacting with objects will revert you to normal form.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Focus of Negative Energy',
        quantity: 3
      },
      {
        name: 'Legendary Superior Focus of Negative Energy',
        quantity: 2
      },
      {
        name: 'Legendary Pure Ethereal Essence',
        quantity: 1
      },
      {
        name: 'Legendary Gem of Escalation',
        quantity: 3
      },
      {
        name: 'Legendary Flawless Gem of Escalation',
        quantity: 1
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Stormrage',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      'You gain featherfall and gain the Deflect Arrows feat. When you damage an enemy with attacks or spells, they are also struck by lightning. For each enemy, lightning only strikes once. Duration: 12 seconds.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Superior Focus of Air',
        quantity: 2
      },
      {
        name: 'Legendary Superior Focus of Water',
        quantity: 1
      },
      {
        name: 'Legendary Diluted Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Gem of Opposition',
        quantity: 1
      },
      {
        name: 'Legendary Flawless Gem of Opposition',
        quantity: 1
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Your Flesh is Weak',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      'Activate this ability to cause 1d8+2 Strength damage to your opponent. You gain an Insight bonus of 10 Strength for 20 seconds.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Inferior Focus of Negative Energy',
        quantity: 3
      },
      {
        name: 'Legendary Focus of Negative Energy',
        quantity: 3
      },
      {
        name: 'Legendary Diluted Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: You Cannot Evade Me',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      'Activate this ability to cause 1d8+2 Dexterity damage to your opponent. You gain an Insight bonus of 10 Dexterity for 20 seconds.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Inferior Focus of Negative Energy',
        quantity: 3
      },
      {
        name: 'Legendary Focus of Negative Energy',
        quantity: 3
      },
      {
        name: 'Legendary Diluted Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Your Will is Mine',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      'Activate this ability to cause 1d8+2 Wisdom damage to your opponent. You gain an Insight bonus of 10 Wisdom for 20 seconds.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Inferior Focus of Negative Energy',
        quantity: 3
      },
      {
        name: 'Legendary Focus of Negative Energy',
        quantity: 3
      },
      {
        name: 'Legendary Diluted Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Food for Thought',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      'Activate this ability to cause 1d8+2 Intelligence damage to your opponent. You gain an Insight bonus of 10 Intelligence for 20 seconds.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Inferior Focus of Negative Energy',
        quantity: 3
      },
      {
        name: 'Legendary Focus of Negative Energy',
        quantity: 3
      },
      {
        name: 'Legendary Diluted Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Blood Feast',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      'Activate this ability to cause 1d8+2 Constitution damage to your opponent. You gain an Insight bonus of 10 Constitution for 20 seconds.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Inferior Focus of Negative Energy',
        quantity: 3
      },
      {
        name: 'Legendary Focus of Negative Energy',
        quantity: 3
      },
      {
        name: 'Legendary Diluted Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Reincarnate',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      "Resurrects the target, restores 50% of the target's hit points, and preserves current spell points. It also randomly applies a set of ability score bonuses and penalties to the target.",
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Focus of Positive Energy',
        quantity: 3
      },
      {
        name: 'Legendary Superior Focus of Positive Energy',
        quantity: 3
      },
      {
        name: 'Legendary Pure Material Essence',
        quantity: 2
      },
      {
        name: 'Legendary Pure Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Flawless Gem of Dominion',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Animal Growth',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      'Grants an Animal, Magical Beast,m or Vermin a +4 Size Bonus to Strength, a +4 Size Bonus to Constitution, and a -2 penalty to Dexterity.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Inferior Focus of Positive Energy',
        quantity: 3
      },
      {
        name: 'Legendary Diluted Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Cloudy Gem of Escalation',
        quantity: 1
      },
      {
        name: 'Legendary Gem of Escalation',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Tenacious Pack',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      "Forms a link between a leader and his or her pack, granting all of the target's hirelings, pets, summoned creatures, and charmed creatures a 30% enhancement bonus to fortification and positive healing amplification.",
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Focus of Positive Energy',
        quantity: 2
      },
      {
        name: 'Legendary Diluted Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Cloudy Gem of Escalation',
        quantity: 3
      },
      {
        name: 'Legendary Gem of Escalation',
        quantity: 1
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Greater Vigor, Mass',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: '',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Inferior Focus of Positive Energy',
        quantity: 3
      },
      {
        name: 'Legendary Focus of Positive Energy',
        quantity: 2
      },
      {
        name: 'Legendary Superior Focus of Positive Energy',
        quantity: 1
      },
      {
        name: 'Legendary Gem of Escalation',
        quantity: 2
      },
      {
        name: 'Legendary Flawless Gem of Escalation',
        quantity: 1
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Good Weapons',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      "Your target's currently equipped weapons gain the ability to bypass Good damage reduction. An item can have only one temporary item enchantment at a time.",
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Diluted Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 3
      },
      {
        name: 'Legendary Superior Focus of Positive Energy',
        quantity: 1
      },
      {
        name: 'Legendary Gem of Escalation',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Evil Weapons',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      "Your target's currently equipped weapons gain the ability to bypass Evil damage reduction. An item can have only one temporary item enchantment at a time.",
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Diluted Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 3
      },
      {
        name: 'Legendary Superior Focus of Negative Energy',
        quantity: 1
      },
      {
        name: 'Legendary Gem of Escalation',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Lawful Weapons',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      "Your target's currently equipped weapons gain the ability to bypass Lawful damage reduction. An item can have only one temporary item enchantment at a time.",
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Diluted Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 3
      },
      {
        name: 'Legendary Flawless Gem of Opposition',
        quantity: 1
      },
      {
        name: 'Legendary Gem of Escalation',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Chaotic Weapons',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      "Your target's currently equipped weapons gain the ability to bypass Chaotic damage reduction. An item can have only one temporary item enchantment at a time.",
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Diluted Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 3
      },
      {
        name: 'Legendary Flawless Gem of Opposition',
        quantity: 1
      },
      {
        name: 'Legendary Gem of Escalation',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Radiant Forcefield',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      'Your target is surrounded in a sphere of magical force that reduces all damage (except for untyped damage) they take by 25% for a short period of time.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Focus of Earth',
        quantity: 3
      },
      {
        name: 'Legendary Superior Focus of Water',
        quantity: 3
      },
      {
        name: 'Legendary Pure Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Flawless Gem of Dominion',
        quantity: 3
      },
      {
        name: 'Legendary Flawless Gem of Escalation',
        quantity: 3
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Summon Frog',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      "Summons a cute animal. It's not very useful. Runs away and hides after a few minutes.",
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Superior Focus of Water',
        quantity: 3
      },
      {
        name: 'Legendary Superior Focus of Positive Energy',
        quantity: 3
      },
      {
        name: 'Legendary Pure Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Pure Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Flawless Gem of Escalation',
        quantity: 3
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Polar Ray',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: '',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Inferior Focus of Water',
        quantity: 3
      },
      {
        name: 'Legendary Focus of Water',
        quantity: 2
      },
      {
        name: 'Legendary Superior Focus of Water',
        quantity: 1
      },
      {
        name: 'Legendary Material Essence',
        quantity: 2
      },
      {
        name: 'Legendary Gem of Opposition',
        quantity: 3
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Protection from Elements, Mass',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: '',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Superior Focus of Earth',
        quantity: 2
      },
      {
        name: 'Legendary Superior Focus of Air',
        quantity: 2
      },
      {
        name: 'Legendary Superior Focus of Fire',
        quantity: 2
      },
      {
        name: 'Legendary Superior Focus of Water',
        quantity: 2
      },
      {
        name: 'Legendary Flawless Gem of Dominion',
        quantity: 3
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Cometfall',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: '',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Superior Focus of Earth',
        quantity: 3
      },
      {
        name: 'Legendary Superior Focus of Fire',
        quantity: 3
      },
      {
        name: 'Legendary Inferior Focus of Air',
        quantity: 1
      },
      {
        name: 'Legendary Pure Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Flawless Gem of Opposition',
        quantity: 1
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Quench',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: '',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Inferior Focus of Water',
        quantity: 3
      },
      {
        name: 'Legendary Focus of Water',
        quantity: 2
      },
      {
        name: 'Legendary Material Essence',
        quantity: 2
      },
      {
        name: 'Legendary Gem of Opposition',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Call Kindred Being (Armor)',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: 'Summon a powerful monster.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Flawless Gem of Dominion',
        quantity: 1
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 2
      },
      {
        name: 'Legendary Cloudy Gem of Dominion',
        quantity: 3
      },
      {
        name: 'Legendary Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Call Kindred Being (Golem)',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: 'Summon a powerful monster.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Flawless Gem of Dominion',
        quantity: 1
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 2
      },
      {
        name: 'Legendary Cloudy Gem of Dominion',
        quantity: 3
      },
      {
        name: 'Legendary Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Call Kindred Being (Succubus)',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: 'Summon a powerful monster.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Flawless Gem of Dominion',
        quantity: 1
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 2
      },
      {
        name: 'Legendary Cloudy Gem of Dominion',
        quantity: 3
      },
      {
        name: 'Legendary Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Call Kindred Being (Dream Reaver)',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: 'Summon a powerful monster.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Flawless Gem of Dominion',
        quantity: 1
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 2
      },
      {
        name: 'Legendary Cloudy Gem of Dominion',
        quantity: 3
      },
      {
        name: 'Legendary Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Call Kindred Being (Lich)',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: 'Summon a powerful monster.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Flawless Gem of Dominion',
        quantity: 1
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 2
      },
      {
        name: 'Legendary Cloudy Gem of Dominion',
        quantity: 3
      },
      {
        name: 'Legendary Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Call Kindred Being (Gargoyle)',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: 'Summon a powerful monster.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Flawless Gem of Dominion',
        quantity: 1
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 2
      },
      {
        name: 'Legendary Cloudy Gem of Dominion',
        quantity: 3
      },
      {
        name: 'Legendary Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Conjure Bolts',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      'Conjures a stack of 1,000 bolts to use with a crossbow. These bolts have a +1 enhancement bonus. These bolts dissolve into nothingness after logout.',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Inferior Focus of Air',
        quantity: 3
      },
      {
        name: 'Legendary Focus of Air',
        quantity: 2
      },
      {
        name: 'Legendary Diluted Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Material Essence',
        quantity: 2
      },
      {
        name: 'Legendary Gem of Escalation',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Animate Ally',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description:
      "Resurrects the target, restores 50% of the target's hit points, and preserves current spell points. The target is also undead and will steadily take damage until death reclaims it.",
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Inferior Focus of Negative Energy',
        quantity: 3
      },
      {
        name: 'Legendary Focus of Negative Energy',
        quantity: 2
      },
      {
        name: 'Legendary Material Essence',
        quantity: 3
      },
      {
        name: 'Legendary Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Gem of Escalation',
        quantity: 1
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Panacea',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: '',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Inferior Focus of Positive Energy',
        quantity: 3
      },
      {
        name: 'Legendary Focus of Positive Energy',
        quantity: 2
      },
      {
        name: 'Legendary Superior Focus of Positive Energy',
        quantity: 1
      },
      {
        name: 'Legendary Pure Ethereal Essence',
        quantity: 1
      },
      {
        name: 'Legendary Gem of Dominion',
        quantity: 3
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Sigil of Warding',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: '',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Pure Ethereal Essence',
        quantity: 2
      },
      {
        name: 'Legendary Superior Focus of Water',
        quantity: 2
      },
      {
        name: 'Legendary Gem of Escalation',
        quantity: 3
      },
      {
        name: 'Legendary Flawless Gem of Escalation',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Sigil of Lifeshielding',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: '',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Pure Ethereal Essence',
        quantity: 2
      },
      {
        name: 'Legendary Superior Focus of Positive Energy',
        quantity: 2
      },
      {
        name: 'Legendary Gem of Escalation',
        quantity: 3
      },
      {
        name: 'Legendary Flawless Gem of Escalation',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Sigil of Energy Negation',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: '',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Pure Ethereal Essence',
        quantity: 2
      },
      {
        name: 'Legendary Superior Focus of Negative Energy',
        quantity: 2
      },
      {
        name: 'Legendary Gem of Escalation',
        quantity: 3
      },
      {
        name: 'Legendary Flawless Gem of Escalation',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Sigil of Battering Spellcraft',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: '',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Ethereal Essence',
        quantity: 3
      },
      {
        name: 'Legendary Pure Ethereal Essence',
        quantity: 2
      },
      {
        name: 'Legendary Superior Focus of Air',
        quantity: 2
      },
      {
        name: 'Legendary Gem of Escalation',
        quantity: 3
      },
      {
        name: 'Legendary Flawless Gem of Escalation',
        quantity: 2
      }
    ]
  },
  {
    name: 'Legendary Green Steel Augment: Restoration',
    minimumLevel: 26,
    binding: {
      type: 'Bound',
      to: 'Account',
      from: 'Acquisition'
    },
    augmentType: 'Green Steel Epic Active',
    description: '',
    baseValue: {
      platinum: 350
    },
    weight: 0.01,
    craftedIn: 'Eldritch Altar of Fecundity',
    quantity: 1,
    requirements: [
      {
        name: 'Legendary Inferior Focus of Positive Energy',
        quantity: 3
      },
      {
        name: 'Legendary Focus of Positive Energy',
        quantity: 3
      },
      {
        name: 'Legendary Superior Focus of Positive Energy',
        quantity: 3
      },
      {
        name: 'Legendary Pure Material Essence',
        quantity: 1
      },
      {
        name: 'Legendary Flawless Gem of Escalation',
        quantity: 3
      }
    ]
  }
] as const
