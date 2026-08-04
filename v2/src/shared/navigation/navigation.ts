export interface NavigationItem {
  label: string
  path: string
}

export interface NavigationGroup {
  label: string
  items: NavigationItem[]
}

export const navigation: NavigationGroup[] = [
  {
    label: 'Tools',
    items: [
      { label: 'Gear Planner', path: '/gear-planner' },
      { label: 'Saga Tracker', path: '/saga-tracker' }
    ]
  },
  {
    label: 'Crafting',
    items: [
      { label: 'Essence Crafting', path: '/essence-crafting' },
      { label: 'Cauldron of Cadence', path: '/cauldron-of-cadence' },
      { label: 'Incredible Potential', path: '/incredible-potential' },
      { label: 'Nearly Complete', path: '/nearly-complete' },
      { label: 'Nearly Finished', path: '/nearly-finished' },
      { label: 'Dinosaur Bone Crafting', path: '/dinosaur-bone' },
      { label: 'Heroic Green Steel', path: '/green-steel' },
      { label: 'Legendary Green Steel', path: '/legendary-green-steel' },
      { label: 'Viktranium Experiment', path: '/viktranium-experiment' }
    ]
  },
  {
    label: 'Puzzle Solvers',
    items: [
      { label: "The Reaver's Fate", path: '/reavers-fate' },
      {
        label: 'Monastery of the Scorpion',
        path: '/monastery-of-the-scorpion'
      },
      { label: 'The Shadow Crypt', path: '/the-shadow-crypt' },
      { label: 'The Shroud', path: '/the-shroud' },
      { label: 'Total Chaos', path: '/total-chaos' }
    ]
  }
]
