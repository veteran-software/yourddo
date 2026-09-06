import { describe, expect, it, vi } from 'vitest'
import {
  InvalidGearPlannerDataError,
  loadGearPlannerData,
  parseGearPlannerAugmentDataset,
  parseGearPlannerFiligreeSetDataset,
  parseGearPlannerItemDataset
} from './data.ts'
import { gearPlannerSlots, type GearPlannerSourceItem } from './gearPlanner.types.ts'
import {
  gearPlannerFiligreeId,
  gearPlannerItemId,
  normalizeGearPlannerFiligrees,
  normalizeGearPlannerSources
} from './normalize.ts'

const item = (name: string, type?: string): GearPlannerSourceItem => ({
  name,
  ...(type === undefined ? {} : { type }),
  minLevel: '10',
  enchantments: [{ name: 'Strength', modifier: '2', bonus: 'Enhancement' }]
})

const normalize = (fileName: string, records: readonly GearPlannerSourceItem[]) =>
  normalizeGearPlannerSources([{ fileName, records }], [])

describe('Gear Planner data validation', () => {
  it('keeps only base reforging items in normal browsing while retaining unrelated upgraded records', () => {
    const normalized = normalizeGearPlannerSources(
      [
        {
          fileName: 'dagger.json',
          records: [
            { name: 'Reforged Blade', pageTitle: 'Reforged Blade', minLevel: 10 },
            {
              name: 'Reforged Blade',
              pageTitle: 'Reforged Blade (Nearly Finished Upgraded)',
              minLevel: 10
            },
            { name: 'Other Upgrade', pageTitle: 'Other Upgrade (Upgraded)', minLevel: 10 }
          ]
        }
      ],
      [],
      new Set(['Reforged Blade'])
    )

    expect(new Set(normalized.items.map(({ source }) => source.pageTitle))).toEqual(
      new Set(['Reforged Blade', 'Other Upgrade (Upgraded)'])
    )
  })

  it('accepts current optional item omissions without discarding source metadata', () => {
    const [parsed] = parseGearPlannerItemDataset(
      [
        {
          name: 'Dynamistic Quiver',
          minLevel: '14',
          type: '',
          dropLocations: null,
          enchantments: null
        }
      ],
      'quiver.json'
    )

    expect(parsed).toMatchObject({ name: 'Dynamistic Quiver', type: '', dropLocations: null, enchantments: null })
  })

  it('reports source file, record, and property for malformed records', () => {
    expect(() => parseGearPlannerItemDataset([{ name: '' }], 'goggles.json')).toThrow(
      'goggles.json[0].name: expected non-empty string'
    )
    expect(() => parseGearPlannerItemDataset({ name: 'not an array' }, 'goggles.json')).toThrow(
      'goggles.json: expected array'
    )
    expect(() => parseGearPlannerItemDataset([{ name: 'Broken', augments: [{}] }], 'goggles.json')).toThrow(
      'goggles.json[0].augments[0].augmentType: expected non-empty string'
    )
    expect(() => parseGearPlannerItemDataset([{ name: '' }], 'goggles.json')).toThrow(InvalidGearPlannerDataError)
  })

  it('validates and preserves augment fields used by later selection', () => {
    const [augment] = parseGearPlannerAugmentDataset([
      {
        name: 'Ruby of Strength',
        augmentType: 'Red',
        minLevel: 8,
        effectsAdded: [{ name: 'Strength', modifier: '2', bonus: 'Enhancement' }],
        setBonus: [{ name: 'Example Set' }],
        image: 'ruby'
      }
    ])

    expect(augment).toMatchObject({
      name: 'Ruby of Strength',
      augmentType: 'Red',
      minLevel: 8,
      effectsAdded: [{ name: 'Strength', modifier: '2', bonus: 'Enhancement' }],
      setBonus: [{ name: 'Example Set' }]
    })
    expect(augment.source.image).toBe('ruby')
  })

  it('accepts a blank augmentType from the current dataset', () => {
    const [augment] = parseGearPlannerAugmentDataset([
      { name: 'Green Steel Augment', augmentType: '', minLevel: 26, effectsAdded: [] }
    ])

    expect(augment.augmentType).toBe('')
  })

  it('normalizes filigree sets without losing name-only source effects', () => {
    const [set] = parseGearPlannerFiligreeSetDataset([
      {
        name: 'Test Filigree Set',
        bonuses: [
          { threshold: 2, enhancements: [{ description: 'Permanent Test Effect' }, { name: 'Strength', modifier: 1 }] }
        ]
      }
    ])
    expect(set.thresholds[0]).toEqual({
      threshold: 2,
      effects: [
        { description: 'Permanent Test Effect', name: 'Permanent Test Effect' },
        { name: 'Strength', modifier: 1 }
      ]
    })
  })
})

