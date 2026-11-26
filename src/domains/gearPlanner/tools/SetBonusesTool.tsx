import KnownDiscrepancies from '../components/KnownDiscrepancies'
import { Alert, Badge, Button, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core'
import type { GearFindTarget } from '../finding'
import { formatGearPlannerSetEffect, type GearPlannerSetMembership, type GearPlannerSetState } from '../sets.ts'

const membershipLabel = (membership: GearPlannerSetMembership): string => {
  if (membership.category === 'augment') {
    return `${membership.slot}: ${membership.augmentName ?? 'Augment'} on ${membership.itemName}`
  }
  if (membership.category === 'filigree') {
    return `${membership.slot}: ${membership.filigreeName ?? 'Filigree'} on ${membership.itemName} / Filigree slot ${String((membership.filigreeSlotIndex ?? 0) + 1)}`
  }
  return `${membership.slot}: ${membership.itemName}`
}

const contributionLabel = (count: number): string =>
  `${String(count)} ${count === 1 ? 'contribution' : 'contributions'}`

const SetBonusesTool = ({
  setState,
  onFind
}: {
  setState: GearPlannerSetState
  onFind: (target: GearFindTarget) => void
}) => {
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
          Current equipped-item, selected-augment, and filigree set contributions.
        </Text>
      </Stack>
      {setState.sets.map(({ name, count, category, memberships, definition, thresholds }) => (
        <Paper key={memberships[0].id} withBorder p='sm'>
          <Stack gap='xs'>
            <Group justify='space-between' align='flex-start' gap='xs' wrap='nowrap'>
              <Text fw={700} size='sm' style={{ overflowWrap: 'anywhere' }}>
                {name}
              </Text>
              <Group gap={4} wrap='nowrap'>
                <Badge color={category === 'filigree' ? 'violet' : 'blue'} variant='light'>
                  {category === 'filigree' ? 'Filigree Set' : 'Item Set'}
                </Badge>
                <Badge variant='light'>{contributionLabel(count)}</Badge>
              </Group>
            </Group>
            <Stack gap={2}>
              {memberships.map((membership) => (
                <Text key={membership.id} c='dimmed' size='xs'>
                  {membershipLabel(membership)}
                </Text>
              ))}
            </Stack>
            <Button
              size='compact-xs'
              variant='light'
              w='fit-content'
              aria-label={`Find members of ${name}`}
              onClick={() => {
                onFind({ kind: category, name })
              }}
            >
              Find set members
            </Button>
            {definition === undefined ? (
              <Alert color='yellow' variant='light' title='Effect definition unavailable'>
                This membership is counted, but its {category === 'filigree' ? 'filigree' : 'item'} set effects are
                unavailable.
              </Alert>
            ) : (
              thresholds.map(({ id, threshold, effects, isActive, requirement }) => {
                const remaining = Math.max(0, threshold - count)
                const reached = remaining === 0
                return (
                  <Stack key={id} gap={4}>
                    <Divider />
                    <Group justify='space-between' gap='xs'>
                      <Text size='xs' fw={600}>
                        {String(threshold)}-piece bonus
                      </Text>
                      <Badge color={isActive ? 'green' : 'gray'} variant='light'>
                        {isActive
                          ? 'Active'
                          : reached
                            ? requirement
                              ? 'Conditional'
                              : 'Superseded'
                            : `Equip ${String(remaining)} more`}
                      </Badge>
                    </Group>
                    {requirement && <Text size='xs'>{requirement}</Text>}
                    {isActive || (reached && requirement)
                      ? effects.map((effect, effectIndex) => (
                          <Text key={`${id}:${String(effectIndex)}`} size='xs'>
                            {formatGearPlannerSetEffect(effect)}
                          </Text>
                        ))
                      : null}
                    <KnownDiscrepancies notes={effects.flatMap((effect) => effect.discrepancyNotes ?? [])} />
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
