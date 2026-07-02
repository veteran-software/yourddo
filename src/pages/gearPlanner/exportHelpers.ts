import type { EssenceEnchantment } from './dataLoader.ts'
import { getActiveSetEnhancements, getDisplayEnchantments, getScaledEssenceEnchantments } from './helpers'
import { pickPlannerSetupMetadata } from './plannerStateFields'
import type { GearAugment, GearItem, GearSetup, GearSlot, LootEnchantment, LootItem, PetState } from './types'
import { ARTIFICER_PET_SLOTS, DRUID_PET_SLOTS, GEAR_SLOTS } from './types'
import {
  createUpgradeViews,
  getItemUpgradeView,
  type LegacyBooleanUpgradeMap,
  type LegacyLootEnchantmentMap,
  type LegacyTraceOfMadnessMap
} from './upgradeState'

const ALWAYS_HIDDEN_ENCHANTMENTS = new Set([
  'Zhentarim Attuned',
  'Upgradeable Item (Black Abbot)',
  'Upgradeable Item (Stormreaver)'
])

const renderSlots = (
  slots: readonly GearSlot[],
  allEssenceEnchantments: EssenceEnchantment[],
  setup: GearSetup,
  renderSlot: (
    slot: GearSlot,
    item: GearItem,
    allEssenceEnchantments: EssenceEnchantment[],
    isPetSlot?: boolean,
    petState?: PetState
  ) => void,
  isPetSlot = false,
  petState?: PetState
) => {
  slots.forEach((slot) => {
    const item = isPetSlot && petState ? petState.slots[slot] : setup.slots[slot]
    if (item) {
      renderSlot(slot, item, allEssenceEnchantments, isPetSlot, petState)
    }
  })
}

const formatEnchantment = (ench: {
  name: string
  modifier?: string | number
  bonus?: string | number
  notes?: string
}) => {
  const parts = []
  parts.push(ench.name)
  if (ench.modifier !== undefined && String(ench.modifier) != '') {
    let mod = ench.modifier.toString().trim()
    if (!mod.startsWith('+') && !mod.startsWith('-')) {
      const num = Number.parseFloat(mod)

      if (!Number.isNaN(num) && num > 0) {
        mod = `+${mod}`
      } else if (num === 0) {
        // usually 0 doesn't get a sign, or stays as is
      } else if (Number.isNaN(num)) {
        // It's a string modifier like "Small" or "Large", usually don't add + unless it's numeric-ish
      }
    }

    parts.push(mod)
  }

  if (ench.bonus) {
    parts.push(`(${ench.bonus.toString()})`)
  }

  if (ench.notes) {
    parts.push(`- ${ench.notes}`)
  }
  return parts.join(' ')
}

const getFilteredEnchantments = (
  enchantments: LootEnchantment[],
  nearlyFinished?: LootEnchantment,
  ritualTable?: LootEnchantment,
  lostPurpose?: LootEnchantment,
  traceOfMadness?: LootEnchantment
) => {
  return enchantments.filter((ench) => {
    if (ALWAYS_HIDDEN_ENCHANTMENTS.has(ench.name)) return false
    if (nearlyFinished && ench.name === 'Nearly Finished') return false
    if (ritualTable && (ench.name === 'Sealed in Fire' || ench.name === 'Sealed in Undeath')) return false
    if (lostPurpose && ench.name === 'Lost Purpose') return false
    if (traceOfMadness && ench.name === 'Trace of Madness') return false
    return true
  })
}

interface GearExportSnapshot {
  equippedItems: GearItem[]
  petItems: GearItem[]
  allItems: GearItem[]
  allAugments: Record<string, Record<number, GearAugment | null>>
  allFiligrees: Record<string, (LootItem | null)[]>
  allGemSets: Record<string, (string | null)[]>
  allLostPurpose: Record<string, LootEnchantment | null>
  activeSetEnhancements: { ench: LootEnchantment; sourceName: string }[]
}

