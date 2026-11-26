import { isVisibleEffect } from '../../shared/data/visibleEffect'
import type { HgsEffect, HgsMechanic, HgsTargetEligibility } from './heroicGreenSteel.types'

type Row = Record<string, unknown>

function record(value: unknown): Row {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid Heroic Green Steel record')
  return value as Row
}

function rows(value: unknown): Row[] {
  if (!Array.isArray(value)) throw new Error('Invalid Heroic Green Steel record list')
  return value.map(record)
}

function id(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) throw new Error('Invalid Heroic Green Steel ID')
  return value
}

function text(value: unknown): string {
  if (typeof value !== 'string' || !value) throw new Error('Missing Heroic Green Steel label')
  return value
}

function strings(value: unknown) {
  if (!Array.isArray(value)) throw new Error('Invalid Heroic Green Steel labels')
  return value.map(text)
}

export function nativeBaseItems(value: unknown) {
  return rows(value)
    .filter((entry) => entry.craftingRole === 'blank' && entry.recipeId !== undefined)
    .map((entry) => {
      const weapon = entry.type === 'Weapon' || entry.type === 'Missile'
      return { ...entry, type: weapon ? 'weapon' : 'equipment', weaponType: weapon ? entry.itemType : undefined }
    })
}

function eligibility(value: unknown) {
  const result: HgsTargetEligibility = {}
  if (value && !Array.isArray(value)) {
    const limits = record(value)
    result.excludedCreatureTraits = strings(limits.excludedInteractiveTypes ?? [])
    if (limits.requiresUncharmedTarget) result.excludedCreatureTraits.push('Charmed targets')
    if (limits.requiresTargetAttacksPlayers) result.includedGenus = ['Targets that attack players']
    return result
  }
  for (const row of rows(value ?? [])) {
    const members = strings(row.values ?? [])
    if (row.category === 'CreatureGenus') {
      const key = row.relation === 'exclude' ? 'excludedGenus' : 'includedGenus'
      result[key] = [...(result[key] ?? []), ...members]
    } else if (row.relation === 'exclude') {
      result.excludedCreatureTraits = [...(result.excludedCreatureTraits ?? []), ...members]
    } else if (members.length) {
      result.includedGenus = [...(result.includedGenus ?? []), ...members]
    }
  }
  return result
}

function traitNames(node: Row): string[] {
  if (!Array.isArray(node.value)) return []
  return node.value.flatMap((v) => (typeof v === 'string' ? [v] : traitNames(record(v))))
}

function damageLabel(row: Row) {
  const damage = strings(row.damageTypes).join(' / ') + ' damage'
  if (row.expression) return text(row.expression) + ' ' + damage
  if (row.criticalMultiplierDice)
    return (
      damage +
      ' (' +
      rows(row.criticalMultiplierDice)
        .map((v) => '×' + String(id(v.multiplier)) + ': ' + text(v.dice))
        .join(', ') +
      ')'
    )
  return damage
}

function mechanicLabel(row: Row): string {
  if (row.type === 'damage') return damageLabel(row)
  if (row.type === 'damageReductionBypass') return 'Damage reduction bypass: ' + strings(row.traits).join(', ')
  if (row.type === 'saveAutoFailureImmunity') return 'Save auto-failure immunity: ' + strings(row.saveFlags).join(', ')
  if (row.type === 'immunity') {
    const traits = [...rows(row.targets ?? []).flatMap(traitNames), ...strings(row.effectTraits ?? [])]
    return 'Immunity: ' + (row.targetDescription ? text(row.targetDescription) : traits.join(', ') || 'harmful effects')
  }
  if (row.type === 'levelDrain') return text(row.dice) + ' negative levels (' + text(row.channel) + ')'
  if (row.type === 'createEntity') return 'Summon ' + text(row.name)
  if (row.type === 'instantKill') return row.onFailedSave ? 'Instant kill on failed save' : 'Instant kill'
  if (row.type === 'createSoulGem') return 'Create soul gem'
  if (row.type === 'script') return typeof row.description === 'string' ? row.description : 'Scripted effect'
  const name = text(row.displayName ?? row.name ?? row.type)
  if (Array.isArray(row.value)) return name + ': ' + strings(row.value).join(', ')
  return name
}

function nativeMechanics(row: Row, parent?: Row): HgsMechanic[] {
  if (row.internal || !isVisibleEffect(row)) return []
  let name = mechanicLabel(row)
  if (Array.isArray(row.outcomes)) {
    const parts = rows(row.outcomes).flatMap((child) => nativeMechanics(child, row))
    const timing = row.intervalSeconds ? ' every ' + String(id(row.intervalSeconds)) + 's' : ''
    const duration = row.durationSeconds ? ' for ' + String(id(row.durationSeconds)) + 's' : ''
    return parts.map((part) => ({ ...part, name: name + ': ' + (part.name ?? '') + timing + duration }))
  }
  if (typeof parent?.save === 'string' && typeof parent.saveDC === 'number') {
    name += ' (' + parent.save + ' DC ' + String(parent.saveDC) + ')'
  }
  const absorption = row.unit === 'multiplier' && row.operation === 'Multiply' && /absorption/i.test(name)
  let value = row.value
  if (typeof value === 'number') {
    if (absorption) value = Math.round((1 - value) * 100)
    else if (row.unit === 'percent' || row.unit === 'points') value = Math.trunc(value)
  }
  return [
    {
      name,
      ...(typeof value === 'number' && { value }),
      ...(typeof row.bonusType === 'string' && { bonusType: row.bonusType }),
      ...(typeof row.unit === 'string' && row.unit !== 'points' && { unit: absorption ? 'percent' : row.unit }),
      targetEligibility: eligibility(row.targetEligibility ?? parent?.targetEligibility)
    }
  ]
}

