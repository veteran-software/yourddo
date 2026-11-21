import { emptyGearCraftingData } from './crafting.ts'
import {
  allGearPlannerSlots,
  type GearPlannerData,
  type GearPlannerFiligree,
  type GearPlannerFiligreeSetDefinition,
  type GearPlannerSetIndex,
  type GearPlannerItem,
  type GearPlannerSlot,
  type GearPlannerSourceDataset,
  type GearPlannerSourceItem
} from './gearPlanner.types.ts'
import { emptyGearPlannerReforgingData, isGearPlannerReforgingUpgradeSource } from './reforging.ts'
import { isAcceptedSourceItem, sourceSlotsForItem } from './sourceMapping.ts'

const numericLevel = (value: string | number | undefined): number => {
  const parsed = typeof value === 'number' ? value : Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

const optionalNumericLevel = (value: string | number | undefined): number | undefined => {
  if (value === undefined || value === '') return undefined
  const parsed = typeof value === 'number' ? value : Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

// Source file, source page identity, level, and planner slot are stable across reloads.
export const gearPlannerItemId = (sourceFile: string, item: GearPlannerSourceItem, slot: GearPlannerSlot): string =>
  [slot, sourceFile, item.pageTitle ?? item.name, item.name, numericLevel(item.minLevel)]
    .map(encodeURIComponent)
    .join('|')

// Production display names are not unique. Page title is the stable corpus identity.
export const gearPlannerFiligreeId = (item: GearPlannerSourceItem): string =>
  [item.pageTitle ?? '', item.name, item.type ?? '', item.grouping ?? ''].map(encodeURIComponent).join('|')

export const normalizeGearPlannerFiligrees = (
  records: readonly GearPlannerSourceItem[],
  definitions?: ReadonlyMap<string, GearPlannerFiligreeSetDefinition>,
  index?: GearPlannerSetIndex
): readonly GearPlannerFiligree[] =>
  records.map((source) => {
    const sets = source.setBonus?.length
      ? source.setBonus.map((s) => s.name)
      : (index?.get(source.name)?.map((e) => e.setName) ?? (source.grouping ?? '').split('/'))
    const grouping = [
      ...new Set(
        sets
          .map((s) => s.trim())
          .filter(Boolean)
          .map((name) => {
            if (!definitions || definitions.has(name)) return name
            // Some dual-set records abbreviate a published set name.
            const fullName = name === 'Keeper of the Curse' ? 'Keeper of Curses' : 'The ' + name
            return definitions.has(fullName) ? fullName : name
          })
      )
    ].join('/')
    return {
      id: gearPlannerFiligreeId(source),
      name: source.name,
      minimumLevel: numericLevel(source.minLevel),
      ...(grouping ? { grouping } : {}),
      source
    }
  })

const normalizeItem = (
  fileName: string,
  source: GearPlannerSourceItem,
  slot: GearPlannerSlot,
  absoluteMinimumLevel?: number
): GearPlannerItem => ({
  id: gearPlannerItemId(fileName, source, slot),
  slot,
  sourceFile: fileName,
  minimumLevel: numericLevel(source.minLevel),
  ...(absoluteMinimumLevel !== undefined ? { absoluteMinimumLevel } : {}),
  source
})

export const normalizeGearPlannerSources = (
  sourceDatasets: readonly GearPlannerSourceDataset[],
  augments: GearPlannerData['augments'],
  reforgingItemNames: ReadonlySet<string> = new Set()
): GearPlannerData => {
  const itemsBySlot = Object.fromEntries(allGearPlannerSlots.map((slot) => [slot, [] as GearPlannerItem[]])) as Record<
    GearPlannerSlot,
    GearPlannerItem[]
  >
  let rawItemCount = 0
  let rejectedItemCount = 0

  for (const { fileName, records } of sourceDatasets) {
    rawItemCount += records.length
    for (const source of records) {
      if (isGearPlannerReforgingUpgradeSource(source, reforgingItemNames)) {
        rejectedItemCount += sourceSlotsForItem(fileName, source).length
        continue
      }
      const absoluteMinimumLevel = optionalNumericLevel(source.absoluteMinLevel)
      for (const slot of sourceSlotsForItem(fileName, source)) {
        if (!isAcceptedSourceItem(source, slot)) {
          rejectedItemCount += 1
          continue
        }
        itemsBySlot[slot].push(normalizeItem(fileName, source, slot, absoluteMinimumLevel))
      }
    }
  }

  const items = allGearPlannerSlots.flatMap((slot) => itemsBySlot[slot])
  return {
    sourceDatasets,
    items,
    itemsBySlot,
    augments,
    curses: [],
    filigrees: [],
    filigreeSetDefinitions: [],
    filigreeSetDefinitionByName: new Map(),
    crafting: emptyGearCraftingData,
    reforging: emptyGearPlannerReforgingData,
    rawItemCount,
    normalizedItemCount: items.length,
    rejectedItemCount
  }
}
