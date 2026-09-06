import {
  allGearPlannerSlots,
  type GearPlannerData,
  type GearPlannerFiligree,
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
  records: readonly GearPlannerSourceItem[]
): readonly GearPlannerFiligree[] =>
  records.map((source) => ({
    id: gearPlannerFiligreeId(source),
    name: source.name,
    minimumLevel: numericLevel(source.minLevel),
    ...(source.grouping?.trim() ? { grouping: source.grouping.trim() } : {}),
    source
  }))

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
        itemsBySlot[slot].push({
          id: gearPlannerItemId(fileName, source, slot),
          slot,
          sourceFile: fileName,
          minimumLevel: numericLevel(source.minLevel),
          ...(absoluteMinimumLevel !== undefined ? { absoluteMinimumLevel } : {}),
          source
        })
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
    reforging: emptyGearPlannerReforgingData,
    rawItemCount,
    normalizedItemCount: items.length,
    rejectedItemCount
  }
}
