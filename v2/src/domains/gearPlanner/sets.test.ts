import { describe, expect, it, vi } from 'vitest'
import { loadGearPlannerData } from './data.ts'
import { aggregateEffectSummary, conflictEligibleEffectSources, resolveEffectConflicts } from './effects.ts'
import { type GearPlannerAugment, type GearPlannerItem, gearPlannerSlots } from './gearPlanner.types.ts'
import {
  createEmptyGearPlannerEquipment,
  createEmptyGearPlannerSelectionState,
  equipGearPlannerItem,
  equipGearPlannerItemInSelection,
  type GearPlannerCharacterSlot,
  setGearPlannerSlottedAugment
} from './planner.ts'
import { collectActiveSetEffectSources, resolveGearPlannerSetState } from './sets.ts'
import {
  type GearPlannerStandardSetDefinition,
  standardGearPlannerSetDefinitionByName
} from './standardSetDefinitions.ts'

const definitions = new Map<string, GearPlannerStandardSetDefinition>([
  [
    'Set A',
    {
      name: 'Set A',
      thresholds: [
        { threshold: 2, effects: [{ name: 'Strength', modifier: 2, bonus: 'Artifact' }] },
        { threshold: 3, effects: [{ name: 'Melee Power', modifier: 5, bonus: 'Artifact' }] },
        { threshold: 5, effects: [{ name: 'Damage', modifier: 3, bonus: 'Artifact' }] }
      ]
    }
  ],
  ['Set B', { name: 'Set B', thresholds: [{ threshold: 2, effects: [{ name: 'Wisdom', modifier: 2 }] }] }]
])

const item = (
  id: string,
  slot: GearPlannerCharacterSlot,
  name: string,
  setNames: readonly string[],
  augments?: GearPlannerItem['source']['augments'],
  enchantments?: GearPlannerItem['source']['enchantments']
): GearPlannerItem => ({
  id,
  slot,
  sourceFile: 'test.json',
  minimumLevel: 1,
  source: {
    name,
    setBonus: setNames.map((setName) => ({ name: setName })),
    ...(augments === undefined ? {} : { augments }),
    ...(enchantments === undefined ? {} : { enchantments })
  }
})

const augment = (name: string, setNames: readonly string[]): GearPlannerAugment => ({
  name,
  augmentType: 'Colorless',
  minLevel: 1,
  effectsAdded: [],
  setBonus: setNames.map((setName) => ({ name: setName })),
  source: { name, augmentType: 'Colorless', minLevel: 1, effectsAdded: [] }
})

const equipped = (...items: readonly GearPlannerItem[]) =>
  items.reduce(
    (equipment, plannerItem) =>
      equipGearPlannerItem(equipment, plannerItem.slot as GearPlannerCharacterSlot, plannerItem),
    createEmptyGearPlannerEquipment()
  )

const stateFor = (items: readonly GearPlannerItem[]) => resolveGearPlannerSetState(equipped(...items), {}, definitions)

