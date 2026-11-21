import { Box, Text } from '@mantine/core'
import EffectList from '../../shared/items/EffectList.tsx'

export default function DiscrepancyList({ notes }: { notes: readonly string[] }) {
  if (!notes.length) return null
  return (
    <>
      <Box component='hr' m={0} />
      <Text component='h4' fw={600} size='sm'>
        Discrepancies
      </Text>
      <EffectList effects={notes} />
    </>
  )
}
