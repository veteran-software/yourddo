import { createPermalinkChecksum } from '../../shared/serialization/checksum.ts'
import { escapeBbCode, escapeMarkdown } from '../../shared/serialization/forumText.ts'
import type { LgsData, LgsPlan } from './legendaryGreenSteel.types.ts'
import { reconcileLgsPlan, weaponBonusResult } from './logic.ts'

export const LGS_JSON_SCHEMA = 'yourddo-lgs'
export const LGS_JSON_FILENAME = 'yourddo-lgs-build.json'
export const LGS_PERMALINK_QUERY_PARAMETER = 'build'

export type CanonicalLgsBuildSnapshot = LgsPlan

export class InvalidLgsBuildError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidLgsBuildError'
  }
}

const snapshotFromPlan = (plan: LgsPlan): CanonicalLgsBuildSnapshot => ({ ...plan })

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const nameFromValue = (value: unknown, field: string): string | null => {
  if (value === null) return null
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new InvalidLgsBuildError(`${field} must be a non-empty string or null`)
  }
  return value
}

export const createLgsJsonBuild = (plan: LgsPlan) => {
  const snapshot = snapshotFromPlan(plan)
  return { schema: LGS_JSON_SCHEMA, version: plan.useImmortalsHeart ? 2 : 1, ...snapshot }
}

export const formatLgsJsonBuild = (plan: LgsPlan): string => `${JSON.stringify(createLgsJsonBuild(plan), null, 2)}\n`

export const parseLgsJsonBuild = (text: string): CanonicalLgsBuildSnapshot => {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new InvalidLgsBuildError('Invalid LGS JSON')
  }
  if (!isRecord(value) || value.schema !== LGS_JSON_SCHEMA) throw new InvalidLgsBuildError('Invalid LGS JSON schema')
  if (value.version !== 1 && value.version !== 2) throw new InvalidLgsBuildError('Unsupported LGS build version')
  if (value.version === 2 && typeof value.useImmortalsHeart !== 'boolean')
    throw new InvalidLgsBuildError('Invalid cleansing selection')
  return {
    ...(value.version === 2 && value.useImmortalsHeart === true ? { useImmortalsHeart: true } : {}),
    baseItemName: nameFromValue(value.baseItemName, 'base item'),
    tier1Name: nameFromValue(value.tier1Name, 'Tier 1 selection'),
    tier2Name: nameFromValue(value.tier2Name, 'Tier 2 selection'),
    tier3Name: nameFromValue(value.tier3Name, 'Tier 3 selection'),
    bonusEffectName: nameFromValue(value.bonusEffectName, 'bonus effect'),
    activeAugmentName: nameFromValue(value.activeAugmentName, 'active augment')
  }
}

const requireKnownName = (name: string | null, records: readonly { name: string }[], field: string): void => {
  if (name !== null && !records.some((record) => record.name === name)) {
    throw new InvalidLgsBuildError(`Unknown ${field}`)
  }
}

const renamedBases = new Map(
  ['Weave Boots', 'Bracers', 'Weave Gloves', 'Goggles'].map((item) => {
    const name = `Legendary Green Steel ${item}`
    return [name + '[ps]', name]
  })
)

export const validateLgsBuild = (snapshot: CanonicalLgsBuildSnapshot, data: LgsData): LgsPlan => {
  const plan = snapshotFromPlan(snapshot)
  if (plan.baseItemName && !data.baseItems.some((base) => base.name === plan.baseItemName)) {
    plan.baseItemName = renamedBases.get(plan.baseItemName) ?? plan.baseItemName
  }
  requireKnownName(plan.baseItemName, data.baseItems, 'base item')
  requireKnownName(plan.tier1Name, data.tier1, 'Tier 1 selection')
  requireKnownName(plan.tier2Name, data.tier2, 'Tier 2 selection')
  requireKnownName(plan.tier3Name, data.tier3, 'Tier 3 selection')
  requireKnownName(plan.bonusEffectName, data.bonusEffects, 'bonus effect')
  requireKnownName(plan.activeAugmentName, data.activeAugments, 'active augment')

  const reconciled = reconcileLgsPlan(data, plan)
  if (
    reconciled.tier1Name !== plan.tier1Name ||
    reconciled.tier2Name !== plan.tier2Name ||
    reconciled.tier3Name !== plan.tier3Name ||
    reconciled.activeAugmentName !== plan.activeAugmentName ||
    reconciled.useImmortalsHeart !== plan.useImmortalsHeart
  ) {
    throw new InvalidLgsBuildError('Imported selections are not compatible')
  }
  return plan
}

const permalinkName = (value: string | null): string =>
  value === null ? '-' : encodeURIComponent(value).replaceAll('.', '%2E')
