import {
  type GearItem,
  GearSlot,
  type LootItem,
  type SetBonusIndex
} from './types'

export const loadSetBonusIndex = async (): Promise<SetBonusIndex> => {
  try {
    const response = await fetch('/src/data/loot/runtime/setBonusIndex.json')
    if (response.ok) {
      return (await response.json()) as SetBonusIndex
    }
  } catch (error) {
    console.error('Error loading set bonus index:', error)
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
  const itemAsObj = item as Record<string, unknown>
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
  effectsAdded?: {
    name?: string
    modifier?: string | number
    bonus?: string
  }[]
  setBonus?: { name: string }[]
}

export const loadGearData = async (): Promise<GearItem[]> => {
  const allItems: GearItem[] = []
  const seenKeys = new Set<string>()

  const addItem = (item: GearItem) => {
    const key = `${item.name}|${item.minLevel}|${item.slot}`
    if (!seenKeys.has(key)) {
      allItems.push(item)
      seenKeys.add(key)
    }
  }

  // Load Augments
  try {
    const augResponse = await fetch('/src/data/augments/augmentMaster.json')
    if (augResponse.ok) {
      const augments = (await augResponse.json()) as RawAugment[]
      augments.forEach((aug, index) => {
        const gearItem: GearItem = {
          id: `aug-${String(index)}`,
          name: aug.name,
          type: 'Augment',
          description: aug.description ?? '',
          minLevel: String(aug.minimumLevel ?? '1'),
          absoluteMinLevel: String(aug.minimumLevel ?? '1'),
          enchantments:
            aug.effectsAdded?.map((e) => ({
              name: e.name ?? '',
              modifier: e.modifier ?? undefined,
              bonus: e.bonus ?? undefined
            })) ?? [],
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
      })
    }
  } catch (error) {
    console.error('Error loading augments:', error)
  }

  const loadFile = async (fileName: string, slots: GearSlot[]) => {
    try {
      const response = await fetch(`/src/data/loot/runtime/${fileName}`)
      if (!response.ok) {
        console.warn(`Failed to load ${fileName}: ${response.statusText}`)
        return
      }
      const data: LootItem[] = (await response.json()) as LootItem[]

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
    } catch (error) {
      console.error(`Error loading ${fileName}:`, error)
    }
  }

  const promises = Object.entries(SLOT_MAP).map(([file, slots]) => loadFile(file, slots))
  await Promise.all(promises)

  return allItems
}