function discrepancyNotes(entry: Row) {
  return rows(entry.knownDiscrepancies ?? []).map((note) => {
    const amount = (v: unknown) => (typeof v === 'number' || typeof v === 'boolean' ? String(v) : text(v))
    return `${text(note.statDisplayName ?? note.stat)}: stated ${amount(note.stated)}, actual ${amount(note.mechanical)}.`
  })
}

export function nativeEffects(value: unknown, spells: unknown = []): HgsEffect[] {
  const spellNames = new Map(rows(spells).map((spell) => [id(spell.castingSpellId), text(spell.name)]))
  return rows(value).map((entry) => ({
    id: id(entry.id),
    displayName: text(entry.displayName),
    description: typeof entry.description === 'string' ? entry.description : '',
    ...(!isVisibleEffect(entry) && { hidden: true }),
    enchantments: rows(entry.enchantments).flatMap((stat) => {
      if (stat.displayName !== 'Spell' || stat.operation !== 'Set') return nativeMechanics(stat)
      if (stat.internal || !isVisibleEffect(stat)) return []
      const name = spellNames.get(id(stat.value))
      if (!name) throw new Error('Unknown Heroic Green Steel casting spell ' + String(stat.value))
      return [{ name: 'Spell: ' + name }]
    }),
    discrepancies: [...new Set([entry, ...rows(entry.procs ?? []).filter(isVisibleEffect)].flatMap(discrepancyNotes))],
    procs: rows(entry.procs ?? [])
      .filter(isVisibleEffect)
      .map((proc) => ({
        trigger: proc.trigger ? text(proc.trigger) : strings(proc.triggers).join(' / '),
        ...(typeof proc.procChance === 'number' && { procChance: proc.procChance }),
        outcomes: rows(proc.outcomes).flatMap((outcome) => nativeMechanics(outcome, proc))
      }))
  }))
}

// Native applications reference shard recipes on tier options. Dual shards require two independently crafted shards.
export function nativeRecipeGraph(base: unknown, ingredients: unknown, tierLists: unknown[], recipeLists: unknown[]) {
  const items = rows(base)
  const materials = rows(ingredients)
  const all = recipeLists.flatMap(rows)
  const byId = new Map(all.map((r) => [id(r.id), r]))
  const byProduct = new Map<number, number>()
  for (const recipe of all) {
    if (recipe.category !== 'component' || !rows(recipe.ingredients).every((part) => part.ingredientId !== undefined))
      continue
    const product = id(recipe.outputItemId)
    if (!byProduct.has(product)) byProduct.set(product, id(recipe.id))
  }
  const needed = new Set([
    ...byProduct.values(),
    ...items
      .filter((item) => item.craftingRole === 'blank' && item.recipeId !== undefined)
      .map((item) => id(item.recipeId))
  ])
  const shardInputs = new Map<number, number[]>()
  for (const option of tierLists.flatMap(rows)) {
    const application = id(option.recipeId),
      shard = id(option.shardRecipeId)
    needed.add(application)
    needed.add(shard)
    shardInputs.set(application, [shard])
    if (Array.isArray(option.componentRecipeIds)) {
      const components = option.componentRecipeIds.map(id)
      for (const component of components) needed.add(component)
      shardInputs.set(shard, components)
    }
  }
  const baseShards = items.filter((item) => item.craftingRole === 'shard')
  const shardIds = new Set(baseShards.map((item) => id(item.id)))
  const craftedShards = new Map<number, Row>()
  const recipes = [...needed].map((recipeId) => {
    const recipe = byId.get(recipeId)
    if (!recipe) throw new Error('Missing Heroic Green Steel recipe ' + String(recipeId))
    const parts = rows(recipe.ingredients)
      .filter((part) => part.ingredientId !== undefined)
      .map((part) => ({
        ingredientId: id(part.ingredientId),
        quantity: id(part.quantity),
        producerRecipeId: byProduct.get(id(part.ingredientId))
      }))
    const inputs = shardInputs.get(recipeId)
    if (inputs) {
      for (const producerRecipeId of inputs) {
        const producer = byId.get(producerRecipeId)
        if (!producer) throw new Error('Missing Heroic Green Steel shard recipe ' + String(producerRecipeId))
        craftedShards.set(producerRecipeId, {
          id: producerRecipeId,
          name: producer.name,
          description: producer.description ?? ''
        })
        parts.push({ ingredientId: producerRecipeId, producerRecipeId, quantity: 1 })
      }
    } else if (recipe.keeper) {
      const keeper = id(record(recipe.keeper).itemId)
      if (!shardIds.has(keeper)) throw new Error('Unknown Heroic Green Steel shard ' + String(keeper))
      parts.push({ ingredientId: keeper, quantity: 1, producerRecipeId: undefined })
    }
    return { ...recipe, ingredients: parts }
  })
  return { ingredients: [...materials, ...baseShards, ...craftedShards.values()], recipes }
}