describe('Gear Planner source normalization', () => {
  it('maps standard accessories to their planner slots', () => {
    expect(
      normalize('goggles.json', [item('Keen Goggles', 'Goggles')]).itemsBySlot[gearPlannerSlots.eyes]
    ).toHaveLength(1)
    expect(normalize('helmet.json', [item('Keen Helm', 'Helmet')]).itemsBySlot[gearPlannerSlots.head]).toHaveLength(1)
    expect(
      normalize('trinket.json', [item('Keen Trinket', 'Trinket')]).itemsBySlot[gearPlannerSlots.trinket]
    ).toHaveLength(1)
  })

  it('creates slot-distinct copies for rings and one-handed weapons', () => {
    const ring = item('Ring of Tests', 'Ring')
    const ringData = normalize('ring.json', [ring])
    const first = ringData.itemsBySlot[gearPlannerSlots.firstFinger][0]
    const second = ringData.itemsBySlot[gearPlannerSlots.secondFinger][0]
    expect(first.id).not.toBe(second.id)
    expect(first.source).toBe(ring)
    expect(second.source).toBe(ring)

    const weaponData = normalize('dagger.json', [item('Test Dagger', 'Dagger')])
    expect(weaponData.itemsBySlot[gearPlannerSlots.mainHand]).toHaveLength(1)
    expect(weaponData.itemsBySlot[gearPlannerSlots.offHand]).toHaveLength(1)
  })

  it('keeps two-handed weapons out of Off Hand and maps off-hand special categories', () => {
    const twoHanded = normalize('greatAxe.json', [item('Test Great Axe', 'Great Axe')])
    expect(twoHanded.itemsBySlot[gearPlannerSlots.mainHand]).toHaveLength(1)
    expect(twoHanded.itemsBySlot[gearPlannerSlots.offHand]).toHaveLength(0)

    for (const [fileName, type] of [
      ['buckler.json', 'Buckler'],
      ['orb.json', 'Orb'],
      ['runeArm.json', 'Rune Arm']
    ] as const) {
      expect(normalize(fileName, [item(`Test ${type}`, type)]).itemsBySlot[gearPlannerSlots.offHand]).toHaveLength(1)
    }
  })

  it('preserves legacy armor and quiver loader acceptance', () => {
    const armor = normalize('heavyArmor.json', [item('Plate', 'Heavy Armor'), item('Bad Armor', 'Ring')])
    expect(armor.itemsBySlot[gearPlannerSlots.armor]).toHaveLength(1)
    expect(armor.rejectedItemCount).toBe(1)

    expect(normalize('quiver.json', [item('Bound Quiver', 'bound')]).itemsBySlot[gearPlannerSlots.quiver]).toHaveLength(
      1
    )
    expect(normalize('quiver.json', [item('Bad Quiver', 'Potion')]).itemsBySlot[gearPlannerSlots.quiver]).toHaveLength(
      0
    )
  })

  it('loads pet source records without adding pet UI state', () => {
    const docent = normalize('docent.json', [item('Test Docent', 'Docent')])
    expect(docent.itemsBySlot[gearPlannerSlots.armor]).toHaveLength(1)
    expect(docent.itemsBySlot[gearPlannerSlots.ironDefenderArmor]).toHaveLength(1)
    expect(docent.itemsBySlot[gearPlannerSlots.wolfCompanionArmor]).toHaveLength(1)

    const collar = normalize('collar.json', [item('Kindred Spirit', 'Collar'), item('Pet Fang', 'Collar')])
    expect(collar.itemsBySlot[gearPlannerSlots.ironDefenderArmor]).toHaveLength(1)
    expect(collar.itemsBySlot[gearPlannerSlots.wolfCompanionArmor]).toHaveLength(1)
    expect(collar.itemsBySlot[gearPlannerSlots.ironDefenderWeapon]).toHaveLength(1)
    expect(collar.itemsBySlot[gearPlannerSlots.wolfCompanionWeapon]).toHaveLength(1)
  })

  it('creates stable IDs without mutating raw source records', () => {
    const source = item('Stable Ring', 'Ring')
    const before = structuredClone(source)
    const first = normalize('ring.json', [source])
    const second = normalize('ring.json', [source])

    expect(first.items.map(({ id }) => id)).toEqual(second.items.map(({ id }) => id))
    expect(source).toEqual(before)
    expect(gearPlannerItemId('ring.json', source, gearPlannerSlots.firstFinger)).toContain('First%20Finger')
  })

  it('uses page title rather than duplicate display names for filigree identity', () => {
    const first: GearPlannerSourceItem = { name: 'Duplicated name', pageTitle: 'First source page', grouping: 'Set A' }
    const second: GearPlannerSourceItem = {
      name: 'Duplicated name',
      pageTitle: 'Second source page',
      grouping: 'Set A'
    }
    expect(gearPlannerFiligreeId(first)).not.toBe(gearPlannerFiligreeId(second))
    expect(normalizeGearPlannerFiligrees([first, second]).map(({ id }) => id)).toEqual([
      gearPlannerFiligreeId(first),
      gearPlannerFiligreeId(second)
    ])
  })
})

