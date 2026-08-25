import { createPermalinkChecksum } from '../../shared/serialization/checksum.ts'
import { escapeBbCode, escapeMarkdown } from '../../shared/serialization/forumText.ts'
import { decodeStableId, encodeStableId } from '../../shared/serialization/stableId.ts'
import type {
  HgsInitialData,
  HgsSelection,
  HgsTier2Data,
  HgsTier3Data,
  HgsTier3Mode,
  HgsValidCombination
} from './heroicGreenSteel.types.ts'
import { isHgsSelectionCompatible, resolveEffects, resolveSpell, stripDdoMarkup } from './logic.ts'

export const HGS_JSON_SCHEMA = 'yourddo-hgs'
export const HGS_JSON_VERSION = 1
export const HGS_JSON_FILENAME = 'yourddo-hgs-build.json'
export const HGS_PERMALINK_QUERY_PARAMETER = 'build'

export type CanonicalHgsBuildSnapshot = HgsSelection

export interface HgsJsonBuildV1 {
  schema: typeof HGS_JSON_SCHEMA
  version: typeof HGS_JSON_VERSION
  baseItemId: string | null
  desiredSpellId: string | null
  tier1Id: string | null
  tier2Id: string | null
  tier3Mode: HgsTier3Mode | null
  tier3Id: string | null
}

export class InvalidHgsBuildError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidHgsBuildError'
  }
}

interface HgsValidationData {
  initial: HgsInitialData
  tier2: HgsTier2Data
  tier3: HgsTier3Data
  combinations: readonly HgsValidCombination[]
}

const snapshotFromSelection = (selection: HgsSelection): CanonicalHgsBuildSnapshot => ({ ...selection })

const toEncodedId = (value: number | null): string | null => (value === null ? null : encodeStableId(value))
const fromEncodedId = (value: unknown, field: string): number | null => {
  if (value === null) return null
  if (typeof value !== 'string') throw new InvalidHgsBuildError(`${field} must be a base36 ID or null`)
  try {
    return decodeStableId(value)
  } catch {
    throw new InvalidHgsBuildError(`Invalid base36 ID for ${field}`)
  }
}

export const createHgsJsonBuild = (selection: HgsSelection): HgsJsonBuildV1 => {
  const snapshot = snapshotFromSelection(selection)
  return {
    schema: HGS_JSON_SCHEMA,
    version: HGS_JSON_VERSION,
    baseItemId: toEncodedId(snapshot.selectedBaseItemId),
    desiredSpellId: toEncodedId(snapshot.selectedSpellId),
    tier1Id: toEncodedId(snapshot.selectedTier1Id),
    tier2Id: toEncodedId(snapshot.selectedTier2Id),
    tier3Mode: snapshot.selectedTier3Mode,
    tier3Id: toEncodedId(snapshot.selectedTier3Id)
  }
}

export const formatHgsJsonBuild = (selection: HgsSelection): string =>
  `${JSON.stringify(createHgsJsonBuild(selection), null, 2)}\n`

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const parseHgsJsonBuild = (text: string): CanonicalHgsBuildSnapshot => {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new InvalidHgsBuildError('Invalid HGS JSON')
  }
  if (!isRecord(value) || value.schema !== HGS_JSON_SCHEMA) throw new InvalidHgsBuildError('Invalid HGS JSON schema')
  if (value.version !== HGS_JSON_VERSION) throw new InvalidHgsBuildError('Unsupported HGS build version')
  if (value.tier3Mode !== null && value.tier3Mode !== 'basic' && value.tier3Mode !== 'focused') {
    throw new InvalidHgsBuildError('Invalid Tier 3 mode')
  }
  return {
    selectedBaseItemId: fromEncodedId(value.baseItemId, 'base item'),
    selectedSpellId: fromEncodedId(value.desiredSpellId, 'desired spell'),
    selectedTier1Id: fromEncodedId(value.tier1Id, 'Tier 1 selection'),
    selectedTier2Id: fromEncodedId(value.tier2Id, 'Tier 2 selection'),
    selectedTier3Mode: value.tier3Mode,
    selectedTier3Id: fromEncodedId(value.tier3Id, 'Tier 3 selection')
  }
}

