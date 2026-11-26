import { loadDatasetFile } from './loadDataset.ts'

const domain = 'item-sets'
type Resource = 'itemSets' | 'filigreeSets' | 'effects'

let resources: Promise<Record<string, unknown>> | undefined

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function loadItemSetResource(key: Resource): Promise<unknown> {
  resources ??= loadDatasetFile<unknown>(domain + '/manifest.json')
    .then((manifest) => {
      if (!isRecord(manifest) || manifest.system !== domain || !isRecord(manifest.resources)) {
        throw new Error('Invalid item sets manifest')
      }
      return manifest.resources
    })
    .catch((error: unknown) => {
      resources = undefined
      throw error
    })
  const path = (await resources)[key]
  if (typeof path !== 'string' || !/^(?:[\w-]+\/)*[\w-]+\.json$/.test(path)) {
    throw new Error('Invalid item sets resource: ' + key)
  }
  return loadDatasetFile<unknown>(domain + '/' + path)
}