const buildGearExportSnapshot = (
  setup: GearSetup,
  artificerPet?: PetState,
  druidPet?: PetState
): GearExportSnapshot => {
  const equippedItems = Object.values(setup.slots).filter((i): i is GearItem => i !== null)
  const petItems = [
    ...(artificerPet ? Object.values(artificerPet.slots) : []),
    ...(druidPet ? Object.values(druidPet.slots) : [])
  ].filter((i): i is GearItem => i !== null)

  const allItems = [...equippedItems, ...petItems]
  const allAugments = {
    ...setup.slottedAugments,
    ...artificerPet?.slottedAugments,
    ...druidPet?.slottedAugments
  }
  const allFiligrees = {
    ...setup.slottedFiligrees,
    ...artificerPet?.slottedFiligrees,
    ...druidPet?.slottedFiligrees
  }
  const allGemSets = {
    ...setup.slottedGemSetBonuses,
    ...artificerPet?.slottedGemSetBonuses,
    ...druidPet?.slottedGemSetBonuses
  }
  const allLostPurpose = {
    ...createUpgradeViews(setup.itemUpgrades).slottedLostPurpose,
    ...createUpgradeViews(artificerPet?.itemUpgrades).slottedLostPurpose,
    ...createUpgradeViews(druidPet?.itemUpgrades).slottedLostPurpose
  }

  return {
    equippedItems,
    petItems,
    allItems,
    allAugments,
    allFiligrees,
    allGemSets,
    allLostPurpose,
    activeSetEnhancements: getActiveSetEnhancements(allItems, allAugments, allFiligrees, allGemSets, allLostPurpose)
  }
}

interface EnchantmentsOptions {
  item: GearItem
  itemUpgrades?: import('./upgradeState').ItemUpgrades
  slottedNearlyFinished?: LegacyLootEnchantmentMap
  slottedAlmostThere?: LegacyLootEnchantmentMap
  slottedFinishingTouch?: LegacyLootEnchantmentMap
  slottedRitualTable?: LegacyLootEnchantmentMap
  slottedLostPurpose?: LegacyLootEnchantmentMap
  slottedTraceOfMadness?: LegacyTraceOfMadnessMap
  slottedFountainOfNecroticMight?: LegacyBooleanUpgradeMap
  slottedStormreaverUpgrade?: LegacyBooleanUpgradeMap
  slottedZhentarimAttuned?: LegacyBooleanUpgradeMap
}

interface SlotFormatters {
  header: (slot: GearSlot, item: GearItem) => void
  enchantments: (opts: EnchantmentsOptions) => void
  upgrades: (
    fountainUpgraded: boolean,
    stormreaverUpgraded: boolean,
    zhentarimUpgraded: boolean,
    nearlyFinished: LootEnchantment | null,
    ritualTable: LootEnchantment | null,
    lostPurpose: LootEnchantment | null,
    traceOfMadness: LootEnchantment | null,
    almostThere?: LootEnchantment | null,
    finishingTouch?: LootEnchantment | null
  ) => void
  essenceCrafting: (
    item: GearItem,
    essenceCrafting: Record<string, string | null> | undefined,
    allEssenceEnchantments: EssenceEnchantment[]
  ) => void
  filigrees: (filigrees: (LootItem | null)[] | undefined) => void
  gemSets: (gemSets: (string | null)[] | undefined) => void
  separator: () => void
}

interface ExportTextStyle {
  titleLines: (setupMeta: ReturnType<typeof pickPlannerSetupMetadata>, permalinkUrl?: string) => string[]
  heading: (text: string) => string
  itemHeader: (slot: GearSlot, item: GearItem) => string
  enchantmentBullet: (text: string) => string
  upgradeLine: (tone: 'cyan' | 'orange' | 'green' | 'purple', label: string, value?: string) => string
  upgradeAppliedLine: (tone: 'orange', label: string) => string
  sectionHeading: (text: string) => string
  sectionStart: string | null
  sectionEnd: string | null
  essenceLine: (slotName: string, text: string) => string
  filigreeLine: (text: string) => string
  filigreeEnchantmentLine: (text: string) => string
  gemSetLine: (text: string) => string
  separator: string[]
  activeSetHeading: string[]
  activeSetEnd: string | null
  activeSetEntry: (entry: { ench: LootEnchantment; sourceName: string }) => string
  lengthWarning?: (length: number) => string
}

const pushIf = (lines: string[], ...parts: (string | null | undefined)[]) => {
  parts.forEach((part) => {
    if (part) {
      lines.push(part)
    }
  })
}

