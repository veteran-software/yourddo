import { Button, Group, Stack, Text } from '@mantine/core'
import type { RecommendedAugment } from '../augmentRecommendations'

export default function SuggestedAugments({
  augments,
  onApply
}: Readonly<{ augments: readonly RecommendedAugment[]; onApply?: () => void }>) {
  if (!augments.length) return null

  return (
    <Group justify='space-between' gap='xs' px='sm' py='xs'>
      <Stack gap={3}>
        <Text size='xs' fw={600}>
          Suggested augments
        </Text>
        {augments.map(({ index, socket, augment }) => (
          <Text key={index} size='xs' c='dimmed'>
            {socket.name ?? socket.augmentType} {index + 1} · {augment.name}
          </Text>
        ))}
      </Stack>
      {onApply && (
        <Button variant='light' size='compact-xs' onClick={onApply}>
          Equip with augments
        </Button>
      )}
    </Group>
  )
}
