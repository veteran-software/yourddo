import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Center,
  Drawer,
  Group,
  Loader,
  Modal,
  Notification,
  NumberInput,
  Paper,
  rem,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
  UnstyledButton
} from '@mantine/core'
import {
  IconAlertTriangle,
  IconCheck,
  IconDownload,
  IconFileImport,
  IconLayersLinked,
  IconListDetails,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX
} from '@tabler/icons-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import ItemIcon from '../../shared/items/ItemIcon.tsx'
import type { WorkspaceTool } from '../../shared/layout/WorkspaceLayout.tsx'
import WorkspaceLayout from '../../shared/layout/WorkspaceLayout.tsx'
import { downloadTextFile, readTextFile } from '../../shared/serialization/browser.ts'
import AugmentSlotSelector from './components/AugmentSlotSelector.tsx'
import CurseSelector from './components/CurseSelector.tsx'
import FiligreeSlotSelector from './components/FiligreeSlotSelector.tsx'
import { canApplyGearPlannerCurse } from './curses.ts'
import { InvalidGearPlannerDataError, loadGearPlannerData } from './data.ts'
import {
  aggregateEffectSummary,
  collectEquippedEffects,
  conflictEligibleEffectSources,
  type GearPlannerEffectConflictResolution,
  type GearPlannerEffectSource,
  resolveEffectConflicts
} from './effects.ts'
import { supportsGearPlannerFiligrees } from './filigrees.ts'
import { type GearPlannerData, type GearPlannerItem, gearPlannerSlotGridColumns } from './gearPlanner.types.ts'
import {
  filterGearPlannerCandidates,
  type GearPlannerCharacterSlot,
  type GearPlannerEquipment,
  gearPlannerItemType,
  type GearPlannerSlottedFiligrees,
  type GearPlannerUnlockedFiligreeSlots,
  hasOtherGearPlannerMinorArtifact,
  prepareGearPlannerCandidates
} from './planner.ts'
import {
  createGearPlannerExport,
  GEAR_PLANNER_EXPORT_FILENAME,
  type GearPlannerRestoreIssue,
  importGearPlannerState,
  loadGearPlannerState,
  saveGearPlannerState
} from './plannerStorage.ts'
import { collectActiveSetEffectSources, resolveGearPlannerSetState } from './sets.ts'
import {
  activeGearPlannerSetup,
  addGearPlannerSetup,
  clearGearPlannerSetup,
  createDefaultGearPlannerState,
  createGearPlannerSetupId,
  deleteGearPlannerSetup,
  equipGearPlannerSetupItem,
  type GearPlannerSetupsState,
  renameGearPlannerSetup,
  selectGearPlannerSetup,
  setGearPlannerSetupAugment,
  setGearPlannerSetupCurse,
  setGearPlannerSetupFiligree,
  setGearPlannerSetupUnlockedFiligreeSlots,
  updateGearPlannerSetupLevels
} from './setups.ts'
import EnchantmentsTool, { EquippedEnchantmentList } from './tools/EnchantmentsTool.tsx'
import SetBonusesTool from './tools/SetBonusesTool.tsx'

type DataState =
  { status: 'loading' } | { status: 'ready'; data: GearPlannerData } | { status: 'error'; cause: unknown }

const pageSize = 50

const characterSlotLayout = [
  'Eyes',
  'Head',
  'Neck',
  'Trinket',
  'Armor',
  'Cloak',
  'Wrists',
  'Waist',
  'First Finger',
  'Feet',
  'Hands',
  'Second Finger',
  'Main Hand',
  'Off Hand',
  'Quiver'
] as const satisfies readonly GearPlannerCharacterSlot[]

const itemMetadata = (item: GearPlannerItem) => `ML ${String(item.minimumLevel)} · ${gearPlannerItemType(item)}`

interface EquipmentSlotCardProps {
  slot: GearPlannerCharacterSlot
  item: GearPlannerItem | null
  data: GearPlannerData
  effects: readonly GearPlannerEffectSource[]
  conflictSources: readonly GearPlannerEffectSource[]
  conflicts: GearPlannerEffectConflictResolution
  slottedAugments: import('./planner.ts').GearPlannerSlottedAugments
  slottedCurses: import('./planner.ts').GearPlannerSlottedCurses
  slottedFiligrees: GearPlannerSlottedFiligrees
  unlockedFiligreeSlots: GearPlannerUnlockedFiligreeSlots
  openBrowser: (slot: GearPlannerCharacterSlot) => void
  clearSlot: (slot: GearPlannerCharacterSlot) => void
  setAugment: (itemId: string, slotIndex: number, augment: GearPlannerData['augments'][number] | null) => void
  setCurse: (itemId: string, curseId: string | null) => void
  setFiligree: (itemId: string, slotIndex: number, filigree: GearPlannerData['filigrees'][number] | null) => void
  setUnlockedFiligreeSlots: (itemId: string, count: number) => void
}

