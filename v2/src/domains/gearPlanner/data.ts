import { craftItemKey, type GearCraftingData } from './crafting.ts'
import { standardGearPlannerSetDefinitionByName } from './standardSetDefinitions.ts'
import { loadDatasetFile, loadManualPayload } from '../../shared/data/loadDataset.ts'
import { nearlyFinishedPayloadName, parseNearlyFinishedDataset } from '../nearlyFinished/nearlyFinished.logic.ts'
import { parseGearPlannerCurseDataset } from './curses.ts'
import type {
  GearPlannerAugment,
  GearPlannerAugmentSlot,
  GearPlannerBinding,
  GearPlannerEffect,
  GearPlannerFiligreeSetDefinition,
  GearPlannerSetBonus,
  GearPlannerSourceDataset,
  GearPlannerSourceItem
} from './gearPlanner.types.ts'
import { normalizeGearPlannerFiligrees, normalizeGearPlannerSources } from './normalize.ts'
import { createGearPlannerReforgingData } from './reforging.ts'
import { gearPlannerItemSources } from './sourceMapping.ts'

const namedUpgradeFiles = [
  {
    system: 'fountain',
    label: 'Upgrade in Fountain of Necrotic Might',
    marker: 'Upgradeable Item (Black Abbot)',
    path: 'fountain-of-necrotic-might/upgrades.json'
  },
  {
    system: 'stormreaver',
    label: 'Upgrade in Stormreaver Monument',
    marker: 'Upgradeable Item (Stormreaver)',
    path: 'stormreaver-monument/upgrades.json'
  },
  {
    system: 'zhentarim',
    label: 'Upgrade with Zhentarim Black Stones',
    marker: 'Zhentarim Attuned',
    path: 'zhentarim-attuned/upgrades.json'
  }
] as const

const datasetRoot = 'gear-planner'
const augmentPath = `${datasetRoot}/augment.json`
const filigreePath = `${datasetRoot}/filigrees.json`
const filigreeSetPath = `${datasetRoot}/filigreeSets.json`

