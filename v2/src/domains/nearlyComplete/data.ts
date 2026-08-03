import { loadGeneratedDataset } from '../../shared/data/releaseClient.ts'

export interface NearlyCompleteEnchantment {
  name: string
  modifier?: string
  bonus?: string
  notes?: string
  charges?: number
  rechargeRate?: number
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
  loadGeneratedDataset<NearlyCompleteDataset>('nearly-complete', 'nearly-complete/items.json')