const EquipmentSlotCard = ({
  slot,
  item,
  data,
  effects,
  conflictSources,
  conflicts,
  slottedAugments,
  slottedCurses,
  slottedFiligrees,
  unlockedFiligreeSlots,
  openBrowser,
  clearSlot,
  setAugment,
  setCurse,
  setFiligree,
  setUnlockedFiligreeSlots
}: EquipmentSlotCardProps) => (
  <Paper withBorder p='sm' mih={132} style={{ position: 'relative' }} data-testid={`gear-slot-${slot}`}>
    <Stack gap='xs' h='100%'>
      <Group justify='space-between' gap='xs' wrap='nowrap'>
        <Text fw={700} size='sm'>
          {slot}
        </Text>
        {item ? (
          <Tooltip label={`Clear ${slot}`}>
            <ActionIcon
              variant='subtle'
              color='red'
              aria-label={`Clear ${slot} from equipment`}
              onClick={() => {
                clearSlot(slot)
              }}
            >
              <IconX size={16} />
            </ActionIcon>
          </Tooltip>
        ) : null}
      </Group>
      <UnstyledButton
        type='button'
        aria-label={`Select ${slot}`}
        onClick={() => {
          openBrowser(slot)
        }}
        style={{ flex: 1, minWidth: 0, textAlign: 'left' }}
      >
        {item ? (
          <Group wrap='nowrap' align='flex-start'>
            <ItemIcon item={item.source} size={36} alt='' />
            <Stack gap={2} miw={0}>
              <Text fw={600} size='sm' lineClamp={2}>
                {item.source.name}
              </Text>
              <Text c='dimmed' size='xs'>
                {itemMetadata(item)}
              </Text>
              <EquippedEnchantmentList sources={effects} conflicts={conflicts} />
            </Stack>
          </Group>
        ) : (
          <Text c='dimmed' size='sm'>
            Select an item
          </Text>
        )}
      </UnstyledButton>
      {item?.source.augments?.map((augmentSlot, slotIndex) => (
        <AugmentSlotSelector
          key={`${item.id}-${String(slotIndex)}`}
          item={item}
          slotIndex={slotIndex}
          augmentSlot={augmentSlot}
          augments={data.augments}
          selected={slottedAugments[item.id]?.[slotIndex] ?? null}
          onChange={(augment) => {
            setAugment(item.id, slotIndex, augment)
          }}
        />
      ))}
      {item && canApplyGearPlannerCurse(item) ? (
        <CurseSelector
          item={item}
          curses={data.curses}
          selected={slottedCurses[item.id] ?? null}
          conflictSources={conflictSources}
          onChange={(curseId) => {
            setCurse(item.id, curseId)
          }}
        />
      ) : null}
      {item && supportsGearPlannerFiligrees(item) ? (
        <FiligreeSlotSelector
          item={item}
          filigrees={data.filigrees}
          slottedFiligrees={slottedFiligrees}
          unlockedFiligreeSlots={unlockedFiligreeSlots}
          onChange={(slotIndex, filigree) => {
            setFiligree(item.id, slotIndex, filigree)
          }}
          onUnlockedSlotCountChange={(count) => {
            setUnlockedFiligreeSlots(item.id, count)
          }}
        />
      ) : null}
    </Stack>
  </Paper>
)

interface ItemBrowserProps {
  slot: GearPlannerCharacterSlot | null
  data: GearPlannerData
  equipment: GearPlannerEquipment
  minimumLevel: number
  maximumLevel: number
  close: () => void
  equip: (slot: GearPlannerCharacterSlot, item: GearPlannerItem | null) => void
  onMinorArtifactRejected: () => void
  updateLevels: (update: { minimumLevel?: number; maximumLevel?: number }) => void
}

