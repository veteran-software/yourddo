import { SLOT_MAP } from '../../utils/constants.ts'
import {
  ARMOR_TYPES,
  type Curse,
  type GearAugment,
  type GearItem,
  GearSlot,
  type LootBinding,
  type LootEnchantment,
  type LootItem,
  type SetBonusIndex,
  SHIELD_TYPES,
  WEAPON_TYPES
} from './types'

export interface EssenceEnchantment {
  id: string
  sourceType: string
  effectId: string
  enchantmentName: string
  bonusType: string
  slotId: string
  affixType: string
  group: string
  enchantments?: LootEnchantment[]
  scalingStats?: (number | string)[]
  statModified?: string | string[]
  bonus?: string
  shardName?: string
}

// Use Vite's glob import to gather all runtime JSON files from the generator output.
// Note: Vite requires a literal string here (no template strings/variables).
// Path is relative to this file: src/pages/gearPlanner -> src/data/loot/runtime
const dataModules = import.meta.glob(
  [
    '../../data/loot/runtime/*.json',
    '../../data/deckOfManyCurses.json',
    '../../data/essenceCrafting/runtime/planner_entries.json',
    '../../data/essenceCrafting/runtime/enchantments.json',
    '../../data/essenceCrafting/essenceEnhancements.phase1.json'
  ],
  {
    eager: true
  }
)

export const loadCurses = (): Promise<Curse[]> => {
  const module = dataModules['../../data/deckOfManyCurses.json']
  if (module && typeof module === 'object' && 'default' in module) {
    const curses = module.default as Curse[]
    return Promise.resolve([...curses].sort((a, b) => a.name.localeCompare(b.name)))
  }

  return Promise.resolve([])
}

export const loadSetBonusIndex = (): Promise<SetBonusIndex> => {
  const module = dataModules['../../data/loot/runtime/setBonusIndex.json']
  if (module && typeof module === 'object' && 'default' in module) {
    return Promise.resolve(module.default as SetBonusIndex)
  }

  return Promise.resolve({})
}

export const loadFiligreeSets = (): Promise<{ name: string }[]> => {
  const module = dataModules['../../data/loot/runtime/filigreeSets.json']
  if (module && typeof module === 'object' && 'default' in module) {
    return Promise.resolve(module.default as { name: string }[])
  }

  return Promise.resolve([])
}

export const loadEssenceEnchantments = (): Promise<EssenceEnchantment[]> => {
  const plannerModule = dataModules['../../data/essenceCrafting/runtime/planner_entries.json']
  const enchantmentsModule = dataModules['../../data/essenceCrafting/runtime/enchantments.json']
  const phase1Module = dataModules['../../data/essenceCrafting/essenceEnhancements.phase1.json']

  if (
    plannerModule &&
    typeof plannerModule === 'object' &&
    'default' in plannerModule &&
    enchantmentsModule &&
    typeof enchantmentsModule === 'object' &&
    'default' in enchantmentsModule &&
    phase1Module &&
    typeof phase1Module === 'object' &&
    'default' in phase1Module
  ) {
    const entries = plannerModule.default as EssenceEnchantment[]
    const enchantments = enchantmentsModule.default as {
      effectId: string
      name: string
      bonus?: string | number
    }[]

    const phase1Data = phase1Module.default as {
      name: string
      stat?: (number | string)[]
      enchantments?: {
        name: string
        statModified?: string
        bonus?: string
        stats?: (number | string)[]
      }[]
    }[]

    const phase1Map = new Map<
      string,
      {
        stat: (number | string)[]
        statModified?: string
        bonus?: string
        shardName?: string
        allEnchantments?: {
          name: string
          statModified?: string
          bonus?: string
          stats?: (number | string)[]
        }[]
      }
    >()

    const normalizeEffectName = (name: string): string => {
      return name
        .toLowerCase()
        .replaceAll("'s", '-s') // match "champion-s"
        .replaceAll('&', ' ')
        .replaceAll(/[^a-z0-9]/g, ' ')
        .split(' ')
        .filter((s) => s.length > 0)
        .join('-')
    }

    phase1Data.forEach((d) => {
      if (d.stat) {
        const info = {
          stat: d.stat,
          statModified: d.enchantments?.[0]?.statModified,
          bonus: d.enchantments?.[0]?.bonus,
          shardName: d.name,
          allEnchantments: d.enchantments
        }

        phase1Map.set(d.name.toLowerCase(), info)
        phase1Map.set(normalizeEffectName(d.name), info)
      }
    })

    // Map the simple effect names to LootEnchantment objects
    return Promise.resolve(
      entries.map((entry) => {
        const matchingEnchantments = enchantments.filter((e) => e.effectId === entry.effectId)
        const phase1Info =
          phase1Map.get(entry.effectId.toLowerCase()) ??
          phase1Map.get(normalizeEffectName(entry.effectId)) ??
          phase1Map.get(entry.enchantmentName.toLowerCase()) ??
          phase1Map.get(normalizeEffectName(entry.enchantmentName))

        const scalingStats = phase1Info?.stat
        const statModified = phase1Info?.statModified ?? entry.statModified
        const bonus = phase1Info?.bonus ?? entry.bonus
        const shardName = phase1Info?.shardName ?? entry.shardName

        const finalEnchantments =
          phase1Info?.allEnchantments && phase1Info.allEnchantments.length > 0
            ? phase1Info.allEnchantments.map((e) => ({
                name: e.name,
                bonus: e.bonus,
                statModified: e.statModified,
                stats: e.stats
              }))
            : matchingEnchantments.map((e) => ({
                name: e.name,
                bonus: e.bonus
              }))

        return {
          ...entry,
          enchantments: finalEnchantments,
          scalingStats,
          statModified,
          bonus,
          shardName
        }
      })
    )
  }
  return Promise.resolve([])
}

