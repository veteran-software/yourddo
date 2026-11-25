import { percentModifier } from './effectAmounts'
import { loadDatasetFile } from '../../shared/data/loadDataset'
import {
  allGearPlannerSlots,
  type GearPlannerAugment,
  type GearPlannerEffect,
  type GearPlannerSlot,
  type GearPlannerSourceDataset,
  type GearPlannerSourceItem
} from './gearPlanner.types'
import { gearPlannerItemSources } from './sourceMapping'

type Row = Record<string, unknown>

function row(value: unknown, context: string): Row {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid item catalog record: ' + context)
  return value as Row
}

function rows(value: unknown, context: string): Row[] {
  if (!Array.isArray(value)) throw new Error('Invalid item catalog list: ' + context)
  return value.map((entry: unknown) => row(entry, context))
}

function text(value: unknown, context: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Missing item catalog ' + context)
  return value
}

function id(value: unknown, context: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) throw new Error('Invalid item catalog ID: ' + context)
  return value
}

// Keep the vocabulary used by character proficiency filters and two-handed weapon rules.
const typeNames = new Map(
  Object.keys(gearPlannerItemSources).map((file) => {
    const stem = file.replace('.json', '')
    const name = stem.replaceAll(/([A-Z])/g, ' $1').replace(/^./, (first) => first.toUpperCase())
    return [stem.toLowerCase(), name]
  })
)
const itemTypes: Record<string, string> = {
  Cloth: 'Cloth Armor',
  Feet: 'Boots',
  Hands: 'Gloves',
  Head: 'Helmet',
  Waist: 'Belt',
  Wrists: 'Bracers',
  Eyes: 'Goggles',
  Neck: 'Necklace',
  'Pet Collar': 'Collar',
  Weapon1: 'Weapon'
}

const slotNames = new Map<string, GearPlannerSlot>(allGearPlannerSlots.map((slot) => [slot, slot]))
for (const [native, slot] of Object.entries({
  Finger1: 'First Finger',
  Finger2: 'Second Finger',
  Weapon1: 'Main Hand',
  Weapon2: 'Off Hand',
  Runearm: 'Off Hand'
} as const))
  slotNames.set(native, slot)

function plannerSlots(stats: Row, type: string): GearPlannerSlot[] {
  if (!Array.isArray(stats.equipSlots)) throw new Error('Missing item catalog equip slots')
  const slots = new Set<GearPlannerSlot>()
  for (const key of stats.equipSlots) {
    const slot = slotNames.get(String(key))
    if (slot) slots.add(slot)
    if (key === 'PetUpgrade') {
      slots.add('Iron Defender Weapon')
      slots.add('Wolf Companion Weapon')
    }
    if (key === 'PetEquipment' && type !== 'Collar') {
      if (type === 'Docent') slots.add('Iron Defender Armor')
      slots.add('Wolf Companion Armor')
    }
  }
  if (!slots.size) throw new Error('Unrecognized item slots: ' + stats.equipSlots.join(', '))
  return [...slots]
}

type EffectSource = 'equipment' | 'augment' | 'curse'

// The augment effect table stores these four properties in percentage points.
const augmentPercentagePoints = new Set([
  'Combat_Ranged_fExtraShotProcChance',
  'Combat.Melee@Player::m_fDoubleStrikeProcChance',
  'Effect_Armor_Class_Adjustment',
  'Feat_ArmorPiercing'
])

const implicitPercentRatios = new Set([
  'Effect_SpellCostMultiplier',
  'Spell_SpellFailureChance',
  'Combat_WeaponProcThreatMultiplier',
  'Spell_CritMod',
  'Effect_Webstore_XPMultiplier',
  'Combat_BypassDodgePercentage',
  'Effect_PirateFestival_DoubloonBonus',
  'Combat_MissileChanceToReturn'
])

