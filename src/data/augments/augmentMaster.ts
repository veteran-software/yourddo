import type { AugmentItem } from '../../types/augmentItem.ts'
import type { CraftingIngredient } from '../../types/crafting.ts'
import rawAugments from './augmentMaster.json'

// Local types that reflect the raw JSON shape before normalization
type RawRequirement = Omit<CraftingIngredient, 'name'> & { name?: string; title?: string }
type RawAugment = Omit<AugmentItem, 'requirements'> & { requirements?: RawRequirement[] }

// Normalize raw JSON into typed AugmentItems and fix requirement objects where
// wikibot scraped data used `title` instead of `name`. The UI expects `name`.
export const augmentMaster: AugmentItem[] = (rawAugments as RawAugment[]).map((aug: RawAugment) => {
  if (!aug.requirements?.length) return aug as AugmentItem

  return {
    ...aug,
    requirements: aug.requirements.map((req: RawRequirement) => {
      // Preserve all existing fields but ensure `name` is populated
      const name = req.name ?? req.title

      return { ...req, name }
    })
  } as AugmentItem
})

export default augmentMaster
