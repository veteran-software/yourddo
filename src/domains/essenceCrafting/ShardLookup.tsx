import {
  Badge,
  Button,
  Group,
  Modal,
  Pagination,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  UnstyledButton
} from '@mantine/core'
import { IconArrowDown, IconArrowUp, IconArrowsSort, IconCheck, IconSearch } from '@tabler/icons-react'
import { useMemo, useRef, useState } from 'react'
import { formatResolvedEffectModifier, resolveEssenceEffects } from './enhancementEffects'
import { EQUIPMENT_SLOTS } from './equipment'
import type { EssenceBinding, EssenceCraftingData, EssenceEnhancement, EssenceRecipe } from './essenceCrafting.types'
import type { EssencePlanState } from './plannerState'
import { describeEquipmentBlockers, type EssencePlanAction, getEquipmentBlockers } from './plannerTransitions'
import styles from './ShardLookup.module.css'

interface ShardRow {
  id: string
  name: string
  minimumItemLevel: number
  enhancement?: EssenceEnhancement
  recipeIds: Readonly<Record<EssenceBinding, string>>
  searchText: string
}

const positions = [
  { value: 'prefix', label: 'Prefix' },
  { value: 'suffix', label: 'Suffix' },
  { value: 'extra', label: 'Extra' }
] as const

const columns = [
  { key: 'name', label: 'Shard' },
  { key: 'minimumItemLevel', label: 'Item level' },
  { key: 'craftingLevel', label: 'Crafting level' }
] as const

const initialFilters = { query: '', slot: null, position: null } as {
  query: string
  slot: string | null
  position: string | null
}
const pageSize = 15

type ApplyShardAction = Extract<EssencePlanAction, { type: 'apply-shard' }>

interface ShardLookupProps {
  data: EssenceCraftingData
  plan: EssencePlanState
  onAction: (action: Extract<EssencePlanAction, { type: 'apply-shard' | 'resolve-equipment-conflict' }>) => void
}

function ApplyShardDialog({
  data,
  plan,
  pending,
  onAction,
  onClose
}: ShardLookupProps & { pending: ApplyShardAction | null; onClose: () => void }) {
  const mark = data.rules.extraAffix.markRequirement
  const markName = data.indexes.ingredientById.get(mark.ingredientId)?.displayName ?? mark.ingredientId
  const targetSlot = EQUIPMENT_SLOTS.find(({ id }) => id === pending?.equipmentSlotId)
  const pendingShard = pending ? data.indexes.enhancementById.get(pending.enhancementId) : undefined
  const targetItem = targetSlot ? plan.itemsBySlotId[targetSlot.id] : undefined
  const currentId = pending ? targetItem?.[`${pending.position}EnhancementId`] : undefined
  const currentShard = currentId ? data.indexes.enhancementById.get(currentId) : undefined
  const alreadyApplied = Boolean(pendingShard && currentId === pendingShard.id)
  const itemLevel = targetItem?.minimumLevelOverride ?? plan.masterMinimumLevel
  const blockers = pending ? getEquipmentBlockers(plan, pending) : []
  const hasConflict = blockers.length > 0

  const shardName = <strong>{pendingShard?.displayName}</strong>
  const destination = (
    <>
      {pending?.position} on <strong>{targetSlot?.label}</strong>
    </>
  )
  let title = 'Apply effect?'
  let confirmLabel = 'Apply effect'
  let message = (
    <>
      Apply {shardName} as the {destination}?
    </>
  )
  if (currentShard) {
    title = 'Replace effect?'
    confirmLabel = 'Replace effect'
    message = (
      <>
        Replace <strong>{currentShard.displayName}</strong> with {shardName} as the {destination}?
      </>
    )
  }
  if (alreadyApplied) {
    title = 'Effect already applied'
    message = (
      <>
        {shardName} is already the {destination}.
      </>
    )
  }
  if (hasConflict) {
    title = 'Equipment conflict'
    confirmLabel = 'Unequip and apply'
  }

  return (
    <Modal opened={pending !== null} onClose={onClose} title={title} centered>
      {pending && pendingShard && targetSlot && (
        <Stack gap='sm'>
          {hasConflict && (
            <Text>
              Unequip <strong>{describeEquipmentBlockers(plan, blockers)}</strong> to continue. Unequipping removes the
              blocking item and its selections from this plan.
            </Text>
          )}
          <Text>{message}</Text>
          {!targetItem && (
            <Text size='sm' c='dimmed'>
              This adds the item to your plan.
            </Text>
          )}
          {pendingShard.minimumItemLevel > itemLevel && (
            <Text size='sm' c='dimmed'>
              This raises the item's minimum level from {itemLevel} to {pendingShard.minimumItemLevel}.
            </Text>
          )}
          {pending.position === 'extra' && !targetItem?.hasCannithMark && (
            <Text size='sm' c='dimmed'>
              This adds {mark.quantity} × {markName} to your ingredient requirements.
            </Text>
          )}
          <Group justify='flex-end'>
            <Button variant='default' onClick={onClose}>
              {alreadyApplied ? 'Done' : 'Cancel'}
            </Button>
            {!alreadyApplied && (
              <Button
                color={hasConflict ? 'red' : undefined}
                onClick={() => {
                  onAction(hasConflict ? { type: 'resolve-equipment-conflict', change: pending, blockers } : pending)
                  onClose()
                }}
              >
                {confirmLabel}
              </Button>
            )}
          </Group>
        </Stack>
      )}
    </Modal>
  )
}

