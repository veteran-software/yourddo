import type { NavDropdownType, NavMenuDropdown } from './types.ts'

export const menuItems: NavDropdownType[] = [
  { label: 'Epic Crafting', image: '', active: true },
  { label: 'Sentient Weapons', image: '', active: true },
  { label: 'Minor Artifact', image: '', active: true },
  { label: 'Mikrom Sum', image: '', active: true },
  { label: 'Thunder-Forged', image: '', active: true },
  { label: 'Legendary Green Steel', image: '', active: true },
  { label: 'Zhentarum Attuned', image: '', active: true },
  { label: 'Schism Shard', image: '', active: true }
]

export const epicMenu: NavMenuDropdown = {
  id: 'epic-crafting',
  title: 'Epic Crafting (20-29)',
  items: menuItems
}
