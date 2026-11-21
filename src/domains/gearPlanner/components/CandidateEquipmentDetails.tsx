import { Badge, Group, Text } from '@mantine/core'
import { normaliseAugmentSlotType, augmentColors } from '../../../shared/augments/compatibility'
import ItemMaterial from './ItemMaterial'
import type { GearPlannerAugmentSlot, GearPlannerItem } from '../gearPlanner.types'

function craftingSources(item: GearPlannerItem) {
  if (item.essenceCrafting) return ['Essence Crafting']
  const sources = new Set<string>()
  let craftOnly = false
  for (const location of item.source.dropLocations ?? []) {
    const type = location.sourceType
    if (location.isCraftOnly === true || type === 'CraftOnlyItem') craftOnly = true
    if (typeof location.craftingLocation === 'string' && location.craftingLocation.trim()) {
      sources.add('Crafted at ' + location.craftingLocation.trim())
    } else if (type === 'GreenSteelCraftingPurchase') {
      sources.add('Green Steel Crafting')
    } else if (typeof type === 'string' && /crafting/i.test(type)) {
      sources.add(
        typeof location.craftingType === 'string' && location.craftingType.trim() ? location.craftingType.trim() : type
      )
    }
  }
  if (sources.size) {
    return [...sources]
  }
  if (craftOnly) {
    return ['Craft only']
  }
  return []
}

export default function CandidateEquipmentDetails({
  item,
  material,
  sockets,
  setSources
}: Readonly<{
  item: GearPlannerItem
  material: string | undefined
  sockets: readonly GearPlannerAugmentSlot[]
  setSources: readonly string[]
}>) {
  return (
    <Group gap='xs' align='center' px='sm' py={6}>
      <ItemMaterial item={item} selectedMaterial={material} />
      {sockets.length > 0 && (
        <Group gap={4} role='group' aria-label='Augment sockets'>
          {sockets.map(({ augmentType }, index) => {
            const name = normaliseAugmentSlotType(augmentType)
            const malformed = /[{}|]/.test(name) || name === 'Yelloww'
            return (
              <Badge
                key={index}
                variant='dot'
                tt='none'
                color={augmentColors[name] ?? 'gray'}
                title={augmentType}
                style={{ maxWidth: '100%', height: 'auto', whiteSpace: 'normal' }}
              >
                {malformed ? 'Unrecognized socket' : name}
              </Badge>
            )
          })}
        </Group>
      )}
      {craftingSources(item).map((source) => (
        <Text key={source} size='xs'>
          {source}
        </Text>
      ))}
      {setSources.length > 0 && <Text size='xs'>Set via {setSources.join(' or ')}</Text>}
    </Group>
  )
}
