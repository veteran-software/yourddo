import LZString from 'lz-string'
import { describe, expect, it } from 'vitest'
import { collectEquippedEffects } from './effects'
import { normalizeGearPlannerSources } from './normalize'
import { importGearPlannerState } from './plannerStorage'
import { resolveGearPlannerSetState } from './sets'
import { activeGearPlannerSetup, createDefaultGearPlannerState } from './setups'
import { formatGearSetup, gearPlannerPermalink, openGearPlannerLink } from './sharing'

const helm = {
  name: 'Arcsteel Brim',
  type: 'Helmet',
  minLevel: '15',
  pageTitle: 'Arcsteel Brim',
  augments: [{ augmentType: 'Yellow' }],
  enchantments: [{ name: 'Wisdom', modifier: 4, notes: '  While [active], gain *extra* Wisdom.  ' }]
}
const topaz = { name: 'Topaz', augmentType: 'Yellow', minLevel: 1, source: {}, effectsAdded: [] }
const data = normalizeGearPlannerSources(
  [{ fileName: 'helmet.json', records: [helm, { ...helm, minLevel: '29' }] }],
  [topaz]
)
const id = 'Head|Arcsteel Brim|15|helmet.json'
const meta = { name: '[Raid] *tank*', minLevel: 10, maxLevel: 36 }
const mythicBoost = { name: 'Mythic Defense', modifier: 2, bonus: 'Mythic' }
const oldSetup = {
  ...meta,
  id: 'old',
  slots: { Head: { ...helm, id, enchantments: [{ name: 'Retired enchantment' }] } },
  slottedAugments: { [id]: { 0: topaz } },
  slottedMythicBoost: { [id]: mythicBoost }
}
const current = createDefaultGearPlannerState()
const pairs = [[0, 'Topaz']]
const legacyItem = ['Head', helm.name, pairs, null, null, null, null, null, [], null, null, 15, null, 0, 0]
const encode = (value: unknown) => LZString.compressToEncodedURIComponent(JSON.stringify(value))

