import {
  type Curse,
  type GearAugment,
  type GearItem,
  GearSlot,
  type LootEnchantment,
  type LootItem,
  type SetBonusIndex
} from './types'

// Use Vite's glob import to gather all runtime JSON files from the generator output.
// Note: Vite requires a literal string here (no template strings/variables).
// Path is relative to this file: src/pages/gearPlanner -> src/data/loot/runtime
const dataModules = import.meta.glob(['../../data/loot/runtime/*.json', '../../data/deckOfManyCurses.json'], {
  eager: true
})

export const loadCurses = async (): Promise<Curse[]> => {
  const module = dataModules['../../data/deckOfManyCurses.json']
  if (module && typeof module === 'object' && 'default' in module) {
    const curses = module.default as Curse[]
    return [...curses].sort((a, b) => a.name.localeCompare(b.name))
  }
  return []
}

export const loadSetBonusIndex = async (): Promise<SetBonusIndex> => {
  const module = dataModules['../../data/loot/runtime/setBonusIndex.json']
  if (module && typeof module === 'object' && 'default' in module) {
    return module.default as SetBonusIndex
  }
  return {}
}

const SLOT_MAP: Record<string, GearSlot[]> = {
  'belt.json': [GearSlot.Waist],
  'boots.json': [GearSlot.Feet],
  'bracers.json': [GearSlot.Wrists],
  'cloak.json': [GearSlot.Cloak],
  'docent.json': [GearSlot.Armor, GearSlot.ArtificerPetArmor, GearSlot.DruidPetArmor],
  'gloves.json': [GearSlot.Hands],
  'goggles.json': [GearSlot.Eyes],
  'heavyArmor.json': [GearSlot.Armor],
  'helmet.json': [GearSlot.Head],
  'lightArmor.json': [GearSlot.Armor],
  'mediumArmor.json': [GearSlot.Armor],
  'necklace.json': [GearSlot.Neck],
  'outfit.json': [GearSlot.Armor],
  'ring.json': [GearSlot.FirstFinger, GearSlot.SecondFinger],
  'robe.json': [GearSlot.Armor],
  'trinket.json': [GearSlot.Trinket]
}

const inferSetBonuses = (item: GearItem) => {
  if (item.setBonus && item.setBonus.length > 0) return

  const sets: { name: string }[] = []
  item.enchantments?.forEach((ench) => {
    const lowerName = (ench.name ?? '').toLowerCase()
    if (lowerName.includes('set bonus')) {
      // Remove "Set Bonus" prefix/suffix and common artifacts
      const setName = ench.name
        .replace(/Set Bonus:?/i, '')
        .replace(/Set Bonus/i, '')
        .trim()

      if (setName) {
        sets.push({ name: setName })
      }
    }
  })

  // Also check notes for runtime items
  const itemAsObj = item as unknown as Record<string, unknown>
  if (sets.length === 0 && typeof itemAsObj.notes === 'string') {
    const notesStr = itemAsObj.notes.toLowerCase()
    if (notesStr.includes('set bonus')) {
      // Try to extract set name from notes like "An Against the Slave Lords Set Bonus can be applied to this item."
      const match = /An (.*) Set Bonus can be applied/i.exec(itemAsObj.notes)
      if (match?.[1]) {
        sets.push({ name: match[1].trim() })
      }
    }
  }

  if (sets.length > 0) {
    item.setBonus = sets
  }
}

interface RawAugment {
  name: string
  description?: string
  minimumLevel?: number
  update?: number
  image?: string
  augmentType?: string
  effectsAdded?: {
    name?: string
    modifier?: string | number
    bonus?: string
  }[]
  setBonus?: { name: string }[]
}

export const loadGearData = async (): Promise<{ items: GearItem[]; augments: GearAugment[] }> => {
  const allItems: GearItem[] = []
  const allAugments: GearAugment[] = []
  const seenKeys = new Set<string>()

  const addItem = (item: GearItem) => {
    const key = `${item.name}|${item.minLevel}|${item.slot}`
    if (!seenKeys.has(key)) {
      allItems.push(item)
      seenKeys.add(key)
    }
  }

  // Process Augments
  const augModule = dataModules['../../data/loot/runtime/augment.json']
  if (augModule && typeof augModule === 'object' && 'default' in augModule) {
    const augments = augModule.default as RawAugment[]
    augments.forEach((aug, index) => {
      const gearItem: GearItem = {
        id: `aug-${String(index)}`,
        name: aug.name,
        type: 'Augment',
        description: aug.description ?? '',
        minLevel: String(aug.minimumLevel ?? '1'),
        absoluteMinLevel: String(aug.minimumLevel ?? '1'),
        minimumLevel: aug.minimumLevel ?? 1,
        augmentType: aug.augmentType ?? '',
        effectsAdded:
          aug.effectsAdded?.map(
            (e) =>
              ({
                name: e.name ?? '',
                modifier: e.modifier ?? undefined,
                bonus: e.bonus ?? undefined
              }) as LootEnchantment
          ) ?? [],
        enchantments: [],
        augments: [],
        setBonus: aug.setBonus?.map((sb) => ({ name: sb.name })),
        slot: GearSlot.Augment,
        artifacttype: 'Augment',
        material: 'Stone',
        pageTitle: aug.name,
        restriction: '',
        hardness: '0',
        durability: '0',
        weight: '0',
        update: String(aug.update ?? '0'),
        details: '',
        upgradeable: '',
        upgradedFrom: '',
        bug: '',
        replaced: '',
        icon: aug.image ?? '',
        image: '',
        optionsRaw: '',
        dropLocations: []
      }

      inferSetBonuses(gearItem)
      addItem(gearItem)
      allAugments.push(gearItem as unknown as GearAugment)
    })
  }

  // Process Loot Files
  Object.entries(SLOT_MAP).forEach(([fileName, slots]) => {
    const module = dataModules[`../../data/loot/runtime/${fileName}`]
    if (module && typeof module === 'object' && 'default' in module) {
      const data = module.default as LootItem[]
      data.forEach((item: LootItem, index) => {
        slots.forEach((slot: GearSlot) => {
          const gearItem: GearItem = {
            ...item,
            id: `${fileName}-${String(index)}-${slot}`,
            slot: slot
          }
          inferSetBonuses(gearItem)
          addItem(gearItem)
        })
      })
    }
  })

  return { items: allItems, augments: allAugments }
}
