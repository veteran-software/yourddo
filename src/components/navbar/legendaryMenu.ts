import type { NavDropdownType, NavMenuDropdown } from './types.ts'

const menuItems: NavDropdownType[] = [
  { label: 'Legendary Crafting', image: '', active: true },
  { label: 'Nebula Fragment Crafting', image: '', active: true },
  { label: 'Soulforge', image: '', active: true },
  { label: 'Dinosaur Bone Crafting', image: '', active: true },
  { label: 'Esoteric Table', image: '', active: true },
  { label: 'Ritual Table', image: '', active: true },
  { label: 'Augmentation Altar', image: '', active: true }
]

export const legendaryMenu: NavMenuDropdown = {
  id: 'legendary-crafting',
  title: 'Legendary Crafting (30+)',
  items: menuItems
}
