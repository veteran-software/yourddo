import type { NavDropdownType, NavMenuDropdown } from './types.ts'

const menuItems: NavDropdownType[] = [
  { label: 'Cauldron Of Cadence', image: '', active: true },
  { label: 'Legendary Crafting', image: '', active: false },
  { label: 'Nebula Fragment Crafting', image: '', active: false },
  { label: 'Soulforge', image: '', active: false },
  { label: 'Dinosaur Bone', image: '', active: true },
  { label: 'Esoteric Table', image: '', active: false },
  { label: 'Ritual Table', image: '', active: false },
  { label: 'Augmentation Altar', image: '', active: false },
  { label: 'Viktranium Experiment', image: '', active: false }
]

export const legendaryMenu: NavMenuDropdown = {
  id: 'legendary-crafting',
  title: 'Legendary Crafting (30+)',
  items: menuItems
}
