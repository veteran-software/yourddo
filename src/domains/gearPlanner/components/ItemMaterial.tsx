import { Text } from '@mantine/core'
import { isMetalMaterial } from '../character'
import type { GearPlannerItem } from '../gearPlanner.types'

export default function ItemMaterial({ item, selectedMaterial }: { item: GearPlannerItem; selectedMaterial?: string }) {
  const material = (selectedMaterial ?? item.source.material ?? '').trim()
  return (
    <Text size='xs' c='dimmed'>
      Material · {material || (item.essenceCrafting ? 'Choose material' : 'Unknown')}
      {isMetalMaterial(material) && ' (metal)'}
    </Text>
  )
}
