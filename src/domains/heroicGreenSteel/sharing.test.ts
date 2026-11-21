import { describe, expect, it } from 'vitest'
import { createPermalinkChecksum } from '../../shared/serialization/checksum.ts'
import { encodeStableId } from '../../shared/serialization/stableId.ts'
import type {
  HgsBaseItem,
  HgsEffect,
  HgsInitialData,
  HgsSpell,
  HgsTier2Data,
  HgsTier3Data,
  HgsTierOption
} from './heroicGreenSteel.types.ts'
import { createHgsValidCombinations, emptyHgsSelection } from './logic.ts'
import {
  createHgsJsonBuild,
  decodeHgsPermalink,
  encodeHgsPermalink,
  formatHgsBbCode,
  formatHgsDiscordMarkdown,
  formatHgsJsonBuild,
  parseHgsJsonBuild,
  resolveHgsBuildView,
  validateHgsBuild
} from './sharing.ts'

const ids = { base: 1879085364, spell: 1879085365, tier1: 1879085366, tier2: 1879085367, tier3: 1879085368 }
const effect: HgsEffect = {
  id: 1879085369,
  displayName: 'Arcane [Surge]',
  description: '[safe] effect',
  enchantments: [],
  procs: []
}
const base: HgsBaseItem = {
  id: ids.base,
  name: 'Green Steel Dagger',
  description: '',
  recipeId: 1,
  type: 'weapon',
  weaponType: 'Dagger'
}
const option = (id: number, values: Partial<HgsTierOption> = {}): HgsTierOption => ({
  id,
  name: 'Arcane Imbued Shard',
  type: 'weapon',
  essence: 'Material',
  focus: 'Earth',
  gem: 'Dominion',
  effectIds: [effect.id],
  recipeId: id,
  ...values
})
const tier1 = option(ids.tier1)
const tier2 = option(ids.tier2, { requiresFocus: 'Earth', aspect: 'Mineral', spellId: ids.spell })
const tier3 = option(ids.tier3, { requiresAspect: 'Mineral' })
const spell: HgsSpell = {
  id: ids.spell,
  name: 'Earthgrab',
  description: '<rgb=#fff>Grabs a target.</rgb>',
  casterLevel: 1,
  charges: 1,
  rechargePerDay: 1
}
const initial = {
  manifest: {} as HgsInitialData['manifest'],
  baseItems: [base],
  effects: [effect],
  tier1: [tier1],
  baseItemById: new Map([[base.id, base]]),
  effectById: new Map([[effect.id, effect]]),
  tier1ById: new Map([[tier1.id, tier1]])
} satisfies HgsInitialData
const tier2Data: HgsTier2Data = {
  tier2: [tier2],
  spells: [spell],
  tier2ById: new Map([[tier2.id, tier2]]),
  spellById: new Map([[spell.id, spell]])
}
const tier3Data: HgsTier3Data = {
  tier3Basic: [tier3],
  tier3Focused: [],
  tier3BasicById: new Map([[tier3.id, tier3]]),
  tier3FocusedById: new Map()
}
const combinations = createHgsValidCombinations(
  initial.tier1,
  tier2Data.tier2,
  tier3Data.tier3Basic,
  tier3Data.tier3Focused
)
const complete = {
  selectedBaseItemId: ids.base,
  selectedSpellId: ids.spell,
  selectedTier1Id: ids.tier1,
  selectedTier2Id: ids.tier2,
  selectedTier3Mode: 'basic' as const,
  selectedTier3Id: ids.tier3
}
const validationData = { initial, tier2: tier2Data, tier3: tier3Data, combinations }

