import {
  alchemicalStages,
  resolveAlchemicalPlan,
  type AlchemicalBase,
  type AlchemicalData,
  type AlchemicalSelection
} from './data'

export interface Selection {
  family: AlchemicalBase['family']
  baseId: number | null
  recipes: AlchemicalSelection
}

export function alchemicalPlanPath(baseId: number, ids: readonly number[]) {
  return '/alchemical?base=' + String(baseId) + (ids.length ? '&recipes=' + ids.join(',') : '')
}

function restore(data: AlchemicalData, base: AlchemicalBase, ids: number[]): Selection {
  const recipes: AlchemicalSelection = {}
  for (const [index, stage] of alchemicalStages.entries()) {
    if (index >= ids.length) break
    recipes[stage] = ids[index]
  }
  const { selected } = resolveAlchemicalPlan(data, base, recipes)
  return { family: base.family, baseId: base.id, recipes: Object.fromEntries(selected.map((r) => [r.stage, r.id])) }
}

export function linkedSelection(data: AlchemicalData, search: string): Selection | null {
  const params = new URLSearchParams(search)
  const base = data.bases.find((entry) => String(entry.id) === params.get('base'))
  return base ? restore(data, base, (params.get('recipes') ?? '').split(',').map(Number)) : null
}

export function exportAlchemicalPlan(baseId: number, recipes: readonly number[]) {
  return JSON.stringify({ system: 'alchemical', version: 1, baseId, recipes }, null, 2)
}

export function importAlchemicalPlan(text: string, data: AlchemicalData): Selection {
  const build: unknown = JSON.parse(text)
  if (
    !build ||
    typeof build !== 'object' ||
    !('system' in build) ||
    build.system !== 'alchemical' ||
    !('version' in build) ||
    build.version !== 1 ||
    !('baseId' in build) ||
    !('recipes' in build) ||
    !Array.isArray(build.recipes) ||
    build.recipes.length > alchemicalStages.length ||
    !build.recipes.every((id: unknown): id is number => typeof id === 'number' && Number.isSafeInteger(id))
  ) {
    throw new Error('Choose a version 1 Alchemical crafting build.')
  }
  const base = data.bases.find((entry) => entry.id === build.baseId)
  if (!base) throw new Error('This base item is unavailable in the current catalog.')
  const selection = restore(data, base, build.recipes)
  if (Object.keys(selection.recipes).length !== build.recipes.length)
    throw new Error('This build contains an unavailable or incompatible binding.')
  return selection
}
