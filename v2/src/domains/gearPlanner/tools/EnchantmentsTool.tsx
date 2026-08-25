import { Alert, Badge, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core'
import type {
  GearPlannerEffectConflictResolution,
  GearPlannerEffectSource,
  GearPlannerEffectSummary
} from '../effects.ts'

const bonusTypeLabel = (bonusType: string) =>
  bonusType === 'no type' ? 'No type' : bonusType.replace(/\b\w/g, (letter) => letter.toUpperCase())

const sourceLabel = (source: GearPlannerEffectSource) => {
  const modifier = source.effect.modifier == null ? '' : ` ${String(source.effect.modifier)}`
  const bonus = source.effect.bonus == null || source.effect.bonus === '' ? '' : ` (${String(source.effect.bonus)})`
  return `${source.effect.name}${modifier}${bonus}`
}

const sourceProvenance = (source: GearPlannerEffectSource): string =>
  source.category === 'set'
    ? source.setCategory === 'filigree'
      ? `${source.setName ?? 'Set bonus'} · ${String(source.setThreshold ?? 0)}-piece filigree set bonus`
      : `${source.setName ?? 'Set bonus'} · ${String(source.setThreshold ?? 0)}-piece bonus`
    : source.category === 'augment'
      ? `${source.augmentName ?? 'Augment'} slotted in ${source.itemName ?? 'Equipped item'} · ${source.slot ?? 'Equipment'} / ${source.augmentSlotName ?? `Augment slot ${String((source.augmentSlotIndex ?? 0) + 1)}`}`
      : source.category === 'curse'
        ? `Deck of Many Curses · ${source.curseName ?? 'Curse'} on ${source.slot ?? 'Equipment'}: ${source.itemName ?? 'Equipped item'}`
      : source.category === 'filigree'
        ? `${source.filigreeName ?? 'Filigree'} on ${source.itemName ?? 'Equipped item'} · ${source.slot ?? 'Equipment'} / Filigree slot ${String((source.filigreeSlotIndex ?? 0) + 1)}`
        : `${source.itemName ?? 'Equipped item'} · ${source.slot ?? 'Equipment'}`

const groupValue = (group: GearPlannerEffectSummary['groups'][number]) =>
  group.effectiveValue === 0 ? group.effectiveDisplay || 'Active' : `+${String(group.effectiveValue)}`

const EnchantmentSourceList = ({
  sources,
  conflicts,
  compact = false
}: {
  sources: readonly GearPlannerEffectSource[]
  conflicts: GearPlannerEffectConflictResolution
  compact?: boolean
}) =>
  sources.length ? (
    <Stack gap={2}>
      {sources.map((source) => {
        const resolution = conflicts.bySourceId[source.id]
        return (
          <Text
            key={source.id}
            c={resolution && !resolution.isEffective ? 'dimmed' : undefined}
            data-conflict-state={resolution ? (resolution.isEffective ? 'effective' : 'lesser') : 'none'}
            data-testid={`equipped-effect-${source.id}`}
            size={compact ? 'xs' : 'sm'}
            td={resolution && !resolution.isEffective ? 'line-through' : undefined}
            style={{ overflowWrap: 'anywhere' }}
          >
            {sourceLabel(source)}
          </Text>
        )
      })}
    </Stack>
  ) : null

export const EquippedEnchantmentList = ({
  sources,
  conflicts
}: {
  sources: readonly GearPlannerEffectSource[]
  conflicts: GearPlannerEffectConflictResolution
}) =>
  sources.length ? (
    <Stack gap={2} mt='xs'>
      <Text c='dimmed' size='xs' fw={600}>
        Enchantments
      </Text>
      <EnchantmentSourceList sources={sources} conflicts={conflicts} compact />
    </Stack>
  ) : null

const EnchantmentsTool = ({ summary }: { summary: readonly GearPlannerEffectSummary[] }) => {
  if (!summary.length) {
    return (
      <Alert color='blue' title='No enchantments yet' m='md'>
        Equip an item to summarize its base enchantments.
      </Alert>
    )
  }

  return (
    <Stack gap='sm' p='md'>
      <Stack gap={2}>
        <Title order={2} size='h3'>
          Enchantments
        </Title>
        <Text c='dimmed' size='xs'>
          Legacy-style display aggregate, not a character stat calculation.
        </Text>
      </Stack>
      {summary.map((effect) => (
        <Paper key={effect.normalizedName} withBorder p='sm'>
          <Stack gap='xs'>
            <Group justify='space-between' align='flex-start' gap='xs' wrap='nowrap'>
              <Text fw={700} size='sm' style={{ overflowWrap: 'anywhere' }}>
                {effect.name}
              </Text>
              {effect.isNumeric ? <Badge variant='light'>+{String(effect.total)}</Badge> : null}
            </Group>
            {effect.groups.map((group) => (
              <Stack key={group.bonusType} gap={4}>
                <Divider />
                <Group justify='space-between' gap='xs'>
                  <Text size='xs' fw={600}>
                    {bonusTypeLabel(group.bonusType)}
                  </Text>
                  <Text size='xs' fw={600}>
                    {groupValue(group)}
                  </Text>
                </Group>
                <Stack gap={2}>
                  {group.entries.map((entry) => (
                    <Text
                      key={entry.id}
                      c={entry.isEffective ? undefined : 'dimmed'}
                      data-effect-state={entry.isEffective ? 'effective' : 'lesser'}
                      size='xs'
                      td={entry.isEffective ? undefined : 'line-through'}
                      style={{ overflowWrap: 'anywhere' }}
                    >
                      {sourceProvenance(entry)}: {sourceLabel(entry)}
                    </Text>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}

export default EnchantmentsTool