describe('HGS sharing', () => {
  it('round trips complete and spell-first partial snapshots through stable JSON', () => {
    expect(createHgsJsonBuild(complete)).toEqual({
      schema: 'yourddo-hgs',
      version: 1,
      baseItemId: encodeStableId(ids.base),
      desiredSpellId: encodeStableId(ids.spell),
      tier1Id: encodeStableId(ids.tier1),
      tier2Id: encodeStableId(ids.tier2),
      tier3Mode: 'basic',
      tier3Id: encodeStableId(ids.tier3)
    })
    expect(validateHgsBuild(parseHgsJsonBuild(formatHgsJsonBuild(complete)), validationData)).toEqual(complete)
    const partial = { ...emptyHgsSelection, selectedBaseItemId: ids.base, selectedSpellId: ids.spell }
    expect(validateHgsBuild(parseHgsJsonBuild(formatHgsJsonBuild(partial)), validationData)).toEqual(partial)
    expect(formatHgsJsonBuild(complete)).toBe(formatHgsJsonBuild(complete))
  })

  it('keeps nulls as JSON null and rejects invalid, stale, incompatible, and mismatched spell imports atomically', () => {
    expect(formatHgsJsonBuild(emptyHgsSelection)).toContain('"desiredSpellId": null')
    expect(() => parseHgsJsonBuild('{')).toThrow('Invalid HGS JSON')
    expect(() => parseHgsJsonBuild(JSON.stringify({ ...createHgsJsonBuild(complete), schema: 'wrong' }))).toThrow(
      'schema'
    )
    expect(() => parseHgsJsonBuild(JSON.stringify({ ...createHgsJsonBuild(complete), version: 2 }))).toThrow('version')
    expect(() => parseHgsJsonBuild(JSON.stringify({ ...createHgsJsonBuild(complete), baseItemId: 'ABC' }))).toThrow(
      'base36'
    )
    expect(() => validateHgsBuild({ ...complete, selectedTier1Id: 999 }, validationData)).toThrow('Unknown Tier 1')
    expect(() => validateHgsBuild({ ...complete, selectedSpellId: null }, validationData)).toThrow('inconsistent')
  })

  it('uses deterministic fixed-field, checksummed permalinks for complete and partial builds', () => {
    const permalink = encodeHgsPermalink(complete)
    expect(permalink).toMatch(/^1\.[0-9a-z]+\.[0-9a-z]+\.[0-9a-z]+\.[0-9a-z]+\.b\.[0-9a-z]+\.[0-9a-z]{7}$/)
    expect(decodeHgsPermalink(permalink)).toEqual(complete)
    expect(encodeHgsPermalink(complete)).toBe(permalink)
    const partial = { ...emptyHgsSelection, selectedBaseItemId: ids.base, selectedSpellId: ids.spell }
    expect(decodeHgsPermalink(encodeHgsPermalink(partial))).toEqual(partial)
    expect(() => decodeHgsPermalink(`${permalink.slice(0, -1)}x`)).toThrow('checksum')
    const unsupportedPayload = permalink.replace(/^1/, '2').split('.').slice(0, -1).join('.')
    expect(() => decodeHgsPermalink(`${unsupportedPayload}.${createPermalinkChecksum(unsupportedPayload)}`)).toThrow(
      'version'
    )
    const invalidIdPayload = permalink.replace(encodeStableId(ids.base), 'ABC').split('.').slice(0, -1).join('.')
    expect(() => decodeHgsPermalink(`${invalidIdPayload}.${createPermalinkChecksum(invalidIdPayload)}`)).toThrow(
      'base36'
    )
    expect(() => validateHgsBuild({ ...complete, selectedTier3Id: 999 }, validationData)).toThrow('Unknown Tier 3')
  })

  it('formats a resolved, ID-free human view with escaped dynamic text and omits partial stages', () => {
    const view = resolveHgsBuildView(complete, validationData)
    const forum = formatHgsBbCode(view)
    const discord = formatHgsDiscordMarkdown(view)
    for (const serializedId of Object.values(ids).flatMap((id) => [String(id), encodeStableId(id)])) {
      expect(forum).not.toContain(serializedId)
      expect(discord).not.toContain(serializedId)
    }
    expect(forum).toContain('[b]Heroic Green Steel[/b]')
    expect(forum).toContain('Arcane &#91;Surge&#93;')
    expect(discord).toContain('**Heroic Green Steel**')
    expect(discord).toContain('Altar of Invasion')
    const partial = resolveHgsBuildView({ ...emptyHgsSelection, selectedBaseItemId: ids.base }, validationData)
    expect(formatHgsDiscordMarkdown(partial)).not.toContain('Altar of Invasion')
  })
})
