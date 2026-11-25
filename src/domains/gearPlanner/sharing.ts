import LZString from 'lz-string'
import { createPermalinkChecksum } from '../../shared/serialization/checksum'
import { escapeBbCode, escapeMarkdown } from '../../shared/serialization/forumText'
import type { EssenceCraftingData } from '../essenceCrafting/essenceCrafting.types'
import { gearPlannerAugmentIdentity } from './augments'
import type { GearPlannerEffectSource } from './effects'
import { enabledOwners, ownerSlots, type GearOwner } from './character'
import type { GearPlannerData, GearPlannerEffect, GearPlannerItem } from './gearPlanner.types'
import {
  importGearPlannerState,
  parsePersistedGearPlannerState,
  restorePersistedGearPlannerState,
  serializeGearPlannerState,
  type PersistedGearPlannerSetupV1
} from './plannerStorage'
import { formatGearPlannerSetEffect, type GearPlannerSetState, type GearPlannerSetMembership } from './sets'
import {
  activeGearPlannerSetup,
  createGearPlannerSetupId,
  type GearPlannerSetup,
  type GearPlannerSetupsState
} from './setups'

// Storage IDs include the entire CDN augment record. Links only need its identity and a tie-breaker.
function compactAugmentId(id: string) {
  if (id.startsWith('augment:')) return id
  const split = id.lastIndexOf('|')
  return id.slice(0, split + 1) + createPermalinkChecksum(id.slice(split + 1))
}

function mapAugmentIds(setup: PersistedGearPlannerSetupV1, resolve: (id: string) => string) {
  return { ...setup, selectedAugments: setup.selectedAugments.map((a) => ({ ...a, augmentId: resolve(a.augmentId) })) }
}

function restoreSharedSetup(text: string, data: GearPlannerData, essence?: EssenceCraftingData) {
  const payload = parsePersistedGearPlannerState(JSON.parse(text), data)
  if (payload.setups.length !== 1) throw new Error('A Gear Planner permalink must contain one setup.')
  const known = new Map<string, string>()
  const unique = new Map<string, string | null>()
  for (const augment of data.augments) {
    const id = gearPlannerAugmentIdentity(augment)
    if (id.startsWith('augment:')) continue
    const key = id.slice(0, id.lastIndexOf('|'))
    unique.set(key, unique.has(key) ? null : id)
    known.set(compactAugmentId(id), id)
  }
  const setup = mapAugmentIds(
    payload.setups[0],
    (id) => known.get(id) ?? unique.get(id.slice(0, id.lastIndexOf('|'))) ?? id
  )
  return restorePersistedGearPlannerState({ ...payload, setups: [setup] }, data, essence)
}

export function gearPlannerPermalink(setup: GearPlannerSetup, href: string) {
  const payload = serializeGearPlannerState({ setups: [setup], activeSetupId: setup.id })
  const text = JSON.stringify({ ...payload, setups: [mapAugmentIds(payload.setups[0], compactAugmentId)] })
  const url = new URL(href)
  url.search = ''
  url.hash = new URLSearchParams({
    gp: `3.${createPermalinkChecksum(text)}.${LZString.compressToEncodedURIComponent(text)}`
  }).toString()
  return url.href
}

const legacyTupleKeys = [
  'slot',
  'itemName',
  'augments',
  'curseName',
  'essenceCrafting',
  'nearlyFinished',
  'ritualTable',
  'lostPurpose',
  'filigrees',
  'unlockedFiligreeSlots',
  'slottedGemSetBonuses',
  'itemMinLevel',
  'itemMaterial',
  'isFountainUpgraded',
  'isStormreaverUpgraded',
  'itemId',
  'isZhentarimUpgraded',
  'traceOfMadness',
  'almostThere',
  'finishingTouch'
]
const record = (x: unknown): x is Record<string, unknown> => x !== null && typeof x === 'object' && !Array.isArray(x)
function readLegacySetup(value: unknown): { meta: unknown; items: unknown; tuple: boolean } {
  if (Array.isArray(value)) {
    const tuple: readonly unknown[] = value
    const [name, minLevel, maxLevel, classes, weaponFilters, armorFilters, shieldFilters, allowMetalWithDruid, items] =
      tuple
    return {
      meta: { name, minLevel, maxLevel, classes, weaponFilters, armorFilters, shieldFilters, allowMetalWithDruid },
      items,
      tuple: true
    }
  }
  if (record(value) && value.version === 2) return { meta: value.setup, items: value.items, tuple: false }
  throw new Error('Invalid Gear Planner permalink.')
}

