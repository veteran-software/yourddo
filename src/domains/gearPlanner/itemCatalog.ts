import { isVisibleEffect } from '../../shared/data/visibleEffect'
import { percentModifier } from './effectAmounts'
import { hasDatasetFile, loadDatasetFile } from '../../shared/data/loadDataset'
import {
  allGearPlannerSlots,
  type GearPlannerAugment,
  type GearPlannerEffect,
  type GearPlannerSlot,
  type GearPlannerSourceDataset,
  type GearPlannerFiligreeSetDefinition,
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

export function catalogItemType(nativeType: string) {
  return itemTypes[nativeType] ?? typeNames.get(nativeType.replaceAll(' ', '').toLowerCase()) ?? nativeType
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
    const stat = rows(record.enchantments ?? [], 'enchantments').find((enchantment) => enchantment.name === entry.stat)
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

function roundedModifier(modifier: string | number, calculationValue: number) {
  if (calculationValue === Number.parseFloat(String(modifier))) return { modifier }
  return { modifier, calculationValue, roundToNearest: true }
}

function coefficientModifier(stat: Row, value: number, source: EffectSource) {
  const property = typeof stat.name === 'string' ? stat.name : ''
  const scale = source === 'augment' && augmentPercentagePoints.has(property) ? 1 : 100
  const sign = stat.operation === 'Subtract' ? -1 : 1
  const amount = Math.round(Number((value * scale).toFixed(6))) * sign
  const power =
    property.startsWith('Spell_DamageMod_') || /^Weapon_DamageMod_(?:Melee|Ranged)WeaponPower$/.test(property)
  return roundedModifier(power ? amount : String(amount) + '%', value * scale * sign)
}

function statModifier(stat: Row, value: number, name: string, source: EffectSource) {
  if (stat.unit === 'multiplier') {
    const percent = Math.round(Number((value * 100).toFixed(10)))
    const remaining =
      stat.name === 'ActionAgent_CooldownModArray' ||
      stat.name === 'Character_RegenerationIntervalMultiplier_SmiteEvil' ||
      /\babsorption\b/i.test(name)
    if (remaining) return roundedModifier(String(100 - percent) + '%', (1 - value) * 100)
    return roundedModifier(String(percent) + '%', value * 100)
  }
  if (stat.unit === 'coefficient') return coefficientModifier(stat, value, source)
  if (stat.unit === 'percent') return percentModifier(value)
  if (stat.unit === 'points') {
    const modifier = Math.trunc(Number(value.toFixed(10)))
    return { modifier, ...(modifier !== value && { calculationValue: value }) }
  }
  if (stat.unit == null && implicitPercentRatios.has(String(stat.name))) return percentModifier(value * 100)
  return { modifier: value }
}

function equipmentBonuses(enchantments: Row[], source: EffectSource, notes?: string) {
  const stats: GearPlannerEffect[] = []
  for (const stat of enchantments) {
    if (
      !isVisibleEffect(stat) ||
      stat.internal ||
      typeof stat.displayName !== 'string' ||
      typeof stat.value !== 'number'
    )
      continue
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
    stats.push({
      name: stat.displayName,
      bonus: typeof stat.bonusType === 'string' ? stat.bonusType : undefined,
      ...statModifier(stat, stat.value, stat.displayName, source),
      notes
    })
  }
  return stats
}

function effectStats(effect: Row, source: EffectSource): GearPlannerEffect[] {
  const notes = typeof effect.description === 'string' ? effect.description : undefined
  const name = typeof effect.displayName === 'string' ? effect.displayName.trim() : ''
  const stats = equipmentBonuses(rows(effect.enchantments ?? [], 'enchantments'), source, notes)
  if (name && (!stats.length || (Array.isArray(effect.procs) && effect.procs.length))) stats.push({ name, notes })
  const discrepancies = discrepancyNotes(effect, source)
  if (stats.length && discrepancies.length) stats[0].discrepancyNotes = discrepancies
  return stats
}

function indexedEffects<T>(
  effects: unknown,
  adapt: (record: Row) => T,
  visible: (record: Row) => boolean = isVisibleEffect
) {
  const index = new Map<string, T | null>()
  for (const effect of rows(effects, 'effects')) {
    const key = String(id(effect.id, 'effect'))
    const variants = rows(effect.variants ?? [], 'variants')
    if (effect.variants === undefined || effect.enchantments !== undefined)
      index.set(key, visible(effect) ? adapt(effect) : null)
    for (const variant of variants)
      index.set(
        key + '/' + text(variant.variant, 'effect variant'),
        visible(effect) && visible(variant) ? adapt(variant) : null
      )
  }
  return index
}

export function effectIndex(effects: unknown, source: EffectSource = 'equipment') {
  return indexedEffects(effects, (effect) => effectStats(effect, source))
}

function referencedEffect<T>(index: ReadonlyMap<string, T | null>, ref: Row, name: string) {
  const key = String(id(ref.effectId, name)) + (ref.variant === undefined ? '' : '/' + text(ref.variant, name))
  const resolved = index.get(key)
  if (resolved === undefined) throw new Error('Missing effect ' + key + ' for ' + name)
  return resolved
}

const publicRecord = (record: Row) => isVisibleEffect(record) && record.internal !== true

function scopedEnchantmentRows(effect: Row): GearPlannerEffect[] {
  return rows(effect.enchantments ?? [], 'augment enchantments').flatMap((stat) => {
    if (!publicRecord(stat) || stat.bonusType === 'Condition' || stat.type === 'script' || stat.type === 'condition')
      return []
    const nested = stat.type === 'grantedFeat' ? scopedEnchantmentRows(stat) : []
    if (typeof stat.displayName !== 'string') return nested
    const name = stat.displayName
    const hasAmount = typeof stat.value === 'number'
    return [
      {
        name,
        bonus: typeof stat.bonusType === 'string' ? stat.bonusType : undefined,
        ...(typeof stat.value === 'number' && statModifier(stat, stat.value, name, 'augment')),
        ...(typeof stat.value === 'boolean' && { modifier: stat.value ? 'Yes' : 'No' }),
        ...(Array.isArray(stat.attackForms) && {
          attackForms: stat.attackForms.map((form) => text(form, 'attack form'))
        }),
        ...(stat.conditionalBonus ||
        stat.requiresActiveBlocking ||
        stat.targetEligibility ||
        stat.weaponType ||
        (!hasAmount && stat.value !== true && stat.type !== 'grantedFeat')
          ? { displayOnly: true }
          : {})
      },
      ...nested
    ]
  })
}

export function scopedAugmentReader(effects: unknown, names: readonly string[]) {
  const labels = new Set(names)
  const index = indexedEffects(
    effects,
    (effect) => {
      const stats = scopedEnchantmentRows(effect)
      const discrepancies = discrepancyNotes(effect, 'augment')
      if (stats.length && discrepancies.length) stats[0].discrepancyNotes = discrepancies
      return { name: typeof effect.displayName === 'string' ? effect.displayName : '', rows: stats }
    },
    publicRecord
  )
  return (item: Row) => {
    const refs = rows(item.effects ?? [], 'augment effects')
    const visible = publicRecord(item)
    const presentation = []
    const effectsAdded: GearPlannerEffect[] = []
    const searchLabels = new Set<string>()
    for (const ref of visible ? refs.filter(publicRecord) : []) {
      const group = referencedEffect(index, ref, String(item.name))
      if (!group) continue
      if (group.name || group.rows.length) presentation.push(group)
      for (const label of [group.name, ...group.rows.map((stat) => stat.name)])
        if (labels.has(label)) searchLabels.add(label)
      if (
        ref.activation === 'Augment_OnEquipEffects' ||
        ref.activation === 'Augment_OnSlottedEffects' ||
        ref.activation === undefined
      )
        effectsAdded.push(...group.rows.filter((stat) => !stat.displayOnly))
    }
    return {
      presentation,
      effectsAdded,
      searchLabels: [...searchLabels],
      ...(visible && !refs.length && typeof item.description === 'string' && { fallbackDescription: item.description })
    }
  }
}

// Some rune arm sockets only publish a type code that also occurs on named sockets.
const socketNames: Record<string, string> = {
  Lamordia_Armor_Prefix: 'Lamordia: Melancholic Slot (Armor)',
  Lamordia_Weapon_Prefix: 'Lamordia: Melancholic Slot (Weapon)',
  Lamordia_Weapon_Suffix: 'Lamordia: Dolorous Slot (Weapon)'
}
export function catalogSocket(slot: Row) {
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

function chargeLabel(charges: unknown) {
  if (typeof charges !== 'number') return ''
  return ' (' + String(charges) + (charges === 1 ? ' charge)' : ' charges)')
}

export function spellIndex(value: unknown) {
  const index = new Map<string, GearPlannerEffect>()
  for (const spell of rows(value, 'spells')) {
    const key = String(id(spell.id, 'spell'))
    const name = 'Cast ' + text(spell.name, key)
    const variants = rows(spell.variants ?? [], name)
    for (const entry of [spell, ...variants]) {
      const charges = entry.charges ?? spell.charges
      const suffix = chargeLabel(charges)
      index.set(entry === spell ? key : key + '/' + text(entry.variant, name), {
        name: name + suffix,
        notes: typeof spell.description === 'string' ? spell.description : undefined
      })
    }
  }
  return index
}

export function resolveEffects(
  item: Row,
  name: string,
  index: ReadonlyMap<string, GearPlannerEffect[] | null>,
  spells: ReadonlyMap<string, GearPlannerEffect>,
  fallbackDescription?: unknown
) {
  const enchantments = rows(item.effects ?? [], name).flatMap((ref) => {
    const resolved = referencedEffect(index, ref, name)
    if (resolved === null || !isVisibleEffect(ref)) return []
    if (!resolved.length && fallbackDescription !== undefined) return [{ name: text(fallbackDescription, name) }]
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

function readBlockedSlots(stats: Row, name: string) {
  const blockedSlots = stats.blockedEquipSlots ?? []
  if (!Array.isArray(blockedSlots) || !blockedSlots.every((key: unknown) => typeof key === 'string'))
    throw new Error('Invalid blocked slots for ' + name)
  return blockedSlots
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
    const type = catalogItemType(nativeType)
    const stem = type.replaceAll(' ', '').replace(/^./, (first) => first.toLowerCase())
    const fileName = (type === 'Cloth Armor' ? 'cloth' : stem) + '.json'
    const records = datasets.get(fileName) ?? []
    const blockedSlots = readBlockedSlots(stats, name)
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
      ...(item.isMinorArtifact === true && { artifactType: 'Minor' }),
      material: typeof stats.material === 'string' ? stats.material : undefined,
      binding: binding ? { to: String(binding.scope), type: String(binding.on) } : undefined,
      acceptsSentience: stats.acceptsSentience === true,
      blockedSlots,
      iconLayers: layers,
      enchantments,
      augments: rows(item.augmentSlots ?? [], name).map(catalogSocket),
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
  const [iconData, spellData, names] = await Promise.all([read('icons'), read('spells'), read('enchantment-names')])
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
  const aliases = new Map(
    Object.entries(row(manifest.enchantmentNameAliases ?? {}, 'enchantment aliases')).map(
      ([alias, canonical]) => [alias.toLowerCase(), text(canonical, 'canonical enchantment name')] as const
    )
  )
  return { datasets, aliases, enchantmentNames: enchantmentLabels(names) }
}

function setDiscrepancies(set?: GearPlannerFiligreeSetDefinition) {
  if (!set) return []
  return set.thresholds.flatMap((tier) =>
    tier.effects.flatMap((effect) =>
      (effect.discrepancyNotes ?? []).map((note) => set.name + ' (' + String(tier.threshold) + '-piece): ' + note)
    )
  )
}

function enchantmentLabels(value: unknown): string[] {
  if (!Array.isArray(value)) throw new Error('Invalid enchantment name list')
  return value.map((label) => text(label, 'enchantment label'))
}

const scopedGroups = ['standard', 'moon', 'sun']

// Gear Planner and its embedded crafting editor request the same release files concurrently.
const pendingAugmentFiles = new Map<string, Promise<unknown>>()
function augmentFile(path: string) {
  const cached = pendingAugmentFiles.get(path)
  if (cached) return cached
  const pending = loadDatasetFile<unknown>('items/augments/' + path).finally(() => pendingAugmentFiles.delete(path))
  pendingAugmentFiles.set(path, pending)
  return pending
}

async function augmentResources() {
  const manifest = row(await augmentFile('manifest.json'), 'augment manifest')
  const resources = row(manifest.resources, 'augment resources')
  return { resources, read: (key: string) => augmentFile(text(resources[key], key)) }
}

function socketItem(item: Row) {
  const name = text(item.name, 'augment')
  if (!Array.isArray(item.slotTypes) || !item.slotTypes.length) throw new Error('Missing slot types for ' + name)
  return {
    id: id(item.id, name),
    name,
    slotTypes: item.slotTypes.map((code: unknown) => text(code, name)),
    minimumLevel: id(item.minimumLevel, name)
  }
}

export async function loadScopedAugmentCatalog() {
  if (!(await hasDatasetFile('items/augments/manifest.json'))) return undefined
  const { read, resources } = await augmentResources()
  if (!resources['enchantment-names']) return undefined
  const [labels, effects, ...groups] = await Promise.all(['enchantment-names', 'effects', ...scopedGroups].map(read))
  const names = enchantmentLabels(labels)
  const scoped = scopedAugmentReader(effects, names)
  const entries = groups.flatMap((group) =>
    rows(group, 'augments')
      .filter(publicRecord)
      .map((item) => ({
        ...socketItem(item),
        ...scoped(item)
      }))
  )
  return { names, entries }
}

export async function loadSocketCatalog() {
  const { read, resources } = await augmentResources()
  const groupNames = [...scopedGroups, 'dinosaur-bone', 'lamordia', 'legendary-green-steel']
  const [exportedLabels, effectData, spellData, sets, filigreeData, ...groups] = await Promise.all([
    resources['enchantment-names'] ? read('enchantment-names') : undefined,
    ...['effects', 'spells', 'sets', 'filigrees', ...groupNames].map(read)
  ])
  const names = exportedLabels === undefined ? undefined : enchantmentLabels(exportedLabels)
  const scoped = names && scopedAugmentReader(effectData, names)
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
            const effects = resolveEffects({ effects: [tier.effect] }, name, index, spells, tier.description)
            return {
              threshold: id(tier.pieces, name),
              effects
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
    enchantmentNames: names,
    filigreeDefinitions: [...definitions].filter(([key]) => filigreeSets.has(key)).map(([, set]) => set),
    equipmentDefinitions: [...definitions].filter(([key]) => !filigreeSets.has(key)).map(([, set]) => set),
    augments(datasets: readonly GearPlannerSourceDataset[]): GearPlannerAugment[] {
      const labels = new Map<string, string>()
      for (const { records } of datasets)
        for (const item of records)
          for (const slot of item.augments ?? []) {
            if (slot.slotTypes?.length === 1) labels.set(slot.slotTypes[0], slot.augmentType)
          }
      return groups.flatMap((group, i) =>
        rows(group, 'augments')
          .filter((item) => !scopedGroups.includes(groupNames[i]) || publicRecord(item))
          .map((item) => {
            const { name, slotTypes, minimumLevel } = socketItem(item)
            const override = item.hostSetOverride ? row(item.hostSetOverride, name) : undefined
            const details = scoped && scopedGroups.includes(groupNames[i]) ? scoped(item) : undefined
            const effectsAdded = details?.effectsAdded ?? resolveEffects(item, name, index, spells)
            const set = override ? definitions.get(id(override.primarySetId, name)) : undefined
            const discrepancy = [...new Set([...itemDiscrepancies(item, effectsAdded), ...setDiscrepancies(set)])]
            return {
              name,
              augmentType: slotTypes.map((code) => labels.get(code) ?? code).join(' / '),
              slotTypes,
              minLevel: minimumLevel,
              ...details,
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
    const equippedEffects = source.equippedEffectIds.map((key: unknown) => {
      const resolved = index.get(String(id(key, name)))
      if (resolved === undefined) throw new Error('Missing equipped effect for ' + name)
      return resolved
    })
    const enchantments = equippedEffects.flatMap((resolved) => resolved ?? [])
    if (!enchantments.length && (!equippedEffects.length || equippedEffects.some((resolved) => resolved !== null))) {
      enchantments.push({ name, notes: text(source.description, name) })
    }
    return {
      id: name,
      discrepancyNotes: itemDiscrepancies(source, enchantments),
      name,
      type,
      source,
      enchantments
    }
  })
}
