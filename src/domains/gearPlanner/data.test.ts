import { catalogWeaponTypes, changeClasses, characterAllowsItem, classNames, defaultCharacter } from './character'
import { describe, expect, it, vi } from 'vitest'
import * as datasets from '../../shared/data/loadDataset'
import { adaptItemCategory, effectIndex, loadCatalogCurses, resolveEffects, scopedAugmentReader } from './itemCatalog'
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
  it('joins native effect variants and keeps identically named game items distinct in both ring slots', () => {
    const ring = {
      id: 100,
      name: 'Twin Ring',
      itemType: 'Ring',
      type: 'Jewelry',
      minimumLevel: 29,
      baseStats: { equipSlots: ['Finger1', 'Finger2'] },
      iconLayers: [],
      effects: [{ effectId: 1, variant: 'large' }],
      augmentSlots: [{ name: 'Yellow Augment Slot' }],
      equipmentSets: [{ id: 3, name: 'Set A' }]
    }
    const variants = [3, 9].map((value, i) => ({
      variant: i ? 'large' : 'small',
      displayName: 'Strength',
      enchantments: [{ displayName: 'Strength', value, bonusType: 'Enhancement' }]
    }))
    const categories = adaptItemCategory(
      [ring, { ...ring, id: 101, effects: [{ effectId: 1, variant: 'small' }] }],
      [{ id: 1, variants }],
      new Map(),
      new Map()
    )
    const data = normalizeGearPlannerSources(categories, [])
    expect(new Set(data.items.map(({ id }) => id)).size).toBe(4)
    expect(data.itemsBySlot['Second Finger'].map(({ source }) => source.enchantments?.[0].modifier)).toEqual([9, 3])
    expect(data.itemsBySlot['First Finger'][0].source).toMatchObject({
      augments: [{ augmentType: 'Yellow' }],
      setBonus: [{ name: 'Set A' }]
    })
    expect(() => adaptItemCategory([ring], [], new Map(), new Map())).toThrow('Missing effect 1/large')
  })
  it('resolves public augment rows by exact variant and applies only equipped or slotted effects', () => {
    const dice = 'Eldritch Blast: Dice'
    const pact = 'Eldritch Blast: Pact Dice'
    const effects = [
      {
        id: 17,
        variants: [
          {
            variant: 'gem',
            displayedOnClient: false,
            displayName: 'Blast Dice',
            enchantments: [
              { displayName: dice, value: 2, bonusType: 'Artifact' },
              { displayName: 'Callback', value: 1, internal: true },
              { displayName: 'Set marker', value: 1, bonusType: 'Condition' },
              { displayName: pact, value: 1, hidden: true }
            ]
          },
          {
            variant: 'filigree',
            hidden: true,
            displayName: 'Blast Dice',
            enchantments: [{ displayName: pact, value: 8 }]
          }
        ]
      }
    ]
    const read = scopedAugmentReader(effects, [dice, pact])
    const ref = { effectId: 17, variant: 'gem', activation: 'Augment_OnEquipEffects' }
    const resolved = read({ effects: [ref] })
    expect(resolved.presentation).toEqual([
      { name: 'Blast Dice', rows: [{ name: dice, modifier: 2, bonus: 'Artifact' }] }
    ])
    expect(resolved.effectsAdded).toEqual(resolved.presentation[0].rows)
    expect(resolved.searchLabels).toEqual([dice])
    expect(read({ effects: [{ ...ref, activation: 'onHit' }] }).effectsAdded).toEqual([])
    expect(read({ effects: [], description: 'Slotted effect text.' })).toMatchObject({
      fallbackDescription: 'Slotted effect text.',
      effectsAdded: []
    })
    const other = { effects: [{ ...ref, variant: 'filigree' }], description: 'Hidden variant' }
    expect(read(other)).toEqual({ presentation: [], effectsAdded: [], searchLabels: [] })
    expect(resolveEffects(other, 'Filigree', effectIndex(effects, 'augment'), new Map())).toEqual([])
    expect(() => read({ effects: [{ ...ref, variant: 'missing' }] })).toThrow('Missing effect 17/missing')
  })

  it('omits hidden effects and variants without hiding visible siblings', () => {
    const ring = {
      id: 1,
      name: 'Test Ring',
      itemType: 'Ring',
      baseStats: { equipSlots: ['Finger1'] },
      iconLayers: [],
      effects: [
        { effectId: 1, variant: 'visible' },
        { effectId: 1, variant: 'hidden' },
        { effectId: 2, variant: 'child' },
        { effectId: 3 }
      ]
    }
    const effects = [
      {
        id: 1,
        variants: [
          {
            variant: 'visible',
            displayName: 'Visible',
            enchantments: [{ hidden: true, displayName: 'Hidden child', value: 4 }]
          },
          { variant: 'hidden', hidden: true, displayName: 'Hidden variant' }
        ]
      },
      { id: 2, hidden: true, variants: [{ variant: 'child', displayName: 'Hidden parent' }] },
      { id: 3, hidden: true, displayName: 'Hidden effect', enchantments: [{ displayName: 'Hidden stat', value: 1 }] }
    ]
    const [category] = adaptItemCategory([ring], effects, new Map(), new Map())
    expect(category.records[0].enchantments?.map((effect) => effect.name)).toEqual(['Visible'])
  })

  it('suppresses a hidden curse effect and its description fallback while preserving visible siblings', async () => {
    const curse = { name: 'Test curse', description: 'Hidden bonus', drawTableId: 1 }
    const records: Record<string, unknown> = {
      curses: [
        { ...curse, equippedEffectIds: [11] },
        { ...curse, name: 'Mixed curse', equippedEffectIds: [11, 12] },
        { ...curse, name: 'Description only', description: 'Visible description', equippedEffectIds: [] }
      ],
      effects: [
        { id: 11, hidden: true, displayName: 'Hidden bonus' },
        { id: 12, displayName: 'Visible bonus' }
      ],
      'draw-tables': [{ id: 1, name: 'Test table' }]
    }
    const read = vi
      .spyOn(datasets, 'loadDatasetFile')
      .mockImplementation((path) => Promise.resolve(records[path.slice('deck-of-many-curses/'.length, -5)]))
    try {
      const [hidden, mixed, described] = await loadCatalogCurses()
      expect(hidden.enchantments).toEqual([])
      expect(mixed.enchantments.map((effect) => effect.name)).toEqual(['Visible bonus'])
      expect(described.enchantments).toEqual([{ name: 'Description only', notes: 'Visible description' }])
    } finally {
      read.mockRestore()
    }
  })

  it('displays cooldown, regeneration interval and damage reductions from the remaining fraction', () => {
    const helm = {
      id: 1,
      name: 'Test Helm',
      itemType: 'Head',
      baseStats: { equipSlots: ['Head'] },
      iconLayers: [],
      effects: [{ effectId: 2 }]
    }
    const enchantments = [
      { name: 'ActionAgent_CooldownModArray', displayName: 'Skill Cooldown: Bluff', unit: 'multiplier', value: 0.85 },
      {
        name: 'Character_RegenerationIntervalMultiplier_SmiteEvil',
        displayName: 'Smite Evil: Regeneration Rate',
        unit: 'multiplier',
        value: 0.9
      },
      { displayName: 'Other multiplier', unit: 'multiplier', value: 0.856 },
      { displayName: 'Elemental Absorption: Fire', unit: 'multiplier', value: 0.72249997 },
      { displayName: 'Elemental Absorption: Cold', unit: 'multiplier', value: 0.8125 },
      { displayName: 'Elemental Absorption: Acid', unit: 'percent', value: 12.5 },
      { name: 'Effect_SpellCostMultiplier', displayName: 'Spell Point Cost', value: 0.1 },
      { name: 'Combat_MissileChanceToReturn', displayName: 'Returning Chance', value: 1 },
      { name: 'BaseWeaponDamageDiceModifier', displayName: 'Weapon Damage Dice', value: 0.5 }
    ]
    const [category] = adaptItemCategory([helm], [{ id: 2, enchantments }], new Map(), new Map())
    expect(category.records[0].enchantments?.map((stat) => stat.modifier)).toEqual([
      '15%',
      '10%',
      '86%',
      '28%',
      '19%',
      '12%',
      '10%',
      '100%',
      0.5
    ])
  })

  it('reads published signed percentages, fractional points and minor artifact status directly', () => {
    const [category] = adaptItemCategory(
      [
        {
          id: 1,
          name: 'Artifact',
          itemType: 'Trinket',
          isMinorArtifact: true,
          minimumLevel: 34,
          baseStats: { equipSlots: ['Trinket'] },
          iconLayers: [],
          effects: [{ effectId: 2 }]
        }
      ],
      [
        {
          id: 2,
          enchantments: [
            {
              name: 'Effect_SpellCostMultiplier',
              displayName: 'Spell Point Cost',
              unit: 'percent',
              percentBasis: 'relative',
              value: -10
            },
            {
              name: 'Spell_DamageMod_SlashPower',
              displayName: 'Spell Power: Slashing',
              unit: 'points',
              value: 38.799998
            },
            { displayName: 'Returning Chance', name: 'Combat_MissileChanceToReturn', unit: 'percent', value: 100 }
          ]
        }
      ],
      new Map(),
      new Map()
    )
    expect(category.records[0]).toMatchObject({
      artifactType: 'Minor',
      enchantments: [
        { name: 'Spell Point Cost', modifier: '-10%' },
        { name: 'Spell Power: Slashing', modifier: 38, calculationValue: 38.799998 },
        { name: 'Returning Chance', modifier: '100%' }
      ]
    })
  })

  it('reads coefficient spell power in points and preserves equipment percentage penalties', () => {
    const helm = {
      id: 1,
      name: 'Test Helm',
      itemType: 'Head',
      baseStats: { equipSlots: ['Head'] },
      iconLayers: [],
      effects: [{ effectId: 2 }]
    }
    const enchantments = [
      { name: 'Spell_DamageMod_FirePower', displayName: 'Spell Power: Fire', unit: 'coefficient', value: 1.395 },
      {
        name: 'SpellPoints@Agent::m_fEffectScalar',
        displayName: 'Maximum Spell Points',
        unit: 'coefficient',
        value: 0.05,
        operation: 'Subtract'
      }
    ]
    const [category] = adaptItemCategory([helm], [{ id: 2, enchantments }], new Map(), new Map())
    expect(category.records[0].enchantments?.map((stat) => stat.modifier)).toEqual([140, '-5%'])
  })

  it('distinguishes item-set percentage ratios from flat stat and weapon-dice modifiers', () => {
    const enhancements = [
      { name: 'Spell Critical Chance: Electric', modifier: 0.05 },
      { name: 'Melee Threat', modifier: 1 },
      { name: 'Spell Power: Electric', modifier: '25' },
      { name: 'Damage Dice (W)', modifier: '0.5' },
      { name: 'Doubleshot Chance', modifier: '15%' }
    ]
    const [set] = parseGearPlannerFiligreeSetDataset(
      [{ name: 'Set', bonuses: [{ threshold: 3, enhancements }] }],
      'itemSets.enchantments'
    )
    expect(set.thresholds[0].effects.map((effect) => effect.modifier)).toEqual(['5%', '100%', '25', '0.5', '15%'])
  })

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
    const requested: string[] = []
    const nativeFetch = globalThis.fetch
    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
      const requestedUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      const url = requestedUrl.replace('/data-cdn/', 'https://cdn.yourddo.com/')
      requested.push(url)
      return nativeFetch(url, init)
    })
    try {
      const data = await loadGearPlannerData()
      expect(requested.filter((url) => /\/(?:gear-planner|master)\/|\/manual\/deckOfManyCurses/.test(url))).toEqual([])
      for (const path of [
        'items/manifest.json',
        'items/augments/standard.json',
        'items/augments/filigrees.json',
        'items/augments/sets.json',
        'deck-of-many-curses/curses.json'
      ])
        expect(requested.some((url) => url.endsWith('/' + path))).toBe(true)
      expect(data.curses.find((c) => c.name === 'Curse of Major Spellwork')?.enchantments).toContainEqual(
        expect.objectContaining({ name: 'Universal Spell Power', modifier: 10 })
      )
      for (const [name, pieces] of [
        ['Celerity', 2],
        ['The Enlightened Step', 5],
        ['Dreadbringer', 5]
      ] as const) {
        expect(
          data.filigreeSetDefinitionByName.get(name)?.thresholds.find((tier) => tier.threshold === pieces)?.effects,
          name
        ).toEqual([])
      }
      for (const [setName, pieces, name, modifier] of [
        ['Paragon Guard', 3, 'Armor Class', '15%'],
        ['Dread Stalker', 3, 'Melee Power', 15],
        ['Dread Stalker', 3, 'Damage vs. Helpless', '15%']
      ] as const) {
        const set = data.filigreeSetDefinitionByName.get(setName) ?? data.standardSets?.get(setName)
        expect(set?.thresholds.find((t) => t.threshold === pieces)?.effects, setName).toContainEqual(
          expect.objectContaining({ name, modifier })
        )
      }
      expect(data.curses.find((c) => c.name === "Curse of Weapon's Touch")?.enchantments).toContainEqual(
        expect.objectContaining({ name: 'Doublestrike', modifier: '2%' })
      )
      const truthfulBlow = data.augments.find((augment) => augment.name === 'Set Augment: Truthful Blow')
      expect(truthfulBlow?.discrepancyNotes).toEqual([
        'Truthful Blow (3-piece): Fortification Bypass. The description lists 15%. The in-game value is 30%.'
      ])
      const card = data.items.find(({ source }) => source.name === 'Legendary Library Card')
      const cooldowns = card?.source.enchantments?.filter((effect) => effect.name.startsWith('Skill Cooldown:'))
      expect(cooldowns?.map((effect) => effect.modifier)).toEqual(Array(6).fill('15%'))
      const weaponTypes = catalogWeaponTypes(data)
      for (const className of classNames) {
        const character = changeClasses(defaultCharacter(), [className], weaponTypes)
        for (const type of character.weapons) {
          expect(
            data.itemsBySlot['Main Hand'].some(
              (candidate) => candidate.source.type === type && characterAllowsItem(character, candidate)
            ),
            className + ' / ' + type
          ).toBe(true)
        }
      }
      expect(changeClasses(defaultCharacter(), ['Bard'], weaponTypes).weapons).toContain('Long Sword')
      expect(changeClasses(defaultCharacter(), ['Monk'], weaponTypes).weapons).toContain('Hand Axe')
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
      expect(data.items).toHaveLength(data.normalizedItemCount)
      expect(new Set(data.items.map(({ id }) => id)).size).toBe(data.items.length)
      expect(
        data.sourceDatasets.every(({ records }) => records.every(({ catalogId }) => Number.isSafeInteger(catalogId)))
      ).toBe(true)
      expect(data.filigrees.length).toBeGreaterThan(0)
      expect(new Set(data.filigrees.map(({ id }) => id)).size).toBe(data.filigrees.length)
      expect(data.filigreeSetDefinitions.length).toBeGreaterThan(0)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