const inferSetBonuses = (item: GearItem | GearAugment) => {
  if (item.setBonus && item.setBonus.length > 0) {
    return
  }

  const sets: { name: string }[] = []
  const enchantments = 'enchantments' in item ? item.enchantments : (item.effectsAdded ?? [])

  if (Array.isArray(enchantments)) {
    enchantments.forEach((enchantment: LootEnchantment) => {
      const lowerName: string = enchantment.name.toLowerCase()

      if (lowerName.includes('set bonus')) {
        // Remove the "Set Bonus" prefix/suffix and common artifacts
        const setName = enchantment.name
          .replace(/Set Bonus:?/i, '')
          .replace(/Set Bonus/i, '')
          .trim()

        if (setName) {
          sets.push({ name: setName })
        }
      }
    })
  }

  // Also check description/notes for runtime items
  const description: string | undefined = 'description' in item ? item.description : undefined
  const gearItem = item as LootItem
  const notes: string | undefined = 'description' in item ? undefined : gearItem.description
  const textToCheck: string | undefined = description ?? notes

  if (sets.length === 0 && typeof textToCheck === 'string') {
    const textLower: string = textToCheck.toLowerCase()

    if (textLower.includes('set bonus')) {
      // Try to extract the set name from text like "An Against the Slave Lords Set Bonus can be applied to this item."
      const match: RegExpExecArray | null = /An (.*) Set Bonus can be applied/i.exec(textToCheck)

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
  minLevel?: number
  update?: number
  image?: string
  augmentType?: string
  binding?: LootBinding
  foundIn?: string[]
  weight?: number
  effectsAdded?: {
    name?: string
    modifier?: string | number
    bonus?: string | number
  }[]
  setBonus?: { name: string }[]
}

export const generateItemId = (
  item: { name: string; minLevel: string | number },
  slot: string,
  fileName: string
): string => {
  return `${slot}|${item.name}|${String(item.minLevel || 1)}|${fileName}`
}

export const loadGearData = (): Promise<{
  items: GearItem[]
  augments: GearAugment[]
  filigrees: GearItem[]
}> => {
  const allItems: GearItem[] = []
  const allAugments: GearAugment[] = []
  const allFiligrees: GearItem[] = []
  const seenKeys = new Set<string>()

  const isWeaponType = (item: GearItem) =>
    Object.values(WEAPON_TYPES).flat().includes(item.type) || item.type === 'Handwraps' || item.type === 'Weapon'

  const isValidSlotItem = (item: GearItem) => {
    const typeLower = item.type.toLowerCase()

    if (item.slot === GearSlot.MainHand && !isWeaponType(item)) {
      return false
    }

    if (item.slot === GearSlot.OffHand) {
      const isShieldOrRuneArm = SHIELD_TYPES.includes(item.type)
      const isOffhandWeapon = Object.values(WEAPON_TYPES).flat().includes(item.type) || item.type === 'Weapon'
      if (!isShieldOrRuneArm && !isOffhandWeapon) return false
    }

    if (item.slot === GearSlot.Quiver) {
      const allowedQuiverTypes = ['quiver', '', 'bound', 'gear']
      if (!allowedQuiverTypes.includes(typeLower)) return false
    }

    if (item.slot === GearSlot.Armor) {
      const isArmor = ARMOR_TYPES.includes(item.type) || item.type === 'Robe' || item.type === 'Outfit'
      if (!isArmor) return false
    }

    return true
  }

  const addItem = (item: GearItem) => {
    if (item.slot === GearSlot.Filigree) {
      allFiligrees.push(item)
      return
    }

    if (!isValidSlotItem(item)) return

    // This is to prevent upgraded items from being natively selected.  The user
    // should select the base item and upgrade it if desired in the gear grid
    if (item.pageTitle.includes('(Upgraded)')) {
      return
    }

    const key = `${item.name}|${String(item.minLevel)}|${item.slot}`
    if (!seenKeys.has(key)) {
      allItems.push(item)
      seenKeys.add(key)
    }
  }

  // Process Augments
  const augModule = dataModules['../../data/loot/runtime/augment.json']
  if (augModule && typeof augModule === 'object' && 'default' in augModule) {
    const augments = augModule.default as RawAugment[]

    augments.forEach((aug: RawAugment) => {
      const augmentItem: GearAugment = {
        name: aug.name,
        augmentType: aug.augmentType ?? '',
        minLevel: aug.minLevel ?? 1,
        description: aug.description ?? '',
        binding: aug.binding,
        foundIn: aug.foundIn,
        image: aug.image ?? '',
        weight: aug.weight,
        update: aug.update,
        effectsAdded:
          aug.effectsAdded?.map((e) => ({
            name: e.name ?? '',
            modifier: e.modifier ?? undefined,
            bonus: e.bonus ?? undefined
          })) ?? [],
        setBonus: aug.setBonus?.map((sb) => ({ name: sb.name }))
      }

      inferSetBonuses(augmentItem)

      allAugments.push(augmentItem)
    })
  }

  // Process Loot Files
  Object.entries(SLOT_MAP).forEach(([fileName, slots]) => {
    const path = `../../data/loot/runtime/${fileName}`
    const module = dataModules[path]

    if (module && typeof module === 'object' && 'default' in module && Array.isArray(module.default)) {
      const data = module.default as LootItem[]

      data.forEach((item: LootItem) => {
        // Special-case: Some items in collar.json are actually pet armors, not weapons
        let effectiveSlots = slots

        if (fileName === 'collar.json') {
          // These collars are actually pet armors
          const armorNames = new Set<string>([
            'Allegience of the Wild Hunt',
            'Legendary Allegience of the Wild Hunt',
            'Kindred Spirit',
            'Legendary Kindred Spirit'
          ])

          if (armorNames.has(item.name)) {
            effectiveSlots = [GearSlot.ArtificerPetArmor, GearSlot.DruidPetArmor]
          } else {
            effectiveSlots = [GearSlot.ArtificerPetWeapon, GearSlot.DruidPetWeapon]
          }
        }

        effectiveSlots.forEach((slot: GearSlot) => {
          const gearItem: GearItem = {
            ...item,
            id: generateItemId(item, slot, fileName),
            slot: slot,
            minLevel: item.minLevel || '1',
            minimumLevel: Number.parseInt(String(item.minLevel || 1), 10),
            absoluteMinLevel: (item.absoluteMinLevel ?? String(item.minLevel)) || '1'
          }

          inferSetBonuses(gearItem)
          addItem(gearItem)
        })
      })
    }
  })

  return Promise.resolve({
    items: allItems,
    augments: allAugments,
    filigrees: allFiligrees
  })
}