const appendEnchantments = (
  lines: string[],
  item: GearItem,
  itemUpgrades: import('./upgradeState').ItemUpgrades | undefined,
  style: ExportTextStyle
) => {
  const itemUpgrade = getItemUpgradeView(itemUpgrades, item.id)
  const baseEnchantments = getDisplayEnchantments(
    item,
    itemUpgrade.fountainOfNecroticMight ?? false,
    itemUpgrade.stormreaverUpgrade ?? false,
    itemUpgrade.zhentarimAttuned ?? false
  )
  const filtered = getFilteredEnchantments(
    baseEnchantments,
    itemUpgrade.nearlyFinished ?? undefined,
    itemUpgrade.ritualTable ?? undefined,
    itemUpgrade.lostPurpose ?? undefined,
    itemUpgrade.traceOfMadness ?? undefined
  )

  if (filtered.length === 0) return

  pushIf(lines, style.sectionStart)
  filtered.forEach((enchantment: LootEnchantment) => {
    lines.push(style.enchantmentBullet(formatEnchantment(enchantment)))
  })
  pushIf(lines, style.sectionEnd)
}

const appendUpgradeLines = (
  lines: string[],
  style: ExportTextStyle,
  fountainUpgraded: boolean,
  stormreaverUpgraded: boolean,
  zhentarimUpgraded: boolean,
  nearlyFinished: LootEnchantment | null,
  ritualTable: LootEnchantment | null,
  lostPurpose: LootEnchantment | null,
  traceOfMadness: LootEnchantment | null,
  almostThere?: LootEnchantment | null,
  finishingTouch?: LootEnchantment | null
) => {
  if (fountainUpgraded) lines.push(style.upgradeLine('cyan', 'Fountain of Necrotic Might Upgrade'))
  if (stormreaverUpgraded) lines.push(style.upgradeLine('cyan', 'Stormreaver Monument Upgrade'))
  if (zhentarimUpgraded) lines.push(style.upgradeLine('cyan', 'Zhentarim Attuned Upgrade'))
  if (nearlyFinished) lines.push(style.upgradeLine('orange', 'Nearly Finished', formatEnchantment(nearlyFinished)))
  if (almostThere)
    lines.push(
      almostThere.name === '__active__'
        ? style.upgradeAppliedLine('orange', 'Almost There upgrade applied')
        : style.upgradeLine('orange', 'Almost There', formatEnchantment(almostThere))
    )
  if (finishingTouch)
    lines.push(
      finishingTouch.name === '__active__'
        ? style.upgradeAppliedLine('orange', 'Finishing Touch upgrade applied')
        : style.upgradeLine('orange', 'Finishing Touch', formatEnchantment(finishingTouch))
    )
  if (ritualTable) lines.push(style.upgradeLine('green', 'Ritual Table Upgrade', formatEnchantment(ritualTable)))
  if (lostPurpose) lines.push(style.upgradeLine('purple', 'Lost Purpose Upgrade', formatEnchantment(lostPurpose)))
  if (traceOfMadness) lines.push(style.upgradeLine('orange', 'Trace of Madness', formatEnchantment(traceOfMadness)))
}

const appendEssenceCraftingLines = (
  lines: string[],
  item: GearItem,
  essenceCrafting: Record<string, string | null> | undefined,
  allEssenceEnchantments: EssenceEnchantment[],
  style: ExportTextStyle
) => {
  if (!essenceCrafting || !Object.values(essenceCrafting).some((v) => v !== null)) return

  lines.push(style.sectionHeading('Essence Crafting:'))
  pushIf(lines, style.sectionStart)

  const minLevel = Number.parseInt(String(item.minLevel)) || 1
  Object.entries(essenceCrafting).forEach(([slotName, enchId]) => {
    if (!enchId) return
    const ench = allEssenceEnchantments.find((e) => e.id === enchId)
    if (!ench) return

    getScaledEssenceEnchantments(ench, minLevel).forEach((innerEnch) => {
      lines.push(style.essenceLine(slotName, formatEnchantment(innerEnch)))
    })
  })

  pushIf(lines, style.sectionEnd)
}

