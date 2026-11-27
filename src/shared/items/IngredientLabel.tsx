import { useEffect, useState } from 'react'
import { loadDatasetFile } from '../data/loadDataset'
import ItemIcon from './ItemIcon'
import { baseItemArt, type ItemArt } from './itemArt'

interface IngredientEntry {
  name: string
  ingredientType?: string
}
type IngredientIndex = Record<string, IngredientEntry>
const domain = 'ingredients'
const keyFor = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase()
let catalog:
  Promise<{ entries: ReadonlyMap<string, string[]>; index: IngredientIndex; paths: Record<string, string> }> | undefined
const groups = new Map<string, Promise<Record<string, Record<string, unknown>>>>()

function loadCatalog() {
  catalog ??= loadDatasetFile<{ system: string; resources: Record<string, string> }>(domain + '/manifest.json')
    .then(async (manifest) => {
      if (manifest.system !== domain || manifest.resources.ingredientIndex !== 'ingredient-index.json')
        throw new Error('Invalid shared ingredient manifest')
      const index = await loadDatasetFile<IngredientIndex>(domain + '/' + manifest.resources.ingredientIndex)
      const entries = new Map<string, string[]>()
      for (const [id, entry] of Object.entries(index)) {
        const name = keyFor(entry.name)
        const ids = entries.get(name) ?? []
        ids.push(id)
        entries.set(name, ids)
      }
      return { entries, index, paths: manifest.resources }
    })
    .catch((error: unknown) => {
      catalog = undefined
      throw error
    })
  return catalog
}

function loadGroup(path: string) {
  let pending = groups.get(path)
  if (pending) return pending
  pending = loadDatasetFile<Record<string, Record<string, unknown>>>(domain + '/' + path).catch((error: unknown) => {
    groups.delete(path)
    throw error
  })
  groups.set(path, pending)
  return pending
}

async function findArt(name: string, ingredientId?: string | number) {
  const { index, entries, paths } = await loadCatalog()
  const id = String(ingredientId)
  const ids = index[id] && keyFor(index[id].name) === keyFor(name) ? [id] : (entries.get(keyFor(name)) ?? [])
  const arts = await Promise.all(
    ids.map(async (key) => {
      const path = paths['ingredients-' + (index[key].ingredientType ?? 'unclassified')]
      if (!path || !/^by-type\/[\w-]+\.json$/.test(path)) return undefined
      const ingredient = (await loadGroup(path))[key]
      return ingredient && baseItemArt(domain, ingredient)
    })
  )
  return arts.find((art) => art !== undefined)
}

export default function IngredientLabel({
  name,
  ingredientId,
  image,
  suffix
}: Readonly<{ name: string; ingredientId?: string | number; image?: string; suffix?: string }>) {
  const [resolved, setResolved] = useState<{ name: string; ingredientId?: string | number; art?: ItemArt }>()
  useEffect(() => {
    let active = true
    void findArt(name, ingredientId).then(
      (art) => {
        if (active) setResolved({ name, ingredientId, art })
      },
      () => undefined
    )
    return () => {
      active = false
    }
  }, [name, ingredientId])
  const art = resolved?.name === name && resolved.ingredientId === ingredientId ? resolved.art : undefined
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
      {(art ?? image) && <ItemIcon item={{ name, art, image }} size={22} />}
      <span>
        {name}
        {suffix}
      </span>
    </span>
  )
}
