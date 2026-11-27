import { useEffect, useMemo, useRef, useState } from 'react'
import { createAugmentRecommender } from './augmentRecommendations'
import type { GearPlannerEffectSource } from './effects'
import { createBrowserFocusRanker } from './focusStats'
import type { FocusRankingRequest, FocusRankingScore } from './focusRanking.worker'
import type { GearPlannerAugment, GearPlannerItem } from './gearPlanner.types'
import { createEmptyGearPlannerEquipment, type GearPlannerCandidate } from './planner'
import { getEffectiveGearPlannerAugmentSlots, type GearPlannerReforgingData } from './reforging'
import type { GearPlannerSetup } from './setups'

function compactItem(item: GearPlannerItem): GearPlannerItem {
  const { name, type, blockedSlots, artifactType, enchantments } = item.source
  return {
    id: item.id,
    slot: item.slot,
    sourceFile: item.sourceFile,
    minimumLevel: item.minimumLevel,
    source: { name, type, blockedSlots, artifactType, enchantments }
  }
}

export function useBrowserFocusRank({
  candidates,
  focusFirst,
  setup,
  augments,
  reforging,
  effects
}: {
  candidates: readonly GearPlannerCandidate[]
  focusFirst: boolean
  setup: GearPlannerSetup
  augments: readonly GearPlannerAugment[]
  reforging: GearPlannerReforgingData
  effects: readonly GearPlannerEffectSource[]
}) {
  const names = setup.character.focusStats
  const ranker = useMemo(() => {
    let recommend: ReturnType<typeof createAugmentRecommender> | undefined
    return createBrowserFocusRanker(names ?? [], (item) => {
      recommend ??= createAugmentRecommender(setup, reforging, augments, names ?? [], effects)
      return recommend(item)
    })
  }, [setup, reforging, augments, names, effects])
  const [failedRanker, setFailedRanker] = useState<typeof ranker>()
  const [revision, setRevision] = useState(0)
  const worker = useRef<Worker | undefined>(undefined)
  // Narrow searches cost less than transferring their candidates to a worker.
  const useWorker = typeof Worker === 'function' && failedRanker !== ranker && candidates.length >= 500
  const pending = Boolean(
    focusFirst && names?.length && useWorker && candidates.some(({ item }) => !ranker.scores.has(item))
  )
  useEffect(
    () => () => {
      worker.current?.terminate()
      worker.current = undefined
    },
    [ranker]
  )
  useEffect(() => {
    if (!pending || !names?.length || worker.current) return
    const missing = candidates.filter(({ item }) => !ranker.scores.has(item))
    function finish() {
      worker.current?.terminate()
      worker.current = undefined
    }
    function fallback() {
      finish()
      setFailedRanker(ranker)
    }
    try {
      const job = new Worker(new URL('./focusRanking.worker.ts', import.meta.url), { type: 'module' })
      worker.current = job
      job.onmessage = ({ data }: MessageEvent<FocusRankingScore[]>) => {
        if (worker.current !== job) return
        data.forEach(({ augments: choices, ...score }, index) => {
          ranker.scores.set(missing[index].item, {
            ...score,
            augments: choices.map((choice) => ({ ...choice, augment: augments[choice.augment] }))
          })
        })
        finish()
        setRevision((previous) => previous + 1)
      }
      job.onerror = job.onmessageerror = () => {
        if (worker.current === job) fallback()
      }
      const equipment = createEmptyGearPlannerEquipment()
      for (const item of Object.values(setup.equipment)) if (item) equipment[item.slot] = compactItem(item)
      const request: FocusRankingRequest = {
        setup: {
          equipment,
          maximumLevel: setup.maximumLevel,
          slottedAugments: setup.slottedAugments,
          essenceCrafting: {},
          reforging: {}
        },
        items: missing.map(({ item }) => {
          const compact = compactItem(item)
          compact.minimumLevel = setup.essenceCrafting[item.id]?.minimumLevel ?? item.minimumLevel
          compact.source.augments = getEffectiveGearPlannerAugmentSlots(item, setup.reforging[item.id], reforging)
          return compact
        }),
        augments: augments.map(({ name, augmentType, slotTypes, minLevel, effectsAdded }, id) => ({
          name,
          augmentType,
          slotTypes,
          minLevel,
          effectsAdded,
          source: { id }
        })),
        names,
        effects
      }
      job.postMessage(request)
    } catch {
      fallback()
    }
  }, [augments, candidates, effects, names, pending, ranker, reforging, revision, setup])

  const results = useMemo(
    () => (pending ? [] : ranker.rank(candidates, focusFirst)),
    [candidates, focusFirst, pending, ranker]
  )
  return { results, pending }
}
