import {
  Alert,
  Badge,
  Button,
  Center,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { IconLink, IconRestore } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import RecipeSelect from '../../shared/items/RecipeSelect'
import IngredientStock from '../../shared/items/IngredientStock'
import { createCraftingSelection } from '../../shared/layout/craftingSession'
import ToolLayout from '../../shared/layout/ToolLayout'
import WorkspaceHeader from '../../shared/layout/WorkspaceHeader'
import styles from '../../shared/layout/workspace.module.css'
import type {
  SlaveLordsBase,
  SlaveLordsCategory,
  SlaveLordsCost,
  SlaveLordsData,
  SlaveLordsOption,
  SlaveLordsSet,
  SlaveLordsStat
} from './data'
import { loadSlaveLordsData, SlaveLordsReleaseUnavailable } from './loadSlaveLordsData'

const categories: Record<SlaveLordsCategory, string> = {
  prefix: 'Prefix',
  suffix: 'Suffix',
  extra: 'Extra',
  bonus: 'Bonus',
  set: 'Equipment set',
  augment: 'Augment slot',
  mythic: 'Mythic bonus'
}
const categoryOrder = Object.keys(categories) as SlaveLordsCategory[]
const slotNames: Record<string, string> = {
  Finger1: 'First Finger',
  Finger2: 'Second Finger',
  Weapon1: 'Main Hand',
  Weapon2: 'Off Hand',
  PetEquipment: 'Pet Equipment'
}
interface Plan {
  tier: SlaveLordsBase['tier']
  baseId: number | null
  equipSlot: string | null
  choices: Partial<Record<SlaveLordsCategory, number>>
}
const initialPlan = (): Plan => ({ tier: 'heroic', baseId: null, equipSlot: null, choices: {} })
const usePlan = createCraftingSelection(initialPlan)
type LoadState = { status: 'loading' } | { status: 'error'; error: unknown } | { status: 'ready'; data: SlaveLordsData }

function StatList({ stats }: { stats: SlaveLordsStat[] }) {
  return (
    <Stack gap={3}>
      {stats.map((effect, index) => (
        <Group
          key={JSON.stringify([effect.stat, effect.bonusType, index])}
          gap='xs'
          justify='space-between'
          align='baseline'
          wrap='nowrap'
        >
          <Text size='sm'>
            {effect.stat}
            {effect.bonusType && (
              <Text component='span' size='xs' c='dimmed'>
                {' '}
                · {effect.bonusType}
              </Text>
            )}
          </Text>
          <Text size='sm' fw={700} style={{ whiteSpace: 'nowrap' }}>
            {effect.formattedValue}
          </Text>
        </Group>
      ))}
    </Stack>
  )
}

function OptionDetails({
  option,
  equipSlot,
  set
}: {
  option: SlaveLordsOption
  equipSlot: string
  set?: SlaveLordsSet
}) {
  const stats = [
    ...option.effects,
    ...option.slotBonuses.filter((bonus) => bonus.equipSlots.includes(equipSlot)).flatMap((bonus) => bonus.effects)
  ]
  return (
    <Stack gap='xs'>
      {stats.length > 0 ? (
        <StatList stats={stats} />
      ) : (
        !set && option.description && <Text size='sm'>{option.description}</Text>
      )}
      {option.augmentTypes.length > 0 && (
        <Text size='sm' c='dimmed'>
          Fits {option.augmentTypes.join(', ')} augments
        </Text>
      )}
      {set?.thresholds.map((threshold) => (
        <Stack key={threshold.pieces} gap={4}>
          <Text size='xs' fw={700} c='dimmed'>
            {threshold.pieces}-piece bonus
          </Text>
          <StatList stats={threshold.effects} />
        </Stack>
      ))}
      {option.discrepancies.length > 0 && (
        <>
          <Divider />
          <Text fw={700} size='xs' c='dimmed'>
            Discrepancies
          </Text>
          {option.discrepancies.map((note) => (
            <Text key={note} size='xs'>
              {note}
            </Text>
          ))}
        </>
      )}
    </Stack>
  )
}

function IngredientList({ selected }: { selected: SlaveLordsOption[] }) {
  const totals = new Map<number, SlaveLordsCost>()
  for (const option of selected)
    for (const cost of option.costs) {
      const previous = totals.get(cost.id)
      totals.set(cost.id, { ...cost, quantity: (previous?.quantity ?? 0) + cost.quantity })
    }
  return (
    <Paper component='section' aria-label='Ingredient checklist' className={styles.surface} withBorder p='md'>
      <Stack gap='md'>
        <Title order={2} size='h3'>
          Ingredient checklist
        </Title>
        {!totals.size && (
          <Text size='sm' c='dimmed'>
            {selected.length
              ? 'No ingredient quantities are listed for these upgrades.'
              : 'Choose an upgrade to see what you need to collect.'}
          </Text>
        )}
        {[...totals.values()]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((cost) => (
            <Stack gap={3} key={cost.id}>
              <Group justify='space-between' align='baseline' wrap='nowrap' gap='xs'>
                <Text size='sm' fw={600}>
                  {cost.name}
                </Text>
                <Badge variant='light'>×{cost.quantity.toLocaleString()}</Badge>
              </Group>
              <IngredientStock name={cost.name} required={cost.quantity} />
              {cost.sources.length > 0 && (
                <Text size='xs' c='dimmed'>
                  {cost.sources.join(' · ')}
                </Text>
              )}
            </Stack>
          ))}
      </Stack>
    </Paper>
  )
}

function CraftingPlan({ data }: { data: SlaveLordsData }) {
  const [plan, setPlan] = usePlan()
  const bases = data.bases.filter((item) => item.tier === plan.tier).sort((a, b) => a.name.localeCompare(b.name))
  const base =
    bases.find((item) => item.id === plan.baseId) ?? bases.find((item) => item.kind === 'craftingBlank') ?? bases[0]
  const equipSlot = base?.equipSlots.find((slot) => slot === plan.equipSlot) ?? base?.equipSlots[0] ?? null
  const selected = base?.options.filter((option) => plan.choices[option.category] === option.id) ?? []
  return (
    <Grid gap='lg'>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Stack gap='md'>
          <Paper className={styles.surface} component='section' withBorder p='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={2} size='h3'>
                  Base item
                </Title>
                <SegmentedControl
                  aria-label='Crafting tier'
                  value={plan.tier}
                  data={[
                    { value: 'heroic', label: 'Heroic' },
                    { value: 'legendary', label: 'Legendary' }
                  ]}
                  onChange={(tier) => {
                    setPlan({ ...initialPlan(), tier: tier === 'legendary' ? 'legendary' : 'heroic' })
                  }}
                />
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Select
                  label='Item'
                  searchable
                  allowDeselect={false}
                  value={base ? String(base.id) : null}
                  data={['craftingBlank', 'setEquipment']
                    .map((kind) => ({
                      group: kind === 'craftingBlank' ? 'Crafting blanks' : 'Named equipment',
                      items: bases
                        .filter((item) => item.kind === kind)
                        .map((item) => ({ value: String(item.id), label: item.name }))
                    }))
                    .filter((group) => group.items.length)}
                  onChange={(id) => {
                    setPlan({ ...plan, baseId: Number(id), equipSlot: null, choices: {} })
                  }}
                />
                <Select
                  label='Equipment slot'
                  value={equipSlot}
                  allowDeselect={false}
                  disabled={(base?.equipSlots.length ?? 0) < 2}
                  data={(base?.equipSlots ?? []).map((slot) => ({ value: slot, label: slotNames[slot] ?? slot }))}
                  onChange={(slot) => {
                    setPlan({ ...plan, equipSlot: slot })
                  }}
                />
              </SimpleGrid>
              {base && (
                <Group gap='sm'>
                  <Badge variant='outline'>ML {base.minimumLevel}</Badge>
                  <Text size='sm' c='dimmed'>
                    {base.description}
                  </Text>
                </Group>
              )}
            </Stack>
          </Paper>
          {base ? (
            <Paper component='section' className={styles.surface} withBorder p='md'>
              <Stack gap='md'>
                <Group justify='space-between'>
                  <Title order={2} size='h3'>
                    Crafting slots
                  </Title>
                  {!!selected.length && (
                    <Button
                      variant='subtle'
                      size='compact-sm'
                      leftSection={<IconRestore size={14} />}
                      onClick={() => {
                        setPlan({ ...plan, choices: {} })
                      }}
                    >
                      Clear upgrades
                    </Button>
                  )}
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
                  {categoryOrder.map((category) => {
                    const options = base.options
                      .filter((option) => option.category === category)
                      .sort((a, b) => a.name.localeCompare(b.name))
                    if (!options.length) return null
                    const picked = selected.find((option) => option.category === category)
                    return (
                      <Stack key={category} gap='xs'>
                        <RecipeSelect
                          ingredients={picked?.costs}
                          searchable
                          clearable
                          label={categories[category]}
                          placeholder='Choose an upgrade'
                          nothingFoundMessage='No matching upgrades'
                          value={picked ? String(picked.id) : null}
                          data={options.map((option) => ({ value: String(option.id), label: option.name }))}
                          onChange={(id) => {
                            setPlan({ ...plan, choices: { ...plan.choices, [category]: id ? Number(id) : undefined } })
                          }}
                        />
                        {picked && (
                          <OptionDetails
                            option={picked}
                            equipSlot={equipSlot ?? ''}
                            set={data.sets.find((set) => set.id === picked.setId)}
                          />
                        )}
                      </Stack>
                    )
                  })}
                </SimpleGrid>
              </Stack>
            </Paper>
          ) : (
            <Alert>No base items are available for this tier.</Alert>
          )}
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <IngredientList selected={selected} />
      </Grid.Col>
    </Grid>
  )
}

export default function SlaveLordsPage() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    loadSlaveLordsData()
      .then((data) => {
        if (active) setState({ status: 'ready', data })
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', error })
      })
    return () => {
      active = false
    }
  }, [attempt])
  return (
    <ToolLayout>
      <WorkspaceHeader
        title='Slave Lords Crafting'
        icon={IconLink}
        description='Plan your item upgrades and track the ingredients for the workbench.'
      />
      {state.status === 'ready' && <CraftingPlan data={state.data} />}
      {state.status === 'loading' && (
        <Center mih={180}>
          <Group role='status'>
            <Loader size='sm' />
            <Text>Loading Slave Lords recipes…</Text>
          </Group>
        </Center>
      )}
      {state.status === 'error' && (
        <Alert color='red' title='Slave Lords crafting data is unavailable'>
          <Stack align='flex-start' gap='sm'>
            <Text size='sm'>
              {state.error instanceof SlaveLordsReleaseUnavailable
                ? 'The current data release does not include Slave Lords recipes. Reload to check for a newer release.'
                : 'The published crafting data could not be loaded.'}
            </Text>
            {import.meta.env.DEV && state.error instanceof Error && <Text size='xs'>{state.error.message}</Text>}
            <Button
              variant='light'
              onClick={() => {
                if (state.error instanceof SlaveLordsReleaseUnavailable) {
                  globalThis.location.reload()
                  return
                }
                setState({ status: 'loading' })
                setAttempt((value) => value + 1)
              }}
            >
              {state.error instanceof SlaveLordsReleaseUnavailable ? 'Reload page' : 'Retry'}
            </Button>
          </Stack>
        </Alert>
      )}
    </ToolLayout>
  )
}