const ItemBrowser = ({
  slot,
  data,
  equipment,
  minimumLevel,
  maximumLevel,
  close,
  equip,
  onMinorArtifactRejected,
  updateLevels
}: ItemBrowserProps) => {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string | null>(null)
  const [setName, setSetName] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const candidates = useMemo(
    () => (slot ? prepareGearPlannerCandidates(data.itemsBySlot[slot]) : []),
    [data.itemsBySlot, slot]
  )
  const types = useMemo(
    () => [...new Set(candidates.map((candidate) => candidate.type))].sort((a, b) => a.localeCompare(b)),
    [candidates]
  )
  const sets = useMemo(
    () => [...new Set(candidates.flatMap((candidate) => candidate.sets))].sort((a, b) => a.localeCompare(b)),
    [candidates]
  )
  const filtered = useMemo(
    () =>
      filterGearPlannerCandidates(candidates, {
        search,
        minimumLevel,
        maximumLevel,
        type,
        setName
      }),
    [candidates, maximumLevel, minimumLevel, search, setName, type]
  )

  useEffect(() => {
    setSearch('')
    setType(null)
    setSetName(null)
    setVisibleCount(pageSize)
  }, [slot])

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [search, minimumLevel, maximumLevel, type, setName])

  const select = (item: GearPlannerItem | null) => {
    if (!slot || (item && item.slot !== slot)) return
    if (item && hasOtherGearPlannerMinorArtifact(equipment, slot, item)) {
      onMinorArtifactRejected()
      return
    }
    equip(slot, item)
    close()
  }

  return (
    <Drawer
      opened={slot !== null}
      onClose={close}
      position='right'
      size='lg'
      title={slot ? `Select item for ${slot}` : 'Select item'}
      closeButtonProps={{ 'aria-label': 'Close item browser' }}
    >
      {slot ? (
        <Stack gap='md'>
          <TextInput
            label='Search items'
            placeholder='Name or effect'
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value)
            }}
          />
          <SimpleGrid cols={{ base: 1, xs: 2 }}>
            <NumberInput
              label='Minimum level'
              min={1}
              value={minimumLevel}
              onChange={(value) => {
                updateLevels({ minimumLevel: typeof value === 'number' ? value : 1 })
              }}
            />
            <NumberInput
              label='Maximum level'
              min={1}
              value={maximumLevel}
              onChange={(value) => {
                updateLevels({ maximumLevel: typeof value === 'number' ? value : 36 })
              }}
            />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, xs: 2 }}>
            {types.length > 1 ? (
              <Select
                label='Item type'
                placeholder='All types'
                clearable
                data={types}
                value={type}
                onChange={setType}
              />
            ) : null}
            <Select
              label='Item set'
              placeholder='All sets'
              clearable
              data={sets}
              value={setName}
              onChange={setSetName}
            />
          </SimpleGrid>
          {equipment[slot] ? (
            <Button
              color='red'
              variant='light'
              onClick={() => {
                select(null)
              }}
            >
              Clear {slot}
            </Button>
          ) : null}
          <Text aria-live='polite' c='dimmed' size='sm'>
            {filtered.length === 1 ? '1 item' : `${String(filtered.length)} items`}
          </Text>
          {filtered.slice(0, visibleCount).map(({ item, sets: itemSets }) => (
            <Paper key={item.id} withBorder p='sm'>
              <Group align='flex-start' wrap='nowrap'>
                <ItemIcon item={item.source} size={40} alt='' />
                <Stack gap={4} flex={1} miw={0}>
                  <Text fw={600} size='sm'>
                    {item.source.name}
                  </Text>
                  <Text c='dimmed' size='xs'>
                    {itemMetadata(item)}
                  </Text>
                  {itemSets.length > 0 ? <Badge variant='light'>{itemSets[0]}</Badge> : null}
                </Stack>
                <Button
                  size='xs'
                  variant='light'
                  aria-label={`Equip ${item.source.name}`}
                  onClick={() => {
                    select(item)
                  }}
                >
                  Equip
                </Button>
              </Group>
            </Paper>
          ))}
          {filtered.length === 0 ? <Text c='dimmed'>No items match these filters.</Text> : null}
          {visibleCount < filtered.length ? (
            <Button
              variant='subtle'
              onClick={() => {
                setVisibleCount((current) => current + pageSize)
              }}
            >
              Show {String(Math.min(pageSize, filtered.length - visibleCount))} more
            </Button>
          ) : null}
        </Stack>
      ) : null}
    </Drawer>
  )
}

