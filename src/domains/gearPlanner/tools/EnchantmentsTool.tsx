import { statValue } from '../loadoutComparison'
import layout from '../../../shared/layout/PlannerWorkspace.module.css'
import EquippedEffect from '../components/EquippedEffect'
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Button,
  Divider,
  Group,
  List,
  Paper,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { useEffect, useMemo, useRef } from 'react'
import { IconSearch } from '@tabler/icons-react'
import type { GearFindTarget } from '../finding'
import type { GearPlannerCandidate } from '../planner'
import { normalizeBonusType, normalizeEffectName } from '../effects'
import type {
  GearPlannerEffectConflictResolution,
  GearPlannerEffectSource,
  GearPlannerEffectSummary
} from '../effects.ts'
import { gearPlannerReforgingStageLabel } from '../reforging.ts'

const bonusTypeLabel = (bonusType: string) =>
  bonusType === 'no type' ? 'No type' : bonusType.replace(/\b\w/g, (letter) => letter.toUpperCase())

const sourceLabel = (source: GearPlannerEffectSource) => {
  const modifier = source.effect.modifier == null ? '' : ` ${String(source.effect.modifier)}`
  const bonus = source.effect.bonus == null || source.effect.bonus === '' ? '' : ` (${String(source.effect.bonus)})`
  return `${source.effect.name}${modifier}${bonus}`
}

const reforgingStageLabel = (source: GearPlannerEffectSource) =>
  source.reforgingStage ? gearPlannerReforgingStageLabel[source.reforgingStage] : 'Reforging upgrade'

const sourceProvenance = (source: GearPlannerEffectSource): string => {
  if (source.category === 'crafting') {
    return `${source.craftLabel ?? 'Item upgrade'} · ${source.slot ?? 'Equipment'}: ${source.itemName ?? 'Equipped item'}`
  }
  if (source.category === 'set') {
    if (source.setCategory === 'filigree') {
      return `${source.setName ?? 'Set bonus'} · ${String(source.setThreshold ?? 0)}-piece filigree set bonus`
    }
    return `${source.setName ?? 'Set bonus'} · ${String(source.setThreshold ?? 0)}-piece bonus`
  }
  if (source.category === 'augment') {
    return `${source.augmentName ?? 'Augment'} slotted in ${source.itemName ?? 'Equipped item'} · ${source.slot ?? 'Equipment'} / ${source.augmentSlotName ?? 'Augment slot ' + String((source.augmentSlotIndex ?? 0) + 1)}`
  }
  if (source.category === 'reforging-tier') {
    return `Reforging · ${reforgingStageLabel(source)} tier on ${source.slot ?? 'Equipment'}: ${source.itemName ?? 'Equipped item'}`
  }
  if (source.category === 'reforging-choice') {
    return `Reforging · ${reforgingStageLabel(source)}: ${source.reforgingChoiceLabel ?? 'Selected choice'} on ${source.slot ?? 'Equipment'}: ${source.itemName ?? 'Equipped item'}`
  }
  if (source.category === 'curse') {
    return `${source.curseName ?? 'Curse'} on ${source.slot ?? 'Equipment'}`
  }
  if (source.category === 'essence') {
    return `Essence Crafting · ${source.essenceAffixPosition ?? 'Affix'}: ${source.essenceEnhancementName ?? 'Enhancement'} on ${source.slot ?? 'Equipment'}: ${source.itemName ?? 'Equipped item'}`
  }
  if (source.category === 'filigree') {
    return `${source.filigreeName ?? 'Filigree'} on ${source.itemName ?? 'Equipped item'} · ${source.slot ?? 'Equipment'} / Filigree slot ${String((source.filigreeSlotIndex ?? 0) + 1)}`
  }
  return `${source.itemName ?? 'Equipped item'} · ${source.slot ?? 'Equipment'}`
}

export const EquippedEnchantmentList = ({
  sources,
  conflicts,
  label,
  compact = false
}: {
  compact?: boolean
  sources: readonly GearPlannerEffectSource[]
  conflicts: GearPlannerEffectConflictResolution
  label: string
}) => {
  const listRef = useRef<HTMLUListElement | HTMLOListElement>(null)
  const scrollable = compact && sources.length > 5
  useEffect(() => {
    const list = listRef.current
    if (!list || !scrollable) return
    const rows = Array.from(list.children).slice(0, 5)
    const measure = () => {
      const height = rows[4].getBoundingClientRect().bottom - rows[0].getBoundingClientRect().top
      if (height > 0) list.style.setProperty('--five-enchantments', Math.ceil(height).toString() + 'px')
    }
    measure()
    const observer = new ResizeObserver(measure)
    rows.forEach((row) => {
      observer.observe(row)
    })
    return () => {
      observer.disconnect()
    }
  }, [scrollable, sources])
  return (
    <Stack gap={4} mt='xs'>
      <Text c='dimmed' size='xs' fw={600}>
        Enchantments{compact ? ` (${String(sources.length)})` : ''}
      </Text>
      <List
        ref={(element: HTMLUListElement | HTMLOListElement | null) => {
          listRef.current = element
        }}
        className={scrollable ? layout.scrollEnchantments : undefined}
        aria-label={label}
        size='sm'
        spacing={3}
        listStyleType='disc'
        style={{ overflowWrap: 'anywhere' }}
      >
        {sources.map((source) => {
          const resolution = conflicts.bySourceId[source.id]
          const lesser = resolution && !resolution.isEffective
          const effectiveState = resolution ? 'effective' : 'none'
          return (
            <List.Item
              key={source.id}
              c={lesser ? 'dimmed' : undefined}
              data-conflict-state={lesser ? 'lesser' : effectiveState}
              data-testid={`equipped-effect-${source.id}`}
            >
              <EquippedEffect id={source.id} conflicts={conflicts} label={sourceLabel(source)} />
            </List.Item>
          )
        })}
      </List>
    </Stack>
  )
}

