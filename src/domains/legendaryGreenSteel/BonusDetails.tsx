import { Box, Stack, Text } from '@mantine/core'
import DiscrepancyList from './DiscrepancyList.tsx'
import type { LgsBonusEffect } from './legendaryGreenSteel.types.ts'

export default function BonusDetails({ bonus }: Readonly<{ bonus: LgsBonusEffect }>) {
  return (
    <Stack gap='md'>
      {bonus.paragraphs.map((paragraph) => (
        <Text key={paragraph} size='sm' lh={1.65} maw='65ch'>
          {paragraph}
        </Text>
      ))}
      {!bonus.requiredFocuses && (
        <Text size='sm' c='dimmed'>
          Activation is unverified.
        </Text>
      )}
      {bonus.notes.length > 0 && (
        <Box component='details'>
          <Text component='summary' size='sm' fw={500} style={{ cursor: 'pointer', width: 'fit-content' }}>
            Technical notes
          </Text>
          <Stack gap='sm' mt='sm'>
            {bonus.notes.map((note) => (
              <Text key={note} size='sm' lh={1.6} c='dimmed'>
                {note}
              </Text>
            ))}
          </Stack>
        </Box>
      )}
      <DiscrepancyList notes={bonus.discrepancies} />
    </Stack>
  )
}
