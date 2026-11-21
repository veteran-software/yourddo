import { hasDatasetDirectory, loadDatasetFile } from '../../shared/data/loadDataset'
import { buildSlaveLordsData, type SlaveLordsData, type SlaveLordsResources } from './data'

const basePath = 'slave-lords/'
const read = <T>(path: string) => loadDatasetFile<T>(basePath + path)

async function loadTier(tier: 'heroic' | 'legendary'): Promise<SlaveLordsResources['heroic']> {
  const [recipes, options, effects] = await Promise.all([
    read<SlaveLordsResources['heroic']['recipes']>(`recipes/${tier}.json`),
    read<SlaveLordsResources['heroic']['options']>(`tiers/${tier}.json`),
    read<SlaveLordsResources['heroic']['effects']>(`effects/${tier}.json`)
  ])
  return { recipes, options, effects }
}

async function loadCatalog() {
  if (!(await hasDatasetDirectory('slave-lords'))) return undefined
  const [bases, ingredients, sets, heroic, legendary] = await Promise.all([
    read<SlaveLordsResources['bases']>('base-items.json'),
    read<SlaveLordsResources['ingredients']>('ingredients.json'),
    read<SlaveLordsResources['sets']>('bonuses/equipment-sets.json'),
    loadTier('heroic'),
    loadTier('legendary')
  ])
  return buildSlaveLordsData({ bases, ingredients, sets, heroic, legendary })
}

let pending: Promise<SlaveLordsData | undefined> | undefined

export function loadOptionalSlaveLordsData() {
  pending ??= loadCatalog().catch((error: unknown) => {
    pending = undefined
    throw error
  })
  return pending
}

export class SlaveLordsReleaseUnavailable extends Error {}

export async function loadSlaveLordsData() {
  const catalog = await loadOptionalSlaveLordsData()
  if (!catalog) throw new SlaveLordsReleaseUnavailable('This release does not include Slave Lords crafting recipes.')
  return catalog
}
