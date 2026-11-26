import { loadNativeNearlyComplete } from '../gearPlanner/nativeUpgradeData'
import { isVisibleEffect } from '../../shared/data/visibleEffect'
import { hasDatasetFile, loadDataset } from '../../shared/data/loadDataset.ts'
import type { RecipeTier } from './recipes.ts'

const nearlyCompletePrefix = 'Nearly Complete: '

export interface NearlyCompleteEnchantment {
  name: string
  modifier?: string
  bonus?: string
  notes?: string
}

export interface NearlyCompleteItem {
  catalogId?: number
  pageTitle: string
  name: string
  type: string
  minLevel: string
  enchantments: NearlyCompleteEnchantment[]
}

export type NearlyCompleteDataset = NearlyCompleteItem[]

export const loadNearlyCompleteItems = async (): Promise<NearlyCompleteDataset> => {
  if (await hasDatasetFile('nearly-complete/enchantment-names.json')) return (await loadNativeNearlyComplete()).items
  return loadDataset<NearlyCompleteDataset>('nearly-complete').then((items) =>
    items.map((item) => ({ ...item, enchantments: item.enchantments.filter(isVisibleEffect) }))
  )
}

export const getNearlyCompleteItemTier = (item: NearlyCompleteItem): RecipeTier =>
  Number(item.minLevel) >= 30 ? 'Legendary' : 'Heroic'

export const getNearlyCompleteItemProperty = (item: NearlyCompleteItem): string | null => {
  const enchantment = item.enchantments.find(({ name }) => name.startsWith(nearlyCompletePrefix))
  return enchantment ? enchantment.name.slice(nearlyCompletePrefix.length) : null
}

export const getNearlyCompleteItems = (
  items: NearlyCompleteDataset,
  tier: RecipeTier,
  property: string
): NearlyCompleteDataset =>
  items
    .filter((item) => getNearlyCompleteItemTier(item) === tier && getNearlyCompleteItemProperty(item) === property)
    .toSorted((a, b) => a.name.localeCompare(b.name) || a.type.localeCompare(b.type))
