import { type Icon, IconBlocks, IconHome, IconPuzzle, IconTool } from '@tabler/icons-react'

export interface NavigationItem {
  label: string
  path: string
}

export interface NavigationGroup {
  label: string
  icon: Icon
  items: NavigationItem[]
}

export const homeNavigationItem = {
  label: 'Home',
  path: '/',
  icon: IconHome
}

export const navigation: NavigationGroup[] = [
  {
    label: 'Tools',
    icon: IconTool,
    items: [
      { label: 'Gear Planner', path: '/gear-planner' },
      { label: 'Saga Tracker', path: '/saga-tracker' }
    ]
  },
  {
    label: 'Crafting',
    icon: IconBlocks,
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
    icon: IconPuzzle,
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
