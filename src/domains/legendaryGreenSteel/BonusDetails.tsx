import { Stack, Text } from '@mantine/core'
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
      <DiscrepancyList notes={bonus.discrepancies} />
    </Stack>
  )
}
