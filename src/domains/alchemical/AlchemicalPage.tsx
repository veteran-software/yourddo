import {
  Alert,
  Badge,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Tabs,
  Text,
  Title
} from '@mantine/core'
import { IconChecklist, IconFlask, IconRestore, IconShare, IconSparkles } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import RecipeSelect from '../../shared/items/RecipeSelect'
import IngredientStock from '../../shared/items/IngredientStock'
import { createCraftingSelection } from '../../shared/layout/craftingSession'
import WorkspaceLayout, { type WorkspaceTool } from '../../shared/layout/WorkspaceLayout'
import WorkspaceHeader from '../../shared/layout/WorkspaceHeader'
import styles from '../../shared/layout/workspace.module.css'
import {
  alchemicalStages,
  resolveAlchemicalPlan,
  type AlchemicalCost,
  type AlchemicalData,
  type AlchemicalStage
} from './data'
import { AlchemicalReleaseUnavailable, loadAlchemicalData } from './loadAlchemicalData'
import SharingPanel from '../../shared/layout/SharingPanel'
import { escapeBbCode, escapeMarkdown } from '../../shared/serialization/forumText'
import {
  alchemicalPlanPath,
  linkedSelection,
  importAlchemicalPlan,
  exportAlchemicalPlan,
  type Selection
} from './sharing'
import { IngredientTool, BindingEffectsTool } from './AlchemicalTools'
import AlchemicalItemArt from './AlchemicalItemArt'

const labels: Record<AlchemicalStage, string> = {
  material: 'Material binding',
  tier1: 'Tier 1',
  tier2: 'Tier 2',
  tier3: 'Tier 3'
}
const useSelection = createCraftingSelection<Selection>(() => ({ family: 'original', baseId: null, recipes: {} }))
type LoadState = { status: 'loading' } | { status: 'error'; error: unknown } | { status: 'ready'; data: AlchemicalData }

function Costs({ costs, showStock = false }: { costs: AlchemicalCost[]; showStock?: boolean }) {
  return (
    <Stack gap='sm'>
      {costs.map((cost) => (
        <Stack key={cost.id} gap={2}>
          <Group wrap='nowrap' justify='space-between' align='baseline'>
            <Text fw={500} size='sm'>
              {cost.name}
            </Text>
            <Badge variant='light'>×{cost.quantity.toLocaleString()}</Badge>
          </Group>
          {showStock && <IngredientStock name={cost.name} required={cost.quantity} />}
        </Stack>
      ))}
    </Stack>
  )
}

