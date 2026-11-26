import ScopedAugmentDetails from '../../../shared/augments/ScopedAugmentDetails'
import { Alert, Box, List, Stack, Text } from '@mantine/core'
import { BuildHeader } from './RecipeParts'
import styles from '../../../shared/layout/craftingTools.module.css'
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
  return (
    <Stack gap='md' p='md'>
      <BuildHeader finished={finished} />
      {finished.warnings.length > 0 ? (
        <Alert color='red' title='Build validation' role='alert'>
          <EffectList effects={finished.warnings} />
        </Alert>
      ) : null}
      <Box className={styles.stage}>
        <h3>Original effects</h3>
        <EffectList effects={finished.originalEffects.map(formatEffect)} />
      </Box>
      <Box className={styles.stage}>
        <h3>Crafted additions by slot</h3>
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
                <Box key={slot.id} className={styles.effect}>
                  <Text fw={600} size='sm' style={{ overflowWrap: 'anywhere' }}>
                    {slot.label}: {augment?.name}
                  </Text>
                  {augment?.scoped ? (
                    <ScopedAugmentDetails {...augment.scoped} />
                  ) : (
                    <EffectList
                      effects={(augment?.effectsAdded ?? []).map((effect) =>
                        formatEffect(adjustEffectForArtifact(effect, item))
                      )}
                      empty='No effect text published.'
                    />
                  )}
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
        <Box className={styles.stage}>
          <h3>Set bonuses</h3>
          <List size='sm'>
            {finished.setBonuses.map((bonus, index) => (
              <List.Item key={`${bonus.name}-${String(index)}`}>{bonus.name}</List.Item>
            ))}
          </List>
        </Box>
      ) : null}
      <Box className={styles.stage}>
        <h3>Empty configurable slots</h3>
        {finished.emptySlots.length > 0 ? (
          <ul className={styles.slotList}>
            {finished.emptySlots.map((slot) => (
              <li key={slot.id}>{slot.label}</li>
            ))}
          </ul>
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