export class InvalidGearPlannerDataError extends Error {
  constructor(message: string) {
    super(`Invalid Gear Planner data: ${message}`)
    this.name = 'InvalidGearPlannerDataError'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const isString = (value: unknown): value is string => typeof value === 'string'
const isStringOrNumber = (value: unknown): value is string | number =>
  typeof value === 'string' || typeof value === 'number'

const invalid = (path: string, message: string): never => {
  throw new InvalidGearPlannerDataError(`${path}: ${message}`)
}

const recordAt = (value: unknown, path: string): Record<string, unknown> => {
  if (!isRecord(value)) invalid(path, 'expected object')
  return value as Record<string, unknown>
}

const arrayAt = (value: unknown, path: string): unknown[] => {
  if (!Array.isArray(value)) invalid(path, 'expected array')
  return value as unknown[]
}

const optionalString = (record: Record<string, unknown>, key: string, path: string): string | undefined => {
  const value = record[key]
  if (value === undefined) return undefined
  if (!isString(value)) invalid(`${path}.${key}`, 'expected string')
  return value as string
}

const parseEffect = (value: unknown, path: string): GearPlannerEffect => {
  const record = recordAt(value, path)
  if (!isNonEmptyString(record.name)) invalid(`${path}.name`, 'expected non-empty string')
  for (const key of ['statModified', 'notes'] as const) {
    if (record[key] !== undefined && !isString(record[key])) invalid(`${path}.${key}`, 'expected string')
  }
  for (const key of ['modifier', 'bonus'] as const) {
    if (record[key] !== undefined && !isStringOrNumber(record[key]))
      invalid(`${path}.${key}`, 'expected string or number')
  }
  if (
    record.stats !== undefined &&
    (!Array.isArray(record.stats) || !record.stats.every((entry: unknown) => isStringOrNumber(entry)))
  ) {
    invalid(`${path}.stats`, 'expected string or number array')
  }
  return { ...record, name: record.name as string }
}

const parseAugmentSlot = (value: unknown, path: string): GearPlannerAugmentSlot => {
  const record = recordAt(value, path)
  if (!isNonEmptyString(record.augmentType)) invalid(`${path}.augmentType`, 'expected non-empty string')
  if (record.name !== undefined && !isString(record.name)) invalid(`${path}.name`, 'expected string')
  return { ...record, augmentType: record.augmentType as string }
}

const parseSetBonus = (value: unknown, path: string): GearPlannerSetBonus => {
  const record = recordAt(value, path)
  if (!isNonEmptyString(record.name)) invalid(`${path}.name`, 'expected non-empty string')
  return { ...record, name: record.name as string }
}

const parseBinding = (value: unknown, path: string): GearPlannerBinding => {
  const record = recordAt(value, path)
  for (const key of ['type', 'to', 'from'] as const) {
    if (record[key] !== undefined && !isString(record[key])) invalid(`${path}.${key}`, 'expected string')
  }
  return { ...record }
}

const parseSourceItem = (value: unknown, path: string): GearPlannerSourceItem => {
  const record = recordAt(value, path)
  if (!isNonEmptyString(record.name)) invalid(`${path}.name`, 'expected non-empty string')
  for (const key of [
    'pageTitle',
    'type',
    'icon',
    'image',
    'material',
    'artifactType',
    'upgradeable',
    'grouping'
  ] as const) {
    optionalString(record, key, path)
  }
  for (const key of ['minLevel', 'absoluteMinLevel'] as const) {
    if (record[key] !== undefined && !isStringOrNumber(record[key]))
      invalid(`${path}.${key}`, 'expected string or number')
  }
  if (record.binding !== undefined) parseBinding(record.binding, `${path}.binding`)
  if (record.enchantments !== undefined && record.enchantments !== null) {
    arrayAt(record.enchantments, `${path}.enchantments`).forEach((effect, index) =>
      parseEffect(effect, `${path}.enchantments[${index.toString()}]`)
    )
  }
  if (record.augments !== undefined) {
    arrayAt(record.augments, `${path}.augments`).forEach((slot, index) =>
      parseAugmentSlot(slot, `${path}.augments[${index.toString()}]`)
    )
  }
  if (record.setBonus !== undefined) {
    arrayAt(record.setBonus, `${path}.setBonus`).forEach((setBonus, index) =>
      parseSetBonus(setBonus, `${path}.setBonus[${index.toString()}]`)
    )
  }
  if (
    record.dropLocations !== undefined &&
    record.dropLocations !== null &&
    (!Array.isArray(record.dropLocations) || !record.dropLocations.every(isRecord))
  ) {
    invalid(`${path}.dropLocations`, 'expected object array or null')
  }
  return { ...record, name: record.name as string }
}

export const parseGearPlannerItemDataset = (value: unknown, fileName: string): readonly GearPlannerSourceItem[] => {
  return arrayAt(value, fileName).map((item, index) => parseSourceItem(item, `${fileName}[${index.toString()}]`))
}

export const parseGearPlannerAugmentDataset = (value: unknown): readonly GearPlannerAugment[] => {
  return arrayAt(value, 'augment.json').map((entry, index) => {
    const path = `augment.json[${index.toString()}]`
    const augment = recordAt(entry, path)
    if (!isNonEmptyString(augment.name)) invalid(`${path}.name`, 'expected non-empty string')
    if (!isString(augment.augmentType)) invalid(`${path}.augmentType`, 'expected string')
    if (!isStringOrNumber(augment.minLevel)) invalid(`${path}.minLevel`, 'expected string or number')
    const minLevel = Number(augment.minLevel)
    if (!Number.isFinite(minLevel) || minLevel < 0) invalid(`${path}.minLevel`, 'expected finite non-negative number')
    const effectsAdded = augment.effectsAdded === undefined ? [] : arrayAt(augment.effectsAdded, `${path}.effectsAdded`)
    const setBonus = augment.setBonus === undefined ? undefined : arrayAt(augment.setBonus, `${path}.setBonus`)
    return {
      name: augment.name as string,
      augmentType: augment.augmentType as string,
      minLevel,
      effectsAdded: effectsAdded.map((effect, effectIndex) =>
        parseEffect(effect, `${path}.effectsAdded[${effectIndex.toString()}]`)
      ),
      ...(setBonus !== undefined
        ? {
            setBonus: setBonus.map((setEntry, setIndex) =>
              parseSetBonus(setEntry, `${path}.setBonus[${setIndex.toString()}]`)
            )
          }
        : {}),
      source: { ...augment }
    }
  })
}

const parseFiligreeSetEffect = (value: unknown, path: string): GearPlannerEffect => {
  const record = recordAt(value, path)
  const name = isNonEmptyString(record.name)
    ? record.name
    : isNonEmptyString(record.description)
      ? record.description
      : isNonEmptyString(record.notes)
        ? record.notes
        : 'Unnamed Enhancement'
  if (record.notes !== undefined && !isString(record.notes)) invalid(`${path}.notes`, 'expected string')
  for (const key of ['modifier', 'bonus'] as const) {
    if (record[key] !== undefined && !isStringOrNumber(record[key]))
      invalid(`${path}.${key}`, 'expected string or number')
  }
  return { ...record, name }
}

const itemSetPercent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 10 })

