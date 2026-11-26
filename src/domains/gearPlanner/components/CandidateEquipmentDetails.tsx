import KnownDiscrepancies from './KnownDiscrepancies'
import { keyedEntries } from '../../../shared/ui/keyedEntries'
import { Badge, Group, Text } from '@mantine/core'
import { normaliseAugmentSlotType, augmentColors } from '../../../shared/augments/compatibility'
import ItemMaterial from './ItemMaterial'
import type { GearPlannerAugmentSlot, GearPlannerItem } from '../gearPlanner.types'

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
      <KnownDiscrepancies notes={item.source.discrepancyNotes} />
      {sockets.length > 0 && (
        <Group gap={4} role='group' aria-label='Augment sockets'>
          {keyedEntries(sockets).map(({ key, value: { augmentType } }) => {
            const name = normaliseAugmentSlotType(augmentType)
            const malformed = /[{}|]/.test(name) || name === 'Yelloww'
            return (
              <Badge
                key={key}
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
      {item.essenceCrafting && <Text size='xs'>Essence Crafting</Text>}
      {setSources.length > 0 && <Text size='xs'>Set via {setSources.join(' or ')}</Text>}
    </Group>
  )
}