function discrepancyNotes(record: Row, source?: EffectSource): string[] {
  return rows(record.knownDiscrepancies ?? [], 'known discrepancies').map((entry) => {
    const stat = rows(record.enchantments ?? [], 'enchantments').find((stat) => stat.name === entry.stat)
    const name = String(entry.statDisplayName ?? stat?.displayName ?? entry.stat)
    const field = entry.field === 'displayName' ? 'name' : 'description'
    const format = (value: unknown) =>
      String(value) + (typeof value === 'number' && entry.unit === 'percent' ? '%' : '')
    // The discrepancy feed also scales percentage-point coefficients by 100.
    const actual =
      source === 'augment' && stat?.unit === 'coefficient' && augmentPercentagePoints.has(String(stat.name))
        ? stat.value
        : entry.mechanical
    const stated = entry.stated === 'omitted' ? 'omits this stat' : 'lists ' + format(entry.stated)
    const applied =
      actual === 'unverified' ? 'The in-game value is unverified.' : 'The in-game value is ' + format(actual) + '.'
    return name + '. The ' + field + ' ' + stated + '. ' + applied
  })
}

function itemDiscrepancies(item: Row, effects: readonly GearPlannerEffect[]) {
  return [...new Set([...discrepancyNotes(item), ...effects.flatMap((effect) => effect.discrepancyNotes ?? [])])]
}

function effectStats(effect: Row, source: EffectSource): GearPlannerEffect[] {
  if (effect.hidden && source === 'equipment') return []
  const notes = typeof effect.description === 'string' ? effect.description : undefined
  const name = typeof effect.displayName === 'string' ? effect.displayName.trim() : ''
  const stats: GearPlannerEffect[] = []
  for (const stat of rows(effect.enchantments ?? [], 'enchantments')) {
    if (stat.internal || typeof stat.displayName !== 'string' || typeof stat.value !== 'number') continue
    // Conditional and derived values cannot be counted as always-on equipment bonuses.
    if (
      stat.conditionalBonus ||
      stat.sourceStat ||
      stat.targetEligibility ||
      stat.requiresActiveBlocking ||
      stat.weaponType ||
      stat.attackForms
    )
      continue
    let calculationValue: number | undefined
    let modifier: number | string = stat.value
    if (stat.unit === 'multiplier') {
      const percent = Math.round(Number((stat.value * 100).toFixed(10)))
      const remainingFraction =
        stat.name === 'ActionAgent_CooldownModArray' ||
        stat.name === 'Character_RegenerationIntervalMultiplier_SmiteEvil' ||
        /\babsorption\b/i.test(stat.displayName)
      calculationValue = remainingFraction ? (1 - stat.value) * 100 : stat.value * 100
      modifier = String(remainingFraction ? 100 - percent : percent) + '%'
    } else if (stat.unit === 'coefficient') {
      const property = typeof stat.name === 'string' ? stat.name : ''
      const scale = source === 'augment' && augmentPercentagePoints.has(property) ? 1 : 100
      const amount = Math.round(Number((stat.value * scale).toFixed(6))) * (stat.operation === 'Subtract' ? -1 : 1)
      calculationValue = stat.value * scale * (stat.operation === 'Subtract' ? -1 : 1)
      const power =
        property.startsWith('Spell_DamageMod_') || /^Weapon_DamageMod_(?:Melee|Ranged)WeaponPower$/.test(property)
      modifier = power ? amount : String(amount) + '%'
    } else if (stat.unit === 'percent' || (stat.unit == null && implicitPercentRatios.has(String(stat.name)))) {
      const points = stat.unit === 'percent' ? stat.value : stat.value * 100
      const display = percentModifier(points)
      modifier = display.modifier
      calculationValue = display.calculationValue
    }
    stats.push({
      name: stat.displayName,
      bonus: typeof stat.bonusType === 'string' ? stat.bonusType : undefined,
      modifier,
      ...(calculationValue !== undefined &&
        calculationValue !== Number.parseFloat(String(modifier)) && {
          calculationValue,
          ...((stat.unit === 'coefficient' || stat.unit === 'multiplier') && { roundToNearest: true })
        }),
      notes
    })
  }
  if (name && (!stats.length || (Array.isArray(effect.procs) && effect.procs.length))) stats.push({ name, notes })
  const discrepancies = discrepancyNotes(effect, source)
  if (stats.length && discrepancies.length) stats[0].discrepancyNotes = discrepancies
  return stats
}

