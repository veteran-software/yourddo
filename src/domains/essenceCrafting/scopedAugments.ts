import { loadScopedAugmentCatalog } from '../gearPlanner/itemCatalog'
import { scopedAugmentMatcher } from '../../shared/augments/matchScopedAugment'
import type { EssenceAugment, EssenceCraftingData } from './essenceCrafting.types'

export async function withScopedAugments(data: EssenceCraftingData): Promise<EssenceCraftingData> {
  const catalog = await loadScopedAugmentCatalog()
  if (!catalog) return data
  const match = scopedAugmentMatcher(catalog.entries)
  const colors = new Map(data.augmentTypes.map((color) => [color.id, color.displayName]))
  const augments = data.augments.map((augment): EssenceAugment => {
    const color = colors.get(augment.augmentTypeId)
    const record = color && match(augment.displayName, color, augment.minimumItemLevel)
    if (!record) return augment
    return {
      ...augment,
      effects: [],
      scoped: record,
      filterEffects: record.searchLabels.map((displayName) => ({
        id:
          augment.effects.find((effect) => effect.displayName === displayName)?.id ??
          augment.id + '/enchantment/' + displayName,
        displayName
      }))
    }
  })
  return {
    ...data,
    enchantmentNames: catalog.names,
    augments,
    indexes: { ...data.indexes, augmentById: new Map(augments.map((a) => [a.id, a])) }
  }
}
