import type { NavDropdownType, NavMenuDropdown } from './types.ts'

export const menuItems: NavDropdownType[] = [
  {
    label: 'Epic Crafting',
    image: '',
    active: false
  },
  {
    label: 'Sentient Weapons',
    image: '',
    active: false
  },
  {
    label: 'Minor Artifact',
    image: '',
    active: false
  },
  {
    label: 'Mikrom Sum',
    image: '',
    active: false
  },
  {
    label: 'Thunder-Forged',
    image: '',
    active: false
  },
  {
    label: 'Legendary Green Steel',
    image: '',
    active: true
  },
  {
    label: 'Zhentarum Attuned',
    image: '',
    active: false
  },
  {
    label: 'Schism Shard',
    image: '',
    active: false
  }
]

export const epicMenu: NavMenuDropdown = {
  id: 'epic-crafting',
  title: 'Epic Crafting (20-29)',
  items: menuItems
}