function effectIndex(effects: unknown, source: EffectSource = 'equipment') {
  const index = new Map<string, GearPlannerEffect[]>()
  for (const effect of rows(effects, 'effects')) {
    const key = String(id(effect.id, 'effect'))
    if (effect.variants === undefined) index.set(key, effectStats(effect, source))
    else
      for (const variant of rows(effect.variants, 'variants')) {
        index.set(key + '/' + text(variant.variant, 'effect variant'), effectStats(variant, source))
      }
  }
  return index
}

// Some rune arm sockets only publish a type code that also occurs on named sockets.
const socketNames: Record<string, string> = {
  Lamordia_Armor_Prefix: 'Lamordia: Melancholic Slot (Armor)',
  Lamordia_Weapon_Prefix: 'Lamordia: Melancholic Slot (Weapon)',
  Lamordia_Weapon_Suffix: 'Lamordia: Dolorous Slot (Weapon)'
}
function socket(slot: Row) {
  const code = Array.isArray(slot.types) ? slot.types.join(' / ') : ''
  const name = (typeof slot.name === 'string' && slot.name) || socketNames[code] || 'Unknown socket'
  let augmentType = name.replace(' Augment Slot', '').replace(/ Slot\b/, '')
  if (
    /^(Isle of Dread|Lamordia):/.test(augmentType) &&
    !augmentType.includes('(') &&
    !augmentType.endsWith('Set Bonus')
  ) {
    augmentType += ' (Accessory)'
  }
  return { name, augmentType, slotTypes: Array.isArray(slot.types) ? slot.types.map(String) : [] }
}

function spellIndex(value: unknown) {
  const index = new Map<string, GearPlannerEffect>()
  for (const spell of rows(value, 'spells')) {
    const key = String(id(spell.id, 'spell'))
    const name = 'Cast ' + text(spell.name, key)
    const variants = rows(spell.variants ?? [], name)
    for (const entry of [spell, ...variants]) {
      const charges = entry.charges ?? spell.charges
      const suffix =
        typeof charges === 'number' ? ' (' + String(charges) + (charges === 1 ? ' charge)' : ' charges)') : ''
      index.set(entry === spell ? key : key + '/' + text(entry.variant, name), {
        name: name + suffix,
        notes: typeof spell.description === 'string' ? spell.description : undefined
      })
    }
  }
  return index
}

function resolveEffects(
  item: Row,
  name: string,
  index: ReadonlyMap<string, GearPlannerEffect[]>,
  spells: ReadonlyMap<string, GearPlannerEffect>
) {
  const enchantments = rows(item.effects ?? [], name).flatMap((ref) => {
    const key = String(id(ref.effectId, name)) + (ref.variant === undefined ? '' : '/' + text(ref.variant, name))
    const resolved = index.get(key)
    if (!resolved) throw new Error('Missing effect ' + key + ' for ' + name)
    return resolved
  })
  if (item.spell !== undefined) {
    const ref = row(item.spell, name)
    const key = String(id(ref.spellId, name)) + (ref.variant === undefined ? '' : '/' + text(ref.variant, name))
    const spell = spells.get(key)
    if (!spell) throw new Error('Missing spell ' + key + ' for ' + name)
    enchantments.push(spell)
  }
  return enchantments
}

