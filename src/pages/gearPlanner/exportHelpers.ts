import type { EssenceEnchantment } from './dataLoader.ts'
import { getActiveSetEnhancements, getDisplayEnchantments, getScaledEssenceEnchantments } from './helpers'
import type { GearItem, GearSetup, GearSlot, LootEnchantment, LootItem, PetState } from './types'
import { ARTIFICER_PET_SLOTS, DRUID_PET_SLOTS, GEAR_SLOTS } from './types'

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

interface EnchantmentsOptions {
  item: GearItem
  nearlyFinished?: LootEnchantment
  ritualTable?: LootEnchantment
  lostPurpose?: LootEnchantment
  traceOfMadness?: LootEnchantment
  fountainUpgraded?: boolean
  stormreaverUpgraded?: boolean
  zhentarimUpgraded?: boolean
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
    traceOfMadness: LootEnchantment | null
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
    const nearlyFinished = state.slottedNearlyFinished[item.id]
    const ritualTable = state.slottedRitualTable[item.id]
    const lostPurpose = state.slottedLostPurpose[item.id]
    const traceOfMadness = state.slottedTraceOfMadness[item.id]
    const fountainUpgraded = state.slottedFountainOfNecroticMight[item.id]
    const stormreaverUpgraded = state.slottedStormreaverUpgrade[item.id]
    const zhentarimUpgraded = state.slottedZhentarimAttuned[item.id]

