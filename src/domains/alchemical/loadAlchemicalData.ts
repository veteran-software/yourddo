import { hasDatasetFile, loadDatasetFile } from '../../shared/data/loadDataset'
import { buildAlchemicalData, type AlchemicalResources } from './data'

type ResourceName =
  | 'baseItems'
  | 'ingredients'
  | 'componentsRecipes'
  | 'rewardTables'
  | 'originalRecipes'
  | 'originalEffects'
  | 'legendaryRecipes'
  | 'legendaryEffects'

interface CatalogManifest {
  system: string
  devices: AlchemicalResources['devices']
  resources: Record<ResourceName, string>
}

const directory = 'alchemical/'
const manifestPath = directory + 'manifest.json'

async function loadCatalog() {
  // Older releases published only the item index in this directory.
  if (!(await hasDatasetFile(manifestPath))) return undefined
  const manifest = await loadDatasetFile<CatalogManifest>(manifestPath)
  if (manifest?.system !== 'alchemical' || !manifest.resources || !manifest.devices) {
    throw new Error('Invalid Alchemical crafting manifest.')
  }
  async function read<T>(key: ResourceName) {
    const path = manifest.resources[key]
    if (typeof path !== 'string' || !path) throw new Error('Missing Alchemical crafting resource: ' + key)
    return loadDatasetFile<T>(directory + path)
  }
  const [
    bases,
    ingredients,
    components,
    rewardTables,
    originalRecipes,
    originalEffects,
    legendaryRecipes,
    legendaryEffects
  ] = await Promise.all([
    read<AlchemicalResources['bases']>('baseItems'),
    read<AlchemicalResources['ingredients']>('ingredients'),
    read<AlchemicalResources['components']>('componentsRecipes'),
    read<AlchemicalResources['rewardTables']>('rewardTables'),
    read<AlchemicalResources['original']['recipes']>('originalRecipes'),
    read<AlchemicalResources['original']['effects']>('originalEffects'),
    read<AlchemicalResources['legendary']['recipes']>('legendaryRecipes'),
    read<AlchemicalResources['legendary']['effects']>('legendaryEffects')
  ])
  return buildAlchemicalData({
    bases,
    ingredients,
    components,
    rewardTables,
    devices: manifest.devices,
    original: { recipes: originalRecipes, effects: originalEffects },
    legendary: { recipes: legendaryRecipes, effects: legendaryEffects }
  })
}

let pending: ReturnType<typeof loadCatalog> | undefined

export function loadOptionalAlchemicalData() {
  pending ??= loadCatalog().catch((error: unknown) => {
    pending = undefined
    throw error
  })
  return pending
}

export class AlchemicalReleaseUnavailable extends Error {}

export async function loadAlchemicalData() {
  const catalog = await loadOptionalAlchemicalData()
  if (!catalog) throw new AlchemicalReleaseUnavailable('The current data release does not include Alchemical crafting recipes.')
  return catalog
}
