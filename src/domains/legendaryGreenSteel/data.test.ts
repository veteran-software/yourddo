import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadDatasetFile } from '../../shared/data/loadDataset.ts'
import { loadLgsData, parseLgsResources } from './data.ts'
import { devices, files } from './lgsTestData.ts'
vi.mock('../../shared/data/loadDataset.ts', () => ({ loadDatasetFile: vi.fn() }))

describe('LGS release resources', () => {
  beforeEach(() => {
    vi.mocked(loadDatasetFile).mockReset()
    const paths = Object.fromEntries(Object.keys(files).map((key) => [key, `nested/${key}.json`]))
    const resources = new Map(Object.entries(files).map(([key, file]) => [`legendary-green-steel/${paths[key]}`, file]))
    vi.mocked(loadDatasetFile).mockImplementation((path) =>
      Promise.resolve(
        path === 'legendary-green-steel/manifest.json'
          ? {
              system: 'legendary-green-steel',
              version: 'sha256:' + '0'.repeat(64),
              devices,
              resources: { ...paths, icons: 'icons.json' }
            }
          : resources.get(path)
      )
    )
  })
  it('loads named resources relative to the domain manifest and resolves their IDs', async () => {
    const firstLoad = loadLgsData()
    expect(loadLgsData()).toBe(firstLoad)
    const data = await firstLoad
    expect(loadDatasetFile).toHaveBeenCalledTimes(17)
    expect(data.tier3[0]).toMatchObject({
      id: 6,
      focuses: ['Air', 'Fire'],
      craftedIn: 'tier3 Altar',
      requirements: [{ id: 32, name: 'Tier 3 Component', quantity: 3 }]
    })
    expect(data.activeAugments[0]).toMatchObject({
      displayName: 'Animal Growth',
      name: 'Legendary Green Steel Augment: Animal Growth'
    })
    expect(data.immortalsHeart.requirements).toEqual([{ id: 27, name: 'Codex Rune', quantity: 2500 }])
  })
  it('omits numbered wear modifiers and their placeholder descriptions from displayed effects', () => {
    const [visible] = files.effects
    const wearModifiers = ['Plus 5 Wear Modifier', 'Plus 21 Wear Modifier', '+30 Wear Modifier'].map(
      (displayName, i) => ({
        id: 900 + i,
        displayName,
        description: '..'
      })
    )
    const base = { ...files.baseItems[0], effectIds: [visible.id, ...wearModifiers.map((effect) => effect.id)] }
    const data = parseLgsResources(
      { ...files, effects: [...files.effects, ...wearModifiers], baseItems: [base] },
      devices
    )
    expect(data.baseItems[0]).toMatchObject({ effects: [visible.displayName], details: [] })
  })
  it('reads configured weapon rules without an activation reason', () => {
    const data = parseLgsResources(files, devices)
    expect(data.bonusEffects[0].requiredFocuses).toEqual(files.weaponBonuses[0].requiredFocuses)
    expect(data.bonusEffects[0].paragraphs).toEqual(['Electric Spell Power +139 (Equipment)'])
    expect(data.bonusEffects[1].notes).toContain('Piece threshold is unverified.')
    const legacy = { ...files.weaponBonuses[0], activationStatus: 'unresolved', activationReason: 'Unverified.' }
    expect(
      parseLgsResources({ ...files, weaponBonuses: [legacy] }, devices).bonusEffects[0].requiredFocuses
    ).toBeUndefined()
    expect(() =>
      parseLgsResources({ ...files, weaponBonuses: [{ ...files.weaponBonuses[0], requiredFocuses: {} }] }, devices)
    ).toThrow('tier1And2')
  })

  it('allows a retry after a failed manifest request', async () => {
    vi.mocked(loadDatasetFile).mockRejectedValueOnce(new Error('offline'))
    await expect(loadLgsData()).rejects.toThrow('offline')
    await expect(loadLgsData()).resolves.toMatchObject({ immortalsHeart: { id: 9 } })
  })
  it('keeps mechanical discrepancies and partial effect explanations beside the published description', () => {
    const effects = [
      {
        ...files.effects[0],
        knownDiscrepancies: [
          { stat: 'Silver_DR', statDisplayName: 'Silver bypass', stated: 'omitted', mechanical: true },
          { stat: 'Positive Energy Spell Power', stated: 37, mechanical: 34.75, unit: 'points' },
          { stat: 'Critical Damage', stated: 5, mechanical: 20, unit: 'percent' }
        ],
        unresolved: ['Unknown trigger.']
      },
      ...files.effects.slice(1)
    ]
    const data = parseLgsResources({ ...files, effects }, devices)
    const tier = data.tier1.find((item) => item.id === 3)
    expect(tier?.details).toEqual(['Unknown trigger.'])
    expect(tier?.discrepancies).toEqual([
      'Silver bypass: stated omitted, actual true.',
      'Positive Energy Spell Power: stated 37, actual 34.75.',
      'Critical Damage: stated 5, actual 20 percent.'
    ])
  })
  it('rejects broken references, output mismatches and cycles before rendering', () => {
    expect(() => parseLgsResources({ ...files, spells: [] }, devices)).toThrow('spellId')
    expect(() => parseLgsResources({ ...files, effects: [] }, devices)).toThrow('effectId')
    expect(() => parseLgsResources({ ...files, ingredients: [] }, devices)).toThrow('ingredientId')
    const changed = structuredClone(files)
    changed.tier3Recipes[0].outputItemId = 123
    expect(() => parseLgsResources(changed, devices)).toThrow('wrong output')
    const cyclic = structuredClone(files)
    cyclic.tier1Recipes[2].ingredients[0].ingredientId = 31
    expect(() => parseLgsResources(cyclic, devices)).toThrow('Circular')
  })
})
