import type { NavDropdownType, NavMenuDropdown } from './types.ts'

const menuItems: NavDropdownType[] = [
  { label: 'Cannith Crafting', image: '', active: true },
  { label: 'Reaper Forge', image: '', active: true },
  { label: 'Stone Of Change', image: '', active: true },
  { label: 'Cauldron Of Cadence', image: '', active: true },
  { label: 'Dampened', image: '', active: true },
  { label: 'Against The Slave Lords', image: '', active: true },
  { label: 'Green Steel', image: '', active: true },
  { label: 'Alchemical', image: '', active: true },
  { label: 'Cauldron Of Sora Katra', image: '', active: true },
  { label: 'Dragonscale Armor', image: '', active: true },
  { label: 'Storemreaver Monument', image: '', active: true },
  { label: 'Trace Of Madness', image: '', active: true },
  { label: 'Fountain Of Necrotic Might', image: '', active: true },
  { label: 'Nearly Finished', image: '', active: true },
  { label: 'Dragontouched Armor', image: '', active: true },
  { label: 'Incredible Potential', image: '', active: true },
  { label: 'Suppressed Power', image: '', active: true },
  { label: 'Lost Purpose', image: '', active: true },
  { label: 'Unholy Defiler Of The Hidden Hand', image: '', active: true }
]

export const heroicMenu: NavMenuDropdown = {
  id: 'heroic-crafting',
  title: 'Heroic Crafting (1-19)',
  items: menuItems
}