function ShardRecipe({
  recipe,
  binding,
  ingredientName
}: {
  recipe?: EssenceRecipe
  binding: EssenceBinding
  ingredientName: (id: string) => string
}) {
  const emptyMessage = recipe ? 'No ingredients required.' : 'Recipe unavailable.'
  return (
    <Stack gap='xs' className={styles.detailSection}>
      <Title order={4} size='h6'>
        {binding === 'bound' ? 'Bound' : 'Unbound'} recipe
      </Title>
      {recipe?.requirements.length ? (
        <dl className={styles.values}>
          {recipe.requirements.map(({ ingredientId, quantity }) => (
            <div key={ingredientId}>
              <dt>{ingredientName(ingredientId)}</dt>
              <dd>×{quantity.toLocaleString()}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <Text size='sm' c='dimmed'>
          {emptyMessage}
        </Text>
      )}
    </Stack>
  )
}

const ShardLookup = ({ data, plan, onAction }: ShardLookupProps) => {
  const [filters, setFilters] = useState(initialFilters)
  const [binding, setBinding] = useState<EssenceBinding>('bound')
  const [sort, setSort] = useState<{ key: (typeof columns)[number]['key']; descending: boolean }>({
    key: 'name',
    descending: false
  })
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string>()
  const [previewLevel, setPreviewLevel] = useState(data.rules.supportedItemLevels.minimum)
  const [pending, setPending] = useState<ApplyShardAction | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const { rows, recipes, categoryNames, slotOptions } = useMemo(() => {
    const bonusNames = new Map(data.bonusTypes.map(({ id, displayName }) => [id, displayName]))
    const shardRows: ShardRow[] = data.enhancements.map((enhancement) => ({
      id: enhancement.id,
      name: enhancement.displayName,
      minimumItemLevel: enhancement.minimumItemLevel,
      enhancement,
      recipeIds: { bound: enhancement.recipes.boundRecipeId, unbound: enhancement.recipes.unboundRecipeId },
      searchText: [
        enhancement.displayName,
        ...enhancement.effects.flatMap(({ displayName, bonusTypeId }) => [
          displayName,
          bonusTypeId ? bonusNames.get(bonusTypeId) : undefined
        ])
      ]
        .join(' ')
        .toLocaleLowerCase()
    }))
    for (const { itemLevel, recipes: levelRecipes } of data.minimumLevelShards) {
      const level = String(itemLevel)
      shardRows.push({
        id: levelRecipes.boundRecipeId,
        name: `Minimum Level ${level} Shard`,
        minimumItemLevel: itemLevel,
        recipeIds: { bound: levelRecipes.boundRecipeId, unbound: levelRecipes.unboundRecipeId },
        searchText: `minimum level ${level} shard ml${level}`
      })
    }
    return {
      rows: shardRows,
      recipes: new Map(data.recipes.map((recipe) => [recipe.id, recipe])),
      categoryNames: new Map(data.itemCategories.map(({ id, displayName }) => [id, displayName])),
      slotOptions: data.itemCategories
        .map(({ id, displayName }) => ({ value: id, label: displayName }))
        .toSorted((a, b) => a.label.localeCompare(b.label))
    }
  }, [data])

  const matches = useMemo(() => {
    const { query, slot, position } = filters
    const tokens = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
    return rows
      .filter(
        ({ searchText, enhancement }) =>
          tokens.every((token) => searchText.includes(token)) &&
          ((!slot && !position) ||
            enhancement?.placements.some(
              (placement) =>
                (!slot || placement.itemCategoryIds.includes(slot)) && (!position || placement.position === position)
            ))
      )
      .sort((a, b) => {
        let comparison = a.name.localeCompare(b.name, undefined, { numeric: true })
        if (sort.key === 'minimumItemLevel') comparison = a.minimumItemLevel - b.minimumItemLevel || comparison
        if (sort.key === 'craftingLevel') {
          comparison =
            (recipes.get(a.recipeIds[binding])?.craftingLevel ?? 0) -
              (recipes.get(b.recipeIds[binding])?.craftingLevel ?? 0) || comparison
        }
        return sort.descending ? -comparison : comparison
      })
  }, [binding, filters, recipes, rows, sort])

  const visibleRows = matches.slice((page - 1) * pageSize, page * pageSize)
  const selected = visibleRows.find(({ id }) => id === selectedId) ?? visibleRows[0]
  const recipe = selected ? recipes.get(selected.recipeIds[binding]) : undefined
  const effectiveLevel = selected ? Math.max(selected.minimumItemLevel, previewLevel) : previewLevel
  const previewLevels = selected
    ? Array.from({ length: data.rules.supportedItemLevels.maximum - selected.minimumItemLevel + 1 }, (_, index) =>
        String(selected.minimumItemLevel + index)
      )
    : []
  const effects = selected?.enhancement ? resolveEssenceEffects(data, selected.enhancement.effects, effectiveLevel) : []
  const updateFilters = (next: Partial<typeof filters>) => {
    setFilters((current) => ({ ...current, ...next }))
    setPage(1)
  }
  const selectShard = (id: string) => {
    setSelectedId(id)
    const results = resultRef.current?.getBoundingClientRect()
    const details = detailRef.current?.getBoundingClientRect()
    if (results && details && details.top >= results.bottom) {
      detailRef.current?.focus({ preventScroll: true })
      detailRef.current?.scrollIntoView({ block: 'start' })
    }
  }
  const ingredientName = (id: string) => data.indexes.ingredientById.get(id)?.displayName ?? id
  const mark = data.rules.extraAffix.markRequirement

  return (
    <Stack gap='md' className={styles.lookup}>
      <Group justify='space-between' align='center'>
        <Stack gap={2}>
          <Title order={2} size='h3'>
            Master Shard Lookup
          </Title>
          <Text c='dimmed' size='sm'>
            Find compatible shards and compare effects and recipes.
          </Text>
        </Stack>
        <SegmentedControl
          aria-label='Shard recipe binding'
          size='xs'
          value={binding}
          onChange={(value) => {
            setBinding(value)
            setPage(1)
          }}
          data={[
            { label: 'Bound', value: 'bound' },
            { label: 'Unbound', value: 'unbound' }
          ]}
        />
      </Group>

      <Paper withBorder radius='md' p='sm' className={styles.filters}>
        <TextInput
          label='Shard or effect'
          placeholder='Search by name or effect'
          leftSection={<IconSearch size={16} aria-hidden />}
          value={filters.query}
          onChange={(event) => {
            updateFilters({ query: event.currentTarget.value })
          }}
        />
        <Select
          label='Equipment slot'
          placeholder='All slots'
          searchable
          clearable
          data={slotOptions}
          value={filters.slot}
          onChange={(slot) => {
            updateFilters({ slot })
          }}
        />
        <Select
          label='Affix position'
          placeholder='All positions'
          clearable
          data={[...positions]}
          value={filters.position}
          onChange={(position) => {
            updateFilters({ position })
          }}
        />
        <Button
          variant='subtle'
          disabled={!filters.query && !filters.slot && !filters.position}
          onClick={() => {
            updateFilters(initialFilters)
          }}
        >
          Clear filters
        </Button>
      </Paper>

      <div className={styles.grid}>
        <Paper withBorder radius='md' className={styles.results} ref={resultRef} tabIndex={-1}>
          <Group justify='space-between' px='md' py='sm'>
            <Title order={3} size='h5'>
              Shards
            </Title>
            <Text size='sm' c='dimmed' role='status'>
              {matches.length.toLocaleString()} of {rows.length.toLocaleString()} shards
            </Text>
          </Group>

          {matches.length ? (
            <>
              <Table.ScrollContainer minWidth={280} type='native'>
                <Table verticalSpacing='xs' fz='sm' aria-label='Shard results' className={styles.table}>
                  <Table.Thead>
                    <Table.Tr>
                      {columns.map(({ key, label }) => {
                        const active = sort.key === key
                        const direction = sort.descending ? 'descending' : 'ascending'
                        const DirectionIcon = sort.descending ? IconArrowDown : IconArrowUp
                        const Icon = active ? DirectionIcon : IconArrowsSort
                        return (
                          <Table.Th key={key} aria-sort={active ? direction : undefined}>
                            <UnstyledButton
                              className={styles.sort}
                              onClick={() => {
                                setSort({ key, descending: active && !sort.descending })
                                setPage(1)
                              }}
                            >
                              {label} <Icon size={14} aria-hidden />
                            </UnstyledButton>
                          </Table.Th>
                        )
                      })}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {visibleRows.map((row) => (
                      <Table.Tr key={row.id} data-selected={row.id === selected?.id || undefined}>
                        <Table.Td>
                          <UnstyledButton
                            className={styles.shard}
                            aria-pressed={row.id === selected?.id}
                            onClick={() => {
                              selectShard(row.id)
                            }}
                          >
                            <Text span inherit fw={600}>
                              {row.name}
                            </Text>
                            <Text span size='xs' c='dimmed' display='block'>
                              {row.enhancement?.effects.map(({ displayName }) => displayName).join(' · ') ??
                                'Minimum level shard'}
                            </Text>
                          </UnstyledButton>
                        </Table.Td>
                        <Table.Td>{row.minimumItemLevel}</Table.Td>
                        <Table.Td>{recipes.get(row.recipeIds[binding])?.craftingLevel ?? '—'}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
              {matches.length > pageSize && (
                <Group justify='center' p='sm' className={styles.pagination}>
                  <Pagination
                    aria-label='Shard results pages'
                    total={Math.ceil(matches.length / pageSize)}
                    value={page}
                    onChange={setPage}
                    size='sm'
                    siblings={0}
                  />
                </Group>
              )}
            </>
          ) : (
            <Stack gap={4} align='center' p='xl'>
              <Text fw={600}>No matching shards</Text>
              <Text c='dimmed' size='sm' ta='center'>
                Try a different effect or clear a slot or position filter.
              </Text>
            </Stack>
          )}
        </Paper>

        {selected && (
          <Paper
            component='section'
            withBorder
            radius='md'
            p='md'
            className={styles.detail}
            ref={detailRef}
            aria-label='Selected shard'
            tabIndex={-1}
          >
            <Stack gap='md'>
              <Stack gap='xs'>
                <Button
                  className={styles.back}
                  variant='subtle'
                  size='compact-xs'
                  onClick={() => {
                    resultRef.current?.focus()
                    resultRef.current?.scrollIntoView({ block: 'start' })
                  }}
                >
                  Back to results
                </Button>
                <Title order={3} size='h4'>
                  {selected.name}
                </Title>
                <Group gap='xs'>
                  <Badge variant='light'>
                    {selected.enhancement ? 'Item level' : 'Sets item level'} {selected.minimumItemLevel}
                    {selected.enhancement ? '+' : ''}
                  </Badge>
                  {recipe && <Badge variant='outline'>Crafting level {recipe.craftingLevel}</Badge>}
                </Group>
              </Stack>

              {selected.enhancement && (
                <>
                  <Stack gap='xs' className={styles.detailSection}>
                    <Group justify='space-between' align='flex-end' gap='xs'>
                      <Title order={4} size='h6'>
                        Effects
                      </Title>
                      <Select
                        label='Preview item level'
                        size='xs'
                        w={150}
                        data={previewLevels}
                        value={String(effectiveLevel)}
                        allowDeselect={false}
                        onChange={(value) => {
                          if (value !== null) setPreviewLevel(Number(value))
                        }}
                      />
                    </Group>
                    <dl className={styles.values}>
                      {effects.map(({ effect, modifier, bonusType }) => (
                        <div key={effect.id}>
                          <dt>
                            {effect.displayName}
                            {bonusType && (
                              <Text size='xs' c='dimmed'>
                                {bonusType.displayName}
                              </Text>
                            )}
                          </dt>
                          <dd>
                            {formatResolvedEffectModifier(modifier) ??
                              (modifier.status === 'no-match-for-item-level' ? 'No value at this level' : '—')}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </Stack>

                  <Stack gap='xs' className={styles.detailSection}>
                    <Title order={4} size='h6'>
                      Compatible slots
                    </Title>
                    <dl className={styles.values}>
                      {positions.map(({ value, label }) => {
                        const categories = new Set(
                          selected.enhancement?.placements
                            .filter(({ position }) => position === value)
                            .flatMap(({ itemCategoryIds }) => itemCategoryIds)
                        )
                        if (!categories.size) return null
                        const slots = EQUIPMENT_SLOTS.filter(({ itemCategoryIds }) =>
                          itemCategoryIds.some((id) => categories.has(id))
                        )
                        const mapped = new Set<string>(slots.flatMap(({ itemCategoryIds }) => itemCategoryIds))
                        const unmapped = [...categories].filter((category) => !mapped.has(category))
                        const enhancementId = selected.id
                        return (
                          <div key={value}>
                            <dt>{label}</dt>
                            <dd className={styles.slotButtons}>
                              {slots.map(({ id, label: slotLabel }) => {
                                const applied = plan.itemsBySlotId[id]?.[`${value}EnhancementId`] === enhancementId
                                return (
                                  <Button
                                    key={id}
                                    variant='light'
                                    size='compact-xs'
                                    aria-label={`${slotLabel} ${value}${applied ? ' (applied)' : ''}`}
                                    aria-haspopup='dialog'
                                    rightSection={applied ? <IconCheck size={12} aria-hidden /> : undefined}
                                    onClick={() => {
                                      setPending({
                                        type: 'apply-shard',
                                        equipmentSlotId: id,
                                        position: value,
                                        enhancementId
                                      })
                                    }}
                                  >
                                    {slotLabel}
                                  </Button>
                                )
                              })}
                              {unmapped.map((id) => (
                                <Text key={id} size='xs' c='dimmed'>
                                  {categoryNames.get(id) ?? id}
                                </Text>
                              ))}
                            </dd>
                          </div>
                        )
                      })}
                    </dl>
                    {selected.enhancement.placements.some(({ position }) => position === 'extra') && (
                      <Text size='xs' c='dimmed'>
                        Applying as an extra affix also uses {mark.quantity} × {ingredientName(mark.ingredientId)}.
                      </Text>
                    )}
                  </Stack>
                </>
              )}

              <ShardRecipe recipe={recipe} binding={binding} ingredientName={ingredientName} />
            </Stack>
          </Paper>
        )}
      </div>
      <ApplyShardDialog
        data={data}
        plan={plan}
        pending={pending}
        onAction={onAction}
        onClose={() => {
          setPending(null)
        }}
      />
    </Stack>
  )
}

export default ShardLookup
