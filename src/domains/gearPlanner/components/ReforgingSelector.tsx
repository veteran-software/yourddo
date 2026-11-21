import { Select, Stack, Switch } from '@mantine/core'
import type { GearPlannerItem } from '../gearPlanner.types.ts'
import {
  gearPlannerReforgingRecipesForItem,
  gearPlannerReforgingStageLabel,
  gearPlannerReforgingStages,
  type GearPlannerReforgingData,
  type GearPlannerReforgingStage,
  type GearPlannerReforgingStageState
} from '../reforging.ts'

interface ReforgingSelectorProps {
  item: GearPlannerItem
  data: GearPlannerReforgingData
  selected: import('../reforging.ts').GearPlannerItemReforgingState | undefined
  onChange: (stage: GearPlannerReforgingStage, update: GearPlannerReforgingStageState | null) => void
}

const ReforgingSelector = ({ item, data, selected, onChange }: ReforgingSelectorProps) => {
  const recipes = gearPlannerReforgingRecipesForItem(item, data)
  if (recipes.length === 0) return null

  return (
    <Stack gap='xs' data-testid={`reforging-${item.id}`}>
      {gearPlannerReforgingStages.flatMap((stage) => {
        const recipe = recipes.find((candidate) => candidate.stage === stage)
        if (!recipe) return []
        const value = selected?.[stage]
        const label = gearPlannerReforgingStageLabel[stage]
        return recipe.kind === 'toggle'
          ? [
              <Switch
                key={stage}
                size='xs'
                label={`${label} applied`}
                checked={value?.kind === 'active'}
                onChange={(event) => {
                  onChange(stage, event.currentTarget.checked ? { kind: 'active' } : null)
                }}
              />
            ]
          : [
              <Select
                key={stage}
                size='xs'
                label={label}
                placeholder='None'
                clearable
                searchable
                data={recipe.choices.map((choice) => ({ value: choice.id, label: choice.label }))}
                value={value?.kind === 'choice' ? value.choiceId : null}
                onChange={(choiceId) => {
                  onChange(stage, choiceId === null ? null : { kind: 'choice', choiceId })
                }}
              />
            ]
      })}
    </Stack>
  )
}

export default ReforgingSelector