const appendFiligreeLines = (lines: string[], filigrees: (LootItem | null)[] | undefined, style: ExportTextStyle) => {
  if (!filigrees?.some((f) => f !== null)) return

  lines.push(style.sectionHeading('Filigrees:'))
  pushIf(lines, style.sectionStart)

  filigrees.forEach((filigree: LootItem | null) => {
    if (!filigree) return
    lines.push(style.filigreeLine(filigree.name))
    filigree.enchantments?.forEach((ench: LootEnchantment) => {
      lines.push(style.filigreeEnchantmentLine(formatEnchantment(ench)))
    })
  })

  pushIf(lines, style.sectionEnd)
}

const appendGemSetLines = (lines: string[], gemSets: (string | null)[] | undefined, style: ExportTextStyle) => {
  const activeGemSets = gemSets?.filter(Boolean) ?? []
  if (activeGemSets.length === 0) return

  lines.push(style.gemSetLine(activeGemSets.join(', ')))
}

const appendActiveSetLines = (
  lines: string[],
  activeSetEnhancements: { ench: LootEnchantment; sourceName: string }[],
  style: ExportTextStyle
) => {
  if (activeSetEnhancements.length === 0) return

  lines.push(...style.activeSetHeading)
  activeSetEnhancements.forEach((entry) => {
    lines.push(style.activeSetEntry(entry))
  })
  pushIf(lines, style.activeSetEnd)
}

const renderGearSections = (
  lines: string[],
  setup: GearSetup,
  allEssenceEnchantments: EssenceEnchantment[],
  renderSlot: Parameters<typeof renderSlots>[3],
  formatHeading: (text: string) => string,
  artificerPet?: PetState,
  druidPet?: PetState
) => {
  lines.push(formatHeading('Equipped Gear'))
  renderSlots(GEAR_SLOTS, allEssenceEnchantments, setup, renderSlot)

  if (setup.classes.includes('Artificer')) {
    lines.push(formatHeading('Iron Defender Gear'))
    renderSlots(ARTIFICER_PET_SLOTS, allEssenceEnchantments, setup, renderSlot, true, artificerPet)
  }

  if (setup.classes.includes('Druid')) {
    lines.push(formatHeading('Wolf Companion Gear'))
    renderSlots(DRUID_PET_SLOTS, allEssenceEnchantments, setup, renderSlot, true, druidPet)
  }
}

const BB_CODE_STYLE: ExportTextStyle = {
  titleLines: (setupMeta, permalinkUrl) => {
    const lines = [
      `[center][b][size=5]Gear Setup: ${setupMeta.name}[/size][/b]`,
      `[size=3]Levels ${String(setupMeta.minLevel)}-${String(setupMeta.maxLevel)} | ${setupMeta.classes.filter(Boolean).join(' / ')}[/size][/center]`
    ]

    if (permalinkUrl) {
      lines.push(`[center][url=${permalinkUrl}]View on YourDDO[/url][/center]`)
    }

    return lines
  },
  heading: (text) => `[b][size=4]${text}[/size][/b]`,
  itemHeader: (slot, item) => `[b]${slot}:[/b] [u]${item.name}[/u] (ML: ${String(item.minLevel)})`,
  enchantmentBullet: (text) => `[*] ${text}`,
  upgradeLine: (tone, label, value) => {
    let color: 'cyan' | 'orange' | 'green' | 'purple' = 'purple'
    if (tone === 'cyan') color = 'cyan'
    else if (tone === 'orange') color = 'orange'
    else if (tone === 'green') color = 'green'
    const labelText = value ? `${label}:` : label
    const valueText = value ? ` ${value}` : ''
    return `[indent][b][color=${color}]${labelText}[/color][/b]${valueText}[/indent]`
  },
  upgradeAppliedLine: (_tone, label) => `[indent][b][color=orange]${label}[/color][/b][/indent]`,
  sectionHeading: (text) => {
    if (text === 'Essence Crafting:' || text === 'Filigrees:') {
      const color = text === 'Essence Crafting:' ? 'cyan' : 'yellow'
      return `[indent][b][color=${color}]${text}[/color][/b][/indent]`
    }
    return `[indent][b][color=cyan]${text}[/color][/b][/indent]`
  },
  sectionStart: '[list]',
  sectionEnd: '[/list]',
  essenceLine: (slotName, text) => `[*] [b]${slotName}:[/b] ${text}`,
  filigreeLine: (text) => `[*] ${text}`,
  filigreeEnchantmentLine: (text) => `[list][*] ${text}[/list]`,
  gemSetLine: (text) => `[indent][b][color=green]Gem Set Bonuses:[/color][/b] ${text}[/indent]`,
  separator: ['[center]---[/center]', ''],
  activeSetHeading: ['[b][size=4]Active Set Bonuses[/size][/b]', '[list]'],
  activeSetEnd: '[/list]',
  activeSetEntry: (entry) =>
    `[*] [b]${entry.sourceName.replace('Set Bonus: ', '')}:[/b] ${formatEnchantment(entry.ench)}`,
  lengthWarning: undefined
}

