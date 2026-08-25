import { describe, expect, it } from 'vitest'
import { createPermalinkChecksum } from '../../shared/serialization/checksum.ts'
import type { LgsData, LgsEffect, LgsPlan, LgsTierAugment } from './legendaryGreenSteel.types.ts'
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

const tier = (
  name: string,
  number: 1 | 2 | 3,
  secondaryFocus?: string,
  effectsAdded: readonly LgsEffect[] = []
): LgsTierAugment => ({
  name,
  title: name,
  augmentType: `Tier ${number.toString()}`,
  minimumLevel: 26,
  craftedIn: 'Altar',
  quantity: 1,
  requirements: [],
  effectsAdded,
  tier: number,
  itemType: 'Weapon',
  primaryFocus: 'Air',
  ...(secondaryFocus ? { secondaryFocus } : {}),
  essence: 'Ethereal',
  gem: 'Dominion',
  source: {}
})

const data: LgsData = {
  schemaVersion: 1,
  baseItems: [
    {
      name: 'Weapon Base',
      ingredientType: 'Legendary Green Steel Weapon',
      craftedIn: 'Altar',
      quantity: 1,
      requirements: [],
      source: {}
    }
  ],
  tier1: [tier('Tier 1', 1, undefined, [{ name: 'Good-aligned Weapon' }])],
  tier2: [tier('Tier 2', 2, undefined, [{ name: 'Electric Spell Power', modifier: 139, bonus: 'Equipment' }])],
  tier3: [
    tier('Tier 3 Air Fire', 3, 'Fire', [
      { name: 'Electric Resistance', modifier: '50%', bonus: 'Equipment' },
      { name: 'Deadly', modifier: 17 }
    ])
  ],
  bonusEffects: [
    {
      name: 'Air Fire Bonus',
      description: 'Air and fire synergy.',
      lowerFoci: ['Air', 'Air'],
      tier3Foci: ['Air', 'Fire'],
      source: {}
    },
    { name: 'Water Bonus', description: '', lowerFoci: ['Water'], tier3Foci: ['Water'], source: {} }
  ],
  activeAugments: [
    {
      name: 'Active Augment',
      displayName: 'Active Augment',
      type: 'Spell',
      description: 'Casts a spell.',
      augmentType: 'Active',
      minimumLevel: 26,
      craftedIn: 'Altar',
      quantity: 1,
      requirements: [],
      source: {}
    }
  ],
  craftingComponents: [],
  specialRecipes: []
}

const complete: LgsPlan = {
  baseItemName: 'Weapon Base',
  tier1Name: 'Tier 1',
  tier2Name: 'Tier 2',
  tier3Name: 'Tier 3 Air Fire',
  bonusEffectName: 'Air Fire Bonus',
  activeAugmentName: 'Active Augment'
}