function parseLegacyItem(entry: unknown, tuple: boolean) {
  if (!tuple) return entry
  if (!Array.isArray(entry) || entry.length < 15) throw new Error('Invalid legacy Gear Planner item.')
  return Object.fromEntries(legacyTupleKeys.map((key, index) => [key, entry[index]]))
}

function selectionPairs(value: unknown) {
  if (
    !Array.isArray(value) ||
    !value.every(
      (pair: unknown) =>
        Array.isArray(pair) &&
        pair.length === 2 &&
        (typeof pair[0] === 'string' || typeof pair[0] === 'number') &&
        typeof pair[1] === 'string'
    )
  )
    throw new Error('Invalid selections in Gear Planner permalink.')
  return Object.fromEntries(value)
}

function legacyLinkSave(value: unknown) {
  const { meta, items, tuple } = readLegacySetup(value)
  if (!record(meta) || typeof meta.name !== 'string' || !Array.isArray(items))
    throw new Error('Invalid Gear Planner permalink.')
  const slots = Object.create(null) as Record<string, unknown>
  const maps: Record<string, Record<string, unknown>> = {}
  function put(key: string, id: string, v: unknown) {
    const selections = (maps[key] ??= Object.create(null) as Record<string, unknown>)
    selections[id] = v
  }
  for (const [i, entry] of items.entries()) {
    const row: unknown = parseLegacyItem(entry, tuple)
    if (
      !record(row) ||
      typeof row.slot !== 'string' ||
      typeof row.itemName !== 'string' ||
      Object.hasOwn(slots, row.slot)
    )
      throw new Error('Invalid item in Gear Planner permalink.')
    const id = typeof row.itemId === 'string' ? row.itemId : String(i)
    slots[row.slot] = { name: row.itemName, id, minLevel: row.itemMinLevel, material: row.itemMaterial }
    for (const [from, to] of [
      ['augments', 'slottedAugments'],
      ['essenceCrafting', 'slottedEssenceEnchantments']
    ]) {
      const pairs = row[from]
      if (pairs != null) put(to, id, selectionPairs(pairs))
    }
    put('slottedCurses', id, row.curseName)
    put('slottedFiligrees', id, row.filigrees)
    put('unlockedFiligreeSlots', id, row.unlockedFiligreeSlots)
    put('slottedGemSetBonuses', id, row.slottedGemSetBonuses)
    put('itemUpgrades', id, {
      ...row,
      fountainOfNecroticMight: !!row.isFountainUpgraded,
      stormreaverUpgrade: !!row.isStormreaverUpgraded,
      zhentarimAttuned: !!row.isZhentarimUpgraded
    })
  }
  return { setups: [{ ...meta, slots, ...maps }] }
}

export function openGearPlannerLink(
  encoded: string,
  current: GearPlannerSetupsState,
  data: GearPlannerData,
  essence?: EssenceCraftingData
) {
  let imported
  if (encoded.startsWith('3.')) {
    const [, checksum, code, extra] = encoded.split('.')
    if (extra !== undefined) throw new Error('Invalid Gear Planner permalink.')
    const payload = LZString.decompressFromEncodedURIComponent(code ?? '')
    if (!payload || createPermalinkChecksum(payload) !== checksum)
      throw new Error('Invalid or damaged Gear Planner permalink.')
    imported = restoreSharedSetup(payload, data, essence)
  } else {
    const legacy = LZString.decompressFromEncodedURIComponent(encoded)
    if (!legacy) throw new Error('Invalid Gear Planner permalink.')
    imported = importGearPlannerState(JSON.stringify(legacyLinkSave(JSON.parse(legacy))), data, essence)
  }
  const setup = { ...activeGearPlannerSetup(imported.state), id: createGearPlannerSetupId() }
  return { state: { activeSetupId: setup.id, setups: [...current.setups, setup] }, issues: imported.issues }
}

function formatSharedEffect(effect: GearPlannerEffect) {
  const label = formatGearPlannerSetEffect(effect)
  const notes = typeof effect.notes === 'string' ? effect.notes.trim() : ''
  return notes ? `${label} · ${notes}` : label
}

