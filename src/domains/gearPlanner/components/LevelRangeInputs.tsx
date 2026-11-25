import { NumberInput } from '@mantine/core'
import { gearPlannerMaximumLevel, gearPlannerMinimumLevel, type GearPlannerSetup } from '../setups'

export type LevelRange = Pick<GearPlannerSetup, 'minimumLevel' | 'maximumLevel'>

export default function LevelRangeInputs({
  minimumLevel,
  maximumLevel,
  updateLevels
}: Readonly<
  LevelRange & {
    updateLevels: (update: Partial<LevelRange>) => void
  }
>) {
  return (
    <>
      <NumberInput
        label='Minimum level'
        min={gearPlannerMinimumLevel}
        max={gearPlannerMaximumLevel}
        allowDecimal={false}
        value={minimumLevel}
        onChange={(value) => {
          updateLevels({ minimumLevel: typeof value === 'number' ? value : gearPlannerMinimumLevel })
        }}
      />
      <NumberInput
        label='Maximum level'
        min={gearPlannerMinimumLevel}
        max={gearPlannerMaximumLevel}
        allowDecimal={false}
        value={maximumLevel}
        onChange={(value) => {
          updateLevels({ maximumLevel: typeof value === 'number' ? value : gearPlannerMaximumLevel })
        }}
      />
    </>
  )
}
