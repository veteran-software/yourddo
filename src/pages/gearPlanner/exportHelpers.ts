import type { EssenceEnchantment } from './dataLoader.ts'
import {
  findTraceOfMadnessUpgradeData,
  getActiveSetEnhancements,
  getDisplayEnchantments,
  getScaledEssenceEnchantments
} from './helpers'
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
  traceOfMadness?: string
) => {
  const traceOfMadnessData = traceOfMadness ? findTraceOfMadnessUpgradeData(traceOfMadness) : null

  return enchantments.filter((ench) => {
    if (ALWAYS_HIDDEN_ENCHANTMENTS.has(ench.name)) return false
    if (nearlyFinished && ench.name === 'Nearly Finished') return false
    if (ritualTable && (ench.name === 'Sealed in Fire' || ench.name === 'Sealed in Undeath')) return false
    if (lostPurpose && ench.name === 'Lost Purpose') return false
    if (traceOfMadnessData && ench.name === 'Trace of Madness') return false
    return true
  })
}

const getFiligreeLines = (filigrees: (LootItem | null)[] | undefined, prefix = '  - ') => {
  const lines: string[] = []
  if (filigrees?.some((f) => f !== null)) {
    lines.push(`- **Filigrees:**`)
    filigrees.forEach((fili) => {
      if (fili) {
        lines.push(`  - ${fili.name}`)
        fili.enchantments?.forEach((ench: LootEnchantment) => {
          lines.push(`${prefix}${formatEnchantment(ench)}`)
        })
      }
    })
  }
  return lines
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

  const renderSlotHeader = (slot: GearSlot, item: GearItem) => {
    lines.push(`[b]${slot}:[/b] [u]${item.name}[/u] (ML: ${String(item.minLevel)})`)
  }

  const renderSlotEnchantments = (
    item: GearItem,
    nearlyFinished?: LootEnchantment,
    ritualTable?: LootEnchantment,
    lostPurpose?: LootEnchantment,
    traceOfMadness?: string,
    isFountainUpgraded?: boolean,
    isStormreaverUpgraded?: boolean,
    isZhentarimUpgraded?: boolean
  ) => {
    const baseEnchantments = getDisplayEnchantments(
      item,
      isFountainUpgraded ?? false,
      isStormreaverUpgraded ?? false,
      isZhentarimUpgraded ?? false
    )
    const filtered = getFilteredEnchantments(baseEnchantments, nearlyFinished, ritualTable, lostPurpose, traceOfMadness)
    if (filtered.length > 0) {
      lines.push(`[list]`)
      filtered.forEach((enchantment: LootEnchantment) => {
        lines.push(`[*] ${formatEnchantment(enchantment)}`)
      })
      lines.push(`[/list]`)
    }
  }

  const renderSlotFiligrees = (filigrees: (LootItem | null)[] | undefined) => {
    if (filigrees?.some((f) => f !== null)) {
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
    }
  }

  const renderSlotGemSets = (gemSets: (string | null)[] | undefined) => {
    if (gemSets?.some((s) => s !== null)) {
      lines.push(`[indent][b][color=green]Gem Set Bonuses:[/color][/b] ${gemSets.filter(Boolean).join(', ')}[/indent]`)
    }
  }

  const renderSlotEssenceCrafting = (
    item: GearItem,
    essenceCrafting: Record<string, string | null> | undefined,
    allEssenceEnchantments: EssenceEnchantment[]
  ) => {
    if (essenceCrafting && Object.values(essenceCrafting).some((v) => v !== null)) {
      lines.push(`[indent][b][color=cyan]Essence Crafting:[/color][/b][/indent]`, `[list]`)

      const minLevel = Number.parseInt(String(item.minLevel)) || 1

      Object.entries(essenceCrafting).forEach(([slotName, enchId]) => {
        if (enchId) {
          const ench = allEssenceEnchantments.find((e) => e.id === enchId)

          if (ench) {
            const enchantments = getScaledEssenceEnchantments(ench, minLevel)
            enchantments.forEach((innerEnch) => {
              lines.push(`[*] [b]${slotName}:[/b] ${formatEnchantment(innerEnch)}`)
            })
          }
        }
      })

      lines.push(`[/list]`)
    }
  }

  const renderUpgrades = (
    fountainUpgraded: boolean,
    stormreaverUpgraded: boolean,
    zhentarimUpgraded: boolean,
    nearlyFinished: LootEnchantment | null,
    ritualTable: LootEnchantment | null,
    lostPurpose: LootEnchantment | null,
    traceOfMadness: string | null
  ) => {
    if (fountainUpgraded) {
      lines.push(`[indent][b][color=cyan]Fountain of Necrotic Might Upgrade[/color][/b][/indent]`)
    }

    if (stormreaverUpgraded) {
      lines.push(`[indent][b][color=cyan]Stormreaver Monument Upgrade[/color][/b][/indent]`)
    }

    if (zhentarimUpgraded) {
      lines.push(`[indent][b][color=cyan]Zhentarim Attuned Upgrade[/color][/b][/indent]`)
    }

    if (nearlyFinished) {
      lines.push(`[indent][b][color=orange]Nearly Finished:[/color][/b] ${formatEnchantment(nearlyFinished)}[/indent]`)
    }

    if (ritualTable) {
      lines.push(`[indent][b][color=green]Ritual Table Upgrade:[/color][/b] ${formatEnchantment(ritualTable)}[/indent]`)
    }

    if (lostPurpose) {
      lines.push(
        `[indent][b][color=purple]Lost Purpose Upgrade:[/color][/b] ${formatEnchantment(lostPurpose)}[/indent]`
      )
    }

    if (traceOfMadness) {
      const upgradeData = findTraceOfMadnessUpgradeData(traceOfMadness)
      if (upgradeData) {
        lines.push(`[indent][b][color=orange]Trace of Madness:[/color][/b] ${upgradeData.name}[/indent]`)
        upgradeData.effectsAdded.forEach((ench) => {
          lines.push(`[indent][list][*] ${formatEnchantment(ench)}[/list][/indent]`)
        })
      }
    }
  }

  const renderSlot = (
    slot: GearSlot,
    item: GearItem,
    allEssenceEnchantments: EssenceEnchantment[],
    isPetSlot = false,
    petState?: PetState
  ) => {
    const state = isPetSlot && petState ? petState : setup

    const nearlyFinished = state.slottedNearlyFinished[item.id]
    const ritualTable = state.slottedRitualTable[item.id]
    const lostPurpose = state.slottedLostPurpose[item.id]
    const traceOfMadness = state.slottedTraceOfMadness[item.id]
    const fountainUpgraded = state.slottedFountainOfNecroticMight[item.id]
    const stormreaverUpgraded = state.slottedStormreaverUpgrade[item.id]
    const zhentarimUpgraded = state.slottedZhentarimAttuned[item.id]

    renderSlotHeader(slot, item)
    renderSlotEnchantments(
      item,
      nearlyFinished ?? undefined,
      ritualTable ?? undefined,
      lostPurpose ?? undefined,
      traceOfMadness ?? undefined,
      fountainUpgraded,
      stormreaverUpgraded,
      zhentarimUpgraded
    )

    renderUpgrades(
      fountainUpgraded,
      stormreaverUpgraded,
      zhentarimUpgraded,
      nearlyFinished,
      ritualTable,
      lostPurpose,
      traceOfMadness
    )

    const essenceCrafting = state.slottedEssenceEnchantments[item.id]
    renderSlotEssenceCrafting(item, essenceCrafting, allEssenceEnchantments)

    const filigrees = state.slottedFiligrees[item.id]
    renderSlotFiligrees(filigrees)

    const gemSets = state.slottedGemSetBonuses[item.id]
    renderSlotGemSets(gemSets)

    lines.push('[center]---[/center]', '')
  }

  lines.push(`[b][size=4]Equipped Gear[/size][/b]`)
  renderSlots(GEAR_SLOTS, allEssenceEnchantments, setup, renderSlot)

  if (setup.classes.includes('Artificer')) {
    lines.push(`[b][size=4]Iron Defender Gear[/size][/b]`)
    renderSlots(ARTIFICER_PET_SLOTS, allEssenceEnchantments, setup, renderSlot, true, artificerPet)
  }

  if (setup.classes.includes('Druid')) {
    lines.push(`[b][size=4]Wolf Companion Gear[/size][/b]`)
    renderSlots(DRUID_PET_SLOTS, allEssenceEnchantments, setup, renderSlot, true, druidPet)
  }

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

  const renderSlotHeader = (slot: GearSlot, item: GearItem) => {
    lines.push(`**${slot}:** __${item.name}__ (ML: ${String(item.minLevel)})`)
  }

  const renderSlotEnchantments = (
    item: GearItem,
    nearlyFinished?: LootEnchantment,
    ritualTable?: LootEnchantment,
    lostPurpose?: LootEnchantment,
    traceOfMadness?: string,
    isFountainUpgraded?: boolean,
    isStormreaverUpgraded?: boolean,
    isZhentarimUpgraded?: boolean
  ) => {
    const baseEnchantments = getDisplayEnchantments(
      item,
      isFountainUpgraded ?? false,
      isStormreaverUpgraded ?? false,
      isZhentarimUpgraded ?? false
    )
    const filtered = getFilteredEnchantments(baseEnchantments, nearlyFinished, ritualTable, lostPurpose, traceOfMadness)
    if (filtered.length > 0) {
      filtered.forEach((ench: LootEnchantment) => {
        lines.push(`- ${formatEnchantment(ench)}`)
      })
    }
  }

  const renderSlotFiligrees = (filigrees: (LootItem | null)[] | undefined) => {
    const filiLines = getFiligreeLines(filigrees, `    - `)
    if (filiLines.length > 0) {
      lines.push(...filiLines)
    }
  }

  const renderSlotGemSets = (gemSets: (string | null)[] | undefined) => {
    if (gemSets && gemSets.length > 0) {
      const activeGemSets: (string | null)[] = gemSets.filter(Boolean)

      if (activeGemSets.length > 0) {
        lines.push(`- **Gem Set Bonuses:** ${activeGemSets.join(', ')}`)
      }
    }
  }

  const renderSlotEssenceCrafting = (
    item: GearItem,
    essenceCrafting: Record<string, string | null> | undefined,
    allEssenceEnchantments: EssenceEnchantment[]
  ) => {
    if (essenceCrafting && Object.values(essenceCrafting).some((v) => v !== null)) {
      lines.push(`- **Essence Crafting:**`)

      const minLevel = Number.parseInt(String(item.minLevel)) || 1

      Object.entries(essenceCrafting).forEach(([slotName, enchId]) => {
        if (enchId) {
          const ench = allEssenceEnchantments.find((e) => e.id === enchId)
          if (ench) {
            const enchantments = getScaledEssenceEnchantments(ench, minLevel)
            enchantments.forEach((innerEnch: LootEnchantment) => {
              lines.push(`  - **${slotName}:** ${formatEnchantment(innerEnch)}`)
            })
          }
        }
      })
    }
  }

  const renderUpgrades = (
    fountainUpgraded: boolean,
    stormreaverUpgraded: boolean,
    zhentarimUpgraded: boolean,
    nearlyFinished: LootEnchantment | null,
    ritualTable: LootEnchantment | null,
    lostPurpose: LootEnchantment | null,
    traceOfMadness: string | null
  ) => {
    if (fountainUpgraded) {
      lines.push(`- **Fountain of Necrotic Might Upgrade**`)
    }

    if (stormreaverUpgraded) {
      lines.push(`- **Stormreaver Monument Upgrade**`)
    }

    if (zhentarimUpgraded) {
      lines.push(`- **Zhentarim Attuned Upgrade**`)
    }

    if (nearlyFinished) {
      lines.push(`- **Nearly Finished:** ${formatEnchantment(nearlyFinished)}`)
    }

    if (ritualTable) {
      lines.push(`- **Ritual Table Upgrade:** ${formatEnchantment(ritualTable)}`)
    }

    if (lostPurpose) {
      lines.push(`- **Lost Purpose Upgrade:** ${formatEnchantment(lostPurpose)}`)
    }

    if (traceOfMadness) {
      const upgradeData = findTraceOfMadnessUpgradeData(traceOfMadness)
      if (upgradeData) {
        lines.push(`- **Trace of Madness:** ${upgradeData.name}`)
        upgradeData.effectsAdded.forEach((ench) => {
          lines.push(`  - ${formatEnchantment(ench)}`)
        })
      }
    }
  }

  const renderSlot = (
    slot: GearSlot,
    item: GearItem,
    allEssenceEnchantments: EssenceEnchantment[],
    isPetSlot = false,
    petState?: PetState
  ) => {
    const state = isPetSlot && petState ? petState : setup

    const nearlyFinished = state.slottedNearlyFinished[item.id]
    const ritualTable = state.slottedRitualTable[item.id]
    const lostPurpose = state.slottedLostPurpose[item.id]
    const traceOfMadness = state.slottedTraceOfMadness[item.id]
    const fountainUpgraded = state.slottedFountainOfNecroticMight[item.id]
    const stormreaverUpgraded = state.slottedStormreaverUpgrade[item.id]
    const zhentarimUpgraded = state.slottedZhentarimAttuned[item.id]

    renderSlotHeader(slot, item)
    renderSlotEnchantments(
      item,
      nearlyFinished ?? undefined,
      ritualTable ?? undefined,
      lostPurpose ?? undefined,
      traceOfMadness ?? undefined,
      fountainUpgraded,
      stormreaverUpgraded,
      zhentarimUpgraded
    )

    renderUpgrades(
      fountainUpgraded,
      stormreaverUpgraded,
      zhentarimUpgraded,
      nearlyFinished,
      ritualTable,
      lostPurpose,
      traceOfMadness
    )

    const essenceCrafting = state.slottedEssenceEnchantments[item.id]
    renderSlotEssenceCrafting(item, essenceCrafting, allEssenceEnchantments)

    const filigrees = state.slottedFiligrees[item.id]
    renderSlotFiligrees(filigrees)

    const gemSets = state.slottedGemSetBonuses[item.id]
    renderSlotGemSets(gemSets)

    lines.push('')
  }

  lines.push(`### Equipped Gear`)

  renderSlots(GEAR_SLOTS, allEssenceEnchantments, setup, renderSlot)

  if (setup.classes.includes('Artificer')) {
    lines.push(`### Iron Defender Gear`)

    renderSlots(ARTIFICER_PET_SLOTS, allEssenceEnchantments, setup, renderSlot, true, artificerPet)
  }

  if (setup.classes.includes('Druid')) {
    lines.push(`### Wolf Companion Gear`)

    renderSlots(DRUID_PET_SLOTS, allEssenceEnchantments, setup, renderSlot, true, druidPet)
  }

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
