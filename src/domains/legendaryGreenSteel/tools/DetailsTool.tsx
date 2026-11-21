import TierBadges from '../TierBadges'
import { Alert, Divider, Stack, Text, Title } from '@mantine/core'
import BonusDetails from '../BonusDetails.tsx'
import DiscrepancyList from '../DiscrepancyList.tsx'
import EffectList from '../../../shared/items/EffectList.tsx'
import type { LgsActiveAugment, LgsBaseItem, LgsBonusEffect, LgsTierAugment } from '../legendaryGreenSteel.types.ts'

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
        <EffectList effects={[...tier.effects, ...tier.details]} empty='No published effects.' />
        <DiscrepancyList notes={tier.discrepancies} />
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
  weaponResult,
  activeAugment,
  heart
}: {
  baseItem?: LgsBaseItem
  tier1?: LgsTierAugment
  tier2?: LgsTierAugment
  tier3?: LgsTierAugment
  weaponResult?: string
  bonusEffect?: LgsBonusEffect
  heart?: string
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
          {baseItem.type === 'weapon' ? 'Weapon' : 'Accessory'}
        </Text>
        <EffectList effects={[...baseItem.effects, ...baseItem.details]} />
        {heart && <Text size='sm'>Cleansed with {heart}</Text>}
        <DiscrepancyList notes={baseItem.discrepancies} />
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
      {weaponResult && <Text size='sm'>{weaponResult}</Text>}
      {bonusEffect ? (
        <>
          <Text fw={600} size='sm'>
            {bonusEffect.name}
          </Text>
          <BonusDetails key={bonusEffect.name} bonus={bonusEffect} />
        </>
      ) : (
        !weaponResult && (
          <Text c='dimmed' size='sm'>
            No bonus selected for reference.
          </Text>
        )
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
          {activeAugment.spellDetails ? (
            <Text c='dimmed' size='sm'>
              {activeAugment.spellDetails}
            </Text>
          ) : null}
          {activeAugment.description ? (
            <Text size='sm' style={{ whiteSpace: 'pre-line' }}>
              {activeAugment.description}
            </Text>
          ) : null}
          <DiscrepancyList notes={activeAugment.discrepancies} />
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
