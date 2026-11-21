import cursesData from '../../data/deckOfManyCurses.json'
import nearlyFinishedRecipesData from '../../data/nearlyFinished/recipes.json'
import {
  loadGearPlannerAugments,
  loadGearPlannerFiligreeSets,
  loadGearPlannerItems,
  loadGearPlannerSetBonusIndex
} from '../../data/releaseClient.ts'
import { SLOT_MAP } from '../../utils/constants.ts'
import {
  ARMOR_TYPES,
  type Curse,
  type GearAugment,
  type GearAugmentSlot,
  type GearItem,
  GearSlot,
  type LootBinding,
  type LootEnchantment,
  type LootItem,
  type SetBonusIndex,
  SHIELD_TYPES,
  WEAPON_TYPES
} from './types'

const nfRecipeStation = (nearlyFinishedRecipesData as { reforgingStation: { item: string }[] }).reforgingStation
const nfItemNamesSet = new Set(nfRecipeStation.map((r) => r.item))

const NF_UPGRADE_SUFFIXES = ['(Nearly Finished Upgraded)', '(Almost There Upgraded)', '(Complete']

const isNearlyFinishedUpgradeTier = (item: { name: string; pageTitle: string }): boolean =>
  nfItemNamesSet.has(item.name) && NF_UPGRADE_SUFFIXES.some((s) => item.pageTitle.includes(s))

interface NearlyFinishedUpgradeEntry {
  enchantments: LootEnchantment[]
  augments: GearAugmentSlot[]
}

export const nearlyFinishedUpgradeItems: Record<string, NearlyFinishedUpgradeEntry> = {}

// Maps item name → augment slots from the (Nearly Finished Upgraded) tier.
// Only populated for items whose NF upgrade adds new augment slots.
export const nearlyFinishedNFUpgradedAugments: Record<string, GearAugmentSlot[]> = {}

const indexNearlyFinishedUpgrades = (dataByFile: Map<string, LootItem[]>) => {
  for (const key of Object.keys(nearlyFinishedUpgradeItems)) Reflect.deleteProperty(nearlyFinishedUpgradeItems, key)
  for (const key of Object.keys(nearlyFinishedNFUpgradedAugments))
    Reflect.deleteProperty(nearlyFinishedNFUpgradedAugments, key)

  dataByFile.forEach((items) => {
    items.forEach((item) => {
      if (isNearlyFinishedUpgradeTier(item)) {
        nearlyFinishedUpgradeItems[item.pageTitle] = {
          enchantments: item.enchantments ?? [],
          augments: item.augments ?? []
        }
      }
    })
  })

  Object.entries(nearlyFinishedUpgradeItems).forEach(([key, entry]) => {
    if (key.endsWith('(Nearly Finished Upgraded)') && entry.augments.length > 0) {
      nearlyFinishedNFUpgradedAugments[key.replace(' (Nearly Finished Upgraded)', '')] = entry.augments
    }
  })
}

export const loadCurses = (): Promise<Curse[]> => {
  const curses = cursesData as Curse[]
  return Promise.resolve([...curses].sort((a, b) => a.name.localeCompare(b.name)))
}

export const loadSetBonusIndex = (): Promise<SetBonusIndex> => loadGearPlannerSetBonusIndex<SetBonusIndex>()

export const loadFiligreeSets = (): Promise<{ name: string }[]> => loadGearPlannerFiligreeSets<{ name: string }[]>()

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

export const loadGearData = async (): Promise<{
  items: GearItem[]
  augments: GearAugment[]
  filigrees: GearItem[]
}> => {
  const allItems: GearItem[] = []
  const allAugments: GearAugment[] = []
  const allFiligrees: GearItem[] = []
  const seenKeys = new Set<string>()
  const fileNames = Object.keys(SLOT_MAP)
  const [augmentData, ...itemDatasets] = await Promise.all([
    loadGearPlannerAugments<RawAugment[]>(),
    ...fileNames.map((fileName) => loadGearPlannerItems<LootItem[]>(fileName))
  ])
  const dataByFile = new Map(fileNames.map((fileName, index) => [fileName, itemDatasets[index]]))

  indexNearlyFinishedUpgrades(dataByFile)

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

    // Prevent upgraded/NF-tier items from appearing in the browser list.
    // Users select the base item and apply upgrades via the gear grid controls.
    if (item.pageTitle.includes('(Upgraded)') || isNearlyFinishedUpgradeTier(item)) {
      return
    }

    const key = `${item.name}|${String(item.minLevel)}|${item.slot}`
    if (!seenKeys.has(key)) {
      allItems.push(item)
      seenKeys.add(key)
    }
  }

  // Process Augments
  augmentData.forEach((aug: RawAugment) => {
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

  // Process Loot Files
  Object.entries(SLOT_MAP).forEach(([fileName, slots]) => {
    const data = dataByFile.get(fileName) ?? []

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
  })

  return {
    items: allItems,
    augments: allAugments,
    filigrees: allFiligrees
  }
}
