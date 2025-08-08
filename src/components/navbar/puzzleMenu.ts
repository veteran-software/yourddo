import type { NavDropdownType, NavMenuDropdown } from './types.ts'

export const menuItems: NavDropdownType[] = [
  {
    label: 'Reavers Fate',
    image: '',
    active: true
  },
  {
    label: 'Total Chaos',
    image: '',
    active: true
  },
  {
    label: 'The Shroud',
    image: '',
    active: true
  }
]

export const puzzleMenu: NavMenuDropdown = {
  id: 'puzzle-solvers',
  title: 'Puzzle Solvers',
  items: menuItems
}
