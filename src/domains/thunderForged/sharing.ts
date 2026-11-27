import { resolveThunderPlan, thunderDomain, thunderSelection, type ThunderData } from './data'

export function thunderPlanPath(baseId: number, recipes: readonly number[]) {
  const params = new URLSearchParams({ base: String(baseId) })
  if (recipes.length) params.set('recipes', recipes.join(','))
  return '/' + thunderDomain + '?' + params.toString()
}

function restore(data: ThunderData, baseId: unknown, recipes: unknown) {
  if (
    typeof baseId !== 'number' ||
    !Array.isArray(recipes) ||
    recipes.length > 3 ||
    !recipes.every((id: unknown): id is number => typeof id === 'number' && Number.isSafeInteger(id))
  )
    throw new Error('Invalid Thunder-Forged build.')
  const base = data.bases.get(baseId)
  if (!base) throw new Error('The Thunder-Forged base item is unavailable.')
  const plan = resolveThunderPlan(
    base,
    Object.fromEntries(base.recipes.filter(({ id }) => recipes.includes(id)).map(({ stage, id }) => [stage, id]))
  )
  if (plan.selected.length !== recipes.length || plan.selected.some(({ id }, index) => id !== recipes[index]))
    throw new Error('This build contains an unavailable or out-of-order recipe.')
  return { baseId, recipes: thunderSelection(plan.selected) }
}

export function linkedThunderPlan(data: ThunderData, search: string) {
  const params = new URLSearchParams(search)
  if (!params.has('base')) return null
  const recipes = params.get('recipes')
  return restore(data, Number(params.get('base')), recipes ? recipes.split(',').map(Number) : [])
}

export function exportThunderPlan(baseId: number, recipes: readonly number[]) {
  return JSON.stringify({ system: thunderDomain, version: 1, baseId, recipes }, null, 2)
}

export function importThunderPlan(text: string, data: ThunderData) {
  const build: unknown = JSON.parse(text)
  if (
    !build ||
    typeof build !== 'object' ||
    !('system' in build) ||
    build.system !== thunderDomain ||
    !('version' in build) ||
    build.version !== 1 ||
    !('baseId' in build) ||
    !('recipes' in build)
  )
    throw new Error('Choose a version 1 Thunder-Forged build.')
  return restore(data, build.baseId, build.recipes)
}