function AlchemicalWorkspace({ data }: { data: AlchemicalData }) {
  const { search } = useLocation()
  const [selection, setSelection] = useSelection()
  const [appliedQuery, setAppliedQuery] = useState('')
  if (search !== appliedQuery) {
    setAppliedQuery(search)
    const linked = linkedSelection(data, search)
    if (linked) setSelection(linked)
  }
  const [checklist, setChecklist] = useState('materials')
  const bases = data.bases
    .filter((item) => item.family === selection.family)
    .sort((a, b) => a.name.localeCompare(b.name))
  const base = bases.find((item) => item.id === selection.baseId) ?? bases[0]
  const plan = base && resolveAlchemicalPlan(data, base, selection.recipes)
  function choose(stage: AlchemicalStage, id: string | null) {
    if (!base) return
    const candidate = { ...selection.recipes, [stage]: id ? Number(id) : undefined }
    const { selected } = resolveAlchemicalPlan(data, base, candidate)
    const recipes: Selection['recipes'] = {}
    for (const recipe of selected) recipes[recipe.stage] = recipe.id
    setSelection({ ...selection, recipes })
  }
  const ids = plan?.selected.map((recipe) => recipe.id) ?? []
  const permalink = base ? new URL(alchemicalPlanPath(base.id, ids), window.location.origin).href : ''
  function shareText(forum: boolean) {
    if (!plan || !base) return ''
    const escape = forum ? escapeBbCode : escapeMarkdown
    const title = escape(base.name) + ' · ML ' + String(plan.minimumLevel)
    return [
      forum ? '[b]' + title + '[/b]' : '**' + title + '**',
      ...plan.selected.map((r) => labels[r.stage] + ': ' + escape(r.name)),
      permalink
    ].join('\n')
  }
  const tools: WorkspaceTool[] = plan
    ? [
        {
          id: 'ingredients',
          label: 'Ingredient Checklist',
          icon: <IconChecklist size={20} />,
          content: <IngredientTool base={base} plan={plan} mode={checklist} onModeChange={setChecklist} />
        },
        {
          id: 'effects',
          label: 'Binding Effects',
          icon: <IconSparkles size={20} />,
          content: <BindingEffectsTool base={base} plan={plan} labels={labels} />
        },
        {
          id: 'sharing',
          label: 'Sharing',
          icon: <IconShare size={20} />,
          content: (
            <SharingPanel
              permalink={permalink}
              discord={shareText(false)}
              forum={shareText(true)}
              jsonExport={{ filename: 'alchemical-build.json', text: () => exportAlchemicalPlan(base.id, ids) }}
              jsonImport={{
                label: 'Paste Alchemical JSON',
                load: (text) => {
                  setSelection(importAlchemicalPlan(text, data))
                  return 'Alchemical build loaded.'
                }
              }}
            />
          )
        }
      ]
    : []
  return (
    <WorkspaceLayout tools={tools}>
      <Stack p={{ base: 'md', sm: 'lg' }} gap='lg' maw={1100} mx='auto'>
        <AlchemicalHeader />
        <Tabs defaultValue='workbench'>
          <Tabs.List mb='md'>
            <Tabs.Tab value='workbench'>Workbench</Tabs.Tab>
            <Tabs.Tab value='components'>Components</Tabs.Tab>
            <Tabs.Tab value='exchanges'>Exchanges</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='workbench'>
            <Stack gap='md'>
              <Paper component='section' withBorder className={styles.surface} p='md'>
                <Stack gap='md'>
                  <Group justify='space-between'>
                    <Title order={2} size='h3'>
                      Base item
                    </Title>
                    <SegmentedControl
                      aria-label='Crafting system'
                      value={selection.family}
                      data={[
                        { value: 'original', label: 'Original' },
                        { value: 'legendary', label: 'Legendary' }
                      ]}
                      onChange={(family) => {
                        setSelection({
                          family: family === 'legendary' ? 'legendary' : 'original',
                          baseId: null,
                          recipes: {}
                        })
                      }}
                    />
                  </Group>
                  <Select
                    label='Weapon or shield'
                    searchable
                    allowDeselect={false}
                    value={base ? String(base.id) : null}
                    data={bases.map((item) => ({ value: String(item.id), label: item.name }))}
                    nothingFoundMessage='No matching equipment'
                    onChange={(id) => {
                      setSelection({ ...selection, baseId: Number(id), recipes: {} })
                    }}
                  />
                  {base && (
                    <Group gap='xs'>
                      <AlchemicalItemArt layers={base.iconLayerIds} />
                      <Badge variant='outline'>Base ML {base.minimumLevel}</Badge>
                    </Group>
                  )}
                </Stack>
              </Paper>
              {plan && (
                <Paper component='section' withBorder className={styles.surface} p='md'>
                  <Stack gap='md'>
                    <Group justify='space-between'>
                      <Title order={2} size='h3'>
                        Binding progression
                      </Title>
                      {!!plan.selected.length && (
                        <Button
                          size='compact-sm'
                          variant='subtle'
                          leftSection={<IconRestore size={14} />}
                          onClick={() => {
                            setSelection({ ...selection, recipes: {} })
                          }}
                        >
                          Clear bindings
                        </Button>
                      )}
                    </Group>
                    {alchemicalStages.map((stage, index) => {
                      const options = plan.choices[stage]
                      const recipe = plan.selected.find((entry) => entry.stage === stage)
                      return (
                        <Stack key={stage} gap='xs'>
                          {index > 0 && <Divider />}
                          <RecipeSelect
                            ingredients={recipe?.costs}
                            label={labels[stage]}
                            searchable
                            clearable
                            disabled={!options.length}
                            placeholder={options.length ? 'Select a binding' : 'Choose the previous binding first'}
                            nothingFoundMessage='No matching bindings'
                            value={recipe ? String(recipe.id) : null}
                            data={options.map((entry) => ({ value: String(entry.id), label: entry.name }))}
                            onChange={(id) => {
                              choose(stage, id)
                            }}
                          />
                          {recipe && (
                            <Stack gap={5}>
                              <Group gap='sm'>
                                <Text size='sm' c='dimmed'>
                                  {recipe.device}
                                </Text>
                                {recipe.minimumLevel !== undefined && (
                                  <Badge variant='light' color='gray'>
                                    ML {recipe.minimumLevel}
                                  </Badge>
                                )}
                              </Group>
                              {!!recipe.discrepancies.length && (
                                <>
                                  <Divider />
                                  <Text size='xs' fw={700}>
                                    Discrepancies
                                  </Text>
                                  {recipe.discrepancies.map((note) => (
                                    <Text key={note} size='xs'>
                                      {note}
                                    </Text>
                                  ))}
                                </>
                              )}
                            </Stack>
                          )}
                        </Stack>
                      )
                    })}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value='components'>
            <RecipeLibrary data={data} exchanges={false} />
          </Tabs.Panel>
          <Tabs.Panel value='exchanges'>
            <RecipeLibrary data={data} exchanges />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </WorkspaceLayout>
  )
}

function AlchemicalHeader() {
  return (
    <WorkspaceHeader
      title='Alchemical Crafting'
      icon={IconFlask}
      description='Reforge a weapon or shield, preview its elemental bindings, and gather materials for each station.'
    />
  )
}

function RecipeLibrary({ data, exchanges }: { data: AlchemicalData; exchanges: boolean }) {
  const [id, setId] = useState<string | null>(null)
  const entries = exchanges ? data.exchanges : data.components
  const selected = entries.find((entry) => String(entry.id) === id)
  return (
    <Paper component='section' withBorder className={styles.surface} p='md'>
      <Stack gap='md'>
        <Title order={2} size='h3'>
          {exchanges ? 'Ingredient exchanges' : 'Component recipes'}
        </Title>
        <Select
          label={exchanges ? 'Ingredient to exchange' : 'Component to craft'}
          searchable
          clearable
          placeholder='Search recipes'
          nothingFoundMessage='No matching recipes'
          value={id}
          onChange={setId}
          data={entries.map((entry) => ({ value: String(entry.id), label: entry.name }))}
        />
        {selected && (
          <>
            <Group gap='xs'>
              <Badge variant='light'>{selected.device}</Badge>
              {'quantity' in selected && <Text size='sm'>Makes {selected.quantity.toLocaleString()}</Text>}
            </Group>
            <Title order={3} size='h4'>
              Ingredients
            </Title>
            <Costs costs={selected.costs} showStock />
            {'rewards' in selected && (
              <>
                <Divider />
                <Title order={3} size='h4'>
                  Possible rewards
                </Title>
                <Stack gap={4}>
                  {[...new Set(selected.rewards.map((reward) => reward.name + ' ×' + reward.quantity))].map((label) => (
                    <Text key={label} size='sm'>
                      {label}
                    </Text>
                  ))}
                </Stack>
              </>
            )}
          </>
        )}
      </Stack>
    </Paper>
  )
}

export default function AlchemicalPage() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    loadAlchemicalData()
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
  if (state.status === 'ready') return <AlchemicalWorkspace data={state.data} />
  return (
    <WorkspaceLayout>
      <Stack p={{ base: 'md', sm: 'lg' }} gap='lg' maw={1100} mx='auto'>
        <AlchemicalHeader />
        {state.status === 'loading' && (
          <Center mih={180}>
            <Group role='status'>
              <Loader size='sm' />
              <Text>Loading Alchemical recipes…</Text>
            </Group>
          </Center>
        )}
        {state.status === 'error' && (
          <Alert color='red' title='Alchemical crafting data is unavailable'>
            <Stack gap='sm' align='flex-start'>
              <Text size='sm'>
                {state.error instanceof AlchemicalReleaseUnavailable
                  ? 'This data release does not include Alchemical recipes. Reload to check for a newer release.'
                  : 'The published recipes could not be loaded.'}
              </Text>
              {import.meta.env.DEV && state.error instanceof Error && <Text size='xs'>{state.error.message}</Text>}
              <Button
                variant='light'
                onClick={() => {
                  if (state.error instanceof AlchemicalReleaseUnavailable) {
                    globalThis.location.reload()
                    return
                  }
                  setState({ status: 'loading' })
                  setAttempt((count) => count + 1)
                }}
              >
                {state.error instanceof AlchemicalReleaseUnavailable ? 'Reload page' : 'Retry'}
              </Button>
            </Stack>
          </Alert>
        )}
      </Stack>
    </WorkspaceLayout>
  )
}