describe('Gear Planner production CDN validation', () => {
  it.runIf(import.meta.env.VITE_GEAR_PLANNER_CDN === '1')('loads and validates current CDN data', async () => {
    const nativeFetch = globalThis.fetch
    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
      const requestedUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      const url = requestedUrl.replace('/data-cdn/', 'https://cdn.yourddo.com/')
      return nativeFetch(url, init)
    })
    try {
      const data = await loadGearPlannerData()
      const filigreeNameCounts = new Map<string, number>()
      for (const { name } of data.filigrees) filigreeNameCounts.set(name, (filigreeNameCounts.get(name) ?? 0) + 1)
      const duplicateFiligreeDisplayNameGroups = [...filigreeNameCounts.values()].filter((count) => count > 1).length
      const duplicateFiligreeDisplayNameRecords = [...filigreeNameCounts.values()].reduce(
        (total, count) => total + Math.max(0, count - 1),
        0
      )
      console.info(
        JSON.stringify({
          sources: data.sourceDatasets.map(({ fileName, records }) => [fileName, records.length]),
          slots: Object.entries(data.itemsBySlot).map(([slot, items]) => [slot, items.length]),
          rawItemCount: data.rawItemCount,
          normalizedItemCount: data.normalizedItemCount,
          rejectedItemCount: data.rejectedItemCount,
          augmentCount: data.augments.length,
          filigreeCount: data.filigrees.length,
          distinctFiligreeIds: new Set(data.filigrees.map(({ id }) => id)).size,
          duplicateFiligreeDisplayNameGroups,
          duplicateFiligreeDisplayNameRecords,
          filigreeSetDefinitionCount: data.filigreeSetDefinitions.length,
          filigreeSetNames: data.filigreeSetDefinitions.length,
          unresolvedFiligreeSetNames: [
            ...new Set(
              data.filigrees.flatMap(({ grouping }) =>
                (grouping ?? '')
                  .split('/')
                  .map((name) => name.trim())
                  .filter(Boolean)
              )
            )
          ].filter((name) => !data.filigreeSetDefinitionByName.has(name)),
          examples: {
            sentient: data.items.find(({ source, minimumLevel }) => source.type === 'Dagger' && minimumLevel >= 20)
              ?.source.name,
            minorArtifact: data.items.find(({ source }) => (source.artifactType?.trim().length ?? 0) > 0)?.source.name,
            directEffect: data.filigrees.find(({ source }) => (source.enchantments?.length ?? 0) > 0)?.name,
            grouped: data.filigrees.find(({ grouping }) => grouping)?.name,
            thresholds: data.filigreeSetDefinitions[0]?.thresholds.map(({ threshold }) => threshold)
          }
        })
      )
      expect(data.items.length).toBe(data.normalizedItemCount)
      expect(data.filigrees.length).toBeGreaterThan(0)
      expect(new Set(data.filigrees.map(({ id }) => id)).size).toBe(data.filigrees.length)
      expect(data.filigreeSetDefinitions.length).toBeGreaterThan(0)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