export function adaptItemCategory(
  items: unknown,
  effects: unknown,
  icons: ReadonlyMap<number, string>,
  spells: ReadonlyMap<string, GearPlannerEffect>
): GearPlannerSourceDataset[] {
  const index = effectIndex(effects)
  const datasets = new Map<string, GearPlannerSourceItem[]>()
  for (const item of rows(items, 'items')) {
    const name = text(item.name, 'name')
    const stats = row(item.baseStats, name)
    const nativeType = text(item.itemType, name)
    const type = itemTypes[nativeType] ?? typeNames.get(nativeType.replaceAll(' ', '').toLowerCase()) ?? nativeType
    const stem = type.replaceAll(' ', '').replace(/^./, (first) => first.toLowerCase())
    const fileName = (type === 'Cloth Armor' ? 'cloth' : stem) + '.json'
    const records = datasets.get(fileName) ?? []
    const blockedSlots = stats.blockedEquipSlots ?? []
    if (!Array.isArray(blockedSlots) || !blockedSlots.every((key: unknown) => typeof key === 'string'))
      throw new Error('Invalid blocked slots for ' + name)
    const enchantments = resolveEffects(item, name, index, spells)
    if (item.minimumLevel !== undefined && !Number.isSafeInteger(item.minimumLevel))
      throw new Error('Invalid minimum level for ' + name)
    const layers = rows(item.iconLayers, name)
      .sort((a, b) => Number(a.order) - Number(b.order))
      .flatMap((layer) => icons.get(id(layer.iconId, name)) ?? [])
    const binding = stats.binding === undefined ? undefined : row(stats.binding, name)
    records.push({
      catalogId: id(item.id, name),
      catalogSlots: plannerSlots(stats, type),
      discrepancyNotes: itemDiscrepancies(item, enchantments),
      name,
      type,
      minLevel: typeof item.minimumLevel === 'number' ? item.minimumLevel : 1,
      description: item.description,
      baseStats: stats,
      damageOutcomes: item.damageOutcomes,
      tier: item.tier,
      isRaidItem: item.isRaidItem,
      exclusive: item.Exclusive,
      material: typeof stats.material === 'string' ? stats.material : undefined,
      binding: binding ? { to: String(binding.scope), type: String(binding.on) } : undefined,
      acceptsSentience: stats.acceptsSentience === true,
      blockedSlots,
      iconLayers: layers,
      enchantments,
      augments: rows(item.augmentSlots ?? [], name).map(socket),
      setBonus: rows(item.equipmentSets ?? [], name).map((set) => ({
        id: id(set.id, name),
        name: text(set.name, name)
      }))
    })
    datasets.set(fileName, records)
  }
  return [...datasets].map(([fileName, records]) => ({ fileName, records }))
}

export async function loadItemCatalog() {
  const manifest = row(await loadDatasetFile<unknown>('items/manifest.json'), 'manifest')
  if (manifest.system !== 'items') throw new Error('Invalid equipment catalog manifest')
  const resources = row(manifest.resources, 'resources')
  const categories = Object.entries(row(manifest.categoryEffects, 'categoryEffects'))
  if (!categories.length) throw new Error('The equipment catalog has no categories')
  const read = (key: string) => {
    const path = text(resources[key], key)
    if (!/^[\w/-]+(?:\.[\w-]+)*\.json$/.test(path) || path.startsWith('/'))
      throw new Error('Invalid item resource: ' + path)
    return loadDatasetFile<unknown>('items/' + path)
  }
  const [iconData, spellData] = await Promise.all([read('icons'), read('spells')])
  const spells = spellIndex(spellData)
  const icons = new Map(
    rows(iconData, 'icons').map((icon) => [
      id(icon.id, 'icon'),
      'data:image/png;base64,' + text(icon.pngBase64, 'icon image')
    ])
  )
  const groups = await Promise.all(
    categories.map(async ([key, effectsKey]) => {
      const [items, effects] = await Promise.all([read(key), read(text(effectsKey, key))])
      return adaptItemCategory(items, effects, icons, spells)
    })
  )
  const datasets = groups.flat()
  const seen = new Set<number>()
  for (const { records } of datasets) {
    for (const { catalogId } of records) {
      if (catalogId === undefined || seen.has(catalogId))
        throw new Error('Duplicate or missing equipment ID: ' + String(catalogId))
      seen.add(catalogId)
    }
  }
  return datasets
}