const decodePermalinkName = (value: string, field: string): string | null => {
  if (value === '-') return null
  try {
    const decoded = decodeURIComponent(value)
    if (!decoded || permalinkName(decoded) !== value) throw new Error()
    return decoded
  } catch {
    throw new InvalidLgsBuildError(`Invalid permalink ${field}`)
  }
}

/** v1 fields: version, base item, Tier 1, Tier 2, Tier 3, bonus effect, active augment, checksum. */
export const encodeLgsPermalink = (plan: LgsPlan): string => {
  const snapshot = snapshotFromPlan(plan)
  const payload = [
    plan.useImmortalsHeart ? '2' : '1',
    permalinkName(snapshot.baseItemName),
    permalinkName(snapshot.tier1Name),
    permalinkName(snapshot.tier2Name),
    permalinkName(snapshot.tier3Name),
    permalinkName(snapshot.bonusEffectName),
    permalinkName(snapshot.activeAugmentName),
    ...(plan.useImmortalsHeart ? ['1'] : [])
  ].join('.')
  return `${payload}.${createPermalinkChecksum(payload)}`
}

export const decodeLgsPermalink = (value: string): CanonicalLgsBuildSnapshot => {
  const fields = value.split('.')
  if (fields.length < 8) throw new InvalidLgsBuildError('Malformed LGS permalink')
  const payload = fields.slice(0, -1).join('.')
  if (fields.at(-1) !== createPermalinkChecksum(payload))
    throw new InvalidLgsBuildError('Invalid LGS permalink checksum')
  if (fields[0] !== '1' && fields[0] !== '2') throw new InvalidLgsBuildError('Unsupported LGS permalink version')
  if (
    (fields[0] === '1' && fields.length !== 8) ||
    (fields[0] === '2' && (fields.length !== 9 || !['1', '0'].includes(fields[7])))
  )
    throw new InvalidLgsBuildError('Malformed LGS permalink')
  return {
    ...(fields[0] === '2' && fields[7] === '1' ? { useImmortalsHeart: true } : {}),
    baseItemName: decodePermalinkName(fields[1], 'base item'),
    tier1Name: decodePermalinkName(fields[2], 'Tier 1 selection'),
    tier2Name: decodePermalinkName(fields[3], 'Tier 2 selection'),
    tier3Name: decodePermalinkName(fields[4], 'Tier 3 selection'),
    bonusEffectName: decodePermalinkName(fields[5], 'bonus effect'),
    activeAugmentName: decodePermalinkName(fields[6], 'active augment')
  }
}

export const buildLgsPermalinkUrl = (plan: LgsPlan, origin = window.location.origin): string =>
  `${origin}/legendary-green-steel?${LGS_PERMALINK_QUERY_PARAMETER}=${encodeURIComponent(encodeLgsPermalink(plan))}`

export interface ResolvedLgsBuildView {
  discrepancies: string[]
  weaponResult?: string
  cleansing?: string
  baseItem?: { name: string; type: string }
  tiers: { label: string; selection: string; focus: string; gem: string; essence: string; effects: string[] }[]
  bonusEffect?: { name: string; description: string }
  activeAugment?: { name: string; spellDetails: string; description: string }
}

export const resolveLgsBuildView = (plan: LgsPlan, data: LgsData): ResolvedLgsBuildView => {
  const baseItem = data.baseItems.find(({ name }) => name === plan.baseItemName)
  const bonusEffect = data.bonusEffects.find(({ name }) => name === plan.bonusEffectName)
  const activeAugment = data.activeAugments.find(({ name }) => name === plan.activeAugmentName)
  const tiers = [
    ['Tier 1', data.tier1.find((option) => option.name === plan.tier1Name)],
    ['Tier 2', data.tier2.find((option) => option.name === plan.tier2Name)],
    ['Tier 3', data.tier3.find((option) => option.name === plan.tier3Name)]
  ] as const
  return {
    discrepancies: [baseItem, ...tiers.map(([, tier]) => tier), bonusEffect, activeAugment].flatMap((item) =>
      item ? item.discrepancies.map((note) => `${item.name}: ${note}`) : []
    ),
    weaponResult: weaponBonusResult(data, plan),
    ...(plan.useImmortalsHeart ? { cleansing: data.immortalsHeart.name } : {}),
    ...(baseItem
      ? {
          baseItem: {
            name: baseItem.name,
            type: baseItem.type === 'weapon' ? 'Legendary Green Steel Weapon' : 'Legendary Green Steel Accessory'
          }
        }
      : {}),
    tiers: tiers.flatMap(([label, tier]) => {
      return tier
        ? [
            {
              label,
              selection: tier.name,
              focus: tier.focuses.join(' / '),
              gem: tier.gem,
              essence: tier.essence,
              effects: [...tier.effects, ...tier.details]
            }
          ]
        : []
    }),
    ...(bonusEffect
      ? {
          bonusEffect: {
            name: bonusEffect.name,
            description: [
              bonusEffect.requiredFocuses
                ? `Required focuses for tiers 1 and 2: ${bonusEffect.requiredFocuses.tier1And2.join(' + ')}. Tier 3: ${bonusEffect.requiredFocuses.tier3.join(' + ')}. Either order within each pair.`
                : 'Activation unresolved.',
              ...bonusEffect.paragraphs,
              ...bonusEffect.notes
            ].join('\n')
          }
        }
      : {}),
    ...(activeAugment
      ? {
          activeAugment: {
            name: activeAugment.displayName,
            spellDetails: activeAugment.spellDetails,
            description: activeAugment.description
          }
        }
      : {})
  }
}

