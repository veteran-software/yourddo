import type { NavDropdownType, NavMenuDropdown } from './types.ts'

const menuItems: NavDropdownType[] = [
  { label: 'Alchemical', image: '', active: false },
  { label: 'Against The Slave Lords', image: '', active: false },
  { label: 'Cannith Crafting', image: '', active: true },
  { label: 'Cauldron Of Cadence', image: '', active: false },
  { label: 'Cauldron Of Sora Katra', image: '', active: false },
  { label: 'Dampened', image: '', active: false },
  { label: 'Dragonscale Armor', image: '', active: false },
  { label: 'Dragontouched Armor', image: '', active: false },
  { label: 'Fountain Of Necrotic Might', image: '', active: false },
  { label: 'Green Steel', image: '', active: true },
  { label: 'Incredible Potential', image: '', active: true },
  { label: 'Lost Purpose', image: '', active: false },
  { label: 'Nearly Finished', image: '', active: false },
  { label: 'Reaper Forge', image: '', active: false },
  { label: 'Stone Of Change', image: '', active: false },
  { label: 'Storemreaver Monument', image: '', active: false },
  { label: 'Suppressed Power', image: '', active: false },
  { label: 'Trace Of Madness', image: '', active: false },
  { label: 'Unholy Defiler Of The Hidden Hand', image: '', active: false }
]

export const heroicMenu: NavMenuDropdown = {
  id: 'heroic-crafting',
  title: 'Heroic Crafting (1-19)',
  items: menuItems
}
