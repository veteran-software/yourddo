import { baseItemArt } from '../../shared/items/itemArt'
import { isVisibleEffect } from '../../shared/data/visibleEffect'
import { loadDatasetFile } from '../../shared/data/loadDataset.ts'
import type {
  LgsBonusEffect,
  LgsData,
  LgsRecipe,
  LgsTierAugment,
  WeaponFocusRule
} from './legendaryGreenSteel.types.ts'
import { expandLgsRequirements } from './logic.ts'

const domain = 'legendary-green-steel'
const resources = [
  'baseItems',
  'tier1',
  'tier2',
  'tier3',
  'activeAugments',
  'effects',
  'spells',
  'ingredients',
  'baseRecipes',
  'tier1Recipes',
  'tier2Recipes',
  'tier3Recipes',
  'activeRecipes',
  'weaponBonuses',
  'equipmentSets',
  'immortalsHeart'
] as const
type Resource = (typeof resources)[number]
type Row = Record<string, unknown>

export class InvalidLgsDataError extends Error {
  constructor(message: string) {
    super(`Invalid Legendary Green Steel data: ${message}`)
    this.name = 'InvalidLgsDataError'
  }
}

function invalid(message: string): never {
  throw new InvalidLgsDataError(message)
}
function row(value: unknown, path: string): Row {
  if (typeof value !== 'object' || !value || Array.isArray(value)) return invalid(`expected object at ${path}`)
  return value as Row
}
function list(value: unknown, path: string): unknown[] {
  return Array.isArray(value) ? value : invalid(`expected array at ${path}`)
}
function str(value: unknown, path: string): string {
  return typeof value === 'string' && value.trim() ? value : invalid(`expected text at ${path}`)
}
function integer(value: unknown, path: string): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
    ? value
    : invalid(`expected positive integer at ${path}`)
}
function strings(value: unknown, path: string): string[] {
  return list(value, path).map((v) => str(v, path))
}
function indexed(value: unknown, path: string) {
  const result = new Map<number, Row>()
  for (const v of list(value, path)) {
    const record = row(v, path)
    const id = integer(record.id, `${path}.id`)
    if (result.has(id)) invalid(`duplicate ${path} ID ${String(id)}`)
    result.set(id, record)
  }
  return result
}
function lookup(records: ReadonlyMap<number, Row>, key: unknown, path: string) {
  const id = integer(key, path)
  return records.get(id) ?? invalid(`unknown ${path} ${String(id)}`)
}
function discrepancyNotes(record: Row): string[] {
  return list(record.knownDiscrepancies ?? [], 'knownDiscrepancies').map((entry) => {
    const note = row(entry, 'knownDiscrepancies')
    const value = (v: unknown) =>
      (typeof v === 'number' && Number.isFinite(v)) || typeof v === 'boolean' ? String(v) : str(v, 'discrepancy value')
    const unit = note.unit === undefined || note.unit === 'points' ? '' : ' ' + str(note.unit, 'unit')
    // Some discrepancies describe a mechanic in plain language and have no display name.
    const label =
      note.statDisplayName ??
      (typeof note.stat === 'string' && /^[A-Z][a-z]+(?: [A-Za-z]+)+$/.test(note.stat) && !/[a-z][A-Z]/.test(note.stat)
        ? note.stat
        : 'Effect')
    return `${str(label, 'stat label')}: stated ${value(note.stated)}, actual ${value(note.mechanical)}${unit}.`
  })
}

function weaponFocusRule(value: unknown, path: string): WeaponFocusRule {
  const rule = row(value, path)
  const pair = (key: keyof WeaponFocusRule): [string, string] => {
    const values = strings(rule[key], `${path}.${key}`)
    if (values.length !== 2) invalid(`expected two focuses at ${path}.${key}`)
    return [values[0], values[1]]
  }
  return { tier1And2: pair('tier1And2'), tier3: pair('tier3') }
}

function indexRecipes(files: Record<Resource, unknown>) {
  const recipes = new Map<number, Row>()
  for (const stage of ['base', 'tier1', 'tier2', 'tier3', 'active'] as const) {
    for (const [id, recipe] of indexed(files[`${stage}Recipes`], stage)) {
      if (recipes.has(id) || recipe.device !== stage || recipe.quantity !== 1)
        invalid(`invalid ${stage} recipe ${String(id)}`)
      recipes.set(id, recipe)
    }
  }
  return recipes
}

function bonusParagraphs(name: string, descriptions: readonly string[]) {
  const paragraphs = descriptions.filter((text) => text !== name).flatMap((text) => text.split(/\n\s*\n/))
  return [...new Set(paragraphs.map((paragraph) => paragraph.trim()).filter(Boolean))]
}