describe('Gear Planner standard set memberships', () => {
  it('counts equipped item memberships literally, including multiple memberships on one item', () => {
    const single = stateFor([item('head', gearPlannerSlots.head, 'Set Helm', ['Set A'])])
    const multiple = stateFor([
      item('head', gearPlannerSlots.head, 'Set Helm', ['Set A', 'Set B']),
      item('ring', gearPlannerSlots.firstFinger, 'Set Ring', ['Set A'])
    ])
    const duplicate = stateFor([item('head', gearPlannerSlots.head, 'Duplicated Set Helm', ['Set A', 'Set A'])])

    expect(single.sets).toMatchObject([{ name: 'Set A', count: 1 }])
    expect(multiple.sets).toMatchObject([
      { name: 'Set A', count: 2 },
      { name: 'Set B', count: 1 }
    ])
    expect(duplicate.sets).toMatchObject([{ name: 'Set A', count: 2 }])
  })

  it('adds selected augment membership and removes it with its augment or equipped host item', () => {
    const head = item(
      'head',
      gearPlannerSlots.head,
      'Socketed Helm',
      ['Set A'],
      [{ augmentType: 'Colorless', name: 'Socket' }]
    )
    const setAugment = augment('Set Augment: Set A', ['Set A'])
    let selection = equipGearPlannerItemInSelection(createEmptyGearPlannerSelectionState(), gearPlannerSlots.head, head)
    selection = setGearPlannerSlottedAugment(selection, head.id, 0, setAugment)

    expect(
      resolveGearPlannerSetState(selection.equipment, selection.slottedAugments, definitions).sets[0]
    ).toMatchObject({
      name: 'Set A',
      count: 2,
      memberships: [
        { category: 'equipped-item', itemId: 'head', itemName: 'Socketed Helm', slot: 'Head' },
        {
          category: 'augment',
          itemId: 'head',
          itemName: 'Socketed Helm',
          slot: 'Head',
          augmentName: 'Set Augment: Set A',
          augmentSlotIndex: 0
        }
      ]
    })

    selection = setGearPlannerSlottedAugment(selection, head.id, 0, null)
    expect(resolveGearPlannerSetState(selection.equipment, selection.slottedAugments, definitions).sets).toMatchObject([
      { name: 'Set A', count: 1, memberships: [{ category: 'equipped-item' }] }
    ])

    selection = setGearPlannerSlottedAugment(selection, head.id, 0, setAugment)
    selection = equipGearPlannerItemInSelection(selection, gearPlannerSlots.head, null)
    expect(resolveGearPlannerSetState(selection.equipment, selection.slottedAugments, definitions).sets).toEqual([])
  })

  it('drops old memberships and adds new memberships when an item is replaced', () => {
    const oldItem = item('head-a', gearPlannerSlots.head, 'Set A Helm', ['Set A'])
    const newItem = item('head-b', gearPlannerSlots.head, 'Set B Helm', ['Set B'])
    let selection = equipGearPlannerItemInSelection(
      createEmptyGearPlannerSelectionState(),
      gearPlannerSlots.head,
      oldItem
    )
    selection = equipGearPlannerItemInSelection(selection, gearPlannerSlots.head, newItem)

    expect(resolveGearPlannerSetState(selection.equipment, selection.slottedAugments, definitions).sets).toMatchObject([
      { name: 'Set B', count: 1 }
    ])
  })
})

describe('Gear Planner standard set activation', () => {
  it('activates every qualifying threshold and retains partial progress', () => {
    const slots = [
      gearPlannerSlots.head,
      gearPlannerSlots.firstFinger,
      gearPlannerSlots.secondFinger,
      gearPlannerSlots.neck,
      gearPlannerSlots.trinket
    ] as const
    const at = (count: number) =>
      stateFor(
        slots
          .slice(0, count)
          .map((slot, index) => item(`item-${String(index)}`, slot, `Set A ${String(index)}`, ['Set A']))
      )

    expect(at(1).sets[0].thresholds.map(({ isActive }) => isActive)).toEqual([false, false, false])
    expect(at(2).sets[0].thresholds.map(({ isActive }) => isActive)).toEqual([true, false, false])
    expect(at(3).sets[0].thresholds.map(({ isActive }) => isActive)).toEqual([true, true, false])
    expect(at(5).sets[0].thresholds.map(({ isActive }) => isActive)).toEqual([true, true, true])
    expect(at(1).sets[0]).toMatchObject({ name: 'Set A', count: 1 })
  })

  it('keeps unknown definitions countable and effect-free', () => {
    const setState = resolveGearPlannerSetState(
      equipped(item('head', gearPlannerSlots.head, 'Mystery Helm', ['Unknown Set'])),
      {},
      definitions
    )

    expect(setState.sets).toMatchObject([{ name: 'Unknown Set', count: 1, thresholds: [] }])
    expect(setState.unresolvedDefinitionNames).toEqual(['Unknown Set'])
    expect(collectActiveSetEffectSources(setState)).toEqual([])
  })

  it('turns every active threshold into aggregate effect sources with set provenance only', () => {
    const setState = stateFor([
      item('head', gearPlannerSlots.head, 'Set A Helm', ['Set A'], undefined, [
        { name: 'Strength', modifier: 1, bonus: 'Artifact' }
      ]),
      item('ring', gearPlannerSlots.firstFinger, 'Set A Ring', ['Set A']),
      item('second-ring', gearPlannerSlots.secondFinger, 'Set A Ring 2', ['Set A'])
    ])
    const sources = collectActiveSetEffectSources(setState)

    expect(sources).toMatchObject([
      { category: 'set', setName: 'Set A', setThreshold: 2, effect: { name: 'Strength', modifier: 2 } },
      { category: 'set', setName: 'Set A', setThreshold: 3, effect: { name: 'Melee Power', modifier: 5 } }
    ])
    expect(aggregateEffectSummary(sources).find(({ name }) => name === 'Strength')?.groups[0].effectiveValue).toBe(2)
  })

  it('keeps set effects in the summary but out of normal item/augment conflicts', () => {
    const base = [
      {
        id: 'item:strength',
        category: 'equipped-item' as const,
        itemId: 'item',
        itemName: 'Set Helm',
        slot: 'Head',
        effect: { name: 'Strength', modifier: 1, bonus: 'Artifact' },
        normalizedName: 'strength',
        normalizedBonusType: 'artifact',
        comparisonValue: 1
      }
    ]
    const setState = stateFor([
      item('head', gearPlannerSlots.head, 'Set A Helm', ['Set A']),
      item('ring', gearPlannerSlots.firstFinger, 'Set A Ring', ['Set A'])
    ])
    const allSources = [...base, ...collectActiveSetEffectSources(setState)]

    expect(aggregateEffectSummary(allSources).find(({ name }) => name === 'Strength')?.groups[0].effectiveValue).toBe(2)
    expect(resolveEffectConflicts(conflictEligibleEffectSources(allSources)).conflicts).toEqual([])
  })
})