export const parseGearPlannerFiligreeSetDataset = (
  value: unknown,
  sourceName = 'filigreeSets.json'
): readonly GearPlannerFiligreeSetDefinition[] => {
  const names = new Set<string>()
  return arrayAt(value, sourceName).map((entry, index) => {
    const path = `${sourceName}[${index.toString()}]`
    const record = recordAt(entry, path)
    if (!isNonEmptyString(record.name)) invalid(`${path}.name`, 'expected non-empty string')
    const name = record.name as string
    if (names.has(name)) invalid(`${path}.name`, 'must be unique')
    names.add(name)
    const bonuses = arrayAt(record.bonuses, `${path}.bonuses`)
    return {
      name,
      thresholds: bonuses.map((bonus, bonusIndex) => {
        const bonusPath = `${path}.bonuses[${bonusIndex.toString()}]`
        const bonusRecord = recordAt(bonus, bonusPath)
        if (!Number.isInteger(bonusRecord.threshold) || (bonusRecord.threshold as number) < 1) {
          invalid(`${bonusPath}.threshold`, 'expected positive integer')
        }
        const enhancements =
          bonusRecord.enhancements === null || bonusRecord.enhancements === undefined
            ? []
            : arrayAt(bonusRecord.enhancements, `${bonusPath}.enhancements`)
        return {
          threshold: bonusRecord.threshold as number,
          effects: enhancements.map((rawEffect, effectIndex) => {
            const effect = parseFiligreeSetEffect(rawEffect, `${bonusPath}.enhancements[${effectIndex.toString()}]`)
            // The item-set feed encodes percentages as numeric ratios and flat modifiers as strings.
            return sourceName === 'itemSets.enchantments' && typeof effect.modifier === 'number'
              ? { ...effect, modifier: itemSetPercent.format(effect.modifier) }
              : effect
          })
        }
      }),
      source: { ...record }
    }
  })
}

const loadCraftingData = async (): Promise<GearCraftingData> => {
  const [recipes, ...tables] = await Promise.all([
    loadManualPayload<unknown>('nearlyComplete.recipes'),
    ...namedUpgradeFiles.map((file) => loadDatasetFile<unknown>(file.path))
  ])
  const named = (record: Record<string, unknown>, path: string): string =>
    isNonEmptyString(record.name) ? record.name : invalid(path, 'expected a name')
  const effects = (record: Record<string, unknown>, field: string, path: string) =>
    arrayAt(record[field], path).map((entry) => parseEffect(entry, path))
  return {
    nearlyComplete: arrayAt(recipes, 'nearlyComplete.recipes').map((entry, index) => {
      const path = `nearlyComplete.recipes[${String(index)}]`
      const record = recordAt(entry, path)
      return {
        name: named(record, path),
        effectsAdded: effects(record, 'effectsAdded', path),
        effectsRemoved: effects(record, 'effectsRemoved', path),
        requirements: arrayAt(record.requirements, path).map((r) => ({ name: named(recordAt(r, path), path) }))
      }
    }),
    upgrades: namedUpgradeFiles.map((file, index) => ({
      ...file,
      items: new Map(
        arrayAt(tables[index], file.path).map((entry) => {
          const record = recordAt(entry, file.path)
          return [craftItemKey(named(record, file.path)), effects(record, 'effectsAdded', file.path)]
        })
      )
    }))
  }
}