const DISCORD_STYLE: ExportTextStyle = {
  titleLines: (setupMeta, permalinkUrl) => {
    const lines = [
      `## Gear Setup: ${setupMeta.name}`,
      `Levels ${String(setupMeta.minLevel)}-${String(setupMeta.maxLevel)} | ${setupMeta.classes.filter(Boolean).join(' / ')}`
    ]

    if (permalinkUrl) {
      lines.push(`[View on YourDDO](${permalinkUrl})`)
    }

    return lines
  },
  heading: (text) => `### ${text}`,
  itemHeader: (slot, item) => `**${slot}:** __${item.name}__ (ML: ${String(item.minLevel)})`,
  enchantmentBullet: (text) => `- ${text}`,
  upgradeLine: (_tone, label, value) => (value ? `- **${label}:** ${value}` : `- **${label}**`),
  upgradeAppliedLine: (_tone, label) => `- **${label}**`,
  sectionHeading: (text) => `- **${text}**`,
  sectionStart: null,
  sectionEnd: null,
  essenceLine: (slotName, text) => `  - **${slotName}:** ${text}`,
  filigreeLine: (text) => `  - ${text}`,
  filigreeEnchantmentLine: (text) => `    - ${text}`,
  gemSetLine: (text) => `- **Gem Set Bonuses:** ${text}`,
  separator: [''],
  activeSetHeading: ['### Active Set Bonuses'],
  activeSetEnd: null,
  activeSetEntry: (entry) => `- **${entry.sourceName.replace('Set Bonus: ', '')}:** ${formatEnchantment(entry.ench)}`,
  lengthWarning: (length) =>
    `\n> **Note:** This export is ${String(length)} characters long, which exceeds Discord's 2000-character limit. You may need to paste it in multiple messages.`
}

const buildRenderSlot =
  (setup: GearSetup, fmt: SlotFormatters) =>
  (
    slot: GearSlot,
    item: GearItem,
    allEssenceEnchantments: EssenceEnchantment[],
    isPetSlot = false,
    petState?: PetState
  ): void => {
    const state = isPetSlot && petState ? petState : setup
    const itemUpgrade = getItemUpgradeView(state.itemUpgrades, item.id)
    const nearlyFinished = itemUpgrade.nearlyFinished ?? null
    const almostThere = itemUpgrade.almostThere ?? null
    const finishingTouch = itemUpgrade.finishingTouch ?? null
    const ritualTable = itemUpgrade.ritualTable ?? null
    const lostPurpose = itemUpgrade.lostPurpose ?? null
    const traceOfMadness = itemUpgrade.traceOfMadness ?? null
    const fountainUpgraded = itemUpgrade.fountainOfNecroticMight ?? false
    const stormreaverUpgraded = itemUpgrade.stormreaverUpgrade ?? false
    const zhentarimUpgraded = itemUpgrade.zhentarimAttuned ?? false

    fmt.header(slot, item)
    fmt.enchantments({
      item,
      itemUpgrades: state.itemUpgrades
    })
    fmt.upgrades(
      fountainUpgraded,
      stormreaverUpgraded,
      zhentarimUpgraded,
      nearlyFinished ?? null,
      ritualTable ?? null,
      lostPurpose ?? null,
      traceOfMadness ?? null,
      almostThere ?? null,
      finishingTouch ?? null
    )
    fmt.essenceCrafting(item, state.slottedEssenceEnchantments[item.id], allEssenceEnchantments)
    fmt.filigrees(state.slottedFiligrees[item.id])
    fmt.gemSets(state.slottedGemSetBonuses[item.id])
    fmt.separator()
  }

