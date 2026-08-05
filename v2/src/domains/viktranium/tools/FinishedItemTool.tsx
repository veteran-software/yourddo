import { Alert, Box, Divider, List, Stack, Text, Title } from '@mantine/core'
import EffectList from '../../../shared/items/EffectList.tsx'
import ItemIcon from '../../../shared/items/ItemIcon.tsx'
import { formatEffect } from '../logic.ts'
import type { FinishedViktraniumItem } from '../viktranium.types.ts'

const FinishedItemTool = ({ finished }: { finished: FinishedViktraniumItem }) => {
  if (!finished.item) {
    return (
      <Alert color='blue' title='No item selected' m='md'>
        Select an item to review the finished build.
      </Alert>
    )
  }
  return (
    <Stack gap='md' p='md'>
      <Box>
        <ItemIcon item={finished.item} size={96} alt={`${finished.item.name} icon`} />
        <Title order={3} mt='xs' style={{ overflowWrap: 'anywhere' }}>
          {finished.item.name}
        </Title>
        <Text c='dimmed' size='sm'>
          {finished.item.type} · Minimum level {String(finished.minimumLevel)}
        </Text>
      </Box>
      {[...finished.warnings, ...finished.incompleteRecipeWarnings].length > 0 ? (
        <Alert color='yellow' title='Build warnings' role='alert'>
          <EffectList effects={[...finished.warnings, ...finished.incompleteRecipeWarnings]} />
        </Alert>
      ) : null}
      <Box>
        <Text fw={600} mb='xs'>
          Base effects
        </Text>
        <EffectList effects={finished.baseEffects.map(formatEffect)} />
      </Box>
      <Divider />
      <Box>
        <Text fw={600} mb='xs'>
          Selected additions by slot
        </Text>
        <Stack gap='md'>
          {finished.slots
            .filter(({ augment }) => augment)
            .map(({ slot, augment, existing }) => (
              <Box key={slot.id}>
                <Text fw={600} size='sm'>
                  {slot.label}: {augment?.name}
                  {existing ? ' (existing)' : ''}
                </Text>
                <EffectList effects={(augment?.effects ?? []).map(formatEffect)} empty='No effect text published.' />
              </Box>
            ))}
          {finished.slots.every(({ augment }) => !augment) ? (
            <Text c='dimmed' size='sm'>
              No augments selected.
            </Text>
          ) : null}
        </Stack>
      </Box>
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
      {finished.item.notes ? <Text size='sm'>{finished.item.notes}</Text> : null}
    </Stack>
  )
}

export default FinishedItemTool
