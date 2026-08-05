import { Alert, Box, Divider, List, Stack, Text, Title } from '@mantine/core'
import EffectList from '../../../shared/items/EffectList.tsx'
import { ArtifactAbilityScoreNotice, ColorAugmentLevelNotice } from '../components/BuildNotices.tsx'
import type { FinishedDinosaurBoneItem } from '../dinosaurBone.types.ts'
import {
  adjustEffectForArtifact,
  formatEffect,
  getColorAugmentMinimumLevelIncrease,
  isAbilityScoreEffect,
  isArtifactItem
} from '../logic.ts'

const FinishedItemTool = ({ finished }: { finished: FinishedDinosaurBoneItem }) => {
  if (!finished.item) {
    return (
      <Alert color='blue' title='No item selected' m='md'>
        Select an item to review the finished build.
      </Alert>
    )
  }
  const item = finished.item
  const selectedUpgradeEffects = finished.slots.flatMap(({ augment }) => augment?.effectsAdded ?? [])
  const minimumLevelIncrease = getColorAugmentMinimumLevelIncrease(item, finished.slots)
  const displayedMinimumLevel = minimumLevelIncrease?.minimumLevel ?? item.minLevel
  return (
    <Stack gap='md' p='md'>
      <Box>
        <Title order={3} style={{ overflowWrap: 'anywhere' }}>
          {item.name}
        </Title>
        <Text c='dimmed' size='sm'>
          {item.type}
          {displayedMinimumLevel !== undefined ? ` · Minimum level ${String(displayedMinimumLevel)}` : ''}
        </Text>
      </Box>
      {finished.warnings.length > 0 ? (
        <Alert color='red' title='Build validation' role='alert'>
          <EffectList effects={finished.warnings} />
        </Alert>
      ) : null}
      <Box>
        <Text fw={600} mb='xs'>
          Original effects
        </Text>
        <EffectList effects={finished.originalEffects.map(formatEffect)} />
      </Box>
      <Divider />
      <Box>
        <Text fw={600} mb='xs'>
          Crafted additions by slot
        </Text>
        <Stack gap='xs'>
          <ArtifactAbilityScoreNotice item={item} effects={selectedUpgradeEffects} />
          <ColorAugmentLevelNotice item={item} slots={finished.slots} />
        </Stack>
        {finished.slots.some(({ augment }) => augment) ? (
          <Stack
            gap='md'
            mt={
              (isArtifactItem(item) && selectedUpgradeEffects.some(isAbilityScoreEffect)) || minimumLevelIncrease
                ? 'sm'
                : 0
            }
          >
            {finished.slots
              .filter(({ augment }) => augment)
              .map(({ slot, augment }) => (
                <Box key={slot.id}>
                  <Text fw={600} size='sm' style={{ overflowWrap: 'anywhere' }}>
                    {slot.label}: {augment?.name}
                  </Text>
                  <EffectList
                    effects={(augment?.effectsAdded ?? []).map((effect) =>
                      formatEffect(adjustEffectForArtifact(effect, item))
                    )}
                    empty='No effect text published.'
                  />
                </Box>
              ))}
          </Stack>
        ) : (
          <Text c='dimmed' size='sm'>
            No augments selected.
          </Text>
        )}
      </Box>
      {finished.setBonuses.length > 0 ? (
        <Box>
          <Text fw={600} mb='xs'>
            Set bonuses
          </Text>
          <List size='sm'>
            {finished.setBonuses.map((bonus, index) => (
              <List.Item key={`${bonus.name}-${String(index)}`}>{bonus.name}</List.Item>
            ))}
          </List>
        </Box>
      ) : null}
      <Box>
        <Text fw={600} mb='xs'>
          Empty configurable slots
        </Text>
        {finished.emptySlots.length > 0 ? (
          <List size='sm'>
            {finished.emptySlots.map((slot) => (
              <List.Item key={slot.id}>{slot.label}</List.Item>
            ))}
          </List>
        ) : (
          <Text size='sm'>All configurable slots are filled.</Text>
        )}
      </Box>
      {[...(item.restrictions ?? []), ...(item.notes ?? [])].map((note) => (
        <Text key={note} size='sm'>
          {note}
        </Text>
      ))}
    </Stack>
  )
}

export default FinishedItemTool