export const generateBBCodeExport = (
  setup: GearSetup,
  allEssenceEnchantments: EssenceEnchantment[],
  artificerPet?: PetState,
  druidPet?: PetState,
  permalinkUrl?: string
) => {
  const lines: string[] = []
  const setupMeta = pickPlannerSetupMetadata(setup)
  lines.push(...BB_CODE_STYLE.titleLines(setupMeta, permalinkUrl), '')
  const snapshot = buildGearExportSnapshot(setup, artificerPet, druidPet)

  const renderSlot = buildRenderSlot(setup, {
    header: (slot, item) => {
      lines.push(BB_CODE_STYLE.itemHeader(slot, item))
    },

    enchantments: ({ item, itemUpgrades }) => {
      appendEnchantments(lines, item, itemUpgrades, BB_CODE_STYLE)
    },

    upgrades: (...args) => {
      appendUpgradeLines(lines, BB_CODE_STYLE, ...args)
    },

    essenceCrafting: (item, essenceCrafting, allEssenceEnchantments) => {
      appendEssenceCraftingLines(lines, item, essenceCrafting, allEssenceEnchantments, BB_CODE_STYLE)
    },

    filigrees: (filigrees) => {
      appendFiligreeLines(lines, filigrees, BB_CODE_STYLE)
    },

    gemSets: (gemSets) => {
      appendGemSetLines(lines, gemSets, BB_CODE_STYLE)
    },

    separator: () => lines.push(...BB_CODE_STYLE.separator)
  })

  renderGearSections(lines, setup, allEssenceEnchantments, renderSlot, BB_CODE_STYLE.heading, artificerPet, druidPet)

  appendActiveSetLines(lines, snapshot.activeSetEnhancements, BB_CODE_STYLE)
  if (snapshot.activeSetEnhancements.length > 0) {
    lines.push('')
  }

  return lines.join('\n')
}

export const generateDiscordMarkdownExport = (
  setup: GearSetup,
  allEssenceEnchantments: EssenceEnchantment[],
  artificerPet?: PetState,
  druidPet?: PetState,
  permalinkUrl?: string
) => {
  const lines: string[] = []
  const setupMeta = pickPlannerSetupMetadata(setup)
  lines.push(...DISCORD_STYLE.titleLines(setupMeta, permalinkUrl), '')
  const snapshot = buildGearExportSnapshot(setup, artificerPet, druidPet)

  const renderSlot = buildRenderSlot(setup, {
    header: (slot, item) => {
      lines.push(DISCORD_STYLE.itemHeader(slot, item))
    },

    enchantments: ({ item, itemUpgrades }) => {
      appendEnchantments(lines, item, itemUpgrades, DISCORD_STYLE)
    },

    upgrades: (...args) => {
      appendUpgradeLines(lines, DISCORD_STYLE, ...args)
    },

    essenceCrafting: (item, essenceCrafting, allEssenceEnchantments) => {
      appendEssenceCraftingLines(lines, item, essenceCrafting, allEssenceEnchantments, DISCORD_STYLE)
    },

    filigrees: (filigrees) => {
      appendFiligreeLines(lines, filigrees, DISCORD_STYLE)
    },

    gemSets: (gemSets) => {
      appendGemSetLines(lines, gemSets, DISCORD_STYLE)
    },

    separator: () => lines.push(...DISCORD_STYLE.separator)
  })

  renderGearSections(lines, setup, allEssenceEnchantments, renderSlot, DISCORD_STYLE.heading, artificerPet, druidPet)
  appendActiveSetLines(lines, snapshot.activeSetEnhancements, DISCORD_STYLE)
  if (snapshot.activeSetEnhancements.length > 0) {
    lines.push('')
  }

  const fullContent = lines.join('\n')
  if (DISCORD_STYLE.lengthWarning && fullContent.length > 2000) {
    return fullContent + DISCORD_STYLE.lengthWarning(fullContent.length)
  }

  return fullContent
}