export const formatLgsBbCode = (view: ResolvedLgsBuildView): string => {
  const lines = ['[b]Legendary Green Steel[/b]']
  if (view.baseItem)
    lines.push(`[b]Base Item:[/b] ${escapeBbCode(view.baseItem.name)} (${escapeBbCode(view.baseItem.type)})`)
  for (const tier of view.tiers) {
    lines.push('', `[b]${escapeBbCode(tier.label)}[/b]`, escapeBbCode(tier.selection))
    lines.push(
      `[i]Focus:[/i] ${escapeBbCode(tier.focus)} · [i]Gem:[/i] ${escapeBbCode(tier.gem)} · [i]Essence:[/i] ${escapeBbCode(tier.essence)}`
    )
    for (const effect of tier.effects) lines.push(`- ${escapeBbCode(effect)}`)
  }
  if (view.bonusEffect) {
    lines.push('', `[b]Bonus Effect:[/b] ${escapeBbCode(view.bonusEffect.name)}`)
    if (view.bonusEffect.description) lines.push(escapeBbCode(view.bonusEffect.description))
  }
  if (view.weaponResult) lines.push('', escapeBbCode(view.weaponResult))
  if (view.cleansing) lines.push('', `[b]Cleansing:[/b] ${escapeBbCode(view.cleansing)}`)
  if (view.activeAugment) {
    lines.push('', `[b]Active Augment:[/b] ${escapeBbCode(view.activeAugment.name)}`)
    if (view.activeAugment.spellDetails) lines.push(escapeBbCode(view.activeAugment.spellDetails))
    if (view.activeAugment.description) lines.push(escapeBbCode(view.activeAugment.description))
  }
  if (view.discrepancies.length)
    lines.push('', '[hr]', '[b]Discrepancies[/b]', ...view.discrepancies.map((note) => `- ${escapeBbCode(note)}`))
  return lines.join('\n')
}

export const formatLgsDiscordMarkdown = (view: ResolvedLgsBuildView): string => {
  const lines = ['**Legendary Green Steel**']
  if (view.baseItem)
    lines.push(`**Base Item:** ${escapeMarkdown(view.baseItem.name)} (${escapeMarkdown(view.baseItem.type)})`)
  for (const tier of view.tiers) {
    lines.push('', `**${escapeMarkdown(tier.label)}**`, escapeMarkdown(tier.selection))
    lines.push(
      `Focus: ${escapeMarkdown(tier.focus)} · Gem: ${escapeMarkdown(tier.gem)} · Essence: ${escapeMarkdown(tier.essence)}`
    )
    for (const effect of tier.effects) lines.push(`- ${escapeMarkdown(effect)}`)
  }
  if (view.bonusEffect) {
    lines.push('', `**Bonus Effect:** ${escapeMarkdown(view.bonusEffect.name)}`)
    if (view.bonusEffect.description) lines.push(escapeMarkdown(view.bonusEffect.description))
  }
  if (view.weaponResult) lines.push('', escapeMarkdown(view.weaponResult))
  if (view.cleansing) lines.push('', `**Cleansing:** ${escapeMarkdown(view.cleansing)}`)
  if (view.activeAugment) {
    lines.push('', `**Active Augment:** ${escapeMarkdown(view.activeAugment.name)}`)
    if (view.activeAugment.spellDetails) lines.push(escapeMarkdown(view.activeAugment.spellDetails))
    if (view.activeAugment.description) lines.push(escapeMarkdown(view.activeAugment.description))
  }
  if (view.discrepancies.length)
    lines.push('', '────────', '**Discrepancies**', ...view.discrepancies.map((note) => `- ${escapeMarkdown(note)}`))
  return lines.join('\n')
}