describe('Gear Planner sharing', () => {
  it.each([
    ['original setup array', [oldSetup]],
    [
      'versioned export',
      { version: 1, setups: [{ ...oldSetup, slottedMythicBoost: undefined, itemUpgrades: { [id]: { mythicBoost } } }] }
    ]
  ])('imports the %s using current equipment, upgrades and socket data', (_, payload) => {
    const { state, issues } = importGearPlannerState(JSON.stringify(payload), data)
    const setup = activeGearPlannerSetup(state)
    expect(issues).toEqual([])
    expect(setup.equipment.Head?.source).toBe(helm)
    expect(setup.equipment.Head?.crafts).toMatchObject([{ system: 'mythic', id: '2' }])
    expect(setup.slottedAugments[data.itemsBySlot.Head[0].id]?.[0]).toBe(topaz)
    expect(setup.minimumLevel).toBe(10)
  })

  it('reports ambiguous and unsupported legacy selections by setup', () => {
    const raw = {
      ...oldSetup,
      classes: ['Druid'],
      druidPet: { slots: { armor: { name: 'Pet armor' } } },
      slots: { Head: { name: helm.name } }
    }
    const { state, issues } = importGearPlannerState(JSON.stringify([raw]), data)
    expect(state.setups[0].equipment.Head).toBeNull()
    expect(state.setups[0].character.classes).toEqual(['Druid'])
    expect(issues.map((i) => i.message).join(' ')).toMatch(/Unsupported slot: armor.*could not uniquely match/)
  })

  it.each([
    ['original tuple', [meta.name, 10, 36, [], [], [], [], 0, [legacyItem]]],
    [
      'structured payload',
      {
        version: 2,
        setup: meta,
        items: [{ slot: 'Head', itemName: helm.name, itemId: id, itemMinLevel: 15, augments: pairs, mythicBoost }]
      }
    ]
  ])('opens a legacy link with the %s', (_, legacy) => {
    const { state, issues } = openGearPlannerLink(encode(legacy), current, data)
    const added = activeGearPlannerSetup(state)
    expect(issues).toEqual([])
    expect(state.setups[0]).toBe(current.setups[0])
    expect(added.equipment.Head?.source).toBe(helm)
    expect(added.slottedAugments[data.itemsBySlot.Head[0].id]?.[0]).toBe(topaz)
  })

  it('shares only the active setup, preserves existing builds and detects damaged links', () => {
    const original = importGearPlannerState(JSON.stringify([oldSetup]), data).state
    const setup = activeGearPlannerSetup(original)
    const url = new URL(gearPlannerPermalink(setup, 'https://example.test/gear-planner?old=1#fragment'))
    expect(url.search).toBe('')
    const code = new URLSearchParams(url.hash.slice(1)).get('gp') ?? ''
    const { state, issues } = openGearPlannerLink(code, original, data)
    expect(issues).toEqual([])
    expect(state.setups).toHaveLength(2)
    expect(state.setups[0]).toBe(setup)
    expect(state.setups[1]).toEqual({ ...setup, id: state.activeSetupId })
    expect(state.activeSetupId).not.toBe(setup.id)
    expect(() => openGearPlannerLink(code.replace(/^3\.[^.]+/, '3.bad'), original, data)).toThrow(/damaged/)
    expect(() => openGearPlannerLink(encode({ version: 2, setup: meta, items: [{}] }), original, data)).toThrow(
      /Invalid/
    )
    expect(original.setups).toHaveLength(1)
  })

  it('restores a shared augment after a CDN description change only when its identity is unambiguous', () => {
    const original = activeGearPlannerSetup(importGearPlannerState(JSON.stringify([oldSetup]), data).state)
    const url = new URL(gearPlannerPermalink(original, 'https://example.test/gear-planner'))
    const code = new URLSearchParams(url.hash.slice(1)).get('gp') ?? ''
    const updated = { ...topaz, source: { description: 'Updated' } }
    const restored = openGearPlannerLink(code, current, { ...data, augments: [updated] })
    expect(activeGearPlannerSetup(restored.state).slottedAugments[data.itemsBySlot.Head[0].id]?.[0]).toBe(updated)
    expect(restored.issues).toEqual([])
    const ambiguous = openGearPlannerLink(code, current, {
      ...data,
      augments: [updated, { ...updated, source: { description: 'Second' } }]
    })
    expect(ambiguous.issues.map((i) => i.kind)).toContain('missing-augment')
  })

  it('exports distinct Discord and forum markup with equipped upgrades, socket and current effects', () => {
    const setup = activeGearPlannerSetup(importGearPlannerState(JSON.stringify([oldSetup]), data).state)
    const effects = collectEquippedEffects(setup.equipment, setup.slottedAugments)
    const sets = resolveGearPlannerSetState(setup.equipment, setup.slottedAugments)
    const link = gearPlannerPermalink(setup, 'https://example.test/gear-planner')
    const discord = formatGearSetup(setup, effects, { Character: sets }, 'Discord Markdown', link)
    const forum = formatGearSetup(setup, effects, { Character: sets }, 'Forum BBCode', link)
    expect(discord).toContain(`[View on YourDDO](${link})`)
    expect(forum).toContain(`[url=${link}]View on YourDDO[/url]`)
    expect(discord).toContain('**[Raid] \\*tank\\***')
    expect(forum).toContain('[b]&#91;Raid&#93; *tank*[/b]')
    expect(discord).toContain(String.raw`- Wisdom 4 — While [active], gain \*extra\* Wisdom.`)
    expect(forum).toContain('• Wisdom 4 — While &#91;active&#93;, gain *extra* Wisdom.')
    for (const output of [discord, forum]) {
      expect(output).toContain('Arcsteel Brim (ML 15)')
      expect(output).toContain('Mythic Boost +2')
      expect(output).toContain('Augment 1: Topaz')
      expect(output).toContain('Wisdom')
      expect(output).not.toContain('Retired enchantment')
    }
  })
})
