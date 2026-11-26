import { BuildHeader } from '../../../shared/layout/GreenSteelBuildParts'
import styles from '../../../shared/layout/craftingTools.module.css'
import { Alert, Paper, Stack, Text } from '@mantine/core'
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
  <Stack component='section' className={styles.stage} gap='xs'>
    <h3>{label}</h3>
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

const tier3Labels = { basic: 'Tier 3 · Basic', focused: 'Tier 3 · Focused' } as const

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
      <BuildHeader item={baseItem} tiers={[tier1, tier2, tier3].filter(Boolean).length} />
    )}
    <Stage label='Tier 1' option={tier1} effects={tier1Effects} incomplete='Tier 1 is incomplete.' />
    <Stage label='Tier 2' option={tier2} effects={tier2Effects} incomplete='Tier 2 is incomplete.' spell={spell} />
    <Stage
      label={tier3Mode ? tier3Labels[tier3Mode] : 'Tier 3'}
      option={tier3}
      effects={tier3Effects}
      incomplete='Tier 3 is incomplete.'
    />
  </Stack>
)

export default BuildSummaryTool
