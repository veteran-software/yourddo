import { Text } from '@mantine/core'
import type { GearPlannerEffectConflictResolution } from '../effects'

export default function EquippedEffect({
  id,
  conflicts,
  label
}: {
  id: string
  conflicts: GearPlannerEffectConflictResolution
  label: string
}) {
  const match = conflicts.bySourceId[id]
  if (!match) return <>{label}</>
  const slots = (effective: boolean) =>
    [
      ...new Set(
        match.entries
          .filter((entry) => entry.id !== id && entry.isEffective === effective)
          .map((entry) =>
            entry.category === 'augment'
              ? `${entry.slot ?? 'Equipment'} / ${entry.augmentSlotName ?? `Augment slot ${String((entry.augmentSlotIndex ?? 0) + 1)}`}`
              : entry.slot
          )
      )
    ].join(', ')
  const winning = slots(true)
  const weaker = match.isEffective && slots(false)
  const details = [
    weaker && `Overrides ${weaker}`,
    winning && (match.isEffective ? `Redundant (${winning})` : `Overridden by ${winning}`)
  ]
    .filter(Boolean)
    .join(' · ')
  return (
    <>
      <Text component='span' inherit td={match.isEffective ? undefined : 'line-through'}>
        {label}
      </Text>
      {details && (
        <Text component='span' size='xs' c='dimmed' ml='xs'>
          {details}
        </Text>
      )}
    </>
  )
}