export async function loadSocketCatalog() {
  const read = (key: string) => loadDatasetFile<unknown>('items/augments/' + key + '.json')
  const [effectData, spellData, sets, filigreeData, ...groups] = await Promise.all(
    [
      'effects',
      'spells',
      'sets',
      'filigrees',
      'standard',
      'dinosaur-bone',
      'lamordia',
      'legendary-green-steel',
      'moon',
      'sun'
    ].map(read)
  )
  const index = effectIndex(effectData, 'augment')
  const spells = spellIndex(spellData)
  const definitions = new Map(
    rows(sets, 'augment sets').map((set) => {
      const name = text(set.name, 'set name')
      return [
        id(set.id, name),
        {
          name,
          source: set,
          thresholds: rows(set.thresholds, name).map((tier) => {
            const effects = resolveEffects({ effects: [tier.effect] }, name, index, spells)
            return {
              threshold: id(tier.pieces, name),
              effects: effects.length ? effects : [{ name: text(tier.description, name) }]
            }
          })
        }
      ]
    })
  )
  function setName(key: unknown) {
    const set = definitions.get(id(key, 'set reference'))
    if (!set) throw new Error('Missing augment set ' + String(key))
    return set.name
  }
  const filigreeSets = new Set<number>()
  const filigrees = rows(filigreeData, 'filigrees').map((item) => {
    const name = text(item.name, 'filigree')
    if (!Array.isArray(item.filigreeSetIds)) throw new Error('Missing filigree sets for ' + name)
    const grouping = item.filigreeSetIds
      .map((key: unknown) => {
        filigreeSets.add(id(key, name))
        return setName(key)
      })
      .join('/')
    return {
      ...item,
      name,
      catalogId: id(item.id, name),
      minLevel: id(item.minimumLevel, name),
      grouping,
      enchantments: resolveEffects(item, name, index, spells)
    }
  })
  return {
    filigrees,
    filigreeDefinitions: [...definitions].filter(([key]) => filigreeSets.has(key)).map(([, set]) => set),
    equipmentDefinitions: [...definitions].filter(([key]) => !filigreeSets.has(key)).map(([, set]) => set),
    augments(datasets: readonly GearPlannerSourceDataset[]): GearPlannerAugment[] {
      const labels = new Map<string, string>()
      for (const { records } of datasets)
        for (const item of records)
          for (const slot of item.augments ?? []) {
            if (slot.slotTypes?.length === 1) labels.set(slot.slotTypes[0], slot.augmentType)
          }
      return groups.flatMap((group) =>
        rows(group, 'augments').map((item) => {
          const name = text(item.name, 'augment')
          if (!Array.isArray(item.slotTypes) || !item.slotTypes.length)
            throw new Error('Missing slot types for ' + name)
          const slotTypes = item.slotTypes.map((code: unknown) => text(code, name))
          const override = item.hostSetOverride ? row(item.hostSetOverride, name) : undefined
          const effectsAdded = resolveEffects(item, name, index, spells)
          const set = override ? definitions.get(id(override.primarySetId, name)) : undefined
          const discrepancy = [
            ...new Set([
              ...itemDiscrepancies(item, effectsAdded),
              ...(set?.thresholds.flatMap((tier) =>
                tier.effects.flatMap((effect) =>
                  (effect.discrepancyNotes ?? []).map(
                    (note) => set.name + ' (' + String(tier.threshold) + '-piece): ' + note
                  )
                )
              ) ?? [])
            ])
          ]
          return {
            name,
            augmentType: slotTypes.map((code) => labels.get(code) ?? code).join(' / '),
            slotTypes,
            minLevel: id(item.minimumLevel, name),
            effectsAdded,
            discrepancyNotes: discrepancy,
            source: item,
            ...(override
              ? {
                  setBonus: [{ name: setName(override.primarySetId) }],
                  clearSecondarySet: override.clearSecondarySet === true
                }
              : {})
          }
        })
      )
    }
  }
}

export async function loadCatalogCurses() {
  const [items, effects, tables] = await Promise.all(
    ['curses', 'effects', 'draw-tables'].map((key) => loadDatasetFile<unknown>('deck-of-many-curses/' + key + '.json'))
  )
  const index = effectIndex(effects, 'curse')
  const types = new Map(
    rows(tables, 'curse draw tables').map((table) => [
      id(table.id, 'table'),
      text(table.name, 'table').replace(/^Deck of Many Curses: (.+) Table$/, '$1')
    ])
  )
  return rows(items, 'curses').map((source) => {
    const name = text(source.name, 'curse')
    const type = types.get(id(source.drawTableId, name))
    if (!type || !Array.isArray(source.equippedEffectIds)) throw new Error('Invalid curse ' + name)
    const enchantments = source.equippedEffectIds.flatMap((key: unknown) => {
      const resolved = index.get(String(id(key, name)))
      if (!resolved) throw new Error('Missing equipped effect for ' + name)
      return resolved
    })
    return {
      id: name,
      discrepancyNotes: itemDiscrepancies(source, enchantments),
      name,
      type,
      source,
      enchantments: enchantments.length ? enchantments : [{ name, notes: text(source.description, name) }]
    }
  })
}
