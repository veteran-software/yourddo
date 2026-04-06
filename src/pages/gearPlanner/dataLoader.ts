import { u75 } from '../../data/loot/update75'
import { type GearItem, GearSlot, type LootItem, type SetBonusIndex } from './types'

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

const TYPE_TO_SLOT_MAP: Record<string, GearSlot[]> = {
  Goggles: [GearSlot.Eyes],
  Necklace: [GearSlot.Neck],
  Trinket: [GearSlot.Trinket],
  Armor: [GearSlot.Armor],
  Docent: [GearSlot.Armor, GearSlot.ArtificerPetArmor, GearSlot.DruidPetArmor],
  Cloak: [GearSlot.Cloak],
  Bracers: [GearSlot.Wrists],
  Belt: [GearSlot.Waist],
  Ring: [GearSlot.FirstFinger, GearSlot.SecondFinger],
  Boots: [GearSlot.Feet],
  Gloves: [GearSlot.Hands],
  Helmet: [GearSlot.Head],
  Helm: [GearSlot.Head],
  Shield: [GearSlot.OffHand],
  Orb: [GearSlot.OffHand],
  Weapon: [GearSlot.MainHand],
  Longsword: [GearSlot.MainHand],
  Shortsword: [GearSlot.MainHand],
  Greataxe: [GearSlot.MainHand],
  Greatsword: [GearSlot.MainHand],
  Maul: [GearSlot.MainHand],
  Warhammer: [GearSlot.MainHand],
  Dagger: [GearSlot.MainHand],
  Quarterstaff: [GearSlot.MainHand, GearSlot.OffHand],
  Bow: [GearSlot.MainHand, GearSlot.OffHand],
  Crossbow: [GearSlot.MainHand, GearSlot.OffHand],
  Repeating: [GearSlot.MainHand, GearSlot.OffHand],
  Light: [GearSlot.MainHand],
  Heavy: [GearSlot.MainHand],
  Great: [GearSlot.MainHand],
  Handwraps: [GearSlot.MainHand],
  Bastard: [GearSlot.MainHand],
  Khopesh: [GearSlot.MainHand],
  Scimitar: [GearSlot.MainHand],
  Falchion: [GearSlot.MainHand],
  Kukri: [GearSlot.MainHand],
  Rapier: [GearSlot.MainHand],
  Pick: [GearSlot.MainHand],
  Club: [GearSlot.MainHand],
  Mace: [GearSlot.MainHand],
  Morningstar: [GearSlot.MainHand],
  Sickle: [GearSlot.MainHand],
  Axe: [GearSlot.MainHand],
  Hammer: [GearSlot.MainHand],
  Flail: [GearSlot.MainHand]
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
          augments: [], // Augments don't have slots themselves usually
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

  // Add u75 items
  u75.forEach((uItem, index) => {
    const typeKey = uItem.type ?? ''
    const slots: GearSlot[] = TYPE_TO_SLOT_MAP[typeKey] ?? []
    slots.forEach((slot) => {
      // @ts-expect-error - u75 items use enchantments instead of enhancements
      const uEnchantments = uItem.enchantments as { name?: string; modifier?: string; bonus?: string }[] | undefined
      const gearItem: GearItem = {
        id: `u75-${String(index)}-${slot}`,
        name: uItem.name,
        type: uItem.type ?? 'Unknown',
        description: uItem.description ?? '',
        minLevel: String(uItem.minimumLevel ?? '1'),
        absoluteMinLevel: String(uItem.minimumLevel ?? '1'),
        enchantments:
          uEnchantments?.map((e) => ({
            name: e.name ?? '',
            modifier: e.modifier ?? undefined,
            bonus: e.bonus ?? undefined
          })) ?? [],
        augments: uItem.augments?.map((a) => {
          const type = Object.keys(a)[0]
          return {
            augmentType: type.charAt(0).toUpperCase() + type.slice(1)
          }
        }),
        setBonus: uItem.setBonus?.map((sb) => ({ name: sb.name })),
        slot: slot
      }
      inferSetBonuses(gearItem)
      addItem(gearItem)
    })
  })

  const loadFile = async (fileName: string, slots: GearSlot[]) => {
    try {
      // Use absolute path from public if possible, or relative if vite handles it.
      // Since they are in src, they might not be directly fetchable unless imported or in public.
      // If the user says "included during development" and "available at runtime",
      // they might be served from a specific path.
      // Given the environment, I'll try to use dynamic imports if vite supports it for JSON,
      // or assume they are available at /src/data/loot/runtime/

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
