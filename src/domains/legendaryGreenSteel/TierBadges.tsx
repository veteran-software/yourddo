import { Badge, Group } from '@mantine/core'
import { keyedEntries } from '../../shared/ui/keyedEntries'
import type { LgsTierAugment } from './legendaryGreenSteel.types'

export default function TierBadges({ tier }: Readonly<{ tier: LgsTierAugment }>) {
  return (
    <Group gap={6} wrap='wrap'>
      {keyedEntries(tier.focuses).map(({ key, value: focus }) => (
        <Badge key={key} variant='light'>
          {focus}
        </Badge>
      ))}
      <Badge variant='outline' color='gray'>
        {tier.essence}
      </Badge>
      <Badge variant='outline' color='gray'>
        {tier.gem}
      </Badge>
    </Group>
  )
}