function craftDetails(
  setup: GearPlannerSetup,
  item: GearPlannerItem,
  itemEffects: readonly GearPlannerEffectSource[],
  memberships: readonly GearPlannerSetMembership[]
) {
  const details: string[] = []
  const essence = setup.essenceCrafting[item.id]
  if (essence?.material) details.push('Material: ' + essence.material)
  for (const craft of item.crafts ?? []) {
    if (craft.setName && memberships.some((m) => m.setName === craft.setName)) continue
    details.push(craft.system === 'mythic' ? 'Mythic Boost ' + craft.label : craft.label)
  }
  for (const stage of Object.keys(setup.reforging[item.id] ?? {})) {
    const choice = itemEffects.find((e) => e.reforgingStage === stage && e.reforgingChoiceLabel)?.reforgingChoiceLabel
    details.push('Reforging: ' + stage.replaceAll('-', ' ') + (choice ? ' · ' + choice : ''))
  }
  return details
}

function sharedItemDetails(
  setup: GearPlannerSetup,
  item: GearPlannerItem,
  effects: readonly GearPlannerEffectSource[],
  setState?: GearPlannerSetState
) {
  const memberships = setState?.memberships.filter((m) => m.itemId === item.id && m.category === 'equipped-item') ?? []

  const itemEffects = effects.filter((effect) => effect.itemId === item.id)
  const details = craftDetails(setup, item, itemEffects, memberships)
  for (const [index, aug] of Object.entries(setup.slottedAugments[item.id] ?? {}))
    details.push(`Augment ${String(Number(index) + 1)}: ${aug.name}`)
  const curse = setup.slottedCurses[item.id]
  if (curse) details.push('Curse: ' + curse.name)
  for (const [index, f] of Object.entries(setup.slottedFiligrees[item.id] ?? {}))
    details.push(`Filigree ${String(Number(index) + 1)}: ${f.name}`)
  for (const m of memberships) details.push('Set: ' + m.setName)
  for (const source of itemEffects) {
    const text = formatSharedEffect(source.effect)
    details.push(
      source.essenceEnhancementName
        ? `${source.essenceAffixPosition ?? 'Affix'} · ${source.essenceEnhancementName}: ${text}`
        : text
    )
  }
  return details
}
export type GearShareFormat = 'Discord Markdown' | 'Forum BBCode'
export function formatGearSetup(
  setup: GearPlannerSetup,
  effects: readonly GearPlannerEffectSource[],
  ownerSets: Partial<Record<GearOwner, GearPlannerSetState>>,
  format: GearShareFormat,
  permalink: string
) {
  const forum = format === 'Forum BBCode'
  const escapeMarkup = forum ? escapeBbCode : escapeMarkdown
  const escape = (text: string) => escapeMarkup(text.replaceAll(/[^\S\r\n]*—[^\S\r\n]*/g, ' - '))
  const heading = (text: string) => (forum ? `[b]${escape(text)}[/b]` : `**${escape(text)}**`)
  const lines = [
    heading(setup.name),
    `Level range: ${String(setup.minimumLevel)}–${String(setup.maximumLevel)}`,
    forum ? `[url=${permalink}]View on YourDDO[/url]` : `[View on YourDDO](${permalink})`
  ]
  if (setup.character.classes.length) lines.push('Classes: ' + setup.character.classes.map(escape).join(', '))
  for (const owner of enabledOwners(setup.character.classes)) {
    if (owner !== 'Character') lines.push('', heading(owner))
    const setState = ownerSets[owner]
    for (const slot of ownerSlots[owner]) {
      const item = setup.equipment[slot]
      if (!item) continue
      const essence = setup.essenceCrafting[item.id]
      lines.push(
        '',
        heading(slot) + ' · ' + escape(item.source.name) + ` (ML ${String(essence?.minimumLevel ?? item.minimumLevel)})`
      )
      const details = sharedItemDetails(setup, item, effects, setState)
      lines.push(...details.map((d) => (forum ? '• ' : '- ') + escape(d)))
    }
    const active = setState?.sets.flatMap((s) =>
      s.thresholds
        .filter((t) => t.isActive)
        .map((t) => `${s.name} (${String(t.threshold)}): ${t.effects.map(formatSharedEffect).join(', ')}`)
    )
    if (active?.length) lines.push('', heading('Active set bonuses'), ...active.map(escape))
  }
  return lines.join('\n')
}
