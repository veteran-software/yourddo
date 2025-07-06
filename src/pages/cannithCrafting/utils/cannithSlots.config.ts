import type { CannithCraftingState } from '../../../redux/slices/cannithCraftingSlice.ts'

export interface CannithSlot {
  key: string
  label: string
  slotName: string
  reduxKey: keyof Omit<CannithCraftingState, 'minimumLevel'>
}

export const CANNITH_SLOTS: CannithSlot[] = [
  {
    key: 'how-to',
    label: 'How-To',
    slotName: '',
    reduxKey: 'weapon1'
  }, // Special case for How-To
  {
    key: 'gear-set',
    label: 'Gear Set',
    slotName: '',
    reduxKey: 'weapon1'
  }, // Special case for Gear Set
  {
    key: 'weapon-main-hand',
    label: 'Weapon',
    slotName: 'Weapon',
    reduxKey: 'weapon1'
  },
  {
    key: 'weapon-offhand',
    label: 'Weapon',
    slotName: 'Weapon',
    reduxKey: 'weapon2'
  },
  {
    key: 'armor',
    label: 'Armor',
    slotName: 'Armor',
    reduxKey: 'armor'
  },
  {
    key: 'shield',
    label: 'Shield',
    slotName: 'Shield',
    reduxKey: 'shield'
  },
  {
    key: 'belt',
    label: 'Belt',
    slotName: 'Belt',
    reduxKey: 'belt'
  },
  {
    key: 'boots',
    label: 'Boots',
    slotName: 'Boots',
    reduxKey: 'boots'
  },
  {
    key: 'bracers',
    label: 'Bracers',
    slotName: 'Bracers',
    reduxKey: 'bracers'
  },
  {
    key: 'cloak',
    label: 'Cloak',
    slotName: 'Cloak',
    reduxKey: 'cloak'
  },
  {
    key: 'gloves',
    label: 'Gloves',
    slotName: 'Gloves',
    reduxKey: 'gloves'
  },
  {
    key: 'goggles',
    label: 'Goggles',
    slotName: 'Goggles',
    reduxKey: 'goggles'
  },
  {
    key: 'helm',
    label: 'Helm',
    slotName: 'Helm',
    reduxKey: 'helm'
  },
  {
    key: 'necklace',
    label: 'Necklace',
    slotName: 'Necklace',
    reduxKey: 'necklace'
  },
  {
    key: 'ring-1',
    label: 'Ring 1',
    slotName: 'Ring 1',
    reduxKey: 'ring1'
  },
  {
    key: 'ring-2',
    label: 'Ring 2',
    slotName: 'Ring 2',
    reduxKey: 'ring2'
  },
  {
    key: 'trinket',
    label: 'Trinket',
    slotName: 'Trinket',
    reduxKey: 'trinket'
  },
  {
    key: 'runearm',
    label: 'Runearm',
    slotName: 'Runearm',
    reduxKey: 'runearm'
  }
]