const EnchantmentsTool = ({
  summary,
  candidates,
  minimumLevel,
  maximumLevel,
  onFind
}: {
  summary: readonly GearPlannerEffectSummary[]
  candidates: readonly GearPlannerCandidate[]
  minimumLevel: number
  maximumLevel: number
  onFind: (target: GearFindTarget) => void
}) => {
  const available = useMemo(() => {
    const types = new Map<string, Set<string>>()
    for (const { item, effects } of candidates) {
      if (item.minimumLevel < minimumLevel || item.minimumLevel > maximumLevel) continue
      for (const effect of effects) {
        const name = normalizeEffectName(effect.name)
        let bonuses = types.get(name)
        if (!bonuses) {
          bonuses = new Set()
          types.set(name, bonuses)
        }
        bonuses.add(normalizeBonusType(effect.bonus))
      }
    }
    return types
  }, [candidates, minimumLevel, maximumLevel])

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
          Totals summarize the effects in this loadout.
        </Text>
      </Stack>
      {summary.map((effect) => {
        const choices = available.get(effect.normalizedName)
        const missing = [...(choices ?? [])]
          .filter((type) => !effect.groups.some((group) => group.bonusType === type))
          .sort((left, right) => left.localeCompare(right))
        const search = (bonusType?: string) => {
          onFind({ kind: 'effect', name: effect.name, bonusType })
        }
        return (
          <Paper key={effect.normalizedName} withBorder p='sm'>
            <Stack gap='xs'>
              <Group justify='space-between' align='flex-start' gap='xs' wrap='nowrap'>
                <Text fw={700} size='sm' style={{ overflowWrap: 'anywhere' }}>
                  {effect.name}
                </Text>
                <Group gap={4} wrap='nowrap'>
                  {effect.isNumeric ? <Badge variant='light'>{statValue(effect, true).text}</Badge> : null}
                  {choices && (
                    <ActionIcon
                      variant='subtle'
                      size='sm'
                      aria-label={`Find gear with ${effect.name}`}
                      title={`Find gear with ${effect.name}`}
                      onClick={() => {
                        search()
                      }}
                    >
                      <IconSearch size={15} />
                    </ActionIcon>
                  )}
                </Group>
              </Group>
              {effect.groups.map((group) => (
                <Stack key={group.bonusType} gap={4}>
                  <Divider />
                  <Group justify='space-between' gap='xs'>
                    {choices?.has(group.bonusType) ? (
                      <Anchor
                        component='button'
                        type='button'
                        size='xs'
                        fw={600}
                        aria-label={`Find ${effect.name} with ${bonusTypeLabel(group.bonusType)} bonus`}
                        onClick={() => {
                          search(group.bonusType)
                        }}
                      >
                        {bonusTypeLabel(group.bonusType)}
                      </Anchor>
                    ) : (
                      <Text size='xs' fw={600}>
                        {bonusTypeLabel(group.bonusType)}
                      </Text>
                    )}
                    <Text size='xs' fw={600}>
                      {group.effectiveValue === 0
                        ? group.effectiveDisplay || 'Active'
                        : statValue({ ...effect, total: group.effectiveValue, groups: [group] }, true).text}
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
                        {sourceProvenance(entry)}
                      </Text>
                    ))}
                  </Stack>
                </Stack>
              ))}
              {missing.length > 0 && (
                <Stack gap={4}>
                  <Divider />
                  <Text size='xs' c='dimmed' fw={600}>
                    Missing bonus types
                  </Text>
                  <Group gap={4}>
                    {missing.map((type) => (
                      <Button
                        key={type}
                        size='compact-xs'
                        variant='light'
                        aria-label={`Find ${effect.name} with ${bonusTypeLabel(type)} bonus`}
                        onClick={() => {
                          search(type)
                        }}
                      >
                        {bonusTypeLabel(type)}
                      </Button>
                    ))}
                  </Group>
                </Stack>
              )}
            </Stack>
          </Paper>
        )
      })}
    </Stack>
  )
}

export default EnchantmentsTool
