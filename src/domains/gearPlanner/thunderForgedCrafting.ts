import {
  resolveThunderPlan,
  thunderDomain,
  thunderStages,
  thunderStageLabels,
  type ThunderData,
  type ThunderSelection,
  type ThunderStage
} from '../thunderForged/data'
import { thunderPlanPath } from '../thunderForged/sharing'
import type { CraftGroup, EquippedCraft } from './crafting'
import type { GearPlannerItem, GearPlannerSourceDataset } from './gearPlanner.types'

const system = (stage: ThunderStage) => thunderDomain + '-' + stage
export const thunderStageOrder = (name: string) => thunderStages.findIndex((stage) => system(stage) === name)

function selectionFor(item: GearPlannerItem) {
  const selection: ThunderSelection = {}
  for (const stage of thunderStages) {
    const craft = item.crafts?.find((entry) => entry.system === system(stage))
    if (craft) selection[stage] = Number(craft.id)
  }
  return selection
}

export function thunderRecipeHref(item: GearPlannerItem, data: ThunderData | undefined) {
  const id = item.source.catalogId
  if (id === undefined || !data?.bases.has(id)) return undefined
  return thunderPlanPath(id, Object.values(selectionFor(item)))
}

export function thunderCraftGroups(item: GearPlannerItem, data: ThunderData): CraftGroup[] {
  const base = data.bases.get(item.source.catalogId ?? 0)
  if (!base) return []
  const plan = resolveThunderPlan(base, selectionFor(item))
  return plan.stages.flatMap((stage) => {
    const choices = plan.choices[stage]?.map((recipe) => ({ id: String(recipe.id), label: recipe.name }))
    return choices?.length
      ? [{ system: system(stage), label: 'Thunder-Forged · ' + thunderStageLabels[stage], choices }]
      : []
  })
}

export function applyThunderRecipe(
  item: GearPlannerItem,
  group: CraftGroup,
  choiceId: string | null,
  data: ThunderData
) {
  const base = data.bases.get(item.source.catalogId ?? 0)
  const stage = thunderStages.find((name) => system(name) === group.system)
  if (!base || !stage) return item
  const selection = selectionFor(item)
  const id = choiceId === null ? undefined : Number(choiceId)
  if (id === selection[stage] || (choiceId !== null && !group.choices.some((choice) => choice.id === choiceId)))
    return item
  const plan = resolveThunderPlan(base, { ...selection, [stage]: id })
  const crafts: EquippedCraft[] = plan.upgrades.map(({ recipe, effects }) => ({
    system: system(recipe.stage),
    id: String(recipe.id),
    label: recipe.name,
    effects
  }))
  return {
    ...item,
    source: { ...item.source, enchantments: plan.baseEffects, augments: plan.sockets, minLevel: plan.minimumLevel },
    minimumLevel: plan.minimumLevel,
    crafts: [...(item.crafts ?? []).filter((craft) => thunderStageOrder(craft.system) < 0), ...crafts]
  }
}

export function addThunderBases(datasets: readonly GearPlannerSourceDataset[], data: ThunderData) {
  const missing = new Map(data.bases)
  const updated = datasets.map((dataset) => ({
    ...dataset,
    records: dataset.records.map((source) => {
      const base = data.bases.get(source.catalogId ?? 0)
      if (!base) return source
      missing.delete(base.id)
      const plan = resolveThunderPlan(base, {})
      return { ...source, enchantments: plan.baseEffects, augments: plan.sockets, minLevel: plan.minimumLevel }
    })
  }))
  for (const [fileName, bases] of Map.groupBy(missing.values(), (base) => base.fileName)) {
    updated.push({
      fileName,
      records: bases.map((base) => ({
        ...base.source,
        enchantments: resolveThunderPlan(base, {}).baseEffects
      }))
    })
  }
  return updated
}
