import { BuildHeader as ItemHeader } from '../../../shared/layout/SlottedCraftingParts'
import type { FinishedDinosaurBoneItem } from '../dinosaurBone.types'
import { getColorAugmentMinimumLevelIncrease } from '../logic'
export { RequirementList } from '../../../shared/layout/SlottedCraftingParts'

export function BuildHeader({ finished }: { finished: FinishedDinosaurBoneItem }) {
  const { item, slots, emptySlots } = finished
  if (!item) return null
  return (
    <ItemHeader
      item={item}
      level={getColorAugmentMinimumLevelIncrease(item, slots)?.minimumLevel ?? item.minLevel}
      filled={slots.length - emptySlots.length}
      total={slots.length}
    />
  )
}
