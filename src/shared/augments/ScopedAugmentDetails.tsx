import { Box, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import type { GearPlannerEffect } from '../../domains/gearPlanner/gearPlanner.types'
import { scopedEffectLabel } from './scopedEffectLabel'

export interface ScopedAugmentPresentation {
  presentation: readonly { name: string; rows: readonly GearPlannerEffect[] }[]
  fallbackDescription?: string
}

const normalizeName = (name: string) => name.trim().replaceAll(/\s+/g, ' ').toLowerCase()

export default function ScopedAugmentDetails({
  presentation,
  fallbackDescription,
  augmentName,
  renderRow
}: Readonly<
  ScopedAugmentPresentation & {
    augmentName?: string
    renderRow?: (row: GearPlannerEffect, label: string) => ReactNode
  }
>) {
  const size = augmentName ? 'xs' : 'sm'
  const displayedName = normalizeName(augmentName ?? '')
  if (!presentation.length) return fallbackDescription ? <Text size={size}>{fallbackDescription}</Text> : null
  return (
    <Stack gap='xs'>
      {presentation.map(({ name, rows }, groupIndex) => (
        <Box key={name + String(groupIndex)}>
          {normalizeName(name) !== displayedName && (
            <Text size={size} fw={600}>
              {name}
            </Text>
          )}
          {rows.map((row, index) => (
            <Box key={row.name + String(index)} pl={normalizeName(name) === displayedName ? undefined : 'sm'}>
              <Text size={size}>{renderRow ? renderRow(row, scopedEffectLabel(row)) : scopedEffectLabel(row)}</Text>
            </Box>
          ))}
        </Box>
      ))}
    </Stack>
  )
}
