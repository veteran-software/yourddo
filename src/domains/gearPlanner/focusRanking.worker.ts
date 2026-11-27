import { createAugmentRecommender, type AugmentRecommendationSetup } from './augmentRecommendations'
import type { GearPlannerEffectSource } from './effects'
import { createBrowserFocusRanker, type BrowserFocusScore } from './focusStats'
import type { GearPlannerAugment, GearPlannerAugmentSlot, GearPlannerItem } from './gearPlanner.types'
import { emptyGearPlannerReforgingData } from './reforging'

export interface FocusRankingRequest {
  setup: AugmentRecommendationSetup
  items: GearPlannerItem[]
  augments: GearPlannerAugment[]
  names: readonly string[]
  effects: readonly GearPlannerEffectSource[]
}

export type FocusRankingScore = Omit<BrowserFocusScore, 'augments'> & {
  augments: { index: number; socket: GearPlannerAugmentSlot; augment: number }[]
}

self.addEventListener('message', ({ data }: MessageEvent<FocusRankingRequest>) => {
  const { setup, items, augments, names, effects } = data
  const recommend = createAugmentRecommender(setup, emptyGearPlannerReforgingData, augments, names, effects)
  const { score } = createBrowserFocusRanker(names, recommend)
  const scores = items.map((item): FocusRankingScore => {
    const { augments: choices, ...result } = score(item)
    return {
      ...result,
      augments: choices.map(({ index, socket, augment }) => ({ index, socket, augment: Number(augment.source.id) }))
    }
  })
  self.postMessage(scores)
})
