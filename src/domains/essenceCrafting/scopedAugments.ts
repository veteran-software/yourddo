import { loadScopedAugmentCatalog } from '../gearPlanner/itemCatalog'
import { getColorAugmentType } from '../../shared/augments/compatibility'
import type { EssenceAugment, EssenceCraftingData } from './essenceCrafting.types'
import { savedEssenceId } from './savedIds'

// Some published augments were renamed after the original save IDs were assigned.
const savedNames = new Map([
  [1879278553, 'Emerald of Vile Empowerment'],
  [1879278556, 'Emerald of Eldritch Empowerment'],
  [1879305300, 'Ruby of Radiance 66'],
  [1879171547, 'Ruby of The Gatekeepers'],
  [1879265832, 'Ruby of The Quori'],
  [1879265478, 'Topaz of Augment Summoning'],
  [1879307362, 'Topaz of Wizardry +327']
])

export async function withScopedAugments(data: EssenceCraftingData): Promise<EssenceCraftingData> {
  const catalog = await loadScopedAugmentCatalog()
  if (!catalog) return data
  const { minimum, maximum } = data.rules.supportedItemLevels
  const augments = await Promise.all(
    catalog.entries.flatMap((record) => {
      const color = getColorAugmentType(record.slotTypes[0])
      if (!color || record.minimumLevel < minimum || record.minimumLevel > maximum) return []
      return [toEssenceAugment(record, color.toLowerCase())]
    })
  )
  return {
    ...data,
    enchantmentNames: catalog.names,
    augments,
    indexes: { ...data.indexes, augmentById: new Map(augments.map((augment) => [augment.id, augment])) }
  }
}

async function toEssenceAugment(
  record: NonNullable<Awaited<ReturnType<typeof loadScopedAugmentCatalog>>>['entries'][number],
  augmentTypeId: string
): Promise<EssenceAugment> {
  // The ML4 Sapphire shares a name with the previously published ML12 Sapphire.
  const id =
    record.id === 1879270644
      ? 'augment-native-' + String(record.id)
      : await savedEssenceId('augment', 'augment.json\0' + (savedNames.get(record.id) ?? record.name))
  const displayName =
    record.name === 'Emerald of Arcane Empowerment' ? (savedNames.get(record.id) ?? record.name) : record.name
  return {
    id,
    displayName,
    augmentTypeId,
    minimumItemLevel: record.minimumLevel,
    effects: [],
    scoped: record,
    filterEffects: record.searchLabels.map((label) => ({ id: id + '/enchantment/' + label, displayName: label }))
  }
}
