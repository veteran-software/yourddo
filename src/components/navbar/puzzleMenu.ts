import type { NavDropdownType, NavMenuDropdown } from './types.ts'

export const menuItems: NavDropdownType[] = [
  {
    label: 'Shroud',
    image: '',
    active: true
  }
]

export const puzzleMenu: NavMenuDropdown = {
  id: 'puzzle-solvers',
  title: 'Puzzle Solvers',
  items: menuItems
}