export function parseGearPlannerSetIndex(value: unknown) {
  const index = new Map<string, { setName: string; minimumLevel: number }[]>()
  for (const [setName, rows] of Object.entries(recordAt(value, 'setBonusIndex.json'))) {
    const path = 'setBonusIndex.json.' + setName
    for (const entry of arrayAt(rows, path)) {
      const { name, minLevel } = recordAt(entry, path)
      if (
        typeof name !== 'string' ||
        !name.trim() ||
        typeof minLevel !== 'number' ||
        !Number.isInteger(minLevel) ||
        minLevel < 0
      ) {
        throw new InvalidGearPlannerDataError(path + ': expected an item name and minimum level')
      }
      const matches = index.get(name) ?? []
      matches.push({ setName, minimumLevel: minLevel })
      index.set(name, matches)
    }
  }
  return index
}

export const loadGearPlannerData = async (): Promise<import('./gearPlanner.types.ts').GearPlannerData> => {
  const fileNames = Object.keys(gearPlannerItemSources)
  const [
    crafting,
    rawCurses,
    rawSets,
    rawReforging,
    rawAugments,
    rawFiligrees,
    rawFiligreeSets,
    rawSetIndex,
    ...rawItems
  ] = await Promise.all([
    loadCraftingData(),
    loadManualPayload<unknown>('deckOfManyCurses'),
    loadManualPayload<unknown>('itemSets.enchantments'),
    loadManualPayload<unknown>(nearlyFinishedPayloadName),
    loadDatasetFile<unknown>(augmentPath),
    loadDatasetFile<unknown>(filigreePath),
    loadDatasetFile<unknown>(filigreeSetPath),
    loadDatasetFile<unknown>(`${datasetRoot}/setBonusIndex.json`),
    ...fileNames.map((fileName) => loadDatasetFile<unknown>(`${datasetRoot}/${fileName}`))
  ])
  const sourceDatasets: GearPlannerSourceDataset[] = fileNames.map((fileName, index) => ({
    fileName,
    records: parseGearPlannerItemDataset(rawItems[index], fileName)
  }))
  const reforgingEntries = parseNearlyFinishedDataset(rawReforging).reforgingStation
  const normalized = normalizeGearPlannerSources(
    sourceDatasets,
    parseGearPlannerAugmentDataset(rawAugments),
    new Set(reforgingEntries.map(({ item }) => item))
  )
  const filigreeSetDefinitions = parseGearPlannerFiligreeSetDataset(rawFiligreeSets)
  const filigreeSetDefinitionByName = new Map(filigreeSetDefinitions.map((definition) => [definition.name, definition]))
  const setIndex = parseGearPlannerSetIndex(rawSetIndex)
  return {
    ...normalized,
    setIndex,
    crafting,
    standardSets: new Map([
      ...standardGearPlannerSetDefinitionByName,
      ...parseGearPlannerFiligreeSetDataset(rawSets, 'itemSets.enchantments').map((set) => [set.name, set] as const)
    ]),
    reforging: createGearPlannerReforgingData(reforgingEntries, sourceDatasets),
    curses: parseGearPlannerCurseDataset(rawCurses),
    filigrees: normalizeGearPlannerFiligrees(
      parseGearPlannerItemDataset(rawFiligrees, 'filigrees.json'),
      filigreeSetDefinitionByName,
      setIndex
    ),
    filigreeSetDefinitions,
    filigreeSetDefinitionByName
  }
}