    fmt.header(slot, item)
    fmt.enchantments({
      item,
      nearlyFinished: nearlyFinished ?? undefined,
      ritualTable: ritualTable ?? undefined,
      lostPurpose: lostPurpose ?? undefined,
      traceOfMadness: traceOfMadness ?? undefined,
      fountainUpgraded,
      stormreaverUpgraded,
      zhentarimUpgraded
    })
    fmt.upgrades(
      fountainUpgraded,
      stormreaverUpgraded,
      zhentarimUpgraded,
      nearlyFinished ?? null,
      ritualTable ?? null,
      lostPurpose ?? null,
      traceOfMadness ?? null
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

  lines.push(
    `[center][b][size=5]Gear Setup: ${setup.name}[/size][/b]`,
    `[size=3]Levels ${String(setup.minLevel)}-${String(setup.maxLevel)} | ${setup.classes.filter(Boolean).join(' / ')}[/size][/center]`
  )

  if (permalinkUrl) {
    lines.push(`[center][url=${permalinkUrl}]View on YourDDO[/url][/center]`)
  }

  lines.push('')

  const renderSlot = buildRenderSlot(setup, {
    header: (slot, item) => {
      lines.push(`[b]${slot}:[/b] [u]${item.name}[/u] (ML: ${String(item.minLevel)})`)
    },

    enchantments: ({
      item,
      nearlyFinished,
      ritualTable,
      lostPurpose,
      traceOfMadness,
      fountainUpgraded,
      stormreaverUpgraded,
      zhentarimUpgraded
    }) => {
      const baseEnchantments = getDisplayEnchantments(
        item,
        fountainUpgraded ?? false,
        stormreaverUpgraded ?? false,
        zhentarimUpgraded ?? false
      )
      const filtered = getFilteredEnchantments(
        baseEnchantments,
        nearlyFinished,
        ritualTable,
        lostPurpose,
        traceOfMadness
      )
      if (filtered.length > 0) {
        lines.push(`[list]`)
        filtered.forEach((enchantment: LootEnchantment) => {
          lines.push(`[*] ${formatEnchantment(enchantment)}`)
        })
        lines.push(`[/list]`)
      }
    },

    upgrades: (
      fountainUpgraded,
      stormreaverUpgraded,
      zhentarimUpgraded,
      nearlyFinished,
      ritualTable,
      lostPurpose,
      traceOfMadness
    ) => {
      if (fountainUpgraded) lines.push(`[indent][b][color=cyan]Fountain of Necrotic Might Upgrade[/color][/b][/indent]`)
      if (stormreaverUpgraded) lines.push(`[indent][b][color=cyan]Stormreaver Monument Upgrade[/color][/b][/indent]`)
      if (zhentarimUpgraded) lines.push(`[indent][b][color=cyan]Zhentarim Attuned Upgrade[/color][/b][/indent]`)
      if (nearlyFinished)
        lines.push(
          `[indent][b][color=orange]Nearly Finished:[/color][/b] ${formatEnchantment(nearlyFinished)}[/indent]`
        )
      if (ritualTable)
        lines.push(
          `[indent][b][color=green]Ritual Table Upgrade:[/color][/b] ${formatEnchantment(ritualTable)}[/indent]`
        )
      if (lostPurpose)
        lines.push(
          `[indent][b][color=purple]Lost Purpose Upgrade:[/color][/b] ${formatEnchantment(lostPurpose)}[/indent]`
        )
      if (traceOfMadness)
        lines.push(
          `[indent][b][color=orange]Trace of Madness:[/color][/b] ${formatEnchantment(traceOfMadness)}[/indent]`
        )
    },

    essenceCrafting: (item, essenceCrafting, allEssenceEnchantments) => {
      if (!essenceCrafting || !Object.values(essenceCrafting).some((v) => v !== null)) return
      lines.push(`[indent][b][color=cyan]Essence Crafting:[/color][/b][/indent]`, `[list]`)
      const minLevel = Number.parseInt(String(item.minLevel)) || 1
      Object.entries(essenceCrafting).forEach(([slotName, enchId]) => {
        if (enchId) {
          const ench = allEssenceEnchantments.find((e) => e.id === enchId)
          if (ench) {
            getScaledEssenceEnchantments(ench, minLevel).forEach((innerEnch) => {
              lines.push(`[*] [b]${slotName}:[/b] ${formatEnchantment(innerEnch)}`)
            })
          }
        }
      })
      lines.push(`[/list]`)
    },

    filigrees: (filigrees) => {
      if (!filigrees?.some((f) => f !== null)) return
      lines.push(`[indent][b][color=yellow]Filigrees:[/color][/b][/indent]`, `[list]`)
      filigrees.forEach((filigree: LootItem | null) => {
        if (filigree) {
          lines.push(`[*] ${filigree.name}`)
          filigree.enchantments?.forEach((ench: LootEnchantment) => {
            lines.push(`[list][*] ${formatEnchantment(ench)}[/list]`)
          })
        }
      })
      lines.push(`[/list]`)
    },

    gemSets: (gemSets) => {
      if (gemSets?.some((s) => s !== null)) {
        lines.push(
          `[indent][b][color=green]Gem Set Bonuses:[/color][/b] ${gemSets.filter(Boolean).join(', ')}[/indent]`
        )
      }
    },

    separator: () => lines.push('[center]---[/center]', '')
  })

  renderGearSections(
    lines,
    setup,
    allEssenceEnchantments,
    renderSlot,
    (t) => `[b][size=4]${t}[/size][/b]`,
    artificerPet,
    druidPet
  )

  const equippedItems = Object.values(setup.slots).filter((i): i is GearItem => i !== null)
  const activeSetEnhancements = getActiveSetEnhancements(
    equippedItems,
    setup.slottedAugments,
    setup.slottedFiligrees,
    setup.slottedGemSetBonuses,
    setup.slottedLostPurpose
  )

  if (activeSetEnhancements.length > 0) {
    lines.push(`[b][size=4]Active Set Bonuses[/size][/b]`, `[list]`)
    activeSetEnhancements.forEach((entry) => {
      lines.push(`[*] [b]${entry.sourceName.replace('Set Bonus: ', '')}:[/b] ${formatEnchantment(entry.ench)}`)
    })
    lines.push(`[/list]`, '')
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

  lines.push(
    `## Gear Setup: ${setup.name}`,
    `Levels ${String(setup.minLevel)}-${String(setup.maxLevel)} | ${setup.classes.filter(Boolean).join(' / ')}`
  )

  if (permalinkUrl) {
    lines.push(`[View on YourDDO](${permalinkUrl})`)
  }

  lines.push('')

  const renderSlot = buildRenderSlot(setup, {
    header: (slot, item) => {
      lines.push(`**${slot}:** __${item.name}__ (ML: ${String(item.minLevel)})`)
    },

    enchantments: ({
      item,
      nearlyFinished,
      ritualTable,
      lostPurpose,
      traceOfMadness,
      fountainUpgraded,
      stormreaverUpgraded,
      zhentarimUpgraded
    }) => {
      const baseEnchantments = getDisplayEnchantments(
        item,
        fountainUpgraded ?? false,
        stormreaverUpgraded ?? false,
        zhentarimUpgraded ?? false
      )
      const filtered = getFilteredEnchantments(
        baseEnchantments,
        nearlyFinished,
        ritualTable,
        lostPurpose,
        traceOfMadness
      )
      filtered.forEach((ench: LootEnchantment) => {
        lines.push(`- ${formatEnchantment(ench)}`)
      })
    },

    upgrades: (
      fountainUpgraded,
      stormreaverUpgraded,
      zhentarimUpgraded,
      nearlyFinished,
      ritualTable,
      lostPurpose,
      traceOfMadness
    ) => {
      if (fountainUpgraded) lines.push(`- **Fountain of Necrotic Might Upgrade**`)
      if (stormreaverUpgraded) lines.push(`- **Stormreaver Monument Upgrade**`)
      if (zhentarimUpgraded) lines.push(`- **Zhentarim Attuned Upgrade**`)
      if (nearlyFinished) lines.push(`- **Nearly Finished:** ${formatEnchantment(nearlyFinished)}`)
      if (ritualTable) lines.push(`- **Ritual Table Upgrade:** ${formatEnchantment(ritualTable)}`)
      if (lostPurpose) lines.push(`- **Lost Purpose Upgrade:** ${formatEnchantment(lostPurpose)}`)
      if (traceOfMadness) lines.push(`- **Trace of Madness:** ${formatEnchantment(traceOfMadness)}`)
    },

    essenceCrafting: (item, essenceCrafting, allEssenceEnchantments) => {
      if (!essenceCrafting || !Object.values(essenceCrafting).some((v) => v !== null)) return
      lines.push(`- **Essence Crafting:**`)
      const minLevel = Number.parseInt(String(item.minLevel)) || 1
      Object.entries(essenceCrafting).forEach(([slotName, enchId]) => {
        if (enchId) {
          const ench = allEssenceEnchantments.find((e) => e.id === enchId)
          if (ench) {
            getScaledEssenceEnchantments(ench, minLevel).forEach((innerEnch: LootEnchantment) => {
              lines.push(`  - **${slotName}:** ${formatEnchantment(innerEnch)}`)
            })
          }
        }
      })
    },

    filigrees: (filigrees) => {
      if (filigrees?.some((f) => f !== null)) {
        lines.push(`- **Filigrees:**`)
        filigrees.forEach((fili) => {
          if (fili) {
            lines.push(`  - ${fili.name}`)
            fili.enchantments?.forEach((ench: LootEnchantment) => {
              lines.push(`    - ${formatEnchantment(ench)}`)
            })
          }
        })
      }
    },

    gemSets: (gemSets) => {
      const activeGemSets = gemSets?.filter(Boolean) ?? []
      if (activeGemSets.length > 0) {
        lines.push(`- **Gem Set Bonuses:** ${activeGemSets.join(', ')}`)
      }
    },

    separator: () => lines.push('')
  })

  renderGearSections(lines, setup, allEssenceEnchantments, renderSlot, (t) => `### ${t}`, artificerPet, druidPet)

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
    ...setup.slottedLostPurpose,
    ...artificerPet?.slottedLostPurpose,
    ...druidPet?.slottedLostPurpose
  }

  const activeSetEnhancements = getActiveSetEnhancements(
    allItems,
    allAugments,
    allFiligrees,
    allGemSets,
    allLostPurpose
  )

  if (activeSetEnhancements.length > 0) {
    lines.push(`### Active Set Bonuses`)
    activeSetEnhancements.forEach((entry) => {
      lines.push(`- **${entry.sourceName.replace('Set Bonus: ', '')}:** ${formatEnchantment(entry.ench)}`)
    })
    lines.push('')
  }

  const fullContent = lines.join('\n')
  if (fullContent.length > 2000) {
    const warning = `\n> **Note:** This export is ${String(fullContent.length)} characters long, which exceeds Discord's 2000-character limit. You may need to paste it in multiple messages.`
    return fullContent + warning
  }

  return fullContent
}
