import { Box } from '@mantine/core'

export function PressMarker({ completed }: Readonly<{ completed: boolean }>) {
  return (
    <Box
      component='span'
      aria-hidden='true'
      pos='absolute'
      top={4}
      right={4}
      w={20}
      h={20}
      bg={completed ? 'yellow.6' : 'green.6'}
      c='black'
      fw={700}
      fz='sm'
      style={{ borderRadius: '50%', display: 'grid', placeItems: 'center' }}
    >
      {completed ? '✓' : '!'}
    </Box>
  )
}
