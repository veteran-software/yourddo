import { Alert, Text } from '@mantine/core'
import type { ClassifiedDinosaurBoneItem, DinosaurBoneEffect, FinishedDinosaurBoneItem } from '../dinosaurBone.types.ts'
import { getColorAugmentMinimumLevelIncrease, isAbilityScoreEffect, isArtifactItem } from '../logic.ts'

export const ArtifactAbilityScoreNotice = ({
  item,
  effects
}: {
  item: ClassifiedDinosaurBoneItem
  effects: readonly DinosaurBoneEffect[]
}) => {
  const abilityScores = [
    ...new Set(
      effects
        .filter(isAbilityScoreEffect)
        .map(({ name }) => name.split(' +')[0])
        .filter((name): name is string => Boolean(name))
    )
  ]
  if (!isArtifactItem(item) || abilityScores.length === 0) return null

  return (
    <Alert
      color='yellow'
      variant='light'
      title='Artifact ability score bonus'
      role='status'
      p='xs'
      styles={{ title: { fontSize: 'var(--mantine-font-size-sm)' } }}
    >
      <Text size='xs'>
        This {item.artifactType} Artifact increases {abilityScores.join(', ')} by 1. The adjusted value is shown below.
      </Text>
    </Alert>
  )
}

export const ColorAugmentLevelNotice = ({
  item,
  slots
}: {
  item: ClassifiedDinosaurBoneItem
  slots: FinishedDinosaurBoneItem['slots']
}) => {
  const increase = getColorAugmentMinimumLevelIncrease(item, slots)
  if (!increase) return null

  return (
    <Alert
      color='blue'
      variant='light'
      title='Color augment minimum level'
      role='status'
      p='xs'
      styles={{ title: { fontSize: 'var(--mantine-font-size-sm)' } }}
    >
      <Text size='xs'>
        A selected color augment raises the item’s minimum level from {String(increase.itemLevel)} to{' '}
        {String(increase.minimumLevel)}.
      </Text>
    </Alert>
  )
}
