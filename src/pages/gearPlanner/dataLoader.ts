import {
  ARMOR_TYPES,
  type Curse,
  type GearAugment,
  type GearItem,
  GearSlot,
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
  enchantments: LootEnchantment[]
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
    return Promise.resolve(
      [...curses].sort((a, b) => a.name.localeCompare(b.name))
    )
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
  const plannerModule =
    dataModules['../../data/essenceCrafting/runtime/planner_entries.json']
  const enchantmentsModule =
    dataModules['../../data/essenceCrafting/runtime/enchantments.json']
  const phase1Module =
    dataModules['../../data/essenceCrafting/essenceEnhancements.phase1.json']

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
        }[]
      }
    >()

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
        // Also map by name with spaces removed/normalized if needed,
        // but typically effectId is the lowercase-hyphenated version of name.
        phase1Map.set(d.name.toLowerCase().replace(/ /g, '-'), info)
      }
    })

    // Map the simple effect names to LootEnchantment objects
    return Promise.resolve(
      entries.map((entry) => {
        const matchingEnchantments = enchantments.filter(
          (e) => e.effectId === entry.effectId
        )
        const phase1Info =
          phase1Map.get(entry.effectId.toLowerCase()) ??
          phase1Map.get(entry.enchantmentName.toLowerCase())

        const scalingStats = phase1Info?.stat
        const statModified = phase1Info?.statModified ?? entry.statModified
        const bonus = phase1Info?.bonus ?? entry.bonus
        const shardName = phase1Info?.shardName ?? entry.shardName

        const finalEnchantments =
          phase1Info?.allEnchantments && phase1Info.allEnchantments.length > 0
            ? phase1Info.allEnchantments.map((e) => ({
                name: e.name,
                bonus: e.bonus,
                statModified: e.statModified
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

const SLOT_MAP: Record<string, GearSlot[]> = {
  'belt.json': [GearSlot.Waist],
  'boots.json': [GearSlot.Feet],
  'bracers.json': [GearSlot.Wrists],
  'cloak.json': [GearSlot.Cloak],
  'docent.json': [
    GearSlot.Armor,
    GearSlot.ArtificerPetArmor,
    GearSlot.DruidPetArmor
  ],
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
  'trinket.json': [GearSlot.Trinket],
  // Weapons
  'bastardSword.json': [GearSlot.MainHand, GearSlot.OffHand],
  'battleAxe.json': [GearSlot.MainHand, GearSlot.OffHand],
  'club.json': [GearSlot.MainHand, GearSlot.OffHand],
  'dagger.json': [GearSlot.MainHand, GearSlot.OffHand],
  'dart.json': [GearSlot.MainHand],
  'dwarvenWarAxe.json': [GearSlot.MainHand, GearSlot.OffHand],
  'falchion.json': [GearSlot.MainHand],
  'greatAxe.json': [GearSlot.MainHand],
  'greatClub.json': [GearSlot.MainHand],
  'greatCrossbow.json': [GearSlot.MainHand],
  'greatSword.json': [GearSlot.MainHand],
  'handAxe.json': [GearSlot.MainHand, GearSlot.OffHand],
  'handwraps.json': [GearSlot.MainHand],
  'heavyCrossbow.json': [GearSlot.MainHand],
  'heavyMace.json': [GearSlot.MainHand, GearSlot.OffHand],
  'heavyPick.json': [GearSlot.MainHand, GearSlot.OffHand],
  'kama.json': [GearSlot.MainHand, GearSlot.OffHand],
  'khopesh.json': [GearSlot.MainHand, GearSlot.OffHand],
  'kukri.json': [GearSlot.MainHand, GearSlot.OffHand],
  'lightCrossbow.json': [GearSlot.MainHand],
  'lightHammer.json': [GearSlot.MainHand, GearSlot.OffHand],
  'lightMace.json': [GearSlot.MainHand, GearSlot.OffHand],
  'lightPick.json': [GearSlot.MainHand, GearSlot.OffHand],
  'longBow.json': [GearSlot.MainHand],
  'longSword.json': [GearSlot.MainHand, GearSlot.OffHand],
  'maul.json': [GearSlot.MainHand],
  'morningstar.json': [GearSlot.MainHand, GearSlot.OffHand],
  'quarterstaff.json': [GearSlot.MainHand],
  'quiver.json': [GearSlot.Quiver],
  'rapier.json': [GearSlot.MainHand, GearSlot.OffHand],
  'repeatingHeavyCrossbow.json': [GearSlot.MainHand],
  'repeatingLightCrossbow.json': [GearSlot.MainHand],
  'scimitar.json': [GearSlot.MainHand, GearSlot.OffHand],
  'shortBow.json': [GearSlot.MainHand],
  'shortSword.json': [GearSlot.MainHand, GearSlot.OffHand],
  'shuriken.json': [GearSlot.MainHand],
  'sickle.json': [GearSlot.MainHand, GearSlot.OffHand],
  'throwingAxe.json': [GearSlot.MainHand],
  'throwingDagger.json': [GearSlot.MainHand],
  'throwingHammer.json': [GearSlot.MainHand],
  'warhammer.json': [GearSlot.MainHand, GearSlot.OffHand],
  'filigrees.json': [GearSlot.Filigree],
  // Shields & Rune Arms
  'buckler.json': [GearSlot.OffHand],
  'largeShield.json': [GearSlot.OffHand],
  'orb.json': [GearSlot.OffHand],
  'runeArm.json': [GearSlot.OffHand],
  'smallShield.json': [GearSlot.OffHand],
  'towerShield.json': [GearSlot.OffHand],
  // Pet Items
  'collar.json': [GearSlot.ArtificerPetWeapon, GearSlot.DruidPetWeapon]
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

export const loadGearData = (): Promise<{
  items: GearItem[]
  augments: GearAugment[]
  filigrees: GearItem[]
}> => {
  const allItems: GearItem[] = []
  const allAugments: GearAugment[] = []
  const allFiligrees: GearItem[] = []
  const seenKeys = new Set<string>()

  const addItem = (item: GearItem) => {
    // Basic slot validation to avoid cluttering slots with irrelevant items
    const typeLower = item.type.toLowerCase()

    if (item.slot === GearSlot.Filigree) {
      allFiligrees.push(item)

      return
    }

    if (item.slot === GearSlot.MainHand) {
      const isWeapon =
        Object.values(WEAPON_TYPES).flat().includes(item.type) ||
        item.type === 'Handwraps' ||
        item.type === 'Weapon'

      if (!isWeapon) {
        return
      }
    }

    if (item.slot === GearSlot.OffHand) {
      const isShieldOrRuneArm = SHIELD_TYPES.includes(item.type)
      const isOffhandWeapon =
        Object.values(WEAPON_TYPES).flat().includes(item.type) ||
        item.type === 'Weapon'

      if (!isShieldOrRuneArm && !isOffhandWeapon) {
        return
      }
    }

    if (item.slot === GearSlot.Quiver) {
      const allowedQuiverTypes = ['quiver', '', 'bound', 'gear']

      if (!allowedQuiverTypes.includes(typeLower)) {
        return
      }
    }

    if (item.slot === GearSlot.Armor) {
      const isArmor =
        ARMOR_TYPES.includes(item.type) ||
        item.type === 'Robe' ||
        item.type === 'Outfit'

      if (!isArmor) {
        return
      }
    }

    if (item.pageTitle && item.pageTitle.includes('(Upgraded)')) {
      return
    }

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
    const path = `../../data/loot/runtime/${fileName}`
    const module = dataModules[path]

    if (
      module &&
      typeof module === 'object' &&
      'default' in module &&
      Array.isArray(module.default)
    ) {
      const data = module.default as LootItem[]

      data.forEach((item: LootItem, index) => {
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
            effectiveSlots = [
              GearSlot.ArtificerPetArmor,
              GearSlot.DruidPetArmor
            ]
          } else {
            effectiveSlots = [
              GearSlot.ArtificerPetWeapon,
              GearSlot.DruidPetWeapon
            ]
          }
        }

        effectiveSlots.forEach((slot: GearSlot) => {
          const gearItem: GearItem = {
            ...item,
            id: `${fileName}-${String(index)}-${slot}`,
            slot: slot,
            minLevel: item.minLevel || '1',
            absoluteMinLevel: item.absoluteMinLevel || item.minLevel || '1'
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
