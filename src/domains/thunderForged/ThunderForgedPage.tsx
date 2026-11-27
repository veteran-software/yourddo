import { Alert, Badge, Button, Group, Loader, Paper, Select, Stack, Text, Title } from '@mantine/core'
import {
  IconHammer,
  IconChecklist,
  IconDiamond,
  IconLock,
  IconRestore,
  IconShare,
  IconSparkles
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import RecipeSelect from '../../shared/items/RecipeSelect'
import { createCraftingSelection } from '../../shared/layout/craftingSession'
import SharingPanel from '../../shared/layout/SharingPanel'
import WorkspaceHeader from '../../shared/layout/WorkspaceHeader'
import WorkspaceLayout, { type WorkspaceTool } from '../../shared/layout/WorkspaceLayout'
import workspace from '../../shared/layout/workspace.module.css'
import { escapeBbCode, escapeMarkdown } from '../../shared/serialization/forumText'
import {
  loadOptionalThunderData,
  resolveThunderPlan,
  thunderSelection,
  thunderStageLabels,
  type ThunderData,
  type ThunderSelection,
  type ThunderStage
} from './data'
import { exportThunderPlan, importThunderPlan, linkedThunderPlan, thunderPlanPath } from './sharing'
import { ThunderEffects, ThunderIngredients } from './ThunderForgedTools'
import styles from './thunderForged.module.css'

const usePlan = createCraftingSelection<{ baseId?: number; recipes: ThunderSelection }>(() => ({ recipes: {} }))
const title = 'Thunder-Forged Crafting'

function ForgeHeader() {
  return (
    <WorkspaceHeader
      title={title}
      icon={IconHammer}
      description='Plan a Thunder-Forged weapon or Flawless Shadowscale armor at the Magma Forge.'
    />
  )
}

function ThunderWorkspace({ data }: Readonly<{ data: ThunderData }>) {
  const { search } = useLocation()
  const [selection, setSelection] = usePlan()
  const [appliedSearch, setAppliedSearch] = useState('')
  const [linkError, setLinkError] = useState('')
  if (search !== appliedSearch) {
    setAppliedSearch(search)
    try {
      const linked = linkedThunderPlan(data, search)
      if (linked) setSelection(linked)
      setLinkError('')
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : 'This Thunder-Forged link is invalid.')
    }
  }
  const bases = [...data.bases.values()].sort((a, b) => a.source.name.localeCompare(b.source.name))
  const base =
    (selection.baseId === undefined ? undefined : data.bases.get(selection.baseId)) ??
    bases.find((entry) => entry.kind === 'weapon') ??
    bases[0]
  const plan = resolveThunderPlan(base, selection.recipes)
  const ids = plan.selected.map((recipe) => recipe.id)
  const permalink = new URL(thunderPlanPath(base.id, ids), window.location.origin).href
  const iconLayers = base.source.iconLayers
  function choose(stage: ThunderStage, id: string | null) {
    const next = resolveThunderPlan(base, { ...selection.recipes, [stage]: id ? Number(id) : undefined })
    setSelection({ baseId: base.id, recipes: thunderSelection(next.selected) })
  }
  function shareText(forum: boolean) {
    const escape = forum ? escapeBbCode : escapeMarkdown
    const heading = escape(base.source.name) + ' · ML ' + String(plan.minimumLevel)
    return [
      forum ? '[b]' + heading + '[/b]' : '**' + heading + '**',
      ...plan.selected.map((recipe) => thunderStageLabels[recipe.stage] + ' · ' + escape(recipe.name)),
      permalink
    ].join('\n')
  }
  const tools: WorkspaceTool[] = [
    {
      id: 'ingredients',
      label: 'Ingredient Checklist',
      icon: <IconChecklist size={20} />,
      content: <ThunderIngredients base={base} plan={plan} />
    },
    {
      id: 'effects',
      label: 'Crafted Effects',
      icon: <IconSparkles size={20} />,
      content: <ThunderEffects base={base} plan={plan} />
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
          jsonExport={{ filename: 'thunder-forged-build.json', text: () => exportThunderPlan(base.id, ids) }}
          jsonImport={{
            label: 'Paste Thunder-Forged JSON',
            load: (text) => {
              setSelection(importThunderPlan(text, data))
              return 'Thunder-Forged build loaded.'
            }
          }}
        />
      )
    }
  ]
  return (
    <WorkspaceLayout tools={tools}>
      <Stack p={{ base: 'md', sm: 'lg' }} gap='lg' maw={1120} mx='auto' className={styles.canvas}>
        <ForgeHeader />
        {linkError && (
          <Alert color='yellow' title='Unable to open the shared build'>
            {linkError}
          </Alert>
        )}
        <div className={styles.workbench}>
          <Paper component='section' withBorder className={workspace.surface + ' ' + styles.base} p='md'>
            <Stack gap='sm'>
              <Title order={2} size='h3'>
                Base item
              </Title>
              <Select
                aria-label='Base item'
                searchable
                allowDeselect={false}
                value={String(base.id)}
                data={[
                  {
                    group: 'Weapons and Orb',
                    items: bases
                      .filter((entry) => entry.kind === 'weapon')
                      .map((entry) => ({
                        value: String(entry.id),
                        label: entry.source.name
                      }))
                  },
                  {
                    group: 'Shadowscale armor',
                    items: bases
                      .filter((entry) => entry.kind === 'armor')
                      .map((entry) => ({
                        value: String(entry.id),
                        label: entry.source.name
                      }))
                  }
                ]}
                nothingFoundMessage='No matching items'
                onChange={(id) => {
                  if (id) setSelection({ baseId: Number(id), recipes: {} })
                }}
              />
            </Stack>
          </Paper>
          <Paper component='section' withBorder className={workspace.surface + ' ' + styles.upgrades} p='md'>
            <Stack gap='md'>
              <Group justify='space-between'>
                <Title order={2} size='h3'>
                  Forge upgrades
                </Title>
                {ids.length > 0 && (
                  <Button
                    size='compact-sm'
                    variant='subtle'
                    leftSection={<IconRestore size={14} />}
                    onClick={() => {
                      setSelection({ baseId: base.id, recipes: {} })
                    }}
                  >
                    Clear upgrades
                  </Button>
                )}
              </Group>
              {plan.stages.map((stage) => {
                const options = plan.choices[stage] ?? []
                const recipe = plan.selected.find((entry) => entry.stage === stage)
                const armorDescription =
                  recipe?.stage === 'flawlessArmor'
                    ? recipe.adds.flatMap(({ effects }) => effects).find((effect) => effect.notes)?.notes
                    : undefined
                return (
                  <Stack className={styles.stage} gap='xs' key={stage}>
                    <RecipeSelect
                      label={thunderStageLabels[stage]}
                      searchable
                      clearable
                      clearButtonProps={{ 'aria-label': 'Clear ' + thunderStageLabels[stage] }}
                      leftSection={!options.length ? <IconLock size={16} /> : undefined}
                      disabled={!options.length}
                      placeholder={options.length ? 'Choose an upgrade' : 'Choose the previous tier first'}
                      nothingFoundMessage='No matching upgrades'
                      value={recipe ? String(recipe.id) : null}
                      ingredients={recipe?.costs}
                      data={options.map(({ id, name }) => ({ value: String(id), label: name }))}
                      onChange={(id) => {
                        choose(stage, id)
                      }}
                    />
                    {recipe && (
                      <Text size='sm' c='dimmed'>
                        {recipe.notes.length ? recipe.notes.join(' ') : (armorDescription ?? recipe.description)}
                      </Text>
                    )}
                  </Stack>
                )
              })}
            </Stack>
          </Paper>
          <Paper component='section' withBorder p='md' className={styles.preview} aria-label='Item preview'>
            <Stack gap='md'>
              <Group gap='xs' c='dimmed'>
                <IconHammer size={16} aria-hidden />
                <Text size='xs' fw={600}>
                  {data.device}
                </Text>
              </Group>
              <Group wrap='nowrap' align='flex-start'>
                {iconLayers?.length ? (
                  <span className={styles.art} aria-hidden>
                    {iconLayers.map((src, order) => (
                      <img key={order} src={src} alt='' width={44} height={44} />
                    ))}
                  </span>
                ) : (
                  <IconHammer size={30} aria-hidden />
                )}
                <Stack gap={4}>
                  <Title order={2} size='h3'>
                    {base.source.name}
                  </Title>
                  <Text size='sm' c='dimmed'>
                    {base.source.type}
                    {base.source.material && ' · ' + base.source.material}
                  </Text>
                </Stack>
              </Group>
              <Group gap='xs'>
                <Badge color='orange' variant='light' aria-live='polite'>
                  ML {plan.minimumLevel}
                </Badge>
                {plan.selected.some((recipe) => recipe.binds) && (
                  <Badge variant='outline' color='gray' c='dimmed'>
                    Binds on upgrade
                  </Badge>
                )}
              </Group>
              <div className={styles.sockets}>
                <Title order={3} size='h5'>
                  Augment sockets
                </Title>
                <ul aria-label='Augment sockets'>
                  {plan.sockets.map((socket) => (
                    <li key={socket.augmentType} data-color={socket.augmentType}>
                      <IconDiamond size={16} aria-hidden />
                      <Text size='sm'>{socket.name}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            </Stack>
          </Paper>
        </div>
      </Stack>
    </WorkspaceLayout>
  )
}

type LoadState = { status: 'loading' | 'unavailable' | 'error' } | { status: 'ready'; data: ThunderData }

export default function ThunderForgedPage() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    void loadOptionalThunderData().then(
      (data) => {
        if (active) setState(data ? { status: 'ready', data } : { status: 'unavailable' })
      },
      () => {
        if (active) setState({ status: 'error' })
      }
    )
    return () => {
      active = false
    }
  }, [attempt])
  if (state.status === 'ready') return <ThunderWorkspace data={state.data} />
  return (
    <WorkspaceLayout>
      <Stack p={{ base: 'md', sm: 'lg' }} gap='lg' maw={1120} mx='auto'>
        <ForgeHeader />
        {state.status === 'loading' ? (
          <Group role='status'>
            <Loader size='sm' />
            <Text>Loading Magma Forge recipes…</Text>
          </Group>
        ) : (
          <Alert color='red' title='Thunder-Forged recipes are unavailable'>
            <Stack align='flex-start' gap='sm'>
              <Text size='sm'>
                {state.status === 'unavailable'
                  ? 'This data release does not include the Magma Forge catalog.'
                  : 'The Magma Forge catalog could not be loaded.'}
              </Text>
              <Button
                variant='light'
                onClick={() => {
                  if (state.status === 'unavailable') {
                    window.location.reload()
                    return
                  }
                  setState({ status: 'loading' })
                  setAttempt((count) => count + 1)
                }}
              >
                {state.status === 'unavailable' ? 'Reload page' : 'Retry'}
              </Button>
            </Stack>
          </Alert>
        )}
      </Stack>
    </WorkspaceLayout>
  )
}
