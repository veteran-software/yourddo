import { ActionIcon, Group, Stack, Text } from '@mantine/core'
import { IconChevronUp, IconChevronDown, IconX } from '@tabler/icons-react'
import { useMemo } from 'react'
import type { GearPlannerData } from '../gearPlanner.types'
import type { GearOwner } from '../character'
import type { GearPlannerEffectSource } from '../effects'
import { skillObjective } from '../statObjectives'
import StatObjectivePicker from './StatObjectivePicker'
import { useStatCatalog } from './useStatCatalog'

export default function FocusStatEditor({
  data,
  owner,
  effects,
  names,
  onChange
}: Readonly<{
  data: GearPlannerData
  owner: GearOwner
  effects: readonly GearPlannerEffectSource[]
  names: string[]
  onChange: (names: string[]) => void
}>) {
  const { stats, equipped } = useStatCatalog(data, owner, effects)
  const available = useMemo(
    () =>
      new Map(
        [...stats].filter(([name]) => !names.some((n) => skillObjective(n).toLowerCase() === name.toLowerCase()))
      ),
    [stats, names]
  )
  function move(index: number, direction: number) {
    const reordered = [...names]
    reordered.splice(index + direction, 0, ...reordered.splice(index, 1))
    onChange(reordered)
  }
  return (
    <Stack gap='xs'>
      {names.length < 5 ? (
        <StatObjectivePicker
          focus
          verbatim={Boolean(data.enchantmentNames)}
          stats={available}
          equipped={equipped}
          value={null}
          onSelect={(name) => {
            onChange([...names, name])
          }}
        />
      ) : (
        <Text size='sm' fw={500}>
          Focus stats
        </Text>
      )}
      <Text size='xs' c='dimmed'>
        Choose up to five stats. Higher priorities rank first in upgrade recommendations.
      </Text>
      {names.map((name, index) => (
        <Group key={name} gap='xs' wrap='nowrap'>
          <Text size='sm' c='dimmed'>
            {index + 1}
          </Text>
          <Text size='sm' flex={1}>
            {name}
          </Text>
          <ActionIcon
            variant='subtle'
            aria-label={'Raise priority of ' + name}
            disabled={index === 0}
            onClick={() => {
              move(index, -1)
            }}
          >
            <IconChevronUp size={16} />
          </ActionIcon>
          <ActionIcon
            variant='subtle'
            aria-label={'Lower priority of ' + name}
            disabled={index === names.length - 1}
            onClick={() => {
              move(index, 1)
            }}
          >
            <IconChevronDown size={16} />
          </ActionIcon>
          <ActionIcon
            variant='subtle'
            aria-label={'Remove ' + name}
            onClick={() => {
              onChange(names.filter((n) => n !== name))
            }}
          >
            <IconX size={16} />
          </ActionIcon>
        </Group>
      ))}
    </Stack>
  )
}
