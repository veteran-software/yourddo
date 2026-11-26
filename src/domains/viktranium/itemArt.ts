import { loadDatasetFile } from '../../shared/data/loadDataset'
import { baseItemArt, type ItemArt } from '../../shared/items/itemArt'
import type { ViktraniumItem } from './viktranium.types'

const slotNames: Record<string, string> = {
  Robe: 'cloth',
  Outfit: 'cloth',
  Helmet: 'head',
  Bracers: 'wrists',
  Gloves: 'hands',
  Boots: 'feet',
  Necklace: 'neck',
  Belt: 'waist',
  Goggles: 'eyes'
}
const normalize = (value: string) => value.toLowerCase().replaceAll(/[^a-z0-9]/g, '')
interface Manifest {
  resources: Record<string, string>
  categoryEffects: Record<string, string>
}
let manifest: Promise<Manifest> | undefined
type ArtRecord = { name: string; minimumLevel?: number } & Record<string, unknown>
const categories = new Map<string, Promise<ArtRecord[]>>()

async function categoryItems(path: string) {
  let records = categories.get(path)
  if (!records) {
    records = loadDatasetFile<ArtRecord[]>('items/' + path).catch((error: unknown) => {
      categories.delete(path)
      throw error
    })
    categories.set(path, records)
  }
  return records
}

export async function viktraniumItemArt(
  item: Pick<ViktraniumItem, 'name' | 'type' | 'icon' | 'minimumLevel' | 'art'>,
  items: readonly Pick<ViktraniumItem, 'name' | 'type' | 'icon'>[]
): Promise<ItemArt | undefined> {
  if (item.art) return item.art
  manifest ??= loadDatasetFile<Manifest>('items/manifest.json').catch((error: unknown) => {
    manifest = undefined
    throw error
  })
  const { resources, categoryEffects } = await manifest
  // These recipe records classify their base differently from the equipment catalog.
  const catalogType: Record<string, string> = {
    'Legendary Lamordian Vest': 'Light Armor',
    'The Reaper of Lives': 'Sickle'
  }
  const slot = normalize(catalogType[item.name] ?? slotNames[item.type] ?? item.type)
  const keys = Object.keys(categoryEffects).filter((key) => {
    const parts = key.split('/').filter((part) => part !== 'items')
    return normalize(parts.at(-1) ?? '') === slot
  })
  const records = (await Promise.all(keys.map((key) => categoryItems(resources[key])))).flat()
  const name = normalize(item.name)
  const exact = records.filter((record) => normalize(record.name) === name)
  const match = exact.find((record) => record.minimumLevel === item.minimumLevel) ?? exact[0]
  if (match) return baseItemArt('items', match)
  const counterpart = records.find((record) => normalize(record.name) === 'legendary' + name)
  if (counterpart) return baseItemArt('items', counterpart)
  // Some recipe names differ from the catalog. The recipe's icon identifies items sharing the same artwork.
  if (!item.icon) return
  const peers = new Set(
    items.filter((peer) => peer.type === item.type && peer.icon === item.icon).map((peer) => normalize(peer.name))
  )
  const peer = records.find((record) => peers.has(normalize(record.name)))
  return peer && baseItemArt('items', peer)
}
