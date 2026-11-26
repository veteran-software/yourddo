import type { ReactNode } from 'react'
import styles from '../../../shared/layout/craftingTools.module.css'
import { Alert, Box, Stack, Text } from '@mantine/core'
import ScopedAugmentDetails from '../../../shared/augments/ScopedAugmentDetails'
import EffectList from '../../../shared/items/EffectList.tsx'
import { formatEffect } from '../logic.ts'
import type { FinishedViktraniumItem } from '../viktranium.types.ts'

const FinishedItemTool = ({ header, finished }: { header: ReactNode; finished: FinishedViktraniumItem }) => {
  if (!finished.item) {
    return (
      <Alert color='blue' title='No item selected' m='md'>
        Select an item to review the finished build.
      </Alert>
    )
  }
  return (
    <Stack gap='md' p='md'>
      {header}
      {[...finished.warnings, ...finished.incompleteRecipeWarnings].length > 0 ? (
        <Alert color='yellow' title='Build warnings' role='alert'>
          <EffectList effects={[...finished.warnings, ...finished.incompleteRecipeWarnings]} />
        </Alert>
      ) : null}
      <Box component='section' className={styles.stage}>
        <h3>Base effects</h3>
        <EffectList effects={finished.baseEffects.map(formatEffect)} />
      </Box>
      <Box component='section' className={styles.stage}>
        <h3>Selected additions by slot</h3>
        <Stack gap='md'>
          {finished.slots
            .filter(({ augment }) => augment)
            .map(({ slot, augment, existing }) => (
              <Box key={slot.id} className={styles.effect}>
                <Text fw={600} size='sm'>
                  {slot.label}: {augment?.name}
                  {existing ? ' (existing)' : ''}
                </Text>
                {augment?.scoped ? (
                  <ScopedAugmentDetails {...augment.scoped} />
                ) : (
                  <EffectList effects={(augment?.effects ?? []).map(formatEffect)} empty='No effect text published.' />
                )}
              </Box>
            ))}
          {finished.slots.every(({ augment }) => !augment) ? (
            <Text c='dimmed' size='sm'>
              No augments selected.
            </Text>
          ) : null}
        </Stack>
      </Box>
      <Box component='section' className={styles.stage}>
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
      {finished.item.notes ? <Text size='sm'>{finished.item.notes}</Text> : null}
    </Stack>
  )
}

export default FinishedItemTool