export function parseLgsResources(
  files: Record<Resource, unknown>,
  devices: Row,
  weaponBonusMatching?: unknown
): LgsData {
  const matching = weaponBonusMatching === undefined ? undefined : row(weaponBonusMatching, 'weaponBonusMatching')
  if (matching && matching.orderWithinPairs !== 'any') invalid('unsupported weapon focus pair order')
  const ingredients = indexed(files.ingredients, 'ingredients')
  const effectById = indexed(files.effects, 'effects')
  const spells = indexed(files.spells, 'spells')
  const recipes = indexRecipes(files)
  function crafted(item: Row, outputId: unknown): LgsRecipe {
    const id = integer(outputId, 'output item ID')
    const recipe = lookup(recipes, item.recipeId, 'recipeId')
    if (recipe.outputItemId !== id)
      invalid(`recipe ${String(item.recipeId)} has the wrong output for item ${String(id)}`)
    const device = str(recipe.device, 'device')
    return {
      id,
      name: str(item.name, 'item.name'),
      craftedIn: str(row(devices[device], device).name, 'device.name'),
      requirements: list(recipe.ingredients, 'recipe.ingredients').map((v) => {
        const part = row(v, 'recipe ingredient')
        const ingredient = lookup(ingredients, part.ingredientId, 'ingredientId')
        return {
          id: integer(part.ingredientId, 'ingredientId'),
          name: str(ingredient.name, 'ingredient.name'),
          quantity: integer(part.quantity, 'ingredient quantity')
        }
      })
    }
  }
  function itemEffects(item: Row) {
    const rows = list(item.effectIds, 'effectIds').map((id) => lookup(effectById, id, 'effectId'))
    const names: string[] = []
    const details = new Set<string>()
    const discrepancies = new Set<string>()
    if (item.description) details.add(str(item.description, 'description'))
    for (const effect of rows.filter(isVisibleEffect)) {
      const name = str(effect.displayName, 'effect.displayName')
      const description = str(effect.description, 'effect.description')
      if (!/^(?:plus\s+|\+\s*)\d+\s+wear modifier$/i.test(name.trim())) {
        names.push(name)
        details.add(description)
      }
      const records = [
        effect,
        ...list(effect.procs ?? [], 'effect.procs')
          .map((proc) => row(proc, 'proc'))
          .filter(isVisibleEffect)
      ]
      for (const note of records.flatMap(discrepancyNotes)) discrepancies.add(note)
    }
    for (const note of discrepancyNotes(item)) discrepancies.add(note)
    return {
      effects: names,
      descriptions: [...details],
      discrepancies: [...discrepancies]
    }
  }
  function itemDetails(item: Row) {
    const { effects, descriptions, discrepancies } = itemEffects(item)
    return {
      effects,
      details: descriptions.filter((text) => !effects.includes(text)),
      discrepancies
    }
  }
  function tiers(key: 'tier1' | 'tier2' | 'tier3'): LgsTierAugment[] {
    return [...indexed(files[key], key).values()]
      .map((item) => {
        const primary = str(item.focus, 'focus')
        const paired = key === 'tier3' && item.type === 'weapon'
        const focuses = paired ? strings(item.focuses, 'focuses') : [primary]
        if (item.type !== 'weapon' && item.type !== 'equipment') invalid(`invalid ${key} type`)
        if (paired && (focuses.length !== 2 || focuses[0] !== primary)) invalid('invalid tier 3 focus pair')
        return {
          ...crafted(item, item.augmentId),
          slotTypes: strings(item.slotTypes, 'slotTypes'),
          focuses,
          essence: str(item.essence, 'essence'),
          gem: str(item.gem, 'gem'),
          ...itemDetails(item)
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }
  function bonuses(key: 'weaponBonuses' | 'equipmentSets', group: LgsBonusEffect['group']): LgsBonusEffect[] {
    return [...indexed(files[key], key).values()].map((item) => {
      const { effects, descriptions, discrepancies } = itemEffects(item)
      const status = str(item.activationStatus, 'activationStatus')
      const name = str(item.name, 'bonus.name')
      const requiredFocuses =
        group === 'Weapon bonuses' && status === 'configured'
          ? weaponFocusRule(item.requiredFocuses, `${name}.requiredFocuses`)
          : undefined
      const pairs = strings(item.observedFocusPairs ?? [], 'observedFocusPairs').flatMap((pair) => {
        const focuses = pair.split('/').map((focus) => focus.trim().toLowerCase())
        if (
          focuses.length !== 2 ||
          !focuses.every((focus) => ['air', 'earth', 'fire', 'water', 'positive', 'negative'].includes(focus))
        )
          return []
        return [focuses.map((focus) => focus[0].toUpperCase() + focus.slice(1)).join(' + ')]
      })
      return {
        name,
        requiredFocuses,
        group,
        discrepancies,
        paragraphs: [
          ...bonusParagraphs(name, [...effects, ...descriptions]),
          ...(pairs.length ? ['Observed focus pairs: ' + pairs.join(', ')] : [])
        ]
      }
    })
  }
  const components = [...ingredients.values()].filter((i) => i.recipeId !== undefined).map((i) => crafted(i, i.id))
  // Detect cycles before exposing any selectable recipe to the page.
  try {
    expandLgsRequirements(components, components)
  } catch (cause) {
    throw new InvalidLgsDataError(cause instanceof Error ? cause.message : 'invalid ingredient graph')
  }
  const heart = row(files.immortalsHeart, 'immortalsHeart')
  const data: LgsData = {
    baseItems: [...indexed(files.baseItems, 'baseItems').values()].map((item) => {
      if (item.type !== 'weapon' && item.type !== 'equipment') return invalid('invalid base item type')
      const slotTypes = list(item.slots, 'base slots').flatMap((v) => strings(row(v, 'slot').types, 'slot.types'))
      return {
        ...crafted(item, item.id),
        art: baseItemArt('legendary-green-steel', item),
        type: item.type,
        slotTypes,
        ...itemDetails(item)
      }
    }),
    tier1: tiers('tier1'),
    tier2: tiers('tier2'),
    tier3: tiers('tier3'),
    activeAugments: [...indexed(files.activeAugments, 'activeAugments').values()].map((item) => {
      const spell = lookup(spells, item.spellId, 'spellId')
      const { details, discrepancies } = itemDetails(item)
      const cooldown = spell.cooldownSeconds
      if (typeof cooldown !== 'number' || !Number.isFinite(cooldown) || cooldown < 0) invalid('invalid spell cooldown')
      return {
        ...crafted(item, item.id),
        slotTypes: strings(item.slotTypes, 'slotTypes'),
        displayName: str(spell.name, 'spell.name'),
        discrepancies,
        description: [...new Set([...details, str(spell.description, 'spell.description')])].join('\n'),
        spellDetails: `Caster level ${String(integer(item.casterLevel, 'casterLevel'))} · Charges ${String(integer(item.charges, 'charges'))} · Recharge count ${String(integer(item.rechargeCount, 'rechargeCount'))} · Spell cooldown ${String(cooldown)}s`
      }
    }),
    explicitNoEffect: matching
      ? list(matching.explicitNoEffect, 'explicitNoEffect').map((value) => weaponFocusRule(value, 'explicitNoEffect'))
      : [],
    bonusEffects: [...bonuses('weaponBonuses', 'Weapon bonuses'), ...bonuses('equipmentSets', 'Equipment sets')],
    craftingComponents: components,
    immortalsHeart: { ...crafted(heart, heart.id), slotTypes: strings(heart.slotTypes, 'heart.slotTypes') }
  }
  for (const records of [data.baseItems, data.tier1, data.tier2, data.tier3, data.activeAugments, data.bonusEffects]) {
    if (new Set(records.map((r) => r.name)).size !== records.length) invalid('duplicate selectable name')
  }
  return data
}

async function loadResources(): Promise<LgsData> {
  const manifest = row(await loadDatasetFile<unknown>(`${domain}/manifest.json`), 'manifest')
  if (manifest.system !== domain || !/^sha256:[0-9a-f]{64}$/.test(str(manifest.version, 'manifest.version')))
    invalid('unsupported LGS manifest')
  const paths = row(manifest.resources, 'manifest.resources')
  const devices = row(manifest.devices, 'manifest.devices')
  const files = await Promise.all(
    resources.map(async (key) => {
      const path = str(paths[key], key)
      if (!/^(?:[\w-]+\/)*[\w-]+\.json$/.test(path)) invalid(`invalid resource path for ${key}`)
      return [key, await loadDatasetFile<unknown>(`${domain}/${path}`)] as const
    })
  )
  return parseLgsResources(
    Object.fromEntries(files) as Record<Resource, unknown>,
    devices,
    manifest.weaponBonusMatching
  )
}

let pending: Promise<LgsData> | undefined
export function loadLgsData(): Promise<LgsData> {
  pending ??= loadResources().finally(() => {
    pending = undefined
  })
  return pending
}
