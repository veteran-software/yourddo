import { expect, it, vi } from 'vitest'
import { loadEssenceCraftingData } from './data'
import { resolveEnhancementEffects } from './enhancementEffects'
import { getAvailableEnhancementChoices } from './enhancementEligibility'
import { calculatePlanMaterials } from './materialCalculations'
import { hydrateEssencePlan } from './plannerTransitions'

it.runIf(import.meta.env.VITE_GEAR_PLANNER_CDN === '1')(
  'loads the live native shards and restores a saved plan',
  async () => {
    const requested: string[] = []
    const nativeFetch = globalThis.fetch
    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
      const requestedUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      const url = requestedUrl.replace('/data-cdn/', 'https://cdn.yourddo.com/')
      requested.push(url)
      return nativeFetch(url, init)
    })
    try {
      const data = await loadEssenceCraftingData()
      expect(requested.some((url) => url.endsWith('/essence/essenceCrafting.v2.json'))).toBe(true)
      expect(data.enhancements).toHaveLength(368)
      expect(data.recipes).toHaveLength(808)
      const acidId = 'enhancement-aa015129bd857543'
      expect(data.indexes.enhancementById.get(acidId)?.effects[0].displayName).toBe('Elemental Resistance: Acid')
      expect(getAvailableEnhancementChoices(data, 'helmet', 'extra', 9).some(({ id }) => id === acidId)).toBe(false)
      expect(getAvailableEnhancementChoices(data, 'helmet', 'extra', 10).some(({ id }) => id === acidId)).toBe(true)
      const plan = hydrateEssencePlan(data, {
        masterMinimumLevel: 9,
        activeSlotIds: ['helmet'],
        itemsBySlotId: { helmet: { extraEnhancementId: acidId, hasCannithMark: true } }
      })
      expect(plan.itemsBySlotId.helmet).toMatchObject({ extraEnhancementId: acidId, minimumLevelOverride: 10 })
      const combustion = data.enhancements.find(({ displayName }) => displayName === 'Combustion')
      if (!combustion) throw new Error('Missing Combustion shard')
      const runeArm = hydrateEssencePlan(data, {
        masterMinimumLevel: 10,
        activeSlotIds: ['rune-arm'],
        itemsBySlotId: { 'rune-arm': { suffixEnhancementId: combustion.id } }
      })
      expect(calculatePlanMaterials(data, runeArm, 'bound').items[0].steps[1].status).toBe('resolved')
      expect(calculatePlanMaterials(data, runeArm, 'unbound').items[0].steps[1]).toMatchObject({
        status: 'unavailable',
        reason: { placementUnavailable: true }
      })
      for (const [name, value] of [
        ['Spell Penetration', 5],
        ['Insightful Spell Penetration', 3],
        ['Vampirism', 2]
      ] as const) {
        const enhancement = data.enhancements.find(({ displayName }) => displayName === name)
        if (!enhancement) throw new Error('Missing ' + name)
        expect(resolveEnhancementEffects(data, enhancement.id, 13).effects[0].modifier).toMatchObject({
          status: 'resolved',
          value
        })
      }
    } finally {
      vi.unstubAllGlobals()
    }
  }
)