export const validateHgsBuild = (
  snapshot: CanonicalHgsBuildSnapshot,
  { initial, tier2, tier3, combinations }: HgsValidationData
): HgsSelection => {
  const selection = snapshotFromSelection(snapshot)
  if (selection.selectedBaseItemId !== null && !initial.baseItemById.has(selection.selectedBaseItemId)) {
    throw new InvalidHgsBuildError('Unknown base item')
  }
  if (selection.selectedSpellId !== null && !tier2.spellById.has(selection.selectedSpellId)) {
    throw new InvalidHgsBuildError('Unknown desired spell')
  }
  if (selection.selectedTier1Id !== null && !initial.tier1ById.has(selection.selectedTier1Id)) {
    throw new InvalidHgsBuildError('Unknown Tier 1 selection')
  }
  if (selection.selectedTier2Id !== null && !tier2.tier2ById.has(selection.selectedTier2Id)) {
    throw new InvalidHgsBuildError('Unknown Tier 2 selection')
  }
  const selectedTier2 = selection.selectedTier2Id === null ? undefined : tier2.tier2ById.get(selection.selectedTier2Id)
  if (selectedTier2 && (selectedTier2.spellId ?? null) !== selection.selectedSpellId) {
    throw new InvalidHgsBuildError('Tier 2 selection and desired spell are inconsistent')
  }
  const tier3ById = selection.selectedTier3Mode === 'basic' ? tier3.tier3BasicById : tier3.tier3FocusedById
  if (
    selection.selectedTier3Id !== null &&
    (!selection.selectedTier3Mode || !tier3ById.has(selection.selectedTier3Id))
  ) {
    throw new InvalidHgsBuildError('Unknown Tier 3 selection')
  }
  const hasNonBaseSelection = Object.entries(selection).some(
    ([field, value]) => field !== 'selectedBaseItemId' && value !== null
  )
  if (selection.selectedBaseItemId === null && hasNonBaseSelection) {
    throw new InvalidHgsBuildError('A base item is required for altar selections')
  }
  if (!isHgsSelectionCompatible(combinations, selection, initial.baseItemById)) {
    throw new InvalidHgsBuildError('Selections are not compatible')
  }
  return selection
}

const permalinkId = (value: number | null): string => (value === null ? '-' : encodeStableId(value))
const decodePermalinkId = (value: string, field: string): number | null =>
  value === '-' ? null : fromEncodedId(value, field)

/** v1 fields: version, base, spell, Tier 1, Tier 2, Tier 3 mode (b/f/-), Tier 3, checksum. */
export const encodeHgsPermalink = (selection: HgsSelection): string => {
  const snapshot = snapshotFromSelection(selection)
  const mode = snapshot.selectedTier3Mode === 'basic' ? 'b' : snapshot.selectedTier3Mode === 'focused' ? 'f' : '-'
  const payload = [
    '1',
    permalinkId(snapshot.selectedBaseItemId),
    permalinkId(snapshot.selectedSpellId),
    permalinkId(snapshot.selectedTier1Id),
    permalinkId(snapshot.selectedTier2Id),
    mode,
    permalinkId(snapshot.selectedTier3Id)
  ].join('.')
  return `${payload}.${createPermalinkChecksum(payload)}`
}

export const decodeHgsPermalink = (value: string): CanonicalHgsBuildSnapshot => {
  const fields = value.split('.')
  if (fields.length !== 8) throw new InvalidHgsBuildError('Malformed HGS permalink')
  const payload = fields.slice(0, -1).join('.')
  if (fields[7] !== createPermalinkChecksum(payload)) throw new InvalidHgsBuildError('Invalid HGS permalink checksum')
  if (fields[0] !== '1') throw new InvalidHgsBuildError('Unsupported HGS permalink version')
  const mode = fields[5] === 'b' ? 'basic' : fields[5] === 'f' ? 'focused' : fields[5] === '-' ? null : undefined
  if (mode === undefined) throw new InvalidHgsBuildError('Invalid Tier 3 permalink mode')
  return {
    selectedBaseItemId: decodePermalinkId(fields[1], 'base item'),
    selectedSpellId: decodePermalinkId(fields[2], 'desired spell'),
    selectedTier1Id: decodePermalinkId(fields[3], 'Tier 1 selection'),
    selectedTier2Id: decodePermalinkId(fields[4], 'Tier 2 selection'),
    selectedTier3Mode: mode,
    selectedTier3Id: decodePermalinkId(fields[6], 'Tier 3 selection')
  }
}

export const buildHgsPermalinkUrl = (selection: HgsSelection, origin = window.location.origin): string =>
  `${origin}/green-steel?${HGS_PERMALINK_QUERY_PARAMETER}=${encodeURIComponent(encodeHgsPermalink(selection))}`

