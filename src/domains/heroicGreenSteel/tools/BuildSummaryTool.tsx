import { Alert, Divider, Paper, Stack, Text, Title } from '@mantine/core'
import { EffectDetails, OptionBadges, SpellDetails } from '../components/EffectDetails.tsx'
import type { HgsBaseItem, HgsEffect, HgsSpell, HgsTier3Mode, HgsTierOption } from '../heroicGreenSteel.types.ts'

interface StageProps {
  label: string
  option?: HgsTierOption
  effects: readonly HgsEffect[]
  incomplete: string
  spell?: HgsSpell
}

const Stage = ({ label, option, effects, incomplete, spell }: StageProps) => (
  <Stack gap='xs'>
    <Title order={3} size='h5'>
      {label}
    </Title>
    {option ? (
      <>
        <Text fw={600} size='sm'>
          {option.name}
        </Text>
        <OptionBadges option={option} />
        <EffectDetails effects={effects} />
        {spell ? (
          <Paper withBorder p='sm'>
            <SpellDetails spell={spell} />
          </Paper>
        ) : null}
      </>
    ) : (
      <Text c='dimmed' size='sm'>
        {incomplete}
      </Text>
    )}
  </Stack>
)

interface BuildSummaryToolProps {
  baseItem?: HgsBaseItem
  tier1?: HgsTierOption
  tier1Effects: readonly HgsEffect[]
  tier2?: HgsTierOption
  tier2Effects: readonly HgsEffect[]
  spell?: HgsSpell
  tier3Mode: HgsTier3Mode | null
  tier3?: HgsTierOption
  tier3Effects: readonly HgsEffect[]
}

const BuildSummaryTool = ({
  baseItem,
  tier1,
  tier1Effects,
  tier2,
  tier2Effects,
  spell,
  tier3Mode,
  tier3,
  tier3Effects
}: BuildSummaryToolProps) => (
  <Stack gap='md' p='md'>
    {!baseItem ? (
      <Alert color='blue' title='No base item selected'>
        Select a Green Steel base item to begin the build.
      </Alert>
    ) : (
      <Stack gap={4}>
        <Title order={3} size='h5'>
          Base Item
        </Title>
        <Text fw={600}>{baseItem.name}</Text>
        <Text c='dimmed' size='sm'>
          {baseItem.type === 'weapon' ? baseItem.weaponType : 'Equipment'}
        </Text>
      </Stack>
    )}
    <Divider />
    <Stage label='Tier 1' option={tier1} effects={tier1Effects} incomplete='Tier 1 is incomplete.' />
    <Divider />
    <Stage label='Tier 2' option={tier2} effects={tier2Effects} incomplete='Tier 2 is incomplete.' spell={spell} />
    <Divider />
    <Stage
      label={`Tier 3${tier3Mode ? ` · ${tier3Mode === 'basic' ? 'Basic' : 'Focused'}` : ''}`}
      option={tier3}
      effects={tier3Effects}
      incomplete='Tier 3 is incomplete.'
    />
  </Stack>
)

export default BuildSummaryTool
