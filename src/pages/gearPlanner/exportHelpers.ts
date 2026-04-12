import type { EssenceEnchantment } from './dataLoader.ts'
import { getActiveSetEnhancements } from './helpers'
import type {
  Curse,
  GearAugment,
  GearItem,
  GearSetup,
  GearSlot,
  LootEnchantment,
  LootItem
} from './types'
import { ARTIFICER_PET_SLOTS, DRUID_PET_SLOTS, GEAR_SLOTS } from './types'

interface PetState {
  slots: Record<string, GearItem | null>
  slottedAugments: Record<string, Record<number, GearAugment | null>>
  slottedCurses: Record<string, Curse | null>
  slottedFiligrees: Record<string, (GearItem | null)[]>
  unlockedFiligreeSlots: Record<string, number>
  slottedGemSetBonuses: Record<string, (string | null)[]>
  slottedNearlyFinished: Record<string, LootEnchantment | null>
  slottedRitualTable: Record<string, LootEnchantment | null>
  slottedEssenceEnchantments: Record<string, Record<string, string | null>>
}

const formatEnchantment = (ench: {
  name: string
  modifier?: string | number
  bonus?: string | number
  notes?: string
}) => {
  const parts = []
  parts.push(ench.name)
  if (
    ench.modifier !== undefined &&
    ench.modifier != null &&
    String(ench.modifier) != ''
  ) {
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

export const generateBBCodeExport = (
  setup: GearSetup,
  allEssenceEnchantments: EssenceEnchantment[],
  artificerPet?: PetState,
  druidPet?: PetState,
  permalinkUrl?: string
) => {
  const lines: string[] = []

  lines.push(`[center][b][size=5]Gear Setup: ${setup.name}[/size][/b]`)
  lines.push(
    `[size=3]Levels ${String(setup.minLevel)}-${String(setup.maxLevel)} | ${setup.classes.filter(Boolean).join(' / ')}[/size][/center]`
  )

  if (permalinkUrl) {
    lines.push(`[center][url=${permalinkUrl}]View on YourDDO[/url][/center]`)
  }

  lines.push('')

  const renderSlotHeader = (slot: GearSlot, item: GearItem) => {
    lines.push(`[b]${slot}:[/b] [u]${item.name}[/u] (ML: ${item.minLevel})`)
  }

  const renderSlotEnchantments = (
    item: GearItem,
    nearlyFinished?: LootEnchantment,
    ritualTable?: LootEnchantment
  ) => {
    if (item.enchantments && item.enchantments.length > 0) {
      lines.push(`[list]`)

      item.enchantments.forEach((ench) => {
        if (nearlyFinished && ench.name === 'Nearly Finished') return
        if (
          ritualTable &&
          (ench.name === 'Sealed in Fire' || ench.name === 'Sealed in Undeath')
        )
          return

        lines.push(`[*] ${formatEnchantment(ench)}`)
      })

      lines.push(`[/list]`)
    }
  }

  const renderSlotFiligrees = (filigrees: (LootItem | null)[] | undefined) => {
    if (
      filigrees &&
      filigrees.length > 0 &&
      filigrees.some((f) => f !== null)
    ) {
      lines.push(`[indent][b][color=yellow]Filigrees:[/color][/b][/indent]`)
      lines.push(`[list]`)

      filigrees.forEach((fili) => {
        if (fili) {
          lines.push(`[*] ${fili.name}`)

          fili.enchantments?.forEach((ench) => {
            lines.push(`[list][*] ${formatEnchantment(ench)}[/list]`)
          })
        }
      })

      lines.push(`[/list]`)
    }
  }

  const renderSlotGemSets = (gemSets: (string | null)[] | undefined) => {
    if (gemSets && gemSets.length > 0 && gemSets.some((s) => s !== null)) {
      lines.push(
        `[indent][b][color=green]Gem Set Bonuses:[/color][/b] ${gemSets.filter(Boolean).join(', ')}[/indent]`
      )
    }
  }

  const renderSlotEssenceCrafting = (
    item: GearItem,
    essenceCrafting: Record<string, string | null> | undefined,
    allEssenceEnchantments: EssenceEnchantment[]
  ) => {
    if (
      essenceCrafting &&
      Object.values(essenceCrafting).some((v) => v !== null)
    ) {
      lines.push(
        `[indent][b][color=cyan]Essence Crafting:[/color][/b][/indent]`
      )
      lines.push(`[list]`)

      const minLevel = parseInt(item.minLevel) || 1

      Object.entries(essenceCrafting).forEach(([slotName, enchId]) => {
        if (enchId) {
          const ench = allEssenceEnchantments.find((e) => e.id === enchId)
          if (ench) {
            const idx = Math.max(
              0,
              Math.min((ench.scalingStats?.length ?? 1) - 1, minLevel - 1)
            )
            const scalingValue = ench.scalingStats?.[idx]

            if (ench.enchantments && ench.enchantments.length > 0) {
              ench.enchantments.forEach((innerEnch) => {
                lines.push(
                  `[*] [b]${slotName}:[/b] ${formatEnchantment({
                    ...innerEnch,
                    name: innerEnch.name || ench.enchantmentName,
                    modifier: scalingValue ?? innerEnch.modifier,
                    bonus: innerEnch.bonus ?? ench.bonus
                  })}`
                )
              })
            } else {
              lines.push(
                `[*] [b]${slotName}:[/b] ${formatEnchantment({
                  name: ench.enchantmentName,
                  modifier: scalingValue,
                  bonus: ench.bonus
                })}`
              )
            }
          }
        }
      })

      lines.push(`[/list]`)
    }
  }

  const renderSlotsInternal = (
    slots: readonly GearSlot[],
    allEssenceEnchantments: EssenceEnchantment[],
    isPetSlot = false,
    petState?: PetState
  ) => {
    slots.forEach((slot) => {
      const item =
        isPetSlot && petState ? petState.slots[slot] : setup.slots[slot]
      if (!item) {
        // Don't show empty slots to keep it clean
        return
      }

      const nearlyFinished =
        isPetSlot && petState
          ? petState.slottedNearlyFinished?.[item.id]
          : setup.slottedNearlyFinished[item.id]

      const ritualTable =
        isPetSlot && petState
          ? petState.slottedRitualTable?.[item.id]
          : setup.slottedRitualTable[item.id]

      renderSlotHeader(slot, item)
      renderSlotEnchantments(
        item,
        nearlyFinished ?? undefined,
        ritualTable ?? undefined
      )
      if (nearlyFinished) {
        lines.push(
          `[indent][b][color=orange]Nearly Finished:[/color][/b] ${formatEnchantment(nearlyFinished)}[/indent]`
        )
      }

      if (ritualTable) {
        lines.push(
          `[indent][b][color=green]Ritual Table Upgrade:[/color][/b] ${formatEnchantment(ritualTable)}[/indent]`
        )
      }

      const essenceCrafting =
        isPetSlot && petState
          ? petState.slottedEssenceEnchantments?.[item.id]
          : setup.slottedEssenceEnchantments[item.id]
      renderSlotEssenceCrafting(item, essenceCrafting, allEssenceEnchantments)

      const filigrees =
        isPetSlot && petState
          ? petState.slottedFiligrees[item.id]
          : setup.slottedFiligrees[item.id]
      renderSlotFiligrees(filigrees)

      const gemSets =
        isPetSlot && petState
          ? petState.slottedGemSetBonuses[item.id]
          : setup.slottedGemSetBonuses[item.id]
      renderSlotGemSets(gemSets)

      lines.push('[center]---[/center]')
      lines.push('')
    })
  }

  lines.push(`[b][size=4]Equipped Gear[/size][/b]`)
  renderSlotsInternal(GEAR_SLOTS, allEssenceEnchantments)

  if (setup.classes.includes('Artificer')) {
    lines.push(`[b][size=4]Iron Defender Gear[/size][/b]`)
    renderSlotsInternal(
      ARTIFICER_PET_SLOTS,
      allEssenceEnchantments,
      true,
      artificerPet
    )
  }

  if (setup.classes.includes('Druid')) {
    lines.push(`[b][size=4]Wolf Companion Gear[/size][/b]`)
    renderSlotsInternal(DRUID_PET_SLOTS, allEssenceEnchantments, true, druidPet)
  }

  const equippedItems = Object.values(setup.slots).filter(
    (i): i is GearItem => i !== null
  )
  const activeSetEnhancements = getActiveSetEnhancements(
    equippedItems,
    setup.slottedAugments,
    setup.slottedFiligrees,
    setup.slottedGemSetBonuses
  )

  if (activeSetEnhancements.length > 0) {
    lines.push(`[b][size=4]Active Set Bonuses[/size][/b]`)
    lines.push(`[list]`)

    activeSetEnhancements.forEach((entry) => {
      lines.push(
        `[*] [b]${entry.sourceName.replace('Set Bonus: ', '')}:[/b] ${formatEnchantment(entry.ench)}`
      )
    })

    lines.push(`[/list]`)
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

  lines.push(`## Gear Setup: ${setup.name}`)
  lines.push(
    `Levels ${String(setup.minLevel)}-${String(setup.maxLevel)} | ${setup.classes.filter(Boolean).join(' / ')}`
  )

  if (permalinkUrl) {
    lines.push(`[View on YourDDO](${permalinkUrl})`)
  }

  lines.push('')

  const renderSlotHeader = (slot: GearSlot, item: GearItem) => {
    lines.push(`**${slot}:** __${item.name}__ (ML: ${item.minLevel})`)
  }

  const renderSlotEnchantments = (
    item: GearItem,
    nearlyFinished?: LootEnchantment,
    ritualTable?: LootEnchantment
  ) => {
    if (item.enchantments && item.enchantments.length > 0) {
      item.enchantments.forEach((ench) => {
        if (nearlyFinished && ench.name === 'Nearly Finished') return
        if (
          ritualTable &&
          (ench.name === 'Sealed in Fire' || ench.name === 'Sealed in Undeath')
        )
          return

        lines.push(`- ${formatEnchantment(ench)}`)
      })
    }
  }

  const renderSlotFiligrees = (filigrees: (LootItem | null)[] | undefined) => {
    if (
      filigrees &&
      filigrees.length > 0 &&
      filigrees.some((f) => f !== null)
    ) {
      lines.push(`- **Filigrees:**`)

      filigrees.forEach((fili) => {
        if (fili) {
          lines.push(`  - ${fili.name}`)

          fili.enchantments?.forEach((ench) => {
            lines.push(`    - ${formatEnchantment(ench)}`)
          })
        }
      })
    }
  }

  const renderSlotGemSets = (gemSets: (string | null)[] | undefined) => {
    if (gemSets && gemSets.length > 0) {
      const activeGemSets = gemSets.filter(Boolean)

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
    if (
      essenceCrafting &&
      Object.values(essenceCrafting).some((v) => v !== null)
    ) {
      lines.push(`- **Essence Crafting:**`)

      const minLevel = parseInt(item.minLevel) || 1

      Object.entries(essenceCrafting).forEach(([slotName, enchId]) => {
        if (enchId) {
          const ench = allEssenceEnchantments.find((e) => e.id === enchId)
          if (ench) {
            const idx = Math.max(
              0,
              Math.min((ench.scalingStats?.length ?? 1) - 1, minLevel - 1)
            )
            const scalingValue = ench.scalingStats?.[idx]

            if (ench.enchantments && ench.enchantments.length > 0) {
              ench.enchantments.forEach((innerEnch) => {
                lines.push(
                  `  - **${slotName}:** ${formatEnchantment({
                    ...innerEnch,
                    name: innerEnch.name || ench.enchantmentName,
                    modifier: scalingValue ?? innerEnch.modifier,
                    bonus: innerEnch.bonus ?? ench.bonus
                  })}`
                )
              })
            } else {
              lines.push(
                `  - **${slotName}:** ${formatEnchantment({
                  name: ench.enchantmentName,
                  modifier: scalingValue,
                  bonus: ench.bonus
                })}`
              )
            }
          }
        }
      })
    }
  }

  const renderSlotsInternal = (
    slots: readonly GearSlot[],
    allEssenceEnchantments: EssenceEnchantment[],
    isPetSlot = false,
    petState?: PetState
  ) => {
    slots.forEach((slot) => {
      const item =
        isPetSlot && petState ? petState.slots[slot] : setup.slots[slot]
      if (!item) {
        return
      }

      const nearlyFinished =
        isPetSlot && petState
          ? petState.slottedNearlyFinished?.[item.id]
          : setup.slottedNearlyFinished[item.id]

      const ritualTable =
        isPetSlot && petState
          ? petState.slottedRitualTable?.[item.id]
          : setup.slottedRitualTable[item.id]

      renderSlotHeader(slot, item)
      renderSlotEnchantments(
        item,
        nearlyFinished ?? undefined,
        ritualTable ?? undefined
      )
      if (nearlyFinished) {
        lines.push(
          `- **Nearly Finished:** ${formatEnchantment(nearlyFinished)}`
        )
      }

      if (ritualTable) {
        lines.push(
          `- **Ritual Table Upgrade:** ${formatEnchantment(ritualTable)}`
        )
      }

      const essenceCrafting =
        isPetSlot && petState
          ? petState.slottedEssenceEnchantments?.[item.id]
          : setup.slottedEssenceEnchantments[item.id]
      renderSlotEssenceCrafting(item, essenceCrafting, allEssenceEnchantments)

      const filigrees =
        isPetSlot && petState
          ? petState.slottedFiligrees[item.id]
          : setup.slottedFiligrees[item.id]
      renderSlotFiligrees(filigrees)

      const gemSets =
        isPetSlot && petState
          ? petState.slottedGemSetBonuses[item.id]
          : setup.slottedGemSetBonuses[item.id]
      renderSlotGemSets(gemSets)

      lines.push('')
    })
  }

  lines.push(`### Equipped Gear`)

  renderSlotsInternal(GEAR_SLOTS, allEssenceEnchantments)

  if (setup.classes.includes('Artificer')) {
    lines.push(`### Iron Defender Gear`)

    renderSlotsInternal(
      ARTIFICER_PET_SLOTS,
      allEssenceEnchantments,
      true,
      artificerPet
    )
  }

  if (setup.classes.includes('Druid')) {
    lines.push(`### Wolf Companion Gear`)

    renderSlotsInternal(DRUID_PET_SLOTS, allEssenceEnchantments, true, druidPet)
  }

  const equippedItems = Object.values(setup.slots).filter(
    (i): i is GearItem => i !== null
  )

  const petItems = [
    ...(artificerPet ? Object.values(artificerPet.slots) : []),
    ...(druidPet ? Object.values(druidPet.slots) : [])
  ].filter((i): i is GearItem => i !== null)

  const allItems = [...equippedItems, ...petItems]

  const allAugments = {
    ...setup.slottedAugments,
    ...(artificerPet?.slottedAugments ?? {}),
    ...(druidPet?.slottedAugments ?? {})
  }

  const allFiligrees = {
    ...setup.slottedFiligrees,
    ...(artificerPet?.slottedFiligrees ?? {}),
    ...(druidPet?.slottedFiligrees ?? {})
  }

  const allGemSets = {
    ...setup.slottedGemSetBonuses,
    ...(artificerPet?.slottedGemSetBonuses ?? {}),
    ...(druidPet?.slottedGemSetBonuses ?? {})
  }

  const activeSetEnhancements = getActiveSetEnhancements(
    allItems,
    allAugments,
    allFiligrees,
    allGemSets
  )

  if (activeSetEnhancements.length > 0) {
    lines.push(`### Active Set Bonuses`)

    activeSetEnhancements.forEach((entry) => {
      lines.push(
        `- **${entry.sourceName.replace('Set Bonus: ', '')}:** ${formatEnchantment(entry.ench)}`
      )
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