const GearPlannerPage = () => {
  const [dataState, setDataState] = useState<DataState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [plannerState, setPlannerState] = useState(createDefaultGearPlannerState)
  const [browsingSlot, setBrowsingSlot] = useState<GearPlannerCharacterSlot | null>(null)
  const [persistenceEnabled, setPersistenceEnabled] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const activeSetup = activeGearPlannerSetup(plannerState)
  const { equipment, slottedAugments, slottedCurses, slottedFiligrees, unlockedFiligreeSlots } = activeSetup
  const filigreeDefinitions = dataState.status === 'ready' ? dataState.data.filigreeSetDefinitionByName : undefined
  const baseEffects = useMemo(
    () => collectEquippedEffects(equipment, slottedAugments, slottedFiligrees, slottedCurses),
    [equipment, slottedAugments, slottedCurses, slottedFiligrees]
  )
  const setState = useMemo(
    () => resolveGearPlannerSetState(equipment, slottedAugments, undefined, slottedFiligrees, filigreeDefinitions),
    [equipment, filigreeDefinitions, slottedAugments, slottedFiligrees]
  )
  const effects = useMemo(() => [...baseEffects, ...collectActiveSetEffectSources(setState)], [baseEffects, setState])
  const conflictSources = useMemo(() => conflictEligibleEffectSources(baseEffects), [baseEffects])
  const conflicts = useMemo(() => resolveEffectConflicts(conflictSources), [conflictSources])
  const summary = useMemo(() => aggregateEffectSummary(effects), [effects])
  const tools = useMemo<readonly WorkspaceTool[]>(
    () => [
      {
        id: 'enchantments',
        label: 'Enchantments',
        icon: <IconListDetails stroke={2} />,
        content: <EnchantmentsTool summary={summary} />
      },
      {
        id: 'set-bonuses',
        label: 'Set Bonuses',
        icon: <IconLayersLinked stroke={2} />,
        content: <SetBonusesTool setState={setState} />
      }
    ],
    [setState, summary]
  )

  useEffect(() => {
    if (import.meta.env.DEV && setState.unresolvedDefinitionNames.length > 0) {
      console.warn(
        `Gear Planner set memberships without standard definitions: ${setState.unresolvedDefinitionNames.join(', ')}`
      )
    }
  }, [setState.unresolvedDefinitionNames])

  useEffect(() => {
    let active = true
    loadGearPlannerData()
      .then((data) => {
        if (!active) return
        const restored = loadGearPlannerState(data)
        if (import.meta.env.DEV && restored.issues.length > 0) {
          console.warn('Gear Planner persistence restore issues:', restored.issues)
        }
        setPlannerState(restored.state)
        setPersistenceEnabled(restored.source !== 'invalid')
        setDataState({ status: 'ready', data })
      })
      .catch((cause: unknown) => {
        if (active) setDataState({ status: 'error', cause })
      })
    return () => {
      active = false
    }
  }, [attempt])

  useEffect(() => {
    if (dataState.status === 'ready' && persistenceEnabled) saveGearPlannerState(plannerState)
  }, [dataState.status, persistenceEnabled, plannerState])

  useEffect(() => {
    setRenameOpen(false)
    setRenameValue(activeSetup.name)
  }, [activeSetup.id, activeSetup.name])

  const retry = () => {
    setDataState({ status: 'loading' })
    setAttempt((current) => current + 1)
  }

  const equip = (slot: GearPlannerCharacterSlot, item: GearPlannerItem | null) => {
    setPlannerState((current) => equipGearPlannerSetupItem(current, slot, item))
    setPersistenceEnabled(true)
  }

  const applySetupState = (transition: (state: GearPlannerSetupsState) => GearPlannerSetupsState) => {
    setPlannerState((current) => transition(current))
    setPersistenceEnabled(true)
  }

  const logRestoreIssues = (issues: readonly GearPlannerRestoreIssue[]) => {
    if (import.meta.env.DEV && issues.length > 0) console.warn('Gear Planner import restore issues:', issues)
  }

  const importState = async (file: File) => {
    if (dataState.status !== 'ready') return
    try {
      const restored = importGearPlannerState(await readTextFile(file), dataState.data)
      setPlannerState(restored.state)
      setPersistenceEnabled(true)
      logRestoreIssues(restored.issues)
      setFeedback({
        kind: 'success',
        message:
          restored.issues.length === 0
            ? `Imported ${String(restored.state.setups.length)} setup(s).`
            : `Imported ${String(restored.state.setups.length)} setup(s); ${String(restored.issues.length)} stale selection(s) skipped.`
      })
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Import failed. Try another file.'
      })
    }
  }

  return (
    <WorkspaceLayout tools={tools}>
      <Stack gap='xs' p={{ base: 'md', sm: 'lg' }} maw={rem(1500)} mx='auto'>
        <Stack gap={3}>
          <Title order={1}>Gear Planner</Title>
          <Text c='dimmed'>Prepare equipment plans with Compendium-backed item data.</Text>
        </Stack>

        {dataState.status === 'loading' ? (
          <Center mih={160} role='status' aria-live='polite'>
            <Stack align='center' gap='xs'>
              <Loader size='sm' />
              <Text c='dimmed' size='sm'>
                Loading Gear Planner data…
              </Text>
            </Stack>
          </Center>
        ) : null}

        {dataState.status === 'error' ? (
          <Alert
            color='red'
            title={
              dataState.cause instanceof InvalidGearPlannerDataError
                ? 'Gear Planner data is invalid'
                : 'Gear Planner data is unavailable'
            }
          >
            <Stack gap='sm' align='flex-start'>
              <Text size='sm'>Gear Planner data could not be loaded. Try again.</Text>
              {import.meta.env.DEV && dataState.cause instanceof Error ? (
                <Text component='code' size='xs' style={{ overflowWrap: 'anywhere' }}>
                  {dataState.cause.message}
                </Text>
              ) : null}
              <Button size='sm' variant='light' onClick={retry}>
                Retry
              </Button>
            </Stack>
          </Alert>
        ) : null}

        {dataState.status === 'ready' ? (
          <Paper component='section' aria-label='Gear Planner workspace' withBorder p={{ base: 'md', sm: 'lg' }}>
            <Stack gap='md'>
              <Tabs
                value={activeSetup.id}
                onChange={(id) => {
                  if (id) applySetupState((current) => selectGearPlannerSetup(current, id))
                }}
              >
                <Tabs.List>
                  {plannerState.setups.map((setup) => (
                    <Tabs.Tab key={setup.id} value={setup.id}>
                      {setup.name}
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs>
              <Group justify='space-between' gap='xs' align='flex-start'>
                <Group gap='xs'>
                  <Tooltip label='Add setup'>
                    <ActionIcon
                      aria-label='Add setup'
                      variant='light'
                      onClick={() => {
                        applySetupState((current) => addGearPlannerSetup(current, createGearPlannerSetupId()))
                      }}
                    >
                      <IconPlus size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label='Rename active setup'>
                    <ActionIcon
                      aria-label='Rename active setup'
                      variant='light'
                      onClick={() => {
                        setRenameValue(activeSetup.name)
                        setRenameOpen(true)
                      }}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label='Clear active setup'>
                    <ActionIcon
                      aria-label='Clear active setup'
                      color='orange'
                      variant='light'
                      onClick={() => {
                        applySetupState((current) => clearGearPlannerSetup(current, activeSetup.id))
                        setFeedback({ kind: 'success', message: `${activeSetup.name} cleared.` })
                      }}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label='Delete active setup'>
                    <ActionIcon
                      aria-label='Delete active setup'
                      color='red'
                      variant='light'
                      disabled={plannerState.setups.length <= 1}
                      onClick={() => {
                        setDeleteOpen(true)
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Group gap='xs'>
                  <Button
                    size='xs'
                    leftSection={<IconDownload size={15} />}
                    onClick={() => {
                      downloadTextFile(
                        JSON.stringify(createGearPlannerExport(plannerState), null, 2),
                        GEAR_PLANNER_EXPORT_FILENAME
                      )
                      setFeedback({ kind: 'success', message: 'JSON export downloaded.' })
                    }}
                  >
                    Export JSON
                  </Button>
                  <Button
                    size='xs'
                    leftSection={<IconFileImport size={15} />}
                    variant='light'
                    onClick={() => {
                      importInputRef.current?.click()
                    }}
                  >
                    Import JSON
                  </Button>
                  <input
                    ref={importInputRef}
                    type='file'
                    accept='application/json,.json'
                    hidden
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0]
                      event.currentTarget.value = ''
                      if (file) void importState(file)
                    }}
                  />
                </Group>
              </Group>
              {renameOpen ? (
                <Group gap='xs' wrap='nowrap'>
                  <TextInput
                    aria-label='Setup name'
                    value={renameValue}
                    onChange={(event) => {
                      setRenameValue(event.currentTarget.value)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        if (!renameValue.trim()) {
                          setFeedback({ kind: 'error', message: 'Setup name cannot be blank.' })
                          return
                        }
                        applySetupState((current) => renameGearPlannerSetup(current, activeSetup.id, renameValue))
                        setRenameOpen(false)
                      }
                    }}
                    flex={1}
                  />
                  <Button
                    size='xs'
                    onClick={() => {
                      if (!renameValue.trim()) {
                        setFeedback({ kind: 'error', message: 'Setup name cannot be blank.' })
                        return
                      }
                      applySetupState((current) => renameGearPlannerSetup(current, activeSetup.id, renameValue))
                      setRenameOpen(false)
                    }}
                  >
                    Save name
                  </Button>
                  <Button
                    size='xs'
                    variant='subtle'
                    onClick={() => {
                      setRenameOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                </Group>
              ) : null}
              {feedback?.kind === 'success' ? (
                <Notification icon={<IconCheck size={16} />} color='green' withCloseButton={false} role='status'>
                  <Text size='sm'>{feedback.message}</Text>
                </Notification>
              ) : null}
              {feedback?.kind === 'error' ? (
                <Notification icon={<IconAlertTriangle size={16} />} color='red' withCloseButton={false} role='alert'>
                  <Text size='sm'>{feedback.message}</Text>
                </Notification>
              ) : null}
              <Text c='dimmed' size='sm'>
                Select any slot to browse compatible equipment.
              </Text>
              <SimpleGrid cols={gearPlannerSlotGridColumns} spacing='md'>
                {characterSlotLayout.map((slot) => (
                  <EquipmentSlotCard
                    key={slot}
                    slot={slot}
                    item={equipment[slot]}
                    data={dataState.data}
                    effects={effects.filter((effect) => effect.slot === slot && effect.category === 'equipped-item')}
                    conflictSources={conflictSources}
                    conflicts={conflicts}
                    slottedAugments={slottedAugments}
                    slottedCurses={slottedCurses}
                    slottedFiligrees={slottedFiligrees}
                    unlockedFiligreeSlots={unlockedFiligreeSlots}
                    openBrowser={setBrowsingSlot}
                    clearSlot={(currentSlot) => {
                      equip(currentSlot, null)
                    }}
                    setAugment={(itemId, slotIndex, augment) => {
                      applySetupState((current) => setGearPlannerSetupAugment(current, itemId, slotIndex, augment))
                    }}
                    setCurse={(itemId, curseId) => {
                      applySetupState((current) =>
                        setGearPlannerSetupCurse(current, itemId, curseId, dataState.data.curses)
                      )
                    }}
                    setFiligree={(itemId, slotIndex, filigree) => {
                      applySetupState((current) => setGearPlannerSetupFiligree(current, itemId, slotIndex, filigree))
                    }}
                    setUnlockedFiligreeSlots={(itemId, count) => {
                      applySetupState((current) => setGearPlannerSetupUnlockedFiligreeSlots(current, itemId, count))
                    }}
                  />
                ))}
              </SimpleGrid>
            </Stack>
            <ItemBrowser
              slot={browsingSlot}
              data={dataState.data}
              equipment={equipment}
              minimumLevel={activeSetup.minimumLevel}
              maximumLevel={activeSetup.maximumLevel}
              close={() => {
                setBrowsingSlot(null)
              }}
              equip={equip}
              updateLevels={(update) => {
                applySetupState((current) => updateGearPlannerSetupLevels(current, activeSetup.id, update))
              }}
              onMinorArtifactRejected={() => {
                setFeedback({ kind: 'error', message: 'Only one minor artifact can be equipped at a time.' })
              }}
            />
            <Modal
              opened={deleteOpen}
              onClose={() => {
                setDeleteOpen(false)
              }}
              title='Delete setup?'
              centered
            >
              <Stack gap='md'>
                <Text size='sm'>Delete {activeSetup.name}? This cannot be undone.</Text>
                <Group justify='flex-end'>
                  <Button
                    variant='subtle'
                    onClick={() => {
                      setDeleteOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    color='red'
                    onClick={() => {
                      applySetupState((current) => deleteGearPlannerSetup(current, activeSetup.id))
                      setDeleteOpen(false)
                    }}
                  >
                    Delete setup
                  </Button>
                </Group>
              </Stack>
            </Modal>
          </Paper>
        ) : null}
      </Stack>
    </WorkspaceLayout>
  )
}

export default GearPlannerPage
