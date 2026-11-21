import { describe, expect, it } from 'vitest'
import { createPermalinkChecksum } from '../../shared/serialization/checksum.ts'
import type { LgsPlan } from './legendaryGreenSteel.types.ts'
import { parseLgsResources } from './data.ts'
import { files, devices } from './lgsTestData.ts'
import { emptyLgsPlan } from './logic.ts'
import {
  buildLgsPermalinkUrl,
  createLgsJsonBuild,
  decodeLgsPermalink,
  encodeLgsPermalink,
  formatLgsBbCode,
  formatLgsDiscordMarkdown,
  formatLgsJsonBuild,
  LGS_PERMALINK_QUERY_PARAMETER,
  parseLgsJsonBuild,
  resolveLgsBuildView,
  validateLgsBuild
} from './sharing.ts'

const data = parseLgsResources(files, devices)

const complete: LgsPlan = {
  baseItemName: 'Weapon Base',
  tier1Name: 'Tier 1 Weapon',
  tier2Name: 'Tier 2 Weapon',
  tier3Name: 'Tier 3 Weapon Air Fire',
  bonusEffectName: 'Air Fire Bonus',
  activeAugmentName: 'Legendary Green Steel Augment: Animal Growth'
}

describe('LGS sharing', () => {
  it('round trips complete and partial plans using canonical dataset names', () => {
    expect(createLgsJsonBuild(complete)).toEqual({ schema: 'yourddo-lgs', version: 1, ...complete })
    expect(validateLgsBuild(parseLgsJsonBuild(formatLgsJsonBuild(complete)), data)).toEqual(complete)
    const partial = {
      ...emptyLgsPlan(),
      baseItemName: 'Weapon Base',
      activeAugmentName: 'Legendary Green Steel Augment: Animal Growth'
    }
    expect(validateLgsBuild(parseLgsJsonBuild(formatLgsJsonBuild(partial)), data)).toEqual(partial)
  })

  it('restores and exports cleansed equipment while rejecting a Heart on a weapon', () => {
    const plan = { ...emptyLgsPlan(), baseItemName: 'Accessory Base', useImmortalsHeart: true as const }
    expect(createLgsJsonBuild(plan).version).toBe(2)
    for (const snapshot of [
      parseLgsJsonBuild(formatLgsJsonBuild(plan)),
      decodeLgsPermalink(encodeLgsPermalink(plan))
    ]) {
      expect(validateLgsBuild(snapshot, data)).toEqual(plan)
      expect(() => validateLgsBuild({ ...snapshot, baseItemName: 'Weapon Base' }, data)).toThrow('compatible')
    }
    const view = resolveLgsBuildView(plan, data)
    expect(formatLgsDiscordMarkdown(view)).toContain("Immortal's Heart")
    expect(formatLgsBbCode(view)).toContain("Immortal's Heart")
  })

  it.each(['Weave Boots', 'Bracers', 'Weave Gloves', 'Goggles'])(
    'imports the historical %s name in JSON and permalinks',
    (part) => {
      const name = 'Legendary Green Steel ' + part
      const catalog = { ...data, baseItems: [{ ...data.baseItems[1], name }] }
      const legacy = { ...emptyLgsPlan(), baseItemName: name + '[ps]' }
      for (const snapshot of [
        parseLgsJsonBuild(formatLgsJsonBuild(legacy)),
        decodeLgsPermalink(encodeLgsPermalink(legacy))
      ]) {
        expect(validateLgsBuild(snapshot, catalog)).toEqual({ ...legacy, baseItemName: name })
      }
    }
  )

  it('rejects malformed, unsupported, stale, and incompatible imports without accepting arbitrary records', () => {
    expect(() => parseLgsJsonBuild('{')).toThrow('Invalid LGS JSON')
    expect(() => parseLgsJsonBuild(JSON.stringify({ ...createLgsJsonBuild(complete), version: 3 }))).toThrow('version')
    expect(() => parseLgsJsonBuild(JSON.stringify({ ...createLgsJsonBuild(complete), tier1Name: {} }))).toThrow(
      'Tier 1'
    )
    expect(() => validateLgsBuild({ ...complete, tier1Name: 'Removed tier' }, data)).toThrow('Unknown Tier 1')
    expect(() => validateLgsBuild({ ...complete, tier1Name: 'Tier 1 Equipment' }, data)).toThrow('compatible')
  })

  it('uses deterministic fixed-field, checksummed permalinks for complete, partial, and empty builds', () => {
    const permalink = encodeLgsPermalink(complete)
    expect(permalink.split('.')).toHaveLength(8)
    expect(decodeLgsPermalink(permalink)).toEqual(complete)
    expect(encodeLgsPermalink(complete)).toBe(permalink)
    const partial = { ...emptyLgsPlan(), baseItemName: 'Weapon Base', tier1Name: 'Tier 1 Weapon' }
    expect(decodeLgsPermalink(encodeLgsPermalink(partial))).toEqual(partial)
    expect(decodeLgsPermalink(encodeLgsPermalink(emptyLgsPlan()))).toEqual(emptyLgsPlan())
    const url = new URL(buildLgsPermalinkUrl(complete, 'https://yourddo.example'))
    expect(url.pathname).toBe('/legendary-green-steel')
    expect(url.searchParams.get(LGS_PERMALINK_QUERY_PARAMETER)).toBe(permalink)
  })

  it('rejects malformed and stale permalink selections without accepting arbitrary records', () => {
    const permalink = encodeLgsPermalink(complete)
    expect(() => decodeLgsPermalink(`${permalink.slice(0, -1)}x`)).toThrow('checksum')
    const unsupportedPayload = permalink.replace(/^1/, '3').split('.').slice(0, -1).join('.')
    expect(() => decodeLgsPermalink(`${unsupportedPayload}.${createPermalinkChecksum(unsupportedPayload)}`)).toThrow(
      'version'
    )
    expect(() => decodeLgsPermalink('not-a-permalink')).toThrow('Malformed')
    expect(() => validateLgsBuild({ ...complete, baseItemName: 'Removed base' }, data)).toThrow('Unknown base')
    expect(() => validateLgsBuild({ ...complete, tier1Name: 'Removed tier' }, data)).toThrow('Unknown Tier 1')
    expect(() => validateLgsBuild({ ...complete, bonusEffectName: 'Removed bonus' }, data)).toThrow('Unknown bonus')
    expect(() => validateLgsBuild({ ...complete, activeAugmentName: 'Removed active' }, data)).toThrow('Unknown active')
  })

  it('puts labeled discrepancy notes last in both human-readable exports', () => {
    const note = 'Positive Energy Spell Power: stated 37, actual 34.75.'
    const catalog = { ...data, tier1: data.tier1.map((tier) => ({ ...tier, discrepancies: [note] })) }
    const view = resolveLgsBuildView(complete, catalog)
    expect(formatLgsBbCode(view).split('\n').slice(-3)).toEqual([
      '[hr]',
      '[b]Discrepancies[/b]',
      `- Tier 1 Weapon: ${note}`
    ])
    expect(formatLgsDiscordMarkdown(view).split('\n').slice(-3)).toEqual([
      '────────',
      '**Discrepancies**',
      `- Tier 1 Weapon: ${note}`
    ])
  })

  it('formats clean, related Discord and forum output without empty sections', () => {
    const view = resolveLgsBuildView(complete, data)
    const discord = formatLgsDiscordMarkdown(view)
    const forum = formatLgsBbCode(view)
    expect(discord).toContain('**Legendary Green Steel**')
    expect(discord).toContain('**Base Item:** Weapon Base (Legendary Green Steel Weapon)')
    expect(discord).toContain(
      '**Tier 3**\nTier 3 Weapon Air Fire\nFocus: Air / Fire · Gem: Dominion · Essence: Ethereal'
    )
    expect(discord).toContain('- Electric Spell Power +139 (Equipment)')
    expect(discord).toContain('- Electric Lore +29 (Equipment)')
    expect(discord).toContain('- Electric Critical Damage +6')
    expect(discord).toContain('**Bonus Effect:** Air Fire Bonus\nRequired focuses for tiers 1 and 2: Air + Air.')
    expect(discord).toContain('**Active Augment:** Animal Growth\nCaster level 10')
    expect(forum).toContain('[b]Legendary Green Steel[/b]')
    expect(forum).toContain('[i]Focus:[/i] Air / Fire')

    const partial = formatLgsDiscordMarkdown(
      resolveLgsBuildView({ ...emptyLgsPlan(), baseItemName: 'Weapon Base', tier1Name: 'Tier 1 Weapon' }, data)
    )
    expect(partial).not.toContain('**Tier 2**')
    expect(partial).not.toContain('**Bonus Effect:**')
    expect(partial).not.toContain('**Active Augment:**')
  })
})
