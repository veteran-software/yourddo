import { Alert, Badge, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { formatGearPlannerSetEffect, type GearPlannerSetMembership, type GearPlannerSetState } from '../sets.ts'

const membershipLabel = (membership: GearPlannerSetMembership): string =>
  membership.category === 'augment'
    ? `${membership.slot}: ${membership.augmentName ?? 'Augment'} on ${membership.itemName}`
    : `${membership.slot}: ${membership.itemName}`

const contributionLabel = (count: number): string =>
  `${String(count)} ${count === 1 ? 'contribution' : 'contributions'}`

const SetBonusesTool = ({ setState }: { setState: GearPlannerSetState }) => {
  if (!setState.sets.length) {
    return (
      <Alert color='blue' title='No set memberships yet' m='md'>
        Equip an item or select an augment that belongs to a set.
      </Alert>
    )
  }

  return (
    <Stack gap='sm' p='md'>
      <Stack gap={2}>
        <Title order={2} size='h3'>
          Set Bonuses
        </Title>
        <Text c='dimmed' size='xs'>
          Current equipped-item and selected-augment set contributions.
        </Text>
      </Stack>
      {setState.sets.map(({ name, count, memberships, definition, thresholds }) => (
        <Paper key={name} withBorder p='sm'>
          <Stack gap='xs'>
            <Group justify='space-between' align='flex-start' gap='xs' wrap='nowrap'>
              <Text fw={700} size='sm' style={{ overflowWrap: 'anywhere' }}>
                {name}
              </Text>
              <Badge variant='light'>{contributionLabel(count)}</Badge>
            </Group>
            <Stack gap={2}>
              {memberships.map((membership) => (
                <Text key={membership.id} c='dimmed' size='xs'>
                  {membershipLabel(membership)}
                </Text>
              ))}
            </Stack>
            {definition === undefined ? (
              <Alert color='yellow' variant='light' title='Effect definition unavailable'>
                This membership is counted, but its standard set effects are not in the curated definition data.
              </Alert>
            ) : (
              thresholds.map(({ id, threshold, effects, isActive }) => {
                const remaining = Math.max(0, threshold - count)
                return (
                  <Stack key={id} gap={4}>
                    <Divider />
                    <Group justify='space-between' gap='xs'>
                      <Text size='xs' fw={600}>
                        {String(threshold)}-piece bonus
                      </Text>
                      <Badge color={isActive ? 'green' : 'gray'} variant='light'>
                        {isActive ? 'Active' : `Equip ${String(remaining)} more`}
                      </Badge>
                    </Group>
                    {isActive
                      ? effects.map((effect, effectIndex) => (
                          <Text key={`${id}:${String(effectIndex)}`} size='xs'>
                            {formatGearPlannerSetEffect(effect)}
                          </Text>
                        ))
                      : null}
                  </Stack>
                )
              })
            )}
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}

export default SetBonusesTool
