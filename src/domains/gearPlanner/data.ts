import { isVisibleEffect } from '../../shared/data/visibleEffect'
import { displayPercentModifier, percentModifier } from './effectAmounts'
import { loadOptionalAlchemicalData } from '../alchemical/loadAlchemicalData'
import { loadOptionalThunderData } from '../thunderForged/data'
import { addThunderBases } from './thunderForgedCrafting'
import { loadOptionalHeroismData, prepareHeroismBases } from './heroismCrafting'
import { loadOptionalSlaveLordsData } from '../slaveLords/loadSlaveLordsData'
import type { GearPlannerStandardSetDefinition } from './standardSetDefinitions.ts'
import { slaveLordsSetDefinitions } from './slaveLordsCrafting'
import { craftItemKey, type GearCraftingData } from './crafting.ts'
import { hasDatasetFile, loadDatasetFile } from '../../shared/data/loadDataset.ts'
import { loadNearlyFinishedRecipes } from '../nearlyFinished/loadRecipes'
import { loadNativeNamedUpgrades } from './nativeUpgradeData'
import { loadNearlyCompleteRecipes } from '../nearlyComplete/recipes'
import type {
  GearPlannerAugment,
  GearPlannerAugmentSlot,
  GearPlannerBinding,
  GearPlannerEffect,
  GearPlannerItem,
  GearPlannerSetBonus,
  GearPlannerSourceItem
} from './gearPlanner.types.ts'
import { normalizeGearPlannerFiligrees, normalizeGearPlannerSources } from './normalize.ts'
import { createGearPlannerReforgingData } from './reforging.ts'
import { loadCatalogCurses, loadItemCatalog, loadSocketCatalog } from './itemCatalog'

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
  const display = typeof record.modifier === 'string' ? displayPercentModifier(record.modifier) : {}
  return { ...record, ...display, name: record.name as string }
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
  let enchantments
  if (record.enchantments !== undefined && record.enchantments !== null) {
    enchantments = arrayAt(record.enchantments, `${path}.enchantments`)
      .filter(isVisibleEffect)
      .map((effect, index) => parseEffect(effect, `${path}.enchantments[${index.toString()}]`))
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
  return { ...record, ...(enchantments && { enchantments }), name: record.name as string }
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
      effectsAdded: effectsAdded
        .filter(isVisibleEffect)
        .map((effect, effectIndex) => parseEffect(effect, `${path}.effectsAdded[${effectIndex.toString()}]`)),
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

const named = (record: Record<string, unknown>, path: string): string =>
  isNonEmptyString(record.name) ? record.name : invalid(path, 'expected a name')
const effects = (record: Record<string, unknown>, field: string, path: string) =>
  arrayAt(record[field], path)
    .filter(isVisibleEffect)
    .map((entry) => parseEffect(entry, path))
async function loadNamedUpgrade(file: (typeof namedUpgradeFiles)[number]) {
  const directory = file.path.slice(0, file.path.indexOf('/'))
  if (await hasDatasetFile(directory + '/enchantment-names.json'))
    return { ...file, ...(await loadNativeNamedUpgrades(directory, file.marker)) }
  const table = await loadDatasetFile<unknown>(file.path)
  return {
    ...file,
    items: new Map<string, GearPlannerEffect[]>(
      arrayAt(table, file.path).map((entry) => {
        const record = recordAt(entry, file.path)
        return [
          craftItemKey(named(record, file.path)),
          effects(record, 'effectsAdded', file.path).map((effect) => {
            // Named upgrade tables encode threat modifiers as unitless ratios.
            if (
              /^(?:Melee|Ranged|Spell) Threat$/.test(effect.name) &&
              /^[+-]?(?:\d+|\d*\.\d+)$/.test(String(effect.modifier))
            )
              return { ...effect, ...percentModifier(Number(effect.modifier) * 100) }
            return effect
          })
        ]
      })
    )
  }
}

async function loadCraftingData(): Promise<GearCraftingData> {
  const [nearlyComplete, upgrades] = await Promise.all([
    loadNearlyCompleteRecipes(),
    Promise.all(namedUpgradeFiles.map(loadNamedUpgrade))
  ])
  return { nearlyComplete, upgrades }
}

async function loadDampenedRecipes() {
  const manifestPath = 'dampened/manifest.json'
  const links = new Map<number, number>()
  if (!(await hasDatasetFile(manifestPath))) return links
  const manifest = recordAt(await loadDatasetFile<unknown>(manifestPath), manifestPath)
  if (manifest.system !== 'dampened') invalid(manifestPath, 'expected the Dampened package')
  const resources = recordAt(manifest.resources, manifestPath)
  if (!isNonEmptyString(resources.recipes)) return invalid(manifestPath, 'missing the recipes resource')
  const recipePath = 'dampened/' + resources.recipes
  for (const entry of arrayAt(await loadDatasetFile<unknown>(recipePath), recipePath)) {
    const recipe = recordAt(entry, recipePath)
    if (recipe.stage !== 'cleansing') continue
    const inputs = arrayAt(recipe.ingredients, recipePath).flatMap((ingredient) => {
      const { itemId } = recordAt(ingredient, recipePath)
      return typeof itemId === 'number' && Number.isSafeInteger(itemId) ? [itemId] : []
    })
    const output = recipe.outputItemId
    if (inputs.length !== 1 || typeof output !== 'number' || !Number.isSafeInteger(output))
      return invalid(recipePath, 'each cleansing recipe must have one input item and one output item')
    if (links.has(inputs[0]) || inputs[0] === output) return invalid(recipePath, 'invalid cleansing recipe link')
    links.set(inputs[0], output)
  }
  return links
}

function dampenedUpgradeItems(items: readonly GearPlannerItem[], links: ReadonlyMap<number, number>) {
  const targetIds = new Set(links.values())
  const targets = Map.groupBy(
    items.filter(({ source }) => source.catalogId !== undefined && targetIds.has(source.catalogId)),
    ({ source }) => source.catalogId
  )
  const upgrades = new Map<string, GearPlannerItem>()
  for (const item of items) {
    const catalogId = item.source.catalogId
    const output = catalogId === undefined ? undefined : links.get(catalogId)
    if (output === undefined) continue
    const replacement = targets.get(output)?.find(({ slot }) => slot === item.slot)
    if (replacement) upgrades.set(item.id, replacement)
  }
  return upgrades
}

export const loadGearPlannerData = async (): Promise<import('./gearPlanner.types.ts').GearPlannerData> => {
  const [crafting, slaveLords, alchemical, thunderForged, heroism, dampened, curses, reforging, sockets, itemCatalog] =
    await Promise.all([
      loadCraftingData(),
      loadOptionalSlaveLordsData(),
      loadOptionalAlchemicalData(),
      loadOptionalThunderData(),
      loadOptionalHeroismData(),
      loadDampenedRecipes(),
      loadCatalogCurses(),
      loadNearlyFinishedRecipes(),
      loadSocketCatalog(),
      loadItemCatalog()
    ])
  const itemDatasets = thunderForged ? addThunderBases(itemCatalog.datasets, thunderForged) : itemCatalog.datasets
  const sourceDatasets = heroism ? prepareHeroismBases(itemDatasets, heroism) : itemDatasets
  const reforgingEntries = reforging.reforgingStation
  const normalized = normalizeGearPlannerSources(
    sourceDatasets,
    sockets.augments(sourceDatasets),
    new Set(reforgingEntries.map(({ item }) => item)),
    slaveLords,
    alchemical
  )
  const filigreeSetDefinitions = sockets.filigreeDefinitions
  const filigreeSetDefinitionByName = new Map(filigreeSetDefinitions.map((definition) => [definition.name, definition]))
  const equipmentDefinitions = new Map(sockets.equipmentDefinitions)
  for (const [id, set] of heroism?.definitions ?? []) equipmentDefinitions.set(id, set)
  const equipmentSetsByName = Map.groupBy(equipmentDefinitions, ([, set]) => set.name)
  const standardSets = new Map<string | number, GearPlannerStandardSetDefinition>()
  for (const matches of equipmentSetsByName.values()) {
    // Some set variants share a label but have different members.
    for (const [id, set] of matches) {
      if (set.thresholds.length > 0) standardSets.set(matches.length === 1 ? set.name : id, set)
    }
  }
  for (const set of slaveLords ? slaveLordsSetDefinitions(slaveLords) : []) standardSets.set(set.name, set)
  return {
    ...normalized,
    enchantmentAliases: itemCatalog.aliases,
    enchantmentNames: itemCatalog.enchantmentNames,
    augmentEnchantmentNames: sockets.enchantmentNames,
    crafting: { ...crafting, slaveLords, alchemical, thunderForged, heroism },
    dampenedUpgrades: dampenedUpgradeItems(normalized.items, dampened),
    standardSets,
    reforging: createGearPlannerReforgingData(reforgingEntries, sourceDatasets),
    curses,
    filigrees: normalizeGearPlannerFiligrees(sockets.filigrees, filigreeSetDefinitionByName),
    filigreeSetDefinitions,
    filigreeSetDefinitionByName
  }
}