describe('LGS sharing', () => {
  it('round trips complete and partial plans using canonical dataset names', () => {
    expect(createLgsJsonBuild(complete)).toEqual({ schema: 'yourddo-lgs', version: 1, ...complete })
    expect(validateLgsBuild(parseLgsJsonBuild(formatLgsJsonBuild(complete)), data)).toEqual(complete)
    const partial = { ...emptyLgsPlan(), baseItemName: 'Weapon Base', activeAugmentName: 'Active Augment' }
    expect(validateLgsBuild(parseLgsJsonBuild(formatLgsJsonBuild(partial)), data)).toEqual(partial)
  })

  it('rejects malformed, unsupported, stale, and incompatible imports without accepting arbitrary records', () => {
    expect(() => parseLgsJsonBuild('{')).toThrow('Invalid LGS JSON')
    expect(() => parseLgsJsonBuild(JSON.stringify({ ...createLgsJsonBuild(complete), version: 2 }))).toThrow('version')
    expect(() => parseLgsJsonBuild(JSON.stringify({ ...createLgsJsonBuild(complete), tier1Name: {} }))).toThrow(
      'Tier 1'
    )
    expect(() => validateLgsBuild({ ...complete, tier1Name: 'Removed tier' }, data)).toThrow('Unknown Tier 1')
    expect(() => validateLgsBuild({ ...complete, bonusEffectName: 'Water Bonus' }, data)).toThrow('compatible')
  })

  it('uses deterministic fixed-field, checksummed permalinks for complete, partial, and empty builds', () => {
    const permalink = encodeLgsPermalink(complete)
    expect(permalink.split('.')).toHaveLength(8)
    expect(decodeLgsPermalink(permalink)).toEqual(complete)
    expect(encodeLgsPermalink(complete)).toBe(permalink)
    const partial = { ...emptyLgsPlan(), baseItemName: 'Weapon Base', tier1Name: 'Tier 1' }
    expect(decodeLgsPermalink(encodeLgsPermalink(partial))).toEqual(partial)
    expect(decodeLgsPermalink(encodeLgsPermalink(emptyLgsPlan()))).toEqual(emptyLgsPlan())
    const url = new URL(buildLgsPermalinkUrl(complete, 'https://yourddo.example'))
    expect(url.pathname).toBe('/legendary-green-steel')
    expect(url.searchParams.get(LGS_PERMALINK_QUERY_PARAMETER)).toBe(permalink)
  })

  it('rejects malformed and stale permalink selections without accepting arbitrary records', () => {
    const permalink = encodeLgsPermalink(complete)
    expect(() => decodeLgsPermalink(`${permalink.slice(0, -1)}x`)).toThrow('checksum')
    const unsupportedPayload = permalink.replace(/^1/, '2').split('.').slice(0, -1).join('.')
    expect(() => decodeLgsPermalink(`${unsupportedPayload}.${createPermalinkChecksum(unsupportedPayload)}`)).toThrow(
      'version'
    )
    expect(() => decodeLgsPermalink('not-a-permalink')).toThrow('Malformed')
    expect(() => validateLgsBuild({ ...complete, baseItemName: 'Removed base' }, data)).toThrow('Unknown base')
    expect(() => validateLgsBuild({ ...complete, tier1Name: 'Removed tier' }, data)).toThrow('Unknown Tier 1')
    expect(() => validateLgsBuild({ ...complete, bonusEffectName: 'Removed bonus' }, data)).toThrow('Unknown bonus')
    expect(() => validateLgsBuild({ ...complete, activeAugmentName: 'Removed active' }, data)).toThrow('Unknown active')
  })

  it('formats clean, related Discord and forum output without empty sections', () => {
    const view = resolveLgsBuildView(complete, data)
    const discord = formatLgsDiscordMarkdown(view)
    const forum = formatLgsBbCode(view)
    expect(discord).toContain('**Legendary Green Steel**')
    expect(discord).toContain('**Base Item:** Weapon Base (Legendary Green Steel Weapon)')
    expect(discord).toContain('**Tier 3**\nTier 3 Air Fire\nFocus: Air / Fire · Gem: Dominion · Essence: Ethereal')
    expect(discord).toContain('- Good-aligned Weapon')
    expect(discord).toContain('- Electric Spell Power +139 (Equipment)')
    expect(discord).toContain('- Electric Resistance +50% (Equipment)')
    expect(discord).toContain('- Deadly +17')
    expect(discord).toContain('**Bonus Effect:** Air Fire Bonus\nAir and fire synergy.')
    expect(discord).toContain('**Active Augment:** Active Augment\nSpell\nCasts a spell.')
    expect(forum).toContain('[b]Legendary Green Steel[/b]')
    expect(forum).toContain('[i]Focus:[/i] Air / Fire')

    const partial = formatLgsDiscordMarkdown(
      resolveLgsBuildView({ ...emptyLgsPlan(), baseItemName: 'Weapon Base', tier1Name: 'Tier 1' }, data)
    )
    expect(partial).not.toContain('**Tier 2**')
    expect(partial).not.toContain('**Bonus Effect:**')
    expect(partial).not.toContain('**Active Augment:**')
  })
})
