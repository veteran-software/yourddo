import type { CraftingIngredient } from '../types/crafting.ts'

export const altarOfFecundity: CraftingIngredient[] = [
  {
    name: "Valairea's Combination",
    binding: {
      type: 'Bound',
      location: 'Character',
      when: 'Acquisition'
    },
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
    name: 'Ore of Trevail',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
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
    name: 'Yellow taper',
    ingredientType: 'This item may be usable in an eldritch device.',
    baseValue: {
      platinum: 35,
      gold: 5
    },
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
  }
] as const