describe('Gear Planner production set-definition audit', () => {
  it.runIf(import.meta.env.VITE_GEAR_PLANNER_CDN === '1')(
    'reports production item and augment set names without inventing effects',
    async () => {
      const nativeFetch = globalThis.fetch
      vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
        const requestedUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
        return nativeFetch(requestedUrl.replace('/data-cdn/', 'https://cdn.yourddo.com/'), init)
      })
      try {
        const data = await loadGearPlannerData()
        const itemNames = new Set(
          data.sourceDatasets.flatMap(({ records }) =>
            records.flatMap((sourceItem) => sourceItem.setBonus?.map(({ name }) => name) ?? [])
          )
        )
        const augmentNames = new Set(
          data.augments.flatMap((sourceAugment) => sourceAugment.setBonus?.map(({ name }) => name) ?? [])
        )
        const itemMemberships = data.sourceDatasets.flatMap(({ fileName, records }) =>
          records.flatMap((sourceItem) =>
            sourceItem.setBonus?.length
              ? [{ fileName, name: sourceItem.name, setNames: sourceItem.setBonus.map(({ name }) => name) }]
              : []
          )
        )
        const names = [...new Set([...itemNames, ...augmentNames])].toSorted((left, right) => left.localeCompare(right))
        const resolved = names.filter((name) => standardGearPlannerSetDefinitionByName.has(name))
        const unresolved = names.filter((name) => !standardGearPlannerSetDefinitionByName.has(name))
        const itemOnly = unresolved.filter((name) => itemNames.has(name) && !augmentNames.has(name))
        const augmentOnly = unresolved.filter((name) => augmentNames.has(name) && !itemNames.has(name))
        const shared = unresolved.filter((name) => itemNames.has(name) && augmentNames.has(name))
        const standardThreePiece = itemMemberships.find(({ setNames }) =>
          setNames.some((name) =>
            standardGearPlannerSetDefinitionByName.get(name)?.thresholds.some(({ threshold }) => threshold === 3)
          )
        )
        const multipleThreshold = itemMemberships.find(({ setNames }) =>
          setNames.some((name) => (standardGearPlannerSetDefinitionByName.get(name)?.thresholds.length ?? 0) > 1)
        )
        const multipleMembership = itemMemberships.find(({ setNames }) => setNames.length > 1)
        const arcaneBarrierAugment = data.augments.find(({ name }) => name === 'Set Augment: Arcane Barrier')

        console.info(
          JSON.stringify({
            distinctSetNames: names.length,
            resolvedStandardSetNames: resolved.length,
            unresolvedSetNames: unresolved.length,
            unresolved,
            unresolvedItemOnly: itemOnly,
            unresolvedAugmentOnly: augmentOnly,
            unresolvedShared: shared,
            examples: {
              standardThreePiece,
              multipleThreshold,
              multipleMembership,
              arcaneBarrierAugment: arcaneBarrierAugment
                ? {
                    name: arcaneBarrierAugment.name,
                    setNames: arcaneBarrierAugment.setBonus?.map(({ name }) => name) ?? []
                  }
                : undefined
            }
          })
        )
        expect(resolved.length + unresolved.length).toBe(names.length)
      } finally {
        vi.unstubAllGlobals()
      }
    }
  )
})
