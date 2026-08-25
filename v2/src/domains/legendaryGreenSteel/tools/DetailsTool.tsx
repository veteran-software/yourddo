import { Alert, Badge, Divider, Group, Stack, Text, Title } from '@mantine/core'
import EffectList from '../../../shared/items/EffectList.tsx'
import type { LgsActiveAugment, LgsBaseItem, LgsBonusEffect, LgsTierAugment } from '../legendaryGreenSteel.types.ts'
import { formatLgsEffect } from '../logic.ts'

const TierBadges = ({ tier }: { tier: LgsTierAugment }) => (
  <Group gap={6} wrap='wrap'>
    <Badge variant='light'>{tier.primaryFocus}</Badge>
    {tier.secondaryFocus ? (
      <Badge variant='outline' color='gray'>
        {tier.secondaryFocus}
      </Badge>
    ) : null}
    <Badge variant='outline' color='gray'>
      {tier.essence}
    </Badge>
    <Badge variant='outline' color='gray'>
      {tier.gem}
    </Badge>
  </Group>
)

const TierDetails = ({ label, tier }: { label: string; tier: LgsTierAugment | undefined }) => (
  <Stack gap='xs'>
    <Title order={3} size='h5'>
      {label}
    </Title>
    {tier ? (
      <>
        <Text fw={600} size='sm'>
          {tier.name}
        </Text>
        <TierBadges tier={tier} />
        <EffectList effects={tier.effectsAdded.map(formatLgsEffect)} empty='No published effects.' />
      </>
    ) : (
      <Text c='dimmed' size='sm'>
        {label} is incomplete.
      </Text>
    )}
  </Stack>
)

const DetailsTool = ({
  baseItem,
  tier1,
  tier2,
  tier3,
  bonusEffect,
  activeAugment
}: {
  baseItem?: LgsBaseItem
  tier1?: LgsTierAugment
  tier2?: LgsTierAugment
  tier3?: LgsTierAugment
  bonusEffect?: LgsBonusEffect
  activeAugment?: LgsActiveAugment
}) => (
  <Stack gap='md' p='md'>
    {!baseItem ? (
      <Alert color='blue' title='No base item selected'>
        Select a Legendary Green Steel base item to begin the build.
      </Alert>
    ) : (
      <Stack gap={4}>
        <Title order={3} size='h5'>
          Base Item
        </Title>
        <Text fw={600}>{baseItem.name}</Text>
        <Text c='dimmed' size='sm'>
          {baseItem.ingredientType}
        </Text>
      </Stack>
    )}
    <Divider />
    <TierDetails label='Tier 1' tier={tier1} />
    <Divider />
    <TierDetails label='Tier 2' tier={tier2} />
    <Divider />
    <TierDetails label='Tier 3' tier={tier3} />
    <Divider />
    <Stack gap='xs'>
      <Title order={3} size='h5'>
        Bonus Effect
      </Title>
      {bonusEffect ? (
        <>
          <Text fw={600} size='sm'>
            {bonusEffect.name}
          </Text>
          <Text size='sm'>{bonusEffect.description}</Text>
        </>
      ) : (
        <Text c='dimmed' size='sm'>
          Bonus Effect is incomplete.
        </Text>
      )}
    </Stack>
    <Divider />
    <Stack gap='xs'>
      <Title order={3} size='h5'>
        Active Augment
      </Title>
      {activeAugment ? (
        <>
          <Text fw={600} size='sm'>
            {activeAugment.displayName}
          </Text>
          {activeAugment.type ? (
            <Text c='dimmed' size='sm'>
              {activeAugment.type}
            </Text>
          ) : null}
          {activeAugment.description ? <Text size='sm'>{activeAugment.description}</Text> : null}
        </>
      ) : (
        <Text c='dimmed' size='sm'>
          Active Augment is incomplete.
        </Text>
      )}
    </Stack>
  </Stack>
)

export default DetailsTool