export interface ResolvedHgsBuildView {
  baseItem?: { name: string; type: string }
  desiredSpell?: { name: string; description: string }
  altars: { label: string; selection: string; focus: string; gem: string; essence: string; effects: string[] }[]
}

export const resolveHgsBuildView = (
  selection: HgsSelection,
  { initial, tier2, tier3 }: Pick<HgsValidationData, 'initial' | 'tier2' | 'tier3'>
): ResolvedHgsBuildView => {
  const baseItem =
    selection.selectedBaseItemId === null ? undefined : initial.baseItemById.get(selection.selectedBaseItemId)
  const desiredSpell =
    selection.selectedSpellId === null ? undefined : resolveSpell(selection.selectedSpellId, tier2.spellById)
  const options = [
    [
      'Altar of Invasion',
      selection.selectedTier1Id === null ? undefined : initial.tier1ById.get(selection.selectedTier1Id)
    ],
    [
      'Altar of Subjugation',
      selection.selectedTier2Id === null ? undefined : tier2.tier2ById.get(selection.selectedTier2Id)
    ],
    [
      `Altar of Devastation${selection.selectedTier3Mode ? ` (${selection.selectedTier3Mode})` : ''}`,
      selection.selectedTier3Id === null
        ? undefined
        : selection.selectedTier3Mode === 'basic'
          ? tier3.tier3BasicById.get(selection.selectedTier3Id)
          : tier3.tier3FocusedById.get(selection.selectedTier3Id)
    ] as const
  ] as const
  return {
    ...(baseItem ? { baseItem: { name: baseItem.name, type: baseItem.weaponType ?? 'Equipment' } } : {}),
    ...(desiredSpell
      ? { desiredSpell: { name: desiredSpell.name, description: stripDdoMarkup(desiredSpell.description) } }
      : {}),
    altars: options.flatMap(([label, option]) =>
      option
        ? [
            {
              label,
              selection: option.name,
              focus: option.focus,
              gem: option.gem,
              essence: option.essence,
              effects: resolveEffects(option.effectIds, initial.effectById).map((effect) => effect.displayName)
            }
          ]
        : []
    )
  }
}

export const formatHgsBbCode = (view: ResolvedHgsBuildView): string => {
  const lines = ['[b]Heroic Green Steel[/b]']
  if (view.baseItem)
    lines.push(`[b]Base Item:[/b] ${escapeBbCode(view.baseItem.name)} (${escapeBbCode(view.baseItem.type)})`)
  if (view.desiredSpell) {
    lines.push(`[b]Desired Spell:[/b] ${escapeBbCode(view.desiredSpell.name)}`)
    if (view.desiredSpell.description) lines.push(escapeBbCode(view.desiredSpell.description))
  }
  for (const altar of view.altars) {
    lines.push('', `[b]${escapeBbCode(altar.label)}[/b]`, escapeBbCode(altar.selection))
    lines.push(
      `[i]Focus:[/i] ${escapeBbCode(altar.focus)} · [i]Gem:[/i] ${escapeBbCode(altar.gem)} · [i]Essence:[/i] ${escapeBbCode(altar.essence)}`
    )
    for (const effect of altar.effects) lines.push(`- ${escapeBbCode(effect)}`)
  }
  return lines.join('\n')
}

export const formatHgsDiscordMarkdown = (view: ResolvedHgsBuildView): string => {
  const lines = ['**Heroic Green Steel**']
  if (view.baseItem)
    lines.push(`**Base Item:** ${escapeMarkdown(view.baseItem.name)} (${escapeMarkdown(view.baseItem.type)})`)
  if (view.desiredSpell) {
    lines.push(`**Desired Spell:** ${escapeMarkdown(view.desiredSpell.name)}`)
    if (view.desiredSpell.description) lines.push(escapeMarkdown(view.desiredSpell.description))
  }
  for (const altar of view.altars) {
    lines.push('', `**${escapeMarkdown(altar.label)}**`, escapeMarkdown(altar.selection))
    lines.push(
      `Focus: ${escapeMarkdown(altar.focus)} · Gem: ${escapeMarkdown(altar.gem)} · Essence: ${escapeMarkdown(altar.essence)}`
    )
    for (const effect of altar.effects) lines.push(`- ${escapeMarkdown(effect)}`)
  }
  return lines.join('\n')
}
