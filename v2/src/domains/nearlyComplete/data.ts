import { loadDataset } from '../../shared/data/loadDataset.ts'
import type { RecipeTier } from './recipes.ts'

const nearlyCompletePrefix = 'Nearly Complete: '

export interface NearlyCompleteEnchantment {
  name: string
  modifier?: string
  bonus?: string
  notes?: string
}

export interface NearlyCompleteItem {
  pageTitle: string
  name: string
  type: string
  minLevel: string
  enchantments: NearlyCompleteEnchantment[]
}

export type NearlyCompleteDataset = NearlyCompleteItem[]

export const loadNearlyCompleteItems = (): Promise<NearlyCompleteDataset> =>
  loadDataset<NearlyCompleteDataset>('nearly-complete')

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
